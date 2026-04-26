# Changelog

All notable changes to **Caveman Web** are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

> **Maintainer rule:** every code change MUST add an entry under
> **[Unreleased]** before the change is committed. Releases promote that
> section to a new version heading.

## [Unreleased]

### Added
- Token estimate card in the popup with prompts enhanced, estimated saved
  output tokens, instruction tokens added, and estimated net tokens saved.
- Per-mode output saving rates (Lite 20%, Full 40%, Ultra 60%, Wenyan 65%)
  in `src/shared/token-estimator.js`. Replaces the single
  `assumedOutputSavingPct` knob.
- New `estNetSavedTokens` integer counter in stats.
- Status pill in the popup header that reflects the on/off state at a glance.
- "How it works" and "Before / after" collapsibles in the popup.
- Site adapter helpers: `isProbablyPromptEditor` and `getActiveSite`. The
  generic editor finder now prefers the focused element, filters out
  hidden, disabled, and read-only nodes, and ignores non-text inputs.
- Preview-before-send panel now shows Original, Enhanced, and three buttons
  (Cancel, Send original, Send enhanced). Sending the original does not
  bump token estimates.
- `npm test` runs lightweight Node checks for the prompt builder and the
  token estimator. `npm run check` runs lint plus tests.
- Per-site custom prompts.
- Prepend or append placement for Caveman instructions.
- Optional editable preview before sending.
- Hotkeys: `Ctrl+Shift+M` cycles mode, `Ctrl+Shift+E` toggles the extension.
- Popup language setting for English, Portuguese, Chinese, and Japanese.
- Support entries for Mistral, Qwen, Perplexity, and Poe.
- Better local token estimates for words, punctuation, long tokens, and CJK text.
- Hidden Debug-logging toggle in popup, also activatable via
  `?caveman-debug=1` URL parameter.
- `MAX_INPUT_CHARS = 50000` cap in the prompt builder to bound regex/memory
  cost on pathological inputs.
- Console warnings when the editor or send button cannot be located, so
  DOM breakage is observable in production.
- `TESTING.md` - concrete per-site manual test checklist.
- `PRIVACY.md` - standalone, host-anywhere privacy policy.
- `STORE_LISTING.md` - Chrome Web Store and Firefox AMO submission copy.
- `assets/icon.svg` - vector source for the toolbar icon, rasterized to
  16/32/48/128 PNGs by `scripts/make-icons.py` (uses ImageMagick when
  available, pure-Python fallback otherwise).

### Changed
- Mode instruction strings sharpened to better match the original Caveman
  identity: terse, direct, no filler, no pleasantries, no hedging,
  fragments OK, technical accuracy preserved.
- Marker regex widened to detect (a) the `[Caveman <mode>]` tag,
  (b) any of the four mode instructions verbatim, and (c) the lite-mode
  opening sentence. Closes the paste-from-prior-chat double-prefix gap.
- DeepSeek send-button selector is now scoped to the editor's container,
  with a typed-button preference, to avoid matching unrelated
  `div[role="button"]` elements elsewhere on the page.
- ChatGPT, Claude, and Gemini send-button lookups are now scoped to the
  editor's nearest `form` / toolbar ancestor (page-wide fallback retained).
- On Enter / click when the marker is already present we no longer
  intercept the event - the site sends the already-prefixed text natively.
- Popup gained an `Advanced` collapsible section housing the Debug toggle.

### Security / Privacy
- Reaffirmed in code comments: the content script reads only the editor
  element, never chat history; only numeric counters are persisted.

## [0.1.0] - 2026-04-25

### Added
- Initial Manifest V3 extension scaffold.
- Four Caveman modes: **Lite**, **Full**, **Ultra**, **Wenyan / 文言文**.
- Site adapters for ChatGPT (`chatgpt.com`, `chat.openai.com`),
  Claude (`claude.ai`), Gemini (`gemini.google.com`), and
  DeepSeek (`chat.deepseek.com`).
- Capture-phase Enter-key + send-button click interception with a marker
  to prevent double-injection.
- Floating on-page badge (`CAVEMAN <MODE>`) with click-to-cycle.
- Popup UI: global on/off, mode picker, per-site toggles, badge toggle,
  visible-injection toggle, local stats (prompts enhanced, instruction
  tokens, user-prompt tokens, estimated saved output tokens) with reset.
- Local-only storage via `browser.storage.local`. No backend, no network
  requests, no analytics, no third-party scripts, no remote code.
- README, MIT LICENSE, placeholder dark-stone PNG icon set.

[Unreleased]: ./CHANGELOG.md
[0.1.0]: ./CHANGELOG.md#010---2026-04-25
