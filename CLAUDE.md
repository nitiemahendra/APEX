# APEX — Claude Memory & Session History

## Project Overview
**APEX** is a personal finance advisor web app for Indian investors.
- Single-page React app (`apex-advisor_2.jsx`) — all UI in one JSX file (~3900 lines)
- Vite frontend + Express backend (`server/index.js`) + better-sqlite3 (`apex.db`)
- Deployed on **Render** (`render.yaml` present)
- GitHub: `github.com/nitiemahendra/APEX`
- Run dev: `npm run dev` (concurrently runs Vite + Express on ports 5173 + 3001)

## Tech Stack
- React 18 + Recharts (AreaChart, LineChart, BarChart)
- Lucide-react icons
- Local AI parsing: Ollama + Gemma 4 (replaces Claude PDF API)
- SQLite via better-sqlite3 for persistence
- Light theme UI, Sora + Space Mono fonts

## Architecture
All app logic lives in `apex-advisor_2.jsx`. Tabs render via `if(tab==="...")` guards.

### Tabs
| Tab | Component | Notes |
|-----|-----------|-------|
| dashboard | inline in App | Net worth, goals, FI planner |
| goals | inline in App | GoalCard components, probability ring |
| fi | inline in App | FI planner, bucket strategy |
| insurance | inline in App | Protection score, coverage gaps |
| profile | inline in App | User details, life events |
| update | inline in App | Monthly data entry |
| advisor | inline in App | AI analysis via Claude API |
| history | inline in App | Past entries |
| mfcompare | MFCompareTab | MF performance, events, manager view |
| benchmark | BenchmarkTab | Quant metrics vs benchmark |
| database | inline in App | Export/import, snapshots |

### Key Constants / Data
- `MF_FUNDS` — 50 mutual funds (Large/Mid/Small/Flexi/L&M/Multi-Asset cap)
- `MF_EVENTS` — 13 market events (COVID, IL&FS, demonetization, etc.)
- `BENCHMARKS` — 6 indices (Nifty 50, 500, Midcap 150, Smallcap 250, Next 50, Sensex)
- `APP_MODES` — beginner / intermediate (Investor) / pro
- NAV history generated via `genNavHistory()` (seeded synthetic data, 2015–May 2025)

### Key Components
- `MFCompareTab` — 4 sub-tabs: Performance, By Fund Manager, Market Events, My MF vs Market
- `BenchmarkTab` — 4 sub-tabs: Overview & Metrics, Risk Deep Dive, Active vs Passive, Wealth Forecast
- `BeginnerHealthCard` — plain-language health card shown on dashboard in Beginner mode
- `MFErrorBoundary` — React error boundary wrapping MF tabs
- `AppHeader` — nav tabs + mode switcher + goal amount quick-edit
- `GoalCard`, `GoalRing` — goal tracking UI
- `SettingsModal` — API key, reset options

## State Persistence
All state saved to SQLite via Express REST API (`/api/db`). Keys:
`apex-entries`, `apex-advice`, `apex-profile`, `apex-goals`, `apex-insurance`,
`apex-fiplan`, `apex-goal`, `apex-apikey`, `apex-mode`

## Recent Session History

### 2026-05-29 (Session 1)
- Added **MF Compare** tab (`MFCompareTab`) — 50 funds, 4 sub-tabs, market events overlay, drawdown table, My MF vs Market comparison
- Added **Benchmark** tab (`BenchmarkTab`) — Sharpe, Sortino, Beta, Alpha, Calmar, IR metrics; drawdown charts; rolling returns; active vs passive ER drag; wealth forecast projector
- Added **App Mode switcher** (Beginner / Investor / Pro) persisted via `apex-mode`
- Added `BeginnerHealthCard` on dashboard for Beginner mode
- Added `MF_EVENTS` (13 events) and `MF_FUNDS` (50 funds) data with `genNavHistory()` synthetic NAV
- Added `BENCHMARKS` (6 indices) with `BENCH_NAV`; quant helpers (`bkSharpe`, `bkSortino`, `bkBeta`, `bkAlpha`, etc.)
- Build clean: 783 kB bundle

### 2026-05-29 (Session 2)
- **Mode-gated navigation**: AppHeader now shows only tabs relevant per mode (filter via `modes:[]` array on each tab definition)
  - Beginner: Dashboard, Goals, MF Compare, AI Advisor, Monthly, Profile
  - Investor: + FI Plan, Insurance, Benchmark, History, Database
  - Pro: + Risk Lab
- `changeMode()` resets tab to dashboard if current tab not available in new mode
- **Beginner dashboard suite** (all hidden in Investor/Pro): `BeginnerMarketBeatCard`, `BeginnerRiskThermometer`, `BeginnerAllocationPie`, `BeginnerSIPSimulator`
- FI Number and Protection Score widgets on dashboard now hidden from Beginner mode
- **Pro Risk Lab tab** (`RiskLabTab`): 4 sub-tabs — VaR & CVaR (parametric + historical), Monte Carlo (200-path GBM), Stress Tests (5 scenarios), Fragility Score (4-factor composite)
- `STRESS_SCENARIOS` constant defined at module level (reused by RiskLabTab)
- Build clean: 813 kB bundle, no errors

### 2026-05-29 (Session 3 — QA fixes)
- **C1**: `render.yaml` — added `disk: {name:apex-data, mountPath:/data, sizeGB:1}` + `DB_PATH` env var; `server/index.js` reads `process.env.DB_PATH`; prevents SQLite data loss on Render deploys
- **C2**: Claude API now proxied through `/api/ai` server endpoint; API key never sent from browser; removed `CLAUDE_API`, `MODEL`, `apiHeaders` from frontend; added `anthropic-dangerous-direct-browser-access` header removal
- **C3**: Fixed model ID `claude-sonnet-4-20250514` → `claude-sonnet-4-6` (server-side)
- **C4**: `runAnalysis` now checks `res.ok`, shows actionable error messages (401/429/500) as advice entries; uses `finally` for `setAnalyzing(false)`
- **m13**: Added `healthCheckPath: /api/health` to `render.yaml`
- **M1**: `importDb` wrapped in try/catch; bad JSON file shows error instead of crashing
- **M2/M7**: All DB tab fetch calls (`createSnapshot`, `resetDb`, `restoreSnapshot`, `deleteSnapshot`, `loadDbView`) wrapped in try/catch with user-visible error messages via `setDbMsg`
- **M3**: Monte Carlo now processes one goal per `setTimeout(0)` tick; prevents UI freeze with multiple goals
- **M4**: `renderAdvice` HTML-escapes content before markdown conversion — eliminates XSS vector
- **M5**: RiskLabTab Treynor Ratio now uses real beta (`bkBeta(invRets, niftySlice)`) instead of hardcoded `0.9`
- **M6**: Express CORS restricted to `ALLOWED_ORIGIN` env var in production
- **m1**: Removed 4 unused Recharts imports: `BarChart`, `Bar`, `Cell`, `Legend`
- **m3**: `fmt()` now guards against `NaN` and `Infinity`
- **m6**: AI advice date locale fixed `en-US` → `en-IN` (consistent with rest of app)
- **m7**: `load()`/`persist()` guard against `window.storage` being undefined
- **m8**: `setAnalyzing(false)` moved into `finally` block
- **m11**: `express-rate-limit` added; `/api/ai` limited to 10 req/min per IP
- Build clean: 814 kB bundle, no errors

---
_Instructions for Claude: Update the "Recent Session History" section above at the end of each session with a dated bullet-point summary of what was built, fixed, or decided. Keep entries concise — 3–6 bullets per session._
