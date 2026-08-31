# CLAUDE.md — Ham Technician Study App

## What this is
A web app for studying the FCC Amateur Radio **Technician** license exam, modeled
on hamstudy.org's study mode but self-built and extensible. Study (flashcard) mode,
practice exams, scoring, and per-subelement mastery/coverage tracking.

## Question pool
- Source: `resources/2026-2030 Technician Pool and Syllabus Public Release Feb 19 2026.pdf`
- Pool valid **7/01/2026 – 6/30/2030**. 409 questions, 10 subelements (T0–T9), 35 groups.
- A 35-question exam draws from each subelement by FCC weighting (see `syllabus.json`);
  passing is **26/35 (74%)**.
- `scripts/parse_pool.py` regenerates `src/data/questions.json` + `syllabus.json` and
  applies the 4 page-1 errata. **Never hand-edit the JSON — re-run the parser.**

## Architecture
- **Static SPA**: Vite + React + TypeScript + Tailwind. No backend in v1.
- Question bank ships as JSON; study progress lives in `localStorage`.
- All progress reads/writes go through the `ProgressStore` interface
  (`src/lib/progress`) so a backend (accounts / cross-device sync) or a PWA
  offline layer can be added later without touching UI code.
- Hosting: **Vercel** (static build). Repo: github.com/jeff-lewis-personal.

## Data contract
- `schemas/schemas.yml` is the single source of truth for all data shapes
  (questions, syllabus, localStorage). Update it whenever a shape changes.

## Conventions
- Mobile-first. Test layouts at phone width.
- Prefer source files < 300 lines, functions < 50 lines.
- Generated files (questions.json, syllabus.json) are exempt from the line limit.

## Deploy gotcha — npm lockfile
This machine installs npm through the Databricks internal proxy
(`npm-proxy.cloud.databricks.com`), which Vercel's build servers **cannot reach**.
Every local `npm install` rewrites `package-lock.json` `resolved` URLs to that proxy,
which makes Vercel hang on "Installing dependencies...". **Before pushing after any
dependency change, sanitize the lockfile:**
```bash
sed -i '' 's#https://npm-proxy.cloud.databricks.com/#https://registry.npmjs.org/#g' package-lock.json
```
(The proxy is a 1:1 mirror of the public registry, so paths and integrity hashes are identical.)

## Roadmap (post-v1)
- Spaced repetition (SRS), streaks, weak-area drilling
- Optional backend for accounts + seeing testers' progress
- PWA / offline mode
