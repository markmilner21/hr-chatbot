import "dotenv/config";
import express from "express";
import Anthropic from "@anthropic-ai/sdk";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const PORT = process.env.PORT || 3000;
const MODEL = "claude-3-5-sonnet-20241022";
const MAX_TOKENS = 1024;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const POLICIES_DIR = path.join(__dirname, "policies");
const FRONTEND_PATH = path.join(__dirname, "index.html");

// ---------------------------------------------------------------------------
// Load policies once at startup
// ---------------------------------------------------------------------------

function loadPolicies() {
  const files = fs.readdirSync(POLICIES_DIR).filter((f) => f.endsWith(".md"));

  return files
    .map((file) => {
      const name = path.basename(file, ".md").replace(/-/g, " ").toUpperCase();
      const content = fs.readFileSync(path.join(POLICIES_DIR, file), "utf8");
      return `=== ${name} ===\n${content.trim()}`;
    })
    .join("\n\n");
}

const POLICY_CONTEXT = loadPolicies();

// ---------------------------------------------------------------------------
// System prompt
// ---------------------------------------------------------------------------

const SYSTEM_PROMPT = `You are a reference tool for Paluza's HR policies. Your job is to help employees find policy information — you are not an HR advisor and must not give personal guidance or make decisions on behalf of HR.

Guidelines:
- Always quote or closely paraphrase the relevant policy section when answering.
- If the policy is unclear or does not cover the question, say so explicitly — do not fill gaps with assumptions.
- Never invent or extrapolate details. If you are not sure, say "I don't have information on that — please contact people@paluza.com".
- Be conservative with interpretation. When policy is ambiguous, acknowledge it and suggest the employee speak to HR directly.
- Flag anything that is an individual circumstance (e.g. "this may depend on your role or contract — check with people@paluza.com").
- Your tone should be helpful and clear, but honest about your limitations as a policy reference tool.

The following policy documents are your sole source of truth. Do not draw on any information outside of them.

${POLICY_CONTEXT}`;

// ---------------------------------------------------------------------------
// Anthropic client
// ---------------------------------------------------------------------------

if (!process.env.ANTHROPIC_API_KEY) {
  console.error("ERROR: ANTHROPIC_API_KEY is not set. Add it to your .env file.");
  process.exit(1);
}

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ---------------------------------------------------------------------------
// Express app
// ---------------------------------------------------------------------------

const app = express();
app.use(express.json());

// GET /health — basic liveness check
app.get("/health", (_req, res) => {
  res.json({ status: "ok", model: MODEL });
});

// GET / — serve the frontend
app.get("/", (_req, res) => {
  res.sendFile(FRONTEND_PATH);
});

// POST /api/chat — handle a user message
app.post("/api/chat", async (req, res) => {
  const { messages } = req.body;

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "messages array is required" });
  }

  // Basic shape validation — each message needs a role and string content
  const valid = messages.every(
    (m) =>
      (m.role === "user" || m.role === "assistant") &&
      typeof m.content === "string" &&
      m.content.trim().length > 0
  );

  if (!valid) {
    return res.status(400).json({
      error: "Each message must have role ('user'|'assistant') and non-empty string content",
    });
  }

  try {
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: SYSTEM_PROMPT,
      messages,
    });

    const reply = response.content[0]?.text ?? "";
    res.json({ reply });
  } catch (err) {
    console.error("Anthropic API error:", err);
    res.status(502).json({ error: "Failed to get a response. Please try again." });
  }
});

// ---------------------------------------------------------------------------
// Start
// ---------------------------------------------------------------------------

app.listen(PORT, () => {
  console.log(`HR chatbot server running on http://localhost:${PORT}`);
  console.log(`Loaded policies from: ${POLICIES_DIR}`);
});
