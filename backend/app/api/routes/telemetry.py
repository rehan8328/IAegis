from fastapi import APIRouter, Depends, HTTPException, Header, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from typing import Optional
from datetime import datetime, timezone, timedelta
from app.core.database import get_db
from app.core.config import settings
from app.models import TelemetryEvent
from app.schemas import TelemetryEventIngest, TelemetryEventBatch, TelemetryEventResponse
from app.telemetry import pipeline

router = APIRouter(prefix="/telemetry", tags=["telemetry"])

def verify_key(x_api_key: str = Header(...)):
    if x_api_key != settings.AGENT_API_KEY:
        raise HTTPException(status_code=401, detail="Invalid API key")
    return x_api_key

@router.post("/ingest", status_code=202)
async def ingest(event: TelemetryEventIngest, db: AsyncSession = Depends(get_db), _=Depends(verify_key)):
    return await pipeline.ingest(db, event.model_dump())

@router.post("/ingest/batch", status_code=202)
async def ingest_batch(batch: TelemetryEventBatch, db: AsyncSession = Depends(get_db), _=Depends(verify_key)):
    return await pipeline.ingest_batch(db, [e.model_dump() for e in batch.events])

@router.get("/events", response_model=list[TelemetryEventResponse])
async def get_events(db: AsyncSession = Depends(get_db),
    agent_id: Optional[str] = None, event_type: Optional[str] = None,
    hours: int = Query(24, ge=1, le=168), limit: int = Query(200, ge=1, le=1000), offset: int = 0):
    cutoff = datetime.now(timezone.utc) - timedelta(hours=hours)
    q = select(TelemetryEvent).where(TelemetryEvent.timestamp >= cutoff)
    if agent_id: q = q.where(TelemetryEvent.agent_id == agent_id)
    if event_type: q = q.where(TelemetryEvent.event_type == event_type)
    q = q.order_by(desc(TelemetryEvent.timestamp)).limit(limit).offset(offset)
    r = await db.execute(q)
    return r.scalars().all()

@router.get("/events/{event_id}", response_model=TelemetryEventResponse)
async def get_event(event_id: int, db: AsyncSession = Depends(get_db)):
    r = await db.execute(select(TelemetryEvent).where(TelemetryEvent.id == event_id))
    e = r.scalar_one_or_none()
    if not e: raise HTTPException(404, "Event not found")
    return e
