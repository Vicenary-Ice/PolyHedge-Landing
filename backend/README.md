# PolyHedge Analysis Backend

Small FastAPI service for realtime stock and prediction-market analysis.

Run locally:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
uvicorn backend.app.main:app --reload --port 8000
```

Optional environment:

```bash
TWELVE_DATA_API_KEY=...
SEC_USER_AGENT="PolyHedge brian.dai@stern.nyu.edu"
POLYHEDGE_ANALYSIS_BACKEND_URL=http://127.0.0.1:8000
```

The Next app proxies `POST /api/analyze` to this service and forwards Server-Sent Events.
