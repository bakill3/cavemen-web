# Caveman Web

Browser extension that tells AI chat sites to answer shorter.

It does one simple thing: before your message is sent, it adds a Caveman
instruction like "be terse, skip filler, keep the technical details right".

No backend. No analytics. No chat storage.

## Sites

- ChatGPT
- Claude
- Gemini
- DeepSeek
- Mistral
- Qwen
- Perplexity
- Poe

## Features

- Lite, Full, Ultra, and Wenyan modes
- Per-site on/off switches
- Per-site custom prompts
- Put the instruction before or after your prompt
- Optional preview before sending
- Badge on supported sites
- Hotkeys:
  - `Ctrl+Shift+M` cycles mode
  - `Ctrl+Shift+E` toggles Caveman Web
- Local estimate counters
- Small popup UI in English, Portuguese, Chinese, and Japanese

## What it does not do

- It does not guarantee token savings.
- It does not edit model output after the reply comes back.
- It does not read chat history.
- It does not make network requests.
- It does not do hidden request rewriting. That would need broader permissions.

## Install locally

1. Open `chrome://extensions`.
2. Turn on Developer mode.
3. Click Load unpacked.
4. Pick this folder.
5. Pin the extension and open a supported chat site.

Firefox temporary install:

1. Open `about:debugging#/runtime/this-firefox`.
2. Click Load Temporary Add-on.
3. Pick `manifest.json`.

## Privacy

Settings and counters are stored in `browser.storage.local`.

Stored:

- on/off
- selected mode
- site toggles
- custom prompt text
- display settings
- numeric counters

Not stored:

- prompts
- AI replies
- chat history
- account data
- page URLs

See [PRIVACY.md](PRIVACY.md).

## Development

Run the syntax check:

```sh
npm run lint
```

Regenerate icons:

```sh
npm run icons
```

Most site breakage lives in `src/content/site-adapters.js`. AI sites change
their DOM a lot, so start there first.

## License

MIT.
