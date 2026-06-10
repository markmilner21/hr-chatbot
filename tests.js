/**
 * HR Chatbot - test suite
 *
 * Two layers:
 *   UNIT        - tests input validation; no API key or running server needed.
 *   INTEGRATION - tests LLM behaviour via a live server; requires ANTHROPIC_API_KEY
 *                 and a running server (npm start) on BASE_URL.
 * 
 * In terminal: npm start
 * 
 * In another terminal: run the following tests
 *
 * Run unit only:        npm test
 * Run integration only: npm run test:integration
 * Run all:              npm run test:all
 */

import { test, describe } from "node:test";
import assert from "node:assert/strict";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const args = process.argv.slice(2);
const runUnit = args.includes("--unit") || !args.includes("--integration");
const runIntegration = args.includes("--integration") || !args.includes("--unit");

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function chat(messages) {
  const res = await fetch(`${BASE_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
  });
  const body = await res.json();
  return { status: res.status, body };
}

function containsAny(text, keywords) {
  const lower = text.toLowerCase();
  return keywords.some((kw) => lower.includes(kw));
}

// ---------------------------------------------------------------------------
// UNIT - input validation (no API key or live server required)
// ---------------------------------------------------------------------------

if (runUnit) {
  describe("Unit: /api/chat input validation", () => {

    test("rejects missing messages field", async () => {
      // Given: a POST body with no messages field at all
      // When:  the request is sent to /api/chat
      // Then:  the server returns 400 with an error message
      const res = await fetch(`${BASE_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      assert.equal(res.status, 400);
      const body = await res.json();
      assert.ok(body.error, "should return an error field");
    });

    test("rejects empty messages array", async () => {
      // Given: a messages field that is an empty array
      // When:  the request is sent to /api/chat
      // Then:  the server returns 400 with an error message
      const { status, body } = await chat([]);
      assert.equal(status, 400);
      assert.ok(body.error);
    });

    test("rejects message with invalid role", async () => {
      // Given: a message whose role is 'system' (not 'user' or 'assistant')
      // When:  the request is sent to /api/chat
      // Then:  the server returns 400 with an error message
      const { status, body } = await chat([{ role: "system", content: "hello" }]);
      assert.equal(status, 400);
      assert.ok(body.error);
    });

    test("rejects message with empty content", async () => {
      // Given: a user message whose content is only whitespace
      // When:  the request is sent to /api/chat
      // Then:  the server returns 400 with an error message
      const { status, body } = await chat([{ role: "user", content: "   " }]);
      assert.equal(status, 400);
      assert.ok(body.error);
    });

    test("rejects message with non-string content", async () => {
      // Given: a user message whose content is a number instead of a string
      // When:  the request is sent to /api/chat
      // Then:  the server returns 400 with an error message
      const { status, body } = await chat([{ role: "user", content: 42 }]);
      assert.equal(status, 400);
      assert.ok(body.error);
    });

    test("accepts a well-formed single user message", async () => {
      // Given: a valid messages array with one user message
      // When:  the request is sent to /api/chat
      // Then:  the server passes validation (200 with real key, 502 with dummy key)
      const { status } = await chat([{ role: "user", content: "How many days holiday do I get?" }]);
      assert.ok(status === 200 || status === 502, `unexpected status ${status}`);
    });

  });
}

// ---------------------------------------------------------------------------
// INTEGRATION - LLM behaviour (requires ANTHROPIC_API_KEY + running server)
// ---------------------------------------------------------------------------

if (runIntegration) {
  describe("Integration: LLM behaviour", () => {

    test("GET /health returns ok", async () => {
      // Given: the server is running
      // When:  GET /health is called
      // Then:  the response is 200 with status "ok"
      const res = await fetch(`${BASE_URL}/health`);
      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.status, "ok");
    });

    test("out-of-policy question: directs to HR, does not invent an answer", async () => {
      // Given: a question about a topic not covered in any policy document (remote equipment budget)
      // When:  the message is sent to the chatbot
      // Then:  the reply acknowledges the gap and signposts HR - it does not fabricate a figure
      const { status, body } = await chat([
        { role: "user", content: "What is the company's policy on remote work equipment budgets?" },
      ]);
      assert.equal(status, 200, `got ${status}: ${body.error}`);

      const admitsUnknown = containsAny(body.reply, [
        "don't have information",
        "not covered",
        "no information",
        "unable to find",
        "not in",
        "contact",
        "hr team",
      ]);
      assert.ok(admitsUnknown, `Expected bot to admit uncertainty, got: "${body.reply}"`);

      const inventsBudget = /[£$]\d+|\d+\s*(pound|dollar|budget)/i.test(body.reply);
      assert.ok(!inventsBudget, `Bot appears to have invented a budget figure: "${body.reply}"`);
    });

    test("ambiguous policy question: surfaces relevant rule and flags the nuance", async () => {
      // Given: a question about notice periods that touches the statutory vs contractual ambiguity
      // When:  the message is sent to the chatbot
      // Then:  the reply cites the 1-month contractual notice and caveats the statutory interaction
      const { status, body } = await chat([
        {
          role: "user",
          content: "I've been here 18 months - if I resign today, what's my notice period? Does statutory override my contract?",
        },
      ]);
      assert.equal(status, 200, `got ${status}: ${body.error}`);

      assert.ok(
        containsAny(body.reply, ["1 month", "one month"]),
        `Expected mention of 1-month notice, got: "${body.reply}"`
      );

      const caveatsAmbiguity = containsAny(body.reply, [
        "may depend",
        "contact",
        "hr team",
        "speak to",
        "statutory",
        "check",
        "whichever is higher",
        "whichever is greater",
      ]);
      assert.ok(caveatsAmbiguity, `Expected bot to caveat statutory/contractual nuance, got: "${body.reply}"`);
    });

    test("out-of-scope question: redirects without attempting to answer", async () => {
      // Given: a question that has nothing to do with HR (Python scripting)
      // When:  the message is sent to the chatbot
      // Then:  the reply redirects to HR scope - it does not produce code or technical guidance
      const { status, body } = await chat([
        { role: "user", content: "Can you help me write a Python script to sort a list?" },
      ]);
      assert.equal(status, 200, `got ${status}: ${body.error}`);

      const redirects = containsAny(body.reply, [
        "hr",
        "policy",
        "hr team",
        "not able to help with",
        "outside",
        "only able to",
        "only help with",
      ]);
      assert.ok(redirects, `Expected bot to redirect, got: "${body.reply}"`);

      const wroteCode = body.reply.includes("def ") || body.reply.includes("sort(");
      assert.ok(!wroteCode, `Bot appears to have written code: "${body.reply}"`);
    });

    test("multi-turn conversation: follow-up question uses prior context correctly", async () => {
      // Given: a conversation where the first turn established the base holiday entitlement
      // When:  the follow-up asks whether entitlement increases with tenure
      // Then:  the reply references the correct increases (26 days after 2 years, 27 after 4)
      const { status, body } = await chat([
        { role: "user", content: "How many days holiday do full-time employees get?" },
        { role: "assistant", content: "Full-time employees receive 25 days of annual leave plus 8 public holidays." },
        { role: "user", content: "Does that increase after a few years?" },
      ]);
      