from sqlalchemy import String, DateTime, JSON, Integer, Float, Boolean, Text, ForeignKey, Index
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime, timezone
from app.core.database import Base

class Agent(Base):
    __tablename__ = "agents"
    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    hostname: Mapped[str] = mapped_column(String(255))
    ip_address: Mapped[str] = mapped_column(String(45), nullable=True)
    os_name: Mapped[str] = mapped_column(String(128), nullable=True)
    os_version: Mapped[str] = mapped_column(String(128), nullable=True)
    agent_version: Mapped[str] = mapped_column(String(32), nullable=True)
    status: Mapped[str] = mapped_column(String(32), default="online")
    last_seen: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    registered_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    metadata_: Mapped[dict] = mapped_column("metadata", JSON, default=dict)

class TelemetryEvent(Base):
    __tablename__ = "telemetry_events"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    agent_id: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    event_type: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    received_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    data: Mapped[dict] = mapped_column(JSON, nullable=False)
    hostname: Mapped[str] = mapped_column(String(255), nullable=True)
    severity: Mapped[str] = mapped_column(String(16), default="info")
    processed: Mapped[bool] = mapped_column(Boolean, default=False)
    raw_log: Mapped[str] = mapped_column(Text, nullable=True)

class Detection(Base):
    __tablename__ = "detections"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    event_id: Mapped[int] = mapped_column(Integer, ForeignKey("telemetry_events.id"), nullable=False, index=True)
    agent_id: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    hostname: Mapped[str] = mapped_column(String(255), nullable=True)
    rule_id: Mapped[str] = mapped_column(String(128), nullable=False)
    rule_name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=True)
    mitre_technique_id: Mapped[str] = mapped_column(String(32), nullable=True)
    mitre_technique_name: Mapped[str] = mapped_column(String(255), nullable=True)
    mitre_tactic: Mapped[str] = mapped_column(String(128), nullable=True)
    threat_score: Mapped[float] = mapped_column(Float, nullable=False)
    severity: Mapped[str] = mapped_column(String(16), nullable=False)
    status: Mapped[str] = mapped_column(String(32), default="open")
    context: Mapped[dict] = mapped_column(JSON, default=dict)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    incident_id: Mapped[int] = mapped_column(Integer, ForeignKey("incidents.id"), nullable=True, index=True)

class Incident(Base):
    __tablename__ = "incidents"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String(512), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=True)
    severity: Mapped[str] = mapped_column(String(16), nullable=False)
    status: Mapped[str] = mapped_column(String(32), default="open")
    affected_agents: Mapped[list] = mapped_column(JSON, default=list)
    detection_ids: Mapped[list] = mapped_column(JSON, default=list)
    mitre_techniques: Mapped[list] = mapped_column(JSON, default=list)
    threat_score: Mapped[float] = mapped_column(Float, default=0.0)
    timeline: Mapped[list] = mapped_column(JSON, default=list)
    analyst_notes: Mapped[str] = mapped_column(Text, nullable=True)
    summary: Mapped[str] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), index=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    resolved_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)
