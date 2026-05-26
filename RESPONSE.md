# Response to Sam — HR Chatbot

Hi Sam,

Thanks for the email

This looks promising. I think the idea is solid and the policy coverage documents you provided are thorough. I've done some engineering work and made a few changes to to get it into a safe, deployable state.

---

## Action required before anything else: rotate your API key

The Anthropic API key in `prototype.html` ought to be revoked. 

Because it was saved inside the HTML file, anyone with access can make API calls billed to your account. For that reason,  treat them like passwords. Don't paste them into Slack, email, or any document.

You should be able to do this here: https://console.anthropic.com/account/keys

---

## What I built

The prototype called Anthropic's API directly from the browser, which meant the API key, all the HR policy text, and the model instructions were all visible to anyone who opened the browser's developer tools. I've rebuilt it as a simple server that sits between the browser and Anthropic, so none of that is exposed.

Here's what changed:

- **`server.js`** — a backend server that handles all communication with Anthropic. The API key lives here, loaded from a private config file. The HR policies are loaded from the `policies/` folder automatically, so updating a policy is as simple as editing the relevant markdown file and restarting the server.
- **`index.html`** — the chat interface, now stripped of all sensitive content. It just sends questions to our server and displays the answers.
- **`tests.js`** — a set of automated tests that check the server handles edge cases correctly (bad inputs, questions outside the policy scope, etc.)

---

## Issues I found and what I did about them

### 1. The original prompt might've encouraged the model to make things up

The system prompt in the prototype said: *"Answer confidently and directly… if you don't know something, do your best to help anyway."*

This is a problem because language models will follow that instruction literally — they'll generate a plausible-sounding answer rather than admit uncertainty. For an HR tool that's a real risk: someone could act on incorrect policy information.

I've rewritten the prompt to frame the bot as a **reference tool, not an HR advisor**. It's now instructed to be conservative, quote the relevant policy section, say clearly when something isn't covered, and point people to `people@paluza.com` rather than guessing.

I also removed a stray line at the bottom of the embedded policy block — `chritsmas bonus was 5k` — which looked like a leftover from testing but would have caused the bot to confidently tell employees their Christmas bonus is £5,000.

### 2. Policies were hardcoded in the HTML

The full text of every HR policy was pasted directly into the prototype. This meant anyone viewing the page source could read them, and any time a policy changed you'd have to edit the code and redeploy.

Policies now load automatically from the `policies/` folder at startup. To update a policy, just edit the relevant `.md` file and restart the server — no code changes needed.

### 3. A public URL with no authentication is risky

You mentioned putting this on a public URL so employees can bookmark it. The problem is that "public URL" means anyone on the internet can access it — not just Paluza employees. That creates two risks: unexpected API costs if the URL gets discovered, and the possibility of external people querying (and potentially misquoting) Paluza's HR policies.

A few options, roughly in order of effort:

- **Deploy behind your company SSO or VPN** — if your internal tooling supports it, this is the cleanest solution and requires no extra code. The URL is only reachable by people already authenticated to your network.
- **HTTP Basic Auth** — adds a username and password prompt to the whole site. Only a little additional work on top of what's here.

I'd recommend not going live on a public URL until at least one of these is in place. Happy to implement the Basic Auth option if that works for your timeline.

### 4. The helpdesk export contains real employee data

`hr_helpdesk_export.json` contains real employee names, email addresses, and at least one entry with an employee's bank sort code and account number. This file isn't used by the chatbot, but it shouldn't be committed to any remote repo — especially not a shared or public one. I'd recommend removing it from the repo entirely, or at minimum making sure the repo stays private.

### 5. The model version was outdated

The prototype used `claude-3-5-sonnet-20241022`, which is no longer available via the API. I've updated this to `claude-sonnet-4-6`.

---

## How to run it locally

You'll need [Node.js](https://nodejs.org/) installed (version 18 or above). If you're not sure whether you have it, open Terminal and type `node --version` — if you see a number starting with 18 or higher, you're good. If not, download it from nodejs.org and install it first.

**Step 1: Add your API key**

In the project folder, you'll find a file called `.env.example`. Make a copy of it in the same folder and name the copy `.env` (just remove the `.example` part). Open the `.env` file in any text editor and replace `sk-ant-...` with your new API key. It should look like this:

```
ANTHROPIC_API_KEY=sk-ant-api03-...your-key-here...
PORT=3000
```

Save the file. (IMPORTANT) The `.env` file is listed in `.gitignore`, which means git will never include it in commits — your key stays private.

**Step 2: Install dependencies**

Open Terminal, navigate to the project folder, and run:

```
npm install
```

This downloads the libraries the server needs. You only need to do this once (or again if `package.json` changes).

**Step 3: Start the server**

```
npm start
```

You should see output like:

```
HR chatbot server running on http://localhost:3000
Loaded policies from: .../policies
```

**Step 4: Open the chatbot**

Go to [http://localhost:3000](http://localhost:3000) in your browser. The chatbot should be working.

To stop the server, press `Ctrl + C` in the terminal.

---

There's quite a lot of information there but hopefully it all makes sense on your end. Let me know if you hit any issues getting it running, or if you want to talk through the auth options.

Thanks,

Mark
