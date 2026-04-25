# Privacy Policy — Caveman Web

_Last updated: 2026-04-25_

Caveman Web is a browser extension. It runs locally in your browser. This
document explains, in plain language, exactly what it does and does not do
with your data.

## Short version

- **Nothing leaves your device.** Caveman Web makes no network requests.
- **No chat content is stored.** Not your prompts, not the AI's responses.
- **Settings are saved locally** via your browser's built-in extension storage.
- **No analytics, no telemetry, no third parties.**

If you want a one-line privacy statement: _"Caveman Web reads what you are
about to send so it can prepend a short instruction. Then it forgets."_

## What Caveman Web does

When you visit one of the four supported AI chat sites
(`chatgpt.com`, `chat.openai.com`, `claude.ai`, `gemini.google.com`,
`chat.deepseek.com`), the extension's content script runs in the page.

When you press Enter or click the site's send button, the extension:

1. Reads the text you just typed in the chat input box.
2. Prepends a short Caveman-mode instruction (e.g. _"Reply concise. Reduce
   filler…"_) to that text.
3. Asks the site to send the combined text by clicking its own send button.
4. Increments a few **numeric counters** in local storage (how many prompts
   were enhanced, an estimate of how many tokens were added).
5. Drops the text from memory.

The extension does **not**:

- Send any data to any server. There is no backend.
- Read messages from chat history.
- Read messages from any site that is not in the supported list.
- Read passwords, cookies, or other tabs' content.
- Use cookies, fingerprinting, analytics, or any tracking SDK.
- Run any remote or eval'd code.
- Access your microphone, camera, location, clipboard, or downloads.

## What is stored locally

Saved via `browser.storage.local` (Chrome's `chrome.storage.local`). This is
isolated to the extension and is removed when you uninstall it.

| Key | Type | Purpose |
|---|---|---|
| `enabled` | boolean | Global on/off |
| `mode` | string | `lite` / `full` / `ultra` / `wenyan` |
| `showBadge` | boolean | Show the on-page indicator |
| `visibleInjection` | boolean | UI preference (no behavioural difference in v0.1) |
| `debug` | boolean | Enables console logging in the page DevTools |
| `sites` | object | Per-site enable flags |
| `assumedOutputSavingPct` | number | Used by the stats estimator |
| `stats` | object | Four integer counters (see below) |

### Stats are integers only

```text
stats: {
  promptsEnhanced:      <integer>,
  instructionTokens:    <integer>,
  userPromptTokens:     <integer>,
  estSavedOutputTokens: <integer>
}
```

These are running totals. They do not contain prompt text, response text,
timestamps, hostnames, model names, IP addresses, or any user identifier.

## What is never stored

- Your prompts.
- AI responses.
- Conversation IDs.
- Page URLs (beyond the manifest's host-permission match list, which the
  browser uses internally).
- Identifiers of any kind.

## Permissions

| Permission | Why we need it |
|---|---|
| `storage` | Save your settings and the four numeric counters above, locally only. |
| Host: `chatgpt.com`, `chat.openai.com`, `claude.ai`, `gemini.google.com`, `chat.deepseek.com` | Run the content script on these chat sites so it can prepend the instruction to your prompt. |

We do not request `tabs`, `activeTab`, `webRequest`, `cookies`,
`history`, `bookmarks`, `<all_urls>`, or any host beyond the five domains
above.

## Third parties

None. Caveman Web bundles no third-party JavaScript at runtime, makes no
external requests, loads no fonts or images from CDNs, and uses no
analytics services.

## Updates

When the extension is updated through the Chrome Web Store or
Firefox Add-ons, your local settings are preserved. New default values for
new settings are merged in by the install handler; existing values are not
overwritten.

## Removing your data

Uninstall the extension. Your browser deletes all extension storage as
part of uninstall. There is no server-side data because there is no server.

## Contact

Open an issue on the project's repository. If you found a privacy or
security concern you would prefer to disclose privately, email the address
listed in the repository's `SECURITY.md` (or, if absent, open a private
security advisory on GitHub).

## Changes to this policy

If the privacy posture changes (it should not), the change will be:

1. Announced in `CHANGELOG.md` under a Changed/Added entry.
2. Reflected here with an updated _Last updated_ date.
3. Surfaced in the popup on the next launch.
