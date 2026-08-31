#!/usr/bin/env python3
"""Parse the NCVEC Technician question pool PDF into JSON.

Produces:
  src/data/questions.json  - all questions with choices, correct answer, refs
  src/data/syllabus.json   - subelement/group metadata + exam weighting

Applies the 4 errata corrections from page 1 of the release PDF.

Usage: python3 scripts/parse_pool.py
"""
import json
import re
import sys
from pathlib import Path

import pypdf

ROOT = Path(__file__).resolve().parent.parent
PDF = ROOT / "resources" / "2026-2030 Technician Pool and Syllabus Public Release Feb 19 2026.pdf"
OUT_QUESTIONS = ROOT / "src" / "data" / "questions.json"
OUT_SYLLABUS = ROOT / "src" / "data" / "syllabus.json"

HEADER_RE = re.compile(r"^(T\d[A-Z]\d\d)\s*\(([A-D])\)\s*(?:\[([^\]]*)\])?\s*$")
CHOICE_RE = re.compile(r"^([A-D])\.\s+(.*)$")
SUB_RE = re.compile(
    r"SUBELEMENT\s+(T\d)\s*[-–]\s*(.+?)\s*\[(\d+)\s+Exam Questions?\s*[-–]\s*(\d+)\s+Groups?\]",
    re.DOTALL,
)
GROUP_RE = re.compile(r"^(T\d[A-Z])\s+(.+)$")
FIGURE_RE = re.compile(r"figure\s+(T-\d)", re.IGNORECASE)


def read_pdf_text(reader):
    return "\n".join(p.extract_text() for p in reader.pages)


def parse_errata(page1_text):
    """Return {question_id: corrected_question_text}."""
    errata = {}
    pattern = re.compile(
        r"(T\d[A-Z]\d\d)\s*[-–]\s*change the question to read:\s*(.+?)(?=\n\s*\n|T\d[A-Z]\d\d\s*[-–]|$)",
        re.DOTALL,
    )
    for m in pattern.finditer(page1_text):
        errata[m.group(1)] = " ".join(m.group(2).split())
    return errata


def parse_syllabus(full_text):
    """Return list of subelements with name, exam question count, group count."""
    subs = {}
    for m in SUB_RE.finditer(full_text):
        code = m.group(1)
        if code in subs:
            continue  # first occurrence (summary page) is clean
        subs[code] = {
            "code": code,
            "name": " ".join(m.group(2).split()).title().replace("’S ", "’s ").replace("'S ", "'s "),
            "examQuestions": int(m.group(3)),
            "groups": int(m.group(4)),
        }
    return subs


def parse_questions(full_text, errata):
    """Split on ~~ and parse each block into a question dict."""
    questions = []
    blocks = full_text.split("~~")
    for block in blocks:
        lines = [ln.rstrip() for ln in block.split("\n")]
        # locate header line
        header_idx = None
        header_match = None
        for i, ln in enumerate(lines):
            m = HEADER_RE.match(ln.strip())
            if m:
                header_idx, header_match = i, m
                break
        if header_match is None:
            continue

        qid = header_match.group(1)
        correct = header_match.group(2)
        fcc_ref = header_match.group(3)

        # accumulate question text and choices from lines after the header
        q_text_parts = []
        choices = {}
        current_choice = None
        for ln in lines[header_idx + 1:]:
            stripped = ln.strip()
            if not stripped:
                continue
            cm = CHOICE_RE.match(stripped)
            if cm:
                current_choice = cm.group(1)
                choices[current_choice] = cm.group(2).strip()
            elif current_choice is None:
                q_text_parts.append(stripped)
            else:
                # continuation of a wrapped choice
                choices[current_choice] += " " + stripped

        question_text = " ".join(q_text_parts).strip()

        # apply errata correction (question text only)
        if qid in errata:
            question_text = errata[qid]

        # detect figure reference
        figure = None
        fm = FIGURE_RE.search(question_text)
        if fm:
            figure = fm.group(1).upper()

        if sorted(choices.keys()) != ["A", "B", "C", "D"]:
            print(f"WARN: {qid} has choices {sorted(choices.keys())}", file=sys.stderr)
            continue

        questions.append({
            "id": qid,
            "subelement": qid[:2],
            "group": qid[:3],
            "correct": correct,
            "fccRef": fcc_ref,
            "figure": figure,
            "question": question_text,
            "choices": [choices["A"], choices["B"], choices["C"], choices["D"]],
        })
    return questions


def main():
    reader = pypdf.PdfReader(str(PDF))
    full_text = read_pdf_text(reader)
    page1 = reader.pages[0].extract_text()

    errata = parse_errata(page1)
    print(f"Errata corrections found: {sorted(errata.keys())}")

    subs = parse_syllabus(full_text)
    questions = parse_questions(full_text, errata)

    # attach live question counts per subelement/group to syllabus
    from collections import Counter
    sub_counts = Counter(q["subelement"] for q in questions)
    group_counts = Counter(q["group"] for q in questions)
    syllabus = []
    for code in sorted(subs):
        s = subs[code]
        s["questionCount"] = sub_counts[code]
        s["groupCodes"] = sorted(g for g in group_counts if g.startswith(code))
        syllabus.append(s)

    OUT_QUESTIONS.write_text(json.dumps(questions, indent=2, ensure_ascii=False))
    OUT_SYLLABUS.write_text(json.dumps(syllabus, indent=2, ensure_ascii=False))

    # ---- validation summary ----
    total_exam_q = sum(s["examQuestions"] for s in syllabus)
    errata_applied = [q["id"] for q in questions if q["id"] in errata]
    figures = sorted(set(q["figure"] for q in questions if q["figure"]))
    print("\n=== PARSE SUMMARY ===")
    print(f"Total questions: {len(questions)}")
    print(f"Subelements: {len(syllabus)}  |  Groups: {len(group_counts)}")
    print(f"Exam questions per session (sum of weights): {total_exam_q}")
    print(f"Errata applied: {errata_applied}")
    print(f"Figures referenced: {figures}")
    print(f"{'Sub':<4}{'Name':<28}{'Qs':>4}{'Exam':>6}{'Grps':>6}")
    for s in syllabus:
        print(f"{s['code']:<4}{s['name'][:27]:<28}{s['questionCount']:>4}{s['examQuestions']:>6}{s['groups']:>6}")

    # assertions
    assert all(len(q["choices"]) == 4 for q in questions), "a question lacks 4 choices"
    assert all(q["correct"] in "ABCD" for q in questions), "invalid correct answer"
    assert len(set(q["id"] for q in questions)) == len(questions), "duplicate question ids"
    assert total_exam_q == 35, f"exam weights sum to {total_exam_q}, expected 35"
    print("\nAll assertions passed.")


if __name__ == "__main__":
    main()
