#!/usr/bin/env python3
"""Generate original per-question explanations for the Technician pool.

Uses the locally-authenticated `claude` CLI in print mode (no API key needed).
Explanations are ORIGINAL text justifying the known-correct answer — not derived
from any third-party study guide. Output: src/data/explanations.json
{ questionId: "1-2 sentence explanation", ... }

Resumable: only generates for questions missing an explanation. Re-run to fill gaps.

Usage: python3 scripts/gen_explanations.py [--model sonnet] [--batch 20]
"""
import argparse
import json
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
QUESTIONS = ROOT / "src" / "data" / "questions.json"
OUT = ROOT / "src" / "data" / "explanations.json"

PROMPT_HEADER = """You are an expert Amateur Radio instructor helping a student study for the FCC \
Technician license exam. For each question below the CORRECT answer is given. Write a concise, \
original 1-2 sentence explanation of WHY that answer is correct (and, briefly, the underlying \
concept). Do not restate the question verbatim. Keep each explanation under 40 words, plain text, \
no markdown. Write in your own words — do not copy any study guide. When a question includes an \
FCC rule reference (fccRef), ground the explanation in FCC Part 97 (public domain), but phrase it \
plainly for a beginner rather than quoting regulation.

Output ONLY a single minified JSON object mapping each question id to its explanation string. \
No prose before or after, no code fences.

Questions:
"""


def load_json(path, default):
    if path.exists():
        return json.loads(path.read_text())
    return default


def extract_json(text):
    """Pull the first {...} object out of model output."""
    start = text.find("{")
    end = text.rfind("}")
    if start == -1 or end == -1 or end <= start:
        return None
    try:
        return json.loads(text[start : end + 1])
    except json.JSONDecodeError:
        return None


def call_claude(prompt, model, timeout=240):
    result = subprocess.run(
        ["claude", "-p", prompt, "--model", model],
        capture_output=True,
        text=True,
        timeout=timeout,
    )
    return result.stdout


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--model", default="sonnet")
    ap.add_argument("--batch", type=int, default=20)
    ap.add_argument("--passes", type=int, default=3)
    args = ap.parse_args()

    questions = load_json(QUESTIONS, [])
    explanations = load_json(OUT, {})
    by_id = {q["id"]: q for q in questions}

    for attempt in range(1, args.passes + 1):
        missing = [q for q in questions if not explanations.get(q["id"])]
        if not missing:
            break
        print(f"Pass {attempt}: {len(missing)} explanations to generate", flush=True)
        for i in range(0, len(missing), args.batch):
            batch = missing[i : i + args.batch]
            payload = [
                {
                    "id": q["id"],
                    "question": q["question"],
                    "correct": q["correct"],
                    "answer": q["choices"]["ABCD".index(q["correct"])],
                    "fccRef": q.get("fccRef"),
                }
                for q in batch
            ]
            prompt = PROMPT_HEADER + json.dumps(payload, ensure_ascii=False)
            try:
                out = call_claude(prompt, args.model)
            except subprocess.TimeoutExpired:
                print(f"  batch {i // args.batch} timed out; will retry", flush=True)
                continue
            parsed = extract_json(out)
            if not parsed:
                print(f"  batch {i // args.batch}: unparseable output; will retry", flush=True)
                continue
            added = 0
            for qid, expl in parsed.items():
                if qid in by_id and isinstance(expl, str) and expl.strip():
                    explanations[qid] = re.sub(r"\s+", " ", expl.strip())
                    added += 1
            OUT.write_text(json.dumps(explanations, indent=2, ensure_ascii=False) + "\n")
            done = len([q for q in questions if explanations.get(q["id"])])
            print(f"  batch {i // args.batch}: +{added}  ({done}/{len(questions)})", flush=True)

    done = len([q for q in questions if explanations.get(q["id"])])
    print(f"\nDone: {done}/{len(questions)} have explanations.")
    if done < len(questions):
        print("Some are still missing — re-run to fill gaps.", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
