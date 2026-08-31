# Ham Technician Study App

A mobile-friendly web app for studying the FCC Amateur Radio **Technician** license
exam (question pool valid 7/01/2026 – 6/30/2030). Study mode, practice exams, and
per-subelement mastery tracking. Inspired by hamstudy.org, built to be extended.

## Features (v1)
- **Study mode** — flashcards by subelement/group, reveal answer, flag for review
- **Practice exam** — 35 questions drawn by FCC subelement weighting; 26/35 to pass
- **Progress** — % of pool seen and accuracy per subelement, weak-area highlighting

All progress is stored locally in your browser (no account needed).

## Tech
Vite + React + TypeScript + Tailwind. Fully static — deploys to Vercel.

## Develop
```bash
npm install
npm run dev        # local dev server
npm run build      # production build -> dist/
npm run preview    # preview the production build
```

## Regenerate the question pool
The question bank is generated from the official NCVEC release PDF in `resources/`:
```bash
pip install pypdf
python3 scripts/parse_pool.py   # writes src/data/questions.json + syllabus.json
```

## Data
See `schemas/schemas.yml` for the shape of the question, syllabus, and progress data.
