from datetime import datetime, timezone, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models import TelemetryEvent, Detection, Agent, Incident
from app.detection import analyze_event, score_to_severity
from app.websocket import ws_manager
from app.core.config import settings

class TelemetryPipeline:
    async def ingest(self, db: AsyncSession, ev: dict):
        event = TelemetryEvent(
            agent_id=ev["agent_id"], event_type=ev["event_type"],
            timestamp=ev["timestamp"], data=ev["data"],
            hostname=ev.get("hostname"), raw_log=ev.get("raw_log"))
        db.add(event)
        await db.flush()
        await self._heartbeat(db, ev["agent_id"], ev.get("hostname"))
        raw = analyze_event(ev["event_type"], ev["data"])
        saved = []
        for d in raw:
            det = Detection(
                event_id=event.id, agent_id=ev["agent_id"], hostname=ev.get("hostname"),
                rule_id=d["rule_id"], rule_name=d["rule_name"], description=d["description"],
                mitre_technique_id=d["mitre_technique_id"], mitre_technique_name=d["mitre_technique_name"],
                mitre_tactic=d["mitre_tactic"], threat_score=d["threat_score"],
                severity=d["severity"], context=d["context"], timestamp=ev["timestamp"])
            db.add(det)
            await db.flush()
            saved.append(det)
            if det.threat_score >= settings.INCIDENT_AUTO_CREATE_SCORE:
                await self._auto_incident(db, det)
        event.processed = True
        if saved:
            event.severity = max(saved, key=lambda x: x.threat_score).severity
        await db.flush()
        await ws_manager.broadcast("telemetry_event", {
            "id":event.id,"agent_id":event.agent_id,"event_type":event.event_type,
            "timestamp":event.timestamp.isoformat() if event.timestamp else None,
            "data":event.data,"hostname":event.hostname,"severity":event.severity})
        for d in saved:
            await ws_manager.broadcast("detection", {
                "id":d.id,"event_id":d.event_id,"agent_id":d.agent_id,"hostname":d.hostname,
                "rule_name":d.rule_name,"description":d.description,
                "mitre_technique_id":d.mitre_technique_id,"mitre_technique_name":d.mitre_technique_name,
                "mitre_tactic":d.mitre_tactic,"threat_score":d.threat_score,"severity":d.severity,
                "status":d.status,"context":d.context,
                "timestamp":d.timestamp.isoformat() if d.timestamp else None,"incident_id":d.incident_id})
        return {"event_id":event.id,"detections":len(saved)}

    async def ingest_batch(self, db, events):
        results = [await self.ingest(db, e) for e in events]
        return {"processed":len(results),"total_detections":sum(r["detections"] for r in results)}

    async def _heartbeat(self, db, agent_id, hostname=None):
        r = await db.execute(select(Agent).where(Agent.id == agent_id))
        agent = r.scalar_one_or_none()
        if agent:
            agent.last_seen = datetime.now(timezone.utc); agent.status = "online"
        elif hostname:
            db.add(Agent(id=agent_id, hostname=hostname, status="online", last_seen=datetime.now(timezone.utc)))

    async def _auto_incident(self, db, det):
        window = datetime.now(timezone.utc) - timedelta(hours=1)
        r = await db.execute(select(Incident).where(
            Incident.status.in_(["open","investigating"]), Incident.created_at >= window))
        existing = r.scalars().all()
        linked = next((i for i in existing if det.agent_id in (i.affected_agents or [])), None)
        if linked:
            ids = list(linked.detection_ids or []); ids.append(det.id); linked.detection_ids = ids
            techs = list(linked.mitre_techniques or [])
            if det.mitre_technique_id not in techs: techs.append(det.mitre_technique_id)
            linked.mitre_techniques = techs
            linked.threat_score = max(linked.threat_score, det.threat_score)
            linked.severity = score_to_severity(linked.threat_score)
            tl = list(linked.timeline or [])
            tl.append({"timestamp":datetime.now(timezone.utc).isoformat(),
                "event":f"New detection: {det.rule_name}","severity":det.severity,"mitre":det.mitre_technique_id})
            linked.timeline = tl; linked.updated_at = datetime.now(timezone.utc)
            det.incident_id = linked.id
        else:
            inc = Incident(
                title=f"{det.rule_name} on {det.hostname or det.agent_id}",
                description=det.description, severity=det.severity,
                affected_agents=[det.agent_id], detection_ids=[det.id],
                mitre_techniques=[det.mitre_technique_id] if det.mitre_technique_id else [],
                threat_score=det.threat_score,
                timeline=[{"timestamp":datetime.now(timezone.utc).isoformat(),
                    "event":f"Auto-created: {det.rule_name}","severity":det.severity}],
                summary=f"Auto-detected: {det.rule_name}. MITRE: {det.mitre_technique_id}. Score: {det.threat_score:.0f}/100.")
            db.add(inc); await db.flush()
            det.incident_id = inc.id
            await ws_manager.broadcast("incident_created", {
                "id":inc.id,"title":inc.title,"severity":inc.severity,"threat_score":inc.threat_score})

pipeline = TelemetryPipeline()
