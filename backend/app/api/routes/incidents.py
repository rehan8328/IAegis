from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from typing import Optional
from datetime import datetime, timezone
from app.core.database import get_db
from app.models import Incident
from app.schemas import IncidentCreate, IncidentResponse, IncidentUpdate
from app.websocket import ws_manager

router = APIRouter(prefix="/incidents", tags=["incidents"])

@router.get("", response_model=list[IncidentResponse])
async def get_incidents(db: AsyncSession = Depends(get_db),
    status: Optional[str] = None, severity: Optional[str] = None,
    limit: int = Query(50, ge=1, le=200)):
    q = select(Incident)
    if status: q = q.where(Incident.status == status)
    if severity: q = q.where(Incident.severity == severity)
    q = q.order_by(desc(Incident.created_at)).limit(limit)
    r = await db.execute(q)
    return r.scalars().all()

@router.post("", response_model=IncidentResponse, status_code=201)
async def create_incident(payload: IncidentCreate, db: AsyncSession = Depends(get_db)):
    inc = Incident(title=payload.title, description=payload.description,
        severity=payload.severity.value, affected_agents=payload.affected_agents,
        detection_ids=payload.detection_ids,
        timeline=[{"timestamp":datetime.now(timezone.utc).isoformat(),"event":"Manually created by analyst"}])
    db.add(inc); await db.flush()
    await ws_manager.broadcast("incident_created", {"id":inc.id,"title":inc.title,"severity":inc.severity})
    return inc

@router.get("/{iid}", response_model=IncidentResponse)
async def get_incident(iid: int, db: AsyncSession = Depends(get_db)):
    r = await db.execute(select(Incident).where(Incident.id == iid))
    i = r.scalar_one_or_none()
    if not i: raise HTTPException(404, "Incident not found")
    return i

@router.patch("/{iid}", response_model=IncidentResponse)
async def update_incident(iid: int, update: IncidentUpdate, db: AsyncSession = Depends(get_db)):
    r = await db.execute(select(Incident).where(Incident.id == iid))
    i = r.scalar_one_or_none()
    if not i: raise HTTPException(404, "Incident not found")
    if update.status:
        i.status = update.status
        if update.status in ("resolved","closed"): i.resolved_at = datetime.now(timezone.utc)
        tl = list(i.timeline or [])
        tl.append({"timestamp":datetime.now(timezone.utc).isoformat(),"event":f"Status → {update.status}"})
        i.timeline = tl
    if update.analyst_notes is not None: i.analyst_notes = update.analyst_notes
    if update.description is not None: i.description = update.description
    i.updated_at = datetime.now(timezone.utc); await db.flush()
    await ws_manager.broadcast("incident_updated", {"id":i.id,"status":i.status})
    return i
