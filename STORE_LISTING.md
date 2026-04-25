# Store Listing Copy - Caveman Web

Drop-in copy for the Chrome Web Store and Firefox AMO submission forms.
Honest marketing language only - no guarantees about token savings.

---

## Chrome Web Store

### Short description (132 char max)
> Ask AI chat sites to reply in terse Caveman-style prose. Local only, with custom prompts, previews, and no chat storage.

(120 chars including spaces.)

### Detailed description

> **Tired of AI models burying the answer in fluff? Caveman Web asks them
> to talk like a smart caveman.**
>
> When you press Enter or click send, Caveman Web adds a short instruction to
> your prompt - for example, *"Use terse direct prose. No filler. Keep full
> technical accuracy."* That's it. The model decides how to respond.
>
> **Four modes:**
> - **Lite** - gentle nudge toward concise answers.
> - **Full** - classic Caveman: terse, accurate, no filler.
> - **Ultra** - maximum compression, bullets only.
> - **Wenyan / 文言文** - experimental classical-Chinese-flavoured terseness.
>
> **Honest about what this is:**
> - It is **not** a magic compressor. It is a prompt helper.
> - It does **not** guarantee token savings. The model may still ramble.
> - It does **not** intercept network traffic, modify model output, or
>   reduce your bill automatically.
>
> **V2 controls:**
> - Per-site custom prompts.
> - Put the instruction before or after your prompt.
> - Optional editable preview before sending.
> - Hotkeys for mode cycling and quick on/off.
> - More sites: Mistral, Qwen, Perplexity, and Poe.
>
> **Privacy you can audit:**
> - No backend. No network requests.
> - No analytics, no telemetry, no third-party SDKs.
> - Your prompt text is read just long enough to add the instruction, then
>   dropped. Nothing is stored except a few integer counters.
> - Open source under MIT. Read every line.
>
> **Supported sites:** chatgpt.com, chat.openai.com, claude.ai,
> gemini.google.com, chat.deepseek.com, chat.mistral.ai,
> lechat.mistral.ai, chat.qwen.ai, perplexity.ai, and poe.com.
>
> Inspired by the open-source `caveman` Claude Code skill by Julius Brussee.

### Category recommendation
- **Primary:** Productivity
- **Secondary:** Workflow & Planning Tools

### Permission justifications (single sentence each)

| Permission | Justification |
|---|---|
| `storage` | Saves your on/off toggle, mode choice, per-site preferences, optional custom prompts, and numeric usage counters locally. |
| Host: `chatgpt.com`, `chat.openai.com` | Lets the content script add the Caveman instruction to your message on ChatGPT before it is sent. |
| Host: `claude.ai` | Lets the content script add the Caveman instruction on Claude before it is sent. |
| Host: `gemini.google.com` | Lets the content script add the Caveman instruction on Gemini before it is sent. |
| Host: `chat.deepseek.com` | Lets the content script add the Caveman instruction on DeepSeek before it is sent. |
| Host: Mistral, Qwen, Perplexity, Poe | Lets the content script add the Caveman instruction on those supported chat sites before the message is sent. |

### Screenshot captions (5)

1. **The popup.** On/off, modes, per-site toggles, custom prompts, and local-only stats.
2. **Caveman ON.** A small badge shows the active mode in the corner of supported chat sites.
3. **Before and after.** A normal ChatGPT prompt vs. one prefixed with the Caveman Full instruction.
4. **Estimates, not promises.** Local usage stats with a clear "estimates only" disclaimer.
5. **Local-only privacy.** DevTools Network panel showing zero outgoing requests from the extension.

---

## Firefox Add-ons (AMO)

### Summary (250 char max for AMO)
> Ask AI chat sites to reply in terse Caveman-style prose. Pick a mode, add per-site custom prompts, preview before sending, and keep everything local. No tracking, no chat storage, no backend.

### Detailed description (use the Chrome detailed description above; AMO accepts longer text)

### Category recommendation
- **Primary:** Other / Productivity
- **Tags:** chatgpt, claude, gemini, deepseek, ai, prompt, productivity, privacy

### Permission justifications

Same as the Chrome table above. AMO reviewers usually want one paragraph per
host permission; expand each row into a sentence:

> **Host permission `chatgpt.com`** - required so the content script can run
> on the ChatGPT site, read the message you are about to send from the input
> box, add the Caveman instruction, and trigger the site's own send
> button. The script does not read chat history or any other DOM region.

Repeat for the other four hosts.

### Privacy summary (AMO has a dedicated field)

> Caveman Web does not collect, transmit, or sell any data. Settings,
> optional custom prompts, and aggregate counters are stored locally via
> `browser.storage.local`. The extension never reads chat history, never
> makes network requests, and bundles no third-party scripts. See
> [PRIVACY.md](PRIVACY.md).

### Source-code link

Reviewers will ask. Point to the public repo and tag the exact release commit.
