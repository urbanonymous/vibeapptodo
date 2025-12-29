import json
from functools import lru_cache
from pathlib import Path
from urllib.parse import quote_plus


DATA_PATH = Path(__file__).resolve().parents[1] / "data" / "steps.json"


def _fallback_steps() -> list[dict]:
    phases = [
        ("Phase 1: MVP Launch", range(1, 7)),
        ("Phase 2: Demo & Hooks", range(7, 16)),
        ("Phase 3: Feedback Loop", range(16, 24)),
        ("Phase 4: Monetization", range(24, 28)),
        ("Phase 5: Scale & PMF", range(28, 34)),
    ]
    phase_by_step = {}
    for ph, r in phases:
        for n in r:
            phase_by_step[n] = ph

    return [
        {
            "number": n,
            "title": f"Step {n}",
            "description": "Template not loaded yet. Add backend/app/data/steps.json.",
            "phase": phase_by_step.get(n, "Phase"),
            "resources": [],
            "external_links": [],
        }
        for n in range(1, 34)
    ]


@lru_cache(maxsize=1)
def get_steps() -> list[dict]:
    try:
        raw = json.loads(DATA_PATH.read_text(encoding="utf-8"))
        if isinstance(raw, dict) and "steps" in raw:
            raw = raw["steps"]
        if not isinstance(raw, list):
            return _fallback_steps()
        steps = raw
    except FileNotFoundError:
        steps = _fallback_steps()

    # Ensure minimum resource coverage so the UI always has something useful to show.
    for s in steps:
        s.setdefault("resources", [])
        s.setdefault("external_links", [])
        if not s["resources"] and not s["external_links"]:
            q = quote_plus(f'{s.get("title","step")} app')
            s["resources"] = [
                {
                    "id": f's{s.get("number","x")}_auto_yt',
                    "type": "video",
                    "title": f'YouTube: {s.get("title","Step")}',
                    "url": f"https://www.youtube.com/results?search_query={q}",
                    "description": "Quick starting point — replace with your preferred resource.",
                }
            ]
    return steps

