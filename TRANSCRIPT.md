# LLM Transcript — HR Chatbot Take-home

> Full, unedited conversation used to complete this exercise.

---

**User:**

We're going to build a secure HR chatbot in 90 minutes. Here's what matters:

Goals:
* Code that works
* Flag implementation concerns
* Safe defaults (minimize hallucination, add auth layer)
* Skip: UI polish, exhaustive testing

Initial tasks:

1. Read the project files to understand the brief
2. Flag these specific concerns in the current prototype:
   * API key exposed in HTML
   * HR policy details hardcoded in frontend
   * Risk of policy misrepresentation (LLM hallucination)
   * No authentication
3. Rewrite the system prompt to be safer (minimize hallucination). it needs to mention the following:
   * you are a reference tool, not an HR person so your job is to help employees find policy information and not give personal guidance
   * the documents in policies/ as a source of truth for the actual information
4. Build a secure backend that:
   * Keeps API key server-side only
   * Moves policies to backend (not frontend)
   * Uses the safer prompt

Assumptions:
* Deployment will be internal-only or auth-protected (auth can be added in future if time doesn't allow)
* 90-min hard stop — we'll prioritize and adjust scope if needed

Before we start coding: anything essential I've missed?

---

**Assistant:**

[Read prototype.html, prompt.md, README.md, hr_helpdesk_export.json, policies/ directory]

Good, I have a clear picture. Here's my full pre-flight read before we touch code:

**On the four concerns you listed — confirmed, and here's the specifics:**

**1. API key exposed in HTML** — yes, and it's a real key (`sk-ant-api03-4x3OeY...`). It's already committed to git history, so it should be considered compromised *right now*, regardless of what we build next. The first action before deployment is to rotate it in the Anthropic console and put the new one in a `.env` file that's `.gitignore`d.

**2. HR policies hardcoded in frontend** — correct. Every policy detail is readable by anyone who hits View Source. Also there's a suspicious stray line at the bottom of the embedded policy block: `chritsmas bonus was 5k` (misspelled, no context). That's not in any of the `policies/` files — it looks like test data or an accidental paste that never got removed. If left in, the bot will confidently tell employees their bonus is £5k. We should drop it and use the actual `policies/` files as the source of truth.

**3. Hallucination risk** — the current system prompt actively makes this worse: *"Answer confidently and directly… if you don't know something, do your best to help anyway."* That's an instruction to make things up. `prompt.md` in the repo is already much better — we'll use that as the base.

**4. No authentication** — agreed, future work, but see below.

**One thing missing from your list that's a bigger deal:**

**Sam wants a public URL.** That's the deployment ask in the README — *"just put it on a public URL — something easy for employees to bookmark."* A public URL with no auth means anyone on the internet can use it, not just employees. That's the actual threat model, and it directly conflicts with the "internal-only or auth-protected" assumption you've listed. We should push back on this in `RESPONSE.md` and either add HTTP Basic Auth (a 20-minute job) or make it very explicit that a VPN/internal network constraint is required before go-live. I'll flag this clearly to Sam.

**One more thing worth noting:**

The `hr_helpdesk_export.json` contains real employee PII — names, email addresses, and at least one ticket (HD-2024-0902) with an employee's actual bank sort code and account number. We're not going to feed that into the chatbot (it's not in the current prototype), but it's sitting in the repo and probably shouldn't be committed to any remote without careful thought.

**Scope check — 90 minutes is achievable if we stick to:**
- Node/Express backend (15 min)
- Policy file loading + safer prompt (10 min)
- Frontend stripped down to call `/api/chat` (10 min)
- RESPONSE.md (10 min)
- Smoke test + cleanup (15 min)

Shall I proceed?

---

**User:**

yes let's start with the backend. Since this is a prototype we don't need anything too fancy in terms of structure. to limit the scope we just want to begin with a server main backend and something that manages dependencies

---

**Assistant:**

[Created package.json and server.js]

Here's what was created and the key decisions:

**`package.json`** — three runtime deps: `express` (server), `@anthropic-ai/sdk` (official client, handles retries and error types cleanly), `dotenv` (env var loading). `nodemon` as a dev convenience.

**`server.js`** — a few things worth noting:
- Policies are loaded **once at startup** by reading all `.md` files in `policies/` — no hardcoding, and adding a new policy file just requires a server restart
- The server **crashes at startup** if `ANTHROPIC_API_KEY` is missing, rather than failing silently on the first request
- `/api/chat` does a **basic shape validation** on the messages array before hitting Anthropic — catches bad payloads early
- The system prompt marks policies as the **sole source of truth** and explicitly bans extrapolation outside them

Also added `"type": "module"` to package.json for ES module syntax, `.env.example` as a template, and `.gitignore` to prevent `.env` and `node_modules` from being committed.

Next step is the frontend — strip the API key and policy content out of the HTML and point it at `/api/chat` instead of Anthropic directly. Ready to proceed?

---

**User:**

just before you start, the server will require a few endpoints. for one we'll need a GET /health Health check to make sure the server is up, a GET / to serve the HTML and a POST that handles the actual questions.

---

**Assistant:**

Got it. Three endpoints: `GET /health`, `GET /` (serves the HTML), and `POST /api/chat`. Building now.

[server.js written with all three endpoints]

---

**User:**

Yes, proceed:
1. Wire up frontend to /api/chat (remove hardcoded API key and policies)
2. Unit test edge cases:
   - Question not covered by policy (should direct to help, not invent)
   - Ambiguous policy section (should flag ambiguity)
   - Question outside HR scope (should redirect)
   - Malformed input (should handle gracefully)
3. Document test results and any issues found

---

**Assistant:**

[Created index.html — frontend stripped of API key, policy context, and system prompt. Calls /api/chat instead of Anthropic directly. Also created tests.js with node:test — unit tests for input validation and integration tests for LLM behaviour.]

All 6 unit tests pass:
- rejects missing messages field ✓
- rejects empty messages array ✓
- rejects message with invalid role ✓
- rejects message with empty content ✓
- rejects message with non-string content ✓
- accepts a well-formed single user message ✓ (502 with dummy key, as expected)

Integration tests (LLM behaviour cases) are written and ready but require a real API key and outbound network to run — the sandbox has neither.

---

**User:**

can you update the tests. I prefer the given, when, then comments on tests as I find them easier to follow.

---

**Assistant:**

[Updated tests.js — added Given/When/Then comment blocks to all unit and integration tests]

Re-ran unit tests to confirm nothing broke — still 6/6 passing.

---

**User:**

having cleared up those errors, the model appears to work well. so, to recap where we are now...
what is left to do is format our response to our coworker and outline setup and deployment docs. Use response_rough.md which has some intel. specifically, we need to mention the following:

1. Immediate action — API key rotation
2. What was built
3. Issues flagged + solutions
4. How to run locally - step by step guide (non-technical audience)
5. A brief explanation of the repo

---

**Assistant:**

[Read response_rough.md, wrote RESPONSE.md covering all five sections]

---

**User:**

on an npm start i get a 401 error... it also looks like im getting an old model error: model: claude-3-5-sonnet-20241022 — can you update server.js to use a current model

---

**Assistant:**

[Updated MODEL constant in server.js from "claude-3-5-sonnet-20241022" to "claude-sonnet-4-6"]

---

**User:**

that document was broadly well done. it just needed some tonal changes and slight structural changes to account for a non-technical audience. I've added it as a commit, removed the rough version. based on the conversation we've had, the steps we laid out at the start of this discussion, and where our current implementation is, have we missed any of our expected goals?

---

**Assistant:**

Looking back at the original goals and the README's stated deliverables, almost everything is covered. Two things worth flagging:

**TRANSCRIPT.md is missing.** The README lists it as a required deliverable alongside `RESPONSE.md` and the chatbot itself. That's this conversation — you'll need to export it and save it as `TRANSCRIPT.md` before submitting.

**Auth was flagged but not implemented.** This was a conscious call based on the 90-minute assumption — we documented the risk clearly and offered to implement Basic Auth. The RESPONSE.md makes the gap explicit so it doesn't get forgotten pre-deployment.

Everything else from the original brief is done:
- Understood the brief ✓
- Flagged all four specific concerns + three additional ones caught independently ✓
- System prompt rewritten with reference tool framing and policies/ as source of truth ✓
- Secure backend with server-side API key and dynamic policy loading ✓
- Frontend stripped and wired to /api/chat ✓
- Tests covering the four edge cases ✓
- RESPONSE.md written and signed off ✓

The only action item on your side before submitting is the transcript export.

---

**User:**

can you please save an exact .md version of this conversation into that file now?

---

**Assistant:**

[Saving this conversation as TRANSCRIPT.md]
