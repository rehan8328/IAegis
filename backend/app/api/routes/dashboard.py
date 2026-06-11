from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from datetime import datetime, timezone, timedelta
from app.core.database import get_db
from app.models import Agent, TelemetryEvent, Detection, Incident

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("/stats")
async def get_stats(db: AsyncSession = Depends(get_db)):
    cutoff = datetime.now(timezone.utc) - timedelta(hours=24)
    online_cutoff = datetime.now(timezone.utc) - timedelta(minutes=5)

    total_agents = (await db.execute(select(func.count(Agent.id)))).scalar() or 0
    online_agents = (await db.execute(select(func.count(Agent.id)).where(Agent.last_seen >= online_cutoff))).scalar() or 0
    total_events = (await db.execute(select(func.count(TelemetryEvent.id)).where(TelemetryEvent.timestamp >= cutoff))).scalar() or 0
    total_detections = (await db.execute(select(func.count(Detection.id)).where(Detection.timestamp >= cutoff))).scalar() or 0
    critical_dets = (await db.execute(select(func.count(Detection.id)).where(Detection.severity=="critical",Detection.status=="open"))).scalar() or 0
    high_dets = (await db.execute(select(func.count(Detection.id)).where(Detection.severity=="high",Detection.status=="open"))).scalar() or 0
    open_incidents = (await db.execute(select(func.count(Incident.id)).where(Incident.status.in_(["open","investigating"])))).scalar() or 0

    ebt_rows = await db.execute(select(TelemetryEvent.event_type, func.count(TelemetryEvent.id).label("c")).where(TelemetryEvent.timestamp >= cutoff).group_by(TelemetryEvent.event_type))
    events_by_type = {r.event_type: r.c for r in ebt_rows}

    dbs_rows = await db.execute(select(Detection.severity, func.count(Detection.id).label("c")).where(Detection.timestamp >= cutoff).group_by(Detection.severity))
    dets_by_severity = {r.severity: r.c for r in dbs_rows}

    mitre_rows = await db.execute(select(Detection.mitre_technique_id, Detection.mitre_technique_name, func.count(Detection.id).label("c")).where(Detection.timestamp >= cutoff, Detection.mitre_technique_id.isnot(None)).group_by(Detection.mitre_technique_id, Detection.mitre_technique_name).order_by(desc("c")).limit(10))
    top_mitre = [{"technique_id":r.mitre_technique_id,"technique_name":r.mitre_technique_name,"count":r.c} for r in mitre_rows]

    recent_rows = await db.execute(select(Detection).where(Detection.timestamp >= cutoff).order_by(desc(Detection.timestamp)).limit(20))
    recent = [{"id":d.id,"agent_id":d.agent_id,"hostname":d.hostname,"rule_name":d.rule_name,
        "severity":d.severity,"threat_score":d.threat_score,"mitre_technique_id":d.mitre_technique_id,
        "timestamp":d.timestamp.isoformat() if d.timestamp else None,"status":d.status}
        for d in recent_rows.scalars().all()]

    hourly = {}
    for i in range(24):
        bucket = (datetime.now(timezone.utc) - timedelta(hours=23-i)).strftime("%H:00")
        hourly[bucket] = 0
    hourly_rows = await db.execute(select(TelemetryEvent.timestamp, func.count(TelemetryEvent.id).label("c")).where(TelemetryEvent.timestamp >= cutoff).group_by(func.strftime("%Y-%m-%dT%H:00:00", TelemetryEvent.timestamp)).order_by(TelemetryEvent.timestamp))
    for row in hourly_rows:
        if row.timestamp:
            b = row.timestamp.strftime("%H:00")
            hourly[b] = hourly.get(b,0) + row.c

    return {"total_agents":total_agents,"online_agents":online_agents,"total_events_24h":total_events,
        "total_detections_24h":total_detections,"open_incidents":open_incidents,
        "critical_detections":critical_dets,"high_detections":high_dets,
        "events_by_type":events_by_type,"detections_by_severity":dets_by_severity,
        "top_mitre_techniques":top_mitre,"recent_detections":recent,"hourly_event_volume":hourly}
