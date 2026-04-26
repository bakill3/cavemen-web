# Caveman Web - Manual Test Checklist

Run after every adapter change. Times below assume a fresh profile so storage
is clean.

## 0. Setup

1. Load unpacked from `chrome://extensions` (Developer mode on).
2. Pin the toolbar icon.
3. Open the popup. Confirm:
   - [ ] Status pill in the header reads **On**.
   - [ ] **Enable Caveman** is on.
   - [ ] Mode is **Full**.
   - [ ] Token estimate card shows zeros and the "Estimates only" note.
   - [ ] All listed sites are enabled.
   - [ ] Placement is **Before prompt**.
   - [ ] Preview before send is off.
   - [ ] Hotkeys are on.
   - [ ] How it works and Before / after sections expand.
4. Open the Advanced panel and tick **Debug logging**. Open DevTools / Console
   on the test tab. You should see lines starting `[Caveman Web]`.
   *Alternative:* append `?caveman-debug=1` to the URL.

## 1. ChatGPT - `https://chatgpt.com`

| # | Step | Expected |
|---|------|----------|
| 1 | Open new chat, type `what is rust ownership`, press **Enter** | Sent message starts with `[Caveman full] CAVEMAN MODE` followed by `\n---\nwhat is rust ownership` |
| 2 | DevTools console | Logs `init { adapter: "chatgpt" }` and `injected { adapter: "chatgpt", mode: "full", chars: 22 }` |
| 3 | Popup / Stats | `prompts enhanced` = 1; `user prompt tokens` has increased |
| 4 | Type `hello` and click the **send button** instead of Enter | Same prefixed-message behavior |
| 5 | Type `[Caveman full] hi` and press Enter | **No** double prefix; sent verbatim |
| 6 | Disable **ChatGPT** site toggle in popup; type `test`; Enter | Sent without prefix; stats unchanged |
| 7 | Re-enable; switch mode to **Ultra** in popup | Badge updates to `CAVEMAN ULTRA` immediately |
| 8 | Send another message | Prefix is `[Caveman ultra] CAVEMAN ULTRA` |
| 9 | Set placement to **After prompt**, send `hello` | Caveman marker appears after the prompt |
| 10 | Enable preview, send `hello` | Draft panel opens with Original, Enhanced, and three buttons (Cancel, Send original, Send enhanced). Send enhanced submits the edited draft and bumps stats. Send original sends `hello` unchanged and does not bump stats. |
| 11 | Set a ChatGPT custom prompt, send | Custom prompt is used instead of the selected mode text |
| 12 | Press `Ctrl+Shift+M` on the page | Mode changes and the badge updates |
| 13 | Press `Ctrl+Shift+E` on the page | Extension toggles on/off |

## 2. Claude - `https://claude.ai/new`

| # | Step | Expected |
|---|------|----------|
| 1 | Type `explain monads`, press Enter | Prefixed message sent |
| 2 | Console | `adapter: "claude"` |
| 3 | Type `Shift+Enter` on a new line, then Enter | Newline inserted; prefix added once on Enter |
| 4 | Open existing thread, edit your last message, click submit | Prefix should **not** stack on top of the existing prefix (marker detection) |
| 5 | Click send button explicitly | Same behavior as Enter path |

## 3. Gemini - `https://gemini.google.com/app`

| # | Step | Expected |
|---|------|----------|
| 1 | Type `summarise mass spectrometry`, press Enter | Prefixed message sent |
| 2 | Console | `adapter: "gemini"` |
| 3 | Click microphone, dictate, click send | Voice text picked up by `getEditorText`; prefix added on send |
| 4 | Switch to a different conversation in the side panel, send a new message | Listeners still active (we attach to `document` once) |

## 4. DeepSeek - `https://chat.deepseek.com`

| # | Step | Expected |
|---|------|----------|
| 1 | Type `explain mTLS`, press Enter | Prefixed message sent |
| 2 | Console | `adapter: "deepseek"` |
| 3 | Confirm send button is the input-area button (not e.g. a model-switcher pill elsewhere on the page). Inspect element to verify | Send button is scoped to the editor's container |
| 4 | Toggle DeepSeek off in popup, send | No prefix; site behavior unchanged |

## 5. Cross-site

| # | Step | Expected |
|---|------|----------|
| 1 | Reload extension on `chrome://extensions` while a chat tab is open | After tab reload, content script re-attaches; debug log shows `init` |
| 2 | Visit a non-listed site (e.g. `https://example.com`) | No content script runs (manifest-restricted); no badge |
| 3 | Disable **Show on-page badge** in popup | Badge disappears within ~500ms on all open chat tabs |
| 4 | Click **Reset stats** | Stats zero out; popup updates |
| 5 | DevTools / Network panel, filter by extension origin | No outgoing requests originate from the extension |
| 6 | Test Mistral, Qwen, Perplexity, and Poe with a short prompt | Caveman instruction is added or, if the site DOM changed, a console warning explains what selector failed |

## 6. Edge cases

| Case | Expected |
|------|----------|
| Paste a previous Caveman-prefixed message and send | No double prefix |
| Submit two messages in rapid succession (<250ms) | Both get prefixed; no infinite loop; no skipped send |
| IME composition (e.g. Japanese, pinyin) - press Enter to commit a candidate | No interception during composition |
| Empty input + Enter | No-op; no stats change |
| Very long input (~50k chars) | Capped to 50k before injection; site sends |
| Drag-and-drop text into input, click send | Prefix added on send |
| Speech-to-text dictation, click send | Prefix added on send |

## 7. When DOM breaks

If a send no longer prefixes:

1. Enable Debug logging.
2. Reload the chat page.
3. Look for `editor not found` or `send button not found` warnings.
4. Open DevTools / Inspect Element on the input and on the send button.
5. Note: tag, `id`, `role`, `aria-label`, `data-testid`, and parent structure.
6. Update the relevant adapter in [`src/content/site-adapters.js`](src/content/site-adapters.js).
7. Add a CHANGELOG entry under **Unreleased** before committing.
