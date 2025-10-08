#!/usr/bin/env python3
"""
API Cost Monitor for AI MOM Backend
Tracks usage and costs for Groq and OpenRouter APIs
"""

import os
import json
from datetime import datetime, timedelta
from typing import Dict, List
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class APICostMonitor:
    def __init__(self):
        self.usage_file = "api_usage.json"
        self.load_usage()

    def load_usage(self):
        """Load usage data from file"""
        if os.path.exists(self.usage_file):
            try:
                with open(self.usage_file, 'r') as f:
                    self.usage_data = json.load(f)
            except:
                self.usage_data = self._create_empty_usage()
        else:
            self.usage_data = self._create_empty_usage()

    def _create_empty_usage(self):
        """Create empty usage tracking structure"""
        return {
            "groq": {
                "total_requests": 0,
                "total_tokens": 0,
                "total_cost": 0.0,
                "daily_usage": {},
                "models": {}
            },
            "openrouter": {
                "total_requests": 0,
                "total_tokens": 0,
                "total_cost": 0.0,
                "daily_usage": {},
                "models": {}
            },
            "last_updated": datetime.now().isoformat()
        }

    def track_request(self, provider: str, model: str, tokens: int = 0, cost: float = 0.0):
        """Track an API request"""
        today = datetime.now().strftime("%Y-%m-%d")

        if provider not in self.usage_data:
            return

        # Update totals
        self.usage_data[provider]["total_requests"] += 1
        self.usage_data[provider]["total_tokens"] += tokens
        self.usage_data[provider]["total_cost"] += cost

        # Update daily usage
        if today not in self.usage_data[provider]["daily_usage"]:
            self.usage_data[provider]["daily_usage"][today] = {
                "requests": 0, "tokens": 0, "cost": 0.0
            }

        self.usage_data[provider]["daily_usage"][today]["requests"] += 1
        self.usage_data[provider]["daily_usage"][today]["tokens"] += tokens
        self.usage_data[provider]["daily_usage"][today]["cost"] += cost

        # Update model usage
        if model not in self.usage_data[provider]["models"]:
            self.usage_data[provider]["models"][model] = {
                "requests": 0, "tokens": 0, "cost": 0.0
            }

        self.usage_data[provider]["models"][model]["requests"] += 1
        self.usage_data[provider]["models"][model]["tokens"] += tokens
        self.usage_data[provider]["models"][model]["cost"] += cost

        self.usage_data["last_updated"] = datetime.now().isoformat()
        self.save_usage()

    def save_usage(self):
        """Save usage data to file"""
        try:
            with open(self.usage_file, 'w') as f:
                json.dump(self.usage_data, f, indent=2)
        except Exception as e:
            logger.error(f"Failed to save usage data: {e}")

    def get_usage_report(self) -> Dict:
        """Get comprehensive usage report"""
        return {
            "summary": {
                "groq": {
                    "total_requests": self.usage_data["groq"]["total_requests"],
                    "total_cost": f"${self.usage_data['groq']['total_cost']:.4f}",
                    "avg_cost_per_request": f"${self.usage_data['groq']['total_cost'] / max(1, self.usage_data['groq']['total_requests']):.6f}"
                },
                "openrouter": {
                    "total_requests": self.usage_data["openrouter"]["total_requests"],
                    "total_cost": f"${self.usage_data['openrouter']['total_cost']:.4f}",
                    "avg_cost_per_request": f"${self.usage_data['openrouter']['total_cost'] / max(1, self.usage_data['openrouter']['total_requests']):.6f}"
                },
                "combined": {
                    "total_requests": self.usage_data["groq"]["total_requests"] + self.usage_data["openrouter"]["total_requests"],
                    "total_cost": f"${self.usage_data['groq']['total_cost'] + self.usage_data['openrouter']['total_cost']:.4f}"
                }
            },
            "free_tier_status": self._check_free_tier_status(),
            "recommendations": self._get_recommendations()
        }

    def _check_free_tier_status(self) -> Dict:
        """Check if still within free tiers"""
        groq_requests = self.usage_data["groq"]["total_requests"]
        or_requests = self.usage_data["openrouter"]["total_requests"]

        return {
            "groq_within_free": groq_requests < 1000,  # Approximate free limit
            "openrouter_within_free": or_requests < 500,  # Approximate free limit
            "estimated_free_remaining": {
                "groq": max(0, 1000 - groq_requests),
                "openrouter": max(0, 500 - or_requests)
            }
        }

    def _get_recommendations(self) -> List[str]:
        """Get usage recommendations"""
        recommendations = []

        total_cost = self.usage_data["groq"]["total_cost"] + self.usage_data["openrouter"]["total_cost"]

        if total_cost < 0.01:
            recommendations.append("✅ You're still in free tier - keep using!")
        elif total_cost < 1.0:
            recommendations.append("⚠️ Approaching paid tier - monitor usage closely")
        else:
            recommendations.append("💰 Now in paid tier - consider optimizing usage")

        groq_requests = self.usage_data["groq"]["total_requests"]
        or_requests = self.usage_data["openrouter"]["total_requests"]

        if groq_requests > or_requests * 2:
            recommendations.append("💡 Consider using more OpenRouter models to balance API usage")

        return recommendations

def main():
    """Main function to display usage report"""
    monitor = APICostMonitor()
    report = monitor.get_usage_report()

    print("🚀 AI MOM API Cost Monitor")
    print("=" * 50)

    print("\n📊 USAGE SUMMARY:")
    print(f"Groq: {report['summary']['groq']['total_requests']} requests, {report['summary']['groq']['total_cost']}")
    print(f"OpenRouter: {report['summary']['openrouter']['total_requests']} requests, {report['summary']['openrouter']['total_cost']}")
    print(f"Combined: {report['summary']['combined']['total_requests']} requests, {report['summary']['combined']['total_cost']}")

    print("\n🆓 FREE TIER STATUS:")
    free_status = report['free_tier_status']
    print(f"Groq free remaining: {free_status['estimated_free_remaining']['groq']} requests")
    print(f"OpenRouter free remaining: {free_status['estimated_free_remaining']['openrouter']} requests")

    print("\n💡 RECOMMENDATIONS:")
    for rec in report['recommendations']:
        print(f"  {rec}")

    print(f"\n📅 Last updated: {monitor.usage_data['last_updated']}")

if __name__ == "__main__":
    main()