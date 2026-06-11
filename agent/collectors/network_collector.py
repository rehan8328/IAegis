import psutil, logging
from typing import Optional
logger = logging.getLogger(__name__)
SKIP_REMOTE = {80, 443}

class NetworkCollector:
    def __init__(self, track_common=False):
        self._known = set()
        self._ready = False
        self._track_common = track_common

    def initialize(self):
        conns = self._get()
        self._known = {self._key(c) for c in conns if c}
        self._ready = True
        logger.info(f"[Network] Baseline: {len(self._known)} connections")

    def collect(self):
        if not self._ready:
            self.initialize()
            return []
        events = []
        current = self._get()
        current_keys = set()
        for conn in current:
            if not conn: continue
            k = self._key(conn)
            current_keys.add(k)
            if k not in self._known:
                e = self._build(conn)
                if e: events.append(e)
        self._known = current_keys
        return events

    def _get(self):
        try: return psutil.net_connections(kind='inet')
        except: return []

    def _key(self, c):
        l = f"{c.laddr.ip}:{c.laddr.port}" if c.laddr else ""
        r = f"{c.raddr.ip}:{c.raddr.port}" if c.raddr else ""
        return (c.pid or 0, l, r, c.status)

    def _build(self, c) -> Optional[dict]:
        if not c.raddr: return None
        if c.raddr.ip in ('127.0.0.1','::1','0.0.0.0'): return None
        if not self._track_common and c.raddr.port in SKIP_REMOTE: return None
        if c.status not in ('ESTABLISHED','SYN_SENT'): return None
        name = ""
        try:
            if c.pid: name = psutil.Process(c.pid).name()
        except: pass
        return {"event_type":"network_connection","data":{"pid":c.pid,"process_name":name,"src_ip":c.laddr.ip if c.laddr else None,"src_port":c.laddr.port if c.laddr else None,"dst_host":c.raddr.ip,"dst_port":c.raddr.port,"remote_address":c.raddr.ip,"status":c.status}}
