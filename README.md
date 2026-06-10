# HR Chatbot

A secure internal chatbot for answering employee questions about HR policies. Built on Claude via the Anthropic API, with a Node.js backend that keeps credentials server-side and loads policy documents dynamically from the `policies/` folder.

---

## Security notes and decisions

### API key handling
The original prototype called the Anthropic API directly from the browser, exposing the API key in the page source. The rebuilt version moves all API communication to the backend. The key is loaded from a `.env` file that is excluded from version control via `.gitignore` — it never touches the frontend.

### Policies loaded from files, not hardcoded
The original had all policy text pasted into the HTML. Policies now load automatically from `policies/` at startup. To update a policy, edit the relevant `.md` file and restart the server — no code changes needed.

### System prompt guardrails
The original prompt instructed the model to "answer confidently… do your best to help anyway", which encourages hallucination. The rewritten prompt frames the bot as a reference tool: it quotes policy sections, explicitly says when something isn't covered, and directs employees to HR rather than guessing.

### Authentication
A public URL means anyone on the internet can access the chatbot, not just employees. Before deploying, put this behind one of:
- **Company SSO or VPN** — cleanest option, no extra code needed
- **HTTP Basic Auth** — a username/password prompt, minimal additional work

Do not deploy to a public URL without one of these in place.

---

## What's in the repo

| Path | Description |
|------|-------------|
| `server.js` | Express backend — serves the frontend, loads policy docs at startup, proxies chat to Anthropic |
| `index.html` | Single-page chat UI |
| `policies/` | HR policy documents (Markdown). Add or edit `.md` files here to update the chatbot's knowledge |
| `tests.js` | Unit and integration test suite |
| `.env.example` | Template for required environment variables — copy to `.env` and fill in |

---

## How to run it locally

You'll need [Node.js](https://nodejs.org/) (version 18 or above). To check, open Terminal and run `node --version`. If you see a number starting with 18 or higher you're good; otherwise download it from nodejs.org first.

**Step 1 — Add your API key**

Find the file called `.env.example` in the project folder. Copy it and name the copy `.env` (remove the `.example` part). Open `.env` in any text editor and replace `sk-ant-...` with your Anthropic API key:

```
ANTHROPIC_API_KEY=sk-ant-api03-...your-key-here...
PORT=3000
```

The `.env` file is listed in `.gitignore` — git will never commit it.

**Step 2 — Install dependencies**

```bash
npm install
```

Only needed once (or again if `package.json` changes).

**Step 3 — Start the server**

```bash
npm start
```

You should see:

```
HR chatbot server running on http://localhost:3000
Loaded policies from: .../policies
```

**Step 4 — Open the chatbot**

Go to [http://localhost:3000](http://localhost:3000) in your browser.

To stop the server press `Ctrl + C`.

---

## Running tests

```bash
# Unit tests only (no API key needed)
npm test

# Integration tests (requires a valid ANTHROPIC_API_KEY and running server)
npm run test:integration

# Both
npm run test:all
```
