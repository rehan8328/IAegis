import psutil, logging
logger = logging.getLogger(__name__)

class ProcessCollector:
    def __init__(self):
        self._known = {}
        self._ready = False

    def initialize(self):
        self._known = self._snapshot()
        self._ready = True
        logger.info(f"[Process] Baseline: {len(self._known)} processes")

    def collect(self):
        if not self._ready:
            self.initialize()
            return []
        events = []
        current = self._snapshot()
        for pid, p in current.items():
            if pid not in self._known:
                events.append({"event_type":"process_start","data":p})
        for pid, p in self._known.items():
            if pid not in current:
                events.append({"event_type":"process_end","data":p})
        self._known = current
        return events

    def _snapshot(self):
        snap = {}
        try:
            for proc in psutil.process_iter(['pid','name','cmdline','username','status','create_time','ppid','exe']):
                try:
                    info = proc.info
                    if not info or not info.get('pid'): continue
                    cmdline = ""
                    try: cmdline = " ".join(info.get('cmdline') or [])
                    except: pass
                    parent_name = ""
                    try:
                        if info.get('ppid'):
                            parent_name = psutil.Process(info['ppid']).name()
                    except: pass
                    snap[info['pid']] = {"pid":info['pid'],"process_name":info.get('name',''),"name":info.get('name',''),"cmdline":cmdline,"username":info.get('username',''),"status":info.get('status',''),"ppid":info.get('ppid'),"parent_name":parent_name,"exe":info.get('exe','')}
                except: continue
        except Exception as e:
            logger.warning(f"[Process] Snapshot error: {e}")
        return snap
