import express from "express";
import Database from "better-sqlite3";
import cors from "cors";
import multer from "multer";
import rateLimit from "express-rate-limit";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { PDFParse } from "pdf-parse";

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });

const __dirname = dirname(fileURLToPath(import.meta.url));

// C1: use persistent-disk path in production
const DB_PATH = process.env.DB_PATH || join(__dirname, "..", "apex.db");

const db = new Database(DB_PATH);

db.exec(`
  CREATE TABLE IF NOT EXISTS kv_store (
    key   TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS snapshots (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    month      TEXT NOT NULL,
    data       TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

const app = express();

// M6: restrict CORS to known origin in production
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN;
app.use(cors(
  ALLOWED_ORIGIN
    ? { origin: ALLOWED_ORIGIN, optionsSuccessStatus: 200 }
    : {}
));

app.use(express.json({ limit: "50mb" }));

// ── Key-Value Storage ────────────────────────────────────────────────────────

app.get("/api/storage/:key", (req, res) => {
  const row = db.prepare("SELECT value FROM kv_store WHERE key = ?").get(req.params.key);
  res.json(row ? { value: row.value } : null);
});

app.post("/api/storage/:key", (req, res) => {
  const { value } = req.body;
  db.prepare(`
    INSERT INTO kv_store (key, value, updated_at)
    VALUES (?, ?, datetime('now'))
    ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
  `).run(req.params.key, value);
  res.json({ ok: true });
});

app.delete("/api/storage/:key", (req, res) => {
  db.prepare("DELETE FROM kv_store WHERE key = ?").run(req.params.key);
  res.json({ ok: true });
});

app.get("/api/storage", (req, res) => {
  const rows = db.prepare("SELECT key, updated_at FROM kv_store").all();
  res.json(rows);
});

// ── Health check ─────────────────────────────────────────────────────────────

app.get("/api/health", (_req, res) => {
  const keys = db.prepare("SELECT COUNT(*) as count FROM kv_store").get();
  res.json({ status: "ok", db: DB_PATH, keys: keys.count });
});

// ── Export / Import / Reset ──────────────────────────────────────────────────

app.get("/api/export", (_req, res) => {
  const rows = db.prepare("SELECT key, value, updated_at FROM kv_store").all();
  const out = {};
  for (const r of rows) {
    try { out[r.key] = JSON.parse(r.value); } catch { out[r.key] = r.value; }
  }
  res.setHeader("Content-Disposition", `attachment; filename="apex-backup-${new Date().toISOString().slice(0,10)}.json"`);
  res.json(out);
});

app.post("/api/import", (req, res) => {
  const data = req.body;
  const insert = db.prepare(`
    INSERT INTO kv_store (key, value, updated_at)
    VALUES (?, ?, datetime('now'))
    ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
  `);
  const importAll = db.transaction((entries) => {
    for (const [key, value] of entries) insert.run(key, typeof value === "string" ? value : JSON.stringify(value));
  });
  importAll(Object.entries(data));
  res.json({ ok: true, imported: Object.keys(data).length });
});

app.delete("/api/storage", (_req, res) => {
  db.prepare("DELETE FROM kv_store").run();
  res.json({ ok: true });
});

// ── Snapshots ────────────────────────────────────────────────────────────────

app.get("/api/snapshots", (_req, res) => {
  const rows = db.prepare("SELECT id, month, created_at FROM snapshots ORDER BY id DESC").all();
  res.json(rows);
});

app.post("/api/snapshots", (req, res) => {
  const { label } = req.body;
  const rows = db.prepare("SELECT key, value FROM kv_store").all();
  const result = db.prepare("INSERT INTO snapshots (month, data) VALUES (?, ?)").run(
    label || new Date().toISOString().slice(0, 10),
    JSON.stringify(rows)
  );
  res.json({ ok: true, id: result.lastInsertRowid });
});

app.post("/api/snapshots/:id/restore", (req, res) => {
  const row = db.prepare("SELECT data FROM snapshots WHERE id = ?").get(req.params.id);
  if (!row) return res.status(404).json({ error: "Not found" });
  const entries = JSON.parse(row.data);
  const restore = db.transaction(() => {
    db.prepare("DELETE FROM kv_store").run();
    const ins = db.prepare("INSERT INTO kv_store (key, value) VALUES (?, ?)");
    for (const { key, value } of entries) ins.run(key, value);
  });
  restore();
  res.json({ ok: true, restored: entries.length });
});

app.delete("/api/snapshots/:id", (req, res) => {
  db.prepare("DELETE FROM snapshots WHERE id = ?").run(req.params.id);
  res.json({ ok: true });
});

// ── C2: Claude AI Proxy ───────────────────────────────────────────────────────
// API key never leaves the server — removed from browser entirely.

// m11: rate-limit AI endpoint (10 requests / minute)
const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many AI requests. Please wait a moment and try again." },
});

app.post("/api/ai", aiLimiter, async (req, res) => {
  try {
    const { messages, max_tokens = 1200 } = req.body;
    if (!messages?.length) return res.status(400).json({ error: "messages required" });

    // Read key stored by the user via Settings UI
    const row = db.prepare("SELECT value FROM kv_store WHERE key = ?").get("apex-apikey");
    const apiKey = row ? JSON.parse(row.value) : null;

    if (!apiKey) {
      return res.status(401).json({
        error: "No API key configured. Add your Claude API key in Settings (⚙ icon, top-right).",
      });
    }

    const upstream = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens, messages }),
    });

    const data = await upstream.json();

    if (!upstream.ok) {
      const msg = data?.error?.message || `Anthropic API error ${upstream.status}`;
      return res.status(upstream.status).json({ error: msg });
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Document parsing via local Gemma 4 (Ollama) ──────────────────────────────

const EXTRACT_PROMPT = `You are a financial data extractor for Indian investors. Analyze this document and extract all financial data you can find.
Return ONLY valid JSON with these fields (use 0 for fields not found):
{"salary":0,"totalExpenses":0,"bankBalance":0,"emiTotal":0,"equity":0,"mutualFunds":0,"epf":0,"nps":0,"ppf":0,"fd":0,"sgb":0,"gold":0,"realEstate":0,"netWorth":0,"notes":""}
Field guide:
- salary/totalExpenses/bankBalance/emiTotal: from bank statements
- equity: total value of stocks/shares (CDSL/NSDL demat statements)
- mutualFunds: total mutual fund NAV value (CAS/MF statements)
- epf: EPF/PF corpus (EPFO passbook)
- nps: NPS Tier-1 balance
- ppf: PPF account balance
- fd: fixed deposit total
- sgb: sovereign gold bonds value
- gold: physical gold / gold ETF
- realEstate: property valuation if stated
- netWorth: total portfolio value if a summary page is present
- notes: ONE sentence: document type + key number found
All amounts in INR. Be precise with numbers from the document.`;

function extractJson(text) {
  const fenced = text.match(/```json\s*([\s\S]*?)```/);
  if (fenced) { try { return JSON.parse(fenced[1].trim()); } catch {} }
  const obj = text.match(/\{[\s\S]*\}/);
  if (obj) { try { return JSON.parse(obj[0]); } catch {} }
  return {};
}

app.post("/api/parse-document", upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  const { buffer, mimetype } = req.file;

  try {
    let ollamaBody;

    if (mimetype === "application/pdf") {
      const parser = new PDFParse({ data: buffer });
      await parser.load();
      const pdfText = (await parser.getText()).text.slice(0, 12000);
      ollamaBody = {
        model: "gemma4",
        messages: [{ role: "user", content: `${EXTRACT_PROMPT}\n\n---DOCUMENT TEXT---\n${pdfText}` }],
        stream: false,
      };
    } else {
      const b64 = buffer.toString("base64");
      ollamaBody = {
        model: "gemma4",
        messages: [{ role: "user", content: EXTRACT_PROMPT, images: [b64] }],
        stream: false,
      };
    }

    const ollamaRes = await fetch("http://localhost:11434/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(ollamaBody),
    });

    if (!ollamaRes.ok) {
      const err = await ollamaRes.text();
      return res.status(502).json({ error: `Ollama error: ${err}` });
    }

    const result = await ollamaRes.json();
    const raw = result.message?.content || "{}";
    const parsed = extractJson(raw);
    res.json({ parsed });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Serve built frontend in production ───────────────────────────────────────

const DIST = join(__dirname, "../dist");
app.use(express.static(DIST));
app.get(/^(?!\/api).*/, (_req, res) => res.sendFile(join(DIST, "index.html")));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`APEX server  →  http://localhost:${PORT}`);
  console.log(`Database     →  ${DB_PATH}`);
});
