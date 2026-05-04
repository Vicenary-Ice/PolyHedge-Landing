from __future__ import annotations

import json
from typing import Any, AsyncIterator


Event = dict[str, Any]


def event(event_type: str, **data: Any) -> Event:
    return {"type": event_type, **data}


def encode_sse(payload: Event) -> str:
    event_type = str(payload.get("type", "message"))
    return f"event: {event_type}\ndata: {json.dumps(payload, separators=(',', ':'))}\n\n"


async def encode_events(events: AsyncIterator[Event]) -> AsyncIterator[str]:
    async for payload in events:
        yield encode_sse(payload)
