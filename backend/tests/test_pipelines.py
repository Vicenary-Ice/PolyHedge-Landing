import asyncio
import unittest

from backend.app.pipelines import run_analysis


async def collect(payload):
    return [event async for event in run_analysis(payload, fetch_live=False)]


class PipelineTests(unittest.TestCase):
    def test_stock_pipeline_event_order_and_final_shape(self):
        events = asyncio.run(collect({"type": "stock", "topic": "NVDA", "sources": ["filings", "news", "flow"]}))

        self.assertEqual(events[0]["type"], "run_started")
        self.assertEqual(events[-1]["type"], "final_result")
        self.assertIn("agent_started", [event["type"] for event in events])
        self.assertIn("chart_update", [event["type"] for event in events])

        final = events[-1]["data"]
        self.assertEqual(final["type"], "stock")
        self.assertEqual(final["topic"], "NVDA")
        self.assertIn(final["signal"], {"positive", "neutral", "caution"})
        self.assertGreaterEqual(final["confidence"], 0)
        self.assertIn("<ANALYSIS_METADATA>", final["analysis"])

    def test_prediction_pipeline_event_order_and_final_shape(self):
        events = asyncio.run(
            collect({"type": "prediction", "topic": "Will rates fall this year?", "sources": ["polymarket", "news", "regulatory"]})
        )

        self.assertEqual(events[0]["type"], "run_started")
        self.assertEqual(events[-1]["type"], "final_result")
        completed_agents = [event["agent"] for event in events if event["type"] == "agent_completed"]
        self.assertIn("market_odds", completed_agents)
        self.assertIn("prediction_synthesis", completed_agents)

        final = events[-1]["data"]
        self.assertEqual(final["type"], "prediction")
        self.assertIn(final["advisory"], {"LONG YES", "LONG NO", "NEUTRAL"})
        self.assertGreaterEqual(final["edge"], 0)
        self.assertIn("WEDGE_MAGNITUDE", final["analysis"])

    def test_validation_errors_are_streamed(self):
        events = asyncio.run(collect({"type": "bad", "topic": "NVDA", "sources": []}))
        self.assertEqual(events[0]["type"], "run_error")

    def test_missing_sources_still_synthesizes(self):
        events = asyncio.run(collect({"type": "prediction", "topic": "Will CPI print hot?", "sources": []}))
        self.assertEqual(events[-1]["type"], "final_result")
        self.assertEqual(events[-1]["data"]["type"], "prediction")


if __name__ == "__main__":
    unittest.main()
