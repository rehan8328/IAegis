"""
IAEGIS Endpoint Agent v2
Collects real process and network telemetry and streams to backend.
"""
import os, sys, uuid, time, socket, platform, logging, signal
from datetime import datetime, timezone
import psutil, requests
from dotenv import load_dotenv

sys.path.insert(0, os.path.dirname(__file__))
from collectors.process_collector import ProcessCollector
from collectors.network_collector import NetworkCollector

load_dotenv()

BACKEND   = os.getenv("IAEGIS_BACKEND_URL",    "http://localhost:8000")
API_KEY   = os.getenv("IAEGIS_AGENT_API_KEY",  "iaegis-dev-agent-key")
AGENT_ID  = os.getenv("IAEGIS_AGENT_ID",       str(uuid.uuid4()))
POLL      = int(os.getenv("IAEGIS_POLL_INTERVAL",  "3"))
BATCH     = int(os.getenv("IAEGIS_BATCH_SIZE",     "25"))
FLUSH_SEC = int(os.getenv("IAEGIS_FLUSH_EVERY",    "5"))

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s", datefmt="%H:%M:%S")
log = logging.getLogger("iaegis-agent")

class Agent:
    def __init__(self):
        self.hostname = socket.gethostname()
        self.running  = True
        self.session  = requests.Session()
        self.session.headers.update({"X-API-Key": API_KEY, "Content-Type": "application/json"})
        self.procs  = ProcessCollector()
        self.nets   = NetworkCollector()
        self._buf   = []
        self._last  = time.time()
        self._total = 0
        self._dets  = 0
        signal.signal(signal.SIGINT,  self._stop)
        signal.signal(signal.SIGTERM, self._stop)

    def start(self):
        print(f"\n{'─'*50}")
        print(f"  IAEGIS Agent  |  {self.hostname}")
        print(f"  Backend: {BACKEND}")
        print(f"  Agent ID: {AGENT_ID[:20]}...")
        print(f"{'─'*50}\n")
        self._register()
        self.procs.initialize()
        self.nets.initialize()
        log.info("Collectors ready — streaming telemetry\n")
        while self.running:
            try:
                self._cycle()
                time.sleep(POLL)
            except KeyboardInterrupt:
                break
            except Exception as e:
                log.error(f"Cycle error: {e}")
                time.sleep(5)
        if self._buf: self._flush()
        log.info(f"Stopped. Sent {self._total} events, fired {self._dets} detections.")

    def _cycle(self):
        now = datetime.now(timezone.utc)
        for e in self.procs.collect(): self._add(e, now)
        for e in self.nets.collect():  self._add(e, now)
        if len(self._buf) >= BATCH or time.time() - self._last >= FLUSH_SEC:
            self._flush()

    def _add(self, event, ts):
        self._buf.append({"agent_id":AGENT_ID,"event_type":event["event_type"],
            "timestamp":ts.isoformat(),"data":event["data"],"hostname":self.hostname})

    def _flush(self):
        if not self._buf: return
        batch, self._buf = self._buf[:BATCH], self._buf[BATCH:]
        self._last = time.time()
        try:
            r = self.session.post(f"{BACKEND}/api/v1/telemetry/ingest/batch",
                json={"events": batch}, timeout=10)
            if r.status_code == 202:
                d = r.json().get("total_detections", 0)
                self._total += len(batch); self._dets += d
                if d: log.warning(f"▲ {len(batch)} events → {d} DETECTION(S) [total dets: {self._dets}]")
                else: log.info(f"→ {len(batch)} events sent [total: {self._total}]")
            else:
                self._buf = batch + self._buf
        except requests.ConnectionError:
            log.warning("Backend unreachable — buffering")
            self._buf = batch + self._buf
        except Exception as e:
            log.error(f"Flush error: {e}")

    def _register(self):
        try: ip = socket.gethostbyname(self.hostname)
        except: ip = "127.0.0.1"
        payload = {"id":AGENT_ID,"hostname":self.hostname,"ip_address":ip,
            "os_name":platform.system(),"os_version":platform.release(),
            "agent_version":"2.0.0","metadata":{"python":platform.python_version(),"arch":platform.machine()}}
        for i in range(5):
            try:
                r = self.session.post(f"{BACKEND}/api/v1/agents/register", json=payload, timeout=10)
                if r.status_code in (200,201):
                    log.info(f"✓ Registered — {platform.system()} {platform.release()}"); return
            except requests.ConnectionError:
                log.warning(f"Backend unreachable (attempt {i+1}/5) — retrying in 5s"); time.sleep(5)
        log.warning("Could not register — running offline")

    def _stop(self, *_):
        log.info("Shutting down..."); self.running = False

if __name__ == "__main__":
    Agent().start()
