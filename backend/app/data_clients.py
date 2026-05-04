from __future__ import annotations

import asyncio
import json
import math
import os
import statistics
import urllib.parse
import urllib.request
from dataclasses import dataclass
from typing import Any


DEFAULT_TIMEOUT = 8


@dataclass(frozen=True)
class PricePoint:
    close: float
    volume: float


def clamp(value: float, low: float, high: float) -> float:
    return max(low, min(high, value))


def stable_seed(text: str) -> int:
    return sum((index + 1) * ord(char) for index, char in enumerate(text.upper()))


def fallback_price_series(topic: str, points: int = 24) -> list[PricePoint]:
    seed = stable_seed(topic)
    base = 80 + (seed % 160)
    drift = ((seed % 17) - 6) / 1000
    series: list[PricePoint] = []
    price = float(base)
    for index in range(points):
        texture = math.sin((index + seed % 9) * 0.72) * 0.012
        price = max(4.0, price * (1 + drift + texture))
        volume = 900_000 + ((seed + index * 71_917) % 2_800_000)
        series.append(PricePoint(close=round(price, 2), volume=float(volume)))
    return series


async def fetch_json(url: str, headers: dict[str, str] | None = None) -> Any | None:
    def load() -> Any | None:
        request = urllib.request.Request(url, headers=headers or {})
        try:
            with urllib.request.urlopen(request, timeout=DEFAULT_TIMEOUT) as response:
                raw = response.read().decode("utf-8")
                return json.loads(raw)
        except Exception:
            return None

    return await asyncio.to_thread(load)


async def fetch_twelve_data_prices(ticker: str) -> tuple[list[PricePoint], str]:
    api_key = os.getenv("TWELVE_DATA_API_KEY")
    if not api_key:
        return fallback_price_series(ticker), "Twelve Data key missing; using deterministic fallback series."

    query = urllib.parse.urlencode(
        {
            "symbol": ticker.upper(),
            "interval": "1day",
            "outputsize": "30",
            "apikey": api_key,
        }
    )
    data = await fetch_json(f"https://api.twelvedata.com/time_series?{query}")
    values = data.get("values") if isinstance(data, dict) else None
    if not isinstance(values, list):
        return fallback_price_series(ticker), "Twelve Data unavailable; using deterministic fallback series."

    points: list[PricePoint] = []
    for row in reversed(values):
        try:
            points.append(PricePoint(close=float(row["close"]), volume=float(row.get("volume") or 0)))
        except (KeyError, TypeError, ValueError):
            continue

    if len(points) < 4:
        return fallback_price_series(ticker), "Twelve Data returned sparse data; using deterministic fallback series."
    return points, "Twelve Data daily prices."


async def fetch_sec_company_summary(ticker: str) -> tuple[str, str]:
    user_agent = os.getenv("SEC_USER_AGENT", "PolyHedge brian.dai@stern.nyu.edu")
    headers = {"User-Agent": user_agent, "Accept-Encoding": "gzip, deflate", "Host": "www.sec.gov"}
    tickers = await fetch_json("https://www.sec.gov/files/company_tickers.json", headers=headers)
    if not isinstance(tickers, dict):
        return "SEC company lookup unavailable.", "SEC EDGAR lookup failed."

    target = ticker.upper()
    match = None
    for item in tickers.values():
        if isinstance(item, dict) and str(item.get("ticker", "")).upper() == target:
            match = item
            break
    if not match:
        return "No SEC company match found.", "SEC EDGAR company_tickers."

    cik = str(match.get("cik_str", "")).zfill(10)
    title = str(match.get("title", target))
    return f"{title}; CIK {cik}.", "SEC EDGAR company_tickers."


async def fetch_polymarket_markets(query: str) -> tuple[list[dict[str, Any]], str]:
    encoded = urllib.parse.quote(query)
    url = (
        "https://gamma-api.polymarket.com/markets"
        f"?active=true&closed=false&limit=10&order=volume&dir=desc&term={encoded}"
    )
    data = await fetch_json(url)
    if isinstance(data, list):
        return [item for item in data if isinstance(item, dict)], "Polymarket Gamma API."
    return [], "Polymarket Gamma unavailable."


def price_metrics(points: list[PricePoint]) -> dict[str, float | list[int]]:
    closes = [point.close for point in points if point.close > 0]
    if len(closes) < 2:
        closes = [point.close for point in fallback_price_series("POLYHEDGE")]
    first = closes[0]
    last = closes[-1]
    returns = [(closes[index] / closes[index - 1]) - 1 for index in range(1, len(closes))]
    volatility = statistics.pstdev(returns) * math.sqrt(252) if len(returns) > 1 else 0.24
    momentum = (last / first) - 1 if first else 0
    min_close = min(closes)
    max_close = max(closes)
    spread = max(max_close - min_close, 0.01)
    chart = [round(20 + ((close - min_close) / spread) * 64) for close in closes[-17:]]
    volume_avg = statistics.fmean([point.volume for point in points if point.volume >= 0] or [0])
    return {
        "last_price": last,
        "momentum": momentum,
        "volatility": volatility,
        "risk": clamp(volatility * 120, 18, 88),
        "flow": clamp(volume_avg / 60_000, 25, 91),
        "chart": chart,
    }


def parse_yes_price(market: dict[str, Any]) -> float:
    raw = market.get("outcomePrices") or market.get("outcome_prices")
    prices: list[Any]
    if isinstance(raw, str):
        try:
            prices = json.loads(raw)
        except json.JSONDecodeError:
            prices = []
    elif isinstance(raw, list):
        prices = raw
    else:
        prices = []
    try:
        return clamp(float(prices[0]) * 100, 1, 99)
    except (IndexError, TypeError, ValueError):
        return 50.0


def parse_volume(market: dict[str, Any]) -> float:
    for key in ("volume", "volumeNum", "liquidity", "liquidityNum"):
        try:
            return max(float(market.get(key) or 0), 0.0)
        except (TypeError, ValueError):
            continue
    return 0.0


def calibration_for(odds: float) -> dict[str, float | str]:
    anchors = [
        (0.88, 1.2),
        (0.92, 0.8),
        (0.95, 0.5),
        (0.97, 0.3),
        (0.98, 0.2),
        (0.98, 0.2),
        (0.97, 0.3),
        (0.95, 0.5),
        (0.92, 0.8),
        (0.89, 1.1),
    ]
    index = min(max(int(odds // 10), 0), 9)
    reliability, ece = anchors[index]
    label = "HIGH" if reliability >= 0.96 else "LOW" if reliability < 0.90 else "MEDIUM"
    return {
        "score": round(reliability * 100),
        "ece": ece,
        "reliability": label,
    }
