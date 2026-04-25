# Caveman Web

A small, honest browser extension that asks AI chat sites to reply in
**Caveman-style terse prose**. Inspired by [JuliusBrussee/caveman](https://github.com/JuliusBrussee/caveman),
but built as a stand-alone Manifest V3 extension for Chrome and Firefox.

> Caveman Web does **not** compress model output, intercept network traffic,
> or modify model behaviour beyond what the model itself does in response to
> a plain-text instruction prepended to your prompt.

## What it does

- Adds a short instruction (e.g. *"CAVEMAN MODE. Use terse direct prose…"*)
  to your prompt before it is submitted on supported AI websites.
- Lets you pick a mode: **Lite**, **Full**, **Ultra**, or **Wenyan / 文言文**.
- Shows a small floating badge so you know it is active.
- Keeps local, anonymous, aggregate stats (how many prompts, estimated tokens).

## What it does **not** do

- It does **not** guarantee any token saving. The model may still ramble.
- It does **not** read or store your chat content.
- It does **not** send anything to any server. There is no backend.
- It does **not** truly "compress" output — it just asks the model nicely.
- It does **not** support voice, image, or non-chat AI websites in v0.1.

## Supported sites (v0.1)

| Site      | URL                          |
|-----------|------------------------------|
| ChatGPT   | `chatgpt.com`, `chat.openai.com` |
| Claude    | `claude.ai`                  |
| Gemini    | `gemini.google.com`          |
| DeepSeek  | `chat.deepseek.com`          |

The extension only requests host permissions for these domains. There is no
`<all_urls>` permission and no `activeTab` permission.

## Privacy policy (short)

- All settings are stored **locally** via `browser.storage.local`.
- Stats are **numeric counters only**. No prompt or response text is stored.
- Nothing is uploaded. The extension makes no network requests.
- No analytics SDK, no telemetry, no tracking pixel, no third-party code.
- Uninstalling the extension removes all local data.

If you publish a fork or paid build, please keep this section honest.

## Install — Chrome (unpacked)

1. Run the icon generator once if you cloned without icons:
   `python3 scripts/make-icons.py`
2. Open `chrome://extensions`.
3. Toggle **Developer mode** on (top right).
4. Click **Load unpacked** and pick this project's root folder
   (the one containing `manifest.json`).
5. Pin the toolbar icon. Click it to open the popup.
6. Visit `https://chatgpt.com/` (or another supported site) and you should see
   a small `CAVEMAN FULL` badge in the bottom-right corner.

## Install — Firefox (temporary add-on)

Firefox 121+ supports the Manifest V3 service worker. To load:

1. Open `about:debugging#/runtime/this-firefox`.
2. Click **Load Temporary Add-on…** and pick the project's `manifest.json`.
3. The add-on stays loaded until you close Firefox.

For a signed build you would run `web-ext build` against this directory and
submit the resulting `.zip` to AMO. The repo intentionally has no build step.

## How modes work

Each mode prepends a different instruction:

- **Lite** — gentle: "Reply concise. Reduce filler. Keep accuracy."
- **Full** — default: "CAVEMAN MODE. Use terse direct prose. No filler…"
- **Ultra** — aggressive compression with bullets only.
- **Wenyan** — experimental classical-Chinese-flavoured terseness.

The exact text lives in [`src/shared/prompt-builder.js`](src/shared/prompt-builder.js).
Edit it to fit your taste — the rest of the code does not care what the
strings say.

## How token estimates work

We use a flat heuristic: **~4 characters ≈ 1 token**. That is a widely cited
rule of thumb for English with BPE tokenizers. Real tokenization differs per
model and per language. The popup labels every number as an estimate.

The "estimated saved output tokens" stat assumes your Caveman-mode response
is **40% shorter** than it would have been otherwise (configurable via
`assumedOutputSavingPct` in [`src/shared/defaults.js`](src/shared/defaults.js)).
This is a guess. Treat it as motivational, not as a billing report.

## How injection works (and the "visible vs hidden" toggle)

Right before the message is submitted we rewrite the editor with
`[Caveman <mode>] <instruction>\n---\n<your text>` and then trigger the
site's send button. A marker (`[Caveman <mode>]`) prevents double-injection
if the request is retried.

Both Chrome's content-script sandbox and the AI website's frontend will
display the injected text in the chat history. **There is no way to hide
the instruction from the chat history without intercepting the network
request, which would require broader permissions and would be hostile to
the user's trust.** The "Visible injection in prompt" toggle is therefore
mostly informational in v0.1; it is wired into settings for future
experimentation but currently behaves as visible injection on every site.

## Manual test checklist

After loading the extension:

- [ ] Toolbar icon opens popup.
- [ ] Toggling **Enable Caveman** off hides the on-page badge.
- [ ] Switching mode updates the badge text on supported pages.
- [ ] Per-site toggles enable/disable per domain.
- [ ] On ChatGPT, typing a message and pressing **Enter** sends a prompt
      that visibly starts with `[Caveman full] CAVEMAN MODE…`.
- [ ] On ChatGPT, clicking the send button does the same thing.
- [ ] On Claude, same as above (ProseMirror editor).
- [ ] On Gemini, same as above (rich-textarea).
- [ ] On DeepSeek, same as above (plain `<textarea>`).
- [ ] Stats counter increases by one per send.
- [ ] **Reset stats** zeroes the counters.
- [ ] No network requests originate from the extension (check DevTools →
      Network → filter `caveman-web@` or by origin in Firefox).

## Known DOM fragility

AI sites change their DOM frequently. Likely first-failure points:

- **ChatGPT** — `#prompt-textarea` is currently a `contenteditable`
  ProseMirror div. Selectors fall back to `[role="textbox"]` and
  `data-testid="send-button"`.
- **Claude** — uses ProseMirror inside a `[role="textbox"]`. Send button
  selector is ARIA-based.
- **Gemini** — wraps its editor in a `<rich-textarea>` custom element.
- **DeepSeek** — `textarea#chat-input`. Send "button" is a `div[role="button"]`.

If a site stops working, edit
[`src/content/site-adapters.js`](src/content/site-adapters.js) — that is
the only file that needs to change.

## Roadmap (v0.2 ideas)

- Per-site custom prompt overrides.
- Mode hotkeys (e.g. `Ctrl+Shift+M` to cycle).
- Option to **append** rather than prepend the instruction.
- Optional draft preview panel before send.
- Real tokenization via a small wasm BPE for accurate stats.
- Localised UI (pt-BR, zh, ja).
- Firefox-signed build pipeline (`web-ext`).
- More sites: Mistral Le Chat, Qwen Chat, Perplexity, Poe.
- A safer "hidden injection" mode that uses `declarativeNetRequest` to
  rewrite the request body for sites whose API is well-defined.

## Project structure

```
caveman-extension/
├── manifest.json
├── package.json
├── LICENSE
├── README.md
├── assets/
│   ├── icon16.png
│   ├── icon32.png
│   ├── icon48.png
│   └── icon128.png
├── scripts/
│   └── make-icons.py
└── src/
    ├── background/
    │   └── service-worker.js
    ├── content/
    │   ├── badge.css
    │   ├── badge.js
    │   ├── content-script.js
    │   ├── dom-utils.js
    │   └── site-adapters.js
    ├── popup/
    │   ├── popup.css
    │   ├── popup.html
    │   └── popup.js
    └── shared/
        ├── browser-polyfill.js
        ├── defaults.js
        ├── prompt-builder.js
        ├── storage.js
        └── token-estimator.js
```

## Credits

Inspired by [Julius Brussee's `caveman`](https://github.com/JuliusBrussee/caveman)
(MIT). The original is a Claude Code plugin / skill; this project is a
separate browser extension that applies the same idea to web chat UIs. If
you intend to publish this as an "official" or co-branded build, please
ask Julius first — out of respect for the original.

## License

[MIT](LICENSE).

## Screenshots

_Placeholders. Drop PNGs into `docs/` and link them here:_

- `docs/popup.png` — popup with mode selector.
- `docs/badge.png` — on-page badge.
- `docs/chatgpt.png` — Caveman-prefixed prompt sent to ChatGPT.
