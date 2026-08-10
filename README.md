# Daily English Chunks

A compact chunk-reading practice site for learning to read English in meaningful groups instead of translating word by word.

Lessons are identified in the UI by their **creation date**. The newest lesson is prioritized on the home screen and lesson library.

## Core flow

1. Imagine — build the scene and emotion first
2. Read — tap each sentence as you read it
3. Chunk — add your own phrase boundaries with wide click / tap targets
4. Understand — tap individual chunks to reveal Japanese only when needed
5. Check — answer three retrieval questions
6. Speak — read aloud three times: meaning, rhythm, emotion

The step rail, dates, lesson cards, sentence rows, chunk cards, quiz rows, and speaking area are interactive so practice does not depend on finding a small button.

## Lesson navigation

- Lessons display their creation date, such as `2026/08/10`.
- The newest lesson is the primary lesson on the home screen.
- The lesson library is sorted by creation date, newest first.
- Tag-filtered results keep the same newest-first ordering.
- Random Lesson is available from the global header, home screen, and lesson library.
- Consecutive random selections avoid repeating the current or immediately previous random lesson when possible.

## Interaction notes

- Chunk boundary controls are normalized from their actual DOM position before each click to prevent invalid numeric indices.
- Invalid `NaN` text in the chunk practice UI is removed defensively.
- Revealing Japanese in Understand keeps the current scroll position instead of jumping back to the top.
- Existing `localStorage` progress is sanitized on startup so malformed numeric values do not break navigation.

## Current lessons

- 2026/08/07 — A Small Change of Plans
- 2026/08/08 — Fixing a Small Mistake
- 2026/08/09 — Asking for More Time
- 2026/08/10 — Giving and Receiving Feedback
- 2026/08/11 — Changing the System Around the Problem

## Implementation

Static HTML / CSS / JavaScript with no build step. Core lesson content lives in `lessons.js`; date-specific additions can be loaded as small lesson files before `bootstrap.js`. Progress is saved locally with `localStorage`.

New lessons should include a `createdAt` value in `YYYY-MM-DD` format (or add it to the metadata layer) so date-based ordering remains deterministic.

The favicon uses the `/` symbol as the visual identity for a chunk boundary.

## Local preview

Serve the directory with any static file server, for example:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.
