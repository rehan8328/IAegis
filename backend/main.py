import uuid
from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import init_db
from app.websocket import ws_manager
from app.api.routes import agents, telemetry, detections, incidents, dashboard
import app.models

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    print(f"[IAEGIS] v{settings.VERSION} started — database ready")
    yield
    print("[IAEGIS] Shutting down")

app = FastAPI(title=settings.APP_NAME, version=settings.VERSION, lifespan=lifespan)

app.add_middleware(CORSMiddleware, allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

app.include_router(agents.router, prefix="/api/v1")
app.include_router(telemetry.router, prefix="/api/v1")
app.include_router(detections.router, prefix="/api/v1")
app.include_router(incidents.router, prefix="/api/v1")
app.include_router(dashboard.router, prefix="/api/v1")

@app.websocket("/ws")
async def ws_endpoint(websocket: WebSocket):
    cid = str(uuid.uuid4())
    await ws_manager.connect(cid, websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        await ws_manager.disconnect(cid)

@app.get("/health")
async def health():
    return {"status":"ok","version":settings.VERSION,"ws_clients":ws_manager.connection_count}
