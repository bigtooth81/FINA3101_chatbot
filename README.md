# FINA 3101 Investment Tutor Chatbot

A tutoring chatbot for **Essentials of Investments** (Bodie, Kane & Marcus, 9th ed.)
powered by NVIDIA's hosted LLM API, embeddable in Google Sites.

---

## Files

| File | Purpose |
|------|---------|
| `chatbot.html` | The chatbot UI — host this on GitHub Pages |
| `textbook_chunks.json` | Pre-processed textbook index (1,531 sections, ~2.8MB) |
| `process_pdf.py` | Script to re-generate the index from the PDF |

---

## Step 1 — Get an NVIDIA API Key

1. Go to [build.nvidia.com](https://build.nvidia.com)
2. Sign up / log in → click your profile → **API Key**
3. Copy the key (starts with `nvapi-…`)

The free tier gives ~1,000 credits/month — plenty for a class.

---

## Step 2 — Deploy the Cloudflare Worker (hides your API key)

This proxy sits between the chatbot and NVIDIA. Your API key lives only on Cloudflare — students never see it.

1. Sign up free at [cloudflare.com](https://cloudflare.com)
2. Go to **Workers & Pages → Create Worker**
3. Click **Edit code**, paste the contents of `worker.js`, click **Deploy**
4. Go to **Settings → Variables → Add secret**
   - Variable name: `NVIDIA_API_KEY`
   - Value: your `nvapi-…` key → **Save**
5. Copy your Worker URL — it looks like:
   `https://fina3101-tutor.YOUR-SUBDOMAIN.workers.dev`
6. Open `chatbot.html` and replace the placeholder on this line:
   ```js
   const PROXY_URL = "https://fina3101-tutor.YOUR-SUBDOMAIN.workers.dev/v1/chat/completions";
   ```

Free tier: 100,000 requests/day — more than enough for a class.

---

## Step 3 — Deploy to GitHub Pages

GitHub Pages serves static files for free and gives you a URL students can visit.

1. Create a new **public** GitHub repository (e.g. `fina3101-tutor`)
2. Upload both `chatbot.html` and `textbook_chunks.json`
3. Go to **Settings → Pages → Branch: main → / (root) → Save**
4. Your URL will be: `https://<your-username>.github.io/fina3101-tutor/chatbot.html`

> **Note:** If you don't want the chunks file publicly visible, you can embed the
> API key directly in the HTML (line marked `// ── Configuration ──`) and skip the
> key-entry bar — but be aware anyone who views the page source can see it.

---

## Step 3 — Embed in Google Sites

1. Open your Google Site in edit mode
2. Click **Insert → Embed** (or the `< >` icon)
3. Choose **By URL** and paste:
   ```
   https://<your-username>.github.io/fina3101-tutor/chatbot.html
   ```
4. Resize the embed block to taste (recommend at least 600px tall)
5. **Publish** the site

Students will see the chatbot directly on the course page.

---

## How students use it

1. Instructor shares the Google Sites page
2. First use: students enter their own NVIDIA API key (or the instructor pre-fills one)
3. The key is saved in browser `localStorage` — students only enter it once per device
4. Students type questions; the chatbot finds relevant textbook sections and answers

---

## Customization

### Change the AI model
Edit `chatbot.html`, line near top of the `<script>`:
```js
const MODEL = "meta/llama-3.3-70b-instruct";
```
Other NVIDIA-hosted options: `meta/llama-3.1-8b-instruct`, `mistralai/mistral-7b-instruct-v0.3`

### Pre-fill the API key (so students don't need one)
Replace the key-bar section with a hardcoded key:
```js
let apiKey = "nvapi-YOUR-KEY-HERE";
```
And remove the `<div id="key-bar">` block from the HTML.

### Regenerate the textbook index
If you update the PDF:
```bash
pip install PyPDF2
python3 process_pdf.py
```
Then re-upload `textbook_chunks.json` to GitHub.

---

## Architecture

```
Student browser
  └── chatbot.html
        ├── loads textbook_chunks.json  (same GitHub Pages host)
        ├── keyword-searches chunks for relevant context
        └── POST /chat/completions  →  NVIDIA API  →  streams reply
```

No server needed — everything runs client-side.
