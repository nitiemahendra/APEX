import { useState, useEffect, useRef } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import {
  TrendingUp, AlertTriangle, Brain, UploadCloud, DollarSign,
  CreditCard, Wallet, ChevronRight, ChevronDown, Loader, Target, Zap,
  BarChart3, History, Plus, Save, CheckCircle,
  User, Users, Calendar, Trash2, Flag,
  BookOpen, Home, Sun, Plane, Shield, Briefcase, Heart, Star, Sigma,
  Umbrella, Activity, AlertOctagon, TrendingDown,
  Settings, RotateCcw, X as XIcon
} from "lucide-react";

const DEFAULT_GOAL = 1_000_000;
const CLAUDE_API = "https://api.anthropic.com/v1/messages";
const MODEL      = "claude-sonnet-4-20250514";
const CUR_YEAR   = new Date().getFullYear();
const MC_SIMS    = 500;

// ── Storage ───────────────────────────────────────────────────────────────────
async function load(key) {
  try { const r = await window.storage.get(key); return r ? JSON.parse(r.value) : null; } catch { return null; }
}
async function persist(key, val) { try { await window.storage.set(key, JSON.stringify(val)); } catch {} }

// ── Pure math ─────────────────────────────────────────────────────────────────
function calcInflated(amount, inflRate, years) {
  return amount * Math.pow(1 + inflRate / 100, Math.max(0, years));
}
function goalVol(ret) { return ret < 10 ? 6 : ret < 14 ? 12 : 20; }

function monteCarlo(corpus, monthly, target, years, annRet, annVol) {
  if (years <= 0) return corpus >= target ? 100 : 0;
  const n = Math.round(years * 12);
  const mu = annRet / 12 / 100, sigma = annVol / Math.sqrt(12) / 100;
  let hits = 0;
  for (let i = 0; i < MC_SIMS; i++) {
    let v = corpus;
    for (let m = 0; m < n; m++) {
      const u1 = Math.max(Math.random(), 1e-10), u2 = Math.random();
      const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
      v = v * (1 + mu + z * sigma) + monthly;
    }
    if (v >= target) hits++;
  }
  return Math.round((hits / MC_SIMS) * 100);
}

function monthlyNeeded(corpus, target, years, annRet) {
  if (years <= 0) return 0;
  const n = years * 12, r = annRet / 12 / 100;
  if (r === 0) return Math.max(0, (target - corpus) / n);
  const f = Math.pow(1 + r, n);
  return Math.max(0, (target - corpus * f) * r / (f - 1));
}

// ── Formatters ────────────────────────────────────────────────────────────────
function monthKey() { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`; }
function fmtML(key) { const [y,m]=key.split("-"); return new Date(+y,+m-1,1).toLocaleDateString("en-US",{month:"short",year:"numeric"}); }
function fmt(n) {
  if (!n && n!==0) return "$0";
  if (n>=1e6) return `$${(n/1e6).toFixed(2)}M`;
  if (n>=1e3) return `$${(n/1e3).toFixed(0)}K`;
  return `$${Math.round(n).toLocaleString()}`;
}
function initials(name) { if(!name) return "?"; return name.trim().split(/\s+/).map(w=>w[0]).slice(0,2).join("").toUpperCase(); }

// ── Config ────────────────────────────────────────────────────────────────────
const RISK_OPTIONS = [
  { id:"conservative", label:"Conservative", desc:"Capital preservation", detail:"Debt/FD heavy · 7–10% returns", color:"#4a9eff", bg:"rgba(74,158,255,.08)", border:"rgba(74,158,255,.4)", ret:8  },
  { id:"moderate",     label:"Moderate",     desc:"Balanced growth",     detail:"60% equity / 40% debt · 11–14%", color:"#c9a84c", bg:"rgba(201,168,76,.08)", border:"rgba(201,168,76,.4)", ret:12 },
  { id:"aggressive",   label:"Aggressive",   desc:"Maximum growth",      detail:"80%+ equity · 14–18% returns",   color:"#00d4a4", bg:"rgba(0,212,164,.08)", border:"rgba(0,212,164,.4)", ret:16 },
];
const GOAL_CATS = {
  education: { label:"Education",    Icon:BookOpen,  color:"#7f77dd", bg:"rgba(127,119,221,.14)" },
  home:      { label:"Home",         Icon:Home,      color:"#c9a84c", bg:"rgba(201,168,76,.14)"  },
  retirement:{ label:"Retirement",   Icon:Sun,       color:"#00d4a4", bg:"rgba(0,212,164,.14)"   },
  travel:    { label:"Travel",       Icon:Plane,     color:"#4a9eff", bg:"rgba(74,158,255,.14)"  },
  emergency: { label:"Emergency",    Icon:Shield,    color:"#ff8c42", bg:"rgba(255,140,66,.14)"  },
  business:  { label:"Business",     Icon:Briefcase, color:"#d4537e", bg:"rgba(212,83,126,.14)"  },
  wedding:   { label:"Wedding",      Icon:Heart,     color:"#f07090", bg:"rgba(240,112,144,.14)" },
  custom:    { label:"Custom",       Icon:Star,      color:"#8aa0be", bg:"rgba(138,160,190,.14)" },
};
const PROB_CONFIG = [
  { min:75, color:"#00d4a4", bg:"rgba(0,212,164,.1)",  label:"On track"  },
  { min:50, color:"#c9a84c", bg:"rgba(201,168,76,.1)", label:"Possible"  },
  { min:25, color:"#ff8c42", bg:"rgba(255,140,66,.1)", label:"At risk"   },
  { min:0,  color:"#ff5252", bg:"rgba(255,82,82,.1)",  label:"Unlikely"  },
];
function probCfg(p) { return PROB_CONFIG.find(c => p >= c.min) || PROB_CONFIG[3]; }

// ── Defaults ──────────────────────────────────────────────────────────────────
function defaultEntry() {
  const id = monthKey();
  return { id, label:fmtML(id), netWorth:0, bankBalance:0,
    investments:{equity:0,mutualFunds:0,realEstate:0,gold:0,crypto:0,epf:0},
    loans:{home:0,personal:0,vehicle:0,education:0},
    income:{salary:0,business:0,rental:0,dividends:0},
    expenses:{essentials:0,discretionary:0,emi:0},
    notes:"", createdAt:new Date().toISOString() };
}
function defaultProfile() {
  return { name:"", age:"", retirementAge:60, riskAppetite:"moderate", dependents:{spouse:false,children:0,parents:0}, lifeEvents:[] };
}
function defaultGoal(riskAppetite="moderate") {
  const ret = RISK_OPTIONS.find(r=>r.id===riskAppetite)?.ret || 12;
  return { id:0, name:"", category:"custom", targetAmount:0, targetYear:CUR_YEAR+10,
    currentCorpus:0, monthlyContrib:0, inflationRate:6, expectedReturn:ret, priority:"medium", notes:"" };
}

function defaultInsurance() {
  return {
    // Life cover
    termLifeCover:0, otherLifeCover:0,
    // Health cover
    healthSelf:0, healthFamily:0, criticalIllness:0, superTopUp:0,
    // Disability
    disabilityMonthly:0, groupDisability:false,
    // Emergency fund
    emergencyAmount:0,
    // Credit score
    creditScore:0, creditScoreDate:"",
  };
}

// ── Insurance adequacy engine ─────────────────────────────────────────────────
function calcProtection(ins, profile, metrics) {
  const annualIncome = metrics ? metrics.totalIncome * 12 : 0;
  const monthlyExp   = metrics ? metrics.totalExp : 0;
  const hasDep = profile.dependents.spouse || profile.dependents.children > 0 || profile.dependents.parents > 0;

  // Life cover
  const recLife = annualIncome * (hasDep ? 15 : 10);
  const curLife = ins.termLifeCover + ins.otherLifeCover;
  const lifeScore = recLife > 0 ? Math.min(100, Math.round((curLife / recLife) * 100)) : (curLife > 0 ? 100 : 0);
  const lifeGap   = Math.max(0, recLife - curLife);

  // Health cover
  const recHealth = hasDep ? 30000 : 12000; // USD
  const curHealth = ins.healthSelf + ins.healthFamily + ins.criticalIllness + ins.superTopUp;
  const healthScore = Math.min(100, Math.round((curHealth / recHealth) * 100));
  const healthGap   = Math.max(0, recHealth - curHealth);

  // Emergency fund (target 6× monthly expenses)
  const recEmergency = monthlyExp * 6;
  const emScore  = recEmergency > 0 ? Math.min(100, Math.round((ins.emergencyAmount / recEmergency) * 100)) : 0;
  const emMonths = monthlyExp > 0 ? ins.emergencyAmount / monthlyExp : 0;
  const emGap    = Math.max(0, recEmergency - ins.emergencyAmount);

  // Disability cover (target: replace 12 months of expenses)
  const recDis = monthlyExp * 12;
  const curDis = ins.disabilityMonthly * 12 + (ins.groupDisability ? monthlyExp * 6 : 0);
  const disScore = recDis > 0 ? Math.min(100, Math.round((curDis / recDis) * 100)) : (ins.groupDisability ? 50 : 0);

  // Credit score (CIBIL 300–900 → 0–100 normalised)
  const creditNorm = ins.creditScore > 0 ? Math.min(100, Math.round(((ins.creditScore - 300) / 600) * 100)) : 0;
  const creditLabel = ins.creditScore >= 750 ? "Excellent" : ins.creditScore >= 700 ? "Good" : ins.creditScore >= 650 ? "Fair" : ins.creditScore > 0 ? "Poor" : "Not recorded";
  const creditColor = ins.creditScore >= 750 ? "#00d4a4" : ins.creditScore >= 700 ? "#c9a84c" : ins.creditScore >= 650 ? "#ff8c42" : "#ff5252";

  // Weighted overall protection score
  const overall = Math.round(lifeScore*0.35 + healthScore*0.30 + emScore*0.20 + disScore*0.10 + creditNorm*0.05);

  const overallCfg = overall>=80?{color:"#00d4a4",label:"Well Protected"}:overall>=60?{color:"#c9a84c",label:"Partially Protected"}:overall>=40?{color:"#ff8c42",label:"Gaps Present"}:{color:"#ff5252",label:"Critical Gaps"};

  return {
    overall, overallCfg,
    lifeScore, curLife, recLife, lifeGap, hasDep, annualIncome,
    healthScore, curHealth, recHealth, healthGap,
    emScore, emMonths, recEmergency, emGap,
    disScore, curDis, recDis,
    creditNorm, creditLabel, creditColor,
  };
}

// ── Pattu FI Framework ────────────────────────────────────────────────────────
const PATTU_INSIGHTS = [
  { tag:"Corpus",    color:"#c9a84c", title:"The 30× FI Formula",
    body:"Essential annual expenses at retirement × 30 = FI corpus. Year-1 withdrawal rate = 3.33% — NOT the US 4% rule, and it's NOT constant. The draw rises with inflation each year. 35×–40× = comfortable FI." },
  { tag:"Inflation", color:"#ff8c42", title:"Use 7–8% Lifestyle Inflation",
    body:"Government CPI ~4% is dal-chawal inflation. Your lifestyle runs at 7% annually, or 8% if you're a big spender. Using 4% will make your corpus catastrophically short. Build the plan on 7% minimum." },
  { tag:"Savings",   color:"#00d4a4", title:"Benchmark to Expenses, Not Salary",
    body:"'Save 20% of salary' is a 20s mindset. From your 30s onward, invest ≥50% of essential expenses (including EPF/NPS). With a home loan: at least 20–30%. Redo the calculation every year — expenses change." },
  { tag:"Rebalance", color:"#7f77dd", title:"Rebalance at 5% Drift — Not Annually",
    body:"Don't rebalance on a calendar. Trigger only when allocation drifts >5%. Strongest signal: an asset class has had a big run. Lock in the gain. Don't let tax aversion paralyse you — 'Loss is a mindset in finance.'" },
  { tag:"Bucket",    color:"#4a9eff", title:"Bucket Strategy: Behavioral, Not Optimal",
    body:"Bucket 1: 2–3y expenses in pure fixed income (sleep-well bucket). Bucket 2: balanced advantage ~20% equity. Bucket 3: Nifty 50 / flexi-cap. Not more efficient in raw returns — but knowing Bucket 1 is safe lets you ignore market noise." },
  { tag:"Risk",      color:"#ff5252", title:"The Small-Cap Trap",
    body:"'I have the risk appetite' is mostly theoretical. Pattu, with 17 years invested, honestly doesn't know how he'd behave in a sustained bear market. Style-pure small-cap funds barely existed before 2018 SEBI categorisation — long track records mislead." },
  { tag:"Late Start",color:"#d4537e", title:"Starting Late (45+)?",
    body:"Three priorities: lock in serious health insurance immediately (you won't qualify later), protect physical health, and plan a second career. Extending earning years is far more powerful than chasing higher returns." },
  { tag:"Mindset",   color:"#00d4a4", title:"The Real Driver of FI",
    body:"Pattu hit FI accidentally ~10–12 years after starting. The driver wasn't returns — it was a lifestyle that didn't inflate with net worth. 'Our lifestyle doesn't reflect our net worth, and that's important to stay rich.'" },
];

function defaultFIPlan() {
  return {
    essentialMonthly:  0,    // today's essential expenses: couple only, no EMI/kids/parents
    inflationRate:     7,    // lifestyle inflation (7% standard, 8% big spender)
    yearsToRetirement: 15,
    fiMultiple:        30,   // 30 = FI, 35 = comfortable, 40 = true FI
    targetEquityPct:   60,   // target equity % for rebalancing check
    lastRebalanced:    "",
    bucket1Months:     30,   // months of expenses in Bucket 1
  };
}

function calcFIPlan(plan, netWorth) {
  if (!plan.essentialMonthly) return null;
  const inflatedAnnual = plan.essentialMonthly * 12 * Math.pow(1 + plan.inflationRate / 100, plan.yearsToRetirement);
  const fi30 = inflatedAnnual * 30, fi35 = inflatedAnnual * 35, fi40 = inflatedAnnual * 40;
  const prog30 = fi30 > 0 ? Math.min((netWorth / fi30) * 100, 150) : 0;
  return {
    inflatedAnnual, fi30, fi35, fi40,
    prog30, gap30: Math.max(0, fi30 - netWorth),
    withdrawalRate: fi30 > 0 ? (inflatedAnnual / fi30) * 100 : 3.33,
    bucket1Amount: inflatedAnnual * (plan.bucket1Months / 12),
  };
}

function checkRebalancing(investments, targetPct) {
  const equity = (investments.equity||0) + (investments.mutualFunds||0) + (investments.crypto||0);
  const total  = Object.values(investments).reduce((a,b)=>a+(b||0), 0);
  const cur    = total > 0 ? (equity / total) * 100 : 0;
  const drift  = cur - targetPct;
  return { cur, drift, abs: Math.abs(drift), needsRebalancing: Math.abs(drift) > 5 };
}
function calcMetrics(entries, goalAmount = DEFAULT_GOAL) {
  if (!entries.length) return null;
  const l=entries[entries.length-1], p=entries.length>1?entries[entries.length-2]:null;
  const totalInv=Object.values(l.investments).reduce((a,b)=>a+b,0);
  const totalLoans=Object.values(l.loans).reduce((a,b)=>a+b,0);
  const totalIncome=Object.values(l.income).reduce((a,b)=>a+b,0);
  const totalExp=Object.values(l.expenses).reduce((a,b)=>a+b,0);
  const monthlySavings=totalIncome-totalExp;
  const savingsRate=totalIncome>0?(monthlySavings/totalIncome)*100:0;
  const gap=goalAmount-l.netWorth;
  const monthlyGrowth=p?l.netWorth-p.netWorth:monthlySavings;
  const monthsToGoal=monthlyGrowth>0?Math.ceil(gap/monthlyGrowth):null;
  const progress=Math.min((l.netWorth/goalAmount)*100,100);
  const dti=totalIncome>0?(totalLoans/(totalIncome*12))*100:0;
  return {netWorth:l.netWorth,totalInv,totalLoans,totalIncome,totalExp,monthlySavings,savingsRate,gap,monthlyGrowth,monthsToGoal,progress,dti};
}
function eventUrgency(year) { const y=year-CUR_YEAR; return y<=2?{color:"#ff5252",label:"Urgent"}:y<=5?{color:"#c9a84c",label:"Soon"}:{color:"#00d4a4",label:"Planned"}; }
function profileCompleteness(p) { let s=0; if(p.name)s++;if(p.age)s++;if(p.retirementAge)s++;if(p.riskAppetite)s++;if(p.lifeEvents.length>0)s++; return Math.round(s/5*100); }

// ── CSS ───────────────────────────────────────────────────────────────────────
function useStyles() {
  useEffect(() => {
    if (document.getElementById("apex-css")) return;
    const el = document.createElement("style"); el.id="apex-css";
    el.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&display=swap');
      .apex*{box-sizing:border-box;margin:0;padding:0}
      .apex{font-family:'Sora',sans-serif;background:#05091a;color:#dde3f0;min-height:100vh}
      .ax-card{background:#0b1628;border:1px solid #1a2e4a;border-radius:12px;padding:18px}
      .ax-btn{background:transparent;border:1px solid #1a2e4a;color:#dde3f0;padding:8px 15px;border-radius:8px;cursor:pointer;font-family:'Sora',sans-serif;font-size:12px;font-weight:500;transition:all .15s;display:inline-flex;align-items:center;gap:6px}
      .ax-btn:hover{border-color:#c9a84c;color:#c9a84c}
      .ax-btn:disabled{opacity:.4;cursor:not-allowed}
      .ax-btn.primary{background:#c9a84c;border-color:#c9a84c;color:#05091a;font-weight:700}
      .ax-btn.primary:hover:not(:disabled){background:#d4b862}
      .ax-btn.del{border-color:#ff5252;color:#ff5252;padding:7px 10px}
      .ax-btn.del:hover{background:rgba(255,82,82,.08)}
      .ax-input{background:#080f1e;border:1px solid #1a2e4a;color:#dde3f0;padding:8px 11px;border-radius:8px;font-family:'Sora',sans-serif;font-size:12px;width:100%;transition:border-color .15s}
      .ax-input:focus{outline:none;border-color:#c9a84c}
      .ax-input::placeholder{color:#2e4560}
      .ax-label{font-size:10px;font-weight:600;color:#3d5a7a;text-transform:uppercase;letter-spacing:.08em;margin-bottom:5px;display:block}
      .ax-tab{background:transparent;border:none;border-bottom:2px solid transparent;color:#3d5a7a;padding:10px 13px;cursor:pointer;font-family:'Sora',sans-serif;font-size:12px;font-weight:500;transition:all .15s;display:flex;align-items:center;gap:5px;white-space:nowrap}
      .ax-tab:hover{color:#dde3f0}
      .ax-tab.active{color:#c9a84c;border-bottom-color:#c9a84c}
      .ax-mono{font-family:'Space Mono',monospace}
      .ax-gold{color:#c9a84c}.ax-green{color:#00d4a4}.ax-red{color:#ff5252}.ax-dim{color:#3d5a7a}
      .ax-sec{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:#3d5a7a;margin-bottom:10px;display:flex;align-items:center;gap:6px}
      .frow{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px}
      .ax-alert{border-left:3px solid #ff5252;background:rgba(255,82,82,.07);border-radius:0 8px 8px 0;padding:10px 14px;font-size:12px;line-height:1.5}
      .ax-advice{background:#080f1e;border:1px solid #1a2e4a;border-radius:10px;padding:18px;font-size:12.5px;line-height:1.8;color:#b8cce0;white-space:pre-wrap}
      .ax-advice strong{color:#c9a84c;font-weight:600}
      .ax-divider{border:none;border-top:1px solid #1a2e4a;margin:14px 0}
      .drop-zone{border:1px dashed #1a2e4a;border-radius:10px;padding:22px;text-align:center;cursor:pointer;transition:border-color .15s}
      .drop-zone:hover{border-color:#c9a84c}
      .risk-btn{flex:1;min-width:140px;padding:14px 12px;border-radius:10px;cursor:pointer;text-align:left;transition:all .2s;font-family:'Sora',sans-serif}
      .toggle-row{display:flex;align-items:center;gap:10px;padding:11px 14px;background:#080f1e;border:1px solid #1a2e4a;border-radius:9px;cursor:pointer;transition:border-color .15s;user-select:none}
      .toggle-row:hover{border-color:#2a4060}
      .toggle-track{width:32px;height:18px;border-radius:9px;background:#1a2e4a;position:relative;transition:background .2s;flex-shrink:0}
      .toggle-track.on{background:#c9a84c}
      .toggle-knob{position:absolute;top:2px;left:2px;width:14px;height:14px;border-radius:50%;background:#dde3f0;transition:transform .2s}
      .toggle-track.on .toggle-knob{transform:translateX(14px)}
      .stepbtn{width:26px;height:26px;border-radius:6px;border:1px solid #1a2e4a;background:#080f1e;color:#dde3f0;cursor:pointer;font-size:15px;display:flex;align-items:center;justify-content:center;transition:all .15s;line-height:1}
      .stepbtn:hover{border-color:#c9a84c;color:#c9a84c}
      .ev-row{display:grid;grid-template-columns:1fr 80px 100px 30px;gap:8px;align-items:center;padding:9px 12px;background:#080f1e;border:1px solid #1a2e4a;border-radius:9px}
      .avatar{border-radius:12px;background:linear-gradient(135deg,#1a3a6a,#0d2040);border:1px solid #2a4a7a;display:flex;align-items:center;justify-content:center;font-family:'Space Mono',monospace;font-weight:700;color:#c9a84c;flex-shrink:0}
      .pbar{height:3px;border-radius:2px;background:#1a2e4a;overflow:hidden}
      .pbar-fill{height:100%;border-radius:2px;background:#c9a84c;transition:width .6s ease}
      .ev-badge{display:inline-flex;align-items:center;gap:3px;font-size:10px;font-weight:600;padding:2px 7px;border-radius:4px}
      .goal-card{background:#0b1628;border:1px solid #1a2e4a;border-radius:12px;overflow:hidden;transition:border-color .15s}
      .goal-card:hover{border-color:#2a4060}
      .goal-card.expanded{border-color:#c9a84c}
      .goal-progress{height:4px;border-radius:2px;background:#1a2e4a;overflow:hidden;margin:8px 0}
      .goal-progress-fill{height:100%;border-radius:2px;transition:width .8s cubic-bezier(.4,0,.2,1)}
      .prob-ring-track{fill:none;stroke:#1a2e4a}
      .prob-ring-fill{fill:none;stroke-linecap:round;transition:stroke-dasharray 1s cubic-bezier(.4,0,.2,1)}
      .alloc-seg{height:100%;display:inline-block;transition:width .6s ease}
      .priority-dot{width:6px;height:6px;border-radius:50%;flex-shrink:0}
      /* ── Insurance module ── */
      .ins-card{background:#0b1628;border:1px solid #1a2e4a;border-radius:12px;padding:18px;display:flex;flex-direction:column;gap:12px}
      .ins-bar-track{height:7px;border-radius:4px;background:#1a2e4a;overflow:hidden;position:relative}
      .ins-bar-fill{height:100%;border-radius:4px;transition:width .9s cubic-bezier(.4,0,.2,1)}
      .ins-status{display:inline-flex;align-items:center;gap:4px;font-size:10px;font-weight:700;padding:2px 9px;border-radius:5px;letter-spacing:.04em}
      .credit-track{height:8px;border-radius:4px;background:linear-gradient(to right,#ff5252 0%,#ff8c42 25%,#c9a84c 50%,#00d4a4 100%);position:relative}
      .credit-pin{position:absolute;top:-4px;width:4px;height:16px;border-radius:2px;background:#fff;transform:translateX(-50%)}
      .prot-score-ring{filter:drop-shadow(0 0 12px currentColor)}
      /* ── FI Planner ── */
      .fi-multiple-btn{flex:1;padding:10px 8px;border-radius:9px;border:1px solid #1a2e4a;background:#080f1e;cursor:pointer;text-align:center;transition:all .2s;font-family:'Sora',sans-serif}
      .fi-multiple-btn:hover{border-color:#2a4060}
      .insight-card{border-left:3px solid;border-radius:0 10px 10px 0;padding:12px 14px;background:#080f1e;display:flex;flex-direction:column;gap:5px}
      .insight-tag{font-size:9px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;padding:1px 6px;border-radius:3px}
      .bucket-lane{border:1px solid #1a2e4a;border-radius:10px;padding:14px;display:flex;flex-direction:column;gap:8px;background:#080f1e}
      /* ── Settings modal ── */
      .settings-overlay{position:fixed;inset:0;background:rgba(5,9,26,.88);z-index:999;display:flex;align-items:center;justify-content:center;padding:20px}
      .settings-panel{background:#0b1628;border:1px solid #1a2e4a;border-radius:16px;width:100%;max-width:460px;max-height:85vh;overflow-y:auto}
      .settings-section{padding:18px 20px;border-bottom:1px solid #1a2e4a}
      .settings-section:last-child{border-bottom:none}
      .reset-btn{width:100%;background:#080f1e;border:1px solid #1a2e4a;color:#dde3f0;padding:12px 14px;border-radius:9px;cursor:pointer;text-align:left;font-family:'Sora',sans-serif;font-size:12px;transition:all .15s;display:flex;align-items:center;gap:10px}
      .reset-btn:hover{border-color:#ff5252}
      .reset-btn.danger{border-color:#ff525260;background:rgba(255,82,82,.04)}
      .reset-btn.danger:hover{border-color:#ff5252;background:rgba(255,82,82,.1)}
      .confirm-box{background:rgba(255,82,82,.07);border:1px solid rgba(255,82,82,.3);border-radius:10px;padding:14px;margin-top:10px}
      @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
      .spinning{animation:spin 1s linear infinite}
      @keyframes mc-pulse{0%,100%{opacity:.7}50%{opacity:1}}
      .mc-running{animation:mc-pulse .8s ease-in-out infinite}
    `;
    document.head.appendChild(el);
  }, []);
}

// ── Shared UI pieces ──────────────────────────────────────────────────────────
function GoalRing({ progress }) {
  const r=68, c=2*Math.PI*r, dash=c*Math.min(progress/100,1);
  return (
    <svg width="170" height="170" viewBox="0 0 170 170">
      <defs><linearGradient id="gr1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#c9a84c"/><stop offset="100%" stopColor="#f0c97a"/>
      </linearGradient></defs>
      <circle cx="85" cy="85" r={r} fill="none" stroke="#1a2e4a" strokeWidth="10"/>
      <circle cx="85" cy="85" r={r} fill="none" stroke="url(#gr1)" strokeWidth="10"
        strokeDasharray={`${dash} ${c}`} strokeLinecap="round" transform="rotate(-90 85 85)"
        style={{transition:"stroke-dasharray 1.4s cubic-bezier(.4,0,.2,1)"}}/>
      <text x="85" y="80" textAnchor="middle" fill="#c9a84c" fontFamily="'Space Mono',monospace" fontWeight="700" fontSize="15">{progress.toFixed(1)}%</text>
      <text x="85" y="98" textAnchor="middle" fill="#3d5a7a" fontFamily="'Sora',sans-serif" fontSize="9.5">of $1M goal</text>
    </svg>
  );
}

function ProbRing({ prob, size=70 }) {
  const cfg = probCfg(prob);
  const r=(size-8)/2, c=2*Math.PI*r, dash=c*(prob/100);
  const cx=size/2;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cx} r={r} className="prob-ring-track" strokeWidth="5"/>
      <circle cx={cx} cy={cx} r={r} className="prob-ring-fill" stroke={cfg.color} strokeWidth="5"
        strokeDasharray={`${dash} ${c}`} transform={`rotate(-90 ${cx} ${cx})`}/>
      <text x={cx} y={cx-4} textAnchor="middle" fill={cfg.color} fontFamily="'Space Mono',monospace" fontWeight="700" fontSize={prob>=100?"11":"12"}>{prob}%</text>
      <text x={cx} y={cx+8} textAnchor="middle" fill={cfg.color} fontFamily="'Sora',sans-serif" fontSize="7" opacity=".8">{cfg.label}</text>
    </svg>
  );
}

function MetricCard({ label, value, sub, color }) {
  return (
    <div className="ax-card" style={{flex:1,minWidth:130}}>
      <div className="ax-label">{label}</div>
      <div className="ax-mono" style={{fontSize:20,fontWeight:700,color:color||"#dde3f0",lineHeight:1.2}}>{value}</div>
      {sub && <div style={{fontSize:10,color:"#3d5a7a",marginTop:3}}>{sub}</div>}
    </div>
  );
}

function Field({ label, value, onChange, type="number" }) {
  return (
    <div>
      <label className="ax-label">{label}</label>
      <input className="ax-input" type={type} min="0" value={value||""} onChange={e=>onChange(type==="number"?(parseFloat(e.target.value)||0):e.target.value)} placeholder={type==="number"?"0":""}/>
    </div>
  );
}

function Stepper({ value, onChange, min=0, max=10 }) {
  return (
    <div style={{display:"flex",alignItems:"center",gap:8}}>
      <button className="stepbtn" onClick={()=>onChange(Math.max(min,value-1))}>−</button>
      <span className="ax-mono" style={{fontSize:16,fontWeight:700,minWidth:22,textAlign:"center"}}>{value}</span>
      <button className="stepbtn" onClick={()=>onChange(Math.min(max,value+1))}>+</button>
    </div>
  );
}

function Toggle({ value, onChange, label, sub }) {
  return (
    <div className="toggle-row" onClick={()=>onChange(!value)}>
      <div className={`toggle-track ${value?"on":""}`}><div className="toggle-knob"/></div>
      <div>
        <div style={{fontSize:13,fontWeight:500}}>{label}</div>
        {sub && <div style={{fontSize:11,color:"#3d5a7a",marginTop:1}}>{sub}</div>}
      </div>
    </div>
  );
}

function EventTimeline({ events, retirementAge, age }) {
  const valid=[...events].filter(e=>e.year&&e.label).sort((a,b)=>a.year-b.year);
  if (!valid.length) return null;
  const retYear=age?CUR_YEAR+(retirementAge-age):CUR_YEAR+28;
  const endYear=Math.max(retYear+1,valid[valid.length-1].year+2);
  const W=560,PAD=20,span=endYear-CUR_YEAR;
  const xp=y=>PAD+((y-CUR_YEAR)/span)*(W-PAD*2);
  return (
    <svg width="100%" viewBox={`0 0 ${W} 90`} style={{overflow:"visible",display:"block"}}>
      <line x1={PAD} y1={55} x2={W-PAD} y2={55} stroke="#1a2e4a" strokeWidth="1.5"/>
      <circle cx={PAD} cy={55} r={3} fill="#2a4060"/>
      <text x={PAD} y={72} textAnchor="middle" fill="#3d5a7a" fontSize="9" fontFamily="Sora,sans-serif">{CUR_YEAR}</text>
      <circle cx={xp(retYear)} cy={55} r={4} fill="#c9a84c" opacity=".5"/>
      <text x={xp(retYear)} y={72} textAnchor="middle" fill="#c9a84c" fontSize="9" fontFamily="Sora,sans-serif" opacity=".6">Retire {retYear}</text>
      {valid.map((ev,i)=>{const x=Math.min(Math.max(xp(ev.year),PAD+10),W-PAD-10),u=eventUrgency(ev.year),up=i%2===0;return(
        <g key={ev.id}>
          <circle cx={x} cy={55} r={5} fill={u.color}/>
          <line x1={x} y1={up?49:60} x2={x} y2={up?32:75} stroke={u.color} strokeWidth="1" strokeDasharray="2 2"/>
          <text x={x} y={up?27:83} textAnchor="middle" fill="#c8d4e0" fontSize="8.5" fontFamily="Sora,sans-serif">{ev.label.length>13?ev.label.slice(0,12)+"…":ev.label}</text>
          <text x={x} y={up?16:90} textAnchor="middle" fill={u.color} fontSize="7.5" fontFamily="Space Mono,monospace">{ev.year}</text>
        </g>
      );})}
    </svg>
  );
}

// ── Goal Card ─────────────────────────────────────────────────────────────────
function GoalCard({ goal, prob, computing, expanded, onToggle, onChange, onDelete }) {
  const yrs = goal.targetYear - CUR_YEAR;
  const inflated = calcInflated(goal.targetAmount, goal.inflationRate, yrs);
  const corpusPct = inflated > 0 ? Math.min((goal.currentCorpus / inflated) * 100, 100) : 0;
  const needed = monthlyNeeded(goal.currentCorpus, inflated, yrs, goal.expectedReturn);
  const gap = Math.max(0, needed - goal.monthlyContrib);
  const cat = GOAL_CATS[goal.category] || GOAL_CATS.custom;
  const CatIcon = cat.icon;
  const cfg = prob != null ? probCfg(prob) : null;
  const priorityColor = goal.priority==="high"?"#ff5252":goal.priority==="medium"?"#c9a84c":"#4a9eff";

  return (
    <div className={`goal-card ${expanded?"expanded":""}`}>
      {/* Summary row */}
      <div style={{padding:"14px 16px",cursor:"pointer",display:"flex",gap:14,alignItems:"center"}} onClick={onToggle}>
        {/* Category icon */}
        <div style={{width:42,height:42,borderRadius:10,background:cat.bg,border:`1px solid ${cat.color}30`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
          <CatIcon size={18} color={cat.color}/>
        </div>

        {/* Center content */}
        <div style={{flex:1,minWidth:0}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
            <span className="priority-dot" style={{background:priorityColor}}/>
            <span style={{fontWeight:600,fontSize:13}}>{goal.name||"Unnamed goal"}</span>
            <span style={{fontSize:10,color:"#3d5a7a"}}>{cat.label} · {goal.targetYear}</span>
          </div>
          <div style={{fontSize:11,color:"#3d5a7a",marginBottom:6,display:"flex",gap:10,flexWrap:"wrap"}}>
            <span>Today: <b style={{color:"#8aa0be"}}>{fmt(goal.targetAmount)}</b></span>
            <span>→ Inflation-adj: <b style={{color:"#dde3f0"}}>{fmt(inflated)}</b></span>
            {yrs > 0 && <span style={{color:"#2a4060"}}>({yrs}y at {goal.inflationRate}% p.a.)</span>}
          </div>
          {/* Progress bar */}
          <div className="goal-progress">
            <div className="goal-progress-fill" style={{width:`${corpusPct}%`,background:cat.color}}/>
          </div>
          <div style={{display:"flex",gap:14,fontSize:11,color:"#3d5a7a",flexWrap:"wrap"}}>
            <span>Corpus <b style={{color:cat.color}}>{fmt(goal.currentCorpus)}</b> of <b style={{color:"#dde3f0"}}>{fmt(inflated)}</b></span>
            {gap > 0 && <span style={{color:"#ff8c42"}}>⚠ Need <b>{fmt(gap)}/mo more</b></span>}
            {gap <= 0 && needed > 0 && <span style={{color:"#00d4a4"}}>✓ Contribution covers goal</span>}
          </div>
        </div>

        {/* Right: MC probability */}
        <div style={{flexShrink:0,textAlign:"center",width:72}}>
          {computing ? (
            <div style={{fontSize:11,color:"#3d5a7a",display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
              <Sigma size={16} className="mc-running" color="#c9a84c"/>
              <span>MC…</span>
            </div>
          ) : prob != null ? (
            <ProbRing prob={prob}/>
          ) : (
            <div style={{fontSize:10,color:"#2a4060"}}>—</div>
          )}
        </div>

        <ChevronDown size={14} color="#3d5a7a" style={{transform:expanded?"rotate(180deg)":"none",transition:"transform .2s",flexShrink:0}}/>
      </div>

      {/* Monthly allocation strip */}
      {!expanded && goal.monthlyContrib > 0 && (
        <div style={{padding:"0 16px 12px",display:"flex",gap:10,fontSize:11,color:"#3d5a7a"}}>
          <span>Contributing <b style={{color:"#c9a84c"}}>{fmt(goal.monthlyContrib)}/mo</b></span>
          <span>· Need <b style={{color:gap>0?"#ff8c42":"#00d4a4"}}>{fmt(needed)}/mo</b></span>
        </div>
      )}

      {/* Expanded edit form */}
      {expanded && (
        <div style={{borderTop:"1px solid #1a2e4a",padding:16,display:"flex",flexDirection:"column",gap:12}}>
          <div className="frow" style={{marginBottom:0}}>
            <div>
              <label className="ax-label">Goal Name</label>
              <input className="ax-input" value={goal.name} onChange={e=>onChange("name",e.target.value)} placeholder="e.g. Child's college"/>
            </div>
            <div>
              <label className="ax-label">Category</label>
              <select className="ax-input" value={goal.category} onChange={e=>onChange("category",e.target.value)}>
                {Object.entries(GOAL_CATS).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
            <div>
              <label className="ax-label">Today's Target ($)</label>
              <input className="ax-input" type="number" min="0" value={goal.targetAmount||""} onChange={e=>onChange("targetAmount",parseFloat(e.target.value)||0)} placeholder="In today's money"/>
            </div>
            <div>
              <label className="ax-label">Target Year</label>
              <input className="ax-input" type="number" min={CUR_YEAR} max={CUR_YEAR+60} value={goal.targetYear} onChange={e=>onChange("targetYear",parseInt(e.target.value)||CUR_YEAR+10)}/>
            </div>
            <div>
              <label className="ax-label">Current Corpus ($)</label>
              <input className="ax-input" type="number" min="0" value={goal.currentCorpus||""} onChange={e=>onChange("currentCorpus",parseFloat(e.target.value)||0)} placeholder="Already saved"/>
            </div>
            <div>
              <label className="ax-label">Monthly Contribution ($)</label>
              <input className="ax-input" type="number" min="0" value={goal.monthlyContrib||""} onChange={e=>onChange("monthlyContrib",parseFloat(e.target.value)||0)} placeholder="Monthly savings for this"/>
            </div>
            <div>
              <label className="ax-label">Inflation Rate (%)</label>
              <input className="ax-input" type="number" min="0" max="20" step="0.5" value={goal.inflationRate} onChange={e=>onChange("inflationRate",parseFloat(e.target.value)||6)}/>
            </div>
            <div>
              <label className="ax-label">Expected Return (%)</label>
              <input className="ax-input" type="number" min="1" max="30" step="0.5" value={goal.expectedReturn} onChange={e=>onChange("expectedReturn",parseFloat(e.target.value)||12)}/>
            </div>
          </div>

          {/* Key outputs row */}
          <div style={{display:"flex",gap:10,flexWrap:"wrap",padding:"10px 12px",background:"#080f1e",borderRadius:9,fontSize:11}}>
            <span style={{color:"#3d5a7a"}}>Inflation-adj target</span>
            <b style={{color:"#dde3f0"}}>{fmt(inflated)}</b>
            <span style={{color:"#3d5a7a"}}>·</span>
            <span style={{color:"#3d5a7a"}}>Monthly needed</span>
            <b style={{color:"#c9a84c"}}>{fmt(needed)}/mo</b>
            <span style={{color:"#3d5a7a"}}>·</span>
            <span style={{color:"#3d5a7a"}}>Volatility assumption</span>
            <b style={{color:"#8aa0be"}}>{goalVol(goal.expectedReturn)}% σ</b>
          </div>

          <div style={{display:"flex",gap:8}}>
            <label className="ax-label" style={{alignSelf:"center",marginBottom:0}}>Priority</label>
            {["high","medium","low"].map(p=>{
              const c=p==="high"?"#ff5252":p==="medium"?"#c9a84c":"#4a9eff";
              const sel=goal.priority===p;
              return <button key={p} className="ax-btn" style={{borderColor:sel?c:"#1a2e4a",color:sel?c:"#3d5a7a",background:sel?`${c}12`:""}} onClick={()=>onChange("priority",p)}>{p.charAt(0).toUpperCase()+p.slice(1)}</button>;
            })}
            <button className="ax-btn del" style={{marginLeft:"auto"}} onClick={onDelete}><Trash2 size={12}/> Delete goal</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── AppHeader ─────────────────────────────────────────────────────────────────
function AppHeader({ metrics, onTab, tab, profileName, goalAmount, onSettings }) {
  const tabs = [
    {id:"dashboard",label:"Dashboard",icon:<BarChart3 size={12}/>},
    {id:"goals",    label:"Goals",    icon:<Target size={12}/>},
    {id:"fiplan",   label:"FI Plan",  icon:<TrendingUp size={12}/>},
    {id:"insurance",label:"Insurance",icon:<Shield size={12}/>},
    {id:"profile",  label:"Profile",  icon:<User size={12}/>},
    {id:"update",   label:"Monthly",  icon:<Plus size={12}/>},
    {id:"advisor",  label:"AI Advisor",icon:<Brain size={12}/>},
    {id:"history",  label:"History",  icon:<History size={12}/>},
  ];
  const fh=n=>!n?"$0":n>=1e6?`$${(n/1e6).toFixed(n%1e6===0?0:2)}M`:n>=1e3?`$${(n/1e3).toFixed(0)}K`:`$${Math.round(n).toLocaleString()}`;
  return (
    <>
      <div style={{padding:"13px 18px",borderBottom:"1px solid #1a2e4a",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:10}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:28,height:28,borderRadius:6,background:"#c9a84c",display:"flex",alignItems:"center",justifyContent:"center"}}><Target size={13} color="#05091a"/></div>
          <div>
            <div style={{fontSize:13,fontWeight:700,letterSpacing:".06em"}}>APEX</div>
            <div className="ax-dim" style={{fontSize:9}}>{profileName?`${profileName}'s Advisor`:"Investment Advisor"} · {fh(goalAmount)} Goal</div>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          {metrics && (
            <div style={{display:"flex",alignItems:"center",gap:10,fontSize:11}}>
              <span className="ax-dim">Net Worth</span>
              <span className="ax-mono ax-gold" style={{fontWeight:700}}>{fh(metrics.netWorth)}</span>
              <div style={{width:80,height:3,background:"#1a2e4a",borderRadius:2}}>
                <div style={{width:`${metrics.progress}%`,height:"100%",background:"#c9a84c",borderRadius:2,transition:"width 1s ease"}}/>
              </div>
              <span className="ax-dim">{metrics.progress.toFixed(1)}%</span>
            </div>
          )}
          <button className="ax-btn" style={{padding:"6px 8px",flexShrink:0}} onClick={onSettings} title="Settings & Reset">
            <Settings size={13}/>
          </button>
        </div>
      </div>
      <div style={{display:"flex",borderBottom:"1px solid #1a2e4a",paddingLeft:10,overflowX:"auto"}}>
        {tabs.map(t=><button key={t.id} className={`ax-tab ${tab===t.id?"active":""}`} onClick={()=>onTab(t.id)}>{t.icon}{t.label}</button>)}
      </div>
    </>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  useStyles();
  const [tab, setTab]           = useState("dashboard");
  const [entries, setEntries]   = useState([]);
  const [advice, setAdvice]     = useState([]);
  const [profile, setProfile]   = useState(()=>defaultProfile());
  const [goals, setGoals]       = useState([]);
  const [insurance, setInsurance] = useState(()=>defaultInsurance());
  const [fiPlan, setFIPlan]     = useState(()=>defaultFIPlan());
  const [goalAmount, setGoalAmount] = useState(DEFAULT_GOAL);
  const [showSettings, setShowSettings] = useState(false);
  const [goalEdit, setGoalEdit]         = useState("");
  const [resetTarget, setResetTarget]   = useState(null); // null | "all" | "entries" | "advice"
  const [probs, setProbs]       = useState({});       // { goalId: number }
  const [computing, setComputing] = useState(false);
  const [expandedGoal, setExpandedGoal] = useState(null);
  const [addGoalForm, setAddGoalForm]   = useState(null);  // null = hidden
  const [form, setForm]         = useState(()=>defaultEntry());
  const [analyzing, setAnalyzing] = useState(false);
  const [booting, setBooting]   = useState(true);
  const [uploadFile, setUploadFile] = useState(null);
  const [parsingFile, setParsingFile] = useState(false);
  const [parsedNote, setParsedNote]   = useState("");
  const [saveMsg, setSaveMsg]   = useState("");
  const [newEv, setNewEv]       = useState({label:"",year:CUR_YEAR+5,cost:0});
  const fileRef = useRef(null);

  // ── Boot ────────────────────────────────────────────────────────────────────
  useEffect(()=>{
    (async()=>{
      const [e,a,p,g,ins,fi,ga]=await Promise.all([load("apex-entries"),load("apex-advice"),load("apex-profile"),load("apex-goals"),load("apex-insurance"),load("apex-fiplan"),load("apex-goal")]);
      if(e)setEntries(e); if(a)setAdvice(a); if(p)setProfile(p); if(g)setGoals(g); if(ins)setInsurance(ins); if(fi)setFIPlan(fi); if(ga)setGoalAmount(ga);
      setBooting(false);
    })();
  },[]);

  // ── Monte Carlo — runs whenever goals change ─────────────────────────────────
  useEffect(()=>{
    if (!goals.length) { setProbs({}); return; }
    setComputing(true);
    // Defer to next tick so UI updates first
    const tid = setTimeout(()=>{
      const res={};
      goals.forEach(g=>{
        const yrs=g.targetYear-CUR_YEAR;
        const inflated=calcInflated(g.targetAmount,g.inflationRate,yrs);
        const vol=goalVol(g.expectedReturn);
        res[g.id]=monteCarlo(g.currentCorpus,g.monthlyContrib,inflated,yrs,g.expectedReturn,vol);
      });
      setProbs(res);
      setComputing(false);
    },0);
    return ()=>clearTimeout(tid);
  },[goals]);

  // ── Derived ─────────────────────────────────────────────────────────────────
  const metrics    = entries.length ? calcMetrics(entries, goalAmount) : null;
  const chartData  = entries.map(e=>({month:e.label,netWorth:e.netWorth}));
  const pComplete  = profileCompleteness(profile);
  const riskOpt    = RISK_OPTIONS.find(r=>r.id===profile.riskAppetite);
  const upcomingEvs= [...profile.lifeEvents].filter(e=>e.year>=CUR_YEAR&&e.label).sort((a,b)=>a.year-b.year).slice(0,4);
  const totalGoalAlloc = goals.reduce((s,g)=>s+g.monthlyContrib,0);
  const avgProb    = goals.length ? Math.round(Object.values(probs).reduce((a,b)=>a+b,0)/goals.length) : null;
  const atRiskGoals= goals.filter(g=>probs[g.id]!=null&&probs[g.id]<50);
  const prot       = calcProtection(insurance, profile, metrics);
  const fi         = calcFIPlan(fiPlan, metrics?.netWorth || 0);
  const rebalCheck = metrics ? checkRebalancing(entries[entries.length-1]?.investments || {}, fiPlan.targetEquityPct) : null;

  const flash = msg=>{ setSaveMsg(msg); setTimeout(()=>setSaveMsg(""),2500); };

  // ── Entry CRUD ───────────────────────────────────────────────────────────────
  const saveEntry = async()=>{
    const updated=[...entries.filter(e=>e.id!==form.id),{...form}].sort((a,b)=>a.id.localeCompare(b.id));
    setEntries(updated); await persist("apex-entries",updated); flash("Saved!"); setTab("dashboard");
  };
  const upd=(sec,key,val)=>{ if(sec)setForm(f=>({...f,[sec]:{...f[sec],[key]:val}})); else setForm(f=>({...f,[key]:val})); };

  // ── Profile CRUD ─────────────────────────────────────────────────────────────
  const saveProfile=async p=>{ setProfile(p); await persist("apex-profile",p); flash("Profile saved!"); };
  const updP=(key,val)=>saveProfile({...profile,[key]:val});
  const updDep=(key,val)=>saveProfile({...profile,dependents:{...profile.dependents,[key]:val}});
  const addEv=()=>{ if(!newEv.label.trim())return; const updated={...profile,lifeEvents:[...profile.lifeEvents,{id:Date.now(),...newEv}].sort((a,b)=>a.year-b.year)}; saveProfile(updated); setNewEv({label:"",year:CUR_YEAR+5,cost:0}); };
  const delEv=id=>saveProfile({...profile,lifeEvents:profile.lifeEvents.filter(e=>e.id!==id)});
  const updEv=(id,key,val)=>saveProfile({...profile,lifeEvents:profile.lifeEvents.map(e=>e.id===id?{...e,[key]:val}:e)});

  // ── Goal CRUD ────────────────────────────────────────────────────────────────
  const saveGoals=async g=>{ setGoals(g); await persist("apex-goals",g); };
  const addGoal=async()=>{
    if(!addGoalForm||!addGoalForm.name.trim())return;
    const g={...addGoalForm,id:Date.now()};
    await saveGoals([...goals,g]);
    setAddGoalForm(null); setExpandedGoal(g.id);
  };
  const updateGoal=async(id,key,val)=>{
    await saveGoals(goals.map(g=>g.id===id?{...g,[key]:val}:g));
  };
  const deleteGoal=async id=>{ await saveGoals(goals.filter(g=>g.id!==id)); setExpandedGoal(null); };

  // ── Insurance CRUD ────────────────────────────────────────────────────────────
  const saveInsurance=async ins=>{ setInsurance(ins); await persist("apex-insurance",ins); flash("Saved!"); };
  const updIns=(key,val)=>saveInsurance({...insurance,[key]:val});

  // ── FI Plan CRUD ──────────────────────────────────────────────────────────────
  const saveFIPlan=async p=>{ setFIPlan(p); await persist("apex-fiplan",p); flash("FI Plan saved!"); };
  const updFI=(key,val)=>saveFIPlan({...fiPlan,[key]:val});

  // ── Goal & Reset ──────────────────────────────────────────────────────────────
  const saveGoalAmount = async () => {
    const val = parseFloat(goalEdit.replace(/[^0-9.]/g,"")) || 0;
    if (val < 1000) return;
    setGoalAmount(val); await persist("apex-goal", val);
    setGoalEdit(""); flash("Goal updated to " + fmt(val) + "!");
  };

  const RESET_OPTS = [
    { id:"all",     label:"Reset all data",          sub:"Clears entries, goals, advice, profile, insurance, FI plan, goal amount", danger:true },
    { id:"entries", label:"Reset monthly entries",   sub:"Clears financial snapshots and AI advice. Keeps profile, goals, and settings." },
    { id:"advice",  label:"Clear AI advice history", sub:"Removes stored advisory reports only. All other data kept." },
  ];

  const performReset = async (what) => {
    if (what === "all") {
      const def = defaultProfile(), dg = [], di = defaultInsurance(), df = defaultFIPlan();
      await Promise.all(["apex-entries","apex-advice","apex-goals","apex-profile","apex-insurance","apex-fiplan","apex-goal"].map(k=>persist(k,k==="apex-entries"||k==="apex-goals"?[]:k==="apex-profile"?def:k==="apex-insurance"?di:k==="apex-fiplan"?df:k==="apex-goal"?DEFAULT_GOAL:[])));
      setEntries([]); setAdvice([]); setGoals([]); setProfile(def);
      setInsurance(di); setFIPlan(df); setGoalAmount(DEFAULT_GOAL); setProbs({});
    } else if (what === "entries") {
      setEntries([]); setAdvice([]);
      await persist("apex-entries",[]); await persist("apex-advice",[]);
    } else if (what === "advice") {
      setAdvice([]); await persist("apex-advice",[]);
    }
    setResetTarget(null); setShowSettings(false); setTab("dashboard");
    flash("Reset complete");
  };

  // ── Statement parser ─────────────────────────────────────────────────────────
  const parseStatement=async file=>{
    setParsingFile(true); setParsedNote("");
    try {
      const b64=await new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result.split(",")[1]);r.onerror=rej;r.readAsDataURL(file);});
      const isPdf=file.type==="application/pdf";
      const content=[isPdf?{type:"document",source:{type:"base64",media_type:"application/pdf",data:b64}}:{type:"image",source:{type:"base64",media_type:file.type,data:b64}},
        {type:"text",text:"Extract financial data. Return ONLY valid JSON: {salary,totalExpenses,bankBalance,emiTotal,notes}. Numbers in USD (84 INR = 1 USD)."}];
      const res=await fetch(CLAUDE_API,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:MODEL,max_tokens:500,messages:[{role:"user",content}]})});
      const data=await res.json();
      const text=data.content?.filter(b=>b.type==="text").map(b=>b.text).join("")||"{}";
      const parsed=JSON.parse(text.replace(/```json|```/g,"").trim());
      if(parsed.salary)upd("income","salary",parsed.salary);
      if(parsed.totalExpenses)upd("expenses","essentials",parsed.totalExpenses);
      if(parsed.bankBalance)upd(null,"bankBalance",parsed.bankBalance);
      if(parsed.emiTotal)upd("expenses","emi",parsed.emiTotal);
      if(parsed.notes)setParsedNote(parsed.notes);
    } catch { setParsedNote("Could not auto-parse. Please fill manually."); }
    setParsingFile(false);
  };

  // ── Profile context for AI ───────────────────────────────────────────────────
  const buildCtx=()=>{
    const p=profile; if(!p.age&&!p.name)return "";
    const risk=RISK_OPTIONS.find(r=>r.id===p.riskAppetite);
    const ytr=p.age&&p.retirementAge?p.retirementAge-p.age:null;
    const deps=[p.dependents.spouse&&"spouse",p.dependents.children>0&&`${p.dependents.children} child${p.dependents.children>1?"ren":""}`,p.dependents.parents>0&&`${p.dependents.parents} parent${p.dependents.parents>1?"s":""}`].filter(Boolean);
    const evStr=profile.lifeEvents.filter(e=>e.year>=CUR_YEAR&&e.label).sort((a,b)=>a.year-b.year).map(e=>`  • ${e.label}: ${e.year} (${e.year-CUR_YEAR}y away)${e.cost?` · $${e.cost.toLocaleString()} needed`:""}`).join("\n");
    const goalStr=goals.map(g=>{
      const yrs=g.targetYear-CUR_YEAR, infl=calcInflated(g.targetAmount,g.inflationRate,yrs), prob=probs[g.id];
      const needed=monthlyNeeded(g.currentCorpus,infl,yrs,g.expectedReturn);
      return `  • ${g.name} (${g.category}): Target $${Math.round(infl).toLocaleString()} by ${g.targetYear} | Corpus $${g.currentCorpus.toLocaleString()} | Contributing $${g.monthlyContrib}/mo | Needs $${Math.round(needed)}/mo | MC Probability: ${prob??0}%`;
    }).join("\n");
    const fiStr = fi ? `\nFI PLAN (Pattu 30× Framework):\n- Essential monthly today: $${fiPlan.essentialMonthly.toLocaleString()}\n- Lifestyle inflation: ${fiPlan.inflationRate}%\n- Years to retirement: ${fiPlan.yearsToRetirement}\n- Inflated annual expense at retirement: $${Math.round(fi.inflatedAnnual).toLocaleString()}\n- FI Threshold (30×): $${Math.round(fi.fi30).toLocaleString()} | Progress: ${fi.prog30.toFixed(1)}%\n- Comfortable FI (35×): $${Math.round(fi.fi35).toLocaleString()}\n- True FI (40×): $${Math.round(fi.fi40).toLocaleString()}\n- Gap to FI30×: $${Math.round(fi.gap30).toLocaleString()}\n- Savings rate benchmark (≥50% of essential expenses): $${(fiPlan.essentialMonthly*0.5).toLocaleString()}/mo` : "";
    return `\nPERSONAL PROFILE:\n- Name: ${p.name||"?"}, Age: ${p.age}${ytr?` (${ytr}y to retire)`:""}\n- Risk: ${p.riskAppetite?.toUpperCase()} — ${risk?.detail}\n- Dependents: ${deps.length?deps.join(", "):"None"}${fiStr}\n\nLIFE EVENTS:\n${evStr||"  None"}\n\nFINANCIAL GOALS (${goals.length} tracked, avg MC probability ${avgProb??0}%):\n${goalStr||"  None set"}\n- Total monthly allocated to goals: $${totalGoalAlloc.toLocaleString()}\n\nRISK & INSURANCE (Protection Score ${prot.overall}/100 — ${prot.overallCfg.label}):\n- Life Cover: $${prot.curLife.toLocaleString()} of $${prot.recLife.toLocaleString()} recommended (${prot.lifeScore}% adequate)${prot.lifeGap>0?` — GAP $${prot.lifeGap.toLocaleString()}`:""}\n- Health Cover: $${prot.curHealth.toLocaleString()} of $${prot.recHealth.toLocaleString()} recommended (${prot.healthScore}% adequate)${prot.healthGap>0?` — GAP $${prot.healthGap.toLocaleString()}`:""}\n- Emergency Fund: ${prot.emMonths.toFixed(1)} months of expenses (target 6 months, ${prot.emScore}% adequate)${prot.emGap>0?` — GAP $${prot.emGap.toLocaleString()}`:""}\n- Disability Cover: ${prot.disScore}% adequate\n- Credit Score: ${insurance.creditScore>0?`${insurance.creditScore} (${prot.creditLabel})`:"Not recorded"}`;
  };

  // ── AI analysis ──────────────────────────────────────────────────────────────
  const runAnalysis=async(type="monthly")=>{
    if(!entries.length)return; setAnalyzing(true);
    const m=calcMetrics(entries, goalAmount), latest=entries[entries.length-1];
    const last3=entries.slice(-3).map(e=>`${e.label}: NW $${e.netWorth.toLocaleString()}`).join("; ");
    const prompt=`You are APEX, an elite personal financial advisor. Client goal: ${fmt(goalAmount)} USD net worth ASAP.
${buildCtx()}
FINANCIAL SNAPSHOT:
- Net Worth: $${m.netWorth.toLocaleString()} (${m.progress.toFixed(1)}% of ${fmt(goalAmount)} goal)
- Monthly Income: $${m.totalIncome.toLocaleString()} | Expenses: $${m.totalExp.toLocaleString()}
- Monthly Savings: $${m.monthlySavings.toLocaleString()} (${m.savingsRate.toFixed(1)}%) | Allocated to sub-goals: $${totalGoalAlloc.toLocaleString()} | Available for $1M: $${Math.max(0,m.monthlySavings-totalGoalAlloc).toLocaleString()}
- Investments: $${m.totalInv.toLocaleString()} | Loans: $${m.totalLoans.toLocaleString()} | DTI: ${m.dti.toFixed(1)}%
- Trend: ${last3}
- Notes: ${latest.notes||"none"}
- Analysis type: ${type}

Respond EXACTLY:

**📈 TRAJECTORY**
[$1M timeline AND FI timeline using the Pattu 30× framework. If FI number is set, compare progress to both. Are they on track to FI before or at retirement?]

**🎯 FI READINESS (Pattu Framework)**
[Assess progress toward FI30× target. Is savings rate meeting the ≥50% of essential expenses benchmark? Check if lifestyle inflation assumption (7% vs 8%) is appropriate. Flag any rebalancing drift >5%. Recommend bucket strategy allocation if close to retirement.]

**🎯 GOAL HEALTH**
[Review each sub-goal by MC probability. Flag any below 50%. Recommend rebalancing contributions where needed.]

**🚧 TOP BOTTLENECKS**
[2-3 specific data-backed obstacles. Include goal funding conflicts.]

**⚡ ACTION PLAN**
[3-5 quantified actions. Match risk appetite. Address goal shortfalls specifically.]

**🛡️ PROTECTION GAPS**
[Flag any critical insurance gaps that could derail the $1M goal (e.g. life cover gap for dependents, no disability cover for income protection, inadequate emergency fund). Estimate the annual premium cost of closing each gap. Prioritize by financial impact.]

**🚨 ALERTS**
[Red flags. Urgent life events needing corpus. Goals with <25% MC probability.]

**💡 BOLD MOVE**
[One high-impact, risk-calibrated recommendation that accelerates BOTH the $1M goal AND underfunded sub-goals.]`;
    try {
      const res=await fetch(CLAUDE_API,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:MODEL,max_tokens:1200,messages:[{role:"user",content:prompt}]})});
      const data=await res.json();
      const content=data.content?.filter(b=>b.type==="text").map(b=>b.text).join("")||"Analysis unavailable.";
      const rec={id:Date.now(),date:new Date().toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}),type,content,netWorthSnapshot:m.netWorth};
      const updated=[rec,...advice].slice(0,12); setAdvice(updated); await persist("apex-advice",updated);
    } catch(e){console.error(e);} setAnalyzing(false);
  };

  const renderAdvice=t=>t.replace(/\*\*(.*?)\*\*/g,"<strong>$1</strong>").replace(/\n/g,"<br/>");

  // ── SETTINGS MODAL ────────────────────────────────────────────────────────────
  const SettingsModal = () => {
    const fmtGoal = n => n>=1e6?`$${(n/1e6).toFixed(n%1e6===0?0:2)}M`:n>=1e3?`$${(n/1e3).toFixed(0)}K`:`$${Math.round(n).toLocaleString()}`;
    return(
      <div className="settings-overlay" onClick={e=>{if(e.target===e.currentTarget){setShowSettings(false);setResetTarget(null);}}}>
        <div className="settings-panel">
          {/* Header */}
          <div style={{padding:"16px 20px",borderBottom:"1px solid #1a2e4a",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <Settings size={15} color="#c9a84c"/>
              <span style={{fontWeight:700,fontSize:14}}>Settings</span>
            </div>
            <button className="ax-btn" style={{padding:"5px 8px"}} onClick={()=>{setShowSettings(false);setResetTarget(null);}}>
              <XIcon size={13}/>
            </button>
          </div>

          {/* ── Wealth Target ── */}
          <div className="settings-section">
            <div className="ax-sec" style={{marginBottom:12}}><Target size={11}/> Wealth Target</div>
            <div style={{fontSize:11,color:"#3d5a7a",marginBottom:12,lineHeight:1.6}}>
              Current goal: <b className="ax-mono" style={{color:"#c9a84c",fontSize:13}}>{fmtGoal(goalAmount)}</b> — all progress bars, timelines, and AI analysis are calibrated to this target.
            </div>
            <div style={{display:"flex",gap:8,alignItems:"flex-end",flexWrap:"wrap"}}>
              <div style={{flex:1,minWidth:180}}>
                <label className="ax-label">New goal amount (USD)</label>
                <input className="ax-input" type="text" value={goalEdit}
                  onChange={e=>setGoalEdit(e.target.value)}
                  onKeyDown={e=>e.key==="Enter"&&saveGoalAmount()}
                  placeholder={`Current: ${fmtGoal(goalAmount)}`}/>
              </div>
              <button className="ax-btn primary" onClick={saveGoalAmount} disabled={!goalEdit.trim()}>
                <Save size={12}/> Save Goal
              </button>
            </div>
            {/* Quick presets */}
            <div style={{display:"flex",gap:8,marginTop:10,flexWrap:"wrap"}}>
              {[500_000,1_000_000,2_000_000,5_000_000,10_000_000].map(v=>(
                <button key={v} className="ax-btn" style={{fontSize:11,padding:"5px 10px",borderColor:goalAmount===v?"#c9a84c":"#1a2e4a",color:goalAmount===v?"#c9a84c":"#3d5a7a"}}
                  onClick={async()=>{ setGoalAmount(v); await persist("apex-goal",v); flash("Goal updated to "+fmtGoal(v)+"!"); }}>
                  {fmtGoal(v)}
                </button>
              ))}
            </div>
          </div>

          {/* ── Data Management ── */}
          <div className="settings-section">
            <div className="ax-sec" style={{marginBottom:12}}><RotateCcw size={11}/> Data Management</div>

            {resetTarget ? (
              <div className="confirm-box">
                <div style={{fontSize:13,fontWeight:600,color:"#ff5252",marginBottom:6}}>
                  ⚠ Confirm Reset: {RESET_OPTS.find(o=>o.id===resetTarget)?.label}
                </div>
                <div style={{fontSize:11,color:"#7a9ab8",marginBottom:14,lineHeight:1.6}}>
                  {RESET_OPTS.find(o=>o.id===resetTarget)?.sub}. <b style={{color:"#ff5252"}}>This cannot be undone.</b>
                </div>
                <div style={{display:"flex",gap:8}}>
                  <button className="ax-btn" style={{borderColor:"#ff5252",color:"#ff5252",fontWeight:700}}
                    onClick={()=>performReset(resetTarget)}>
                    <RotateCcw size={12}/> Yes, Reset
                  </button>
                  <button className="ax-btn" onClick={()=>setResetTarget(null)}>Cancel</button>
                </div>
              </div>
            ) : (
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {RESET_OPTS.map(opt=>(
                  <button key={opt.id} className={`reset-btn ${opt.danger?"danger":""}`}
                    onClick={()=>setResetTarget(opt.id)}>
                    <div style={{width:30,height:30,borderRadius:7,background:opt.danger?"rgba(255,82,82,.12)":"rgba(255,255,255,.04)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                      <RotateCcw size={13} color={opt.danger?"#ff5252":"#3d5a7a"}/>
                    </div>
                    <div>
                      <div style={{fontWeight:600,color:opt.danger?"#ff5252":"#dde3f0"}}>{opt.label}</div>
                      <div style={{fontSize:10,color:"#3d5a7a",marginTop:2}}>{opt.sub}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div style={{padding:"12px 20px",fontSize:10,color:"#2a4060",borderTop:"1px solid #1a2e4a"}}>
            APEX v4 · All data stored locally in your browser · {entries.length} monthly snapshots · {goals.length} goals
          </div>
        </div>
      </div>
    );
  };

  if(booting) return(
    <div className="apex" style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh"}}>
      <div style={{display:"flex",alignItems:"center",gap:10,color:"#3d5a7a",fontSize:13}}><Loader size={16} className="spinning"/> Loading APEX...</div>
    </div>
  );

  // ── Settings overlay — rendered above any active tab ─────────────────────────
  if(tab==="dashboard"){
    if(!entries.length) return(
      <div className="apex">
        {showSettings && <SettingsModal/>}
        <AppHeader metrics={null} onTab={setTab} tab={tab} profileName={profile.name} goalAmount={goalAmount} onSettings={()=>setShowSettings(true)}/>
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:360,gap:16}}>
          <Target size={44} color="#1a2e4a"/>
          <div style={{color:"#3d5a7a",fontSize:14,textAlign:"center",maxWidth:300,lineHeight:1.7}}>
            {pComplete<60?<>Set up your <span style={{color:"#c9a84c"}}>profile</span> and <span style={{color:"#c9a84c"}}>goals</span>, then add your first monthly snapshot.</>:"Add your first monthly snapshot to begin tracking."}
          </div>
          <div style={{display:"flex",gap:10,flexWrap:"wrap",justifyContent:"center"}}>
            {pComplete<60&&<button className="ax-btn" onClick={()=>setTab("profile")}><User size={12}/> Set Up Profile</button>}
            <button className="ax-btn" onClick={()=>setTab("goals")}><Target size={12}/> Set Goals</button>
            <button className="ax-btn primary" onClick={()=>setTab("update")}><Plus size={13}/> Add First Month</button>
          </div>
        </div>
      </div>
    );
    const m=metrics;
    const alerts=[];
    if(m.savingsRate<20) alerts.push(`Savings rate ${m.savingsRate.toFixed(1)}% is below the 30% minimum needed.`);
    if(m.totalLoans>m.totalInv) alerts.push(`Outstanding debt ($${m.totalLoans.toLocaleString()}) exceeds investments — loans eroding wealth.`);
    if(m.monthlyGrowth<0) alerts.push(`Net worth declined $${Math.abs(m.monthlyGrowth).toLocaleString()} this month.`);
    if(m.dti>40) alerts.push(`Debt-to-income ratio ${m.dti.toFixed(1)}% is dangerously high.`);
    atRiskGoals.forEach(g=>alerts.push(`Goal "${g.name}" has only ${probs[g.id]}% probability of success — needs attention.`));
    profile.lifeEvents.filter(e=>e.year-CUR_YEAR<=2&&e.year>=CUR_YEAR&&e.label).forEach(e=>alerts.push(`Life event "${e.label}" ${e.year===CUR_YEAR?"is this year":`in ${e.year-CUR_YEAR}y`}${e.cost?` — $${e.cost.toLocaleString()} needed`:""}.`));
    if(prot.lifeGap>0&&prot.lifeScore<50)   alerts.push(`Life cover is only ${prot.lifeScore}% adequate — gap of ${fmt(prot.lifeGap)}. Your dependents are underprotected.`);
    if(prot.healthGap>0&&prot.healthScore<60) alerts.push(`Health cover is only ${prot.healthScore}% adequate — gap of ${fmt(prot.healthGap)}. A major illness could wipe savings.`);
    if(prot.emMonths<3)                       alerts.push(`Emergency fund covers only ${prot.emMonths.toFixed(1)} months. Target is 6 months (${fmt(prot.recEmergency)}).`);
    if(prot.disScore<30)                      alerts.push(`Disability cover is critically low (${prot.disScore}%). Loss of income is the #1 wealth-destruction risk.`);
    if(rebalCheck?.needsRebalancing)          alerts.push(`Asset allocation drift ${rebalCheck.drift>0?"+":""}${rebalCheck.drift.toFixed(1)}% (equity at ${rebalCheck.cur.toFixed(0)}% vs target ${fiPlan.targetEquityPct}%). Rebalance triggered — Pattu rule: act when drift >5%.`);
    if(fi&&m.monthlySavings < fiPlan.essentialMonthly*0.5&&fiPlan.essentialMonthly>0) alerts.push(`Savings rate is below Pattu's benchmark (≥50% of essential expenses = ${fmt(fiPlan.essentialMonthly*0.5)}/mo). Currently saving ${fmt(m.monthlySavings)}/mo.`);

    return(
      <div className="apex">
        {showSettings && <SettingsModal/>}
        <AppHeader metrics={m} onTab={setTab} tab={tab} profileName={profile.name} goalAmount={goalAmount} onSettings={()=>setShowSettings(true)}/>
        <div style={{padding:18,display:"flex",flexDirection:"column",gap:18}}>
          {/* Profile strip */}
          {(profile.name||profile.age)&&(
            <div className="ax-card" style={{padding:"12px 16px",display:"flex",alignItems:"center",gap:14,flexWrap:"wrap"}}>
              <div className="avatar" style={{width:46,height:46,fontSize:15}}>{initials(profile.name)}</div>
              <div style={{flex:1}}>
                <div style={{fontWeight:600,fontSize:14}}>{profile.name||"Your Profile"}</div>
                <div style={{fontSize:11,color:"#3d5a7a",marginTop:2,display:"flex",gap:14,flexWrap:"wrap"}}>
                  {profile.age&&<span>Age {profile.age}{profile.retirementAge?` · ${profile.retirementAge-profile.age}y to retire`:""}</span>}
                  {riskOpt&&<span style={{color:riskOpt.color}}>● {riskOpt.label}</span>}
                  {(profile.dependents.children>0||profile.dependents.spouse||profile.dependents.parents>0)&&<span><Users size={10} style={{verticalAlign:"middle"}}/> {[profile.dependents.spouse&&"Spouse",profile.dependents.children>0&&`${profile.dependents.children} kid${profile.dependents.children>1?"s":""}`,profile.dependents.parents>0&&`${profile.dependents.parents} parent${profile.dependents.parents>1?"s":""}`].filter(Boolean).join(", ")}</span>}
                </div>
              </div>
              {pComplete<100&&<button className="ax-btn" style={{fontSize:11}} onClick={()=>setTab("profile")}><User size={11}/> Complete ({pComplete}%)</button>}
            </div>
          )}

          {/* Goal + Metrics */}
          <div style={{display:"flex",gap:16,flexWrap:"wrap",alignItems:"stretch"}}>
            <div className="ax-card" style={{display:"flex",flexDirection:"column",alignItems:"center",padding:22,gap:8}}>
              <GoalRing progress={m.progress}/>
              <div style={{textAlign:"center"}}>
                <div className="ax-mono ax-gold" style={{fontSize:22,fontWeight:700}}>{fmt(m.netWorth)}</div>
                <div className="ax-dim" style={{fontSize:10,marginTop:2}}>current net worth</div>
                {m.monthsToGoal&&<div style={{marginTop:6,fontSize:11,color:"#3d5a7a",lineHeight:1.5}}>~{m.monthsToGoal} months to $1M<br/>at current pace</div>}
              </div>
            </div>
            <div style={{flex:1,display:"flex",flexDirection:"column",gap:10}}>
              <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
                <MetricCard label="Monthly Income" value={fmt(m.totalIncome)}/>
                <MetricCard label="Monthly Savings" value={fmt(m.monthlySavings)} color={m.monthlySavings>=0?"#00d4a4":"#ff5252"} sub={`${m.savingsRate.toFixed(1)}% rate · $${totalGoalAlloc.toLocaleString()} to goals`}/>
              </div>
              <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
                <MetricCard label="Investments" value={fmt(m.totalInv)} color="#c9a84c"/>
                <MetricCard label="Total Loans" value={fmt(m.totalLoans)} color={m.totalLoans>0?"#ff5252":"#00d4a4"}/>
              </div>
            </div>
          </div>

          {/* Chart */}
          {chartData.length>1&&(
            <div className="ax-card">
              <div className="ax-sec"><TrendingUp size={11}/> Net Worth Trend</div>
              <div style={{height:155}}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{top:4,right:8,bottom:0,left:0}}>
                    <defs><linearGradient id="nwg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#c9a84c" stopOpacity={0.25}/><stop offset="95%" stopColor="#c9a84c" stopOpacity={0}/></linearGradient></defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1a2e4a"/>
                    <XAxis dataKey="month" tick={{fill:"#3d5a7a",fontSize:10}} axisLine={false} tickLine={false}/>
                    <YAxis tick={{fill:"#3d5a7a",fontSize:10}} axisLine={false} tickLine={false} tickFormatter={v=>`$${(v/1000).toFixed(0)}K`}/>
                    <Tooltip contentStyle={{background:"#0b1628",border:"1px solid #1a2e4a",borderRadius:8,color:"#dde3f0",fontSize:11}} formatter={v=>[`$${v.toLocaleString()}`,""]}/>
                    <Area type="monotone" dataKey="netWorth" stroke="#c9a84c" strokeWidth={2} fill="url(#nwg)" dot={{fill:"#c9a84c",r:4,strokeWidth:0}}/>
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Goals summary on dashboard */}
          {goals.length>0&&(
            <div>
              <div className="ax-sec"><Target size={11}/> Goal Tracker</div>
              <div style={{display:"flex",gap:10,marginBottom:12,flexWrap:"wrap"}}>
                <MetricCard label="Goals tracked" value={goals.length} color="#dde3f0"/>
                {avgProb!=null&&<MetricCard label="Avg MC probability" value={`${avgProb}%`} color={probCfg(avgProb).color}/>}
                <MetricCard label="Monthly allocated" value={fmt(totalGoalAlloc)} color="#c9a84c" sub={metrics?`of ${fmt(m.monthlySavings)} savings`:""}/>
              </div>
              {/* Stacked allocation bar */}
              {totalGoalAlloc>0&&m.monthlySavings>0&&(
                <div style={{marginBottom:12}}>
                  <div style={{height:8,borderRadius:4,background:"#1a2e4a",overflow:"hidden",display:"flex"}}>
                    {goals.filter(g=>g.monthlyContrib>0).map(g=>{
                      const cat=GOAL_CATS[g.category]||GOAL_CATS.custom;
                      const w=Math.max(1,(g.monthlyContrib/Math.max(m.monthlySavings,totalGoalAlloc))*100);
                      return <div key={g.id} style={{width:`${w}%`,background:cat.color,opacity:.8}} title={`${g.name}: ${fmt(g.monthlyContrib)}/mo`}/>;
                    })}
                  </div>
                  <div style={{display:"flex",gap:12,marginTop:6,flexWrap:"wrap",fontSize:10,color:"#3d5a7a"}}>
                    {goals.filter(g=>g.monthlyContrib>0).map(g=>{const cat=GOAL_CATS[g.category]||GOAL_CATS.custom;return<span key={g.id} style={{display:"flex",alignItems:"center",gap:4}}><span style={{width:8,height:8,borderRadius:2,background:cat.color,display:"inline-block"}}/>{g.name} {fmt(g.monthlyContrib)}</span>;})}
                    {m.monthlySavings-totalGoalAlloc>0&&<span style={{display:"flex",alignItems:"center",gap:4}}><span style={{width:8,height:8,borderRadius:2,background:"#1a2e4a",display:"inline-block"}}/>$1M goal {fmt(Math.max(0,m.monthlySavings-totalGoalAlloc))}</span>}
                  </div>
                </div>
              )}
              {/* At-risk goals */}
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {[...goals].sort((a,b)=>(probs[a.id]??100)-(probs[b.id]??100)).slice(0,3).map(g=>{
                  const p=probs[g.id], cfg=p!=null?probCfg(p):null, cat=GOAL_CATS[g.category]||GOAL_CATS.custom, CatIcon=cat.icon;
                  const yrs=g.targetYear-CUR_YEAR, inflated=calcInflated(g.targetAmount,g.inflationRate,yrs);
                  const corpusPct=inflated>0?Math.min((g.currentCorpus/inflated)*100,100):0;
                  return(
                    <div key={g.id} className="ax-card" style={{padding:"12px 16px",display:"flex",alignItems:"center",gap:14,cursor:"pointer"}} onClick={()=>{setTab("goals");setExpandedGoal(g.id);}}>
                      <div style={{width:36,height:36,borderRadius:8,background:cat.bg,border:`1px solid ${cat.color}30`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                        <CatIcon size={15} color={cat.color}/>
                      </div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:13,fontWeight:600,marginBottom:4}}>{g.name}</div>
                        <div style={{height:3,borderRadius:2,background:"#1a2e4a",overflow:"hidden"}}><div style={{width:`${corpusPct}%`,height:"100%",background:cat.color,borderRadius:2}}/></div>
                        <div style={{fontSize:10,color:"#3d5a7a",marginTop:3}}>{fmt(g.currentCorpus)} of {fmt(inflated)} · {yrs}y</div>
                      </div>
                      {cfg&&<div style={{textAlign:"center",flexShrink:0}}><div className="ax-mono" style={{fontSize:18,fontWeight:700,color:cfg.color}}>{p}%</div><div style={{fontSize:9,color:cfg.color}}>{cfg.label}</div></div>}
                      <ChevronRight size={12} color="#3d5a7a"/>
                    </div>
                  );
                })}
                <button className="ax-btn" style={{alignSelf:"flex-start",fontSize:11}} onClick={()=>setTab("goals")}><Target size={11}/> Manage all goals</button>
              </div>
            </div>
          )}

          {/* FI Number widget */}
          {fi && (
            <div>
              <div className="ax-sec"><TrendingUp size={11}/> FI Number (Pattu 30× Framework)</div>
              <div className="ax-card" style={{cursor:"pointer",padding:"14px 18px"}} onClick={()=>setTab("fiplan")}>
                <div style={{display:"flex",gap:16,flexWrap:"wrap",alignItems:"center"}}>
                  <div style={{flex:1,minWidth:200}}>
                    <div style={{display:"flex",gap:10,marginBottom:10,flexWrap:"wrap"}}>
                      <div style={{flex:1,minWidth:100}}>
                        <div className="ax-label">FI Threshold (30×)</div>
                        <div className="ax-mono" style={{fontSize:18,fontWeight:700,color:"#c9a84c"}}>{fmt(fi.fi30)}</div>
                      </div>
                      <div style={{flex:1,minWidth:100}}>
                        <div className="ax-label">Comfortable FI (35×)</div>
                        <div className="ax-mono" style={{fontSize:18,fontWeight:700,color:"#8aa0be"}}>{fmt(fi.fi35)}</div>
                      </div>
                    </div>
                    <div style={{height:6,borderRadius:3,background:"#1a2e4a",overflow:"hidden",marginBottom:6}}>
                      <div style={{width:`${Math.min(fi.prog30,100)}%`,height:"100%",background:fi.prog30>=100?"#00d4a4":"#c9a84c",borderRadius:3,transition:"width .9s ease"}}/>
                    </div>
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:"#3d5a7a"}}>
                      <span>Current {fmt(metrics?.netWorth||0)} · <b style={{color:fi.prog30>=100?"#00d4a4":"#c9a84c"}}>{fi.prog30.toFixed(1)}% to FI</b></span>
                      <span>Year-1 withdrawal: {fi.withdrawalRate.toFixed(2)}%</span>
                    </div>
                  </div>
                  <div style={{textAlign:"right",flexShrink:0}}>
                    <div style={{fontSize:10,color:"#3d5a7a"}}>Inflation-adj annual expense</div>
                    <div className="ax-mono" style={{fontSize:16,fontWeight:700,color:"#dde3f0"}}>{fmt(fi.inflatedAnnual)}</div>
                    <div style={{fontSize:10,color:"#3d5a7a",marginTop:2}}>at {fiPlan.inflationRate}% p.a. in {fiPlan.yearsToRetirement}y</div>
                    <div style={{marginTop:6,fontSize:10,color:"#c9a84c",display:"flex",alignItems:"center",gap:3,justifyContent:"flex-end"}}>View FI Plan <ChevronRight size={10}/></div>
                  </div>
                </div>
                {rebalCheck?.needsRebalancing && (
                  <div style={{marginTop:10,fontSize:11,color:"#ff8c42",background:"rgba(255,140,66,.07)",borderRadius:8,padding:"7px 10px",display:"flex",alignItems:"center",gap:6}}>
                    <AlertOctagon size={12}/> Rebalance alert: equity at {rebalCheck.cur.toFixed(0)}% vs target {fiPlan.targetEquityPct}% — drift {rebalCheck.drift>0?"+":""}{rebalCheck.drift.toFixed(1)}%
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Protection score widget */}
          {(prot.overall > 0 || insurance.creditScore > 0) && (
            <div>
              <div className="ax-sec"><Shield size={11}/> Protection Status</div>
              <div className="ax-card" style={{cursor:"pointer",padding:"14px 18px"}} onClick={()=>setTab("insurance")}>
                <div style={{display:"flex",alignItems:"center",gap:18,flexWrap:"wrap"}}>
                  {/* Score badge */}
                  <div style={{width:64,height:64,borderRadius:16,background:`${prot.overallCfg.color}12`,border:`2px solid ${prot.overallCfg.color}40`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                    <span className="ax-mono" style={{fontSize:22,fontWeight:700,color:prot.overallCfg.color,lineHeight:1}}>{prot.overall}</span>
                    <span style={{fontSize:8,color:prot.overallCfg.color,marginTop:2}}>/ 100</span>
                  </div>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:600,fontSize:13,color:prot.overallCfg.color,marginBottom:6}}>{prot.overallCfg.label}</div>
                    {/* 4 mini bars */}
                    <div style={{display:"flex",flexDirection:"column",gap:5}}>
                      {[
                        {label:"Life Cover",  score:prot.lifeScore,   Icon:Umbrella},
                        {label:"Health",       score:prot.healthScore, Icon:Activity},
                        {label:"Emergency Fund",score:prot.emScore,   Icon:Shield},
                        {label:"Disability",   score:prot.disScore,   Icon:AlertOctagon},
                      ].map(({label,score,Icon})=>{
                        const c=score>=80?"#00d4a4":score>=60?"#c9a84c":score>=30?"#ff8c42":"#ff5252";
                        return(
                          <div key={label} style={{display:"flex",alignItems:"center",gap:8}}>
                            <Icon size={10} color={c} style={{flexShrink:0}}/>
                            <span style={{fontSize:10,color:"#3d5a7a",width:90,flexShrink:0}}>{label}</span>
                            <div style={{flex:1,height:4,background:"#1a2e4a",borderRadius:2,overflow:"hidden"}}>
                              <div style={{width:`${score}%`,height:"100%",background:c,borderRadius:2}}/>
                            </div>
                            <span className="ax-mono" style={{fontSize:10,color:c,width:30,textAlign:"right"}}>{score}%</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <ChevronRight size={13} color="#3d5a7a" style={{flexShrink:0}}/>
                </div>
              </div>
            </div>
          )}

          {/* Life events */}
          {upcomingEvs.length>0&&(
            <div>
              <div className="ax-sec"><Calendar size={11}/> Upcoming Life Events</div>
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {upcomingEvs.map(ev=>{const u=eventUrgency(ev.year),yrs=ev.year-CUR_YEAR;return(
                  <div key={ev.id} className="ax-card" style={{padding:"12px 16px",display:"flex",alignItems:"center",gap:14}}>
                    <div style={{width:36,height:36,borderRadius:8,background:`${u.color}18`,border:`1px solid ${u.color}40`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Flag size={14} color={u.color}/></div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:13,fontWeight:600}}>{ev.label}</div>
                      <div style={{fontSize:11,color:"#3d5a7a",marginTop:2}}>{ev.year} · {yrs<=0?"This year":`${yrs}y away`}</div>
                    </div>
                    <div style={{textAlign:"right",flexShrink:0}}>
                      {ev.cost>0&&<div className="ax-mono" style={{fontSize:15,fontWeight:700,color:u.color}}>{fmt(ev.cost)}</div>}
                      <span className="ev-badge" style={{background:`${u.color}18`,color:u.color,marginTop:4,display:"flex"}}>{u.label}</span>
                    </div>
                  </div>
                );})}
              </div>
            </div>
          )}

          {/* Alerts */}
          {alerts.length>0&&(
            <div>
              <div className="ax-sec"><AlertTriangle size={11}/> Alerts</div>
              <div style={{display:"flex",flexDirection:"column",gap:7}}>
                {alerts.map((a,i)=><div key={i} className="ax-alert"><span className="ax-red" style={{marginRight:5}}>▲</span>{a}</div>)}
              </div>
            </div>
          )}

          {/* AI preview */}
          {advice.length>0&&(
            <div>
              <div className="ax-sec"><Brain size={11}/> Latest APEX Advisory</div>
              <div className="ax-card" style={{cursor:"pointer"}} onClick={()=>setTab("advisor")}>
                <div style={{fontSize:10,color:"#3d5a7a",marginBottom:7}}>{advice[0].date} · {advice[0].type} · {fmt(advice[0].netWorthSnapshot)}</div>
                <div style={{fontSize:12,color:"#7a9ab8",lineHeight:1.65,overflow:"hidden",display:"-webkit-box",WebkitLineClamp:3,WebkitBoxOrient:"vertical"}}>{advice[0].content.replace(/\*\*/g,"").substring(0,220)}…</div>
                <div style={{marginTop:9,display:"flex",alignItems:"center",gap:4,fontSize:11,color:"#c9a84c"}}>View full report <ChevronRight size={11}/></div>
              </div>
            </div>
          )}

          <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
            <button className="ax-btn primary" onClick={()=>setTab("update")}><Plus size={12}/> Monthly Update</button>
            <button className="ax-btn" onClick={()=>{setTab("advisor");setTimeout(()=>runAnalysis("monthly"),100);}}><Brain size={12}/> Get AI Analysis</button>
            <button className="ax-btn" onClick={()=>setTab("fiplan")}><TrendingUp size={12}/> FI Plan</button>
            <button className="ax-btn" onClick={()=>setTab("goals")}><Target size={12}/> Goals</button>
            <button className="ax-btn" onClick={()=>setTab("insurance")}><Shield size={12}/> Insurance</button>
            <button className="ax-btn" onClick={()=>setTab("history")}><History size={12}/> History</button>
          </div>
        </div>
      </div>
    );
  }

  // ── GOALS TAB ────────────────────────────────────────────────────────────────
  if(tab==="goals") return(
    <div className="apex">
      {showSettings && <SettingsModal/>}
      <AppHeader metrics={metrics} onTab={setTab} tab={tab} profileName={profile.name} goalAmount={goalAmount} onSettings={()=>setShowSettings(true)}/>
      <div style={{padding:18,display:"flex",flexDirection:"column",gap:16}}>

        {/* Overview */}
        {goals.length>0&&(
          <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
            <MetricCard label="Goals tracked" value={goals.length}/>
            {avgProb!=null&&<MetricCard label="Avg MC probability" value={`${avgProb}%`} color={probCfg(avgProb).color} sub="Monte Carlo simulation"/>}
            <MetricCard label="Monthly allocated" value={fmt(totalGoalAlloc)} color="#c9a84c" sub={metrics?`of ${fmt(metrics.monthlySavings)} savings`:""}/>
            {atRiskGoals.length>0&&<MetricCard label="Goals at risk" value={atRiskGoals.length} color="#ff5252" sub="Below 50% probability"/>}
          </div>
        )}

        {/* MC explanation */}
        <div style={{background:"rgba(201,168,76,.06)",border:"1px solid rgba(201,168,76,.15)",borderRadius:10,padding:"10px 14px",display:"flex",gap:10,alignItems:"flex-start"}}>
          <Sigma size={14} color="#c9a84c" style={{flexShrink:0,marginTop:1}}/>
          <div style={{fontSize:11,color:"#8aa0be",lineHeight:1.6}}>
            <b style={{color:"#c9a84c"}}>Monte Carlo simulation</b> — Each goal runs {MC_SIMS} simulations with randomized returns drawn from a normal distribution around your expected return. Probability = % of simulations where your corpus reaches the inflation-adjusted target. Target amounts are in today's money; APEX inflates them to the target year.
          </div>
        </div>

        {/* Goal list */}
        {goals.length>0?(
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {[...goals].sort((a,b)=>(probs[a.id]??100)-(probs[b.id]??100)).map(g=>(
              <GoalCard key={g.id} goal={g} prob={probs[g.id]} computing={computing&&probs[g.id]==null}
                expanded={expandedGoal===g.id}
                onToggle={()=>setExpandedGoal(expandedGoal===g.id?null:g.id)}
                onChange={(key,val)=>updateGoal(g.id,key,val)}
                onDelete={()=>deleteGoal(g.id)}/>
            ))}
          </div>
        ):(
          <div style={{textAlign:"center",padding:40,color:"#3d5a7a"}}>
            <Target size={36} color="#1a2e4a" style={{margin:"0 auto 12px"}}/>
            <div style={{fontSize:13}}>No goals yet. Add your first financial goal below.</div>
          </div>
        )}

        {/* Add goal form */}
        {addGoalForm ? (
          <div className="ax-card" style={{border:"1px solid #c9a84c30"}}>
            <div className="ax-sec" style={{marginBottom:14}}><Plus size={11}/> New Financial Goal</div>
            <div className="frow">
              <div>
                <label className="ax-label">Goal Name</label>
                <input className="ax-input" value={addGoalForm.name} onChange={e=>setAddGoalForm(f=>({...f,name:e.target.value}))} placeholder="e.g. Child's university"/>
              </div>
              <div>
                <label className="ax-label">Category</label>
                <select className="ax-input" value={addGoalForm.category} onChange={e=>setAddGoalForm(f=>({...f,category:e.target.value}))}>
                  {Object.entries(GOAL_CATS).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
                </select>
              </div>
              <div>
                <label className="ax-label">Today's Target ($)</label>
                <input className="ax-input" type="number" min="0" value={addGoalForm.targetAmount||""} onChange={e=>setAddGoalForm(f=>({...f,targetAmount:parseFloat(e.target.value)||0}))} placeholder="In today's money"/>
              </div>
              <div>
                <label className="ax-label">Target Year</label>
                <input className="ax-input" type="number" min={CUR_YEAR} max={CUR_YEAR+60} value={addGoalForm.targetYear} onChange={e=>setAddGoalForm(f=>({...f,targetYear:parseInt(e.target.value)||CUR_YEAR+10}))}/>
              </div>
              <div>
                <label className="ax-label">Current Corpus ($)</label>
                <input className="ax-input" type="number" min="0" value={addGoalForm.currentCorpus||""} onChange={e=>setAddGoalForm(f=>({...f,currentCorpus:parseFloat(e.target.value)||0}))} placeholder="Already saved"/>
              </div>
              <div>
                <label className="ax-label">Monthly Contribution ($)</label>
                <input className="ax-input" type="number" min="0" value={addGoalForm.monthlyContrib||""} onChange={e=>setAddGoalForm(f=>({...f,monthlyContrib:parseFloat(e.target.value)||0}))} placeholder="Per month"/>
              </div>
              <div>
                <label className="ax-label">Inflation Rate (%)</label>
                <input className="ax-input" type="number" min="0" max="20" step="0.5" value={addGoalForm.inflationRate} onChange={e=>setAddGoalForm(f=>({...f,inflationRate:parseFloat(e.target.value)||6}))}/>
              </div>
              <div>
                <label className="ax-label">Expected Return (%)</label>
                <input className="ax-input" type="number" min="1" max="30" step="0.5" value={addGoalForm.expectedReturn} onChange={e=>setAddGoalForm(f=>({...f,expectedReturn:parseFloat(e.target.value)||12}))}/>
              </div>
            </div>
            {/* Preview */}
            {addGoalForm.targetAmount>0&&addGoalForm.targetYear>CUR_YEAR&&(()=>{
              const yrs=addGoalForm.targetYear-CUR_YEAR;
              const inflated=calcInflated(addGoalForm.targetAmount,addGoalForm.inflationRate,yrs);
              const needed=monthlyNeeded(addGoalForm.currentCorpus,inflated,yrs,addGoalForm.expectedReturn);
              return(
                <div style={{padding:"10px 12px",background:"#080f1e",borderRadius:9,fontSize:11,color:"#3d5a7a",marginBottom:12,display:"flex",gap:14,flexWrap:"wrap"}}>
                  <span>Inflation-adj target <b style={{color:"#dde3f0"}}>{fmt(inflated)}</b></span>
                  <span>Monthly needed <b style={{color:"#c9a84c"}}>{fmt(needed)}/mo</b></span>
                  <span>Gap <b style={{color:needed>addGoalForm.monthlyContrib?"#ff8c42":"#00d4a4"}}>{fmt(Math.max(0,needed-addGoalForm.monthlyContrib))}/mo</b></span>
                  <span>Volatility assumption <b style={{color:"#8aa0be"}}>{goalVol(addGoalForm.expectedReturn)}% σ</b></span>
                </div>
              );
            })()}
            <div style={{display:"flex",gap:10}}>
              <button className="ax-btn primary" onClick={addGoal} disabled={!addGoalForm.name.trim()||!addGoalForm.targetAmount}><Plus size={12}/> Add Goal</button>
              <button className="ax-btn" onClick={()=>setAddGoalForm(null)}>Cancel</button>
            </div>
          </div>
        ):(
          <button className="ax-btn" style={{alignSelf:"flex-start"}} onClick={()=>setAddGoalForm(defaultGoal(profile.riskAppetite))}>
            <Plus size={12}/> Add Financial Goal
          </button>
        )}

        {/* Probability legend */}
        <div style={{display:"flex",gap:16,flexWrap:"wrap",fontSize:10,color:"#3d5a7a",borderTop:"1px solid #1a2e4a",paddingTop:12}}>
          <span style={{color:"#8aa0be",fontWeight:600}}>MC probability scale:</span>
          {PROB_CONFIG.map(c=><span key={c.label} style={{display:"flex",alignItems:"center",gap:5,color:c.color}}><span style={{width:8,height:8,borderRadius:"50%",background:c.color,display:"inline-block"}}/>{c.label} (≥{c.min}%)</span>)}
        </div>
      </div>
    </div>
  );

  // ── FI PLAN TAB ───────────────────────────────────────────────────────────────
  if(tab==="fiplan"){
    const latestInv = entries.length ? entries[entries.length-1].investments : {};
    const rb = checkRebalancing(latestInv, fiPlan.targetEquityPct);
    const savBenchmark = fiPlan.essentialMonthly * 0.5;
    const meetsBenchmark = metrics && fiPlan.essentialMonthly > 0 && metrics.monthlySavings >= savBenchmark;

    return(
      <div className="apex">
        {showSettings && <SettingsModal/>}
        <AppHeader metrics={metrics} onTab={setTab} tab={tab} profileName={profile.name} goalAmount={goalAmount} onSettings={()=>setShowSettings(true)}/>
        <div style={{padding:18,display:"flex",flexDirection:"column",gap:16}}>

          {/* Source attribution */}
          <div style={{background:"rgba(201,168,76,.06)",border:"1px solid rgba(201,168,76,.15)",borderRadius:10,padding:"10px 14px",fontSize:11,color:"#8aa0be",lineHeight:1.6}}>
            <b style={{color:"#c9a84c"}}>Framework:</b> M Pattabiraman (freefincal.com) — 30× corpus formula, lifestyle inflation at 7–8%, savings benchmarked to expenses, bucket strategy. Based on Indian financial planning context; amounts entered in USD equivalent.
          </div>

          {/* ── FI NUMBER CALCULATOR ── */}
          <div className="ax-card">
            <div className="ax-sec"><Target size={11}/> FI Number Calculator</div>
            <div style={{fontSize:11,color:"#3d5a7a",marginBottom:14,lineHeight:1.7}}>
              Enter only essential couple expenses today — <b style={{color:"#8aa0be"}}>exclude EMIs</b> (gone at retirement), <b style={{color:"#8aa0be"}}>children's fees</b> (independent by then), and <b style={{color:"#8aa0be"}}>parents' support</b> (may not be needed). Use <b style={{color:"#c9a84c"}}>7% lifestyle inflation</b>, not government CPI of 4%.
            </div>
            <div className="frow">
              <div>
                <label className="ax-label">Essential monthly expenses today ($) <span style={{color:"#3d5a7a"}}>couple only</span></label>
                <input className="ax-input" type="number" min="0" value={fiPlan.essentialMonthly||""} onChange={e=>updFI("essentialMonthly",parseFloat(e.target.value)||0)} placeholder="e.g. 3000"/>
              </div>
              <div>
                <label className="ax-label">Years to retirement</label>
                <input className="ax-input" type="number" min="1" max="50" value={fiPlan.yearsToRetirement} onChange={e=>updFI("yearsToRetirement",parseInt(e.target.value)||15)}/>
              </div>
            </div>

            {/* Inflation rate toggle */}
            <div style={{marginBottom:14}}>
              <label className="ax-label">Lifestyle inflation rate</label>
              <div style={{display:"flex",gap:10}}>
                {[{v:7,label:"7%",desc:"Standard"},{v:8,label:"8%",desc:"Big spender"},{v:6,label:"6%",desc:"Frugal"}].map(o=>{
                  const sel=fiPlan.inflationRate===o.v;
                  return(
                    <button key={o.v} className="fi-multiple-btn" onClick={()=>updFI("inflationRate",o.v)}
                      style={{borderColor:sel?"#c9a84c":"#1a2e4a",background:sel?"rgba(201,168,76,.1)":"#080f1e"}}>
                      <div className="ax-mono" style={{fontSize:16,fontWeight:700,color:sel?"#c9a84c":"#7a9ab8"}}>{o.label}</div>
                      <div style={{fontSize:10,color:sel?"#c9a84c":"#3d5a7a",marginTop:2}}>{o.desc}</div>
                    </button>
                  );
                })}
              </div>
              <div style={{fontSize:10,color:"#3d5a7a",marginTop:6}}>Government CPI (~4%) is dal-chawal inflation. Your lifestyle runs at 7–8%. The difference over 15 years is enormous.</div>
            </div>

            {/* FI Multiple selector */}
            <div style={{marginBottom:16}}>
              <label className="ax-label">FI multiple</label>
              <div style={{display:"flex",gap:10}}>
                {[{v:30,label:"30×",desc:"FI threshold",color:"#c9a84c"},{v:35,label:"35×",desc:"Comfortable FI",color:"#00d4a4"},{v:40,label:"40×",desc:"True FI",color:"#4a9eff"}].map(o=>{
                  const sel=fiPlan.fiMultiple===o.v;
                  return(
                    <button key={o.v} className="fi-multiple-btn" onClick={()=>updFI("fiMultiple",o.v)}
                      style={{borderColor:sel?o.color:"#1a2e4a",background:sel?`${o.color}10`:"#080f1e"}}>
                      <div className="ax-mono" style={{fontSize:16,fontWeight:700,color:sel?o.color:"#7a9ab8"}}>{o.label}</div>
                      <div style={{fontSize:10,color:sel?o.color:"#3d5a7a",marginTop:2}}>{o.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Results */}
            {fi && (
              <div style={{background:"#080f1e",border:"1px solid #1a2e4a",borderRadius:10,padding:16}}>
                <div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:14}}>
                  <div style={{flex:1,minWidth:130}}>
                    <div className="ax-label">Inflation-adjusted annual expense</div>
                    <div className="ax-mono" style={{fontSize:20,fontWeight:700,color:"#dde3f0"}}>{fmt(fi.inflatedAnnual)}</div>
                    <div style={{fontSize:10,color:"#3d5a7a",marginTop:2}}>in {fiPlan.yearsToRetirement} years at {fiPlan.inflationRate}% p.a.</div>
                  </div>
                  <div style={{flex:1,minWidth:130}}>
                    <div className="ax-label">FI Threshold (30×)</div>
                    <div className="ax-mono" style={{fontSize:20,fontWeight:700,color:"#c9a84c"}}>{fmt(fi.fi30)}</div>
                  </div>
                  <div style={{flex:1,minWidth:130}}>
                    <div className="ax-label">Comfortable FI (35×)</div>
                    <div className="ax-mono" style={{fontSize:20,fontWeight:700,color:"#00d4a4"}}>{fmt(fi.fi35)}</div>
                  </div>
                  <div style={{flex:1,minWidth:130}}>
                    <div className="ax-label">True FI (40×)</div>
                    <div className="ax-mono" style={{fontSize:20,fontWeight:700,color:"#4a9eff"}}>{fmt(fi.fi40)}</div>
                  </div>
                </div>

                {/* Progress to FI30 */}
                <div style={{marginBottom:8}}>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"#3d5a7a",marginBottom:5}}>
                    <span>Progress to FI threshold (30×)</span>
                    <span className="ax-mono" style={{color:fi.prog30>=100?"#00d4a4":"#c9a84c",fontWeight:700}}>{fi.prog30.toFixed(1)}%</span>
                  </div>
                  <div style={{height:8,borderRadius:4,background:"#1a2e4a",overflow:"hidden",position:"relative"}}>
                    <div style={{width:`${Math.min(fi.prog30,100)}%`,height:"100%",background:fi.prog30>=100?"#00d4a4":"#c9a84c",borderRadius:4,transition:"width .9s ease"}}/>
                    {/* 35x and 40x markers */}
                    <div style={{position:"absolute",top:0,left:`${Math.min(100/35*30,100)}%`,width:2,height:"100%",background:"rgba(0,212,164,.5)"}}/>
                  </div>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:9,color:"#3d5a7a",marginTop:3}}>
                    <span>{fmt(metrics?.netWorth||0)} now</span>
                    <span>Gap: {fmt(fi.gap30)}</span>
                    <span>FI30× {fmt(fi.fi30)}</span>
                  </div>
                </div>

                <div style={{display:"flex",gap:14,fontSize:11,color:"#3d5a7a",flexWrap:"wrap",borderTop:"1px solid #1a2e4a",paddingTop:10}}>
                  <span>Year-1 withdrawal rate <b style={{color:"#c9a84c"}}>{fi.withdrawalRate.toFixed(2)}%</b></span>
                  <span style={{color:"#2a4060"}}>·</span>
                  <span>Rises with inflation each year (not constant like US 4% rule)</span>
                </div>
              </div>
            )}
            {!fiPlan.essentialMonthly && <div style={{fontSize:11,color:"#3d5a7a",textAlign:"center",padding:12}}>Enter your essential monthly expenses above to calculate your FI number.</div>}
          </div>

          {/* ── SAVINGS RATE HEALTH ── */}
          <div className="ax-card">
            <div className="ax-sec"><DollarSign size={11}/> Savings Rate Health (Pattu Benchmark)</div>
            <div style={{fontSize:11,color:"#3d5a7a",marginBottom:12,lineHeight:1.7}}>
              The benchmark shifts in your 30s: stop anchoring to salary %, start anchoring to essential expenses. Target: <b style={{color:"#c9a84c"}}>invest ≥50% of essential monthly expenses</b> (including employer EPF/NPS). With a home loan active: minimum 20–30%.
            </div>
            {fiPlan.essentialMonthly > 0 && metrics ? (
              <div>
                <div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:12}}>
                  <div style={{flex:1,minWidth:120,background:"#080f1e",borderRadius:9,padding:"10px 14px",border:"1px solid #1a2e4a"}}>
                    <div className="ax-label">Essential expenses/mo</div>
                    <div className="ax-mono" style={{fontSize:18,fontWeight:700}}>{fmt(fiPlan.essentialMonthly)}</div>
                  </div>
                  <div style={{flex:1,minWidth:120,background:"#080f1e",borderRadius:9,padding:"10px 14px",border:"1px solid #1a2e4a"}}>
                    <div className="ax-label">Benchmark (≥50%)</div>
                    <div className="ax-mono" style={{fontSize:18,fontWeight:700,color:"#c9a84c"}}>{fmt(savBenchmark)}/mo</div>
                  </div>
                  <div style={{flex:1,minWidth:120,background:"#080f1e",borderRadius:9,padding:"10px 14px",border:`1px solid ${meetsBenchmark?"#00d4a430":"#ff525230"}`}}>
                    <div className="ax-label">Your monthly savings</div>
                    <div className="ax-mono" style={{fontSize:18,fontWeight:700,color:meetsBenchmark?"#00d4a4":"#ff5252"}}>{fmt(metrics.monthlySavings)}/mo</div>
                  </div>
                </div>
                <div style={{padding:"10px 14px",borderRadius:9,background:meetsBenchmark?"rgba(0,212,164,.07)":"rgba(255,82,82,.07)",border:`1px solid ${meetsBenchmark?"#00d4a430":"#ff525230"}`,fontSize:12,display:"flex",alignItems:"center",gap:8}}>
                  {meetsBenchmark ? <CheckCircle size={13} color="#00d4a4"/> : <AlertOctagon size={13} color="#ff5252"/>}
                  <span style={{color:meetsBenchmark?"#00d4a4":"#ff5252"}}>
                    {meetsBenchmark
                      ? `Beating the benchmark by ${fmt(metrics.monthlySavings - savBenchmark)}/mo. Keep it up — and don't let lifestyle inflate as income grows.`
                      : `${fmt(savBenchmark - metrics.monthlySavings)}/mo below the Pattu benchmark. This gap compounds powerfully over ${fiPlan.yearsToRetirement} years.`}
                  </span>
                </div>
              </div>
            ) : (
              <div style={{fontSize:11,color:"#3d5a7a"}}>Enter essential expenses above and add a monthly snapshot to see your savings benchmark.</div>
            )}
          </div>

          {/* ── BUCKET STRATEGY ── */}
          <div className="ax-card">
            <div className="ax-sec"><Wallet size={11}/> Retirement Bucket Strategy</div>
            <div style={{fontSize:11,color:"#3d5a7a",marginBottom:14,lineHeight:1.7}}>
              Purpose is <b style={{color:"#8aa0be"}}>behavioral, not efficiency</b>. Knowing Bucket 1 is safe for 2–3 years lets you ignore market noise and not panic-sell equities in downturns.
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {[
                { n:1, label:"Bucket 1 — Sleep-Well Bucket", color:"#4a9eff", desc:"Pure fixed income: FDs, liquid funds, short-term debt. 2–3 years of expenses. Refill from Bucket 2 as needed. Never equity.",
                  amount: fi ? fmt(fi.bucket1Amount) : "—", target: fi ? `${fiPlan.bucket1Months} months of expenses = ${fmt(fi.bucket1Amount)}` : "Set essential expenses above" },
                { n:2, label:"Bucket 2 — Transition Bucket",  color:"#c9a84c", desc:"Balanced advantage funds or equity savings funds (~20% equity, ~80% debt). Medium risk. Replenishes Bucket 1 gradually.", amount:"~20% corpus", target:"Set up only near retirement" },
                { n:3, label:"Bucket 3 — Growth Bucket",      color:"#00d4a4", desc:"Pure equity: Nifty 50 index fund or flexi-cap. Long time horizon. Don't touch for 7+ years. Ignore daily noise entirely.", amount:"~70–80% corpus", target:"Your current main investment" },
              ].map(b=>(
                <div key={b.n} className="bucket-lane">
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <div style={{width:28,height:28,borderRadius:7,background:`${b.color}18`,border:`1px solid ${b.color}40`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:13,fontWeight:700,color:b.color}}>{b.n}</div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:12,fontWeight:600,color:"#dde3f0"}}>{b.label}</div>
                      <div style={{fontSize:10,color:"#3d5a7a",marginTop:1}}>{b.target}</div>
                    </div>
                    <div className="ax-mono" style={{fontSize:13,fontWeight:700,color:b.color,flexShrink:0}}>{b.amount}</div>
                  </div>
                  <div style={{fontSize:11,color:"#7a9ab8",lineHeight:1.6,paddingLeft:38}}>{b.desc}</div>
                </div>
              ))}
            </div>
            <div style={{marginTop:12}}>
              <label className="ax-label">Months of expenses in Bucket 1 (target: 24–36)</label>
              <input className="ax-input" type="number" min="12" max="60" value={fiPlan.bucket1Months} onChange={e=>updFI("bucket1Months",parseInt(e.target.value)||30)} style={{maxWidth:160}}/>
            </div>
          </div>

          {/* ── REBALANCING CHECK ── */}
          <div className="ax-card">
            <div className="ax-sec"><TrendingUp size={11}/> Asset Allocation & Rebalancing</div>
            <div style={{fontSize:11,color:"#3d5a7a",marginBottom:14,lineHeight:1.7}}>
              Pattu rule: <b style={{color:"#8aa0be"}}>don't rebalance annually</b>. Trigger only when drift exceeds 5%. Strongest signal: an asset class has had a big run — lock in the gain. Don't let LTCG tax anxiety paralise you.
            </div>
            <div className="frow">
              <div>
                <label className="ax-label">Target equity allocation (%)</label>
                <input className="ax-input" type="number" min="0" max="100" value={fiPlan.targetEquityPct} onChange={e=>updFI("targetEquityPct",parseInt(e.target.value)||60)}/>
                <div style={{fontSize:10,color:"#3d5a7a",marginTop:4}}>Replace 30% equity with bonds = lower risk, small return hit. Pattu's "free lunch".</div>
              </div>
              <div>
                <label className="ax-label">Last rebalanced</label>
                <input className="ax-input" type="text" value={fiPlan.lastRebalanced} onChange={e=>updFI("lastRebalanced",e.target.value)} placeholder="e.g. Nov 2025"/>
              </div>
            </div>
            {entries.length > 0 && (
              <div style={{marginTop:12,padding:"12px 14px",borderRadius:10,background:"#080f1e",border:`1px solid ${rb.needsRebalancing?"#ff8c42":"#1a2e4a"}`}}>
                <div style={{display:"flex",gap:14,flexWrap:"wrap",marginBottom:rb.needsRebalancing?10:0}}>
                  <span style={{fontSize:11,color:"#3d5a7a"}}>Current equity: <b style={{color:rb.needsRebalancing?"#ff8c42":"#dde3f0"}}>{rb.cur.toFixed(1)}%</b></span>
                  <span style={{fontSize:11,color:"#3d5a7a"}}>Target: <b style={{color:"#dde3f0"}}>{fiPlan.targetEquityPct}%</b></span>
                  <span style={{fontSize:11,color:"#3d5a7a"}}>Drift: <b style={{color:rb.needsRebalancing?"#ff8c42":"#00d4a4"}}>{rb.drift>0?"+":""}{rb.drift.toFixed(1)}%</b></span>
                  <span className="ins-status" style={{background:rb.needsRebalancing?"rgba(255,140,66,.1)":"rgba(0,212,164,.1)",color:rb.needsRebalancing?"#ff8c42":"#00d4a4",border:`1px solid ${rb.needsRebalancing?"#ff8c4230":"#00d4a430"}`}}>
                    {rb.needsRebalancing?"Rebalance now":"Balanced"}
                  </span>
                </div>
                {rb.needsRebalancing && (
                  <div style={{fontSize:11,color:"#ff8c42",lineHeight:1.6}}>
                    Drift of {rb.abs.toFixed(1)}% exceeds the 5% trigger. Trim the outperforming asset class and add to the lagging one. The goal is not maximum growth — it's gradual growth without violent swings.
                  </div>
                )}
                <div style={{fontSize:10,color:"#3d5a7a",marginTop:rb.needsRebalancing?6:0}}>
                  Equity tracked: stocks + mutual funds + crypto. Debt: real estate + gold + EPF.
                </div>
              </div>
            )}
          </div>

          {/* ── PATTU INSIGHTS ── */}
          <div>
            <div className="ax-sec" style={{marginBottom:12}}><Brain size={11}/> Key Insights from Pattu</div>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {PATTU_INSIGHTS.map((ins,i)=>(
                <div key={i} className="insight-card" style={{borderLeftColor:ins.color}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:2}}>
                    <span className="insight-tag" style={{background:`${ins.color}18`,color:ins.color}}>{ins.tag}</span>
                    <span style={{fontSize:12,fontWeight:600,color:"#dde3f0"}}>{ins.title}</span>
                  </div>
                  <div style={{fontSize:11.5,color:"#8aa0be",lineHeight:1.65}}>{ins.body}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{fontSize:11,color:"#3d5a7a",borderTop:"1px solid #1a2e4a",paddingTop:12,lineHeight:1.7}}>
            <b style={{color:"#8aa0be"}}>Source:</b> M Pattabiraman, freefincal.com — 38-min interview on building a ₹10 crore corpus. Framework is India-specific; enter all amounts in USD equivalent. Run the AI Advisor for a personalised FI trajectory analysis using these benchmarks.
          </div>
        </div>
      </div>
    );
  }

  // ── RISK & INSURANCE TAB ─────────────────────────────────────────────────────
  if(tab==="insurance"){
    const p=prot;
    const scoreColor=p.overallCfg.color;

    // Helper: a single coverage card
    const CoverCard=({title,Icon,iconColor,score,current,recommended,gap,children,insight})=>{
      const c=score>=80?"#00d4a4":score>=60?"#c9a84c":score>=30?"#ff8c42":"#ff5252";
      const statusLabel=score>=80?"Adequate":score>=60?"Partial":score>=30?"Critical gap":"Not covered";
      return(
        <div className="ins-card">
          <div style={{display:"flex",alignItems:"center",gap:12,justifyContent:"space-between",flexWrap:"wrap"}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:38,height:38,borderRadius:9,background:`${iconColor}14`,border:`1px solid ${iconColor}30`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                <Icon size={17} color={iconColor}/>
              </div>
              <div>
                <div style={{fontWeight:600,fontSize:13}}>{title}</div>
                {recommended>0&&<div style={{fontSize:10,color:"#3d5a7a",marginTop:1}}>Current {fmt(current)} · Recommended {fmt(recommended)}</div>}
              </div>
            </div>
            <span className="ins-status" style={{background:`${c}12`,color:c,border:`1px solid ${c}30`}}>{statusLabel} {score}%</span>
          </div>
          {recommended>0&&(
            <div>
              <div className="ins-bar-track">
                <div className="ins-bar-fill" style={{width:`${score}%`,background:c}}/>
              </div>
              {gap>0&&<div style={{fontSize:11,color:"#ff8c42",marginTop:5,display:"flex",alignItems:"center",gap:5}}><TrendingDown size={11}/> Gap: <b>{fmt(gap)}</b> of additional coverage needed</div>}
            </div>
          )}
          {children}
          {insight&&<div style={{fontSize:11,color:"#8aa0be",background:"#080f1e",borderRadius:8,padding:"8px 12px",lineHeight:1.6,borderLeft:`2px solid ${c}40`}}>{insight}</div>}
        </div>
      );
    };

    return(
      <div className="apex">
        {showSettings && <SettingsModal/>}
        <AppHeader metrics={metrics} onTab={setTab} tab={tab} profileName={profile.name} goalAmount={goalAmount} onSettings={()=>setShowSettings(true)}/>
        <div style={{padding:18,display:"flex",flexDirection:"column",gap:16}}>

          {/* Overall protection score */}
          <div className="ax-card" style={{padding:"20px 22px"}}>
            <div style={{display:"flex",alignItems:"center",gap:20,flexWrap:"wrap"}}>
              {/* Big score */}
              <div style={{textAlign:"center",flexShrink:0}}>
                <div style={{width:88,height:88,borderRadius:20,background:`${scoreColor}10`,border:`2px solid ${scoreColor}40`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
                  <Shield size={16} color={scoreColor} style={{marginBottom:2}}/>
                  <span className="ax-mono" style={{fontSize:28,fontWeight:700,color:scoreColor,lineHeight:1}}>{p.overall}</span>
                  <span style={{fontSize:8,color:scoreColor,opacity:.7}}>/ 100</span>
                </div>
                <div style={{fontSize:10,fontWeight:700,color:scoreColor,marginTop:6,letterSpacing:".04em"}}>{p.overallCfg.label.toUpperCase()}</div>
              </div>
              {/* Component bars */}
              <div style={{flex:1,display:"flex",flexDirection:"column",gap:9,minWidth:200}}>
                {[
                  {label:"Life Cover (35%)",      score:p.lifeScore,   Icon:Umbrella,     w:.35},
                  {label:"Health Cover (30%)",    score:p.healthScore, Icon:Activity,     w:.30},
                  {label:"Emergency Fund (20%)",  score:p.emScore,     Icon:Shield,       w:.20},
                  {label:"Disability Cover (10%)",score:p.disScore,    Icon:AlertOctagon, w:.10},
                  {label:"Credit Score (5%)",     score:p.creditNorm,  Icon:CreditCard,   w:.05},
                ].map(({label,score,Icon,w})=>{
                  const c=score>=80?"#00d4a4":score>=60?"#c9a84c":score>=30?"#ff8c42":"#ff5252";
                  return(
                    <div key={label} style={{display:"flex",alignItems:"center",gap:8}}>
                      <Icon size={11} color={c} style={{flexShrink:0}}/>
                      <span style={{fontSize:10.5,color:"#7a9ab8",width:160,flexShrink:0}}>{label}</span>
                      <div style={{flex:1,height:5,background:"#1a2e4a",borderRadius:3,overflow:"hidden"}}>
                        <div style={{width:`${score}%`,height:"100%",background:c,borderRadius:3,transition:"width .8s ease"}}/>
                      </div>
                      <span className="ax-mono" style={{fontSize:10,color:c,width:34,textAlign:"right",flexShrink:0}}>{score}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div style={{marginTop:14,fontSize:11,color:"#3d5a7a",lineHeight:1.6}}>
              Protection score weights: Life 35% · Health 30% · Emergency Fund 20% · Disability 10% · Credit Score 5%. Benchmarks use Indian financial planning standards (15× income life cover, ₹25L family health cover).
            </div>
          </div>

          {/* 1 ── Life Cover */}
          <CoverCard title="Life Cover (Term + Other)" Icon={Umbrella} iconColor="#4a9eff"
            score={p.lifeScore} current={p.curLife} recommended={p.recLife} gap={p.lifeGap}
            insight={p.lifeScore<80
              ? `You need ${fmt(p.recLife)} in total life cover (${p.hasDep?"15×":"10×"} annual income${p.hasDep?" with dependents":""}). Consider a term plan — ₹1Cr cover typically costs ₹8,000–15,000/year for a 30-year-old. Pure term > ULIPs for this purpose.`
              : "Life cover is adequate. Review every 5 years or when income changes significantly."
            }>
            <div className="frow" style={{marginBottom:0}}>
              <div><label className="ax-label">Term Life Cover ($)</label>
                <input className="ax-input" type="number" min="0" value={insurance.termLifeCover||""} onChange={e=>updIns("termLifeCover",parseFloat(e.target.value)||0)} placeholder="Sum assured"/>
              </div>
              <div><label className="ax-label">Other Life Insurance ($)</label>
                <input className="ax-input" type="number" min="0" value={insurance.otherLifeCover||""} onChange={e=>updIns("otherLifeCover",parseFloat(e.target.value)||0)} placeholder="LIC, ULIP, etc."/>
              </div>
            </div>
            {p.annualIncome>0&&<div style={{fontSize:11,color:"#3d5a7a",display:"flex",gap:14,flexWrap:"wrap"}}>
              <span>Annual income <b style={{color:"#dde3f0"}}>{fmt(p.annualIncome)}</b></span>
              <span>Recommended ({p.hasDep?"15×":"10×"}) <b style={{color:"#dde3f0"}}>{fmt(p.recLife)}</b></span>
            </div>}
          </CoverCard>

          {/* 2 ── Health Cover */}
          <CoverCard title="Health Insurance" Icon={Activity} iconColor="#d4537e"
            score={p.healthScore} current={p.curHealth} recommended={p.recHealth} gap={p.healthGap}
            insight={p.healthScore<80
              ? `Target: ${fmt(p.recHealth)} total (individual $12K + family ${p.hasDep?"$30K":"N/A"}). Consider a base policy + super top-up for cost efficiency. Critical illness rider adds another $15–20K coverage.`
              : "Health cover is adequate. Add a super top-up for additional cushion at low cost."
            }>
            <div className="frow" style={{marginBottom:0}}>
              <div><label className="ax-label">Individual Cover ($)</label>
                <input className="ax-input" type="number" min="0" value={insurance.healthSelf||""} onChange={e=>updIns("healthSelf",parseFloat(e.target.value)||0)} placeholder="Your health policy"/>
              </div>
              <div><label className="ax-label">Family Floater ($)</label>
                <input className="ax-input" type="number" min="0" value={insurance.healthFamily||""} onChange={e=>updIns("healthFamily",parseFloat(e.target.value)||0)} placeholder="Family policy"/>
              </div>
              <div><label className="ax-label">Critical Illness ($)</label>
                <input className="ax-input" type="number" min="0" value={insurance.criticalIllness||""} onChange={e=>updIns("criticalIllness",parseFloat(e.target.value)||0)} placeholder="CI rider/policy"/>
              </div>
              <div><label className="ax-label">Super Top-Up ($)</label>
                <input className="ax-input" type="number" min="0" value={insurance.superTopUp||""} onChange={e=>updIns("superTopUp",parseFloat(e.target.value)||0)} placeholder="Top-up policy"/>
              </div>
            </div>
          </CoverCard>

          {/* 3 ── Emergency Fund */}
          <CoverCard title="Emergency Fund (Liquid)" Icon={Shield} iconColor="#ff8c42"
            score={p.emScore} current={insurance.emergencyAmount} recommended={p.recEmergency} gap={p.emGap}
            insight={p.emMonths<6
              ? `You have ${p.emMonths.toFixed(1)} months of expenses liquid. Target 6 months (${fmt(p.recEmergency)}). Keep in a liquid FD or money market fund — not equity. Without this, any job loss forces you to sell investments at a bad time.`
              : "Emergency fund is solid. Keep it in a liquid FD or savings account, not equity."
            }>
            <div><label className="ax-label">Emergency Fund Amount ($)</label>
              <input className="ax-input" type="number" min="0" value={insurance.emergencyAmount||""} onChange={e=>updIns("emergencyAmount",parseFloat(e.target.value)||0)} placeholder="Liquid cash / FD / liquid fund"/>
            </div>
            {metrics&&<div style={{fontSize:11,color:"#3d5a7a",display:"flex",gap:14,flexWrap:"wrap"}}>
              <span>Monthly expenses <b style={{color:"#dde3f0"}}>{fmt(metrics.totalExp)}</b></span>
              <span>Coverage <b style={{color:p.emMonths>=6?"#00d4a4":p.emMonths>=3?"#c9a84c":"#ff5252"}}>{p.emMonths.toFixed(1)} months</b></span>
              <span>Target <b style={{color:"#dde3f0"}}>{fmt(p.recEmergency)}</b></span>
            </div>}
          </CoverCard>

          {/* 4 ── Disability Cover */}
          <CoverCard title="Disability / Income Protection" Icon={AlertOctagon} iconColor="#c9a84c"
            score={p.disScore} current={p.curDis} recommended={p.recDis} gap={Math.max(0,p.recDis-p.curDis)}
            insight={p.disScore<60
              ? "Disability is the #1 underinsured risk. A permanent disability stops income but not expenses. Individual disability plans replace 50–70% of income. If employer provides group cover, document it here. WC policies do NOT cover sickness or accidents outside work."
              : "Disability cover is adequate. Review annually and after any salary increase."
            }>
            <div className="frow" style={{marginBottom:8}}>
              <div><label className="ax-label">Disability Income Cover ($/mo)</label>
                <input className="ax-input" type="number" min="0" value={insurance.disabilityMonthly||""} onChange={e=>updIns("disabilityMonthly",parseFloat(e.target.value)||0)} placeholder="Monthly benefit"/>
              </div>
            </div>
            <div className="toggle-row" onClick={()=>updIns("groupDisability",!insurance.groupDisability)} style={{marginTop:-4}}>
              <div className={`toggle-track ${insurance.groupDisability?"on":""}`}><div className="toggle-knob"/></div>
              <div>
                <div style={{fontSize:13,fontWeight:500}}>Employer group disability cover</div>
                <div style={{fontSize:11,color:"#3d5a7a",marginTop:1}}>Employer-provided group disability insurance (counts as ~6 months income replacement)</div>
              </div>
            </div>
          </CoverCard>

          {/* 5 ── Credit Score */}
          <div className="ins-card">
            <div style={{display:"flex",alignItems:"center",gap:12,justifyContent:"space-between",flexWrap:"wrap"}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <div style={{width:38,height:38,borderRadius:9,background:`${p.creditColor}14`,border:`1px solid ${p.creditColor}30`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  <CreditCard size={17} color={p.creditColor}/>
                </div>
                <div>
                  <div style={{fontWeight:600,fontSize:13}}>Credit Score (CIBIL / Experian)</div>
                  <div style={{fontSize:10,color:"#3d5a7a",marginTop:1}}>Affects loan interest rates and borrowing capacity</div>
                </div>
              </div>
              {insurance.creditScore>0&&(
                <span className="ins-status" style={{background:`${p.creditColor}12`,color:p.creditColor,border:`1px solid ${p.creditColor}30`,fontSize:12}}>
                  {insurance.creditScore} — {p.creditLabel}
                </span>
              )}
            </div>

            {/* Score bar 300–900 */}
            {insurance.creditScore>0&&(
              <div>
                <div className="credit-track" style={{marginBottom:6}}>
                  <div className="credit-pin" style={{left:`${((insurance.creditScore-300)/600)*100}%`}}/>
                </div>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:9,color:"#3d5a7a"}}>
                  <span>300 Poor</span><span>600 Fair</span><span>750 Good</span><span>900 Excellent</span>
                </div>
                <div style={{marginTop:10,fontSize:11,color:"#8aa0be",lineHeight:1.6}}>
                  {insurance.creditScore>=750?"Excellent score — you qualify for the best loan rates. Maintain by keeping credit utilisation below 30% and paying all EMIs on time.":
                   insurance.creditScore>=700?"Good score — minor improvements will unlock better rates. Avoid new credit applications for 6 months, reduce utilisation.":
                   insurance.creditScore>=650?"Fair score — loan approvals may be difficult or expensive. Check for errors on your CIBIL report. Prioritise clearing outstanding dues.":
                   "Poor score — urgent action needed. Check CIBIL report, dispute errors, clear dues. Poor credit adds 2–4% to loan rates, costing lakhs over a home loan tenure."}
                </div>
              </div>
            )}

            <div className="frow" style={{marginBottom:0}}>
              <div><label className="ax-label">Your Credit Score</label>
                <input className="ax-input" type="number" min="300" max="900" value={insurance.creditScore||""} onChange={e=>updIns("creditScore",parseInt(e.target.value)||0)} placeholder="300–900 (CIBIL)"/>
              </div>
              <div><label className="ax-label">Last Checked</label>
                <input className="ax-input" type="text" value={insurance.creditScoreDate} onChange={e=>updIns("creditScoreDate",e.target.value)} placeholder="e.g. Dec 2025"/>
              </div>
            </div>
            {!insurance.creditScore&&<div style={{fontSize:11,color:"#3d5a7a",lineHeight:1.6}}>Check your free CIBIL score at <b style={{color:"#c9a84c"}}>cibil.com</b> or via your bank app. Scores update monthly.</div>}
          </div>

          {/* Notes */}
          <div style={{fontSize:11,color:"#3d5a7a",borderTop:"1px solid #1a2e4a",paddingTop:12,lineHeight:1.7}}>
            <b style={{color:"#8aa0be"}}>Note:</b> All coverage amounts in USD equivalents. Convert from INR using current rate (₹84 = $1). Benchmarks: Life cover = {prot.hasDep?"15×":"10×"} annual income, Health = ${prot.recHealth.toLocaleString()} total, Emergency = 6× monthly expenses. Run AI Advisor to get a personalised insurance action plan.
          </div>
        </div>
      </div>
    );
  }

  // ── PROFILE TAB ──────────────────────────────────────────────────────────────
  if(tab==="profile") return(
    <div className="apex">
      {showSettings && <SettingsModal/>}
      <AppHeader metrics={metrics} onTab={setTab} tab={tab} profileName={profile.name} goalAmount={goalAmount} onSettings={()=>setShowSettings(true)}/>
      <div style={{padding:18,display:"flex",flexDirection:"column",gap:16}}>
        <div className="ax-card" style={{display:"flex",alignItems:"center",gap:16,padding:"16px 20px"}}>
          <div className="avatar" style={{width:58,height:58,fontSize:20}}>{initials(profile.name)}</div>
          <div style={{flex:1}}>
            <div style={{fontSize:15,fontWeight:700}}>{profile.name||"Your Profile"}</div>
            <div style={{fontSize:11,color:"#3d5a7a",marginTop:3}}>Profile completeness</div>
            <div className="pbar" style={{width:160,marginTop:6}}><div className="pbar-fill" style={{width:`${pComplete}%`}}/></div>
            <div style={{fontSize:10,color:pComplete===100?"#00d4a4":"#c9a84c",marginTop:4}}>{pComplete}% complete</div>
          </div>
          {saveMsg&&<span style={{fontSize:11,color:"#00d4a4"}}>✓ {saveMsg}</span>}
        </div>
        <div className="ax-card">
          <div className="ax-sec"><User size={11}/> Personal Details</div>
          <div className="frow">
            <div><label className="ax-label">Full Name</label><input className="ax-input" value={profile.name} onChange={e=>updP("name",e.target.value)} placeholder="Your name"/></div>
            <div><label className="ax-label">Current Age</label><input className="ax-input" type="number" min="18" max="80" value={profile.age||""} onChange={e=>updP("age",parseInt(e.target.value)||"")} placeholder="e.g. 32"/></div>
            <div><label className="ax-label">Retirement Age</label><input className="ax-input" type="number" min="40" max="80" value={profile.retirementAge||""} onChange={e=>updP("retirementAge",parseInt(e.target.value)||60)} placeholder="e.g. 60"/></div>
            <div>{profile.age&&profile.retirementAge?(<div style={{background:"#080f1e",border:"1px solid #1a2e4a",borderRadius:8,padding:"10px 14px"}}><div className="ax-label" style={{marginBottom:3}}>Years to retirement</div><div className="ax-mono ax-gold" style={{fontSize:24,fontWeight:700}}>{Math.max(0,profile.retirementAge-profile.age)}</div></div>):(<div style={{fontSize:11,color:"#3d5a7a",display:"flex",alignItems:"center",height:"100%"}}>Fill age + retirement age</div>)}</div>
          </div>
        </div>
        <div className="ax-card">
          <div className="ax-sec">Risk Appetite</div>
          <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
            {RISK_OPTIONS.map(opt=>{const sel=profile.riskAppetite===opt.id;return(
              <div key={opt.id} className="risk-btn" onClick={()=>updP("riskAppetite",opt.id)} style={{background:sel?opt.bg:"#080f1e",border:`1px solid ${sel?opt.border:"#1a2e4a"}`}}>
                <div style={{fontSize:13,fontWeight:700,color:sel?opt.color:"#7a9ab8",marginBottom:4}}>{opt.label}</div>
                <div style={{fontSize:11,color:sel?opt.color:"#3d5a7a",marginBottom:3}}>{opt.desc}</div>
                <div style={{fontSize:10,color:"#3d5a7a",lineHeight:1.5}}>{opt.detail}</div>
                {sel&&<div style={{marginTop:8,display:"inline-flex",alignItems:"center",gap:3,fontSize:10,fontWeight:700,color:opt.color}}><CheckCircle size={9}/> Active</div>}
              </div>
            );})}
          </div>
        </div>
        <div className="ax-card">
          <div className="ax-sec"><Users size={11}/> Dependents</div>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            <Toggle value={profile.dependents.spouse} onChange={v=>updDep("spouse",v)} label="Spouse / Partner" sub="Financially dependent on your income"/>
            <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
              <div className="ax-card" style={{flex:1,minWidth:160,display:"flex",alignItems:"center",justifyContent:"space-between",gap:12}}>
                <div><div style={{fontSize:13,fontWeight:500}}>Children</div><div style={{fontSize:11,color:"#3d5a7a"}}>Dependent children</div></div>
                <Stepper value={profile.dependents.children} onChange={v=>updDep("children",v)} max={8}/>
              </div>
              <div className="ax-card" style={{flex:1,minWidth:160,display:"flex",alignItems:"center",justifyContent:"space-between",gap:12}}>
                <div><div style={{fontSize:13,fontWeight:500}}>Parents</div><div style={{fontSize:11,color:"#3d5a7a"}}>Financially dependent</div></div>
                <Stepper value={profile.dependents.parents} onChange={v=>updDep("parents",v)} max={4}/>
              </div>
            </div>
          </div>
        </div>
        <div className="ax-card">
          <div className="ax-sec"><Calendar size={11}/> Life Events Calendar</div>
          <div style={{fontSize:11,color:"#3d5a7a",marginBottom:14,lineHeight:1.6}}>Major upcoming expenses that compete with your $1M goal. APEX factors these into trajectory and alerts.</div>
          {profile.lifeEvents.filter(e=>e.label).length>0&&(
            <div style={{marginBottom:18,padding:"10px 6px 4px",background:"#080f1e",borderRadius:10,border:"1px solid #1a2e4a",overflowX:"auto"}}>
              <EventTimeline events={profile.lifeEvents} retirementAge={profile.retirementAge} age={profile.age}/>
            </div>
          )}
          {profile.lifeEvents.length>0&&(
            <div style={{display:"flex",flexDirection:"column",gap:7,marginBottom:14}}>
              {[...profile.lifeEvents].sort((a,b)=>a.year-b.year).map(ev=>{const u=eventUrgency(ev.year);return(
                <div key={ev.id} style={{display:"flex",alignItems:"center",gap:8}}>
                  <div style={{width:3,height:36,borderRadius:2,background:u.color,flexShrink:0}}/>
                  <div className="ev-row" style={{flex:1}}>
                    <input className="ax-input" value={ev.label} onChange={e=>updEv(ev.id,"label",e.target.value)} placeholder="Event name"/>
                    <input className="ax-input" type="number" min={CUR_YEAR} max={CUR_YEAR+60} value={ev.year} onChange={e=>updEv(ev.id,"year",parseInt(e.target.value)||CUR_YEAR+5)}/>
                    <input className="ax-input" type="number" min="0" value={ev.cost||""} onChange={e=>updEv(ev.id,"cost",parseFloat(e.target.value)||0)} placeholder="Cost $"/>
                    <button className="ax-btn del" onClick={()=>delEv(ev.id)} style={{padding:"6px 8px",minWidth:30}}><Trash2 size={12}/></button>
                  </div>
                </div>
              );})}
            </div>
          )}
          <div style={{border:"1px dashed #1a2e4a",borderRadius:10,padding:14}}>
            <div className="ax-label" style={{marginBottom:10}}>Add Life Event</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 80px 100px auto",gap:8,alignItems:"center"}}>
              <input className="ax-input" value={newEv.label} onChange={e=>setNewEv(n=>({...n,label:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&addEv()} placeholder="e.g. Child's college"/>
              <input className="ax-input" type="number" min={CUR_YEAR} max={CUR_YEAR+60} value={newEv.year} onChange={e=>setNewEv(n=>({...n,year:parseInt(e.target.value)||CUR_YEAR+5}))}/>
              <input className="ax-input" type="number" min="0" value={newEv.cost||""} onChange={e=>setNewEv(n=>({...n,cost:parseFloat(e.target.value)||0}))} placeholder="Cost $"/>
              <button className="ax-btn primary" onClick={addEv} disabled={!newEv.label.trim()}><Plus size={12}/> Add</button>
            </div>
          </div>
        </div>
        <button className="ax-btn" style={{alignSelf:"flex-start"}} onClick={()=>setTab("dashboard")}><ChevronRight size={12} style={{transform:"rotate(180deg)"}}/> Dashboard</button>
      </div>
    </div>
  );

  // ── MONTHLY UPDATE ───────────────────────────────────────────────────────────
  if(tab==="update") return(
    <div className="apex">
      {showSettings && <SettingsModal/>}
      <AppHeader metrics={metrics} onTab={setTab} tab={tab} profileName={profile.name} goalAmount={goalAmount} onSettings={()=>setShowSettings(true)}/>
      <div style={{padding:18,display:"flex",flexDirection:"column",gap:16}}>
        <div className="ax-card">
          <div className="ax-sec"><UploadCloud size={11}/> Upload Statement (Optional)</div>
          <div className="drop-zone" onClick={()=>fileRef.current?.click()} onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();const f=e.dataTransfer.files[0];if(f){setUploadFile(f);parseStatement(f);}}}>
            <input ref={fileRef} type="file" accept=".pdf,image/*" style={{display:"none"}} onChange={e=>{const f=e.target.files[0];if(f){setUploadFile(f);parseStatement(f);}}}/>
            {parsingFile?<div style={{display:"flex",alignItems:"center",gap:8,justifyContent:"center",color:"#c9a84c",fontSize:12}}><Loader size={14} className="spinning"/> Parsing with AI...</div>
              :uploadFile?<div style={{color:"#00d4a4",fontSize:12,display:"flex",alignItems:"center",gap:6,justifyContent:"center"}}><CheckCircle size={13}/> {uploadFile.name}</div>
              :<div style={{color:"#3d5a7a",fontSize:12}}>Drop PDF or image · click to browse<br/><span style={{fontSize:10}}>Bank/investment statements — AI extracts key numbers</span></div>}
          </div>
          {parsedNote&&<div style={{marginTop:10,fontSize:11,color:"#8aa0be",background:"#080f1e",padding:"8px 12px",borderRadius:8,lineHeight:1.5}}>📋 {parsedNote}</div>}
        </div>
        <div className="ax-card">
          <div className="ax-sec" style={{marginBottom:14}}>Snapshot for: {form.label}</div>
          <div style={{marginBottom:12}}><label className="ax-label">Net Worth (Total Assets − Liabilities)</label><input className="ax-input" type="number" min="0" value={form.netWorth||""} placeholder="USD" onChange={e=>setForm(f=>({...f,netWorth:parseFloat(e.target.value)||0}))}/></div>
          <div style={{marginBottom:14}}><label className="ax-label">Bank / Cash Balance</label><input className="ax-input" type="number" min="0" value={form.bankBalance||""} placeholder="0" onChange={e=>setForm(f=>({...f,bankBalance:parseFloat(e.target.value)||0}))}/></div>
          <hr className="ax-divider"/>
          <div className="ax-sec"><Wallet size={11}/> Investments</div>
          <div className="frow">
            <Field label="Equity / Stocks" value={form.investments.equity} onChange={v=>upd("investments","equity",v)}/>
            <Field label="Mutual Funds" value={form.investments.mutualFunds} onChange={v=>upd("investments","mutualFunds",v)}/>
            <Field label="Real Estate" value={form.investments.realEstate} onChange={v=>upd("investments","realEstate",v)}/>
            <Field label="Gold / Commodities" value={form.investments.gold} onChange={v=>upd("investments","gold",v)}/>
            <Field label="Crypto" value={form.investments.crypto} onChange={v=>upd("investments","crypto",v)}/>
            <Field label="EPF / PF / NPS" value={form.investments.epf} onChange={v=>upd("investments","epf",v)}/>
          </div>
          <hr className="ax-divider"/>
          <div className="ax-sec"><CreditCard size={11}/> Outstanding Loans</div>
          <div className="frow">
            <Field label="Home Loan" value={form.loans.home} onChange={v=>upd("loans","home",v)}/>
            <Field label="Personal Loan" value={form.loans.personal} onChange={v=>upd("loans","personal",v)}/>
            <Field label="Vehicle Loan" value={form.loans.vehicle} onChange={v=>upd("loans","vehicle",v)}/>
            <Field label="Education Loan" value={form.loans.education} onChange={v=>upd("loans","education",v)}/>
          </div>
          <hr className="ax-divider"/>
          <div className="ax-sec"><DollarSign size={11}/> Monthly Income</div>
          <div className="frow">
            <Field label="Salary (net take-home)" value={form.income.salary} onChange={v=>upd("income","salary",v)}/>
            <Field label="Business / Freelance" value={form.income.business} onChange={v=>upd("income","business",v)}/>
            <Field label="Rental Income" value={form.income.rental} onChange={v=>upd("income","rental",v)}/>
            <Field label="Dividends / Returns" value={form.income.dividends} onChange={v=>upd("income","dividends",v)}/>
          </div>
          <hr className="ax-divider"/>
          <div className="ax-sec">Monthly Expenses</div>
          <div className="frow">
            <Field label="Essentials" value={form.expenses.essentials} onChange={v=>upd("expenses","essentials",v)}/>
            <Field label="Discretionary" value={form.expenses.discretionary} onChange={v=>upd("expenses","discretionary",v)}/>
            <Field label="EMI Payments" value={form.expenses.emi} onChange={v=>upd("expenses","emi",v)}/>
          </div>
          <hr className="ax-divider"/>
          <div style={{marginBottom:14}}><label className="ax-label">Notes / Context</label><textarea className="ax-input" rows={3} value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} placeholder="Bonus, big expense, salary hike..." style={{resize:"vertical"}}/></div>
          <div style={{display:"flex",gap:10,alignItems:"center"}}>
            <button className="ax-btn primary" onClick={saveEntry}><Save size={12}/> Save Month</button>
            <button className="ax-btn" onClick={()=>setTab("dashboard")}>Cancel</button>
            {saveMsg&&<span style={{fontSize:11,color:"#00d4a4"}}>✓ {saveMsg}</span>}
          </div>
        </div>
      </div>
    </div>
  );

  // ── AI ADVISOR ───────────────────────────────────────────────────────────────
  if(tab==="advisor") return(
    <div className="apex">
      {showSettings && <SettingsModal/>}
      <AppHeader metrics={metrics} onTab={setTab} tab={tab} profileName={profile.name} goalAmount={goalAmount} onSettings={()=>setShowSettings(true)}/>
      <div style={{padding:18,display:"flex",flexDirection:"column",gap:16}}>
        {(pComplete<60||!goals.length)&&(
          <div style={{background:"rgba(201,168,76,.07)",border:"1px solid rgba(201,168,76,.2)",borderRadius:10,padding:"10px 14px",fontSize:12,color:"#c9a84c",display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
            <Target size={13}/> {pComplete<60?"Complete your profile.":""} {!goals.length?"Add goals for goal-aware analysis.":""}
            <div style={{display:"flex",gap:8,marginLeft:"auto"}}>
              {pComplete<60&&<button className="ax-btn" style={{fontSize:11}} onClick={()=>setTab("profile")}>Profile</button>}
              {!goals.length&&<button className="ax-btn" style={{fontSize:11}} onClick={()=>setTab("goals")}>Goals</button>}
            </div>
          </div>
        )}
        <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
          <button className="ax-btn primary" onClick={()=>runAnalysis("monthly")} disabled={analyzing||!entries.length}>
            {analyzing?<><Loader size={12} className="spinning"/> Analyzing...</>:<><Brain size={12}/> Monthly Deep-Dive</>}
          </button>
          <button className="ax-btn" onClick={()=>runAnalysis("weekly")} disabled={analyzing||!entries.length}><Zap size={12}/> Weekly Check-In</button>
          {!entries.length&&<span style={{fontSize:11,color:"#3d5a7a"}}>Add monthly data first</span>}
        </div>
        {analyzing&&<div style={{display:"flex",alignItems:"center",gap:10,padding:16,background:"#080f1e",borderRadius:10,fontSize:12,color:"#7a9ab8"}}><Loader size={13} className="spinning"/> APEX is analyzing goals, probabilities, and life events…</div>}
        {advice.map(a=>(
          <div key={a.id}>
            <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:8}}>
              <span style={{fontSize:10,color:"#3d5a7a"}}>{a.date}</span>
              <span style={{fontSize:9,background:"#1a2e4a",color:"#3d5a7a",padding:"2px 7px",borderRadius:4}}>{a.type}</span>
              <span style={{fontSize:10,color:"#3d5a7a"}}>· {fmt(a.netWorthSnapshot)}</span>
            </div>
            <div className="ax-advice" dangerouslySetInnerHTML={{__html:renderAdvice(a.content)}}/>
          </div>
        ))}
        {!advice.length&&!analyzing&&<div style={{textAlign:"center",padding:50,color:"#3d5a7a"}}><Brain size={36} color="#1a2e4a" style={{margin:"0 auto 12px"}}/><div style={{fontSize:13}}>Run your first analysis to get personalized advice from APEX</div></div>}
      </div>
    </div>
  );

  // ── HISTORY ──────────────────────────────────────────────────────────────────
  if(tab==="history") return(
    <div className="apex">
      {showSettings && <SettingsModal/>}
      <AppHeader metrics={metrics} onTab={setTab} tab={tab} profileName={profile.name} goalAmount={goalAmount} onSettings={()=>setShowSettings(true)}/>
      <div style={{padding:18,display:"flex",flexDirection:"column",gap:12}}>
        {[...entries].reverse().map((e,idx)=>{
          const inv=Object.values(e.investments).reduce((a,b)=>a+b,0),loans=Object.values(e.loans).reduce((a,b)=>a+b,0);
          const inc=Object.values(e.income).reduce((a,b)=>a+b,0),exp=Object.values(e.expenses).reduce((a,b)=>a+b,0);
          const sav=inc-exp, prev=entries[entries.length-1-idx-1], delta=prev?e.netWorth-prev.netWorth:null;
          return(
            <div key={e.id} className="ax-card" style={{display:"flex",flexWrap:"wrap",gap:14,alignItems:"center"}}>
              <div style={{minWidth:90}}>
                <div style={{fontWeight:600,fontSize:13}}>{e.label}</div>
                <div className="ax-mono ax-gold" style={{fontSize:20,fontWeight:700}}>{fmt(e.netWorth)}</div>
                {delta!==null&&<div style={{fontSize:10,color:delta>=0?"#00d4a4":"#ff5252"}}>{delta>=0?"▲":"▼"} {fmt(Math.abs(delta))}</div>}
              </div>
              <div style={{flex:1,fontSize:11,color:"#7a9ab8",display:"flex",gap:16,flexWrap:"wrap"}}>
                <span>Investments <b style={{color:"#c9a84c"}}>{fmt(inv)}</b></span>
                <span>Loans <b style={{color:loans>0?"#ff5252":"#00d4a4"}}>{fmt(loans)}</b></span>
                <span>Income <b style={{color:"#dde3f0"}}>{fmt(inc)}</b></span>
                <span>Savings <b style={{color:sav>=0?"#00d4a4":"#ff5252"}}>{fmt(sav)}</b></span>
              </div>
              <button className="ax-btn" style={{fontSize:11}} onClick={()=>{setForm({...e});setTab("update");}}>Edit</button>
            </div>
          );
        })}
        {!entries.length&&<div style={{textAlign:"center",padding:48,color:"#3d5a7a",fontSize:13}}>No history yet</div>}
      </div>
    </div>
  );

  return <>{showSettings && <SettingsModal/>}</>;
}
