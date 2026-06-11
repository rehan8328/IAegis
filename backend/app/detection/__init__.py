import re
from dataclasses import dataclass, field
from typing import Optional

@dataclass
class DetectionResult:
    matched: bool; rule_id: str; rule_name: str; description: str
    threat_score: float; mitre_technique_id: str; context: dict = field(default_factory=dict)

SUSPICIOUS_PROCESSES = {
    "mimikatz.exe": (95,"T1003.001","Mimikatz credential dumping tool"),
    "mimikatz":     (95,"T1003.001","Mimikatz credential dumping tool"),
    "procdump.exe": (65,"T1003.001","ProcDump - potential LSASS dump"),
    "wce.exe":      (92,"T1003.001","Windows Credential Editor"),
    "fgdump.exe":   (92,"T1003.001","FgDump password dumper"),
    "pwdump.exe":   (92,"T1003.001","PWDump credential dumper"),
    "sharphound.exe":(80,"T1087","SharpHound AD enumeration"),
    "sharphound":   (80,"T1087","SharpHound AD enumeration"),
    "bloodhound.exe":(80,"T1087","BloodHound AD analysis"),
    "psexec.exe":   (70,"T1021.002","PsExec remote execution"),
    "psexesvc.exe": (75,"T1021.002","PsExec service component"),
    "nmap.exe":     (45,"T1046","Nmap network scanner"),
    "masscan.exe":  (65,"T1046","Masscan high-speed scanner"),
    "ngrok.exe":    (65,"T1572","ngrok tunnel - potential C2"),
    "ngrok":        (65,"T1572","ngrok tunnel - potential C2"),
    "chisel.exe":   (78,"T1572","Chisel TCP tunnel"),
    "chisel":       (78,"T1572","Chisel TCP tunnel"),
    "winpeas.exe":  (80,"T1082","WinPEAS privilege escalation enum"),
    "winpeas":      (80,"T1082","WinPEAS privilege escalation enum"),
    "linpeas":      (80,"T1082","LinPEAS privilege escalation enum"),
    "lazagne.exe":  (90,"T1003.001","LaZagne credential stealer"),
    "meterpreter.exe":(98,"T1059","Meterpreter payload"),
}

CMDLINE_PATTERNS = [
    (r"-[eE][nN][cC]",65,"T1059.001","PowerShell encoded command"),
    (r"[bB]ypass.*[eE]xecution[pP]olicy",60,"T1059.001","PowerShell execution policy bypass"),
    (r"-[wW].*[hH]idden",55,"T1059.001","PowerShell hidden window"),
    (r"[iI][eE][xX]\s*\(|[iI]nvoke-[eE]xpression",70,"T1059.001","PowerShell IEX dynamic execution"),
    (r"[dD]ownload[sS]tring|[dD]ownload[fF]ile",65,"T1105","PowerShell remote download"),
    (r"[nN]ew-[oO]bject.*[wW]eb[cC]lient",55,"T1105","PowerShell WebClient"),
    (r"certutil.*-urlcache.*-[fF]",85,"T1105","CertUtil URL download - LOLBAS"),
    (r"certutil.*-decode",75,"T1140","CertUtil decode - LOLBAS"),
    (r"mshta\.exe.*https?://|mshta.*vbscript:",88,"T1218.005","MSHTA remote script - LOLBAS"),
    (r"regsvr32.*scrobj\.dll",88,"T1218.010","Regsvr32 scriptlet - LOLBAS"),
    (r"rundll32.*javascript:",88,"T1218.011","Rundll32 JS execution - LOLBAS"),
    (r"wmic.*process.*call.*create",72,"T1047","WMIC remote process creation"),
    (r"wmic.*shadowcopy.*delete|wmic.*shadow.*delete",96,"T1490","Shadow copy deletion - RANSOMWARE"),
    (r"vssadmin\s+delete\s+shadows",96,"T1490","VSS shadow copy deletion - RANSOMWARE"),
    (r"bcdedit.*/set.*recovery[eE]nabled.*[nN]o",93,"T1490","Boot recovery disabled - RANSOMWARE"),
    (r"wbadmin\s+delete\s+catalog",88,"T1490","Windows backup deletion"),
    (r"net\s+(stop|start)\s+[wW]in[dD]efend",92,"T1562.001","Windows Defender service stop"),
    (r"Set-MpPreference.*-Disable[rR]ealtime",94,"T1562.001","Windows Defender disabled"),
    (r"netsh.*advfirewall.*state.*off",88,"T1562.004","Windows Firewall disabled"),
    (r"procdump.*-ma.*lsass|procdump.*lsass",96,"T1003.001","LSASS memory dump"),
    (r"ntdsutil.*ac.*ntds|ntdsutil.*ifm",92,"T1003.003","NTDS.dit extraction"),
    (r"net\s+use\s+\\\\",55,"T1021.002","Net use SMB mount"),
    (r"schtasks.*/create",50,"T1053","Scheduled task creation"),
    (r"whoami\s*\/[aA]ll|whoami\s*\/priv",42,"T1033","Privilege discovery"),
    (r"net\s+(user|group|localgroup)\s*\/domain",38,"T1087","Domain user enumeration"),
    (r"\[System\.Convert\]::FromBase64",60,"T1027","Base64 decode - payload deobfuscation"),
]

PARENT_CHILD = [
    ("winword.exe","cmd.exe",85,"T1566.001","Word spawning cmd - macro execution"),
    ("winword.exe","powershell.exe",90,"T1566.001","Word spawning PowerShell - macro"),
    ("excel.exe","cmd.exe",85,"T1566.001","Excel spawning cmd - macro execution"),
    ("excel.exe","powershell.exe",90,"T1566.001","Excel spawning PowerShell - macro"),
    ("outlook.exe","cmd.exe",80,"T1566.001","Outlook spawning cmd"),
    ("outlook.exe","powershell.exe",85,"T1566.001","Outlook spawning PowerShell"),
    ("chrome.exe","cmd.exe",75,"T1059.003","Chrome spawning cmd"),
    ("chrome.exe","powershell.exe",80,"T1059.001","Chrome spawning PowerShell"),
    ("firefox.exe","cmd.exe",75,"T1059.003","Firefox spawning cmd"),
    ("iexplore.exe","cmd.exe",80,"T1059.003","IE spawning cmd - drive-by"),
    ("acrord32.exe","cmd.exe",85,"T1059.003","Adobe Reader spawning cmd"),
    ("acrord32.exe","powershell.exe",88,"T1059.001","Adobe Reader spawning PowerShell"),
    ("mshta.exe","powershell.exe",88,"T1218.005","MSHTA spawning PowerShell"),
    ("wscript.exe","cmd.exe",75,"T1059.003","WScript spawning cmd"),
    ("wscript.exe","powershell.exe",80,"T1059.001","WScript spawning PowerShell"),
]

HIGH_RISK_PORTS = {
    4444:(85,"T1071","Metasploit reverse shell port"),
    4445:(80,"T1071","Common reverse shell port"),
    5555:(75,"T1071","Common reverse shell port"),
    6666:(75,"T1071","Common reverse shell port"),
    31337:(85,"T1071","Classic backdoor port"),
    9001:(55,"T1090","Tor SOCKS proxy"),
    9050:(65,"T1090","Tor SOCKS port"),
}

SUSPICIOUS_DOMAINS = [
    (r"\.onion$",80,"T1090","Tor hidden service"),
    (r"(ngrok\.io|ngrok\.app)",65,"T1572","ngrok tunnel"),
    (r"(pastebin\.com|hastebin)",50,"T1071","Paste site C2 delivery"),
    (r"(serveo\.net|localtunnel\.me)",65,"T1572","Tunnel service"),
]

SUSPICIOUS_FILES = [
    (r"\.(pdf|docx?|xlsx?|txt)\.(exe|bat|cmd|ps1)$",78,"T1036.007","Double extension masquerading"),
    (r"(\\Temp\\|/tmp/).*\.(exe|dll|bat|ps1|cmd)$",65,"T1059","Executable in temp dir"),
    (r"(\\Startup\\|Programs\\Startup\\)",72,"T1547.001","File written to startup folder"),
]

MITRE_DB = {
    "T1003.001":{"name":"LSASS Memory","tactic":"Credential Access"},
    "T1003.003":{"name":"NTDS","tactic":"Credential Access"},
    "T1003":{"name":"OS Credential Dumping","tactic":"Credential Access"},
    "T1021.002":{"name":"SMB/Windows Admin Shares","tactic":"Lateral Movement"},
    "T1027":{"name":"Obfuscated Files or Information","tactic":"Defense Evasion"},
    "T1033":{"name":"System Owner/User Discovery","tactic":"Discovery"},
    "T1036.005":{"name":"Match Legitimate Name or Location","tactic":"Defense Evasion"},
    "T1036.007":{"name":"Double File Extension","tactic":"Defense Evasion"},
    "T1046":{"name":"Network Service Discovery","tactic":"Discovery"},
    "T1047":{"name":"Windows Management Instrumentation","tactic":"Execution"},
    "T1053":{"name":"Scheduled Task/Job","tactic":"Persistence"},
    "T1055":{"name":"Process Injection","tactic":"Defense Evasion"},
    "T1059":{"name":"Command and Scripting Interpreter","tactic":"Execution"},
    "T1059.001":{"name":"PowerShell","tactic":"Execution"},
    "T1059.003":{"name":"Windows Command Shell","tactic":"Execution"},
    "T1071":{"name":"Application Layer Protocol","tactic":"Command and Control"},
    "T1082":{"name":"System Information Discovery","tactic":"Discovery"},
    "T1087":{"name":"Account Discovery","tactic":"Discovery"},
    "T1090":{"name":"Proxy","tactic":"Command and Control"},
    "T1105":{"name":"Ingress Tool Transfer","tactic":"Command and Control"},
    "T1140":{"name":"Deobfuscate/Decode Files","tactic":"Defense Evasion"},
    "T1218.005":{"name":"Mshta","tactic":"Defense Evasion"},
    "T1218.010":{"name":"Regsvr32","tactic":"Defense Evasion"},
    "T1218.011":{"name":"Rundll32","tactic":"Defense Evasion"},
    "T1490":{"name":"Inhibit System Recovery","tactic":"Impact"},
    "T1547.001":{"name":"Registry Run Keys / Startup Folder","tactic":"Persistence"},
    "T1562.001":{"name":"Disable or Modify Tools","tactic":"Defense Evasion"},
    "T1562.004":{"name":"Disable or Modify System Firewall","tactic":"Defense Evasion"},
    "T1566.001":{"name":"Spearphishing Attachment","tactic":"Initial Access"},
    "T1572":{"name":"Protocol Tunneling","tactic":"Command and Control"},
}

def get_mitre(tid):
    return MITRE_DB.get(tid, {"name":"Unknown","tactic":"Unknown"})

def score_to_severity(s):
    if s >= 90: return "critical"
    if s >= 75: return "high"
    if s >= 50: return "medium"
    if s >= 25: return "low"
    return "info"

def check_process(name):
    n = name.lower().strip()
    if n in SUSPICIOUS_PROCESSES:
        s, mid, desc = SUSPICIOUS_PROCESSES[n]
        m = get_mitre(mid)
        return {"rule_id":f"PROC-{mid.replace('.', '-')}","rule_name":"Suspicious Process",
            "description":desc,"threat_score":float(s),"severity":score_to_severity(s),
            "mitre_technique_id":mid,"mitre_technique_name":m["name"],"mitre_tactic":m["tactic"],
            "context":{"process_name":name}}
    return None

def check_cmdline(cmd):
    if not cmd: return None
    best = None
    for pattern, score, mid, desc in CMDLINE_PATTERNS:
        if re.search(pattern, cmd):
            if not best or score > best[1]:
                best = (pattern, score, mid, desc)
    if best:
        _, s, mid, desc = best
        m = get_mitre(mid)
        return {"rule_id":f"CMD-{mid.replace('.', '-')}","rule_name":"Suspicious Command Line",
            "description":desc,"threat_score":float(s),"severity":score_to_severity(s),
            "mitre_technique_id":mid,"mitre_technique_name":m["name"],"mitre_tactic":m["tactic"],
            "context":{"cmdline":cmd[:400]}}
    return None

def check_parent_child(parent, child):
    pl, cl = parent.lower(), child.lower()
    for p, c, s, mid, desc in PARENT_CHILD:
        if p in pl and c in cl:
            m = get_mitre(mid)
            return {"rule_id":f"TREE-{mid.replace('.', '-')}","rule_name":"Suspicious Process Tree",
                "description":desc,"threat_score":float(s),"severity":score_to_severity(s),
                "mitre_technique_id":mid,"mitre_technique_name":m["name"],"mitre_tactic":m["tactic"],
                "context":{"parent":parent,"child":child}}
    return None

def check_port(port):
    try: port = int(port)
    except: return None
    if port in HIGH_RISK_PORTS:
        s, mid, desc = HIGH_RISK_PORTS[port]
        m = get_mitre(mid)
        return {"rule_id":f"NET-PORT-{port}","rule_name":"Suspicious Destination Port",
            "description":desc,"threat_score":float(s),"severity":score_to_severity(s),
            "mitre_technique_id":mid,"mitre_technique_name":m["name"],"mitre_tactic":m["tactic"],
            "context":{"port":port}}
    return None

def check_domain(domain):
    if not domain: return None
    for pattern, s, mid, desc in SUSPICIOUS_DOMAINS:
        if re.search(pattern, str(domain), re.IGNORECASE):
            m = get_mitre(mid)
            return {"rule_id":f"NET-DOMAIN","rule_name":"Suspicious Network Destination",
                "description":desc,"threat_score":float(s),"severity":score_to_severity(s),
                "mitre_technique_id":mid,"mitre_technique_name":m["name"],"mitre_tactic":m["tactic"],
                "context":{"domain":domain}}
    return None

def check_file(path):
    if not path: return None
    for pattern, s, mid, desc in SUSPICIOUS_FILES:
        if re.search(pattern, str(path), re.IGNORECASE):
            m = get_mitre(mid)
            return {"rule_id":f"FILE-{mid.replace('.', '-')}","rule_name":"Suspicious File Activity",
                "description":desc,"threat_score":float(s),"severity":score_to_severity(s),
                "mitre_technique_id":mid,"mitre_technique_name":m["name"],"mitre_tactic":m["tactic"],
                "context":{"path":path}}
    return None

def analyze_event(event_type, data):
    results = []
    if event_type in ("process_start","command_exec"):
        name = data.get("process_name") or data.get("name","")
        cmd  = data.get("cmdline","")
        parent = data.get("parent_name","")
        if name:
            r = check_process(name)
            if r: results.append(r)
        if cmd:
            r = check_cmdline(cmd)
            if r: results.append(r)
        if parent and name:
            r = check_parent_child(parent, name)
            if r: results.append(r)
    elif event_type == "network_connection":
        port = data.get("dst_port") or data.get("destination_port")
        host = data.get("dst_host") or data.get("remote_address")
        if port:
            r = check_port(port)
            if r: results.append(r)
        if host:
            r = check_domain(str(host))
            if r: results.append(r)
    elif event_type in ("file_write","file_delete"):
        path = data.get("path") or data.get("file_path")
        if path:
            r = check_file(path)
            if r: results.append(r)
    seen = {}
    for r in results:
        if r["rule_id"] not in seen or r["threat_score"] > seen[r["rule_id"]]["threat_score"]:
            seen[r["rule_id"]] = r
    return list(seen.values())
