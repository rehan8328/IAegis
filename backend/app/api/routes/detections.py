from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from typing import Optional
from datetime import datetime, timezone, timedelta
from app.core.database import get_db
from app.models import Detection
from app.schemas import DetectionResponse, DetectionStatusUpdate

router = APIRouter(prefix="/detections", tags=["detections"])

@router.get("", response_model=list[DetectionResponse])
async def get_detections(db: AsyncSession = Depends(get_db),
    agent_id: Optional[str] = None, severity: Optional[str] = None,
    status: Optional[str] = None, hours: int = Query(24, ge=1, le=720),
    limit: int = Query(200, ge=1, le=1000), offset: int = 0):
    cutoff = datetime.now(timezone.utc) - timedelta(hours=hours)
    q = select(Detection).where(Detection.timestamp >= cutoff)
    if agent_id: q = q.where(Detection.agent_id == agent_id)
    if severity: q = q.where(Detection.severity == severity)
    if status: q = q.where(Detection.status == status)
    q = q.order_by(desc(Detection.timestamp)).limit(limit).offset(offset)
    r = await db.execute(q)
    return r.scalars().all()

@router.get("/{did}", response_model=DetectionResponse)
async def get_detection(did: int, db: AsyncSession = Depends(get_db)):
    r = await db.execute(select(Detection).where(Detection.id == did))
    d = r.scalar_one_or_none()
    if not d: raise HTTPException(404, "Detection not found")
    return d

@router.patch("/{did}/status", response_model=DetectionResponse)
async def update_status(did: int, update: DetectionStatusUpdate, db: AsyncSession = Depends(get_db)):
    r = await db.execute(select(Detection).where(Detection.id == did))
    d = r.scalar_one_or_none()
    if not d: raise HTTPException(404, "Detection not found")
    d.status = update.status; d.updated_at = datetime.now(timezone.utc)
    await db.flush(); return d
