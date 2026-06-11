export type Severity = 'info'|'low'|'medium'|'high'|'critical'
export type DetectionStatus = 'open'|'acknowledged'|'resolved'|'false_positive'
export type IncidentStatus = 'open'|'investigating'|'contained'|'resolved'|'closed'
export type AgentStatus = 'online'|'offline'|'isolated'

export interface Agent { id:string; hostname:string; ip_address:string|null; os_name:string|null; os_version:string|null; agent_version:string|null; status:AgentStatus; last_seen:string; registered_at:string }
export interface TelemetryEvent { id:number; agent_id:string; event_type:string; timestamp:string; received_at:string; data:Record<string,unknown>; hostname:string|null; severity:Severity; processed:boolean }
export interface Detection { id:number; event_id:number; agent_id:string; hostname:string|null; rule_id:string; rule_name:string; description:string|null; mitre_technique_id:string|null; mitre_technique_name:string|null; mitre_tactic:string|null; threat_score:number; severity:Severity; status:DetectionStatus; context:Record<string,unknown>; timestamp:string; created_at:string; incident_id:number|null }
export interface Incident { id:number; title:string; description:string|null; severity:Severity; status:IncidentStatus; affected_agents:string[]; detection_ids:number[]; mitre_techniques:string[]; threat_score:number; timeline:Array<{timestamp:string;event:string;severity?:string;mitre?:string}>; analyst_notes:string|null; summary:string|null; created_at:string; updated_at:string; resolved_at:string|null }
export interface DashboardStats { total_agents:number; online_agents:number; total_events_24h:number; total_detections_24h:number; open_incidents:number; critical_detections:number; high_detections:number; events_by_type:Record<string,number>; detections_by_severity:Record<string,number>; top_mitre_techniques:Array<{technique_id:string;technique_name:string;count:number}>; recent_detections:Detection[]; hourly_event_volume:Record<string,number> }
export interface WSMessage { type:'telemetry_event'|'detection'|'incident_created'|'incident_updated'|'agent_status'; payload:unknown; timestamp:string }
