# IAEGIS — AI-Native Cyber Defense Platform

Dark-themed SOC dashboard with real endpoint telemetry, detection engine, and incident management.

## Quick Start (Windows)

Double-click these batch files **in order**, each in its own window:

| Step | File | What it does |
|------|------|-------------|
| 1 | `START_BACKEND.bat` | Starts the API server on :8000 |
| 2 | `START_FRONTEND.bat` | Starts the dashboard on :3000 |
| 3 | `INJECT_TEST_DATA.bat` | Fires 10 attack scenarios so dashboard has data |
| 4 | `START_AGENT.bat` | Streams real telemetry from your PC |

Open **http://localhost:3000** after steps 1 and 2.

## Manual Start

```
# Terminal 1 — Backend
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --reload

# Terminal 2 — Frontend
cd frontend
npm install
npm run dev

# Terminal 3 — Inject test data (optional, instant dashboard population)
python tools/inject_scenarios.py

# Terminal 4 — Agent (real telemetry from your machine)
cd agent
pip install -r requirements.txt
python agent.py
```

## What You Get

- **Dashboard** — threat map, stat cards, donut chart, activity trend, live alerts
- **Detections** — full detection table with MITRE ATT&CK mapping, severity filtering, analyst workflow
- **Incidents** — auto-created from high-severity detections, timeline, notes, status management
- **Monitoring** — raw telemetry event explorer
- **Assets** — endpoint agent status and inventory

## Detection Engine (40+ rules)

| Category | Examples |
|----------|---------|
| Credential Dumping | mimikatz, procdump lsass, secretsdump |
| LOLBAS | certutil download, mshta remote, regsvr32 scriptlet |
| PowerShell | encoded commands, IEX, hidden window, download cradle |
| Ransomware | shadow copy deletion, bcdedit recovery off |
| C2 | port 4444/31337, ngrok tunnel, tor domains |
| Lateral Movement | psexec, wmic remote process, net use |
| Defense Evasion | Defender disable, firewall off |
| Process Trees | Word/Excel/browser spawning shells |
| Persistence | startup folder, scheduled tasks |

## API

```
GET  /health
GET  /api/v1/dashboard/stats
GET  /api/v1/agents
POST /api/v1/agents/register
POST /api/v1/telemetry/ingest
POST /api/v1/telemetry/ingest/batch
GET  /api/v1/telemetry/events
GET  /api/v1/detections
PATCH /api/v1/detections/{id}/status
GET  /api/v1/incidents
GET  /api/v1/incidents/{id}
PATCH /api/v1/incidents/{id}
WS   /ws
```
Agent endpoints require header: `X-API-Key: iaegis-dev-agent-key`

Full interactive docs: http://localhost:8000/docs
