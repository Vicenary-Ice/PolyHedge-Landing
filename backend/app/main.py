from __future__ import annotations

from typing import Literal

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from .pipelines import default_sources, run_analysis
from .sse import encode_events


class AnalyzeRequest(BaseModel):
    type: Literal["stock", "prediction"]
    topic: str = Field(..., min_length=1, max_length=240)
    sources: list[str] | None = None


app = FastAPI(title="PolyHedge Analysis Backend", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/analyze")
async def analyze(request: AnalyzeRequest) -> StreamingResponse:
    payload = request.model_dump()
    payload["sources"] = payload.get("sources") or default_sources(payload["type"])
    return StreamingResponse(
        encode_events(run_analysis(payload)),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Content-Type-Options": "nosniff",
        },
    )
