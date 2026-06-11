from pydantic import BaseModel, Field
from typing import Optional, Any, List
from datetime import datetime
from enum import Enum

class Severity(str, Enum):
    INFO = "info"; LOW = "low"; MEDIUM = "medium"; HIGH = "high"; CRITICAL = "critical"

class EventType(str, Enum):
    PROCESS_START = "process_start"; PROCESS_END = "process_end"
    NETWORK_CONNECTION = "network_connection"; FILE_WRITE = "file_write"
    FILE_DELETE = "file_delete"; AUTH_EVENT = "auth_event"
    DNS_QUERY = "dns_query"; COMMAND_EXEC = "command_exec"
    PERSISTENCE_CHANGE = "persistence_change"; SYSTEM_INFO = "system_info"

class AgentRegister(BaseModel):
    id: str; hostname: str; ip_address: Optional[str] = None
    os_name: Optional[str] = None; os_version: Optional[str] = None
    agent_version: Optional[str] = "0.1.0"; metadata: Optional[dict] = {}

class AgentResponse(BaseModel):
    id: str; hostname: str; ip_address: Optional[str]; os_name: Optional[str]
    os_version: Optional[str]; agent_version: Optional[str]
    status: str; last_seen: datetime; registered_at: datetime
    class Config: from_attributes = True

class TelemetryEventIngest(BaseModel):
    agent_id: str; event_type: EventType; timestamp: datetime
    data: dict[str, Any]; hostname: Optional[str] = None; raw_log: Optional[str] = None

class TelemetryEventBatch(BaseModel):
    events: List[TelemetryEventIngest]

class TelemetryEventResponse(BaseModel):
    id: int; agent_id: str; event_type: str; timestamp: datetime
    received_at: datetime; data: dict; hostname: Optional[str]
    severity: str; processed: bool
    class Config: from_attributes = True

class DetectionResponse(BaseModel):
    id: int; event_id: int; agent_id: str; hostname: Optional[str]
    rule_id: str; rule_name: str; description: Optional[str]
    mitre_technique_id: Optional[str]; mitre_technique_name: Optional[str]
    mitre_tactic: Optional[str]; threat_score: float; severity: str
    status: str; context: dict; timestamp: datetime; created_at: datetime
    incident_id: Optional[int]
    class Config: from_attributes = True

class DetectionStatusUpdate(BaseModel):
    status: str; analyst_notes: Optional[str] = None

class IncidentCreate(BaseModel):
    title: str; description: Optional[str] = None; severity: Severity
    affected_agents: List[str] = []; detection_ids: List[int] = []

class IncidentResponse(BaseModel):
    id: int; title: str; description: Optional[str]; severity: str
    status: str; affected_agents: List[str]; detection_ids: List[int]
    mitre_techniques: List[str]; threat_score: float; timeline: List[dict]
    analyst_notes: Optional[str]; summary: Optional[str]
    created_at: datetime; updated_at: datetime; resolved_at: Optional[datetime]
    class Config: from_attributes = True

class IncidentUpdate(BaseModel):
    status: Optional[str] = None
    analyst_notes: Optional[str] = None
    description: Optional[str] = None
