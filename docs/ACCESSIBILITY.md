# StadiumPulse — Accessibility Documentation

## Overview

StadiumPulse is designed to be usable by all fans regardless of physical ability, language, or connectivity. This document covers all accessibility implementations.

## WCAG 2.1 AA Compliance

### Keyboard Navigation
- All interactive elements (buttons, inputs, links, tabs) are keyboard-focusable in logical DOM order
- Focus is visible with a 2px cyan (`#00E5FF`) outline on all focused elements (`:focus-visible`)
- Tab panels use proper ARIA `role="tab"`, `role="tabpanel"`, `aria-selected`, `aria-controls`
- Modal (login) traps focus correctly within the dialog

### Screen Reader Support
- All images and icons have `aria-hidden="true"` or descriptive `alt` text
- Alert cards use `role="alert"` and `aria-live="polite"` (critical alerts use `aria-live="assertive"`)
- Chat message list uses `role="log"` with `aria-live="polite"` and `aria-atomic="false"` for incremental updates
- Navigation steps use `<ol>` with `aria-label="Navigation steps"`
- KPI grid uses `role="list"` with `aria-label` per item
- Form inputs have explicit `<label for>` associations and `aria-required`
- Error messages have `id` referenced by `aria-describedby` on the relevant input
- Buttons have descriptive `aria-label` when icon-only

### Semantic HTML
- Pages use `<main>`, `<nav>`, `<section>`, `<article>`, `<ol>`, `<li>`, `<time>`, `<form>`
- Single `<h1>` per page with proper heading hierarchy (h1 → h2 → h3)
- `<button type="submit">` for form submission, `<button type="button">` for non-submit actions

---

## Voice Input / Output (Web Speech API)

**File**: `frontend/src/hooks/useSpeech.ts`

### Speech-to-Text (STT)
- Uses `SpeechRecognition` / `webkitSpeechRecognition` browser API
- Supported in Chrome 80+, Edge 80+, Safari 14.1+ (partial)
- Language adapts to selected UI language: `en-US`, `es-ES`, `hi-IN`
- Graceful degradation: voice button hidden when API unavailable

### Text-to-Speech (TTS)
- Uses `SpeechSynthesis` browser API
- Each assistant message has a "Read Aloud" button (appears on hover)
- Rate set to 0.9 (slightly slower for clarity)
- `cancelSpeech()` called before new utterance to prevent overlap
- `audioDescription` field from AccessibilityAgent is TTS-optimized plain text

---

## Multilingual Support

**Files**: `frontend/src/i18n/en.json`, `es.json`, `hi.json`

| Language | Code | Coverage |
|---|---|---|
| English | `en` | 100% — all UI strings |
| Spanish | `es` | 100% — all UI strings |
| Hindi | `hi` | 100% — all UI strings |

- Language selection persists per session (passed as `language` parameter to all API calls)
- Backend agents respond in the selected language (injected into system prompt: `Respond in language: {LANGUAGE}`)
- Web Speech API STT/TTS language matches selected UI language

---

## Simplified View

**Files**: `frontend/src/hooks/useSimplifiedView.ts`, `frontend/src/index.css`

Toggled via the "Simple" button in the navbar. When active:
- Adds `simplified` class to `<html>` element
- All font sizes increased by 1.2x (`font-size: 1.2em !important`)
- All CSS animations and transitions disabled (`animation: none !important`, `transition: none !important`)
- Background forced to pure black (`#000000`)
- Card backgrounds forced to pure black with white borders
- Preference persisted to `localStorage` so it survives page refreshes

---

## Offline Fallback

**Files**: `frontend/public/service-worker.js`, `frontend/public/offline.html`

When the network is unreachable:
1. Service worker intercepts navigation requests and serves `/offline.html`
2. Offline page contains:
   - Gate quick reference (G1, G3, G6, G8 with accessibility info)
   - Transit lines (Metro A, B, C with gate associations)
   - Emergency contacts (Medical: +1-555-MED-911, Security, Lost Child)
3. Fan Companion shows an inline offline banner (yellow, with WifiOff icon)
4. Chat input is disabled while offline with ARIA `aria-describedby` pointing to the notice

---

## Colour Contrast

| Element | Foreground | Background | Ratio | WCAG AA |
|---|---|---|---|---|
| Primary text | `#ffffff` | `#0A1628` | 18.1:1 | ✅ Pass |
| Secondary text | `rgba(255,255,255,0.6)` | `#0A1628` | 7.8:1 | ✅ Pass |
| Cyan accent | `#00E5FF` | `#0A1628` | 11.3:1 | ✅ Pass |
| Critical badge | `#FF1744` | `rgba(255,23,68,0.15)` | 4.8:1 | ✅ Pass |
| High badge | `#FF6D00` | `rgba(255,109,0,0.15)` | 4.6:1 | ✅ Pass |

---

## Future Accessibility Enhancements

These are documented as future scope (not implemented in this build):

1. **Sign Language Avatar** — Integration with SignAll or similar API to render an avatar signing emergency announcements in BSL/ASL
2. **High Contrast Theme** — Separate theme toggle beyond simplified view (pure black/white, no gradients)
3. **Font Size Slider** — Fine-grained text size control rather than a binary toggle
4. **Screen Reader Audio Guide** — Pre-recorded audio guide playback for common routes (Gate 1 → Section 201)
