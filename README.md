# APEX — Personal Finance Advisor

A free, open-source personal finance advisor built for **Indian investors**. Runs entirely on your machine — your data never leaves your device.

- Track monthly income, expenses, and investments
- Plan financial independence using the **Pattu 30× framework**
- Run **Monte Carlo simulations** on your financial goals
- Analyse insurance coverage gaps
- Upload bank/investment statements and auto-fill fields using **local AI (Gemma 4 via Ollama)** — no cloud, no cost
- Get personalised advisory reports via **Claude AI** (your own API key)

---

## Features

| Module | What it does |
|---|---|
| **Monthly Tracker** | Record salary, expenses, loans, investments; auto-compute net worth, savings rate, DTI |
| **Goal Planner** | Monte Carlo (1 000 runs) probability of reaching each goal; inflation-adjusted targets, step-up SIP |
| **FI Plan** | 30×/35×/40× corpus targets; bucket strategy; progress toward financial independence |
| **Insurance Analyser** | Life cover, health cover, emergency fund, disability — flags gaps against recommended levels |
| **Statement Parser** | Upload PDF or image statements; Gemma 4 extracts salary, balances, and investments locally |
| **AI Advisor** | Personalised advisory reports powered by Claude (requires your API key) |
| **Snapshots** | Point-in-time backups; export/import full data as JSON |

---

## Prerequisites

| Requirement | Version | Notes |
|---|---|---|
| **Node.js** | 18 or later | [nodejs.org](https://nodejs.org) |
| **Ollama** | latest | Required only for statement parsing |
| **Gemma 4 model** | — | Pulled via Ollama |
| **Claude API key** | — | Required only for AI advisory reports |

### Install Ollama and Gemma 4

```bash
# 1. Install Ollama from https://ollama.com
# 2. Pull the Gemma 4 model (~9 GB)
ollama pull gemma4
```

Ollama must be running (`ollama serve`) before you upload statements.

---

## Quick Start

```bash
# Clone the repo
git clone https://github.com/nitiemahendra/APEX.git
cd APEX

# Install dependencies
npm install

# Start the app (Express API + Vite dev server together)
npm run dev
```

Open **http://localhost:5173** in your browser.

> The Express API runs on port 3001 and Vite proxies `/api` requests to it automatically.

---

## Setting Up Your API Key (AI Advisor only)

The statement parser uses **local Gemma 4** — no API key needed.

For the AI advisory reports, you need a **Claude API key**:

1. Get one free at [console.anthropic.com](https://console.anthropic.com)
2. In the app, click the **Settings (⚙)** tab
3. Paste your API key and click **Save**

The key is stored locally in the SQLite database on your machine only.

---

## How It Works

```
Browser (React + Vite)
    │
    │  /api/*  (proxied by Vite in dev, served directly in prod)
    ▼
Express server (port 3001)
    ├── SQLite (apex.db)          ← all your financial data
    ├── POST /api/parse-document  ← Ollama Gemma 4 (local)
    └── GET/POST /api/storage/*   ← key-value store
```

All data is stored in `apex.db` on your machine. Nothing is sent to any server unless you explicitly trigger the Claude AI advisor.

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start both Express server and Vite dev server |
| `npm run server` | Start only the Express API server |
| `npm run frontend` | Start only the Vite dev server |
| `npm run build` | Build the frontend for production |
| `npm run preview` | Preview the production build |

---

## Production Deployment

```bash
# Build the frontend
npm run build

# Serve the built files from Express (add static middleware to server/index.js)
npm run server
```

For a self-hosted setup, point Express to serve `dist/` and run behind nginx or a reverse proxy.

---

## Tech Stack

- **Frontend** — React 18, Vite, Recharts, Lucide React
- **Backend** — Express 5, better-sqlite3
- **AI (local)** — Ollama + Gemma 4 (document parsing)
- **AI (cloud, optional)** — Anthropic Claude (advisory reports)
- **File handling** — multer (upload), pdf-parse (PDF text extraction)

---

## Contributing

Pull requests are welcome. For major changes, open an issue first to discuss what you'd like to change.

1. Fork the repo
2. Create a feature branch (`git checkout -b feat/my-feature`)
3. Commit your changes
4. Push and open a Pull Request

---

## License

[MIT](LICENSE) — free to use, modify, and distribute.
