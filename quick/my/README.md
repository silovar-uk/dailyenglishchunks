# My Cantonese / 我的廣東話

Public personal phrase catalog for Quick Lab. Published at https://silovar-uk.github.io/dailyenglishchunks/quick/my/.

## When the user asks ChatGPT to add a Cantonese expression

1. Fetch `quick/my/data/phrases.json` from the latest branch using GitHub. Do not edit existing entries blindly.
2. Use a traditional Hong Kong Cantonese expression; preserve the requested colloquial spelling. Verify Jyutping in context and give a concise Japanese meaning and usage note. Do not add private conversation or personal identifiers.
3. Check duplicates by NFC-normalized text and existing variants. If already present, update only when asked, preserving id and addedAt; set updatedAt on a correction.
4. For a new entry, assign the next zero-padded sequential id (my-000008 etc.), record actual Japan time ISO 8601 with +09:00 in addedAt and updatedAt, add category, note and optional variants/speechText. Do not infer prior study dates.
5. Check every character against `quick/data.js`; if absent, verify full Cangjie code with a reliable dictionary and add a supplemental object under `supplement` keyed by the character, with cangjie and source. Do not overwrite the main quiz corpus automatically.
6. Validate unique ids and texts, valid dates, one space-separated Jyutping syllable (ending in 1–6) per character, and complete code coverage. Use the latest blob SHA when updating. On conflict refetch and merge.
7. Commit only the changed JSON file; report the added expressions and link to the page. Do not claim Pages deployment until confirmed.

The app derives Quick codes and tone graphics from the full code and phrase-level reading, groups by Japan date, sorts by addedAt descending with id descending as tie-breaker, and loads JSON with cache:no-store. On-device Cantonese TTS only; no Mandarin fallback. A speechText override is optional when colloquial spelling may be pronounced incorrectly. No sign-in, no backend, no personal notes beyond public learning data.

## Schema v1

Top-level object: schemaVersion (1), phrases (array), supplement (object).
Required phrase fields: id, text, jyutping, meaning, category, addedAt, updatedAt. Optional: note, variants (array), speechText. Current practice is Han-only expressions without punctuation. Supplement records: cangjie (uppercase letters), source (HTTPS URL). 
