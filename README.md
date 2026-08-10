# Daily English Chunks

A small daily practice site for learning to read English in meaningful chunks instead of translating word by word.

## Core flow

1. Imagine — build the scene and emotion first
2. Read — read once without slashes or translation
3. Chunk — add your own phrase boundaries
4. Understand — reveal Japanese chunk meanings only when needed
5. Check — answer three retrieval questions
6. Speak — read aloud three times: meaning, rhythm, emotion

## Current lessons

- Day 01 — A Small Change of Plans
- Day 02 — Fixing a Small Mistake
- Day 03 — Asking for More Time
- Day 04 — Giving and Receiving Feedback

## Implementation

Static HTML / CSS / JavaScript with no build step. Lesson content lives in `lessons.js`; progress is saved locally with `localStorage`.

## Local preview

Serve the directory with any static file server, for example:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.
