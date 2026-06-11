from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime, timezone
from app.core.database import get_db
from app.core.config import settings
from app.models import Agent
from app.schemas import AgentRegister, AgentResponse

router = APIRouter(prefix="/agents", tags=["agents"])

def verify_key(x_api_key: str = Header(...)):
    if x_api_key != settings.AGENT_API_KEY:
        raise HTTPException(status_code=401, detail="Invalid API key")
    return x_api_key

@router.post("/register", response_model=AgentResponse, status_code=201)
async def register(payload: AgentRegister, db: AsyncSession = Depends(get_db), _=Depends(verify_key)):
    r = await db.execute(select(Agent).where(Agent.id == payload.id))
    existing = r.scalar_one_or_none()
    if existing:
        existing.hostname = payload.hostname; existing.ip_address = payload.ip_address
        existing.os_name = payload.os_name; existing.os_version = payload.os_version
        existing.agent_version = payload.agent_version; existing.status = "online"
        existing.last_seen = datetime.now(timezone.utc); existing.metadata_ = payload.metadata or {}
        await db.flush(); return existing
    agent = Agent(id=payload.id, hostname=payload.hostname, ip_address=payload.ip_address,
        os_name=payload.os_name, os_version=payload.os_version,
        agent_version=payload.agent_version, metadata_=payload.metadata or {})
    db.add(agent); await db.flush(); return agent

@router.get("", response_model=list[AgentResponse])
async def list_agents(db: AsyncSession = Depends(get_db)):
    r = await db.execute(select(Agent))
    return r.scalars().all()

@router.get("/{agent_id}", response_model=AgentResponse)
async def get_agent(agent_id: str, db: AsyncSession = Depends(get_db)):
    r = await db.execute(select(Agent).where(Agent.id == agent_id))
    a = r.scalar_one_or_none()
    if not a: raise HTTPException(404, "Agent not found")
    return a
