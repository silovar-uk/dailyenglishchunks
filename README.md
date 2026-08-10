# Daily English Chunks

A compact chunk-reading practice site for learning to read English in meaningful groups instead of translating word by word.

Lessons are intentionally **sequential, not date-based**: `DAY 001`, `DAY 002`, `DAY 003`…

## Core flow

1. Imagine — build the scene and emotion first
2. Read — tap each sentence as you read it
3. Chunk — add your own phrase boundaries with wide click / tap targets
4. Understand — tap individual chunks to reveal Japanese only when needed
5. Check — answer three retrieval questions
6. Speak — read aloud three times: meaning, rhythm, emotion

The step rail, lesson numbers, sequence cards, sentence rows, chunk cards, quiz rows, and speaking area are all interactive so practice does not depend on finding a small button.

## Current lessons

- Day 001 — A Small Change of Plans
- Day 002 — Fixing a Small Mistake
- Day 003 — Asking for More Time
- Day 004 — Giving and Receiving Feedback

## Implementation

Static HTML / CSS / JavaScript with no build step. Lesson content lives in `lessons.js`; progress is saved locally with `localStorage`.

The favicon uses the `/` symbol as the visual identity for a chunk boundary.

## Local preview

Serve the directory with any static file server, for example:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.
