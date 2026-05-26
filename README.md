# AI Engineer — Take-home Exercise

## About this exercise

In this fictional exercise you've received a message from a non-technical colleague who would like help deploying a prototype they built with LLM assistance. Do your best to deliver on their request while also exercising your judgment.

## The message

> **From:** Sam Whitaker, People Operations
> **Subject:** HR policy chatbot — ready to deploy!
>
> Hiya,
>
> I've built a chatbot that answers common HR questions (holiday entitlement, sickness, probation, notice periods, etc.) by reading our policy docs, and it's getting great results in my testing.
>
> - Claude helped me put it together as a single HTML page — that and the policy docs are attached. But I'm not sure how to roll it out so everyone in the company can use it. Can you assist?
>
> Where we're at:
> - For access, let's just put it on a public URL — something easy for employees to bookmark
> - Should be quick! Employees won't wait around for slow answers
> - I've noted down some of my testing — questions I tried, what it said, and whether I thought that was right
> - I've also attached our HR helpdesk history — should give you a good sense of what employees actually ask
>
> Honestly I think it's mostly there, just needs your engineering polish.
>
> Thanks!
> Sam

## What's in the repo

- `prototype.html` — Sam's working prototype
- `policies/` — HR policy documents
- `testing_notes.md` — Sam's testing observations (questions tried, bot responses, reflections)
- `hr_helpdesk_export.json` — historic helpdesk questions
- `README.md` — this file

## How to work

- **Timebox: 90 minutes.** Do your best in the time available — if you run out of time, just submit where you got to.
- **Use any LLM tool (and model) you like** (Claude.ai, ChatGPT, Cursor, Claude Code, Copilot, etc.).
- **Keep a full, unedited transcript** of your LLM conversation. One continuous thread is ideal — we'll ask you to submit it alongside your work.
- Commit when it feels natural. If anything is genuinely blocking, document an assumption and continue.

## How we'll evaluate

Your LLM transcript is the primary artefact we'll review — surface polish like UI quality isn't part of the assessment.

- **Thoughtfulness over completeness.** A well-reasoned partial solution beats a rushed full one.
- **How you make use of the LLM**, not just what it produces.
- **Your judgement about the brief itself.** If something seems off, say so in your response to Sam — that's part of the work.
- **Your response to Sam.** A required deliverable, not an optional extra.

We'll follow up with an informal chat to talk through your process and any decisions you made along the way.

## Deliverables

Push all of the following to this repo before the deadline:

1. **Your chatbot** — whatever you've built to address Sam's request
2. **`RESPONSE.md`** — your response to Sam
3. **`TRANSCRIPT.md`** — your full, unedited LLM conversation transcript

Good luck, and have fun!
