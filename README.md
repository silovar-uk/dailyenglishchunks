# Daily English Chunks

A compact chunk-reading practice site for learning to read English in meaningful groups instead of translating word by word.

Lessons are identified by their **creation date**, and the newest lesson is always prioritized.

## UX principle

**Keep the place. Change the state.**

Practice interactions should not pull attention away from the passage. Reveal, quiz, slash, and read-state interactions update in place instead of rebuilding the screen or jumping the learner back to the top.

## Learning flow

1. Imagine — build the scene and emotion first
2. Read — tap each sentence after reading it
3. Chunk — add your own phrase boundaries
4. Understand — reveal Japanese only where needed
5. Check — retrieve meaning, intention, and chunking
6. Speak — read three times: meaning, rhythm, emotion
7. Final read — remove slashes, translation, and guidance and read the passage normally

## UX v3

- **Focus mode:** global navigation disappears during practice; only exit, creation date, and the current step remain.
- **Progressive disclosure:** the six-step list is collapsed into a compact `3 / 6 · Chunk` control and expands only when requested.
- **Latest first:** the newest creation date is the one-tap primary action on the home screen and the library is newest-first.
- **Stable Understand:** revealing translations does not move the scroll position.
- **Inline quiz feedback:** answers and explanations appear in place without rerendering the whole lesson.
- **Diff-first Chunk comparison:** the model is not repeated separately; only boundary differences are highlighted inline.
- **Three-level hints:** hints progress from a reading principle, to one model boundary, to the full diff.
- **Naked Reading:** every lesson ends with one final pass without slashes or translation.
- **Smart Random:** random selection slightly favors unfinished, Hard, and help-heavy lessons while avoiding immediate repeats when possible.
- **Experience counters:** the home screen tracks sentences read and chunks revealed instead of emphasizing streak pressure.

## Current lessons

- 2026/08/07 — A Small Change of Plans
- 2026/08/08 — Fixing a Small Mistake
- 2026/08/09 — Asking for More Time
- 2026/08/10 — Giving and Receiving Feedback
- 2026/08/11 — Changing the System Around the Problem

## Implementation

Static HTML / CSS / JavaScript with no build step. Core lesson content lives in `lessons.js`; date-specific additions can be loaded as small `lesson-YYYY-MM-DD.js` files before `bootstrap.js`. Progress and experience counters are stored locally with `localStorage`.

New lessons should include a `createdAt` value in `YYYY-MM-DD` format.

A lightweight GitHub Actions workflow runs `node --check` against the application and lesson JavaScript on every push so daily additions fail visibly if syntax breaks.

## Local preview

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.
