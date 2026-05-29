import { useState, useEffect, useRef, useMemo, Component } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
         LineChart, Line, ReferenceArea, ReferenceLine } from "recharts";
import {
  TrendingUp, AlertTriangle, Brain, UploadCloud, DollarSign,
  CreditCard, Wallet, ChevronRight, ChevronDown, Loader, Target, Zap,
  BarChart3, History, Plus, Save, CheckCircle,
  User, Users, Calendar, Trash2, Flag,
  BookOpen, Home, Sun, Plane, Shield, Briefcase, Heart, Star, Sigma,
  Umbrella, Activity, AlertOctagon, TrendingDown,
  Settings, RotateCcw, X as XIcon, Database
} from "lucide-react";

// ── MF Comparison Data ────────────────────────────────────────────────────────
const MF_FUNDS = [
  // ── Large Cap (10) ──────────────────────────────────────────────────────────
  { id:"lc_axis",     name:"Axis Bluechip Fund",              shortName:"Axis BC",     manager:"Shreyash Devalkar", house:"Axis AMC",     category:"Large Cap",   baseRet:12.0, vol:13, color:"#4a9eff", aum:"44,800", er:0.56, risk:"Moderate"  },
  { id:"lc_mirae",    name:"Mirae Asset Large Cap",           shortName:"Mirae LC",    manager:"Gaurav Misra",      house:"Mirae Asset",  category:"Large Cap",   baseRet:12.5, vol:13, color:"#2980b9", aum:"37,200", er:0.52, risk:"Moderate"  },
  { id:"lc_hdfc",     name:"HDFC Top 100",                    shortName:"HDFC T100",   manager:"Rahul Baijal",      house:"HDFC AMC",     category:"Large Cap",   baseRet:11.8, vol:14, color:"#1a5276", aum:"32,600", er:0.95, risk:"Moderate"  },
  { id:"lc_icici",    name:"ICICI Pru Bluechip",              shortName:"ICICI BC",    manager:"Anish Tawakley",    house:"ICICI Pru",    category:"Large Cap",   baseRet:12.2, vol:13, color:"#3498db", aum:"42,100", er:0.91, risk:"Moderate"  },
  { id:"lc_sbi",      name:"SBI Bluechip Fund",               shortName:"SBI BC",      manager:"Sohini Andani",     house:"SBI MF",       category:"Large Cap",   baseRet:11.5, vol:13, color:"#1f618d", aum:"35,800", er:0.85, risk:"Moderate"  },
  { id:"lc_nippon",   name:"Nippon India Large Cap",          shortName:"Nippon LC",   manager:"Sailesh Raj Bhan",  house:"Nippon India", category:"Large Cap",   baseRet:11.0, vol:14, color:"#5dade2", aum:"19,400", er:0.97, risk:"Moderate"  },
  { id:"lc_kotak",    name:"Kotak Bluechip Fund",             shortName:"Kotak BC",    manager:"Harsha Upadhyaya",  house:"Kotak AMC",    category:"Large Cap",   baseRet:11.2, vol:13, color:"#1289A7", aum:"5,800",  er:0.91, risk:"Moderate"  },
  { id:"lc_dsp",      name:"DSP Top 100 Equity",              shortName:"DSP T100",    manager:"Rohit Singhania",   house:"DSP AMC",      category:"Large Cap",   baseRet:11.5, vol:13, color:"#0652DD", aum:"3,400",  er:0.93, risk:"Moderate"  },
  { id:"lc_canara",   name:"Canara Robeco Bluechip",          shortName:"Canara BC",   manager:"Shridatta Bhandwaldar",house:"Canara Robeco",category:"Large Cap", baseRet:13.0, vol:13, color:"#17a589", aum:"8,900",  er:0.32, risk:"Moderate"  },
  { id:"lc_franklin", name:"Franklin India Bluechip",         shortName:"Franklin BC", manager:"Anand Radhakrishnan",house:"Franklin Templeton",category:"Large Cap",baseRet:11.0,vol:14, color:"#154360", aum:"7,200",  er:0.95, risk:"Moderate"  },
  // ── Mid Cap (10) ────────────────────────────────────────────────────────────
  { id:"mc_hdfc",     name:"HDFC Mid-Cap Opportunities",      shortName:"HDFC MC",     manager:"Chirag Setalvad",   house:"HDFC AMC",     category:"Mid Cap",     baseRet:17.0, vol:19, color:"#c9a84c", aum:"72,180", er:0.85, risk:"High"      },
  { id:"mc_dsp",      name:"DSP Midcap Fund",                 shortName:"DSP MC",      manager:"Vinit Sambre",      house:"DSP AMC",      category:"Mid Cap",     baseRet:14.5, vol:17, color:"#f39c12", aum:"18,700", er:0.82, risk:"High"      },
  { id:"mc_kotak",    name:"Kotak Emerging Equity",           shortName:"Kotak MC",    manager:"Pankaj Tibrewal",   house:"Kotak AMC",    category:"Mid Cap",     baseRet:16.0, vol:18, color:"#e67e22", aum:"42,300", er:0.40, risk:"High"      },
  { id:"mc_axis",     name:"Axis Midcap Fund",                shortName:"Axis MC",     manager:"Shreyash Devalkar", house:"Axis AMC",     category:"Mid Cap",     baseRet:15.5, vol:17, color:"#d4ac0d", aum:"23,100", er:0.53, risk:"High"      },
  { id:"mc_nippon",   name:"Nippon India Growth Fund",        shortName:"Nippon GF",   manager:"Manish Gunwani",    house:"Nippon India", category:"Mid Cap",     baseRet:14.0, vol:18, color:"#B7950B", aum:"25,800", er:0.98, risk:"High"      },
  { id:"mc_franklin", name:"Franklin India Prima Fund",       shortName:"Franklin MC", manager:"R. Janakiraman",    house:"Franklin Templeton",category:"Mid Cap", baseRet:14.5, vol:18, color:"#E59866", aum:"8,200",  er:0.96, risk:"High"      },
  { id:"mc_mirae",    name:"Mirae Asset Midcap Fund",         shortName:"Mirae MC",    manager:"Ankit Jain",        house:"Mirae Asset",  category:"Mid Cap",     baseRet:15.0, vol:18, color:"#dc7633", aum:"11,400", er:0.55, risk:"High"      },
  { id:"mc_sbi",      name:"SBI Magnum Midcap Fund",          shortName:"SBI MC",      manager:"Sohini Andani",     house:"SBI MF",       category:"Mid Cap",     baseRet:15.5, vol:18, color:"#ca6f1e", aum:"17,600", er:0.89, risk:"High"      },
  { id:"mc_pgim",     name:"PGIM India Midcap Opp",           shortName:"PGIM MC",     manager:"Aniruddha Naha",    house:"PGIM India",   category:"Mid Cap",     baseRet:17.0, vol:20, color:"#A04000", aum:"9,800",  er:0.42, risk:"High"      },
  { id:"mc_edelweiss",name:"Edelweiss Midcap Fund",           shortName:"Edelweiss MC",manager:"Trideep Bhattacharya",house:"Edelweiss",  category:"Mid Cap",     baseRet:16.0, vol:19, color:"#935116", aum:"5,600",  er:0.41, risk:"High"      },
  // ── Small Cap (10) ──────────────────────────────────────────────────────────
  { id:"sc_sbi",      name:"SBI Small Cap Fund",              shortName:"SBI SC",      manager:"R. Srinivasan",     house:"SBI MF",       category:"Small Cap",   baseRet:18.5, vol:23, color:"#ff8c42", aum:"28,600", er:0.68, risk:"Very High" },
  { id:"sc_nippon",   name:"Nippon India Small Cap",          shortName:"Nippon SC",   manager:"Samir Rachh",       house:"Nippon India", category:"Small Cap",   baseRet:19.5, vol:25, color:"#ff5252", aum:"55,200", er:0.72, risk:"Very High" },
  { id:"sc_kotak",    name:"Kotak Small Cap Fund",            shortName:"Kotak SC",    manager:"Pankaj Tibrewal",   house:"Kotak AMC",    category:"Small Cap",   baseRet:18.0, vol:23, color:"#e74c3c", aum:"14,800", er:0.44, risk:"Very High" },
  { id:"sc_axis",     name:"Axis Small Cap Fund",             shortName:"Axis SC",     manager:"Anupam Tiwari",     house:"Axis AMC",     category:"Small Cap",   baseRet:17.5, vol:22, color:"#c0392b", aum:"21,600", er:0.55, risk:"Very High" },
  { id:"sc_hdfc",     name:"HDFC Small Cap Fund",             shortName:"HDFC SC",     manager:"Chirag Setalvad",   house:"HDFC AMC",     category:"Small Cap",   baseRet:18.0, vol:23, color:"#ff6b6b", aum:"28,400", er:0.64, risk:"Very High" },
  { id:"sc_franklin", name:"Franklin India Smaller Cos",      shortName:"Franklin SC", manager:"R. Janakiraman",    house:"Franklin Templeton",category:"Small Cap",baseRet:17.0,vol:23, color:"#cb4335", aum:"11,400", er:0.97, risk:"Very High" },
  { id:"sc_dsp",      name:"DSP Small Cap Fund",              shortName:"DSP SC",      manager:"Vinit Sambre",      house:"DSP AMC",      category:"Small Cap",   baseRet:17.5, vol:22, color:"#d35400", aum:"12,600", er:0.63, risk:"Very High" },
  { id:"sc_canara",   name:"Canara Robeco Small Cap",         shortName:"Canara SC",   manager:"Shridatta Bhandwaldar",house:"Canara Robeco",category:"Small Cap",baseRet:19.0, vol:24, color:"#eb984e", aum:"9,200",  er:0.33, risk:"Very High" },
  { id:"sc_icici",    name:"ICICI Pru Smallcap Fund",         shortName:"ICICI SC",    manager:"Harish Bihani",     house:"ICICI Pru",    category:"Small Cap",   baseRet:17.0, vol:23, color:"#e67e22", aum:"7,800",  er:0.96, risk:"Very High" },
  { id:"sc_quant",    name:"Quant Small Cap Fund",            shortName:"Quant SC",    manager:"Ankit Pande",       house:"Quant AMC",    category:"Small Cap",   baseRet:21.0, vol:27, color:"#922b21", aum:"24,800", er:0.64, risk:"Very High" },
  // ── Flexi Cap (10) ──────────────────────────────────────────────────────────
  { id:"fc_ppfas",    name:"Parag Parikh Flexi Cap",          shortName:"PPFCF",       manager:"Rajeev Thakkar",    house:"PPFAS MF",     category:"Flexi Cap",   baseRet:14.5, vol:14, color:"#7f77dd", aum:"65,240", er:0.57, risk:"Moderate"  },
  { id:"fc_hdfc",     name:"HDFC Flexi Cap Fund",             shortName:"HDFC FC",     manager:"Gopal Agrawal",     house:"HDFC AMC",     category:"Flexi Cap",   baseRet:13.5, vol:15, color:"#9b59b6", aum:"58,400", er:0.84, risk:"Moderate"  },
  { id:"fc_kotak",    name:"Kotak Flexi Cap Fund",            shortName:"Kotak FC",    manager:"Harsha Upadhyaya",  house:"Kotak AMC",    category:"Flexi Cap",   baseRet:13.0, vol:14, color:"#8e44ad", aum:"46,800", er:0.53, risk:"Moderate"  },
  { id:"fc_uti",      name:"UTI Flexi Cap Fund",              shortName:"UTI FC",      manager:"Ajay Tyagi",        house:"UTI AMC",      category:"Flexi Cap",   baseRet:13.5, vol:15, color:"#6c3483", aum:"24,100", er:0.91, risk:"Moderate"  },
  { id:"fc_franklin", name:"Franklin India Flexi Cap",        shortName:"Franklin FC", manager:"R. Janakiraman",    house:"Franklin Templeton",category:"Flexi Cap",baseRet:13.0,vol:15, color:"#5f27cd", aum:"14,200", er:0.95, risk:"Moderate"  },
  { id:"fc_dsp",      name:"DSP Flexi Cap Fund",              shortName:"DSP FC",      manager:"Atul Bhole",        house:"DSP AMC",      category:"Flexi Cap",   baseRet:13.5, vol:14, color:"#a569bd", aum:"9,600",  er:0.74, risk:"Moderate"  },
  { id:"fc_canara",   name:"Canara Robeco Flexi Cap",         shortName:"Canara FC",   manager:"Shridatta Bhandwaldar",house:"Canara Robeco",category:"Flexi Cap",baseRet:14.0, vol:14, color:"#7d3c98", aum:"11,200", er:0.35, risk:"Moderate"  },
  { id:"fc_pgim",     name:"PGIM India Flexi Cap",            shortName:"PGIM FC",     manager:"Vivek Mehta",       house:"PGIM India",   category:"Flexi Cap",   baseRet:14.5, vol:15, color:"#9980fa", aum:"6,400",  er:0.46, risk:"Moderate"  },
  { id:"fc_quant",    name:"Quant Flexi Cap Fund",            shortName:"Quant FC",    manager:"Ankit Pande",       house:"Quant AMC",    category:"Flexi Cap",   baseRet:16.0, vol:17, color:"#6a0dad", aum:"4,800",  er:0.59, risk:"Moderate"  },
  { id:"fc_absl",     name:"ABSL Flexi Cap Fund",             shortName:"ABSL FC",     manager:"Mahesh Patil",      house:"ABSL AMC",     category:"Flexi Cap",   baseRet:13.0, vol:14, color:"#b267e6", aum:"17,600", er:0.85, risk:"Moderate"  },
  // ── Large & Mid (10) ────────────────────────────────────────────────────────
  { id:"lm_mirae",    name:"Mirae Emerging Bluechip",         shortName:"Mirae EB",    manager:"Neelesh Surana",    house:"Mirae Asset",  category:"Large & Mid", baseRet:16.0, vol:17, color:"#00d4a4", aum:"38,450", er:0.62, risk:"High"      },
  { id:"lm_canara",   name:"Canara Robeco Emg Equities",      shortName:"Canara EM",   manager:"Shridatta Bhandwaldar",house:"Canara Robeco",category:"Large & Mid",baseRet:15.5,vol:16, color:"#1abc9c", aum:"21,400", er:0.35, risk:"High"      },
  { id:"lm_kotak",    name:"Kotak Equity Opportunities",      shortName:"Kotak EO",    manager:"Harsha Upadhyaya",  house:"Kotak AMC",    category:"Large & Mid", baseRet:15.0, vol:16, color:"#16a085", aum:"19,800", er:0.45, risk:"High"      },
  { id:"lm_dsp",      name:"DSP Equity Opportunities",        shortName:"DSP EO",      manager:"Rohit Singhania",   house:"DSP AMC",      category:"Large & Mid", baseRet:14.5, vol:16, color:"#117a65", aum:"7,200",  er:0.91, risk:"High"      },
  { id:"lm_invesco",  name:"Invesco India Growth Opp",        shortName:"Invesco GO",  manager:"Taher Badshah",     house:"Invesco India",category:"Large & Mid", baseRet:15.0, vol:16, color:"#0e6655", aum:"4,600",  er:0.68, risk:"High"      },
  { id:"lm_hdfc",     name:"HDFC Large & Mid Cap",            shortName:"HDFC L&M",    manager:"Gopal Agrawal",     house:"HDFC AMC",     category:"Large & Mid", baseRet:14.0, vol:16, color:"#2ecc71", aum:"22,600", er:0.88, risk:"High"      },
  { id:"lm_sbi",      name:"SBI Large & Midcap Fund",         shortName:"SBI L&M",     manager:"Sohini Andani",     house:"SBI MF",       category:"Large & Mid", baseRet:14.0, vol:16, color:"#27ae60", aum:"14,800", er:0.83, risk:"High"      },
  { id:"lm_axis",     name:"Axis Growth Opportunities",       shortName:"Axis GO",     manager:"Shreyash Devalkar", house:"Axis AMC",     category:"Large & Mid", baseRet:15.5, vol:17, color:"#1e8449", aum:"8,900",  er:0.55, risk:"High"      },
  { id:"lm_tata",     name:"Tata Large & Mid Cap",            shortName:"Tata L&M",    manager:"Chandraprakash Padiyar",house:"Tata AMC", category:"Large & Mid", baseRet:14.5, vol:16, color:"#58d68d", aum:"6,400",  er:0.34, risk:"High"      },
  { id:"lm_pgim",     name:"PGIM India Large & Midcap",       shortName:"PGIM L&M",    manager:"Aniruddha Naha",    house:"PGIM India",   category:"Large & Mid", baseRet:15.0, vol:17, color:"#196f3d", aum:"3,800",  er:0.44, risk:"High"      },
  // ── Multi Asset (10) ────────────────────────────────────────────────────────
  { id:"ma_icici",    name:"ICICI Pru Multi-Asset Fund",      shortName:"ICICI MA",    manager:"Sankaran Naren",    house:"ICICI Pru",    category:"Multi Asset", baseRet:11.5, vol:11, color:"#d4537e", aum:"47,900", er:0.79, risk:"Moderate"  },
  { id:"ma_hdfc",     name:"HDFC Multi-Asset Fund",           shortName:"HDFC MA",     manager:"Gopal Agrawal",     house:"HDFC AMC",     category:"Multi Asset", baseRet:10.5, vol:10, color:"#c2185b", aum:"3,600",  er:0.95, risk:"Moderate"  },
  { id:"ma_nippon",   name:"Nippon Multi Asset Allocation",   shortName:"Nippon MA",   manager:"Manish Gunwani",    house:"Nippon India", category:"Multi Asset", baseRet:10.0, vol:10, color:"#ad1457", aum:"2,800",  er:0.97, risk:"Moderate"  },
  { id:"ma_axis",     name:"Axis Multi Asset Allocation",     shortName:"Axis MA",     manager:"Jinesh Gopani",     house:"Axis AMC",     category:"Multi Asset", baseRet:10.8, vol:11, color:"#e91e63", aum:"1,900",  er:0.58, risk:"Moderate"  },
  { id:"ma_quant",    name:"Quant Multi Asset Fund",          shortName:"Quant MA",    manager:"Ankit Pande",       house:"Quant AMC",    category:"Multi Asset", baseRet:12.5, vol:12, color:"#f06292", aum:"2,400",  er:0.67, risk:"Moderate"  },
  { id:"ma_motilal",  name:"Motilal Oswal Multi Asset",       shortName:"Motilal MA",  manager:"Siddharth Bothra",  house:"Motilal Oswal",category:"Multi Asset", baseRet:11.0, vol:11, color:"#ec407a", aum:"1,400",  er:0.52, risk:"Moderate"  },
  { id:"ma_dsp",      name:"DSP Multi Asset Allocation",      shortName:"DSP MA",      manager:"Atul Bhole",        house:"DSP AMC",      category:"Multi Asset", baseRet:10.5, vol:10, color:"#9c1b5b", aum:"1,800",  er:0.86, risk:"Moderate"  },
  { id:"ma_tata",     name:"Tata Multi Asset Opp Fund",       shortName:"Tata MA",     manager:"Sailesh Jain",      house:"Tata AMC",     category:"Multi Asset", baseRet:11.0, vol:11, color:"#e95e8e", aum:"1,600",  er:0.49, risk:"Moderate"  },
  { id:"ma_sbi",      name:"SBI Multi Asset Allocation",      shortName:"SBI MA",      manager:"Dinesh Ahuja",      house:"SBI MF",       category:"Multi Asset", baseRet:10.5, vol:10, color:"#b03060", aum:"2,200",  er:0.44, risk:"Moderate"  },
  { id:"ma_uti",      name:"UTI Multi Asset Allocation",      shortName:"UTI MA",      manager:"Vetri Subramaniam", house:"UTI AMC",      category:"Multi Asset", baseRet:11.0, vol:11, color:"#880e4f", aum:"1,600",  er:0.72, risk:"Moderate"  },
];

const MF_EVENTS = [
  // ── Market crashes & financial crises ──────────────────────────────────────
  { id:"china",    label:"China Meltdown",        start:"2015-08", end:"2016-02", cat:"Global",    desc:"Chinese stock crash · global EM rout · commodity slump",         fill:"rgba(255,140,66,.18)", stroke:"#ff8c42" },
  { id:"demonet",  label:"Demonetization",         start:"2016-11", end:"2017-01", cat:"Policy",    desc:"Rs 500/1000 notes banned overnight · cash crunch · GDP shock",   fill:"rgba(127,119,221,.18)", stroke:"#7f77dd" },
  { id:"ltcg",     label:"LTCG Tax (Budget 2018)", start:"2018-01", end:"2018-03", cat:"Policy",    desc:"Budget 2018 reintroduced 10% LTCG on equity · market selloff",  fill:"rgba(127,119,221,.18)", stroke:"#7f77dd" },
  { id:"tradwar",  label:"US–China Trade War",     start:"2018-07", end:"2018-10", cat:"Global",    desc:"Peak tariff escalation · INR hit ₹74/$ · FII outflows",          fill:"rgba(255,140,66,.18)", stroke:"#ff8c42" },
  { id:"ilfs",     label:"IL&FS / NBFC Crisis",    start:"2018-09", end:"2019-02", cat:"Financial", desc:"Shadow banking collapse · credit freeze · midcap rout",          fill:"rgba(255,52,52,.18)",  stroke:"#ff3434" },
  { id:"ele2019",  label:"2019 General Election",  start:"2019-03", end:"2019-05", cat:"Election",  desc:"Pre-election jitters → BJP landslide → sharp post-result rally", fill:"rgba(0,212,164,.13)",  stroke:"#00d4a4" },
  { id:"usiran",   label:"US–Iran War Scare",       start:"2019-12", end:"2020-01", cat:"War",       desc:"US kills Soleimani · Iran missile strikes on US bases · oil spike · World War 3 fears", fill:"rgba(180,0,0,.18)", stroke:"#b40000" },
  { id:"covid",    label:"COVID-19 Crash",          start:"2020-02", end:"2020-04", cat:"Pandemic",  desc:"Global pandemic declared · Nifty fell 38% in 6 weeks",           fill:"rgba(255,52,52,.22)",  stroke:"#ff3434" },
  { id:"covid2",   label:"COVID 2nd Wave",          start:"2021-03", end:"2021-06", cat:"Pandemic",  desc:"Delta variant devastates India · localised lockdowns",            fill:"rgba(255,82,82,.14)",  stroke:"#ff5252" },
  { id:"ratehike", label:"Fed Rate Hike Cycle",     start:"2022-01", end:"2022-07", cat:"Policy",    desc:"Fed hikes 11 times · FII sold ₹2.5L Cr · EM selloff",           fill:"rgba(127,119,221,.18)", stroke:"#7f77dd" },
  { id:"ukraine",  label:"Russia–Ukraine War",      start:"2022-02", end:"2022-04", cat:"War",       desc:"Full-scale invasion · Brent to $130 · global inflation shock",   fill:"rgba(180,0,0,.18)",    stroke:"#b40000" },
  { id:"adani",    label:"Adani–Hindenburg",        start:"2023-01", end:"2023-03", cat:"Financial", desc:"Short-seller attack · ₹10L Cr market cap wiped · contagion fear",fill:"rgba(255,52,52,.18)",  stroke:"#ff3434" },
  { id:"svb",      label:"Global Banking Scare",    start:"2023-03", end:"2023-05", cat:"Financial", desc:"SVB & Credit Suisse collapse · global banking stress",           fill:"rgba(255,52,52,.18)",  stroke:"#ff3434" },
  { id:"ele2024",  label:"2024 General Election",   start:"2024-04", end:"2024-06", cat:"Election",  desc:"Modi 3.0 · BJP lost majority · Nifty fell 5% on results day",   fill:"rgba(0,212,164,.13)",  stroke:"#00d4a4" },
  { id:"usiran2",  label:"US–Iran War (Ongoing)",   start:"2024-04", end:"2025-05", cat:"War",       desc:"Iran direct missile/drone attack on Israel · US active air defense · Red Sea shipping disruptions · Strait of Hormuz risk · oil volatility", fill:"rgba(180,0,0,.22)", stroke:"#b40000", ongoing:true },
];

const MF_EVENT_CATS = {
  Policy:    { color:"#7f77dd", bg:"rgba(127,119,221,.12)" },
  Global:    { color:"#ff8c42", bg:"rgba(255,140,66,.12)"  },
  Financial: { color:"#ff5252", bg:"rgba(255,82,82,.12)"   },
  Election:  { color:"#00d4a4", bg:"rgba(0,212,164,.12)"   },
  War:       { color:"#b40000", bg:"rgba(180,0,0,.12)"     },
  Pandemic:  { color:"#d4537e", bg:"rgba(212,83,126,.12)"  },
};

function seededRand(seed) {
  let s = (seed ^ 0xdeadbeef) >>> 0;
  return () => { s = (Math.imul(1664525, s) + 1013904223) >>> 0; return s / 4294967296; };
}

function genNavHistory(fund) {
  const rng = seededRand(fund.id.split("").reduce((a,c,i)=>a+c.charCodeAt(0)*(i+1),0));
  const turbMap = {};
  MF_EVENTS.forEach(ev => {
    const [sy,sm]=ev.start.split("-").map(Number), [ey,em]=ev.end.split("-").map(Number);
    let yr=sy,mo=sm;
    while(yr<ey||(yr===ey&&mo<=em)){turbMap[`${yr}-${String(mo).padStart(2,"0")}`]=true;mo++;if(mo>12){mo=1;yr++;}}
  });
  const sigmaM=(fund.vol/100)/Math.sqrt(12), muM=(fund.baseRet/1200)-0.5*sigmaM*sigmaM;
  let nav=100; const result=[]; let yr=2015,mo=1;
  while(yr<2025||(yr===2025&&mo<=5)){
    const key=`${yr}-${String(mo).padStart(2,"0")}`;
    const u1=Math.max(rng(),1e-10),u2=rng();
    const z=Math.sqrt(-2*Math.log(u1))*Math.cos(2*Math.PI*u2);
    let ret=muM+z*sigmaM;
    if(turbMap[key]) ret-=0.025+rng()*0.025;
    nav*=Math.exp(ret); result.push({month:key,nav:Math.round(nav*100)/100});
    mo++;if(mo>12){mo=1;yr++;}
  }
  return result;
}

const MF_NAV={};
MF_FUNDS.forEach(f=>{MF_NAV[f.id]=genNavHistory(f);});

// ── Benchmark Indices ─────────────────────────────────────────────────────────
const BENCHMARKS = [
  {id:"nifty50",     name:"Nifty 50",           shortName:"Nifty 50",     baseRet:12.0, vol:15, color:"#1a2e4a", type:"Large Cap"},
  {id:"nifty500",    name:"Nifty 500",           shortName:"Nifty 500",    baseRet:13.5, vol:16, color:"#2980b9", type:"Broad"},
  {id:"midcap150",   name:"Nifty Midcap 150",    shortName:"Midcap 150",   baseRet:15.5, vol:20, color:"#c9a84c", type:"Mid Cap"},
  {id:"smallcap250", name:"Nifty Smallcap 250",  shortName:"Smallcap 250", baseRet:16.5, vol:24, color:"#ff8c42", type:"Small Cap"},
  {id:"next50",      name:"Nifty Next 50",        shortName:"Next 50",      baseRet:13.0, vol:17, color:"#7f77dd", type:"Large Cap"},
  {id:"sensex",      name:"BSE Sensex",           shortName:"Sensex",       baseRet:11.8, vol:14, color:"#00d4a4", type:"Large Cap"},
];
const BENCH_NAV={};
BENCHMARKS.forEach(b=>{BENCH_NAV[b.id]=genNavHistory(b);});

// ── Risk Metric Helpers ───────────────────────────────────────────────────────
const RF_M = 0.07/12;
function bkRets(navs){return navs.slice(1).map((d,i)=>(d.nav-navs[i].nav)/navs[i].nav);}
function bkCAGR(r){if(!r.length)return 0;return parseFloat(((Math.pow(r.reduce((a,v)=>a*(1+v),1),12/r.length)-1)*100).toFixed(1));}
function bkVol(r){if(!r.length)return 0;const m=r.reduce((a,v)=>a+v,0)/r.length;return parseFloat((Math.sqrt(r.reduce((a,v)=>a+Math.pow(v-m,2),0)/r.length)*Math.sqrt(12)*100).toFixed(1));}
function bkSharpe(r){const ex=r.map(v=>v-RF_M);const m=ex.reduce((a,v)=>a+v,0)/ex.length;const s=Math.sqrt(ex.reduce((a,v)=>a+Math.pow(v-m,2),0)/ex.length);return s===0?0:parseFloat(((m/s)*Math.sqrt(12)).toFixed(2));}
function bkSortino(r){const ex=r.map(v=>v-RF_M);const m=ex.reduce((a,v)=>a+v,0)/ex.length;const d=ex.filter(v=>v<0);if(!d.length)return parseFloat((5).toFixed(2));const ds=Math.sqrt(d.reduce((a,v)=>a+v*v,0)/d.length);return parseFloat(((m/ds)*Math.sqrt(12)).toFixed(2));}
function bkBeta(fr,br){const n=Math.min(fr.length,br.length);const f=fr.slice(-n),b=br.slice(-n);const fm=f.reduce((a,v)=>a+v,0)/n,bm=b.reduce((a,v)=>a+v,0)/n;const cov=f.reduce((a,v,i)=>a+(v-fm)*(b[i]-bm),0)/(n-1);const bv=b.reduce((a,v)=>a+Math.pow(v-bm,2),0)/(n-1);return bv===0?1:parseFloat((cov/bv).toFixed(2));}
function bkAlpha(fr,br){const n=Math.min(fr.length,br.length);const b=bkBeta(fr.slice(-n),br.slice(-n));const fa=bkCAGR(fr.slice(-n)),ba=bkCAGR(br.slice(-n)),rf=RF_M*12*100;return parseFloat((fa-(rf+b*(ba-rf))).toFixed(2));}
function bkMaxDD(navs){let pk=-Infinity,mx=0;for(const d of navs){if(d.nav>pk)pk=d.nav;const dd=(d.nav-pk)/pk*100;if(dd<mx)mx=dd;}return parseFloat(mx.toFixed(1));}
function bkIR(fr,br){const n=Math.min(fr.length,br.length);const ar=fr.slice(-n).map((v,i)=>v-br[br.length-n+i]);const m=ar.reduce((a,v)=>a+v,0)/n;const te=Math.sqrt(ar.reduce((a,v)=>a+Math.pow(v-m,2),0)/(n-1))*Math.sqrt(12);return te===0?0:parseFloat(((m*12)/te).toFixed(2));}
function bkDDSeries(navs){let pk=-Infinity;return navs.map(d=>{if(d.nav>pk)pk=d.nav;return{month:d.month,dd:parseFloat(((d.nav-pk)/pk*100).toFixed(2))};});}
function bkRolling(navs,w=12){return navs.slice(w).map((d,i)=>({month:d.month,val:parseFloat(((d.nav/navs[i].nav-1)*100).toFixed(1))}));}
function bkProject(corpus,monthly,annRet,years){const r=annRet/100;if(r<=0)return corpus+monthly*12*years;const g=Math.pow(1+r,years);return Math.round(corpus*g+monthly*12*((g-1)/r));}

function mfCAGR(navData,years){
  const n=navData.length,months=Math.min(years*12,n-1);
  if(months<1)return null;
  const start=navData[n-1-months]?.nav,end=navData[n-1]?.nav;
  if(!start||!end)return null;
  return ((Math.pow(end/start,12/months)-1)*100).toFixed(1);
}

// ── App Modes ─────────────────────────────────────────────────────────────────
const APP_MODES = [
  {id:"beginner",     label:"Beginner",    color:"#00d4a4", bg:"rgba(0,212,164,.1)",  desc:"Plain English"},
  {id:"intermediate", label:"Intermediate", color:"#c9a84c", bg:"rgba(201,168,76,.1)", desc:"Standard Analytics"},
  {id:"pro",          label:"Pro / Quant", color:"#7f77dd", bg:"rgba(127,119,221,.1)",desc:"Quant Analytics"},
];

function fundGrade(cagr10, alpha) {
  const s=Math.min(100,Math.max(0,(cagr10/24)*50+Math.min(50,(alpha/6)*50)));
  if(s>75) return {grade:"A+",color:"#00d4a4",stars:5,label:"Excellent"};
  if(s>60) return {grade:"A", color:"#00d4a4",stars:4,label:"Very Good"};
  if(s>45) return {grade:"B+",color:"#c9a84c",stars:3,label:"Good"};
  if(s>30) return {grade:"B", color:"#ff8c42",stars:2,label:"Average"};
  return            {grade:"C", color:"#ff5252",stars:1,label:"Below Average"};
}
function riskBand(vol, maxDD) {
  if(vol<13&&maxDD>-20) return {label:"Low Risk",      color:"#00d4a4",emoji:"🟢",tip:"Relatively stable fund"};
  if(vol<18&&maxDD>-30) return {label:"Medium Risk",   color:"#c9a84c",emoji:"🟡",tip:"Some fluctuation expected"};
  if(vol<24&&maxDD>-45) return {label:"High Risk",     color:"#ff8c42",emoji:"🟠",tip:"Can drop 30-40% in bad years"};
  return                        {label:"Very High Risk",color:"#ff5252",emoji:"🔴",tip:"Can drop 40-50%+ in crashes"};
}
function investorType(category="") {
  const c=category.toLowerCase();
  if(c.includes("large")) return "Conservative investors · 3+ years";
  if(c.includes("multi")) return "Balanced investors · 3+ years";
  if(c.includes("flexi")) return "Balanced investors · 5+ years";
  if(c.includes("mid"))   return "Aggressive investors · 7+ years";
  if(c.includes("small")) return "Very aggressive investors · 10+ years";
  return "Long-term SIP investors";
}

// ── Beginner Health Card ───────────────────────────────────────────────────────
function BeginnerHealthCard({ entries, goals }) {
  if(!entries?.length) return null;
  const l=entries[entries.length-1];
  const totalIncome=(l.income?.salary||0)+(l.income?.business||0)+(l.income?.rental||0);
  const totalExp=(l.expenses?.essentials||0)+(l.expenses?.discretionary||0)+(l.expenses?.emi||0);
  const savings=totalIncome-totalExp;
  const savePct=totalIncome>0?Math.round(savings/totalIncome*100):0;
  const totalLoans=Object.values(l.loans||{}).reduce((a,v)=>a+v,0);
  const totalInv=Object.values(l.investments||{}).reduce((a,v)=>a+v,0);
  let score=40;
  if(savePct>=20) score+=20; else if(savePct>10) score+=10;
  if(goals?.length>0) score+=10;
  if(totalInv>0) score+=15;
  if(l.netWorth>0) score+=10;
  if(totalLoans>totalInv) score-=15;
  score=Math.round(Math.max(0,Math.min(100,score)));
  const sc=score>=70?"#00d4a4":score>=50?"#c9a84c":"#ff5252";
  const sl=score>=70?"HEALTHY":score>=50?"MODERATE":"NEEDS WORK";
  const items=[
    {q:"Is my money growing?",    a:totalInv>0?"YES ✅":"Start investing",      d:totalInv>0?`MF + investments: ${fmt(totalInv)}`:"Open a SIP to start building wealth",    c:totalInv>0?"#00d4a4":"#ff8c42"},
    {q:"Am I saving enough?",     a:savePct>=20?"YES ✅":savePct>10?"COULD BE BETTER 🟡":"IMPROVE ❌", d:`Saving ~${savePct}% of income · target: 20%+`,  c:savePct>=20?"#00d4a4":savePct>10?"#c9a84c":"#ff5252"},
    {q:"Do I have goals?",        a:goals?.length>0?`YES ✅ (${goals.length} goal${goals.length>1?"s":""})`:"NOT SET ❌", d:goals?.length>0?"Keep tracking your milestones":"Go to Goals tab → set financial targets", c:goals?.length>0?"#00d4a4":"#ff8c42"},
    {q:"Is my debt manageable?",  a:totalLoans===0?"NO DEBT ✅":totalLoans<totalInv?"MANAGEABLE 🟡":"REVIEW ⚠️", d:totalLoans>0?`Total loans: ${fmt(totalLoans)}`:"Debt-free — great discipline!",            c:totalLoans===0?"#00d4a4":totalLoans<totalInv?"#c9a84c":"#ff5252"},
  ];
  return (
    <div className="ax-card" style={{padding:"16px 18px",borderLeft:`4px solid ${sc}`,marginBottom:0}}>
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:12,marginBottom:12}}>
        <div>
          <div style={{fontSize:13,fontWeight:700,color:"#1a2433"}}>Your Financial Health Check</div>
          <div style={{fontSize:10,color:"#6b8299"}}>Quick overview · switch to Investor or Pro mode for full analytics</div>
        </div>
        <div style={{textAlign:"center",padding:"8px 16px",borderRadius:10,background:`${sc}12`,border:`2px solid ${sc}40`,flexShrink:0}}>
          <div style={{fontSize:26,fontWeight:800,color:sc,lineHeight:1}}>{score}</div>
          <div style={{fontSize:9,fontWeight:700,color:sc}}>{sl}</div>
          <div style={{fontSize:8,color:"#6b8299"}}>out of 100</div>
        </div>
      </div>
      <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
        {items.map(it=>(
          <div key={it.q} style={{flex:"1 1 170px",padding:"10px 12px",borderRadius:8,background:`${it.c}08`,border:`1px solid ${it.c}30`}}>
            <div style={{fontSize:9,color:"#6b8299",marginBottom:3}}>{it.q}</div>
            <div style={{fontSize:12,fontWeight:700,color:it.c,marginBottom:2}}>{it.a}</div>
            <div style={{fontSize:9,color:"#3d617e",lineHeight:1.4}}>{it.d}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

const DEFAULT_GOAL = 10_000_000;
const CUR_YEAR   = new Date().getFullYear();
const MC_SIMS    = 1000;

// ── Storage ───────────────────────────────────────────────────────────────────
async function load(key) {
  try {
    if (!window.storage) return null;
    const r = await window.storage.get(key);
    return r ? JSON.parse(r.value) : null;
  } catch { return null; }
}
async function persist(key, val) {
  try { if (window.storage) await window.storage.set(key, JSON.stringify(val)); } catch {}
}

// ── Pure math ─────────────────────────────────────────────────────────────────
function calcInflated(amount, inflRate, years) {
  return amount * Math.pow(1 + inflRate / 100, Math.max(0, years));
}
function goalVol(ret) { return ret < 8 ? 5 : ret < 13 ? 10 : 18; }

function monteCarlo(corpus, monthly, target, years, annRet, annVol, stepUpPct=0) {
  if (years <= 0) return corpus >= target ? 100 : 0;
  const n = Math.round(years * 12);
  // GBM: Ito-corrected drift so E[exp(muM + z·sigmaM)] = exp(annRet/1200)
  const sigmaM = annVol / 100 / Math.sqrt(12);
  const muM    = annRet / 1200 - 0.5 * sigmaM * sigmaM;
  let hits = 0;
  for (let i = 0; i < MC_SIMS; i++) {
    let v = corpus;
    for (let m = 0; m < n; m++) {
      const u1 = Math.max(Math.random(), 1e-10), u2 = Math.random();
      const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
      // Annual step-up: contribution grows by stepUpPct% each year
      const mContrib = stepUpPct > 0 ? monthly * Math.pow(1 + stepUpPct / 100, Math.floor(m / 12)) : monthly;
      v = v * Math.exp(muM + z * sigmaM) + mContrib;
    }
    if (v >= target) hits++;
  }
  return Math.round((hits / MC_SIMS) * 100);
}

function monthlyNeeded(corpus, target, years, annRet, stepUpPct=0) {
  if (years <= 0) return 0;
  const n = years * 12, r = annRet / 12 / 100;
  const f = r === 0 ? 1 : Math.pow(1 + r, n);
  const gap = target - corpus * (r === 0 ? 1 : f);
  if (gap <= 0) return 0;
  if (r === 0) return gap / n;
  if (stepUpPct === 0) return gap * r / (f - 1);
  // Growing annuity: monthly step-up rate equivalent to annual stepUpPct%
  // FV = m₀ × [(1+r)^n − (1+g_m)^n] / (r − g_m)  →  m₀ = gap × (r − g_m) / (f − fg)
  const g_m = Math.pow(1 + stepUpPct / 100, 1 / 12) - 1;
  const fg  = Math.pow(1 + g_m, n);
  if (Math.abs(r - g_m) < 1e-10) return Math.max(0, gap / (n * Math.pow(1 + r, n - 1)));
  return Math.max(0, gap * (r - g_m) / (f - fg));
}

// Age-banded indicative term plan annual premium (₹) for pure term cover
function calcTermPremium(age, coverAmount) {
  if (!age || !coverAmount) return 0;
  const ratePerK = age < 25 ? 0.7 : age < 30 ? 0.9 : age < 35 ? 1.2 : age < 40 ? 1.8 : age < 45 ? 2.8 : age < 50 ? 4.5 : 7.0;
  return Math.round((coverAmount / 1000) * ratePerK);
}

// ── Formatters ────────────────────────────────────────────────────────────────
function monthKey() { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`; }
function fmtML(key) { const [y,m]=key.split("-"); return new Date(+y,+m-1,1).toLocaleDateString("en-IN",{month:"short",year:"numeric"}); }
function fmt(n) {
  if (!n && n !== 0 || isNaN(n) || !isFinite(n)) return "₹0";
  const abs = Math.abs(n), sign = n < 0 ? "-" : "";
  if (abs>=1e7) return `${sign}₹${(abs/1e7).toFixed(2)}Cr`;
  if (abs>=1e5) return `${sign}₹${(abs/1e5).toFixed(1)}L`;
  return `${sign}₹${Math.round(abs).toLocaleString("en-IN")}`;
}
function initials(name) { if(!name) return "?"; return name.trim().split(/\s+/).map(w=>w[0]).slice(0,2).join("").toUpperCase(); }

// ── Config ────────────────────────────────────────────────────────────────────
const RISK_OPTIONS = [
  { id:"conservative", label:"Conservative", desc:"Capital preservation", detail:"Debt/FD heavy · post-tax 6–8%",      color:"#4a9eff", bg:"rgba(74,158,255,.08)", border:"rgba(74,158,255,.4)", ret:7  },
  { id:"moderate",     label:"Moderate",     desc:"Balanced growth",     detail:"60% equity / 40% debt · post-tax 10–12%", color:"#c9a84c", bg:"rgba(201,168,76,.08)", border:"rgba(201,168,76,.4)", ret:11 },
  { id:"aggressive",   label:"Aggressive",   desc:"Maximum growth",      detail:"80%+ equity · post-tax 12–15%",     color:"#00d4a4", bg:"rgba(0,212,164,.08)", border:"rgba(0,212,164,.4)", ret:14 },
];
const GOAL_CATS = {
  education: { label:"Education",    Icon:BookOpen,  color:"#7f77dd", bg:"rgba(127,119,221,.14)" },
  home:      { label:"Home",         Icon:Home,      color:"#c9a84c", bg:"rgba(201,168,76,.14)"  },
  retirement:{ label:"Retirement",   Icon:Sun,       color:"#00d4a4", bg:"rgba(0,212,164,.14)"   },
  travel:    { label:"Travel",       Icon:Plane,     color:"#4a9eff", bg:"rgba(74,158,255,.14)"  },
  emergency: { label:"Emergency",    Icon:Shield,    color:"#ff8c42", bg:"rgba(255,140,66,.14)"  },
  business:  { label:"Business",     Icon:Briefcase, color:"#d4537e", bg:"rgba(212,83,126,.14)"  },
  wedding:   { label:"Wedding",      Icon:Heart,     color:"#f07090", bg:"rgba(240,112,144,.14)" },
  custom:    { label:"Custom",       Icon:Star,      color:"#526a84", bg:"rgba(138,160,190,.14)" },
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
    investments:{equity:0,mutualFunds:0,realEstate:0,gold:0,crypto:0,epf:0,ppf:0,nps:0,fd:0,sgb:0},
    loans:{home:0,personal:0,vehicle:0,education:0},
    income:{salary:0,business:0,rental:0,dividends:0,bonus:0},
    expenses:{essentials:0,discretionary:0,emi:0},
    notes:"", createdAt:new Date().toISOString() };
}
function defaultProfile() {
  return { name:"", age:"", retirementAge:60, riskAppetite:"moderate", dependents:{spouse:false,children:0,parents:0}, lifeEvents:[] };
}
function defaultGoal(riskAppetite="moderate") {
  const ret = RISK_OPTIONS.find(r=>r.id===riskAppetite)?.ret || 11;
  return { id:0, name:"", category:"custom", targetAmount:0, targetYear:CUR_YEAR+10,
    currentCorpus:0, monthlyContrib:0, inflationRate:6, expectedReturn:ret, stepUpPct:5, priority:"medium", notes:"" };
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
  const recHealth = hasDep ? 2_500_000 : 1_000_000; // ₹25L / ₹10L
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

function calcFIPlan(plan, netWorth, investableNetWorth) {
  if (!plan.essentialMonthly) return null;
  // Use investable NW for FI progress: exclude illiquid real estate and 40% NPS (mandatory annuity)
  const inv = investableNetWorth != null ? investableNetWorth : netWorth;
  const inflatedAnnual = plan.essentialMonthly * 12 * Math.pow(1 + plan.inflationRate / 100, plan.yearsToRetirement);
  const fi30 = inflatedAnnual * 30, fi35 = inflatedAnnual * 35, fi40 = inflatedAnnual * 40;
  const prog30 = fi30 > 0 ? Math.min((inv / fi30) * 100, 150) : 0;
  return {
    inflatedAnnual, fi30, fi35, fi40,
    prog30, gap30: Math.max(0, fi30 - inv),
    withdrawalRate: fi30 > 0 ? (inflatedAnnual / fi30) * 100 : 3.33,
    bucket1Amount: inflatedAnnual * (plan.bucket1Months / 12),
    investableNW: inv, totalNW: netWorth,
  };
}

function checkRebalancing(investments, targetPct) {
  // Equity bucket: listed equity + mutual funds. Crypto excluded (speculative, not an asset class).
  const equity = (investments.equity||0) + (investments.mutualFunds||0);
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
  const monthsToGoal=monthlyGrowth>0&&gap>0?Math.ceil(gap/monthlyGrowth):null;
  const progress=Math.min((l.netWorth/goalAmount)*100,100);
  // DTI = monthly EMI as % of monthly income (standard lender definition)
  const dti=totalIncome>0?(l.expenses.emi/totalIncome)*100:0;
  // Investable NW: exclude illiquid real estate and 40% of NPS (mandatory annuity at withdrawal)
  const realEstate=l.investments.realEstate||0;
  const nps=l.investments.nps||0;
  const investableNetWorth=l.netWorth-realEstate-(nps*0.4);
  // Cross-check: sum-of-parts NW vs user-entered NW — flag >15% gap
  const computedNW=totalInv+(l.bankBalance||0)-totalLoans;
  const nwDiscrepancy=l.netWorth>0&&Math.abs(computedNW-l.netWorth)/l.netWorth>0.15;
  return {netWorth:l.netWorth,totalInv,totalLoans,totalIncome,totalExp,monthlySavings,savingsRate,gap,monthlyGrowth,monthsToGoal,progress,dti,investableNetWorth,computedNW,nwDiscrepancy,nps};
}
function eventUrgency(year) { const y=year-CUR_YEAR; return y<=2?{color:"#ff5252",label:"Urgent"}:y<=5?{color:"#c9a84c",label:"Soon"}:{color:"#00d4a4",label:"Planned"}; }
function profileCompleteness(p) { let s=0; if(p.name)s++;if(p.age)s++;if(p.retirementAge)s++;if(p.riskAppetite)s++;if(p.lifeEvents.length>0)s++; return Math.round(s/5*100); }

// ── Benchmark Analysis Tab ────────────────────────────────────────────────────
function BenchmarkTab({ entries, mode="intermediate" }) {
  const [subTab, setSubTab]   = useState("overview");
  const [selFunds, setSelFunds] = useState(new Set(["fc_ppfas","mc_hdfc","lc_axis","sc_sbi"]));
  const [selBench, setSelBench] = useState("nifty50");
  const [catFilter, setCatFilter] = useState("all");
  const [projYears, setProjYears] = useState(10);
  const [projSIP, setProjSIP]   = useState(25000);

  const toggleFund = id => setSelFunds(prev=>{const s=new Set(prev);if(s.has(id)){if(s.size>1)s.delete(id);}else{if(s.size<6)s.add(id);}return s;});
  const activeFunds = MF_FUNDS.filter(f=>selFunds.has(f.id));
  const bench = BENCHMARKS.find(b=>b.id===selBench);
  const benchNavs = BENCH_NAV[selBench];

  // ── Computed metrics ────────────────────────────────────────────────────────
  const bRetsAll = useMemo(()=>bkRets(benchNavs),[selBench]);

  const metrics = useMemo(()=>activeFunds.map(f=>{
    const navs=MF_NAV[f.id], fr=bkRets(navs);
    const sh=bkSharpe(fr), so=bkSortino(fr), vol=bkVol(fr), cagr=bkCAGR(fr);
    const beta=bkBeta(fr,bRetsAll), alpha=bkAlpha(fr,bRetsAll);
    const maxDD=bkMaxDD(navs), ir=bkIR(fr,bRetsAll);
    const calmar=maxDD!==0?parseFloat((cagr/Math.abs(maxDD)).toFixed(2)):0;
    const riskScore=Math.round(Math.min(100,Math.max(0,(vol/32)*45+(Math.abs(maxDD)/60)*40+((beta-0.5)/2)*15)));
    return {fund:f,sh,so,vol,cagr,beta,alpha,maxDD,ir,calmar,riskScore};
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }),[selFunds,selBench]);

  const benchMetrics = useMemo(()=>({
    cagr:bkCAGR(bRetsAll), vol:bkVol(bRetsAll), sh:bkSharpe(bRetsAll), maxDD:bkMaxDD(benchNavs),
  }),[selBench]);

  // ── Chart data ──────────────────────────────────────────────────────────────
  const normChartData = useMemo(()=>benchNavs.map((item,idx)=>{
    const row={month:item.month,[selBench]:Math.round(item.nav/benchNavs[0].nav*10000)/100};
    activeFunds.forEach(f=>{const fd=MF_NAV[f.id];if(fd[idx])row[f.id]=Math.round(fd[idx].nav/fd[0].nav*10000)/100;});
    return row;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }),[selFunds,selBench]);

  const ddData = useMemo(()=>{
    const bdd=bkDDSeries(benchNavs);
    const fdd={}; activeFunds.forEach(f=>{fdd[f.id]=bkDDSeries(MF_NAV[f.id]);});
    return benchNavs.map((item,i)=>{
      const row={month:item.month,[selBench]:bdd[i]?.dd||0};
      activeFunds.forEach(f=>{row[f.id]=fdd[f.id][i]?.dd||0;});
      return row;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[selFunds,selBench]);

  const rollData = useMemo(()=>{
    const br=bkRolling(benchNavs,12);
    return br.map((item,i)=>{
      const row={month:item.month,[selBench]:item.val};
      activeFunds.forEach(f=>{const r=bkRolling(MF_NAV[f.id],12);if(r[i])row[f.id]=r[i].val;});
      return row;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[selFunds,selBench]);

  const projData = useMemo(()=>{
    const corpus = entries?.length>0?(entries[entries.length-1]?.investments?.mutualFunds||1000000):1000000;
    return Array.from({length:projYears},(_,i)=>{
      const y=i+1, row={year:y};
      row.passive=bkProject(corpus,projSIP,bench.baseRet-0.1,y);
      activeFunds.forEach(f=>{row[f.id]=bkProject(corpus,projSIP,f.baseRet-f.er,y);});
      return row;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[selFunds,selBench,projYears,projSIP,entries]);

  // ── Insights engine ─────────────────────────────────────────────────────────
  const insights = useMemo(()=>{
    const ins=[];
    // Fund-level
    metrics.forEach(m=>{
      if(m.sh>1.2) ins.push({t:"positive",msg:`${m.fund.shortName} Sharpe ${m.sh} — excellent risk-adjusted return vs ${bench?.shortName}`});
      else if(m.sh<0.5) ins.push({t:"warning",msg:`${m.fund.shortName} Sharpe ${m.sh} — weak risk-adjusted return; consider switching`});
      if(m.alpha>4) ins.push({t:"positive",msg:`${m.fund.shortName} generates ${m.alpha}% alpha annually vs ${bench?.shortName} — genuine outperformance`});
      else if(m.alpha<-2) ins.push({t:"risk",msg:`${m.fund.shortName} negative alpha ${m.alpha}% — underperforms ${bench?.shortName}; active fees not justified`});
      if(m.beta>1.3) ins.push({t:"warning",msg:`${m.fund.shortName} Beta ${m.beta} — amplifies every 1% market move by ${m.beta.toFixed(1)}×; high drawdown risk`});
      if(m.maxDD<-45) ins.push({t:"risk",msg:`${m.fund.shortName} max drawdown ${m.maxDD}% — severe peak-to-trough decline; ensure you can stomach this`});
      if(m.calmar>0.5) ins.push({t:"positive",msg:`${m.fund.shortName} Calmar ${m.calmar} — strong return per unit of drawdown risk`});
      if(m.ir>0.5) ins.push({t:"positive",msg:`${m.fund.shortName} Information Ratio ${m.ir} — consistently beats ${bench?.shortName} on a risk-adjusted basis`});
    });
    // Portfolio-level
    const cats=new Set(activeFunds.map(f=>f.category));
    if(cats.size===1&&activeFunds.length>1) ins.push({t:"warning",msg:`All selected funds are ${[...cats][0]} — no cross-category diversification; high concentration risk`});
    const avgAlpha=metrics.length?metrics.reduce((a,m)=>a+m.alpha,0)/metrics.length:0;
    if(avgAlpha<0) ins.push({t:"risk",msg:`Average portfolio alpha vs ${bench?.shortName}: ${avgAlpha.toFixed(1)}% — a passive ${bench?.shortName} index fund would have outperformed`});
    else if(avgAlpha>3) ins.push({t:"positive",msg:`Average portfolio alpha: +${avgAlpha.toFixed(1)}% — active management is adding real value beyond ${bench?.shortName}`});
    const highER=activeFunds.filter(f=>f.er>0.9);
    if(highER.length) ins.push({t:"warning",msg:`${highER.map(f=>f.shortName).join(", ")} have ER>${0.9}% — high costs erode long-term compounding significantly`});
    return ins.slice(0,8);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[metrics,selBench]);

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const fmtTick = m=>{const[y,mo]=m.split("-");return mo==="01"?y:mo==="07"?`Jul '${y.slice(2)}`:""};
  const mc = (v,lo,hi)=>v>=hi?"#00d4a4":v>=lo?"#c9a84c":"#ff5252";
  const TH = ({children,right,center})=><th style={{textAlign:center?"center":right?"right":"left",padding:"8px 11px",color:"#6b8299",fontWeight:600,fontSize:10,whiteSpace:"nowrap",background:"#f7f9fc"}}>{children}</th>;
  const TD = ({children,right,center,style={}})=><td style={{padding:"8px 11px",textAlign:center?"center":right?"right":"left",...style}}>{children}</td>;

  return (
    <div style={{padding:18,display:"flex",flexDirection:"column",gap:16}}>

      {/* Sub-tabs */}
      <div style={{display:"flex",gap:0,borderBottom:"1px solid #dde4ee"}}>
        {[{id:"overview",label:"Overview & Metrics"},{id:"risk",label:"Risk Deep Dive"},
          {id:"avsp",label:"Active vs Passive"},{id:"forecast",label:"Wealth Forecast"}].map(t=>(
          <button key={t.id} className={`ax-tab${subTab===t.id?" active":""}`}
            onClick={()=>setSubTab(t.id)} style={{fontSize:11}}>{t.label}</button>
        ))}
      </div>

      {/* Fund selector */}
      <div className="ax-card" style={{padding:"12px 14px"}}>
        <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap",marginBottom:8}}>
          <span style={{fontSize:11,fontWeight:600,color:"#6b8299"}}>Select Funds</span>
          <span style={{fontSize:10,color:"#aab8c8"}}>(max 6 · {selFunds.size} selected)</span>
          <div style={{marginLeft:"auto",display:"flex",gap:3,flexWrap:"wrap"}}>
            {["all","Large Cap","Mid Cap","Small Cap","Flexi Cap","Large & Mid","Multi Asset"].map(c=>(
              <button key={c} onClick={()=>setCatFilter(c)} className="ax-btn" style={{
                fontSize:9,padding:"2px 7px",
                background:catFilter===c?"#1a2433":"transparent",
                color:catFilter===c?"#c9a84c":"#6b8299",
                borderColor:catFilter===c?"#c9a84c":"#dde4ee",fontWeight:catFilter===c?700:400,
              }}>{c==="all"?"All":c}</button>
            ))}
          </div>
        </div>
        <div style={{display:"flex",gap:5,flexWrap:"wrap",maxHeight:90,overflowY:"auto"}}>
          {MF_FUNDS.filter(f=>catFilter==="all"||f.category===catFilter).map(f=>{
            const sel=selFunds.has(f.id);
            return(
              <button key={f.id} onClick={()=>toggleFund(f.id)} style={{
                display:"flex",alignItems:"center",gap:4,padding:"4px 9px",borderRadius:16,
                border:`1.5px solid ${sel?f.color:"#dde4ee"}`,background:sel?`${f.color}15`:"transparent",
                cursor:"pointer",fontSize:10,color:sel?f.color:"#6b8299",fontWeight:sel?600:400,flexShrink:0,
              }}>
                <span style={{width:7,height:7,borderRadius:"50%",background:sel?f.color:"#dde4ee"}}/>
                {f.shortName}
              </button>
            );
          })}
        </div>
      </div>

      {/* Benchmark selector */}
      <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
        <span style={{fontSize:11,fontWeight:600,color:"#6b8299"}}>Benchmark:</span>
        {BENCHMARKS.map(b=>(
          <button key={b.id} onClick={()=>setSelBench(b.id)} className="ax-btn" style={{
            fontSize:10,padding:"4px 10px",
            background:selBench===b.id?b.color:"transparent",
            color:selBench===b.id?"#fff":b.color,
            borderColor:b.color,fontWeight:selBench===b.id?700:400,
          }}>{b.shortName}</button>
        ))}
      </div>

      {/* ── OVERVIEW & METRICS ── */}
      {subTab==="overview" && <>
        {/* Benchmark reference strip */}
        <div style={{padding:"10px 14px",borderRadius:8,border:`2px solid ${bench?.color}40`,background:`${bench?.color}08`,
          display:"flex",gap:20,flexWrap:"wrap",alignItems:"center"}}>
          <span style={{fontSize:11,fontWeight:700,color:bench?.color}}>{bench?.name} · {bench?.type}</span>
          {[{l:"10Y CAGR",v:`${benchMetrics.cagr}%`},{l:"Volatility",v:`${benchMetrics.vol}%`},
            {l:"Sharpe",v:benchMetrics.sh},{l:"Max DD",v:`${benchMetrics.maxDD}%`}].map(s=>(
            <div key={s.l} style={{display:"flex",gap:5,alignItems:"center"}}>
              <span style={{fontSize:9,color:"#6b8299"}}>{s.l}:</span>
              <span style={{fontSize:11,fontWeight:700,color:bench?.color}}>{s.v}</span>
            </div>
          ))}
          <span style={{fontSize:9,color:"#6b8299",marginLeft:"auto"}}>All active funds compared against this benchmark</span>
        </div>

        {/* ── BEGINNER: Health Check Q&A ── */}
        {mode==="beginner" && (()=>{
          const avgAlpha=metrics.length?metrics.reduce((a,m)=>a+m.alpha,0)/metrics.length:0;
          const avgVol=metrics.length?metrics.reduce((a,m)=>a+m.vol,0)/metrics.length:0;
          const cats=new Set(activeFunds.map(f=>f.category));
          const checks=[
            {q:"Am I beating the market?", a:avgAlpha>0?`YES ✅ (+${avgAlpha.toFixed(1)}%/yr above ${bench?.shortName})`:`NOT QUITE ❌ (${avgAlpha.toFixed(1)}% behind)`, d:avgAlpha>0?`Active funds adding ${avgAlpha.toFixed(1)}% extra annually`:`A ${bench?.shortName} index fund would have done better`, c:avgAlpha>0?"#00d4a4":"#ff5252"},
            {q:"Is my risk level manageable?", a:avgVol<20?"YES ✅ Moderate volatility":"REVIEW ⚠️ High volatility", d:avgVol<20?"Funds don't swing too wildly":"Portfolio can drop significantly in bad markets", c:avgVol<20?"#00d4a4":"#ff8c42"},
            {q:"Am I well diversified?", a:cats.size>=3?"YES ✅":cats.size===2?"PARTIALLY 🟡":"LIMITED ❌", d:`${activeFunds.length} funds across ${cats.size} categor${cats.size>1?"ies":"y"}`, c:cats.size>=3?"#00d4a4":cats.size===2?"#c9a84c":"#ff5252"},
            {q:"Is active investing worth it?", a:avgAlpha>1?"YES ✅ Funds earning fees":avgAlpha>-1?"BORDERLINE 🟡":"PROBABLY NOT ❌", d:avgAlpha>1?"Active management delivering real value":"Consider adding index funds for lower cost", c:avgAlpha>1?"#00d4a4":avgAlpha>-1?"#c9a84c":"#ff5252"},
          ];
          const score=Math.round(Math.max(0,Math.min(100,50+(avgAlpha/5)*25+(cats.size/4)*25-(avgVol>25?15:0))));
          const sc=score>=70?"#00d4a4":score>=50?"#c9a84c":"#ff5252";
          return(
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              <div style={{display:"flex",gap:10,flexWrap:"wrap",alignItems:"center",padding:"12px 16px",borderRadius:10,background:"#f8fafc",border:"1px solid #dde4ee"}}>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:700,color:"#1a2433"}}>Investment Health Check vs {bench?.shortName}</div>
                  <div style={{fontSize:10,color:"#6b8299"}}>Switch to <strong>Investor</strong> or <strong>Pro</strong> mode for detailed quant metrics</div>
                </div>
                <div style={{textAlign:"center",padding:"8px 14px",borderRadius:10,background:`${sc}12`,border:`2px solid ${sc}40`,flexShrink:0}}>
                  <div style={{fontSize:22,fontWeight:800,color:sc}}>{score}</div>
                  <div style={{fontSize:9,color:sc,fontWeight:700}}>PORTFOLIO SCORE</div>
                </div>
              </div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                {checks.map(ch=>(
                  <div key={ch.q} style={{flex:"1 1 200px",padding:"12px 14px",borderRadius:9,background:`${ch.c}07`,border:`1.5px solid ${ch.c}30`}}>
                    <div style={{fontSize:10,color:"#6b8299",marginBottom:4}}>{ch.q}</div>
                    <div style={{fontSize:12,fontWeight:700,color:ch.c,marginBottom:3}}>{ch.a}</div>
                    <div style={{fontSize:9,color:"#3d617e",lineHeight:1.5}}>{ch.d}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {/* ── INVESTOR / PRO: Metrics table ── */}
        {mode!=="beginner" && <div className="ax-card" style={{padding:0,overflow:"hidden"}}>
          <div style={{fontWeight:600,fontSize:12,padding:"12px 16px",borderBottom:"1px solid #dde4ee",display:"flex",alignItems:"center",gap:6}}>
            <BarChart3 size={13}/> Risk-Adjusted Metrics vs {bench?.shortName}
            <span style={{fontSize:9,color:"#6b8299",fontWeight:400,marginLeft:4}}>↑ higher is better · ↓ lower is better</span>
          </div>
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
              <thead><tr>
                <TH>Fund</TH><TH right>CAGR ↑</TH><TH right>Vol% ↓</TH>
                <TH right>Sharpe ↑</TH><TH right>Sortino ↑</TH>
                <TH right>Beta</TH><TH right>Alpha ↑</TH>
                <TH right>Max DD ↓</TH><TH right>Info Ratio ↑</TH><TH right>Calmar ↑</TH>
                <TH center>Risk</TH>
              </tr></thead>
              <tbody>
                <tr style={{borderTop:"1px solid #dde4ee",background:"#f7f9fc"}}>
                  <TD><div style={{display:"flex",alignItems:"center",gap:5}}>
                    <span style={{width:8,height:8,borderRadius:2,background:bench?.color,flexShrink:0}}/>
                    <span style={{fontWeight:700,color:bench?.color}}>{bench?.shortName}</span>
                    <span style={{fontSize:9,color:"#6b8299",background:"#f0f4fa",padding:"1px 5px",borderRadius:6}}>Index</span>
                  </div></TD>
                  <TD right style={{fontWeight:700,color:mc(benchMetrics.cagr,10,14)}}>{benchMetrics.cagr}%</TD>
                  <TD right style={{color:"#3d617e"}}>{benchMetrics.vol}%</TD>
                  <TD right style={{fontWeight:600,color:mc(benchMetrics.sh,0.5,1)}}>{benchMetrics.sh}</TD>
                  <TD right>—</TD><TD right style={{color:"#3d617e"}}>1.00</TD>
                  <TD right style={{color:"#6b8299"}}>0.00%</TD>
                  <TD right style={{color:"#ff5252",fontWeight:700}}>{benchMetrics.maxDD}%</TD>
                  <TD right>—</TD><TD right>—</TD>
                  <TD center><span style={{fontSize:9,color:"#6b8299"}}>baseline</span></TD>
                </tr>
                {metrics.map((m,i)=>(
                  <tr key={m.fund.id} style={{borderTop:"1px solid #dde4ee",background:i%2===0?"#fff":"#fafbfc"}}>
                    <TD><div style={{display:"flex",alignItems:"center",gap:5}}>
                      <span style={{width:8,height:8,borderRadius:"50%",background:m.fund.color,flexShrink:0}}/>
                      <span style={{fontWeight:600,color:"#1a2433"}}>{m.fund.shortName}</span>
                    </div></TD>
                    <TD right style={{fontWeight:700,color:mc(m.cagr,10,14)}}>{m.cagr}%</TD>
                    <TD right style={{color:m.vol>25?"#ff5252":m.vol>18?"#ff8c42":"#3d617e"}}>{m.vol}%</TD>
                    <TD right style={{fontWeight:700,color:mc(m.sh,0.5,1)}}>{m.sh}</TD>
                    <TD right style={{fontWeight:700,color:mc(m.so,0.6,1.2)}}>{m.so}</TD>
                    <TD right style={{color:Math.abs(m.beta-1)<0.15?"#3d617e":m.beta>1?"#ff8c42":"#4a9eff",fontWeight:600}}>{m.beta}</TD>
                    <TD right style={{fontWeight:700,color:m.alpha>=0?"#00d4a4":"#ff5252"}}>{m.alpha>=0?`+${m.alpha}`:m.alpha}%</TD>
                    <TD right style={{fontWeight:700,color:"#ff5252"}}>{m.maxDD}%</TD>
                    <TD right style={{color:m.ir>0?"#00d4a4":"#ff5252",fontWeight:600}}>{m.ir>=0?`+${m.ir}`:m.ir}</TD>
                    <TD right style={{color:mc(m.calmar,0.2,0.4),fontWeight:600}}>{m.calmar}</TD>
                    <TD center>
                      <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
                        <div style={{width:44,height:5,background:"#dde4ee",borderRadius:2}}>
                          <div style={{width:`${m.riskScore}%`,height:"100%",borderRadius:2,
                            background:m.riskScore>70?"#ff5252":m.riskScore>40?"#ff8c42":"#00d4a4"}}/>
                        </div>
                        <span style={{fontSize:9,color:"#6b8299"}}>{m.riskScore}/100</span>
                      </div>
                    </TD>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>}

        {/* Insights */}
        {insights.length>0&&(
          <div className="ax-card" style={{padding:"14px 16px"}}>
            <div style={{fontWeight:600,fontSize:12,marginBottom:10,display:"flex",alignItems:"center",gap:6}}>
              <Brain size={13} color="#c9a84c"/> Actionable Insights & Hidden Risks
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:7}}>
              {insights.map((ins,i)=>(
                <div key={i} style={{display:"flex",gap:8,padding:"8px 12px",borderRadius:8,
                  background:ins.t==="positive"?"rgba(0,212,164,.06)":ins.t==="risk"?"rgba(255,82,82,.07)":"rgba(255,140,66,.06)",
                  borderLeft:`3px solid ${ins.t==="positive"?"#00d4a4":ins.t==="risk"?"#ff5252":"#ff8c42"}`}}>
                  <span style={{fontSize:13,flexShrink:0}}>{ins.t==="positive"?"✓":ins.t==="risk"?"⚠":"◆"}</span>
                  <span style={{fontSize:11,color:"#2d4060",lineHeight:1.5}}>{ins.msg}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </>}

      {/* ── RISK DEEP DIVE ── */}
      {subTab==="risk" && <>
        {/* Drawdown chart */}
        <div className="ax-card" style={{padding:"14px 6px 8px"}}>
          <div style={{paddingLeft:10,marginBottom:2,fontSize:12,fontWeight:600,display:"flex",alignItems:"center",gap:6}}>
            <TrendingDown size={13} color="#ff5252"/> Drawdown from Peak (%)
          </div>
          <div style={{paddingLeft:10,fontSize:9,color:"#6b8299",marginBottom:6}}>% below all-time high at each month · 0 = at peak · lower = deeper drawdown</div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={ddData} margin={{top:4,right:20,left:-10,bottom:4}}>
              <CartesianGrid strokeDasharray="3 3" stroke="#dde4ee"/>
              <XAxis dataKey="month" tick={{fontSize:9,fill:"#6b8299"}} tickFormatter={fmtTick} interval="preserveStartEnd"/>
              <YAxis tick={{fontSize:9,fill:"#6b8299"}} tickFormatter={v=>`${v}%`}/>
              <ReferenceLine y={0} stroke="#dde4ee" strokeWidth={1}/>
              <Tooltip formatter={(v,n)=>[`${v}%`,n===selBench?bench?.shortName:MF_FUNDS.find(f=>f.id===n)?.shortName||n]}
                labelFormatter={l=>fmtML(l)} contentStyle={{fontSize:10,background:"#fff",border:"1px solid #dde4ee",borderRadius:6}}/>
              <Area type="monotone" dataKey={selBench} stroke={bench?.color} fill={`${bench?.color}15`} strokeWidth={1.5} strokeDasharray="4 2" dot={false}/>
              {activeFunds.map(f=>(
                <Area key={f.id} type="monotone" dataKey={f.id} stroke={f.color} fill={`${f.color}08`} strokeWidth={2} dot={false}/>
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Rolling 12M returns */}
        <div className="ax-card" style={{padding:"14px 6px 8px"}}>
          <div style={{paddingLeft:10,marginBottom:4,fontSize:12,fontWeight:600,display:"flex",alignItems:"center",gap:6}}>
            <TrendingUp size={13} color="#c9a84c"/> Rolling 12-Month Returns (%)
          </div>
          <ResponsiveContainer width="100%" height={230}>
            <LineChart data={rollData} margin={{top:4,right:20,left:-10,bottom:4}}>
              <CartesianGrid strokeDasharray="3 3" stroke="#dde4ee"/>
              <XAxis dataKey="month" tick={{fontSize:9,fill:"#6b8299"}} tickFormatter={fmtTick} interval="preserveStartEnd"/>
              <YAxis tick={{fontSize:9,fill:"#6b8299"}} tickFormatter={v=>`${v}%`}/>
              <ReferenceLine y={0} stroke="#ff5252" strokeDasharray="3 3" strokeWidth={1}/>
              <Tooltip formatter={(v,n)=>[`${v}%`,n===selBench?bench?.shortName:MF_FUNDS.find(f=>f.id===n)?.shortName||n]}
                labelFormatter={l=>fmtML(l)} contentStyle={{fontSize:10,background:"#fff",border:"1px solid #dde4ee",borderRadius:6}}/>
              <Line type="monotone" dataKey={selBench} stroke={bench?.color} strokeWidth={1.5} dot={false} strokeDasharray="4 2"/>
              {activeFunds.map(f=>(<Line key={f.id} type="monotone" dataKey={f.id} stroke={f.color} strokeWidth={2} dot={false}/>))}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Risk-Return scatter (SVG bubble plot) */}
        <div className="ax-card" style={{padding:"14px 16px"}}>
          <div style={{fontSize:12,fontWeight:600,marginBottom:10,display:"flex",alignItems:"center",gap:6}}>
            <Activity size={13}/> Risk–Return Profile (Volatility vs CAGR)
          </div>
          {(()=>{
            const pts=[
              {id:selBench,label:bench?.shortName,vol:benchMetrics.vol,ret:benchMetrics.cagr,color:bench?.color,isBench:true},
              ...metrics.map(m=>({id:m.fund.id,label:m.fund.shortName,vol:m.vol,ret:m.cagr,color:m.fund.color}))
            ];
            const maxV=Math.max(...pts.map(p=>p.vol))+3, minV=Math.max(0,Math.min(...pts.map(p=>p.vol))-3);
            const maxR=Math.max(...pts.map(p=>p.ret))+2, minR=Math.min(...pts.map(p=>p.ret))-2;
            const px=v=>((v-minV)/(maxV-minV))*82+9;
            const py=r=>(1-(r-minR)/(maxR-minR))*80+5;
            return(
              <div style={{position:"relative",height:220,background:"#f8fafc",borderRadius:8,border:"1px solid #dde4ee",overflow:"hidden"}}>
                {/* Gridlines */}
                <div style={{position:"absolute",bottom:20,left:0,right:0,height:"1px",background:"#dde4ee"}}/>
                <div style={{position:"absolute",left:"50%",top:0,bottom:20,width:"1px",background:"#eef2f7"}}/>
                <span style={{position:"absolute",bottom:2,left:"50%",transform:"translateX(-50%)",fontSize:8,color:"#6b8299"}}>← Lower Volatility &nbsp;&nbsp; Higher Volatility →</span>
                <span style={{position:"absolute",left:2,top:"45%",transform:"rotate(-90deg) translateX(-50%)",fontSize:8,color:"#6b8299",whiteSpace:"nowrap"}}>CAGR %</span>
                {pts.map(p=>(
                  <div key={p.id} title={`${p.label}: ${p.ret}% CAGR, ${p.vol}% Vol`} style={{
                    position:"absolute",left:`${px(p.vol)}%`,top:`${py(p.ret)}%`,
                    transform:"translate(-50%,-50%)",display:"flex",flexDirection:"column",alignItems:"center",
                  }}>
                    <div style={{width:p.isBench?11:14,height:p.isBench?11:14,
                      borderRadius:p.isBench?"3px":"50%",background:p.color,
                      boxShadow:`0 0 0 3px ${p.color}30`,border:`2px solid ${p.color}`}}/>
                    <span style={{fontSize:8,color:p.color,fontWeight:700,whiteSpace:"nowrap",
                      background:"rgba(255,255,255,.9)",padding:"0 3px",borderRadius:3,marginTop:2}}>{p.label}</span>
                  </div>
                ))}
              </div>
            );
          })()}
          <div style={{fontSize:9,color:"#6b8299",marginTop:6}}>
            ■ = Index benchmark · ● = Active fund · Top-left quadrant (low vol, high return) = optimal
          </div>
        </div>
      </>}

      {/* ── ACTIVE VS PASSIVE ── */}
      {subTab==="avsp" && <>
        {/* ₹1L bar chart */}
        <div className="ax-card" style={{padding:"14px 16px"}}>
          <div style={{fontSize:12,fontWeight:600,marginBottom:12,display:"flex",alignItems:"center",gap:6}}>
            <TrendingUp size={13} color="#c9a84c"/> ₹1 Lakh Invested 10 Years Ago · Final Value
          </div>
          {(()=>{
            const rows=[
              {label:bench?.shortName,color:bench?.color,val:Math.round(benchNavs[benchNavs.length-1].nav),isBench:true,er:0.10,alpha:0},
              ...metrics.map(m=>({label:m.fund.shortName,color:m.fund.color,
                val:Math.round(MF_NAV[m.fund.id][MF_NAV[m.fund.id].length-1].nav),isBench:false,er:m.fund.er,alpha:m.alpha}))
            ].sort((a,b)=>b.val-a.val);
            const maxVal=rows[0]?.val||1;
            return rows.map(r=>(
              <div key={r.label} style={{display:"flex",alignItems:"center",gap:10,marginBottom:9}}>
                <div style={{width:86,fontSize:10,fontWeight:r.isBench?600:500,color:r.color,flexShrink:0}}>{r.label}</div>
                <div style={{flex:1,height:24,background:"#f0f4fa",borderRadius:5,overflow:"hidden",position:"relative"}}>
                  <div style={{width:`${(r.val/maxVal)*100}%`,height:"100%",
                    background:r.isBench?`${r.color}60`:r.color,borderRadius:5}}/>
                  <span style={{position:"absolute",right:8,top:"50%",transform:"translateY(-50%)",
                    fontSize:11,fontWeight:700,color:"#1a2433"}}>
                    ₹{r.val.toLocaleString("en-IN")}
                  </span>
                </div>
                <div style={{width:90,textAlign:"right",fontSize:9,flexShrink:0,color:r.isBench?"#6b8299":r.alpha>=0?"#00d4a4":"#ff5252",fontWeight:600}}>
                  {r.isBench?`Passive (ER ${r.er}%)`:r.alpha>=0?`+${r.alpha}% alpha`:`${r.alpha}% alpha`}
                </div>
              </div>
            ));
          })()}
        </div>

        {/* Expense ratio drag table */}
        <div className="ax-card" style={{padding:0,overflow:"hidden"}}>
          <div style={{fontWeight:600,fontSize:12,padding:"12px 16px",borderBottom:"1px solid #dde4ee",display:"flex",alignItems:"center",gap:6}}>
            <AlertTriangle size={13} color="#ff8c42"/> Expense Ratio Drag · True Cost of Active Management
          </div>
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
              <thead><tr>
                <TH>Fund</TH><TH right>Gross CAGR</TH><TH right>ER%</TH>
                <TH right>Net CAGR</TH><TH right>ER Drag on ₹1L</TH><TH right>vs Passive ({bench?.shortName})</TH>
              </tr></thead>
              <tbody>
                <tr style={{background:"rgba(41,128,185,.05)",borderTop:"1px solid #dde4ee"}}>
                  <TD><span style={{fontWeight:600,color:bench?.color}}>{bench?.shortName} (Passive ETF)</span></TD>
                  <TD right style={{color:mc(benchMetrics.cagr,10,14)}}>{benchMetrics.cagr}%</TD>
                  <TD right style={{color:"#00d4a4"}}>0.10%</TD>
                  <TD right style={{fontWeight:700,color:mc(benchMetrics.cagr-0.1,10,14)}}>{(benchMetrics.cagr-0.1).toFixed(1)}%</TD>
                  <TD right style={{color:"#6b8299"}}>—</TD>
                  <TD right style={{color:"#6b8299"}}>baseline</TD>
                </tr>
                {metrics.map((m,i)=>{
                  const netR=m.cagr-m.fund.er;
                  const grossFV=Math.pow(1+m.cagr/100,10)*100000;
                  const netFV=Math.pow(1+netR/100,10)*100000;
                  const passFV=Math.pow(1+(benchMetrics.cagr-0.1)/100,10)*100000;
                  const drag=Math.round(grossFV-netFV);
                  const vs=Math.round(netFV-passFV);
                  return(
                    <tr key={m.fund.id} style={{borderTop:"1px solid #dde4ee",background:i%2===0?"#fff":"#fafbfc"}}>
                      <TD><div style={{display:"flex",alignItems:"center",gap:5}}>
                        <span style={{width:7,height:7,borderRadius:"50%",background:m.fund.color}}/>
                        <span style={{fontWeight:600}}>{m.fund.shortName}</span>
                      </div></TD>
                      <TD right style={{color:mc(m.cagr,10,14)}}>{m.cagr}%</TD>
                      <TD right style={{color:"#ff8c42",fontWeight:600}}>{m.fund.er}%</TD>
                      <TD right style={{fontWeight:700,color:mc(netR,10,14)}}>{netR.toFixed(1)}%</TD>
                      <TD right style={{color:"#ff8c42"}}>−₹{drag.toLocaleString("en-IN")}</TD>
                      <TD right style={{fontWeight:700,color:vs>=0?"#00d4a4":"#ff5252"}}>{vs>=0?"+":""}{fmt(vs)}</TD>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Normalized performance chart */}
        <div className="ax-card" style={{padding:"14px 6px 8px"}}>
          <div style={{paddingLeft:10,fontSize:12,fontWeight:600,marginBottom:4}}>
            Active vs {bench?.shortName} · Growth of ₹100 (10Y, normalized)
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={normChartData} margin={{top:4,right:20,left:-10,bottom:4}}>
              <CartesianGrid strokeDasharray="3 3" stroke="#dde4ee"/>
              <XAxis dataKey="month" tick={{fontSize:9,fill:"#6b8299"}} tickFormatter={fmtTick} interval="preserveStartEnd"/>
              <YAxis tick={{fontSize:9,fill:"#6b8299"}}/>
              <Tooltip formatter={(v,n)=>[`₹${v}`,n===selBench?bench?.shortName:MF_FUNDS.find(f=>f.id===n)?.shortName||n]}
                labelFormatter={l=>fmtML(l)} contentStyle={{fontSize:10,background:"#fff",border:"1px solid #dde4ee",borderRadius:6}}/>
              <Line type="monotone" dataKey={selBench} stroke={bench?.color} strokeWidth={2.5} dot={false} strokeDasharray="6 3"/>
              {activeFunds.map(f=>(<Line key={f.id} type="monotone" dataKey={f.id} stroke={f.color} strokeWidth={2} dot={false}/>))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </>}

      {/* ── WEALTH FORECAST ── */}
      {subTab==="forecast" && <>
        {/* Inputs */}
        <div className="ax-card" style={{padding:"14px 16px"}}>
          <div style={{fontSize:12,fontWeight:600,marginBottom:10}}>Projection Settings</div>
          <div style={{display:"flex",gap:16,flexWrap:"wrap"}}>
            <div>
              <div className="ax-label">Time Horizon</div>
              <div style={{display:"flex",gap:4}}>
                {[5,10,15,20,30].map(y=>(
                  <button key={y} onClick={()=>setProjYears(y)} className="ax-btn" style={{
                    padding:"4px 10px",fontSize:11,
                    background:projYears===y?"#c9a84c":"transparent",
                    color:projYears===y?"#1a1a1a":"#6b8299",
                    borderColor:projYears===y?"#c9a84c":"#dde4ee",fontWeight:projYears===y?700:400,
                  }}>{y}Y</button>
                ))}
              </div>
            </div>
            <div>
              <div className="ax-label">Monthly SIP</div>
              <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                {[10000,25000,50000,100000].map(s=>(
                  <button key={s} onClick={()=>setProjSIP(s)} className="ax-btn" style={{
                    padding:"4px 10px",fontSize:11,
                    background:projSIP===s?"#c9a84c":"transparent",
                    color:projSIP===s?"#1a1a1a":"#6b8299",
                    borderColor:projSIP===s?"#c9a84c":"#dde4ee",fontWeight:projSIP===s?700:400,
                  }}>{fmt(s)}</button>
                ))}
              </div>
            </div>
          </div>
          <div style={{fontSize:9,color:"#6b8299",marginTop:8}}>
            Starting corpus: {fmt(entries?.length>0?(entries[entries.length-1]?.investments?.mutualFunds||1000000):1000000)}
            · Uses fund's expected return minus expense ratio · Deterministic median projection
          </div>
        </div>

        {/* Trajectory chart */}
        <div className="ax-card" style={{padding:"14px 6px 8px"}}>
          <div style={{paddingLeft:10,fontSize:12,fontWeight:600,marginBottom:4,display:"flex",alignItems:"center",gap:6}}>
            <Zap size={13} color="#c9a84c"/> {projYears}-Year Wealth Trajectory · SIP {fmt(projSIP)}/mo
          </div>
          <ResponsiveContainer width="100%" height={270}>
            <LineChart data={projData} margin={{top:4,right:20,left:10,bottom:4}}>
              <CartesianGrid strokeDasharray="3 3" stroke="#dde4ee"/>
              <XAxis dataKey="year" tick={{fontSize:9,fill:"#6b8299"}} tickFormatter={v=>`Yr ${v}`}/>
              <YAxis tick={{fontSize:9,fill:"#6b8299"}} tickFormatter={v=>fmt(v)} width={70}/>
              <Tooltip formatter={(v,n)=>[fmt(v),n==="passive"?`${bench?.shortName} Passive`:MF_FUNDS.find(f=>f.id===n)?.shortName||n]}
                contentStyle={{fontSize:10,background:"#fff",border:"1px solid #dde4ee",borderRadius:6}}/>
              <Line type="monotone" dataKey="passive" stroke={bench?.color} strokeWidth={2} dot={false} strokeDasharray="6 3" name="passive"/>
              {activeFunds.map(f=>(<Line key={f.id} type="monotone" dataKey={f.id} stroke={f.color} strokeWidth={2.5} dot={false}/>))}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Outcome table */}
        <div className="ax-card" style={{padding:0,overflow:"hidden"}}>
          <div style={{fontWeight:600,fontSize:12,padding:"12px 16px",borderBottom:"1px solid #dde4ee"}}>
            Projected Corpus Milestones · SIP {fmt(projSIP)}/mo (Median estimate, net of ER)
          </div>
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
              <thead><tr>
                <TH>Fund / Index</TH>
                {[Math.ceil(projYears*0.25),Math.ceil(projYears*0.5),Math.ceil(projYears*0.75),projYears]
                  .filter((v,i,a)=>a.indexOf(v)===i).map(y=><TH right key={y}>Year {y}</TH>)}
                <TH right>vs Passive</TH>
              </tr></thead>
              <tbody>
                {(()=>{
                  const ms=[Math.ceil(projYears*0.25),Math.ceil(projYears*0.5),Math.ceil(projYears*0.75),projYears].filter((v,i,a)=>a.indexOf(v)===i);
                  const rows=[
                    {id:"passive",label:bench?.shortName,color:bench?.color,isBench:true},
                    ...activeFunds.map(f=>({id:f.id,label:f.shortName,color:f.color}))
                  ];
                  const gv=(id,y)=>projData.find(d=>d.year===y)?.[id]||0;
                  const pEnd=gv("passive",projYears);
                  return rows.map((r,i)=>(
                    <tr key={r.id} style={{borderTop:"1px solid #dde4ee",background:r.isBench?"rgba(74,158,255,.03)":i%2===0?"#fff":"#fafbfc"}}>
                      <TD><div style={{display:"flex",alignItems:"center",gap:5}}>
                        <span style={{width:8,height:8,borderRadius:r.isBench?"2px":"50%",background:r.color,flexShrink:0}}/>
                        <span style={{fontWeight:600,color:r.color}}>{r.label}</span>
                        {r.isBench&&<span style={{fontSize:9,color:"#6b8299",background:"#f0f4fa",padding:"1px 5px",borderRadius:6}}>Passive</span>}
                      </div></TD>
                      {ms.map(y=><TD right key={y} style={{fontWeight:600,color:"#1a2433"}}>{fmt(gv(r.id,y))}</TD>)}
                      <TD right>
                        {r.isBench?<span style={{fontSize:9,color:"#6b8299"}}>baseline</span>:(()=>{
                          const d=gv(r.id,projYears)-pEnd;
                          return<span style={{fontWeight:700,color:d>=0?"#00d4a4":"#ff5252"}}>{d>=0?"+":""}{fmt(d)}</span>;
                        })()}
                      </TD>
                    </tr>
                  ));
                })()}
              </tbody>
            </table>
          </div>
        </div>
      </>}
    </div>
  );
}

// ── Beginner: Market Beat Card ────────────────────────────────────────────────
function BeginnerMarketBeatCard({ entries }) {
  if (!entries?.length) return null;
  const sorted = [...entries].sort((a,b)=>a.id.localeCompare(b.id));
  if (sorted.length < 2) return null;
  const first = sorted[0], last = sorted[sorted.length-1];
  const months = sorted.length - 1;
  const firstInv = Object.values(first?.investments||{}).reduce((a,v)=>a+v,0);
  const lastInv  = Object.values(last?.investments||{}).reduce((a,v)=>a+v,0);
  if (firstInv <= 0 || months < 3) return null;
  const portCAGR = ((Math.pow(lastInv/firstInv,12/months)-1)*100);
  const benchmarks = [
    {label:"Nifty 50",   val:12.0, emoji:"📈"},
    {label:"Gold",       val:8.0,  emoji:"🥇"},
    {label:"Bank FD",    val:7.0,  emoji:"🏦"},
  ];
  const color = portCAGR >= 12 ? "#00d4a4" : portCAGR >= 7 ? "#c9a84c" : "#ff5252";
  const verdict = portCAGR >= 12 ? "✅ You are beating Nifty 50!"
                : portCAGR >= 8  ? "🟡 You beat Gold & FD, but not the index."
                : portCAGR >= 7  ? "🟡 You are beating Fixed Deposits."
                                 : "❌ A simple index fund may do better.";
  return (
    <div className="ax-card" style={{padding:"16px 20px"}}>
      <div style={{fontSize:12,fontWeight:700,marginBottom:12,display:"flex",alignItems:"center",gap:6}}>
        <TrendingUp size={14} color="#c9a84c"/> Am I beating the market?
      </div>
      <div style={{display:"flex",gap:16,flexWrap:"wrap",alignItems:"center",marginBottom:12}}>
        <div style={{textAlign:"center",padding:"10px 16px",borderRadius:10,background:`${color}10`,border:`2px solid ${color}30`}}>
          <div style={{fontSize:32,fontWeight:800,color,lineHeight:1}}>{portCAGR.toFixed(1)}%</div>
          <div style={{fontSize:9,color:"#6b8299",marginTop:2}}>Your returns / year</div>
        </div>
        <div style={{flex:1,fontSize:12,fontWeight:600,color,lineHeight:1.6}}>{verdict}</div>
      </div>
      <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
        {benchmarks.map(b=>{
          const beat = portCAGR > b.val;
          return(
            <div key={b.label} style={{flex:"1 1 80px",padding:"8px 10px",borderRadius:8,
              background:beat?"rgba(0,212,164,.07)":"rgba(255,82,82,.05)",
              border:`1px solid ${beat?"rgba(0,212,164,.25)":"rgba(255,82,82,.2)"}`}}>
              <div style={{fontSize:10}}>{b.emoji} {b.label}</div>
              <div style={{fontSize:13,fontWeight:700,color:beat?"#00d4a4":"#ff5252"}}>{beat?"▲ Beat":"▼ Behind"}</div>
              <div style={{fontSize:9,color:"#6b8299"}}>{b.val}%/yr</div>
            </div>
          );
        })}
      </div>
      <div style={{fontSize:9,color:"#6b8299",marginTop:8}}>
        Based on your investment portfolio CAGR over {months} months. Benchmarks are long-run historical averages.
      </div>
    </div>
  );
}

// ── Beginner: Risk Thermometer ────────────────────────────────────────────────
function BeginnerRiskThermometer({ entries }) {
  if (!entries?.length) return null;
  const sorted = [...entries].sort((a,b)=>a.id.localeCompare(b.id));
  const l = sorted[sorted.length-1];
  const totalInv   = Object.values(l.investments||{}).reduce((a,v)=>a+v,0);
  const totalLoans = Object.values(l.loans||{}).reduce((a,v)=>a+v,0);
  const totalInc   = Object.values(l.income||{}).reduce((a,v)=>a+v,0);
  const totalExp   = Object.values(l.expenses||{}).reduce((a,v)=>a+v,0);
  const savings    = totalInc - totalExp;
  const savePct    = totalInc > 0 ? savings/totalInc*100 : 0;
  let risk = 35;
  if (savePct < 10) risk += 22; else if (savePct < 20) risk += 12;
  if (totalLoans > totalInv) risk += 25; else if (totalLoans > totalInv*0.5) risk += 10;
  if (totalInv === 0) risk += 18;
  if (sorted.length >= 4) {
    const rets = sorted.slice(1).map((e,i)=>{const p=sorted[i].netWorth||1;return(e.netWorth-p)/p;});
    const mean = rets.reduce((a,v)=>a+v,0)/rets.length;
    const vol  = Math.sqrt(rets.reduce((a,v)=>a+Math.pow(v-mean,2),0)/rets.length)*100;
    if (vol>10) risk+=10; else if(vol>5) risk+=5;
  }
  risk = Math.max(0, Math.min(100, Math.round(risk)));
  const band = risk<30 ? {label:"LOW RISK",     color:"#00d4a4", desc:"Stable finances. Keep it up!", emoji:"🟢"}
             : risk<55 ? {label:"MODERATE",     color:"#c9a84c", desc:"Some risk present — keep loans in check.", emoji:"🟡"}
             : risk<75 ? {label:"HIGH RISK",    color:"#ff8c42", desc:"Significant risk. Focus on reducing debt.", emoji:"🟠"}
                       : {label:"VERY HIGH",    color:"#ff5252", desc:"Urgent: Debt far exceeds investments.", emoji:"🔴"};
  const tips = [
    savePct<20   && "Save at least 20% of your income every month.",
    totalLoans>totalInv && "Your loans exceed your investments — pay down debt first.",
    totalInv===0 && "Start a monthly SIP — even ₹500/month builds a habit.",
  ].filter(Boolean);
  const fillH = Math.round(72 * risk/100);
  return (
    <div className="ax-card" style={{padding:"16px 20px"}}>
      <div style={{fontSize:12,fontWeight:700,marginBottom:12,display:"flex",alignItems:"center",gap:6}}>
        <Activity size={14} color={band.color}/> Risk Thermometer
      </div>
      <div style={{display:"flex",gap:16,alignItems:"center",flexWrap:"wrap",marginBottom:tips.length?10:0}}>
        <svg width="28" height="90" viewBox="0 0 28 90" style={{flexShrink:0}}>
          <rect x="9" y="4" width="10" height="72" rx="5" fill="#f0f4fa" stroke="#dde4ee" strokeWidth="1"/>
          <rect x="10" y={4+(72-fillH)} width="8" height={fillH} rx="4" fill={band.color}/>
          <circle cx="14" cy="80" r="8" fill={band.color}/>
          <circle cx="14" cy="80" r="5" fill="rgba(255,255,255,.3)"/>
        </svg>
        <div style={{flex:1}}>
          <div style={{fontSize:18,fontWeight:800,color:band.color,marginBottom:4}}>{band.emoji} {band.label}</div>
          <div style={{fontSize:11,color:"#3d617e",lineHeight:1.5,marginBottom:4}}>{band.desc}</div>
          <div style={{fontSize:10,color:"#6b8299"}}>Risk score: <strong style={{color:band.color}}>{risk}/100</strong></div>
        </div>
      </div>
      {tips.map((t,i)=>(
        <div key={i} style={{fontSize:11,color:"#3d617e",padding:"6px 10px",marginTop:5,
          background:"rgba(255,140,66,.06)",borderLeft:"3px solid #ff8c42",borderRadius:"0 6px 6px 0"}}>
          💡 {t}
        </div>
      ))}
    </div>
  );
}

// ── Beginner: Allocation Pie ──────────────────────────────────────────────────
function BeginnerAllocationPie({ entries }) {
  if (!entries?.length) return null;
  const l = [...entries].sort((a,b)=>a.id.localeCompare(b.id))[entries.length-1];
  const totalInc = Object.values(l.income||{}).reduce((a,v)=>a+v,0);
  if (!totalInc) return null;
  const totalExp   = Object.values(l.expenses||{}).reduce((a,v)=>a+v,0);
  const totalInv   = Object.values(l.investments||{}).reduce((a,v)=>a+v,0);
  const totalLoans = Object.values(l.loans||{}).reduce((a,v)=>a+v,0);
  const sav        = Math.max(0, totalInc - totalExp);
  const segs = [
    {label:"Expenses",    value:totalExp,   color:"#ff5252"},
    {label:"Savings",     value:sav,        color:"#00d4a4"},
    {label:"Investments", value:totalInv,   color:"#c9a84c"},
    {label:"Loans",       value:totalLoans, color:"#ff8c42"},
  ].filter(s=>s.value>0).map(s=>({...s,pct:s.value/totalInc*100}));
  const savPct = (sav/totalInc*100).toFixed(0);
  return (
    <div className="ax-card" style={{padding:"16px 20px"}}>
      <div style={{fontSize:12,fontWeight:700,marginBottom:10,display:"flex",alignItems:"center",gap:6}}>
        <DollarSign size={14} color="#c9a84c"/> Where does your money go?
      </div>
      <div style={{fontSize:9,color:"#6b8299",marginBottom:8}}>Latest month · Total income {fmt(totalInc)}</div>
      <div style={{height:20,borderRadius:6,overflow:"hidden",display:"flex",gap:1,marginBottom:10}}>
        {segs.map(s=><div key={s.label} style={{flex:s.pct,background:s.color,minWidth:2}} title={`${s.label}: ${s.pct.toFixed(0)}%`}/>)}
      </div>
      <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
        {segs.map(s=>(
          <div key={s.label} style={{flex:"1 1 90px",padding:"8px 10px",borderRadius:8,background:`${s.color}09`,border:`1px solid ${s.color}30`}}>
            <div style={{display:"flex",alignItems:"center",gap:4,marginBottom:2}}>
              <span style={{width:7,height:7,borderRadius:"50%",background:s.color,flexShrink:0}}/>
              <span style={{fontSize:9,color:"#6b8299"}}>{s.label}</span>
            </div>
            <div style={{fontSize:14,fontWeight:700,color:s.color}}>{s.pct.toFixed(0)}%</div>
            <div style={{fontSize:9,color:"#3d617e"}}>{fmt(s.value)}</div>
          </div>
        ))}
      </div>
      {parseFloat(savPct) < 20 && (
        <div style={{marginTop:8,fontSize:11,color:"#ff8c42",background:"rgba(255,140,66,.06)",padding:"6px 10px",borderRadius:6}}>
          💡 Aim to save 20%+ of income. You're saving {savPct}%.
        </div>
      )}
    </div>
  );
}

// ── Beginner: SIP Simulator ───────────────────────────────────────────────────
function BeginnerSIPSimulator() {
  const [monthly, setMonthly] = useState(5000);
  const [years,   setYears]   = useState(10);
  const [rate,    setRate]    = useState(12);
  const result = useMemo(()=>{
    const r=rate/1200, n=years*12;
    const corpus = monthly*((Math.pow(1+r,n)-1)/r)*(1+r);
    const invested = monthly*n;
    return {corpus:Math.round(corpus), invested:Math.round(invested), gains:Math.round(corpus-invested)};
  },[monthly,years,rate]);
  const chartData = useMemo(()=>Array.from({length:years+1},(_,y)=>{
    if(!y) return {year:0,corpus:0,invested:0};
    const r=rate/1200,n=y*12;
    return {year:y, corpus:Math.round(monthly*((Math.pow(1+r,n)-1)/r)*(1+r)), invested:Math.round(monthly*n)};
  }),[monthly,years,rate]);
  return (
    <div className="ax-card" style={{padding:"16px 20px"}}>
      <div style={{fontSize:12,fontWeight:700,marginBottom:12,display:"flex",alignItems:"center",gap:6}}>
        <Zap size={14} color="#c9a84c"/> SIP Growth Simulator
      </div>
      <div style={{display:"flex",gap:12,flexWrap:"wrap",marginBottom:12}}>
        <div style={{flex:"1 1 120px"}}>
          <label className="ax-label">Monthly SIP (₹)</label>
          <input className="ax-input" type="number" value={monthly} min="500" step="500"
            onChange={e=>setMonthly(Math.max(500,parseInt(e.target.value)||500))}/>
        </div>
        <div style={{flex:"1 1 120px"}}>
          <label className="ax-label">Duration</label>
          <div style={{display:"flex",gap:3,flexWrap:"wrap"}}>
            {[5,10,15,20,30].map(y=>(
              <button key={y} className="ax-btn" onClick={()=>setYears(y)} style={{
                padding:"3px 7px",fontSize:10,
                background:years===y?"#c9a84c":"transparent",color:years===y?"#1a1a1a":"#6b8299",
                borderColor:years===y?"#c9a84c":"#dde4ee",fontWeight:years===y?700:400}}>{y}Y</button>
            ))}
          </div>
        </div>
        <div style={{flex:"1 1 120px"}}>
          <label className="ax-label">Expected Return</label>
          <div style={{display:"flex",gap:3,flexWrap:"wrap"}}>
            {[8,10,12,15].map(r=>(
              <button key={r} className="ax-btn" onClick={()=>setRate(r)} style={{
                padding:"3px 7px",fontSize:10,
                background:rate===r?"#c9a84c":"transparent",color:rate===r?"#1a1a1a":"#6b8299",
                borderColor:rate===r?"#c9a84c":"#dde4ee",fontWeight:rate===r?700:400}}>{r}%</button>
            ))}
          </div>
        </div>
      </div>
      <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:12}}>
        <div style={{flex:"1 1 100px",padding:"10px 12px",background:"#f8fafc",borderRadius:8,textAlign:"center"}}>
          <div style={{fontSize:9,color:"#6b8299"}}>You invest</div>
          <div style={{fontSize:14,fontWeight:700,color:"#3d617e"}}>{fmt(result.invested)}</div>
        </div>
        <div style={{flex:"1 1 100px",padding:"10px 12px",background:"rgba(0,212,164,.07)",borderRadius:8,textAlign:"center"}}>
          <div style={{fontSize:9,color:"#6b8299"}}>Your profit</div>
          <div style={{fontSize:14,fontWeight:700,color:"#00d4a4"}}>{fmt(result.gains)}</div>
        </div>
        <div style={{flex:"1 1 100px",padding:"10px 12px",background:"rgba(201,168,76,.08)",borderRadius:8,textAlign:"center",border:"1px solid rgba(201,168,76,.3)"}}>
          <div style={{fontSize:9,color:"#6b8299"}}>Final corpus</div>
          <div style={{fontSize:16,fontWeight:800,color:"#c9a84c"}}>{fmt(result.corpus)}</div>
        </div>
      </div>
      <div style={{height:110}}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{top:4,right:4,bottom:0,left:0}}>
            <defs>
              <linearGradient id="sip-c" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#c9a84c" stopOpacity={0.3}/><stop offset="95%" stopColor="#c9a84c" stopOpacity={0}/></linearGradient>
              <linearGradient id="sip-i" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#4a9eff" stopOpacity={0.2}/><stop offset="95%" stopColor="#4a9eff" stopOpacity={0}/></linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#dde4ee"/>
            <XAxis dataKey="year" tick={{fontSize:9,fill:"#6b8299"}} tickFormatter={v=>`Y${v}`}/>
            <YAxis tick={{fontSize:9,fill:"#6b8299"}} width={42}
              tickFormatter={v=>v>=1e7?`${(v/1e7).toFixed(0)}Cr`:v>=1e5?`${(v/1e5).toFixed(0)}L`:`${(v/1000).toFixed(0)}K`}/>
            <Tooltip formatter={(v,n)=>[fmt(v),n==="corpus"?"Total Corpus":"Invested"]}
              contentStyle={{fontSize:10,background:"#fff",border:"1px solid #dde4ee",borderRadius:6}}/>
            <Area type="monotone" dataKey="invested" stroke="#4a9eff" fill="url(#sip-i)" strokeWidth={1.5} dot={false}/>
            <Area type="monotone" dataKey="corpus"   stroke="#c9a84c" fill="url(#sip-c)" strokeWidth={2}   dot={false}/>
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div style={{fontSize:9,color:"#6b8299",marginTop:4}}>Gold = total value · Blue = money invested · Gap = compounding gains</div>
    </div>
  );
}

// ── Pro: Risk Lab Tab ─────────────────────────────────────────────────────────
const STRESS_SCENARIOS = [
  {id:"mild",   label:"Mild Correction",        drop:-10, recovery:4,  desc:"Routine 10% correction, quick bounce-back"},
  {id:"covid",  label:"COVID-19 Crash (2020)",  drop:-38, recovery:8,  desc:"Nifty fell 38% in 6 weeks, recovered in ~8 months"},
  {id:"ilfs",   label:"IL&FS Crisis (2018)",    drop:-18, recovery:15, desc:"Credit freeze, midcap rout, 15-month recovery"},
  {id:"gfc",    label:"GFC 2008–09",            drop:-55, recovery:24, desc:"Nifty lost 55% over 12 months, 2-year recovery"},
  {id:"severe", label:"Severe Crash (-50%)",    drop:-50, recovery:30, desc:"Worst-case scenario, prolonged bear market"},
];

function RiskLabTab({ entries=[] }) {
  const [subTab, setSubTab] = useState("var");
  const [mcYears, setMcYears] = useState(10);
  const [scenario, setScenario] = useState("covid");

  // Monthly investment returns from user entries
  const { invRets, hasData } = useMemo(()=>{
    if(entries.length < 4) return {invRets:[], hasData:false};
    const s=[...entries].sort((a,b)=>a.id.localeCompare(b.id));
    const r=s.slice(1).map((e,i)=>{
      const pi=Object.values(s[i].investments||{}).reduce((a,v)=>a+v,0)||1;
      const ci=Object.values(e.investments||{}).reduce((a,v)=>a+v,0);
      const ret=(ci-pi)/pi;
      return Math.abs(ret)<0.6?ret:null; // exclude outlier jumps
    }).filter(v=>v!==null);
    return {invRets:r, hasData:r.length>=3};
  },[entries]);

  const stats = useMemo(()=>{
    // fall back to typical Indian equity params if no data
    const rets = hasData ? invRets : Array.from({length:24},(_,i)=>{
      const s=(i*7+13)%31/100-0.01; return s;
    });
    const n=rets.length, mean=rets.reduce((a,v)=>a+v,0)/n;
    const variance=rets.reduce((a,v)=>a+Math.pow(v-mean,2),0)/Math.max(n-1,1);
    const std=Math.sqrt(variance);
    const sorted=[...rets].sort((a,b)=>a-b);
    const i95=Math.max(0,Math.floor(n*0.05)-1), i99=Math.max(0,Math.floor(n*0.01)-1);
    const histVaR95=sorted[i95]??sorted[0], histVaR99=sorted[i99]??sorted[0];
    const pVaR95=mean-1.645*std, pVaR99=mean-2.326*std;
    const tail95=sorted.slice(0,Math.max(1,Math.floor(n*0.05)));
    const cvar95=tail95.reduce((a,v)=>a+v,0)/tail95.length;
    const rf=0.07/12;
    const sharpe=std>0?((mean-rf)/std)*Math.sqrt(12):0;
    const dRets=rets.filter(r=>r<rf);
    const dStd=dRets.length>1?Math.sqrt(dRets.reduce((a,v)=>a+Math.pow(v-rf,2),0)/dRets.length):std;
    const sortino=dStd>0?((mean-rf)/dStd)*Math.sqrt(12):0;
    // M5: compute real beta against Nifty 50, not a hardcoded default
    const niftyRets = bkRets(BENCH_NAV["nifty50"]);
    const niftySlice = niftyRets.slice(-rets.length);
    const betaVal = rets.length >= 3 ? bkBeta(rets, niftySlice) : 1.0;
    const treynor = betaVal !== 0 ? parseFloat((((mean-rf)*12)/betaVal).toFixed(3)) : 0;
    let maxDD=0,pk=-Infinity;
    [...entries].sort((a,b)=>a.id.localeCompare(b.id)).forEach(e=>{
      const iv=Object.values(e.investments||{}).reduce((a,v)=>a+v,0);
      if(iv>pk) pk=iv;
      const dd=pk>0?(iv-pk)/pk*100:0;
      if(dd<maxDD) maxDD=dd;
    });
    return {mean,std,annMean:((Math.pow(1+mean,12)-1)*100),annVol:std*Math.sqrt(12)*100,
      sharpe,sortino,treynor,
      histVaR95:histVaR95*100,histVaR99:histVaR99*100,pVaR95:pVaR95*100,pVaR99:pVaR99*100,
      cvar95:cvar95*100,maxDD,n};
  },[invRets,hasData,entries]);

  const mcData = useMemo(()=>{
    const corpus=entries.length>0?Object.values(entries[entries.length-1]?.investments||{}).reduce((a,v)=>a+v,0)||1000000:1000000;
    const {mean,std}=stats, months=mcYears*12, N=200;
    let s=54321;
    const rand=()=>{s=(Math.imul(1664525,s)+1013904223)>>>0;return s/4294967296;};
    const norm=()=>{const u1=Math.max(rand(),1e-10),u2=rand();return Math.sqrt(-2*Math.log(u1))*Math.cos(2*Math.PI*u2);};
    const paths=Array.from({length:N},()=>{let v=corpus;return Array.from({length:months+1},(_,m)=>{if(!m)return v;v*=Math.exp((mean-0.5*std*std)+std*norm());return v;});});
    return Array.from({length:mcYears+1},(_,y)=>{
      const mi=y*12, vals=paths.map(p=>p[mi]).sort((a,b)=>a-b);
      return {year:y,p10:vals[Math.floor(N*.10)],p25:vals[Math.floor(N*.25)],p50:vals[Math.floor(N*.50)],p75:vals[Math.floor(N*.75)],p90:vals[Math.floor(N*.90)]};
    });
  },[stats,mcYears,entries]);

  const fragility = useMemo(()=>{
    if(!entries.length) return null;
    const l=[...entries].sort((a,b)=>a.id.localeCompare(b.id))[entries.length-1];
    const totalInv=Object.values(l.investments||{}).reduce((a,v)=>a+v,0);
    const totalLoans=Object.values(l.loans||{}).reduce((a,v)=>a+v,0);
    const totalInc=Object.values(l.income||{}).reduce((a,v)=>a+v,0);
    const totalExp=Object.values(l.expenses||{}).reduce((a,v)=>a+v,0);
    const savBuf=totalInc>0?(totalInc-totalExp)/totalInc:0;
    const debtRatio=totalInv>0?totalLoans/totalInv:2;
    const volS=stats.annVol>25?30:stats.annVol>15?18:8;
    const ddS=stats.maxDD<-40?25:stats.maxDD<-20?15:5;
    const debtS=debtRatio>1.5?25:debtRatio>0.5?15:5;
    const savS=savBuf<0.10?20:savBuf<0.20?12:4;
    const score=volS+ddS+debtS+savS;
    const factors=[
      {label:"Return Volatility",  score:volS,  max:30, desc:`${stats.annVol.toFixed(1)}% annualised`,              color:volS>20?"#ff5252":volS>12?"#ff8c42":"#00d4a4"},
      {label:"Peak Drawdown",      score:ddS,   max:25, desc:`${stats.maxDD.toFixed(1)}% worst peak-to-trough`,     color:ddS>18?"#ff5252":ddS>10?"#ff8c42":"#00d4a4"},
      {label:"Debt Load",          score:debtS, max:25, desc:`Debt/investment: ${totalInv>0?(totalLoans/totalInv).toFixed(2):"N/A"}`, color:debtS>18?"#ff5252":debtS>10?"#ff8c42":"#00d4a4"},
      {label:"Savings Buffer",     score:savS,  max:20, desc:`Saving ${(savBuf*100).toFixed(0)}% of income`,        color:savS>15?"#ff5252":savS>8?"#ff8c42":"#00d4a4"},
    ];
    const band=score>=70?{label:"FRAGILE",  color:"#ff5252",desc:"Highly vulnerable to market stress"}
              :score>=45?{label:"MODERATE", color:"#ff8c42",desc:"Some fragility — reduce debt & build buffers"}
              :score>=25?{label:"RESILIENT",color:"#c9a84c",desc:"Can weather moderate downturns"}
                        :{label:"ROBUST",   color:"#00d4a4",desc:"Well-positioned for market stress"};
    return {score,factors,band};
  },[entries,stats]);

  const stress = useMemo(()=>{
    const sc=STRESS_SCENARIOS.find(s=>s.id===scenario);
    if(!sc||!entries.length) return null;
    const curInv=Object.values(entries[entries.length-1]?.investments||{}).reduce((a,v)=>a+v,0);
    if(!curInv) return null;
    const loss=curInv*sc.drop/100;
    return {...sc,curInv,loss,postCrash:curInv+loss};
  },[scenario,entries]);

  const pct=v=>`${v>=0?"+":""}${v.toFixed(2)}%`;
  const mc=v=>v>=1?"#00d4a4":v>=0.5?"#c9a84c":"#ff5252";

  return (
    <div style={{padding:18,display:"flex",flexDirection:"column",gap:16}}>
      {!hasData&&(
        <div style={{padding:"8px 14px",borderRadius:8,background:"rgba(127,119,221,.07)",border:"1px solid rgba(127,119,221,.2)",fontSize:10,color:"#7f77dd"}}>
          <Sigma size={11} style={{verticalAlign:"middle",marginRight:4}}/> Add 4+ months of investment data for precise VaR. Using estimated parameters for now.
        </div>
      )}
      <div style={{display:"flex",gap:0,borderBottom:"1px solid #dde4ee"}}>
        {[{id:"var",label:"VaR & CVaR"},{id:"mc",label:"Monte Carlo"},{id:"stress",label:"Stress Tests"},{id:"fragility",label:"Fragility Score"}].map(t=>(
          <button key={t.id} className={`ax-tab${subTab===t.id?" active":""}`} onClick={()=>setSubTab(t.id)} style={{fontSize:11}}>{t.label}</button>
        ))}
      </div>

      {/* ── VaR & CVaR ── */}
      {subTab==="var"&&<>
        <div style={{fontSize:9,color:"#6b8299",padding:"6px 12px",background:"#f7f9fc",borderRadius:6,border:"1px solid #dde4ee",lineHeight:1.7}}>
          <strong>VaR (Value at Risk):</strong> Maximum monthly loss at given confidence level.{" "}
          <strong>CVaR / ES:</strong> Average loss in worst tail scenarios. Based on {stats.n} return observations.
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(155px,1fr))",gap:10}}>
          {[
            {label:"Parametric VaR (95%)",   val:pct(stats.pVaR95),          note:"Monthly loss threshold",  color:"#ff8c42"},
            {label:"Parametric VaR (99%)",   val:pct(stats.pVaR99),          note:"1-in-100-month tail",      color:"#ff5252"},
            {label:"Historical VaR (95%)",   val:pct(stats.histVaR95),       note:"Empirical 5th percentile", color:"#ff8c42"},
            {label:"CVaR / Exp. Shortfall",  val:pct(stats.cvar95),          note:"Avg loss beyond VaR 95%",  color:"#ff5252"},
            {label:"Annualised Volatility",  val:`${stats.annVol.toFixed(1)}%`, note:"Return std × √12",      color:"#c9a84c"},
            {label:"Sharpe Ratio",           val:stats.sharpe.toFixed(2),    note:"(ret−rf)/vol × √12",       color:mc(stats.sharpe)},
            {label:"Sortino Ratio",          val:stats.sortino.toFixed(2),   note:"(ret−rf)/downVol × √12",   color:mc(stats.sortino)},
            {label:"Treynor Ratio",          val:stats.treynor.toFixed(3),   note:"Excess return per β unit",  color:mc(stats.treynor)},
            {label:"Max Drawdown",           val:`${stats.maxDD.toFixed(1)}%`, note:"Worst peak-to-trough",   color:"#ff5252"},
          ].map(m=>(
            <div key={m.label} className="ax-card" style={{padding:"12px 14px"}}>
              <div style={{fontSize:9,color:"#6b8299",marginBottom:4}}>{m.label}</div>
              <div style={{fontSize:17,fontWeight:800,color:m.color,lineHeight:1}}>{m.val}</div>
              <div style={{fontSize:9,color:"#6b8299",marginTop:3}}>{m.note}</div>
            </div>
          ))}
        </div>
        <div className="ax-card" style={{padding:"14px 16px"}}>
          <div style={{fontSize:12,fontWeight:600,marginBottom:8}}>Reading the numbers</div>
          <div style={{display:"flex",flexDirection:"column",gap:6,fontSize:11,color:"#3d617e",lineHeight:1.6}}>
            <div><strong>VaR 95% {pct(stats.pVaR95)}</strong> — in a normal bad month (1-in-20), expect up to this loss.</div>
            <div><strong>CVaR 95% {pct(stats.cvar95)}</strong> — in the worst 5% of months, average loss is this. Tail exposure.</div>
            <div><strong>Sharpe {stats.sharpe.toFixed(2)}</strong> — {stats.sharpe>1?"Excellent (>1.0)":stats.sharpe>0.5?"Acceptable (0.5–1.0)":"Below par (<0.5)"}.</div>
            <div><strong>Sortino {stats.sortino.toFixed(2)}</strong> — like Sharpe but only penalises downside volatility. Higher is better.</div>
          </div>
        </div>
      </>}

      {/* ── Monte Carlo ── */}
      {subTab==="mc"&&<>
        <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
          <span style={{fontSize:11,fontWeight:600,color:"#6b8299"}}>Horizon:</span>
          {[5,10,15,20,30].map(y=>(
            <button key={y} className="ax-btn" onClick={()=>setMcYears(y)} style={{
              padding:"4px 10px",fontSize:11,
              background:mcYears===y?"#7f77dd":"transparent",color:mcYears===y?"#fff":"#6b8299",
              borderColor:mcYears===y?"#7f77dd":"#dde4ee",fontWeight:mcYears===y?700:400}}>{y}Y</button>
          ))}
        </div>
        <div className="ax-card" style={{padding:"14px 6px 8px"}}>
          <div style={{paddingLeft:10,fontSize:12,fontWeight:600,marginBottom:2,display:"flex",alignItems:"center",gap:6}}>
            <Sigma size={13} color="#7f77dd"/> 200-Path Monte Carlo · {mcYears}-Year Wealth Distribution
          </div>
          <div style={{paddingLeft:10,fontSize:9,color:"#6b8299",marginBottom:6}}>
            Bands: 10th · 25th · 50th (median) · 75th · 90th percentile
          </div>
          <ResponsiveContainer width="100%" height={270}>
            <AreaChart data={mcData} margin={{top:4,right:20,left:10,bottom:4}}>
              <CartesianGrid strokeDasharray="3 3" stroke="#dde4ee"/>
              <XAxis dataKey="year" tick={{fontSize:9,fill:"#6b8299"}} tickFormatter={v=>`Yr ${v}`}/>
              <YAxis tick={{fontSize:9,fill:"#6b8299"}} width={55}
                tickFormatter={v=>v>=1e7?`${(v/1e7).toFixed(0)}Cr`:v>=1e5?`${(v/1e5).toFixed(0)}L`:`${(v/1000).toFixed(0)}K`}/>
              <Tooltip formatter={(v,n)=>[fmt(v),{p90:"Best 10%",p75:"Top 25%",p50:"Median",p25:"Bottom 25%",p10:"Worst 10%"}[n]||n]}
                contentStyle={{fontSize:10,background:"#fff",border:"1px solid #dde4ee",borderRadius:6}}/>
              <Area type="monotone" dataKey="p90" stroke="#7f77dd" fill="rgba(127,119,221,.05)" strokeWidth={1} dot={false}/>
              <Area type="monotone" dataKey="p75" stroke="#7f77dd" fill="rgba(127,119,221,.08)" strokeWidth={1} dot={false}/>
              <Area type="monotone" dataKey="p50" stroke="#7f77dd" fill="rgba(127,119,221,.14)" strokeWidth={2.5} dot={false}/>
              <Area type="monotone" dataKey="p25" stroke="#c9a84c" fill="rgba(201,168,76,.06)" strokeWidth={1} dot={false}/>
              <Area type="monotone" dataKey="p10" stroke="#ff5252" fill="rgba(255,82,82,.04)" strokeWidth={1} dot={false}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="ax-card" style={{padding:0,overflow:"hidden"}}>
          <div style={{fontWeight:600,fontSize:12,padding:"12px 16px",borderBottom:"1px solid #dde4ee"}}>Projected Corpus at Year {mcYears}</div>
          <div style={{display:"flex",flexWrap:"wrap"}}>
            {[{key:"p10",label:"Worst 10%",note:"Bear case",c:"#ff5252"},{key:"p25",label:"Bottom Quartile",note:"Pessimistic",c:"#ff8c42"},
              {key:"p50",label:"Median",note:"Most likely",c:"#7f77dd"},{key:"p75",label:"Top Quartile",note:"Optimistic",c:"#c9a84c"},
              {key:"p90",label:"Best 10%",note:"Bull case",c:"#00d4a4"}].map(b=>(
              <div key={b.key} style={{flex:"1 1 120px",padding:"12px 14px",borderRight:"1px solid #dde4ee",borderBottom:"1px solid #dde4ee"}}>
                <div style={{fontSize:9,color:"#6b8299",fontWeight:600,textTransform:"uppercase",letterSpacing:".04em"}}>{b.note}</div>
                <div style={{fontSize:9,color:"#6b8299",marginBottom:4}}>{b.label}</div>
                <div style={{fontSize:16,fontWeight:700,color:b.c}}>{mcData[mcData.length-1]?.[b.key]?fmt(mcData[mcData.length-1][b.key]):"—"}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{fontSize:9,color:"#6b8299",padding:"5px 10px",background:"#f7f9fc",borderRadius:6,border:"1px solid #dde4ee"}}>
          GBM simulation: μ={stats.annMean.toFixed(1)}%/yr, σ={stats.annVol.toFixed(1)}%/yr. Not a guarantee of future returns.
        </div>
      </>}

      {/* ── Stress Tests ── */}
      {subTab==="stress"&&<>
        <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
          {STRESS_SCENARIOS.map(sc=>(
            <button key={sc.id} onClick={()=>setScenario(sc.id)} className="ax-btn" style={{
              fontSize:10,padding:"4px 10px",
              background:scenario===sc.id?"rgba(255,82,82,.1)":"transparent",
              color:scenario===sc.id?"#ff5252":"#6b8299",
              borderColor:scenario===sc.id?"#ff5252":"#dde4ee",fontWeight:scenario===sc.id?700:400}}>{sc.label}</button>
          ))}
        </div>
        {stress?(
          <>
            <div style={{padding:"12px 16px",borderRadius:10,background:"rgba(255,82,82,.04)",border:"1.5px solid rgba(255,82,82,.2)"}}>
              <div style={{fontSize:13,fontWeight:700,color:"#ff5252",marginBottom:4}}>{stress.label}</div>
              <div style={{fontSize:11,color:"#3d617e",marginBottom:12}}>{stress.desc}</div>
              <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
                {[
                  {l:"Current Portfolio",val:fmt(stress.curInv),c:"#1a2433",bg:"#fff"},
                  {l:`Crash Loss (${stress.drop}%)`,val:fmt(stress.loss),c:"#ff5252",bg:"rgba(255,82,82,.06)"},
                  {l:"Post-Crash Value",val:fmt(stress.postCrash),c:"#00d4a4",bg:"rgba(0,212,164,.07)"},
                  {l:"Typical Recovery",val:`${stress.recovery} months`,c:"#c9a84c",bg:"#f8fafc"},
                ].map(s=>(
                  <div key={s.l} style={{flex:"1 1 110px",padding:"10px 12px",borderRadius:8,background:s.bg,border:"1px solid #dde4ee"}}>
                    <div style={{fontSize:9,color:"#6b8299"}}>{s.l}</div>
                    <div style={{fontSize:14,fontWeight:700,color:s.c}}>{s.val}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="ax-card" style={{padding:"14px 16px"}}>
              <div style={{fontSize:12,fontWeight:600,marginBottom:8}}>Playbook for this scenario</div>
              <div style={{display:"flex",flexDirection:"column",gap:6,fontSize:11,color:"#3d617e",lineHeight:1.6}}>
                <div>✅ <strong>Don't panic-sell</strong> — realising losses locks them in permanently.</div>
                <div>✅ <strong>Continue SIPs</strong> — lower prices = more units. Rupee cost averaging works best in crashes.</div>
                <div>✅ <strong>Emergency fund</strong> — keep 6 months of expenses liquid so you never need to sell equities.</div>
                {stress.drop<-30&&<div>📈 <strong>Rebalance opportunity</strong> — severe crashes often create multi-year buying windows.</div>}
              </div>
            </div>
          </>
        ):(
          <div style={{textAlign:"center",padding:36,color:"#6b8299",fontSize:12}}>Add investment data to run stress tests on your portfolio.</div>
        )}
      </>}

      {/* ── Fragility Score ── */}
      {subTab==="fragility"&&<>
        {fragility?(
          <>
            <div style={{padding:"16px 20px",borderRadius:12,border:`2px solid ${fragility.band.color}40`,background:`${fragility.band.color}08`,display:"flex",gap:18,alignItems:"center",flexWrap:"wrap"}}>
              <div style={{textAlign:"center",flexShrink:0}}>
                <div style={{fontSize:48,fontWeight:800,color:fragility.band.color,lineHeight:1}}>{fragility.score}</div>
                <div style={{fontSize:10,color:fragility.band.color,fontWeight:700}}>/ 100</div>
                <div style={{fontSize:11,fontWeight:700,color:fragility.band.color,marginTop:4}}>{fragility.band.label}</div>
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:700,color:"#1a2433",marginBottom:4}}>Portfolio Fragility Index</div>
                <div style={{fontSize:11,color:"#3d617e",lineHeight:1.5,marginBottom:6}}>{fragility.band.desc}</div>
                <div style={{fontSize:9,color:"#6b8299"}}>Lower score = more robust. Scale: 0 (fortress) → 100 (fragile).</div>
              </div>
            </div>
            <div className="ax-card" style={{padding:"14px 16px"}}>
              <div style={{fontSize:12,fontWeight:600,marginBottom:10}}>Risk Factor Breakdown</div>
              {fragility.factors.map(f=>(
                <div key={f.label} style={{marginBottom:12}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:4,fontSize:11}}>
                    <span style={{fontWeight:600,color:"#1a2433"}}>{f.label}</span>
                    <span style={{fontWeight:700,color:f.color}}>{f.score}/{f.max} pts</span>
                  </div>
                  <div style={{height:6,borderRadius:3,background:"#dde4ee",overflow:"hidden",marginBottom:3}}>
                    <div style={{width:`${(f.score/f.max)*100}%`,height:"100%",background:f.color,borderRadius:3}}/>
                  </div>
                  <div style={{fontSize:9,color:"#6b8299"}}>{f.desc}</div>
                </div>
              ))}
            </div>
            <div className="ax-card" style={{padding:"14px 16px"}}>
              <div style={{fontSize:12,fontWeight:600,marginBottom:6}}>Prescriptions</div>
              <div style={{display:"flex",flexDirection:"column",gap:5,fontSize:11,color:"#3d617e",lineHeight:1.6}}>
                {fragility.score>=70&&<div>🔴 <strong>Critical fragility</strong> — reduce debt and build emergency reserves before growing investments.</div>}
                {fragility.factors[0].score>20&&<div>📉 Reduce volatility by adding large-cap or debt allocation.</div>}
                {fragility.factors[2].score>15&&<div>💳 Debt-to-investment ratio too high — aggressively pay down loans.</div>}
                {fragility.factors[3].score>10&&<div>💰 Target 20%+ savings rate to build resilience buffers.</div>}
                {fragility.score<=30&&<div>✅ <strong>Robust portfolio</strong> — continue current strategy, review allocations annually.</div>}
              </div>
            </div>
          </>
        ):(
          <div style={{textAlign:"center",padding:36,color:"#6b8299",fontSize:12}}>Add monthly data to calculate your fragility score.</div>
        )}
      </>}
    </div>
  );
}

class MFErrorBoundary extends Component {
  constructor(p){super(p);this.state={err:null};}
  static getDerivedStateFromError(e){return{err:e};}
  render(){
    if(this.state.err) return(
      <div style={{padding:24,color:"#ff5252",fontSize:12,fontFamily:"monospace"}}>
        <strong>MF Compare error:</strong>
        <pre style={{marginTop:8,fontSize:10,whiteSpace:"pre-wrap",background:"#fff5f5",padding:12,borderRadius:6,border:"1px solid #ffcccc"}}>{this.state.err.message+"\n\n"+this.state.err.stack}</pre>
      </div>
    );
    return this.props.children;
  }
}

// ── MF Compare Tab ────────────────────────────────────────────────────────────
function MFCompareTab({ entries=[], mode="intermediate" }) {
  const [subTab, setSubTab] = useState("performance");
  const [period, setPeriod] = useState("5y");
  const [catFilter, setCat] = useState("all");
  const [selectedIds, setSel] = useState(new Set(["fc_ppfas","mc_hdfc","lc_axis","sc_sbi"]));
  const [expandedMgr, setExpandedMgr] = useState(null);
  const [evCatFilter, setEvCatFilter] = useState("All");

  const toggle = id => setSel(prev=>{
    const s=new Set(prev);
    if(s.has(id)){if(s.size>1)s.delete(id);}else{if(s.size<6)s.add(id);}
    return s;
  });

  const periodMonths = {"1y":12,"3y":36,"5y":60,"10y":120};
  const cats = ["all",...new Set(MF_FUNDS.map(f=>f.category))];
  const visibleFunds = MF_FUNDS.filter(f=>catFilter==="all"||f.category===catFilter);
  // (remaining component body replaced below)
  const activeFunds  = MF_FUNDS.filter(f=>selectedIds.has(f.id));

  const chartData = useMemo(()=>{
    if(!activeFunds.length) return [];
    const months=periodMonths[period];
    const refData=MF_NAV[activeFunds[0].id];
    const total=refData.length, from=Math.max(0,total-months), sliceLen=total-from;
    return refData.slice(from).map((item,idx)=>{
      const row={month:item.month};
      activeFunds.forEach(f=>{
        const fd=MF_NAV[f.id], offset=fd.length-sliceLen;
        const baseNav=fd[Math.max(0,offset)]?.nav||1;
        const pt=fd[offset+idx];
        if(pt) row[f.id]=Math.round(pt.nav/baseNav*10000)/100;
      });
      return row;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[selectedIds,period]);

  // Full 10Y chart data for events tab (all 8 funds, raw nav, normalized per fund)
  const fullChartData = useMemo(()=>{
    const refData=MF_NAV[MF_FUNDS[0].id];
    return refData.map((item,idx)=>{
      const row={month:item.month};
      activeFunds.forEach(f=>{
        const fd=MF_NAV[f.id], base=fd[0]?.nav||1;
        if(fd[idx]) row[f.id]=Math.round(fd[idx].nav/base*10000)/100;
      });
      return row;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[selectedIds]);

  const chartMonths = chartData.map(d=>d.month);
  const visibleEvents = MF_EVENTS.filter(ev=>chartMonths.some(m=>m>=ev.start&&m<=ev.end)).map(ev=>({
    ...ev,
    x1:chartMonths.find(m=>m>=ev.start)||ev.start,
    x2:[...chartMonths].reverse().find(m=>m<=ev.end)||ev.end,
  }));
  const fullChartMonths = fullChartData.map(d=>d.month);
  const fullVisibleEvents = MF_EVENTS
    .filter(ev => evCatFilter==="All" || ev.cat===evCatFilter)
    .map(ev=>({
      ...ev,
      x1:fullChartMonths.find(m=>m>=ev.start)||ev.start,
      x2:[...fullChartMonths].reverse().find(m=>m<=ev.end)||ev.end,
    }));

  const cagrTable = activeFunds.map(f=>({
    fund:f,
    r1:  mfCAGR(MF_NAV[f.id],1),
    r3:  mfCAGR(MF_NAV[f.id],3),
    r5:  mfCAGR(MF_NAV[f.id],5),
    r10: mfCAGR(MF_NAV[f.id],10),
  })).sort((a,b)=>(parseFloat(b.r10)||0)-(parseFloat(a.r10)||0));

  // My MF data from user's monthly entries
  const myMFPoints = useMemo(()=>{
    if(!entries?.length) return [];
    return [...entries].filter(e=>(e.investments?.mutualFunds||0)>0)
      .sort((a,b)=>a.id.localeCompare(b.id))
      .map(e=>({month:e.id,rawValue:e.investments.mutualFunds}));
  },[entries]);

  const myCompareData = useMemo(()=>{
    if(!myMFPoints.length) return [];
    const base=myMFPoints[0].rawValue, startMonth=myMFPoints[0].month;
    return myMFPoints.map(pt=>{
      const row={month:pt.month,myMF:Math.round(pt.rawValue/base*10000)/100};
      activeFunds.forEach(f=>{
        const navs=MF_NAV[f.id],si=navs.findIndex(d=>d.month>=startMonth);
        if(si<0)return; const bNav=navs[si].nav;
        const ci=navs.findIndex(d=>d.month>=pt.month);
        if(ci>=0) row[f.id]=Math.round(navs[ci].nav/bNav*10000)/100;
      });
      return row;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[myMFPoints,selectedIds]);

  const managerMap={};
  MF_FUNDS.forEach(f=>{
    if(!managerMap[f.manager]) managerMap[f.manager]={manager:f.manager,house:f.house,funds:[],totalAUM:0};
    const r1=mfCAGR(MF_NAV[f.id],1),r3=mfCAGR(MF_NAV[f.id],3),r5=mfCAGR(MF_NAV[f.id],5),r10=mfCAGR(MF_NAV[f.id],10);
    managerMap[f.manager].funds.push({...f,r1,r3,r5,r10});
    managerMap[f.manager].totalAUM += parseInt(f.aum.replace(/,/g,""))||0;
  });
  const managers=Object.values(managerMap).map(m=>({
    ...m,
    avgR10:m.funds.reduce((a,f)=>a+(f.r10?parseFloat(f.r10):0),0)/m.funds.length,
    bestFund:[...m.funds].sort((a,b)=>(parseFloat(b.r10)||0)-(parseFloat(a.r10)||0))[0],
  })).sort((a,b)=>b.avgR10-a.avgR10);

  // Filter managers dynamically: by selected category OR by selected fund IDs
  const filteredManagers = catFilter !== "all"
    ? managers.filter(m => m.funds.some(f => f.category === catFilter))
    : managers.filter(m => m.funds.some(f => selectedIds.has(f.id)));
  const mgrContext = catFilter !== "all" ? `${catFilter} funds` : "selected funds";

  const eventDrawdowns = MF_EVENTS.map(ev=>{
    const analysis=activeFunds.map(f=>{
      const navs=MF_NAV[f.id];
      const evNavs=navs.filter(d=>d.month>=ev.start&&d.month<=ev.end);
      if(!evNavs.length) return {fund:f,drawdown:null,recovered:false,recoveryMonth:null};
      const before=navs.filter(d=>d.month<ev.start);
      const peak=before.length?Math.max(...before.map(d=>d.nav)):evNavs[0].nav;
      const trough=Math.min(...evNavs.map(d=>d.nav));
      const drawdown=((trough-peak)/peak*100).toFixed(1);
      const after=navs.filter(d=>d.month>ev.end);
      const recoveryPt=after.find(d=>d.nav>=peak);
      return {fund:f,drawdown,recovered:!!recoveryPt,recoveryMonth:recoveryPt?.month};
    });
    return {event:ev,analysis};
  });

  const fmtTick = m=>{const[y,mo]=m.split("-");return mo==="01"?y:mo==="07"?`Jul '${y.slice(2)}`:""};
  const rCol = v=>{if(!v&&v!==0)return"#6b8299";const n=parseFloat(v);return n>=16?"#00d4a4":n>=12?"#c9a84c":n>=8?"#ff8c42":"#ff5252";};
  const fmtAUM = n=>{const v=n*10000000;return v>=1e7?`₹${(v/1e7).toFixed(0)}Cr`:v>=1e5?`₹${(v/1e5).toFixed(0)}L`:`₹${Math.round(v/1000)}K`;};
  const TH = ({children,right,center})=><th style={{textAlign:center?"center":right?"right":"left",padding:"8px 11px",color:"#6b8299",fontWeight:600,fontSize:10,whiteSpace:"nowrap",background:"#f7f9fc"}}>{children}</th>;
  const TD = ({children,right,center,style={}})=><td style={{padding:"8px 11px",textAlign:center?"center":right?"right":"left",...style}}>{children}</td>;

  return (
    <div style={{padding:18,display:"flex",flexDirection:"column",gap:16}}>

      {/* Data source */}
      <div style={{fontSize:9,color:"#6b8299",padding:"5px 12px",background:"#f7f9fc",borderRadius:6,border:"1px solid #dde4ee",lineHeight:1.6}}>
        <strong style={{color:"#3d617e"}}>Data Source:</strong> Illustrative NAV data modelled on fund parameters published by{" "}
        <strong>AMFI India</strong> (amfiindia.com), <strong>Value Research Online</strong>, and <strong>Morningstar India</strong>.
        AUM, ER &amp; manager details as of Q1 2025. For live NAV: <strong>mfapi.in</strong> or <strong>amfiindia.com</strong>
      </div>

      {/* Sub-tabs */}
      <div style={{display:"flex",gap:0,borderBottom:"1px solid #dde4ee"}}>
        {[
          {id:"performance",label:"Performance"},
          {id:"manager",label:"By Fund Manager"},
          {id:"events",label:"Market Events"},
          {id:"mymf",label:"My MF vs Market"},
        ].map(t=>(
          <button key={t.id} className={`ax-tab${subTab===t.id?" active":""}`} onClick={()=>setSubTab(t.id)} style={{fontSize:11}}>{t.label}</button>
        ))}
      </div>

      {/* Fund selector */}
      <div className="ax-card" style={{padding:"12px 14px"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:6,marginBottom:8}}>
          <span style={{fontSize:11,fontWeight:600,color:"#6b8299"}}>
            Select Funds <span style={{fontWeight:400,color:"#aab8c8"}}>(max 6 · {selectedIds.size} selected)</span>
          </span>
          <div style={{display:"flex",gap:3,flexWrap:"wrap"}}>
            {cats.map(c=>(
              <button key={c} onClick={()=>setCat(c)} className="ax-btn" style={{
                fontSize:9,padding:"3px 8px",
                background:catFilter===c?"#1a2433":"transparent",
                color:catFilter===c?"#c9a84c":"#6b8299",
                borderColor:catFilter===c?"#c9a84c":"#dde4ee",fontWeight:catFilter===c?700:400,
              }}>{c==="all"?`All (${MF_FUNDS.length})`:c}</button>
            ))}
          </div>
        </div>
        <div style={{display:"flex",gap:5,flexWrap:"wrap",maxHeight:100,overflowY:"auto"}}>
          {visibleFunds.map(f=>{
            const sel=selectedIds.has(f.id);
            return (
              <button key={f.id} onClick={()=>toggle(f.id)} style={{
                display:"flex",alignItems:"center",gap:4,padding:"4px 9px",borderRadius:16,
                border:`1.5px solid ${sel?f.color:"#dde4ee"}`,background:sel?`${f.color}15`:"transparent",
                cursor:"pointer",fontSize:10,color:sel?f.color:"#6b8299",fontWeight:sel?600:400,
                flexShrink:0,transition:"all .15s",userSelect:"none",
              }}>
                <span style={{width:7,height:7,borderRadius:"50%",background:sel?f.color:"#dde4ee"}}/>
                {f.shortName}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── PERFORMANCE TAB ── */}
      {subTab==="performance" && <>
        <div style={{display:"flex",gap:6,alignItems:"center"}}>
          <span style={{fontSize:11,color:"#6b8299",marginRight:2}}>Period:</span>
          {["1y","3y","5y","10y"].map(p=>(
            <button key={p} onClick={()=>setPeriod(p)} className="ax-btn" style={{
              padding:"4px 10px",fontSize:11,
              background:period===p?"#c9a84c":"transparent",
              color:period===p?"#1a1a1a":"#6b8299",
              borderColor:period===p?"#c9a84c":"#dde4ee",fontWeight:period===p?700:400,
            }}>{p.toUpperCase()}</button>
          ))}
        </div>

        <div className="ax-card" style={{padding:"14px 6px 8px"}}>
          <div style={{fontSize:12,fontWeight:600,marginBottom:4,paddingLeft:10,display:"flex",alignItems:"center",gap:6}}>
            <TrendingUp size={13} color="#c9a84c"/> Growth of ₹100 Invested · {period.toUpperCase()}
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={chartData} margin={{top:4,right:20,left:-10,bottom:4}}>
              <CartesianGrid strokeDasharray="3 3" stroke="#dde4ee"/>
              <XAxis dataKey="month" tick={{fontSize:9,fill:"#6b8299"}} tickFormatter={fmtTick} interval="preserveStartEnd"/>
              <YAxis tick={{fontSize:9,fill:"#6b8299"}} domain={["auto","auto"]} tickFormatter={v=>`${v}`}/>
              <Tooltip formatter={(v,name)=>[`₹${v}`,MF_FUNDS.find(f=>f.id===name)?.shortName||name]}
                labelFormatter={l=>fmtML(l)} contentStyle={{fontSize:11,background:"#fff",border:"1px solid #dde4ee",borderRadius:6}}/>
              {/* Turbulent shading on performance chart too */}
              {visibleEvents.map(ev=>(
                <ReferenceArea key={ev.id} x1={ev.x1} x2={ev.x2} fill="rgba(255,82,82,.08)" stroke="rgba(255,82,82,.3)" strokeWidth={0}/>
              ))}
              {activeFunds.map(f=>(
                <Line key={f.id} type="monotone" dataKey={f.id} stroke={f.color} dot={false} strokeWidth={2} name={f.id}/>
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* ── BEGINNER: Fund Report Cards ── */}
        {mode==="beginner" && (
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {activeFunds.map(f=>{
              const m=cagrTable.find(r=>r.fund.id===f.id);
              const cagr=m?.r10?parseFloat(m.r10):f.baseRet;
              const alpha=cagr-12;
              const grade=fundGrade(cagr,alpha);
              const risk=riskBand(f.vol, bkMaxDD(MF_NAV[f.id]));
              const finalVal=Math.round(MF_NAV[f.id][MF_NAV[f.id].length-1].nav);
              return(
                <div key={f.id} style={{padding:"14px 16px",borderRadius:10,border:`2px solid ${f.color}25`,background:"#fff",boxShadow:"0 1px 4px rgba(0,0,0,.04)"}}>
                  <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:10,marginBottom:10}}>
                    <div style={{flex:1}}>
                      <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:3}}>
                        <span style={{width:10,height:10,borderRadius:"50%",background:f.color,flexShrink:0}}/>
                        <span style={{fontWeight:700,fontSize:13,color:"#1a2433"}}>{f.name}</span>
                      </div>
                      <div style={{fontSize:10,color:"#6b8299",marginBottom:8}}>{f.category} · {f.house}</div>
                      <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                        <span style={{padding:"3px 9px",borderRadius:16,background:`${risk.color}12`,fontSize:10,fontWeight:600,color:risk.color}}>{risk.emoji} {risk.label}</span>
                        <span style={{padding:"3px 9px",borderRadius:16,fontSize:10,fontWeight:600,
                          background:alpha>0?"rgba(0,212,164,.1)":"rgba(255,82,82,.08)",
                          color:alpha>0?"#00d4a4":"#ff5252"}}>{alpha>0?`✅ Beats Nifty 50 (+${alpha.toFixed(1)}%/yr)`:"❌ Behind Nifty 50"}</span>
                      </div>
                    </div>
                    <div style={{textAlign:"center",padding:"8px 14px",borderRadius:10,background:`${grade.color}12`,border:`1.5px solid ${grade.color}35`,flexShrink:0}}>
                      <div style={{fontSize:24,fontWeight:800,color:grade.color,lineHeight:1}}>{grade.grade}</div>
                      <div style={{fontSize:9,color:grade.color,fontWeight:600}}>{grade.label}</div>
                    </div>
                  </div>
                  <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                    <div style={{flex:"1 1 100px",padding:"8px 10px",background:"#f7f9fc",borderRadius:8,textAlign:"center"}}>
                      <div style={{fontSize:8,color:"#6b8299"}}>₹1 lakh grew to</div>
                      <div style={{fontSize:16,fontWeight:700,color:"#1a2433"}}>₹{finalVal.toLocaleString("en-IN")}</div>
                      <div style={{fontSize:8,color:"#6b8299"}}>in 10 years</div>
                    </div>
                    <div style={{flex:"1 1 100px",padding:"8px 10px",background:"#f7f9fc",borderRadius:8,textAlign:"center"}}>
                      <div style={{fontSize:8,color:"#6b8299"}}>Annual growth</div>
                      <div style={{fontSize:16,fontWeight:700,color:"#00d4a4"}}>{m?.r10||cagr.toFixed(1)}%</div>
                      <div style={{fontSize:8,color:"#6b8299"}}>CAGR (10 years)</div>
                    </div>
                    <div style={{flex:"2 1 150px",padding:"8px 10px",background:"#f7f9fc",borderRadius:8}}>
                      <div style={{fontSize:8,color:"#6b8299",marginBottom:3}}>Best suited for</div>
                      <div style={{fontSize:10,fontWeight:600,color:"#3d617e"}}>{investorType(f.category)}</div>
                      <div style={{fontSize:9,color:"#6b8299",marginTop:2}}>{risk.tip}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── INVESTOR / PRO: Metrics table ── */}
        {mode!=="beginner" && <div className="ax-card" style={{padding:0,overflow:"hidden"}}>
          <div style={{fontWeight:600,fontSize:12,padding:"12px 16px",borderBottom:"1px solid #dde4ee",display:"flex",alignItems:"center",gap:6}}>
            <Activity size={13}/> CAGR Returns Comparison
          </div>
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
              <thead>
                <tr style={{background:"#f7f9fc"}}>
                  <TH>Fund</TH><TH>Manager</TH><TH>Category</TH>
                  <TH right>AUM (Cr)</TH><TH right>ER%</TH><TH right>Risk</TH>
                  <TH right>1Y %</TH><TH right>3Y %</TH><TH right>5Y %</TH><TH right>10Y %</TH>
                </tr>
              </thead>
              <tbody>
                {cagrTable.map((row,i)=>(
                  <tr key={row.fund.id} style={{borderTop:"1px solid #dde4ee",background:i%2===0?"#fff":"#fafbfc"}}>
                    <TD><div style={{display:"flex",alignItems:"center",gap:6}}>
                      <span style={{width:8,height:8,borderRadius:"50%",background:row.fund.color,flexShrink:0}}/>
                      <span style={{fontWeight:600,color:"#1a2433"}}>{row.fund.shortName}</span>
                    </div></TD>
                    <TD style={{color:"#3d617e",whiteSpace:"nowrap"}}>{row.fund.manager}</TD>
                    <TD><span style={{fontSize:9,padding:"2px 6px",borderRadius:10,background:"#f0f4fa",color:"#6b8299",whiteSpace:"nowrap"}}>{row.fund.category}</span></TD>
                    <TD right style={{color:"#3d617e"}}>₹{row.fund.aum}</TD>
                    <TD right style={{color:"#ff8c42"}}>{row.fund.er}%</TD>
                    <TD right><span style={{fontSize:9,padding:"2px 6px",borderRadius:10,
                      background:row.fund.risk==="Very High"?"rgba(255,82,82,.1)":row.fund.risk==="High"?"rgba(255,140,66,.1)":"rgba(74,158,255,.1)",
                      color:row.fund.risk==="Very High"?"#ff5252":row.fund.risk==="High"?"#ff8c42":"#4a9eff"
                    }}>{row.fund.risk}</span></TD>
                    {[row.r1,row.r3,row.r5,row.r10].map((r,j)=>(
                      <TD key={j} right style={{fontWeight:600,color:rCol(r)}}>{r?`${r}%`:"—"}</TD>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>}
      </>}

      {/* ── MANAGER TAB ── */}
      {subTab==="manager" && (
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <div style={{fontSize:10,color:"#6b8299",paddingBottom:4,display:"flex",alignItems:"center",gap:6}}>
            <span style={{fontWeight:700,color:"#3d617e"}}>{filteredManagers.length} fund manager{filteredManagers.length!==1?"s":""}</span>
            <span>managing {mgrContext} · click a card to expand fund details</span>
          </div>
          {filteredManagers.map((m)=>{
          const isExp=expandedMgr===m.manager;
          const fundsSorted=[...m.funds].sort((a,b)=>(parseFloat(b.r10)||0)-(parseFloat(a.r10)||0));
          const bar=Math.min(m.avgR10/22*100,100);
          const initials=m.manager.split(" ").map(w=>w[0]).slice(0,2).join("");
          return (
            <div key={m.manager} className="ax-card" style={{padding:0,overflow:"hidden"}}>
              <div onClick={()=>setExpandedMgr(isExp?null:m.manager)}
                style={{padding:"13px 16px",cursor:"pointer",display:"flex",alignItems:"center",gap:12,
                        background:isExp?"#fafbfc":"#fff",userSelect:"none"}}>
                <div style={{width:34,height:34,borderRadius:8,background:`${m.bestFund?.color||"#4a9eff"}18`,
                  display:"flex",alignItems:"center",justifyContent:"center",
                  border:`1.5px solid ${m.bestFund?.color||"#4a9eff"}40`,flexShrink:0}}>
                  <span style={{fontSize:12,fontWeight:700,color:m.bestFund?.color||"#4a9eff"}}>{initials}</span>
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:3,flexWrap:"wrap"}}>
                    <span style={{fontWeight:700,fontSize:12,color:"#1a2433"}}>{m.manager}</span>
                    <span style={{fontSize:9,color:"#6b8299",background:"#f0f4fa",padding:"2px 6px",borderRadius:6}}>{m.house}</span>
                    <span style={{fontSize:9,fontWeight:600,color:"#00d4a4",background:"rgba(0,212,164,.08)",padding:"2px 6px",borderRadius:6}}>
                      {m.funds.length} fund{m.funds.length>1?"s":""}
                    </span>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:12,fontSize:10,color:"#6b8299",flexWrap:"wrap"}}>
                    <span>AUM: <strong style={{color:"#3d617e"}}>{fmtAUM(m.totalAUM)}</strong></span>
                    <span>Avg 10Y: <strong style={{color:rCol(m.avgR10.toFixed(1))}}>{m.avgR10.toFixed(1)}%</strong></span>
                    <span>Best: <strong style={{color:m.bestFund?.color}}>{m.bestFund?.shortName} ({m.bestFund?.r10}%)</strong></span>
                  </div>
                  <div style={{marginTop:5,width:"100%",height:3,background:"#dde4ee",borderRadius:2}}>
                    <div style={{width:`${bar}%`,height:"100%",background:rCol(m.avgR10.toFixed(1)),borderRadius:2}}/>
                  </div>
                </div>
                <div style={{flexShrink:0,color:"#aab8c8"}}>{isExp?<ChevronDown size={15}/>:<ChevronRight size={15}/>}</div>
              </div>

              {isExp&&(
                <div style={{borderTop:"1px solid #dde4ee"}}>
                  <div style={{overflowX:"auto"}}>
                    <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
                      <thead><tr><TH>Fund</TH><TH>Category</TH><TH right>AUM</TH><TH right>ER%</TH><TH right>Risk</TH><TH right>1Y%</TH><TH right>3Y%</TH><TH right>5Y%</TH><TH right>10Y%</TH><TH center>Rank</TH></tr></thead>
                      <tbody>
                        {fundsSorted.map((f,fi)=>(
                          <tr key={f.id} style={{borderTop:"1px solid #dde4ee",background:fi%2===0?"#fff":"#fafbfc"}}>
                            <TD><div style={{display:"flex",alignItems:"center",gap:5}}>
                              <span style={{width:7,height:7,borderRadius:"50%",background:f.color,flexShrink:0}}/>
                              <span style={{fontWeight:600,color:"#1a2433",whiteSpace:"nowrap"}}>{f.shortName}</span>
                            </div></TD>
                            <TD><span style={{fontSize:9,padding:"2px 5px",borderRadius:8,background:"#f0f4fa",color:"#6b8299",whiteSpace:"nowrap"}}>{f.category}</span></TD>
                            <TD right style={{fontSize:10,color:"#3d617e",whiteSpace:"nowrap"}}>{fmtAUM(parseInt(f.aum.replace(/,/g,""))||0)}</TD>
                            <TD right style={{fontSize:10,color:"#ff8c42"}}>{f.er}%</TD>
                            <TD right><span style={{fontSize:9,padding:"2px 5px",borderRadius:8,whiteSpace:"nowrap",fontWeight:600,
                              background:f.risk==="Very High"?"rgba(255,82,82,.1)":f.risk==="High"?"rgba(255,140,66,.1)":"rgba(74,158,255,.1)",
                              color:f.risk==="Very High"?"#ff5252":f.risk==="High"?"#ff8c42":"#4a9eff"}}>{f.risk}</span></TD>
                            {[f.r1,f.r3,f.r5,f.r10].map((r,j)=>(
                              <TD key={j} right style={{fontWeight:700,color:rCol(r)}}>{r?`${r}%`:"—"}</TD>
                            ))}
                            <TD center>
                              <span style={{width:20,height:20,borderRadius:"50%",display:"inline-flex",alignItems:"center",justifyContent:"center",
                                background:fi===0?"rgba(201,168,76,.15)":fi===1?"rgba(0,212,164,.1)":"#f0f4fa",
                                color:fi===0?"#c9a84c":fi===1?"#00d4a4":"#6b8299",fontWeight:700,fontSize:10}}>{fi+1}</span>
                            </TD>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div style={{padding:"10px 16px 12px",background:"#fafbfc"}}>
                    <div style={{fontSize:10,fontWeight:600,color:"#6b8299",marginBottom:7}}>10Y CAGR comparison</div>
                    {fundsSorted.map(f=>(
                      <div key={f.id} style={{display:"flex",alignItems:"center",gap:8,marginBottom:5}}>
                        <div style={{width:80,fontSize:9,color:f.color,fontWeight:600,flexShrink:0,whiteSpace:"nowrap"}}>{f.shortName}</div>
                        <div style={{flex:1,height:13,background:"#dde4ee",borderRadius:3,overflow:"hidden"}}>
                          <div style={{width:`${Math.min((f.r10?parseFloat(f.r10):0)/22*100,100)}%`,height:"100%",background:f.color,borderRadius:3}}/>
                        </div>
                        <div style={{width:42,textAlign:"right",fontSize:10,fontWeight:700,color:rCol(f.r10),flexShrink:0}}>{f.r10?`${f.r10}%`:"—"}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
        </div>
      )}

      {/* ── EVENTS TAB ── */}
      {subTab==="events" && <>
        <div className="ax-card" style={{padding:"14px 6px 8px"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4,paddingLeft:10,flexWrap:"wrap",gap:6}}>
            <div style={{fontSize:12,fontWeight:600,display:"flex",alignItems:"center",gap:6}}>
              <AlertTriangle size={13} color="#ff5252"/> 10-Year NAV · Turbulent Periods in Red
            </div>
            <div style={{display:"flex",alignItems:"center",gap:5,paddingRight:10}}>
              <span style={{width:10,height:10,background:"rgba(255,82,82,.25)",border:"1px solid rgba(255,82,82,.5)",borderRadius:2,display:"inline-block"}}/>
              <span style={{fontSize:9,color:"#ff5252",fontWeight:600}}>Turbulent period</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={fullChartData} margin={{top:4,right:20,left:-10,bottom:4}}>
              <CartesianGrid strokeDasharray="3 3" stroke="#dde4ee"/>
              <XAxis dataKey="month" tick={{fontSize:9,fill:"#6b8299"}} tickFormatter={fmtTick} interval="preserveStartEnd"/>
              <YAxis tick={{fontSize:9,fill:"#6b8299"}} domain={["auto","auto"]}/>
              <Tooltip formatter={(v,name)=>[`₹${v}`,MF_FUNDS.find(f=>f.id===name)?.shortName||name]}
                labelFormatter={l=>fmtML(l)} contentStyle={{fontSize:10,background:"#fff",border:"1px solid #dde4ee",borderRadius:6}}/>
              {fullVisibleEvents.map(ev=>(
                <ReferenceArea key={ev.id} x1={ev.x1} x2={ev.x2}
                  fill={ev.fill} stroke={ev.stroke} strokeOpacity={0.4} strokeWidth={0}/>
              ))}
              {activeFunds.map(f=>(
                <Line key={f.id} type="monotone" dataKey={f.id} stroke={f.color} dot={false} strokeWidth={1.8} name={f.id}/>
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Category filter */}
        <div style={{display:"flex",gap:5,flexWrap:"wrap",alignItems:"center"}}>
          <span style={{fontSize:10,color:"#6b8299",fontWeight:600,marginRight:2}}>Category:</span>
          {["All",...Object.keys(MF_EVENT_CATS)].map(cat=>{
            const cfg=MF_EVENT_CATS[cat];
            const active=evCatFilter===cat;
            return(
              <button key={cat} onClick={()=>setEvCatFilter(cat)} className="ax-btn" style={{
                fontSize:10,padding:"3px 9px",
                background:active?(cfg?.bg||"rgba(201,168,76,.1)"):"transparent",
                color:active?(cfg?.color||"#c9a84c"):"#6b8299",
                borderColor:active?(cfg?.color||"#c9a84c"):"#dde4ee",fontWeight:active?700:400,
              }}>{cat}</button>
            );
          })}
        </div>

        {/* Event cards */}
        <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
          {MF_EVENTS.filter(ev=>evCatFilter==="All"||ev.cat===evCatFilter).map(ev=>{
            const cfg=MF_EVENT_CATS[ev.cat]||{color:"#ff5252",bg:"rgba(255,82,82,.06)"};
            return(
              <div key={ev.id} style={{padding:"9px 12px",borderRadius:8,
                border:`1.5px solid ${ev.ongoing?cfg.color:cfg.color+"35"}`,
                background:ev.ongoing?cfg.bg.replace(/[\d.]+\)$/,"0.1)"):cfg.bg,
                fontSize:10,flex:"1 1 170px",minWidth:145,
                boxShadow:ev.ongoing?`0 0 0 2px ${cfg.color}25`:undefined}}>
                <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:3,flexWrap:"wrap"}}>
                  <span style={{fontSize:8,fontWeight:700,padding:"2px 6px",borderRadius:8,
                    background:cfg.color,color:"#fff",textTransform:"uppercase",letterSpacing:".05em"}}>{ev.cat}</span>
                  <span style={{fontWeight:700,color:cfg.color,fontSize:10}}>{ev.label}</span>
                  {ev.ongoing&&(
                    <span style={{display:"inline-flex",alignItems:"center",gap:3,fontSize:8,fontWeight:700,
                      color:"#ff3434",background:"rgba(255,52,52,.12)",padding:"1px 6px",borderRadius:8,border:"1px solid rgba(255,52,52,.3)"}}>
                      <span style={{width:5,height:5,borderRadius:"50%",background:"#ff3434",
                        animation:"mf-pulse 1.4s ease-in-out infinite",display:"inline-block"}}/>
                      LIVE
                    </span>
                  )}
                </div>
                <div style={{fontSize:9,color:"#6b8299",marginBottom:2}}>
                  {ev.start} → {ev.ongoing?"Present":ev.end}
                </div>
                <div style={{fontSize:9,color:"#3d617e",lineHeight:1.5}}>{ev.desc}</div>
              </div>
            );
          })}
        </div>

        <div className="ax-card" style={{padding:0,overflow:"hidden"}}>
          <div style={{fontWeight:600,fontSize:12,padding:"12px 16px",borderBottom:"1px solid #dde4ee",display:"flex",alignItems:"center",gap:6}}>
            <TrendingDown size={13} color="#ff5252"/> Max Drawdown &amp; Recovery
          </div>
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
              <thead>
                <tr><TH>Event</TH>{activeFunds.map(f=><TH center key={f.id}><span style={{color:f.color}}>{f.shortName}</span></TH>)}</tr>
              </thead>
              <tbody>
                {eventDrawdowns.map((ed,i)=>(
                  <tr key={ed.event.id} style={{borderTop:"1px solid #dde4ee",background:i%2===0?"#fff":"#fff9f9"}}>
                    <TD>
                      <div style={{fontWeight:600,color:"#ff5252",fontSize:11}}>{ed.event.label}</div>
                      <div style={{fontSize:9,color:"#6b8299"}}>{ed.event.start} → {ed.event.end}</div>
                    </TD>
                    {ed.analysis.map(a=>(
                      <TD center key={a.fund.id}>
                        {a.drawdown!==null?(
                          <div>
                            <div style={{fontWeight:700,color:"#ff5252",fontSize:12}}>{a.drawdown}%</div>
                            <div style={{fontSize:9,color:a.recovered?"#00d4a4":"#ff8c42",marginTop:2}}>
                              {a.recovered?`↑ ${fmtML(a.recoveryMonth)}`:"Recovering"}
                            </div>
                          </div>
                        ):<span style={{color:"#6b8299"}}>—</span>}
                      </TD>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </>}

      {/* ── MY MF VS MARKET TAB ── */}
      {subTab==="mymf" && <>
        {myMFPoints.length < 2 ? (
          <div className="ax-card" style={{padding:40,textAlign:"center",display:"flex",flexDirection:"column",alignItems:"center",gap:10}}>
            <Wallet size={36} color="#dde4ee"/>
            <div style={{fontSize:13,fontWeight:600,color:"#3d617e"}}>No MF Data Found</div>
            <div style={{fontSize:11,color:"#6b8299",maxWidth:300,lineHeight:1.6}}>
              Add monthly updates with a Mutual Fund value to compare your portfolio against market benchmarks.
            </div>
          </div>
        ) : <>
          <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
            {[
              {label:"Tracking Since", value:fmtML(myMFPoints[0].month), color:"#3d617e"},
              {label:"Latest MF Value", value:fmt(myMFPoints[myMFPoints.length-1].rawValue), color:"#1a2433"},
              {label:"Portfolio CAGR", value:(()=>{
                const months=myMFPoints.length-1;
                if(months<1) return "—";
                return `${((Math.pow(myMFPoints[myMFPoints.length-1].rawValue/myMFPoints[0].rawValue,12/months)-1)*100).toFixed(1)}%`;
              })(), color:rCol((()=>{const m2=myMFPoints.length-1;return m2>0?((Math.pow(myMFPoints[m2].rawValue/myMFPoints[0].rawValue,12/m2)-1)*100).toFixed(1):null;})())},
              {label:"Data Points", value:`${myMFPoints.length} months`, color:"#6b8299"},
            ].map(s=>(
              <div key={s.label} className="ax-card" style={{flex:"1 1 110px",padding:"10px 14px"}}>
                <div style={{fontSize:9,color:"#6b8299",marginBottom:3}}>{s.label}</div>
                <div style={{fontSize:14,fontWeight:700,color:s.color}}>{s.value}</div>
              </div>
            ))}
          </div>

          <div className="ax-card" style={{padding:"14px 6px 8px"}}>
            <div style={{fontSize:12,fontWeight:600,marginBottom:2,paddingLeft:10,display:"flex",alignItems:"center",gap:6}}>
              <TrendingUp size={13} color="#c9a84c"/> Your Portfolio vs Selected Funds (₹100 normalized)
            </div>
            <div style={{fontSize:9,color:"#ff8c42",paddingLeft:10,marginBottom:6}}>
              ⚠ Portfolio includes SIP contributions — comparison shows value growth, not pure NAV appreciation
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={myCompareData} margin={{top:4,right:20,left:-10,bottom:4}}>
                <CartesianGrid strokeDasharray="3 3" stroke="#dde4ee"/>
                <XAxis dataKey="month" tick={{fontSize:9,fill:"#6b8299"}} tickFormatter={fmtTick} interval="preserveStartEnd"/>
                <YAxis tick={{fontSize:9,fill:"#6b8299"}} domain={["auto","auto"]}/>
                <Tooltip
                  formatter={(v,name)=>[`₹${v}`,name==="myMF"?"My Portfolio":MF_FUNDS.find(f=>f.id===name)?.shortName||name]}
                  labelFormatter={l=>fmtML(l)} contentStyle={{fontSize:10,background:"#fff",border:"1px solid #dde4ee",borderRadius:6}}/>
                <Line type="monotone" dataKey="myMF" stroke="#c9a84c" strokeWidth={3} dot={false} strokeDasharray="7 3" name="myMF"/>
                {activeFunds.map(f=>(
                  <Line key={f.id} type="monotone" dataKey={f.id} stroke={f.color} dot={false} strokeWidth={1.5} name={f.id}/>
                ))}
              </LineChart>
            </ResponsiveContainer>
            <div style={{display:"flex",gap:10,flexWrap:"wrap",paddingLeft:10,paddingTop:6}}>
              <div style={{display:"flex",alignItems:"center",gap:5,fontSize:10}}>
                <svg width={20} height={6}><line x1={0} y1={3} x2={20} y2={3} stroke="#c9a84c" strokeWidth={3} strokeDasharray="7 3"/></svg>
                <span style={{color:"#c9a84c",fontWeight:700}}>My Portfolio</span>
              </div>
              {activeFunds.map(f=>(
                <div key={f.id} style={{display:"flex",alignItems:"center",gap:4,fontSize:10}}>
                  <div style={{width:14,height:2,background:f.color,borderRadius:1}}/>
                  <span style={{color:f.color}}>{f.shortName}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="ax-card" style={{padding:0,overflow:"hidden"}}>
            <div style={{fontWeight:600,fontSize:12,padding:"12px 16px",borderBottom:"1px solid #dde4ee"}}>
              Portfolio vs Fund CAGR (from {fmtML(myMFPoints[0].month)})
            </div>
            <div style={{overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
                <thead><tr><TH>Fund / Portfolio</TH><TH right>CAGR %</TH><TH right>₹100 → ?</TH><TH right>vs Your Portfolio</TH></tr></thead>
                <tbody>
                  {(()=>{
                    const myMonths=myMFPoints.length-1;
                    const myCagr=myMonths>0?((Math.pow(myMFPoints[myMFPoints.length-1].rawValue/myMFPoints[0].rawValue,12/myMonths)-1)*100):0;
                    const myFinal=myCompareData.length>0?myCompareData[myCompareData.length-1]?.myMF||100:100;
                    const rows=[
                      {id:"myMF",shortName:"My Portfolio",color:"#c9a84c",isMe:true,cagr:myCagr,final:myFinal},
                      ...activeFunds.map(f=>{
                        const si=MF_NAV[f.id].findIndex(d=>d.month>=myMFPoints[0].month);
                        if(si<0)return{id:f.id,shortName:f.shortName,color:f.color,cagr:0,final:100};
                        const bNav=MF_NAV[f.id][si].nav, lNav=MF_NAV[f.id][MF_NAV[f.id].length-1].nav;
                        const m2=MF_NAV[f.id].length-1-si;
                        return{id:f.id,shortName:f.shortName,color:f.color,cagr:m2>0?((Math.pow(lNav/bNav,12/m2)-1)*100):0,final:Math.round(lNav/bNav*100)};
                      }),
                    ].sort((a,b)=>b.cagr-a.cagr);
                    return rows.map((r,i)=>(
                      <tr key={r.id} style={{borderTop:"1px solid #dde4ee",background:r.isMe?"rgba(201,168,76,.05)":i%2===0?"#fff":"#fafbfc"}}>
                        <TD><div style={{display:"flex",alignItems:"center",gap:6}}>
                          {r.isMe
                            ?<span style={{width:16,height:16,borderRadius:4,background:"rgba(201,168,76,.2)",display:"inline-flex",alignItems:"center",justifyContent:"center"}}><Star size={9} color="#c9a84c"/></span>
                            :<span style={{width:8,height:8,borderRadius:"50%",background:r.color,flexShrink:0}}/>
                          }
                          <span style={{fontWeight:r.isMe?700:600,color:r.isMe?"#c9a84c":"#1a2433"}}>{r.shortName}</span>
                          {r.isMe&&<span style={{fontSize:9,padding:"1px 5px",borderRadius:6,background:"rgba(201,168,76,.15)",color:"#c9a84c"}}>You</span>}
                        </div></TD>
                        <TD right style={{fontWeight:700,color:rCol(r.cagr.toFixed(1)),fontSize:12}}>{r.cagr.toFixed(1)}%</TD>
                        <TD right style={{fontWeight:600,color:"#3d617e"}}>₹{r.final}</TD>
                        <TD right>
                          {r.isMe?<span style={{fontSize:9,color:"#6b8299"}}>baseline</span>
                            :(()=>{const d=r.cagr-myCagr;return<span style={{fontWeight:600,color:d>0?"#ff5252":"#00d4a4",fontSize:11}}>{d>0?"▲":"▼"} {Math.abs(d).toFixed(1)}%</span>})()
                          }
                        </TD>
                      </tr>
                    ));
                  })()}
                </tbody>
              </table>
            </div>
          </div>
        </>}
      </>}
    </div>
  );
}

// ── CSS ───────────────────────────────────────────────────────────────────────
function useStyles() {
  useEffect(() => {
    if (document.getElementById("apex-css")) return;
    const el = document.createElement("style"); el.id="apex-css";
    el.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&display=swap');
      .apex*{box-sizing:border-box;margin:0;padding:0}
      .apex{font-family:'Sora',sans-serif;background:#f0f4f8;color:#111827;min-height:100vh}
      .ax-card{background:#ffffff;border:1px solid #dde4ee;border-radius:12px;padding:18px;box-shadow:0 1px 4px rgba(0,0,0,.06)}
      .ax-btn{background:transparent;border:1px solid #dde4ee;color:#111827;padding:8px 15px;border-radius:8px;cursor:pointer;font-family:'Sora',sans-serif;font-size:12px;font-weight:500;transition:all .15s;display:inline-flex;align-items:center;gap:6px}
      .ax-btn:hover{border-color:#c9a84c;color:#c9a84c}
      .ax-btn:disabled{opacity:.4;cursor:not-allowed}
      .ax-btn.primary{background:#c9a84c;border-color:#c9a84c;color:#1a1a1a;font-weight:700}
      .ax-btn.primary:hover:not(:disabled){background:#d4b862}
      .ax-btn.del{border-color:#ff5252;color:#ff5252;padding:7px 10px}
      .ax-btn.del:hover{background:rgba(255,82,82,.08)}
      .ax-input{background:#f8fafc;border:1px solid #dde4ee;color:#111827;padding:8px 11px;border-radius:8px;font-family:'Sora',sans-serif;font-size:12px;width:100%;transition:border-color .15s}
      .ax-input:focus{outline:none;border-color:#c9a84c}
      .ax-input::placeholder{color:#94a8b8}
      .ax-label{font-size:10px;font-weight:600;color:#6b8299;text-transform:uppercase;letter-spacing:.08em;margin-bottom:5px;display:block}
      .ax-tab{background:transparent;border:none;border-bottom:2px solid transparent;color:#6b8299;padding:10px 13px;cursor:pointer;font-family:'Sora',sans-serif;font-size:12px;font-weight:500;transition:all .15s;display:flex;align-items:center;gap:5px;white-space:nowrap}
      .ax-tab:hover{color:#1a2e4a}
      .ax-tab.active{color:#c9a84c;border-bottom-color:#c9a84c}
      .ax-mono{font-family:'Space Mono',monospace}
      .ax-gold{color:#c9a84c}.ax-green{color:#00d4a4}.ax-red{color:#ff5252}.ax-dim{color:#6b8299}
      .ax-sec{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:#6b8299;margin-bottom:10px;display:flex;align-items:center;gap:6px}
      .frow{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px}
      .ax-alert{border-left:3px solid #ff5252;background:rgba(255,82,82,.07);border-radius:0 8px 8px 0;padding:10px 14px;font-size:12px;line-height:1.5}
      .ax-advice{background:#f8fafc;border:1px solid #dde4ee;border-radius:10px;padding:18px;font-size:12.5px;line-height:1.8;color:#2d4060;white-space:pre-wrap}
      .ax-advice strong{color:#c9a84c;font-weight:600}
      .ax-divider{border:none;border-top:1px solid #dde4ee;margin:14px 0}
      .drop-zone{border:1px dashed #dde4ee;border-radius:10px;padding:22px;text-align:center;cursor:pointer;transition:border-color .15s}
      .drop-zone:hover{border-color:#c9a84c}
      .risk-btn{flex:1;min-width:140px;padding:14px 12px;border-radius:10px;cursor:pointer;text-align:left;transition:all .2s;font-family:'Sora',sans-serif}
      .toggle-row{display:flex;align-items:center;gap:10px;padding:11px 14px;background:#f8fafc;border:1px solid #dde4ee;border-radius:9px;cursor:pointer;transition:border-color .15s;user-select:none}
      @keyframes mf-pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(1.3)}}
      .toggle-row:hover{border-color:#c0cdd9}
      .toggle-track{width:32px;height:18px;border-radius:9px;background:#dde4ee;position:relative;transition:background .2s;flex-shrink:0}
      .toggle-track.on{background:#c9a84c}
      .toggle-knob{position:absolute;top:2px;left:2px;width:14px;height:14px;border-radius:50%;background:#ffffff;transition:transform .2s}
      .toggle-track.on .toggle-knob{transform:translateX(14px)}
      .stepbtn{width:26px;height:26px;border-radius:6px;border:1px solid #dde4ee;background:#f8fafc;color:#111827;cursor:pointer;font-size:15px;display:flex;align-items:center;justify-content:center;transition:all .15s;line-height:1}
      .stepbtn:hover{border-color:#c9a84c;color:#c9a84c}
      .ev-row{display:grid;grid-template-columns:1fr 80px 100px 30px;gap:8px;align-items:center;padding:9px 12px;background:#f8fafc;border:1px solid #dde4ee;border-radius:9px}
      .avatar{border-radius:12px;background:linear-gradient(135deg,#e8f0fb,#d0e2f8);border:1px solid #a8c4e8;display:flex;align-items:center;justify-content:center;font-family:'Space Mono',monospace;font-weight:700;color:#c9a84c;flex-shrink:0}
      .pbar{height:3px;border-radius:2px;background:#dde4ee;overflow:hidden}
      .pbar-fill{height:100%;border-radius:2px;background:#c9a84c;transition:width .6s ease}
      .ev-badge{display:inline-flex;align-items:center;gap:3px;font-size:10px;font-weight:600;padding:2px 7px;border-radius:4px}
      .goal-card{background:#ffffff;border:1px solid #dde4ee;border-radius:12px;overflow:hidden;transition:border-color .15s}
      .goal-card:hover{border-color:#c0cdd9}
      .goal-card.expanded{border-color:#c9a84c}
      .goal-progress{height:4px;border-radius:2px;background:#dde4ee;overflow:hidden;margin:8px 0}
      .goal-progress-fill{height:100%;border-radius:2px;transition:width .8s cubic-bezier(.4,0,.2,1)}
      .prob-ring-track{fill:none;stroke:#dde4ee}
      .prob-ring-fill{fill:none;stroke-linecap:round;transition:stroke-dasharray 1s cubic-bezier(.4,0,.2,1)}
      .alloc-seg{height:100%;display:inline-block;transition:width .6s ease}
      .priority-dot{width:6px;height:6px;border-radius:50%;flex-shrink:0}
      /* ── Insurance module ── */
      .ins-card{background:#ffffff;border:1px solid #dde4ee;border-radius:12px;padding:18px;display:flex;flex-direction:column;gap:12px}
      .ins-bar-track{height:7px;border-radius:4px;background:#dde4ee;overflow:hidden;position:relative}
      .ins-bar-fill{height:100%;border-radius:4px;transition:width .9s cubic-bezier(.4,0,.2,1)}
      .ins-status{display:inline-flex;align-items:center;gap:4px;font-size:10px;font-weight:700;padding:2px 9px;border-radius:5px;letter-spacing:.04em}
      .credit-track{height:8px;border-radius:4px;background:linear-gradient(to right,#ff5252 0%,#ff8c42 25%,#c9a84c 50%,#00d4a4 100%);position:relative}
      .credit-pin{position:absolute;top:-4px;width:4px;height:16px;border-radius:2px;background:#fff;transform:translateX(-50%)}
      .prot-score-ring{filter:drop-shadow(0 0 12px currentColor)}
      /* ── FI Planner ── */
      .fi-multiple-btn{flex:1;padding:10px 8px;border-radius:9px;border:1px solid #dde4ee;background:#f8fafc;cursor:pointer;text-align:center;transition:all .2s;font-family:'Sora',sans-serif}
      .fi-multiple-btn:hover{border-color:#c0cdd9}
      .insight-card{border-left:3px solid;border-radius:0 10px 10px 0;padding:12px 14px;background:#f8fafc;display:flex;flex-direction:column;gap:5px}
      .insight-tag{font-size:9px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;padding:1px 6px;border-radius:3px}
      .bucket-lane{border:1px solid #dde4ee;border-radius:10px;padding:14px;display:flex;flex-direction:column;gap:8px;background:#f8fafc}
      /* ── Settings modal ── */
      .settings-overlay{position:fixed;inset:0;background:rgba(100,116,139,.22);z-index:999;display:flex;align-items:center;justify-content:center;padding:20px}
      .settings-panel{background:#ffffff;border:1px solid #dde4ee;border-radius:16px;width:100%;max-width:460px;max-height:85vh;overflow-y:auto}
      .settings-section{padding:18px 20px;border-bottom:1px solid #dde4ee}
      .settings-section:last-child{border-bottom:none}
      .reset-btn{width:100%;background:#f8fafc;border:1px solid #dde4ee;color:#111827;padding:12px 14px;border-radius:9px;cursor:pointer;text-align:left;font-family:'Sora',sans-serif;font-size:12px;transition:all .15s;display:flex;align-items:center;gap:10px}
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
      <circle cx="85" cy="85" r={r} fill="none" stroke="#dde4ee" strokeWidth="10"/>
      <circle cx="85" cy="85" r={r} fill="none" stroke="url(#gr1)" strokeWidth="10"
        strokeDasharray={`${dash} ${c}`} strokeLinecap="round" transform="rotate(-90 85 85)"
        style={{transition:"stroke-dasharray 1.4s cubic-bezier(.4,0,.2,1)"}}/>
      <text x="85" y="80" textAnchor="middle" fill="#c9a84c" fontFamily="'Space Mono',monospace" fontWeight="700" fontSize="15">{progress.toFixed(1)}%</text>
      <text x="85" y="98" textAnchor="middle" fill="#6b8299" fontFamily="'Sora',sans-serif" fontSize="9.5">of wealth goal</text>
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
      <div className="ax-mono" style={{fontSize:20,fontWeight:700,color:color||"#111827",lineHeight:1.2}}>{value}</div>
      {sub && <div style={{fontSize:10,color:"#6b8299",marginTop:3}}>{sub}</div>}
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
        {sub && <div style={{fontSize:11,color:"#6b8299",marginTop:1}}>{sub}</div>}
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
      <line x1={PAD} y1={55} x2={W-PAD} y2={55} stroke="#dde4ee" strokeWidth="1.5"/>
      <circle cx={PAD} cy={55} r={3} fill="#c0cdd9"/>
      <text x={PAD} y={72} textAnchor="middle" fill="#6b8299" fontSize="9" fontFamily="Sora,sans-serif">{CUR_YEAR}</text>
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
  const needed = monthlyNeeded(goal.currentCorpus, inflated, yrs, goal.expectedReturn, goal.stepUpPct||0);
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
            <span style={{fontSize:10,color:"#6b8299"}}>{cat.label} · {goal.targetYear}</span>
          </div>
          <div style={{fontSize:11,color:"#6b8299",marginBottom:6,display:"flex",gap:10,flexWrap:"wrap"}}>
            <span>Today: <b style={{color:"#526a84"}}>{fmt(goal.targetAmount)}</b></span>
            <span>→ Inflation-adj: <b style={{color:"#111827"}}>{fmt(inflated)}</b></span>
            {yrs > 0 && <span style={{color:"#c0cdd9"}}>({yrs}y at {goal.inflationRate}% p.a.)</span>}
          </div>
          {/* Progress bar */}
          <div className="goal-progress">
            <div className="goal-progress-fill" style={{width:`${corpusPct}%`,background:cat.color}}/>
          </div>
          <div style={{display:"flex",gap:14,fontSize:11,color:"#6b8299",flexWrap:"wrap"}}>
            <span>Corpus <b style={{color:cat.color}}>{fmt(goal.currentCorpus)}</b> of <b style={{color:"#111827"}}>{fmt(inflated)}</b></span>
            {gap > 0 && <span style={{color:"#ff8c42"}}>⚠ Need <b>{fmt(gap)}/mo more</b></span>}
            {gap <= 0 && needed > 0 && <span style={{color:"#00d4a4"}}>✓ Contribution covers goal</span>}
          </div>
        </div>

        {/* Right: MC probability */}
        <div style={{flexShrink:0,textAlign:"center",width:72}}>
          {computing ? (
            <div style={{fontSize:11,color:"#6b8299",display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
              <Sigma size={16} className="mc-running" color="#c9a84c"/>
              <span>MC…</span>
            </div>
          ) : prob != null ? (
            <ProbRing prob={prob}/>
          ) : (
            <div style={{fontSize:10,color:"#c0cdd9"}}>—</div>
          )}
        </div>

        <ChevronDown size={14} color="#6b8299" style={{transform:expanded?"rotate(180deg)":"none",transition:"transform .2s",flexShrink:0}}/>
      </div>

      {/* Monthly allocation strip */}
      {!expanded && goal.monthlyContrib > 0 && (
        <div style={{padding:"0 16px 12px",display:"flex",gap:10,fontSize:11,color:"#6b8299"}}>
          <span>Contributing <b style={{color:"#c9a84c"}}>{fmt(goal.monthlyContrib)}/mo</b></span>
          <span>· Need <b style={{color:gap>0?"#ff8c42":"#00d4a4"}}>{fmt(needed)}/mo</b></span>
        </div>
      )}

      {/* Expanded edit form */}
      {expanded && (
        <div style={{borderTop:"1px solid #dde4ee",padding:16,display:"flex",flexDirection:"column",gap:12}}>
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
              <label className="ax-label">Today's Target (₹)</label>
              <input className="ax-input" type="number" min="0" value={goal.targetAmount||""} onChange={e=>onChange("targetAmount",parseFloat(e.target.value)||0)} placeholder="In today's money"/>
            </div>
            <div>
              <label className="ax-label">Target Year</label>
              <input className="ax-input" type="number" min={CUR_YEAR} max={CUR_YEAR+60} value={goal.targetYear} onChange={e=>onChange("targetYear",parseInt(e.target.value)||CUR_YEAR+10)}/>
            </div>
            <div>
              <label className="ax-label">Current Corpus (₹)</label>
              <input className="ax-input" type="number" min="0" value={goal.currentCorpus||""} onChange={e=>onChange("currentCorpus",parseFloat(e.target.value)||0)} placeholder="Already saved"/>
            </div>
            <div>
              <label className="ax-label">Monthly Contribution (₹)</label>
              <input className="ax-input" type="number" min="0" value={goal.monthlyContrib||""} onChange={e=>onChange("monthlyContrib",parseFloat(e.target.value)||0)} placeholder="Monthly savings for this"/>
            </div>
            <div>
              <label className="ax-label">Inflation Rate (%)</label>
              <input className="ax-input" type="number" min="0" max="20" step="0.5" value={goal.inflationRate} onChange={e=>onChange("inflationRate",parseFloat(e.target.value)||6)}/>
            </div>
            <div>
              <label className="ax-label">Expected Return (%)</label>
              <input className="ax-input" type="number" min="1" max="30" step="0.5" value={goal.expectedReturn} onChange={e=>onChange("expectedReturn",parseFloat(e.target.value)||11)}/>
            </div>
            <div>
              <label className="ax-label">Annual SIP Step-Up (%)</label>
              <input className="ax-input" type="number" min="0" max="30" step="1" value={goal.stepUpPct??5} onChange={e=>onChange("stepUpPct",parseFloat(e.target.value)||0)} placeholder="e.g. 5"/>
              <div style={{fontSize:10,color:"#6b8299",marginTop:3}}>Raise contribution by this % each year</div>
            </div>
          </div>

          {/* Key outputs row */}
          <div style={{display:"flex",gap:10,flexWrap:"wrap",padding:"10px 12px",background:"#f8fafc",borderRadius:9,fontSize:11}}>
            <span style={{color:"#6b8299"}}>Inflation-adj target</span>
            <b style={{color:"#111827"}}>{fmt(inflated)}</b>
            <span style={{color:"#6b8299"}}>·</span>
            <span style={{color:"#6b8299"}}>Monthly needed{(goal.stepUpPct||0)>0?` (yr-1, ${goal.stepUpPct}% step-up)`:""}</span>
            <b style={{color:"#c9a84c"}}>{fmt(needed)}/mo</b>
            <span style={{color:"#6b8299"}}>·</span>
            <span style={{color:"#6b8299"}}>Volatility assumption</span>
            <b style={{color:"#526a84"}}>{goalVol(goal.expectedReturn)}% σ</b>
          </div>

          <div style={{display:"flex",gap:8}}>
            <label className="ax-label" style={{alignSelf:"center",marginBottom:0}}>Priority</label>
            {["high","medium","low"].map(p=>{
              const c=p==="high"?"#ff5252":p==="medium"?"#c9a84c":"#4a9eff";
              const sel=goal.priority===p;
              return <button key={p} className="ax-btn" style={{borderColor:sel?c:"#dde4ee",color:sel?c:"#6b8299",background:sel?`${c}12`:""}} onClick={()=>onChange("priority",p)}>{p.charAt(0).toUpperCase()+p.slice(1)}</button>;
            })}
            <button className="ax-btn del" style={{marginLeft:"auto"}} onClick={onDelete}><Trash2 size={12}/> Delete goal</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── AppHeader ─────────────────────────────────────────────────────────────────
function AppHeader({ metrics, onTab, tab, profileName, goalAmount, onSettings, onGoalSave, appMode="intermediate", onModeChange }) {
  const [editing, setEditing] = useState(false);
  const [input, setInput]     = useState("");
  const inputRef = useRef(null);

  const openEdit = () => { setInput(""); setEditing(true); setTimeout(()=>inputRef.current?.focus(),0); };
  const commit   = () => {
    const val = parseFloat(input.replace(/[^0-9.]/g,""));
    if (val >= 1000) onGoalSave(val);
    setEditing(false);
  };
  const onKey = e => { if(e.key==="Enter") commit(); if(e.key==="Escape") setEditing(false); };

  const ALL_TABS = [
    {id:"dashboard", label:"Dashboard",  icon:<BarChart3 size={12}/>,  modes:["beginner","intermediate","pro"]},
    {id:"goals",     label:"Goals",      icon:<Target size={12}/>,     modes:["beginner","intermediate","pro"]},
    {id:"mfcompare", label:"MF Compare", icon:<Activity size={12}/>,   modes:["beginner","intermediate","pro"]},
    {id:"advisor",   label:"AI Advisor", icon:<Brain size={12}/>,      modes:["beginner","intermediate","pro"]},
    {id:"update",    label:"Monthly",    icon:<Plus size={12}/>,       modes:["beginner","intermediate","pro"]},
    {id:"profile",   label:"Profile",    icon:<User size={12}/>,       modes:["beginner","intermediate","pro"]},
    {id:"fiplan",    label:"FI Plan",    icon:<TrendingUp size={12}/>, modes:["intermediate","pro"]},
    {id:"insurance", label:"Insurance",  icon:<Shield size={12}/>,     modes:["intermediate","pro"]},
    {id:"benchmark", label:"Benchmark",  icon:<BarChart3 size={12}/>,  modes:["intermediate","pro"]},
    {id:"history",   label:"History",    icon:<History size={12}/>,    modes:["intermediate","pro"]},
    {id:"database",  label:"Database",   icon:<Database size={12}/>,   modes:["intermediate","pro"]},
    {id:"risklab",   label:"Risk Lab",   icon:<Sigma size={12}/>,      modes:["pro"]},
  ];
  const tabs = ALL_TABS.filter(t=>t.modes.includes(appMode));
  const fh=n=>{if(!n)return"₹0";const a=Math.abs(n),s=n<0?"-":"";return a>=1e7?`${s}₹${(a/1e7).toFixed(a%1e7===0?0:2)}Cr`:a>=1e5?`${s}₹${(a/1e5).toFixed(1)}L`:`${s}₹${Math.round(a).toLocaleString("en-IN")}`;}
  return (
    <>
      <div style={{padding:"13px 18px",borderBottom:"1px solid #dde4ee",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:10,background:"#ffffff",boxShadow:"0 1px 3px rgba(0,0,0,.07)"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:28,height:28,borderRadius:6,background:"#c9a84c",display:"flex",alignItems:"center",justifyContent:"center"}}><Target size={13} color="#1a1a1a"/></div>
          <div>
            <div style={{fontSize:13,fontWeight:700,letterSpacing:".06em"}}>APEX</div>
            <div className="ax-dim" style={{fontSize:9,display:"flex",alignItems:"center",gap:4}}>
              {profileName?`${profileName}'s Advisor`:"Investment Advisor"} ·{" "}
              {editing ? (
                <input ref={inputRef} value={input} onChange={e=>setInput(e.target.value)} onBlur={commit} onKeyDown={onKey}
                  placeholder={fh(goalAmount)}
                  style={{width:72,fontSize:9,padding:"1px 5px",borderRadius:4,border:"1px solid #c9a84c",outline:"none",background:"#fffbe8",color:"#111827",fontFamily:"inherit"}}/>
              ) : (
                <span onClick={openEdit} title="Click to change goal"
                  style={{color:"#c9a84c",cursor:"pointer",fontWeight:700,borderBottom:"1px dashed #c9a84c80",lineHeight:1.2}}>
                  {fh(goalAmount)} Goal
                </span>
              )}
            </div>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          {metrics && (
            <div style={{display:"flex",alignItems:"center",gap:10,fontSize:11}}>
              <span className="ax-dim">Net Worth</span>
              <span className="ax-mono ax-gold" style={{fontWeight:700}}>{fh(metrics.netWorth)}</span>
              <div style={{width:80,height:3,background:"#dde4ee",borderRadius:2}}>
                <div style={{width:`${metrics.progress}%`,height:"100%",background:"#c9a84c",borderRadius:2,transition:"width 1s ease"}}/>
              </div>
              <span className="ax-dim">{metrics.progress.toFixed(1)}%</span>
            </div>
          )}
          {/* Mode switcher */}
          <div style={{display:"flex",gap:1,padding:"2px 3px",background:"#f0f4fa",borderRadius:8,flexShrink:0}}>
            {APP_MODES.map(m=>(
              <button key={m.id} onClick={()=>onModeChange?.(m.id)} style={{
                padding:"3px 8px",fontSize:9,borderRadius:6,border:"none",cursor:"pointer",fontFamily:"inherit",
                fontWeight:appMode===m.id?700:400,
                background:appMode===m.id?m.color:"transparent",
                color:appMode===m.id?"#fff":"#6b8299",
                transition:"all .15s",whiteSpace:"nowrap",
              }} title={m.desc}>{m.label}</button>
            ))}
          </div>
          <button className="ax-btn" style={{padding:"6px 8px",flexShrink:0}} onClick={onSettings} title="Settings & Reset">
            <Settings size={13}/>
          </button>
        </div>
      </div>
      <div style={{display:"flex",borderBottom:"1px solid #dde4ee",paddingLeft:10,overflowX:"auto",background:"#ffffff"}}>
        {tabs.map(t=><button key={t.id} className={`ax-tab ${tab===t.id?"active":""}`} onClick={()=>onTab(t.id)}>{t.icon}{t.label}</button>)}
      </div>
    </>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  useStyles();
  const [tab, setTab]           = useState("dashboard");
  const [appMode, setAppMode]   = useState("intermediate");
  const changeMode = async m => {
    setAppMode(m);
    await persist("apex-mode", m);
    // Reset to dashboard if current tab is not available in new mode
    const modeTabs = ["dashboard","goals","mfcompare","advisor","update","profile",
      ...(m==="beginner"?[]:(["fiplan","insurance","benchmark","history","database"])),
      ...(m==="pro"?["risklab"]:[])];
    setTab(t => modeTabs.includes(t) ? t : "dashboard");
  };
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
  const [apiKey, setApiKey]     = useState("");
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [newEv, setNewEv]       = useState({label:"",year:CUR_YEAR+5,cost:0});
  const fileRef = useRef(null);
  const dbFileRef = useRef(null);

  // ── Database view state ──────────────────────────────────────────────────────
  const [dbView, setDbView]             = useState({ keys: [], snapshots: [] });
  const [snapshotLabel, setSnapshotLabel] = useState("");
  const [dbMsg, setDbMsg]               = useState("");
  const [resetConfirm, setResetConfirm] = useState(false);

  // ── Boot ────────────────────────────────────────────────────────────────────
  useEffect(()=>{
    (async()=>{
      const [e,a,p,g,ins,fi,ga,ak,md]=await Promise.all([load("apex-entries"),load("apex-advice"),load("apex-profile"),load("apex-goals"),load("apex-insurance"),load("apex-fiplan"),load("apex-goal"),load("apex-apikey"),load("apex-mode")]);
      if(e)setEntries(e); if(a)setAdvice(a); if(p)setProfile(p); if(g)setGoals(g); if(ins)setInsurance(ins); if(fi)setFIPlan(fi); if(ga)setGoalAmount(ga); if(ak)setApiKey(ak); if(md)setAppMode(md);
      setBooting(false);
    })();
  },[]);

  // ── Database management ──────────────────────────────────────────────────────
  // M7: catch network failures in loadDbView
  async function loadDbView() {
    try {
      const [keys, snaps] = await Promise.all([
        fetch("/api/storage").then(r=>{ if(!r.ok) throw new Error(`storage ${r.status}`); return r.json(); }),
        fetch("/api/snapshots").then(r=>{ if(!r.ok) throw new Error(`snapshots ${r.status}`); return r.json(); }),
      ]);
      setDbView({ keys, snapshots: snaps });
    } catch(err) {
      setDbMsg(`Failed to load: ${err.message}`); setTimeout(()=>setDbMsg(""),4000);
    }
  }
  useEffect(()=>{ if(tab==="database") loadDbView(); },[tab]);

  async function exportDb() { window.open("/api/export","_blank"); }

  // M1: guard JSON.parse from corrupt/wrong files
  async function importDb(e) {
    const file = e.target.files[0]; if(!file) return;
    try {
      const data = JSON.parse(await file.text());
      const res = await fetch("/api/import",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(data)});
      if(!res.ok) throw new Error(`Server error ${res.status}`);
      setDbMsg("Imported!"); setTimeout(()=>setDbMsg(""),3000);
      await loadDbView();
    } catch(err) {
      setDbMsg(`Import failed: ${err.message}`); setTimeout(()=>setDbMsg(""),4000);
    }
    e.target.value="";
  }

  // M2: try/catch on all DB fetch calls
  async function resetDb() {
    try {
      await fetch("/api/storage",{method:"DELETE"});
      setResetConfirm(false);
      setDbMsg("Reset complete — reloading…");
      setTimeout(()=>window.location.reload(),1200);
    } catch(err) {
      setDbMsg(`Reset failed: ${err.message}`); setTimeout(()=>setDbMsg(""),4000);
    }
  }

  async function createSnapshot() {
    try {
      const label = snapshotLabel.trim() || new Date().toLocaleDateString("en-IN",{month:"short",year:"numeric"});
      const res = await fetch("/api/snapshots",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({label})});
      if(!res.ok) throw new Error(`Server error ${res.status}`);
      setSnapshotLabel("");
      setDbMsg("Snapshot saved"); setTimeout(()=>setDbMsg(""),3000);
      await loadDbView();
    } catch(err) {
      setDbMsg(`Snapshot failed: ${err.message}`); setTimeout(()=>setDbMsg(""),4000);
    }
  }

  async function restoreSnapshot(id) {
    try {
      const res = await fetch(`/api/snapshots/${id}/restore`,{method:"POST"});
      if(!res.ok) throw new Error(`Server error ${res.status}`);
      setDbMsg("Restored — reloading…");
      setTimeout(()=>window.location.reload(),1200);
    } catch(err) {
      setDbMsg(`Restore failed: ${err.message}`); setTimeout(()=>setDbMsg(""),4000);
    }
  }

  async function deleteSnapshot(id) {
    try {
      await fetch(`/api/snapshots/${id}`,{method:"DELETE"});
      await loadDbView();
    } catch(err) {
      setDbMsg(`Delete failed: ${err.message}`); setTimeout(()=>setDbMsg(""),4000);
    }
  }

  async function deleteKey(key) {
    await window.storage.remove(key);
    await loadDbView();
  }

  // ── Monte Carlo — one goal per tick so UI stays responsive ──────────────────
  useEffect(()=>{
    if (!goals.length) { setProbs({}); return; }
    setComputing(true);
    let cancelled = false;
    const res = {};
    const runNext = idx => {
      if (cancelled) return;
      if (idx >= goals.length) { setProbs(res); setComputing(false); return; }
      const g = goals[idx];
      const yrs = g.targetYear - CUR_YEAR;
      const inflated = calcInflated(g.targetAmount, g.inflationRate, yrs);
      const vol = goalVol(g.expectedReturn);
      res[g.id] = monteCarlo(g.currentCorpus, g.monthlyContrib, inflated, yrs, g.expectedReturn, vol, g.stepUpPct||0);
      setTimeout(()=>runNext(idx+1), 0);
    };
    setTimeout(()=>runNext(0), 0);
    return ()=>{ cancelled=true; };
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
  const fi         = calcFIPlan(fiPlan, metrics?.netWorth || 0, metrics?.investableNetWorth);
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
  const saveApiKey = async () => {
    const key = apiKeyInput.trim();
    setApiKey(key); await persist("apex-apikey", key);
    setApiKeyInput(""); flash("API key saved!");
  };
  // C2: API key never leaves the server — all Claude calls go through /api/ai proxy

  const quickSaveGoal = async val => {
    if (!val || val < 1000) return;
    setGoalAmount(val); await persist("apex-goal", val);
    flash("Goal updated to " + fmt(val) + "!");
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

  // ── Statement parser (uses local Gemma 4 via Ollama) ────────────────────────
  const parseStatement=async file=>{
    setParsingFile(true); setParsedNote("");
    try {
      const form=new FormData(); form.append("file",file);
      const res=await fetch("/api/parse-document",{method:"POST",body:form});
      if(!res.ok){ const e=await res.json().catch(()=>({})); setParsedNote(`Parse error ${res.status}: ${e.error||"Ollama unavailable — is it running?"}`); setParsingFile(false); return; }
      const {parsed}=await res.json();
      let filled=[];
      if(parsed.salary)     { upd("income","salary",parsed.salary);              filled.push("salary"); }
      if(parsed.totalExpenses){ upd("expenses","essentials",parsed.totalExpenses); filled.push("expenses"); }
      if(parsed.bankBalance){ upd(null,"bankBalance",parsed.bankBalance);         filled.push("bank balance"); }
      if(parsed.emiTotal)   { upd("expenses","emi",parsed.emiTotal);              filled.push("EMI"); }
      if(parsed.equity)     { upd("investments","equity",parsed.equity);           filled.push("equity"); }
      if(parsed.mutualFunds){ upd("investments","mutualFunds",parsed.mutualFunds); filled.push("mutual funds"); }
      if(parsed.epf)        { upd("investments","epf",parsed.epf);                filled.push("EPF"); }
      if(parsed.nps)        { upd("investments","nps",parsed.nps);                filled.push("NPS"); }
      if(parsed.ppf)        { upd("investments","ppf",parsed.ppf);                filled.push("PPF"); }
      if(parsed.fd)         { upd("investments","fd",parsed.fd);                  filled.push("FD"); }
      if(parsed.sgb)        { upd("investments","sgb",parsed.sgb);                filled.push("SGB"); }
      if(parsed.gold)       { upd("investments","gold",parsed.gold);              filled.push("gold"); }
      const note=parsed.notes||(filled.length?`Filled: ${filled.join(", ")}. Please verify all values.`:"No financial data found — please fill manually.");
      setParsedNote(note + (filled.length?` · Auto-filled ${filled.length} field(s).`:""));
    } catch(err) { setParsedNote(`Parse error: ${err.message||"Unknown error. Please fill manually."}`); }
    setParsingFile(false);
  };

  // ── Profile context for AI ───────────────────────────────────────────────────
  const buildCtx=()=>{
    const p=profile; if(!p.age&&!p.name)return "";
    const risk=RISK_OPTIONS.find(r=>r.id===p.riskAppetite);
    const ytr=p.age&&p.retirementAge?p.retirementAge-p.age:null;
    const deps=[p.dependents.spouse&&"spouse",p.dependents.children>0&&`${p.dependents.children} child${p.dependents.children>1?"ren":""}`,p.dependents.parents>0&&`${p.dependents.parents} parent${p.dependents.parents>1?"s":""}`].filter(Boolean);
    const evStr=profile.lifeEvents.filter(e=>e.year>=CUR_YEAR&&e.label).sort((a,b)=>a.year-b.year).map(e=>`  • ${e.label}: ${e.year} (${e.year-CUR_YEAR}y away)${e.cost?` · ₹${e.cost.toLocaleString("en-IN")} needed`:""}`).join("\n");
    const goalStr=goals.map(g=>{
      const yrs=g.targetYear-CUR_YEAR, infl=calcInflated(g.targetAmount,g.inflationRate,yrs), prob=probs[g.id];
      const needed=monthlyNeeded(g.currentCorpus,infl,yrs,g.expectedReturn,g.stepUpPct||0);
      return `  • ${g.name} (${g.category}): Target ₹${Math.round(infl).toLocaleString("en-IN")} by ${g.targetYear} | Corpus ₹${g.currentCorpus.toLocaleString("en-IN")} | Contributing ₹${g.monthlyContrib}/mo${(g.stepUpPct||0)>0?` (${g.stepUpPct}% step-up)`:""}| Needs ₹${Math.round(needed)}/mo (yr-1) | MC Probability: ${prob??0}%`;
    }).join("\n");
    const latest = entries.length ? entries[entries.length-1] : null;
    const npsBalance = latest?.investments?.nps || 0;
    const ppfBalance = latest?.investments?.ppf || 0;
    const fdBalance  = latest?.investments?.fd  || 0;
    const sgbBalance = latest?.investments?.sgb || 0;
    const lastBonus  = latest?.income?.bonus || 0;
    const investableNW = metrics?.investableNetWorth;
    const fiStr = fi ? `\nFI PLAN (Pattu 30× Framework):\n- Essential monthly today: ₹${fiPlan.essentialMonthly.toLocaleString("en-IN")}\n- Lifestyle inflation: ${fiPlan.inflationRate}%\n- Years to retirement: ${fiPlan.yearsToRetirement}\n- Inflated annual expense at retirement: ₹${Math.round(fi.inflatedAnnual).toLocaleString("en-IN")}\n- FI Threshold (30×): ₹${Math.round(fi.fi30).toLocaleString("en-IN")} | Progress (investable NW): ${fi.prog30.toFixed(1)}%\n- Investable NW: ₹${Math.round(fi.investableNW).toLocaleString("en-IN")} (excludes real estate & 40% NPS annuity)\n- Comfortable FI (35×): ₹${Math.round(fi.fi35).toLocaleString("en-IN")}\n- True FI (40×): ₹${Math.round(fi.fi40).toLocaleString("en-IN")}\n- Gap to FI30×: ₹${Math.round(fi.gap30).toLocaleString("en-IN")}\n- Savings rate benchmark (≥50% of essential expenses): ₹${(fiPlan.essentialMonthly*0.5).toLocaleString("en-IN")}/mo` : "";
    const portfolioStr = (npsBalance||ppfBalance||fdBalance||sgbBalance) ? `\nPORTFOLIO DETAIL:\n- NPS balance: ₹${npsBalance.toLocaleString("en-IN")} (40% = ₹${Math.round(npsBalance*0.4).toLocaleString("en-IN")} locked annuity at withdrawal; EET tax)\n- PPF balance: ₹${ppfBalance.toLocaleString("en-IN")} (EEE, 7.1% p.a., 15-year lock-in)\n- Fixed Deposits: ₹${fdBalance.toLocaleString("en-IN")}\n- Sovereign Gold Bonds: ₹${sgbBalance.toLocaleString("en-IN")} (2.5% coupon + price appreciation)${lastBonus?`\n- Bonus received this month: ₹${lastBonus.toLocaleString("en-IN")}` : ""}` : "";
    return `\nPERSONAL PROFILE:\n- Name: ${p.name||"?"}, Age: ${p.age}${ytr?` (${ytr}y to retire)`:""}\n- Risk: ${p.riskAppetite?.toUpperCase()} — ${risk?.detail}\n- Dependents: ${deps.length?deps.join(", "):"None"}${fiStr}${portfolioStr}\n\nLIFE EVENTS:\n${evStr||"  None"}\n\nFINANCIAL GOALS (${goals.length} tracked, avg MC probability ${avgProb??0}%):\n${goalStr||"  None set"}\n- Total monthly allocated to goals: ₹${totalGoalAlloc.toLocaleString("en-IN")}\n\nRISK & INSURANCE (Protection Score ${prot.overall}/100 — ${prot.overallCfg.label}):\n- Life Cover: ₹${prot.curLife.toLocaleString("en-IN")} of ₹${prot.recLife.toLocaleString("en-IN")} recommended (${prot.lifeScore}% adequate)${prot.lifeGap>0?` — GAP ₹${prot.lifeGap.toLocaleString("en-IN")}`:""}\n- Health Cover: ₹${prot.curHealth.toLocaleString("en-IN")} of ₹${prot.recHealth.toLocaleString("en-IN")} recommended (${prot.healthScore}% adequate)${prot.healthGap>0?` — GAP ₹${prot.healthGap.toLocaleString("en-IN")}`:""}\n- Emergency Fund: ${prot.emMonths.toFixed(1)} months of expenses (target 6 months, ${prot.emScore}% adequate)${prot.emGap>0?` — GAP ₹${prot.emGap.toLocaleString("en-IN")}`:""}\n- Disability Cover: ${prot.disScore}% adequate\n- Credit Score: ${insurance.creditScore>0?`${insurance.creditScore} (${prot.creditLabel})`:"Not recorded"}`;
  };

  // ── AI analysis ──────────────────────────────────────────────────────────────
  const runAnalysis=async(type="monthly")=>{
    if(!entries.length)return;
    if(!apiKey){
      const rec={id:Date.now(),date:new Date().toLocaleDateString("en-IN",{month:"short",day:"numeric",year:"numeric"}),type,content:"**⚙ API Key Required**\n\nTo use AI Advisor, add your Claude API key in Settings (⚙ icon top-right).\n\nGet a free key at: console.anthropic.com → API Keys",netWorthSnapshot:0};
      const updated=[rec,...advice].slice(0,12); setAdvice(updated); await persist("apex-advice",updated); return;
    }
    setAnalyzing(true);
    const m=calcMetrics(entries, goalAmount), latest=entries[entries.length-1];
    const last3=entries.slice(-3).map(e=>`${e.label}: NW ₹${e.netWorth.toLocaleString("en-IN")}`).join("; ");
    const prompt=`You are APEX, an elite personal financial advisor for an Indian investor. Client goal: ${fmt(goalAmount)} net worth ASAP. All amounts are in Indian Rupees (₹).
${buildCtx()}
FINANCIAL SNAPSHOT:
- Total Net Worth: ₹${m.netWorth.toLocaleString("en-IN")} | Investable NW: ₹${m.investableNetWorth.toLocaleString("en-IN")} (${m.progress.toFixed(1)}% of ${fmt(goalAmount)} goal)
- Monthly Income: ₹${m.totalIncome.toLocaleString("en-IN")} | Expenses: ₹${m.totalExp.toLocaleString("en-IN")}
- Monthly Savings: ₹${m.monthlySavings.toLocaleString("en-IN")} (${m.savingsRate.toFixed(1)}%) | Allocated to sub-goals: ₹${totalGoalAlloc.toLocaleString("en-IN")} | Available for wealth goal: ₹${Math.max(0,m.monthlySavings-totalGoalAlloc).toLocaleString("en-IN")}
- Investments: ₹${m.totalInv.toLocaleString("en-IN")} | Loans: ₹${m.totalLoans.toLocaleString("en-IN")} | EMI-to-income: ${m.dti.toFixed(1)}% (safe <40%)
- Trend: ${last3}
- Notes: ${latest.notes||"none"}
- Analysis type: ${type}

Respond EXACTLY:

**📈 TRAJECTORY**
[${fmt(goalAmount)} timeline AND FI timeline using the Pattu 30× framework. If FI number is set, compare progress to both. Are they on track to FI before or at retirement?]

**🎯 FI READINESS (Pattu Framework)**
[Assess progress toward FI30× target. Is savings rate meeting the ≥50% of essential expenses benchmark? Check if lifestyle inflation assumption (7% vs 8%) is appropriate. Flag any rebalancing drift >5%. Recommend bucket strategy allocation if close to retirement.]

**🎯 GOAL HEALTH**
[Review each sub-goal by MC probability. Flag any below 50%. Recommend rebalancing contributions where needed.]

**🚧 TOP BOTTLENECKS**
[2-3 specific data-backed obstacles. Include goal funding conflicts.]

**⚡ ACTION PLAN**
[3-5 quantified actions in INR. Match risk appetite. Address goal shortfalls specifically. Suggest Indian instruments: ELSS, PPF, NPS, index funds, FDs, etc.]

**🛡️ PROTECTION GAPS**
[Flag any critical insurance gaps (e.g. life cover gap for dependents, no disability cover, inadequate emergency fund). Estimate annual premium cost in INR. Prioritize by financial impact.]

**🚨 ALERTS**
[Red flags. Urgent life events needing corpus. Goals with <25% MC probability.]

**💡 BOLD MOVE**
[One high-impact, risk-calibrated recommendation that accelerates BOTH the ${fmt(goalAmount)} goal AND underfunded sub-goals.]`;
    // C4/m6: proxy call, check res.ok, use en-IN date, m8: finally
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [{ role: "user", content: prompt }], max_tokens: 1200 }),
      });
      const data = await res.json();
      let content;
      if (!res.ok) {
        content = `**⚠ Analysis Error (${res.status})**\n\n${data?.error || "Request failed. Please try again."}\n\n${res.status === 401 ? "Check your Claude API key in Settings (⚙)." : res.status === 429 ? "Rate limit reached — wait a moment and retry." : ""}`;
      } else {
        content = data.content?.filter(b=>b.type==="text").map(b=>b.text).join("") || "Analysis unavailable.";
      }
      const rec = { id:Date.now(), date:new Date().toLocaleDateString("en-IN",{month:"short",day:"numeric",year:"numeric"}), type, content, netWorthSnapshot:m.netWorth };
      const updated = [rec,...advice].slice(0,12);
      setAdvice(updated); await persist("apex-advice", updated);
    } catch(e) {
      console.error(e);
      const rec = { id:Date.now(), date:new Date().toLocaleDateString("en-IN",{month:"short",day:"numeric",year:"numeric"}), type, content:`**⚠ Network Error**\n\n${e.message}`, netWorthSnapshot:0 };
      setAdvice(prev=>[rec,...prev].slice(0,12));
    } finally {
      setAnalyzing(false);
    }
  };

  // M4: escape HTML first, then apply safe markdown-to-HTML conversion
  const renderAdvice = t => {
    const safe = t.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
    return safe.replace(/\*\*(.*?)\*\*/g,"<strong>$1</strong>").replace(/\n/g,"<br/>");
  };

  // ── SETTINGS MODAL ────────────────────────────────────────────────────────────
  const SettingsModal = () => {
    const fmtGoal = n=>{const a=Math.abs(n||0),s=n<0?"-":"";return a>=1e7?`${s}₹${(a/1e7).toFixed(a%1e7===0?0:2)}Cr`:a>=1e5?`${s}₹${(a/1e5).toFixed(1)}L`:`${s}₹${Math.round(a).toLocaleString("en-IN")}`;};
    return(
      <div className="settings-overlay" onClick={e=>{if(e.target===e.currentTarget){setShowSettings(false);setResetTarget(null);}}}>
        <div className="settings-panel">
          {/* Header */}
          <div style={{padding:"16px 20px",borderBottom:"1px solid #dde4ee",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <Settings size={15} color="#c9a84c"/>
              <span style={{fontWeight:700,fontSize:14}}>Settings</span>
            </div>
            <button className="ax-btn" style={{padding:"5px 8px"}} onClick={()=>{setShowSettings(false);setResetTarget(null);}}>
              <XIcon size={13}/>
            </button>
          </div>

          {/* ── Claude API Key ── */}
          <div className="settings-section">
            <div className="ax-sec" style={{marginBottom:8}}><Zap size={11}/> Claude API Key</div>
            <div style={{fontSize:11,color:"#6b8299",marginBottom:10,lineHeight:1.6}}>
              Required for AI Advisor and statement parsing.{" "}
              {apiKey
                ? <span style={{color:"#00d4a4",fontWeight:600}}>✓ Key set ({apiKey.slice(0,8)}…)</span>
                : <span style={{color:"#ff8c42",fontWeight:600}}>⚠ Not configured</span>}
              <br/>Get a free key at <b style={{color:"#c9a84c"}}>console.anthropic.com</b> → API Keys. Stored locally only.
            </div>
            <div style={{display:"flex",gap:8,alignItems:"flex-end",flexWrap:"wrap"}}>
              <div style={{flex:1,minWidth:200}}>
                <label className="ax-label">API Key (sk-ant-…)</label>
                <input className="ax-input" type="password" value={apiKeyInput}
                  onChange={e=>setApiKeyInput(e.target.value)}
                  onKeyDown={e=>e.key==="Enter"&&saveApiKey()}
                  placeholder={apiKey?"Update key (leave blank to keep current)":"sk-ant-api03-…"}/>
              </div>
              <button className="ax-btn primary" onClick={saveApiKey} disabled={!apiKeyInput.trim()}>
                <Save size={12}/> Save Key
              </button>
            </div>
            {apiKey&&<button className="ax-btn" style={{marginTop:8,fontSize:11,color:"#ff5252",borderColor:"#ff525260"}} onClick={async()=>{setApiKey("");await persist("apex-apikey","");flash("API key cleared.");}}>Clear key</button>}
          </div>

          {/* ── Wealth Target ── */}
          <div className="settings-section">
            <div className="ax-sec" style={{marginBottom:12}}><Target size={11}/> Wealth Target</div>
            <div style={{fontSize:11,color:"#6b8299",marginBottom:12,lineHeight:1.6}}>
              Current goal: <b className="ax-mono" style={{color:"#c9a84c",fontSize:13}}>{fmtGoal(goalAmount)}</b> — all progress bars, timelines, and AI analysis are calibrated to this target.
            </div>
            <div style={{display:"flex",gap:8,alignItems:"flex-end",flexWrap:"wrap"}}>
              <div style={{flex:1,minWidth:180}}>
                <label className="ax-label">New goal amount (₹ INR)</label>
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
              {[5_000_000,10_000_000,25_000_000,50_000_000,100_000_000].map(v=>(
                <button key={v} className="ax-btn" style={{fontSize:11,padding:"5px 10px",borderColor:goalAmount===v?"#c9a84c":"#dde4ee",color:goalAmount===v?"#c9a84c":"#6b8299"}}
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
                <div style={{fontSize:11,color:"#3d617e",marginBottom:14,lineHeight:1.6}}>
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
                      <RotateCcw size={13} color={opt.danger?"#ff5252":"#6b8299"}/>
                    </div>
                    <div>
                      <div style={{fontWeight:600,color:opt.danger?"#ff5252":"#111827"}}>{opt.label}</div>
                      <div style={{fontSize:10,color:"#6b8299",marginTop:2}}>{opt.sub}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div style={{padding:"12px 20px",fontSize:10,color:"#c0cdd9",borderTop:"1px solid #dde4ee"}}>
            APEX v4 · All data stored locally in your browser · {entries.length} monthly snapshots · {goals.length} goals
          </div>
        </div>
      </div>
    );
  };

  if(booting) return(
    <div className="apex" style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh"}}>
      <div style={{display:"flex",alignItems:"center",gap:10,color:"#6b8299",fontSize:13}}><Loader size={16} className="spinning"/> Loading APEX...</div>
    </div>
  );

  // ── Settings overlay — rendered above any active tab ─────────────────────────
  if(tab==="dashboard"){
    if(!entries.length) return(
      <div className="apex">
        {showSettings && <SettingsModal/>}
        <AppHeader metrics={null} onTab={setTab} tab={tab} profileName={profile.name} goalAmount={goalAmount} onSettings={()=>setShowSettings(true)} onGoalSave={quickSaveGoal} appMode={appMode} onModeChange={changeMode}/>
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:360,gap:16}}>
          <Target size={44} color="#dde4ee"/>
          <div style={{color:"#6b8299",fontSize:14,textAlign:"center",maxWidth:300,lineHeight:1.7}}>
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
    if(m.totalLoans>m.totalInv) alerts.push(`Outstanding debt (₹${m.totalLoans.toLocaleString("en-IN")}) exceeds investments — loans eroding wealth.`);
    if(m.monthlyGrowth<0) alerts.push(`Net worth declined ₹${Math.abs(m.monthlyGrowth).toLocaleString("en-IN")} this month.`);
    if(m.dti>50) alerts.push(`EMI-to-income ratio ${m.dti.toFixed(1)}% exceeds 50% — dangerously high; lenders cap at 40–50%.`);
    atRiskGoals.forEach(g=>alerts.push(`Goal "${g.name}" has only ${probs[g.id]}% probability of success — needs attention.`));
    profile.lifeEvents.filter(e=>e.year-CUR_YEAR<=2&&e.year>=CUR_YEAR&&e.label).forEach(e=>alerts.push(`Life event "${e.label}" ${e.year===CUR_YEAR?"is this year":`in ${e.year-CUR_YEAR}y`}${e.cost?` — ₹${e.cost.toLocaleString("en-IN")} needed`:""}.`));
    if(prot.lifeGap>0&&prot.lifeScore<50)   alerts.push(`Life cover is only ${prot.lifeScore}% adequate — gap of ${fmt(prot.lifeGap)}. Your dependents are underprotected.`);
    if(prot.healthGap>0&&prot.healthScore<60) alerts.push(`Health cover is only ${prot.healthScore}% adequate — gap of ${fmt(prot.healthGap)}. A major illness could wipe savings.`);
    if(prot.emMonths<3)                       alerts.push(`Emergency fund covers only ${prot.emMonths.toFixed(1)} months. Target is 6 months (${fmt(prot.recEmergency)}).`);
    if(prot.disScore<30)                      alerts.push(`Disability cover is critically low (${prot.disScore}%). Loss of income is the #1 wealth-destruction risk.`);
    if(rebalCheck?.needsRebalancing)          alerts.push(`Asset allocation drift ${rebalCheck.drift>0?"+":""}${rebalCheck.drift.toFixed(1)}% (equity at ${rebalCheck.cur.toFixed(0)}% vs target ${fiPlan.targetEquityPct}%). Rebalance triggered — Pattu rule: act when drift >5%.`);
    if(fi&&m.monthlySavings < fiPlan.essentialMonthly*0.5&&fiPlan.essentialMonthly>0) alerts.push(`Savings rate is below Pattu's benchmark (≥50% of essential expenses = ${fmt(fiPlan.essentialMonthly*0.5)}/mo). Currently saving ${fmt(m.monthlySavings)}/mo.`);
    if(m.nwDiscrepancy) alerts.push(`Net worth (${fmt(m.netWorth)}) differs from sum-of-components (${fmt(m.computedNW)}) by >15%. Update either the NW field or individual investment/loan fields for accurate tracking.`);
    if((m.nps||0)>0) alerts.push(`NPS balance ${fmt(m.nps)} — remember: 40% is locked into annuity at withdrawal and excluded from investable net worth (${fmt(m.investableNetWorth)}).`);

    return(
      <div className="apex">
        {showSettings && <SettingsModal/>}
        <AppHeader metrics={m} onTab={setTab} tab={tab} profileName={profile.name} goalAmount={goalAmount} onSettings={()=>setShowSettings(true)} onGoalSave={quickSaveGoal} appMode={appMode} onModeChange={changeMode}/>
        <div style={{padding:18,display:"flex",flexDirection:"column",gap:18}}>
          {/* ── BEGINNER SUITE ── */}
          {appMode==="beginner"&&<BeginnerHealthCard entries={entries} goals={goals}/>}
          {appMode==="beginner"&&<BeginnerMarketBeatCard entries={entries}/>}
          {appMode==="beginner"&&<BeginnerRiskThermometer entries={entries}/>}
          {appMode==="beginner"&&entries.length>0&&<BeginnerAllocationPie entries={entries}/>}
          {appMode==="beginner"&&<BeginnerSIPSimulator/>}
          {/* Mode hint strips */}
          {appMode==="beginner"&&(
            <div style={{fontSize:10,color:"#6b8299",padding:"6px 12px",background:"rgba(0,212,164,.06)",borderRadius:8,border:"1px solid rgba(0,212,164,.2)",display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
              <span style={{color:"#00d4a4",fontWeight:700}}>★ Beginner Mode</span>
              <span>Plain-language view · Use <strong>MF Compare</strong> to check your funds · Switch to <strong>Intermediate</strong> mode for full analytics</span>
            </div>
          )}
          {appMode==="intermediate"&&(
            <div style={{fontSize:10,color:"#6b8299",padding:"6px 12px",background:"rgba(201,168,76,.06)",borderRadius:8,border:"1px solid rgba(201,168,76,.2)",display:"flex",alignItems:"center",gap:8}}>
              <span style={{color:"#c9a84c",fontWeight:700}}>◆ Intermediate Mode</span>
              <span>Full analytics enabled · Upgrade to <strong>Pro</strong> for VaR, Monte Carlo and Risk Lab</span>
            </div>
          )}
          {appMode==="pro"&&(
            <div style={{fontSize:10,color:"#6b8299",padding:"6px 12px",background:"rgba(127,119,221,.06)",borderRadius:8,border:"1px solid rgba(127,119,221,.2)",display:"flex",alignItems:"center",gap:8}}>
              <span style={{color:"#7f77dd",fontWeight:700}}>⬡ Pro / Quant Mode</span>
              <span>Full quant analytics · VaR, Monte Carlo, Fragility Score in <strong>Risk Lab</strong> · Benchmark tab shows institutional metrics</span>
            </div>
          )}
          {/* Profile strip */}
          {(profile.name||profile.age)&&(
            <div className="ax-card" style={{padding:"12px 16px",display:"flex",alignItems:"center",gap:14,flexWrap:"wrap"}}>
              <div className="avatar" style={{width:46,height:46,fontSize:15}}>{initials(profile.name)}</div>
              <div style={{flex:1}}>
                <div style={{fontWeight:600,fontSize:14}}>{profile.name||"Your Profile"}</div>
                <div style={{fontSize:11,color:"#6b8299",marginTop:2,display:"flex",gap:14,flexWrap:"wrap"}}>
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
                {m.monthsToGoal&&<div style={{marginTop:6,fontSize:11,color:"#6b8299",lineHeight:1.5}}>~{m.monthsToGoal} months to {fmt(goalAmount)}<br/>at current pace</div>}
              </div>
            </div>
            <div style={{flex:1,display:"flex",flexDirection:"column",gap:10}}>
              <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
                <MetricCard label="Monthly Income" value={fmt(m.totalIncome)}/>
                <MetricCard label="Monthly Savings" value={fmt(m.monthlySavings)} color={m.monthlySavings>=0?"#00d4a4":"#ff5252"} sub={`${m.savingsRate.toFixed(1)}% rate · ₹${totalGoalAlloc.toLocaleString("en-IN")} to goals`}/>
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
                    <CartesianGrid strokeDasharray="3 3" stroke="#dde4ee"/>
                    <XAxis dataKey="month" tick={{fill:"#6b8299",fontSize:10}} axisLine={false} tickLine={false}/>
                    <YAxis tick={{fill:"#6b8299",fontSize:10}} axisLine={false} tickLine={false} tickFormatter={v=>v>=1e7?`₹${(v/1e7).toFixed(1)}Cr`:v>=1e5?`₹${(v/1e5).toFixed(0)}L`:`₹${(v/1000).toFixed(0)}K`}/>
                    <Tooltip contentStyle={{background:"#ffffff",border:"1px solid #dde4ee",borderRadius:8,color:"#111827",fontSize:11}} formatter={v=>[`₹${v.toLocaleString("en-IN")}`,""]}/>
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
                <MetricCard label="Goals tracked" value={goals.length} color="#111827"/>
                {avgProb!=null&&<MetricCard label="Avg MC probability" value={`${avgProb}%`} color={probCfg(avgProb).color}/>}
                <MetricCard label="Monthly allocated" value={fmt(totalGoalAlloc)} color="#c9a84c" sub={metrics?`of ${fmt(m.monthlySavings)} savings`:""}/>
              </div>
              {/* Stacked allocation bar */}
              {totalGoalAlloc>0&&m.monthlySavings>0&&(
                <div style={{marginBottom:12}}>
                  <div style={{height:8,borderRadius:4,background:"#dde4ee",overflow:"hidden",display:"flex"}}>
                    {goals.filter(g=>g.monthlyContrib>0).map(g=>{
                      const cat=GOAL_CATS[g.category]||GOAL_CATS.custom;
                      const w=Math.max(1,(g.monthlyContrib/Math.max(m.monthlySavings,totalGoalAlloc))*100);
                      return <div key={g.id} style={{width:`${w}%`,background:cat.color,opacity:.8}} title={`${g.name}: ${fmt(g.monthlyContrib)}/mo`}/>;
                    })}
                  </div>
                  <div style={{display:"flex",gap:12,marginTop:6,flexWrap:"wrap",fontSize:10,color:"#6b8299"}}>
                    {goals.filter(g=>g.monthlyContrib>0).map(g=>{const cat=GOAL_CATS[g.category]||GOAL_CATS.custom;return<span key={g.id} style={{display:"flex",alignItems:"center",gap:4}}><span style={{width:8,height:8,borderRadius:2,background:cat.color,display:"inline-block"}}/>{g.name} {fmt(g.monthlyContrib)}</span>;})}
                    {m.monthlySavings-totalGoalAlloc>0&&<span style={{display:"flex",alignItems:"center",gap:4}}><span style={{width:8,height:8,borderRadius:2,background:"#dde4ee",display:"inline-block"}}/>Wealth goal {fmt(Math.max(0,m.monthlySavings-totalGoalAlloc))}</span>}
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
                        <div style={{height:3,borderRadius:2,background:"#dde4ee",overflow:"hidden"}}><div style={{width:`${corpusPct}%`,height:"100%",background:cat.color,borderRadius:2}}/></div>
                        <div style={{fontSize:10,color:"#6b8299",marginTop:3}}>{fmt(g.currentCorpus)} of {fmt(inflated)} · {yrs}y</div>
                      </div>
                      {cfg&&<div style={{textAlign:"center",flexShrink:0}}><div className="ax-mono" style={{fontSize:18,fontWeight:700,color:cfg.color}}>{p}%</div><div style={{fontSize:9,color:cfg.color}}>{cfg.label}</div></div>}
                      <ChevronRight size={12} color="#6b8299"/>
                    </div>
                  );
                })}
                <button className="ax-btn" style={{alignSelf:"flex-start",fontSize:11}} onClick={()=>setTab("goals")}><Target size={11}/> Manage all goals</button>
              </div>
            </div>
          )}

          {/* FI Number widget — Investor & Pro only */}
          {fi && appMode!=="beginner" && (
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
                        <div className="ax-mono" style={{fontSize:18,fontWeight:700,color:"#526a84"}}>{fmt(fi.fi35)}</div>
                      </div>
                    </div>
                    <div style={{height:6,borderRadius:3,background:"#dde4ee",overflow:"hidden",marginBottom:6}}>
                      <div style={{width:`${Math.min(fi.prog30,100)}%`,height:"100%",background:fi.prog30>=100?"#00d4a4":"#c9a84c",borderRadius:3,transition:"width .9s ease"}}/>
                    </div>
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:"#6b8299"}}>
                      <span>Investable {fmt(fi.investableNW)} · <b style={{color:fi.prog30>=100?"#00d4a4":"#c9a84c"}}>{fi.prog30.toFixed(1)}% to FI</b></span>
                      <span>Year-1 withdrawal: {fi.withdrawalRate.toFixed(2)}%</span>
                    </div>
                  </div>
                  <div style={{textAlign:"right",flexShrink:0}}>
                    <div style={{fontSize:10,color:"#6b8299"}}>Inflation-adj annual expense</div>
                    <div className="ax-mono" style={{fontSize:16,fontWeight:700,color:"#111827"}}>{fmt(fi.inflatedAnnual)}</div>
                    <div style={{fontSize:10,color:"#6b8299",marginTop:2}}>at {fiPlan.inflationRate}% p.a. in {fiPlan.yearsToRetirement}y</div>
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

          {/* Protection score widget — Investor & Pro only */}
          {(prot.overall > 0 || insurance.creditScore > 0) && appMode!=="beginner" && (
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
                            <span style={{fontSize:10,color:"#6b8299",width:90,flexShrink:0}}>{label}</span>
                            <div style={{flex:1,height:4,background:"#dde4ee",borderRadius:2,overflow:"hidden"}}>
                              <div style={{width:`${score}%`,height:"100%",background:c,borderRadius:2}}/>
                            </div>
                            <span className="ax-mono" style={{fontSize:10,color:c,width:30,textAlign:"right"}}>{score}%</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <ChevronRight size={13} color="#6b8299" style={{flexShrink:0}}/>
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
                      <div style={{fontSize:11,color:"#6b8299",marginTop:2}}>{ev.year} · {yrs<=0?"This year":`${yrs}y away`}</div>
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
                <div style={{fontSize:10,color:"#6b8299",marginBottom:7}}>{advice[0].date} · {advice[0].type} · {fmt(advice[0].netWorthSnapshot)}</div>
                <div style={{fontSize:12,color:"#3d617e",lineHeight:1.65,overflow:"hidden",display:"-webkit-box",WebkitLineClamp:3,WebkitBoxOrient:"vertical"}}>{advice[0].content.replace(/\*\*/g,"").substring(0,220)}…</div>
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
      <AppHeader metrics={metrics} onTab={setTab} tab={tab} profileName={profile.name} goalAmount={goalAmount} onSettings={()=>setShowSettings(true)} onGoalSave={quickSaveGoal} appMode={appMode} onModeChange={changeMode}/>
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
          <div style={{fontSize:11,color:"#526a84",lineHeight:1.6}}>
            <b style={{color:"#c9a84c"}}>Monte Carlo simulation</b> — Each goal runs {MC_SIMS} Geometric Brownian Motion paths with log-normal return draws (Ito-corrected). Probability = % of paths where corpus reaches the inflation-adjusted target. Step-up SIP contributions grow annually per the goal's step-up rate. Target amounts in today's money; APEX inflates to target year.
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
          <div style={{textAlign:"center",padding:40,color:"#6b8299"}}>
            <Target size={36} color="#dde4ee" style={{margin:"0 auto 12px"}}/>
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
                <label className="ax-label">Today's Target (₹)</label>
                <input className="ax-input" type="number" min="0" value={addGoalForm.targetAmount||""} onChange={e=>setAddGoalForm(f=>({...f,targetAmount:parseFloat(e.target.value)||0}))} placeholder="In today's money"/>
              </div>
              <div>
                <label className="ax-label">Target Year</label>
                <input className="ax-input" type="number" min={CUR_YEAR} max={CUR_YEAR+60} value={addGoalForm.targetYear} onChange={e=>setAddGoalForm(f=>({...f,targetYear:parseInt(e.target.value)||CUR_YEAR+10}))}/>
              </div>
              <div>
                <label className="ax-label">Current Corpus (₹)</label>
                <input className="ax-input" type="number" min="0" value={addGoalForm.currentCorpus||""} onChange={e=>setAddGoalForm(f=>({...f,currentCorpus:parseFloat(e.target.value)||0}))} placeholder="Already saved"/>
              </div>
              <div>
                <label className="ax-label">Monthly Contribution (₹)</label>
                <input className="ax-input" type="number" min="0" value={addGoalForm.monthlyContrib||""} onChange={e=>setAddGoalForm(f=>({...f,monthlyContrib:parseFloat(e.target.value)||0}))} placeholder="Per month"/>
              </div>
              <div>
                <label className="ax-label">Inflation Rate (%)</label>
                <input className="ax-input" type="number" min="0" max="20" step="0.5" value={addGoalForm.inflationRate} onChange={e=>setAddGoalForm(f=>({...f,inflationRate:parseFloat(e.target.value)||6}))}/>
              </div>
              <div>
                <label className="ax-label">Expected Return (%)</label>
                <input className="ax-input" type="number" min="1" max="30" step="0.5" value={addGoalForm.expectedReturn} onChange={e=>setAddGoalForm(f=>({...f,expectedReturn:parseFloat(e.target.value)||11}))}/>
              </div>
              <div>
                <label className="ax-label">Annual SIP Step-Up (%)</label>
                <input className="ax-input" type="number" min="0" max="30" step="1" value={addGoalForm.stepUpPct??5} onChange={e=>setAddGoalForm(f=>({...f,stepUpPct:parseFloat(e.target.value)||0}))} placeholder="e.g. 5"/>
              </div>
            </div>
            {/* Preview */}
            {addGoalForm.targetAmount>0&&addGoalForm.targetYear>CUR_YEAR&&(()=>{
              const yrs=addGoalForm.targetYear-CUR_YEAR;
              const inflated=calcInflated(addGoalForm.targetAmount,addGoalForm.inflationRate,yrs);
              const needed=monthlyNeeded(addGoalForm.currentCorpus,inflated,yrs,addGoalForm.expectedReturn,addGoalForm.stepUpPct||0);
              return(
                <div style={{padding:"10px 12px",background:"#f8fafc",borderRadius:9,fontSize:11,color:"#6b8299",marginBottom:12,display:"flex",gap:14,flexWrap:"wrap"}}>
                  <span>Inflation-adj target <b style={{color:"#111827"}}>{fmt(inflated)}</b></span>
                  <span>Monthly needed{(addGoalForm.stepUpPct||0)>0?` (yr-1, ${addGoalForm.stepUpPct}% step-up)`:""} <b style={{color:"#c9a84c"}}>{fmt(needed)}/mo</b></span>
                  <span>Gap <b style={{color:needed>addGoalForm.monthlyContrib?"#ff8c42":"#00d4a4"}}>{fmt(Math.max(0,needed-addGoalForm.monthlyContrib))}/mo</b></span>
                  <span>Volatility assumption <b style={{color:"#526a84"}}>{goalVol(addGoalForm.expectedReturn)}% σ</b></span>
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
        <div style={{display:"flex",gap:16,flexWrap:"wrap",fontSize:10,color:"#6b8299",borderTop:"1px solid #dde4ee",paddingTop:12}}>
          <span style={{color:"#526a84",fontWeight:600}}>MC probability scale:</span>
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
        <AppHeader metrics={metrics} onTab={setTab} tab={tab} profileName={profile.name} goalAmount={goalAmount} onSettings={()=>setShowSettings(true)} onGoalSave={quickSaveGoal} appMode={appMode} onModeChange={changeMode}/>
        <div style={{padding:18,display:"flex",flexDirection:"column",gap:16}}>

          {/* Source attribution */}
          <div style={{background:"rgba(201,168,76,.06)",border:"1px solid rgba(201,168,76,.15)",borderRadius:10,padding:"10px 14px",fontSize:11,color:"#526a84",lineHeight:1.6}}>
            <b style={{color:"#c9a84c"}}>Framework:</b> M Pattabiraman (freefincal.com) — 30× corpus formula, lifestyle inflation at 7–8%, savings benchmarked to expenses, bucket strategy. All amounts in INR (₹).
          </div>

          {/* ── FI NUMBER CALCULATOR ── */}
          <div className="ax-card">
            <div className="ax-sec"><Target size={11}/> FI Number Calculator</div>
            <div style={{fontSize:11,color:"#6b8299",marginBottom:14,lineHeight:1.7}}>
              Enter only essential couple expenses today — <b style={{color:"#526a84"}}>exclude EMIs</b> (gone at retirement), <b style={{color:"#526a84"}}>children's fees</b> (independent by then), and <b style={{color:"#526a84"}}>parents' support</b> (may not be needed). Use <b style={{color:"#c9a84c"}}>7% lifestyle inflation</b>, not government CPI of 4%.
            </div>
            <div className="frow">
              <div>
                <label className="ax-label">Essential monthly expenses today (₹) <span style={{color:"#6b8299"}}>couple only</span></label>
                <input className="ax-input" type="number" min="0" value={fiPlan.essentialMonthly||""} onChange={e=>updFI("essentialMonthly",parseFloat(e.target.value)||0)} placeholder="e.g. 50000"/>
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
                      style={{borderColor:sel?"#c9a84c":"#dde4ee",background:sel?"rgba(201,168,76,.1)":"#f8fafc"}}>
                      <div className="ax-mono" style={{fontSize:16,fontWeight:700,color:sel?"#c9a84c":"#3d617e"}}>{o.label}</div>
                      <div style={{fontSize:10,color:sel?"#c9a84c":"#6b8299",marginTop:2}}>{o.desc}</div>
                    </button>
                  );
                })}
              </div>
              <div style={{fontSize:10,color:"#6b8299",marginTop:6}}>Government CPI (~4%) is dal-chawal inflation. Your lifestyle runs at 7–8%. The difference over 15 years is enormous.</div>
            </div>

            {/* FI Multiple selector */}
            <div style={{marginBottom:16}}>
              <label className="ax-label">FI multiple</label>
              <div style={{display:"flex",gap:10}}>
                {[{v:30,label:"30×",desc:"FI threshold",color:"#c9a84c"},{v:35,label:"35×",desc:"Comfortable FI",color:"#00d4a4"},{v:40,label:"40×",desc:"True FI",color:"#4a9eff"}].map(o=>{
                  const sel=fiPlan.fiMultiple===o.v;
                  return(
                    <button key={o.v} className="fi-multiple-btn" onClick={()=>updFI("fiMultiple",o.v)}
                      style={{borderColor:sel?o.color:"#dde4ee",background:sel?`${o.color}10`:"#f8fafc"}}>
                      <div className="ax-mono" style={{fontSize:16,fontWeight:700,color:sel?o.color:"#3d617e"}}>{o.label}</div>
                      <div style={{fontSize:10,color:sel?o.color:"#6b8299",marginTop:2}}>{o.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Results */}
            {fi && (
              <div style={{background:"#f8fafc",border:"1px solid #dde4ee",borderRadius:10,padding:16}}>
                <div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:14}}>
                  <div style={{flex:1,minWidth:130}}>
                    <div className="ax-label">Inflation-adjusted annual expense</div>
                    <div className="ax-mono" style={{fontSize:20,fontWeight:700,color:"#111827"}}>{fmt(fi.inflatedAnnual)}</div>
                    <div style={{fontSize:10,color:"#6b8299",marginTop:2}}>in {fiPlan.yearsToRetirement} years at {fiPlan.inflationRate}% p.a.</div>
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
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"#6b8299",marginBottom:5}}>
                    <span>Progress to FI threshold (30×)</span>
                    <span className="ax-mono" style={{color:fi.prog30>=100?"#00d4a4":"#c9a84c",fontWeight:700}}>{fi.prog30.toFixed(1)}%</span>
                  </div>
                  <div style={{height:8,borderRadius:4,background:"#dde4ee",overflow:"hidden",position:"relative"}}>
                    <div style={{width:`${Math.min(fi.prog30,100)}%`,height:"100%",background:fi.prog30>=100?"#00d4a4":"#c9a84c",borderRadius:4,transition:"width .9s ease"}}/>
                    {/* 35x and 40x markers */}
                    <div style={{position:"absolute",top:0,left:`${Math.min(100/35*30,100)}%`,width:2,height:"100%",background:"rgba(0,212,164,.5)"}}/>
                  </div>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:9,color:"#6b8299",marginTop:3}}>
                    <span>Investable {fmt(fi.investableNW)} · Total NW {fmt(fi.totalNW)}</span>
                    <span>Gap: {fmt(fi.gap30)}</span>
                    <span>FI30× {fmt(fi.fi30)}</span>
                  </div>
                </div>

                <div style={{display:"flex",gap:14,fontSize:11,color:"#6b8299",flexWrap:"wrap",borderTop:"1px solid #dde4ee",paddingTop:10}}>
                  <span>Year-1 withdrawal rate <b style={{color:"#c9a84c"}}>{fi.withdrawalRate.toFixed(2)}%</b></span>
                  <span style={{color:"#c0cdd9"}}>·</span>
                  <span>Rises with inflation each year (not constant like US 4% rule)</span>
                </div>
                {fi.totalNW !== fi.investableNW && (
                  <div style={{marginTop:10,fontSize:11,color:"#526a84",background:"rgba(138,160,190,.06)",borderRadius:8,padding:"8px 12px",lineHeight:1.6,borderLeft:"2px solid #6b8299"}}>
                    <b style={{color:"#c9a84c"}}>Investable NW {fmt(fi.investableNW)}</b> vs Total NW {fmt(fi.totalNW)} — real estate ({fmt(entries.length?entries[entries.length-1].investments.realEstate||0:0)}) is illiquid and excluded. NPS 40% annuity portion locked.
                  </div>
                )}
                {metrics?.nps > 0 && (
                  <div style={{marginTop:8,fontSize:11,color:"#ff8c42",background:"rgba(255,140,66,.06)",borderRadius:8,padding:"8px 12px",lineHeight:1.6,borderLeft:"2px solid #ff8c4260"}}>
                    <b>NPS Alert:</b> At withdrawal, 40% of your NPS corpus ({fmt((metrics.nps)*0.4)}) must be used to buy an annuity — it cannot be lump-sum withdrawn. Only 60% ({fmt((metrics.nps)*0.6)}) is freely accessible. Plan your corpus target accordingly.
                  </div>
                )}
              </div>
            )}
            {!fiPlan.essentialMonthly && <div style={{fontSize:11,color:"#6b8299",textAlign:"center",padding:12}}>Enter your essential monthly expenses above to calculate your FI number.</div>}
          </div>

          {/* ── SAVINGS RATE HEALTH ── */}
          <div className="ax-card">
            <div className="ax-sec"><DollarSign size={11}/> Savings Rate Health (Pattu Benchmark)</div>
            <div style={{fontSize:11,color:"#6b8299",marginBottom:12,lineHeight:1.7}}>
              The benchmark shifts in your 30s: stop anchoring to salary %, start anchoring to essential expenses. Target: <b style={{color:"#c9a84c"}}>invest ≥50% of essential monthly expenses</b> (including employer EPF/NPS). With a home loan active: minimum 20–30%.
            </div>
            {fiPlan.essentialMonthly > 0 && metrics ? (
              <div>
                <div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:12}}>
                  <div style={{flex:1,minWidth:120,background:"#f8fafc",borderRadius:9,padding:"10px 14px",border:"1px solid #dde4ee"}}>
                    <div className="ax-label">Essential expenses/mo</div>
                    <div className="ax-mono" style={{fontSize:18,fontWeight:700}}>{fmt(fiPlan.essentialMonthly)}</div>
                  </div>
                  <div style={{flex:1,minWidth:120,background:"#f8fafc",borderRadius:9,padding:"10px 14px",border:"1px solid #dde4ee"}}>
                    <div className="ax-label">Benchmark (≥50%)</div>
                    <div className="ax-mono" style={{fontSize:18,fontWeight:700,color:"#c9a84c"}}>{fmt(savBenchmark)}/mo</div>
                  </div>
                  <div style={{flex:1,minWidth:120,background:"#f8fafc",borderRadius:9,padding:"10px 14px",border:`1px solid ${meetsBenchmark?"#00d4a430":"#ff525230"}`}}>
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
              <div style={{fontSize:11,color:"#6b8299"}}>Enter essential expenses above and add a monthly snapshot to see your savings benchmark.</div>
            )}
          </div>

          {/* ── BUCKET STRATEGY ── */}
          <div className="ax-card">
            <div className="ax-sec"><Wallet size={11}/> Retirement Bucket Strategy</div>
            <div style={{fontSize:11,color:"#6b8299",marginBottom:14,lineHeight:1.7}}>
              Purpose is <b style={{color:"#526a84"}}>behavioral, not efficiency</b>. Knowing Bucket 1 is safe for 2–3 years lets you ignore market noise and not panic-sell equities in downturns.
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
                      <div style={{fontSize:12,fontWeight:600,color:"#111827"}}>{b.label}</div>
                      <div style={{fontSize:10,color:"#6b8299",marginTop:1}}>{b.target}</div>
                    </div>
                    <div className="ax-mono" style={{fontSize:13,fontWeight:700,color:b.color,flexShrink:0}}>{b.amount}</div>
                  </div>
                  <div style={{fontSize:11,color:"#3d617e",lineHeight:1.6,paddingLeft:38}}>{b.desc}</div>
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
            <div style={{fontSize:11,color:"#6b8299",marginBottom:14,lineHeight:1.7}}>
              Pattu rule: <b style={{color:"#526a84"}}>don't rebalance annually</b>. Trigger only when drift exceeds 5%. Strongest signal: an asset class has had a big run — lock in the gain. Don't let LTCG tax anxiety paralise you.
            </div>
            <div className="frow">
              <div>
                <label className="ax-label">Target equity allocation (%)</label>
                <input className="ax-input" type="number" min="0" max="100" value={fiPlan.targetEquityPct} onChange={e=>updFI("targetEquityPct",parseInt(e.target.value)||60)}/>
                <div style={{fontSize:10,color:"#6b8299",marginTop:4}}>Replace 30% equity with bonds = lower risk, small return hit. Pattu's "free lunch".</div>
              </div>
              <div>
                <label className="ax-label">Last rebalanced</label>
                <input className="ax-input" type="text" value={fiPlan.lastRebalanced} onChange={e=>updFI("lastRebalanced",e.target.value)} placeholder="e.g. Nov 2025"/>
              </div>
            </div>
            {entries.length > 0 && (
              <div style={{marginTop:12,padding:"12px 14px",borderRadius:10,background:"#f8fafc",border:`1px solid ${rb.needsRebalancing?"#ff8c42":"#dde4ee"}`}}>
                <div style={{display:"flex",gap:14,flexWrap:"wrap",marginBottom:rb.needsRebalancing?10:0}}>
                  <span style={{fontSize:11,color:"#6b8299"}}>Current equity: <b style={{color:rb.needsRebalancing?"#ff8c42":"#111827"}}>{rb.cur.toFixed(1)}%</b></span>
                  <span style={{fontSize:11,color:"#6b8299"}}>Target: <b style={{color:"#111827"}}>{fiPlan.targetEquityPct}%</b></span>
                  <span style={{fontSize:11,color:"#6b8299"}}>Drift: <b style={{color:rb.needsRebalancing?"#ff8c42":"#00d4a4"}}>{rb.drift>0?"+":""}{rb.drift.toFixed(1)}%</b></span>
                  <span className="ins-status" style={{background:rb.needsRebalancing?"rgba(255,140,66,.1)":"rgba(0,212,164,.1)",color:rb.needsRebalancing?"#ff8c42":"#00d4a4",border:`1px solid ${rb.needsRebalancing?"#ff8c4230":"#00d4a430"}`}}>
                    {rb.needsRebalancing?"Rebalance now":"Balanced"}
                  </span>
                </div>
                {rb.needsRebalancing && (
                  <div style={{fontSize:11,color:"#ff8c42",lineHeight:1.6}}>
                    Drift of {rb.abs.toFixed(1)}% exceeds the 5% trigger. Trim the outperforming asset class and add to the lagging one. The goal is not maximum growth — it's gradual growth without violent swings.
                  </div>
                )}
                <div style={{fontSize:10,color:"#6b8299",marginTop:rb.needsRebalancing?6:0}}>
                  Equity tracked: stocks + mutual funds. Debt: real estate + gold + EPF + PPF + NPS + FD + SGB. Crypto classified separately (speculative).
                </div>
                <div style={{fontSize:10,color:"#6b8299",marginTop:4,lineHeight:1.5}}>
                  <b style={{color:"#526a84"}}>LTCG note:</b> Equity gains &gt;₹1L/year taxed at 10% (LTCG). Don't let tax anxiety prevent necessary rebalancing — a 5%+ drift costs more in long-term risk than tax. Use SIP top-up to debt instead of selling equity where possible.
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
                    <span style={{fontSize:12,fontWeight:600,color:"#111827"}}>{ins.title}</span>
                  </div>
                  <div style={{fontSize:11.5,color:"#526a84",lineHeight:1.65}}>{ins.body}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{fontSize:11,color:"#6b8299",borderTop:"1px solid #dde4ee",paddingTop:12,lineHeight:1.7}}>
            <b style={{color:"#526a84"}}>Source:</b> M Pattabiraman, freefincal.com — 38-min interview on building a ₹10 crore corpus. All amounts in INR (₹). Run the AI Advisor for a personalised FI trajectory analysis using these benchmarks.
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
                {recommended>0&&<div style={{fontSize:10,color:"#6b8299",marginTop:1}}>Current {fmt(current)} · Recommended {fmt(recommended)}</div>}
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
          {insight&&<div style={{fontSize:11,color:"#526a84",background:"#f8fafc",borderRadius:8,padding:"8px 12px",lineHeight:1.6,borderLeft:`2px solid ${c}40`}}>{insight}</div>}
        </div>
      );
    };

    return(
      <div className="apex">
        {showSettings && <SettingsModal/>}
        <AppHeader metrics={metrics} onTab={setTab} tab={tab} profileName={profile.name} goalAmount={goalAmount} onSettings={()=>setShowSettings(true)} onGoalSave={quickSaveGoal} appMode={appMode} onModeChange={changeMode}/>
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
                      <span style={{fontSize:10.5,color:"#3d617e",width:160,flexShrink:0}}>{label}</span>
                      <div style={{flex:1,height:5,background:"#dde4ee",borderRadius:3,overflow:"hidden"}}>
                        <div style={{width:`${score}%`,height:"100%",background:c,borderRadius:3,transition:"width .8s ease"}}/>
                      </div>
                      <span className="ax-mono" style={{fontSize:10,color:c,width:34,textAlign:"right",flexShrink:0}}>{score}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div style={{marginTop:14,fontSize:11,color:"#6b8299",lineHeight:1.6}}>
              Protection score weights: Life 35% · Health 30% · Emergency Fund 20% · Disability 10% · Credit Score 5%. Benchmarks: 15× annual income life cover · ₹25L family health · 6× monthly emergency fund.
            </div>
          </div>

          {/* 1 ── Life Cover */}
          <CoverCard title="Life Cover (Term + Other)" Icon={Umbrella} iconColor="#4a9eff"
            score={p.lifeScore} current={p.curLife} recommended={p.recLife} gap={p.lifeGap}
            insight={p.lifeScore<80
              ? (()=>{const premium=calcTermPremium(profile.age,p.lifeGap);return`You need ${fmt(p.recLife)} in total life cover (${p.hasDep?"15×":"10×"} annual income${p.hasDep?" with dependents":""}). Gap: ${fmt(p.lifeGap)}. Indicative term plan premium for this gap: ~₹${premium>0?premium.toLocaleString("en-IN"):"—"}/year${profile.age?` at age ${profile.age}`:""}. Pure term > ULIPs for this purpose.`;})()
              : "Life cover is adequate. Review every 5 years or when income changes significantly."
            }>
            <div className="frow" style={{marginBottom:0}}>
              <div><label className="ax-label">Term Life Cover (₹)</label>
                <input className="ax-input" type="number" min="0" value={insurance.termLifeCover||""} onChange={e=>updIns("termLifeCover",parseFloat(e.target.value)||0)} placeholder="Sum assured"/>
              </div>
              <div><label className="ax-label">Other Life Insurance (₹)</label>
                <input className="ax-input" type="number" min="0" value={insurance.otherLifeCover||""} onChange={e=>updIns("otherLifeCover",parseFloat(e.target.value)||0)} placeholder="LIC, ULIP, etc."/>
              </div>
            </div>
            {p.annualIncome>0&&<div style={{fontSize:11,color:"#6b8299",display:"flex",gap:14,flexWrap:"wrap"}}>
              <span>Annual income <b style={{color:"#111827"}}>{fmt(p.annualIncome)}</b></span>
              <span>Recommended ({p.hasDep?"15×":"10×"}) <b style={{color:"#111827"}}>{fmt(p.recLife)}</b></span>
            </div>}
          </CoverCard>

          {/* 2 ── Health Cover */}
          <CoverCard title="Health Insurance" Icon={Activity} iconColor="#d4537e"
            score={p.healthScore} current={p.curHealth} recommended={p.recHealth} gap={p.healthGap}
            insight={p.healthScore<80
              ? `Target: ${fmt(p.recHealth)} total (individual ₹10L + family ${p.hasDep?"₹25L":"N/A"}). Consider a base policy + super top-up for cost efficiency. Critical illness rider adds another ₹15–20L coverage.`
              : "Health cover is adequate. Add a super top-up for additional cushion at low cost."
            }>
            <div className="frow" style={{marginBottom:0}}>
              <div><label className="ax-label">Individual Cover (₹)</label>
                <input className="ax-input" type="number" min="0" value={insurance.healthSelf||""} onChange={e=>updIns("healthSelf",parseFloat(e.target.value)||0)} placeholder="Your health policy"/>
              </div>
              <div><label className="ax-label">Family Floater (₹)</label>
                <input className="ax-input" type="number" min="0" value={insurance.healthFamily||""} onChange={e=>updIns("healthFamily",parseFloat(e.target.value)||0)} placeholder="Family policy"/>
              </div>
              <div><label className="ax-label">Critical Illness (₹)</label>
                <input className="ax-input" type="number" min="0" value={insurance.criticalIllness||""} onChange={e=>updIns("criticalIllness",parseFloat(e.target.value)||0)} placeholder="CI rider/policy"/>
              </div>
              <div><label className="ax-label">Super Top-Up (₹)</label>
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
            <div><label className="ax-label">Emergency Fund Amount (₹)</label>
              <input className="ax-input" type="number" min="0" value={insurance.emergencyAmount||""} onChange={e=>updIns("emergencyAmount",parseFloat(e.target.value)||0)} placeholder="Liquid cash / FD / liquid fund"/>
            </div>
            {metrics&&<div style={{fontSize:11,color:"#6b8299",display:"flex",gap:14,flexWrap:"wrap"}}>
              <span>Monthly expenses <b style={{color:"#111827"}}>{fmt(metrics.totalExp)}</b></span>
              <span>Coverage <b style={{color:p.emMonths>=6?"#00d4a4":p.emMonths>=3?"#c9a84c":"#ff5252"}}>{p.emMonths.toFixed(1)} months</b></span>
              <span>Target <b style={{color:"#111827"}}>{fmt(p.recEmergency)}</b></span>
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
              <div><label className="ax-label">Disability Income Cover (₹/mo)</label>
                <input className="ax-input" type="number" min="0" value={insurance.disabilityMonthly||""} onChange={e=>updIns("disabilityMonthly",parseFloat(e.target.value)||0)} placeholder="Monthly benefit"/>
              </div>
            </div>
            <div className="toggle-row" onClick={()=>updIns("groupDisability",!insurance.groupDisability)} style={{marginTop:-4}}>
              <div className={`toggle-track ${insurance.groupDisability?"on":""}`}><div className="toggle-knob"/></div>
              <div>
                <div style={{fontSize:13,fontWeight:500}}>Employer group disability cover</div>
                <div style={{fontSize:11,color:"#6b8299",marginTop:1}}>Employer-provided group disability insurance (counts as ~6 months income replacement)</div>
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
                  <div style={{fontSize:10,color:"#6b8299",marginTop:1}}>Affects loan interest rates and borrowing capacity</div>
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
                <div style={{display:"flex",justifyContent:"space-between",fontSize:9,color:"#6b8299"}}>
                  <span>300 Poor</span><span>600 Fair</span><span>750 Good</span><span>900 Excellent</span>
                </div>
                <div style={{marginTop:10,fontSize:11,color:"#526a84",lineHeight:1.6}}>
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
            {!insurance.creditScore&&<div style={{fontSize:11,color:"#6b8299",lineHeight:1.6}}>Check your free CIBIL score at <b style={{color:"#c9a84c"}}>cibil.com</b> or via your bank app. Scores update monthly.</div>}
          </div>

          {/* Notes */}
          <div style={{fontSize:11,color:"#6b8299",borderTop:"1px solid #dde4ee",paddingTop:12,lineHeight:1.7}}>
            <b style={{color:"#526a84"}}>Note:</b> All amounts in INR (₹). Benchmarks: Life cover = {prot.hasDep?"15×":"10×"} annual income · Health = ₹{prot.recHealth.toLocaleString("en-IN")} total · Emergency = 6× monthly expenses. Run AI Advisor for a personalised insurance action plan.
          </div>
        </div>
      </div>
    );
  }

  // ── PROFILE TAB ──────────────────────────────────────────────────────────────
  if(tab==="profile") return(
    <div className="apex">
      {showSettings && <SettingsModal/>}
      <AppHeader metrics={metrics} onTab={setTab} tab={tab} profileName={profile.name} goalAmount={goalAmount} onSettings={()=>setShowSettings(true)} onGoalSave={quickSaveGoal} appMode={appMode} onModeChange={changeMode}/>
      <div style={{padding:18,display:"flex",flexDirection:"column",gap:16}}>
        <div className="ax-card" style={{display:"flex",alignItems:"center",gap:16,padding:"16px 20px"}}>
          <div className="avatar" style={{width:58,height:58,fontSize:20}}>{initials(profile.name)}</div>
          <div style={{flex:1}}>
            <div style={{fontSize:15,fontWeight:700}}>{profile.name||"Your Profile"}</div>
            <div style={{fontSize:11,color:"#6b8299",marginTop:3}}>Profile completeness</div>
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
            <div>{profile.age&&profile.retirementAge?(<div style={{background:"#f8fafc",border:"1px solid #dde4ee",borderRadius:8,padding:"10px 14px"}}><div className="ax-label" style={{marginBottom:3}}>Years to retirement</div><div className="ax-mono ax-gold" style={{fontSize:24,fontWeight:700}}>{Math.max(0,profile.retirementAge-profile.age)}</div></div>):(<div style={{fontSize:11,color:"#6b8299",display:"flex",alignItems:"center",height:"100%"}}>Fill age + retirement age</div>)}</div>
          </div>
        </div>
        <div className="ax-card">
          <div className="ax-sec">Risk Appetite</div>
          <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
            {RISK_OPTIONS.map(opt=>{const sel=profile.riskAppetite===opt.id;return(
              <div key={opt.id} className="risk-btn" onClick={()=>updP("riskAppetite",opt.id)} style={{background:sel?opt.bg:"#f8fafc",border:`1px solid ${sel?opt.border:"#dde4ee"}`}}>
                <div style={{fontSize:13,fontWeight:700,color:sel?opt.color:"#3d617e",marginBottom:4}}>{opt.label}</div>
                <div style={{fontSize:11,color:sel?opt.color:"#6b8299",marginBottom:3}}>{opt.desc}</div>
                <div style={{fontSize:10,color:"#6b8299",lineHeight:1.5}}>{opt.detail}</div>
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
                <div><div style={{fontSize:13,fontWeight:500}}>Children</div><div style={{fontSize:11,color:"#6b8299"}}>Dependent children</div></div>
                <Stepper value={profile.dependents.children} onChange={v=>updDep("children",v)} max={8}/>
              </div>
              <div className="ax-card" style={{flex:1,minWidth:160,display:"flex",alignItems:"center",justifyContent:"space-between",gap:12}}>
                <div><div style={{fontSize:13,fontWeight:500}}>Parents</div><div style={{fontSize:11,color:"#6b8299"}}>Financially dependent</div></div>
                <Stepper value={profile.dependents.parents} onChange={v=>updDep("parents",v)} max={4}/>
              </div>
            </div>
          </div>
        </div>
        <div className="ax-card">
          <div className="ax-sec"><Calendar size={11}/> Life Events Calendar</div>
          <div style={{fontSize:11,color:"#6b8299",marginBottom:14,lineHeight:1.6}}>Major upcoming expenses that compete with your wealth goal. APEX factors these into trajectory and alerts.</div>
          {profile.lifeEvents.filter(e=>e.label).length>0&&(
            <div style={{marginBottom:18,padding:"10px 6px 4px",background:"#f8fafc",borderRadius:10,border:"1px solid #dde4ee",overflowX:"auto"}}>
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
                    <input className="ax-input" type="number" min="0" value={ev.cost||""} onChange={e=>updEv(ev.id,"cost",parseFloat(e.target.value)||0)} placeholder="Cost ₹"/>
                    <button className="ax-btn del" onClick={()=>delEv(ev.id)} style={{padding:"6px 8px",minWidth:30}}><Trash2 size={12}/></button>
                  </div>
                </div>
              );})}
            </div>
          )}
          <div style={{border:"1px dashed #dde4ee",borderRadius:10,padding:14}}>
            <div className="ax-label" style={{marginBottom:10}}>Add Life Event</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 80px 100px auto",gap:8,alignItems:"center"}}>
              <input className="ax-input" value={newEv.label} onChange={e=>setNewEv(n=>({...n,label:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&addEv()} placeholder="e.g. Child's college"/>
              <input className="ax-input" type="number" min={CUR_YEAR} max={CUR_YEAR+60} value={newEv.year} onChange={e=>setNewEv(n=>({...n,year:parseInt(e.target.value)||CUR_YEAR+5}))}/>
              <input className="ax-input" type="number" min="0" value={newEv.cost||""} onChange={e=>setNewEv(n=>({...n,cost:parseFloat(e.target.value)||0}))} placeholder="Cost ₹"/>
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
      <AppHeader metrics={metrics} onTab={setTab} tab={tab} profileName={profile.name} goalAmount={goalAmount} onSettings={()=>setShowSettings(true)} onGoalSave={quickSaveGoal} appMode={appMode} onModeChange={changeMode}/>
      <div style={{padding:18,display:"flex",flexDirection:"column",gap:16}}>
        <div className="ax-card">
          <div className="ax-sec"><UploadCloud size={11}/> Upload Statement (Optional)</div>
          {!apiKey&&<div style={{fontSize:11,color:"#ff8c42",background:"rgba(255,140,66,.07)",border:"1px solid rgba(255,140,66,.25)",borderRadius:8,padding:"7px 12px",marginBottom:8,display:"flex",alignItems:"center",gap:6}}><Zap size={11}/> Add your Claude API key in <button className="ax-btn" style={{fontSize:10,padding:"2px 8px"}} onClick={()=>setShowSettings(true)}>Settings ⚙</button> to enable AI parsing.</div>}
          <div className="drop-zone" onClick={()=>fileRef.current?.click()} onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();const f=e.dataTransfer.files[0];if(f){setUploadFile(f);parseStatement(f);}}}>
            <input ref={fileRef} type="file" accept=".pdf,image/*" style={{display:"none"}} onChange={e=>{const f=e.target.files[0];if(f){setUploadFile(f);parseStatement(f);}}}/>
            {parsingFile?<div style={{display:"flex",alignItems:"center",gap:8,justifyContent:"center",color:"#c9a84c",fontSize:12}}><Loader size={14} className="spinning"/> Parsing with AI...</div>
              :uploadFile?<div style={{color:"#00d4a4",fontSize:12,display:"flex",alignItems:"center",gap:6,justifyContent:"center"}}><CheckCircle size={13}/> {uploadFile.name}</div>
              :<div style={{color:"#6b8299",fontSize:12}}>Drop PDF or image · click to browse<br/><span style={{fontSize:10}}>Bank/investment statements — AI extracts key numbers</span></div>}
          </div>
          {parsedNote&&<div style={{marginTop:10,fontSize:11,color:"#526a84",background:"#f8fafc",padding:"8px 12px",borderRadius:8,lineHeight:1.5}}>📋 {parsedNote}</div>}
        </div>
        <div className="ax-card">
          <div className="ax-sec" style={{marginBottom:14}}>Snapshot for: {form.label}</div>
          <div style={{marginBottom:12}}><label className="ax-label">Net Worth (Total Assets − Liabilities)</label><input className="ax-input" type="number" min="0" value={form.netWorth||""} placeholder="₹ INR" onChange={e=>setForm(f=>({...f,netWorth:parseFloat(e.target.value)||0}))}/></div>
          <div style={{marginBottom:14}}><label className="ax-label">Bank / Cash Balance</label><input className="ax-input" type="number" min="0" value={form.bankBalance||""} placeholder="0" onChange={e=>setForm(f=>({...f,bankBalance:parseFloat(e.target.value)||0}))}/></div>
          <hr className="ax-divider"/>
          <div className="ax-sec"><Wallet size={11}/> Investments</div>
          <div className="frow">
            <Field label="Equity / Stocks" value={form.investments.equity} onChange={v=>upd("investments","equity",v)}/>
            <Field label="Mutual Funds" value={form.investments.mutualFunds} onChange={v=>upd("investments","mutualFunds",v)}/>
            <Field label="Real Estate" value={form.investments.realEstate} onChange={v=>upd("investments","realEstate",v)}/>
            <Field label="Gold / Commodities" value={form.investments.gold} onChange={v=>upd("investments","gold",v)}/>
            <Field label="EPF / PF (balance)" value={form.investments.epf} onChange={v=>upd("investments","epf",v)}/>
            <Field label="NPS (balance)" value={form.investments.nps||0} onChange={v=>upd("investments","nps",v)}/>
            <Field label="PPF (balance)" value={form.investments.ppf||0} onChange={v=>upd("investments","ppf",v)}/>
            <Field label="Fixed Deposits" value={form.investments.fd||0} onChange={v=>upd("investments","fd",v)}/>
            <Field label="Sovereign Gold Bonds" value={form.investments.sgb||0} onChange={v=>upd("investments","sgb",v)}/>
            <Field label="Crypto" value={form.investments.crypto} onChange={v=>upd("investments","crypto",v)}/>
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
            <Field label="Bonus (this month, if any)" value={form.income.bonus||0} onChange={v=>upd("income","bonus",v)}/>
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
      <AppHeader metrics={metrics} onTab={setTab} tab={tab} profileName={profile.name} goalAmount={goalAmount} onSettings={()=>setShowSettings(true)} onGoalSave={quickSaveGoal} appMode={appMode} onModeChange={changeMode}/>
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
          {!entries.length&&<span style={{fontSize:11,color:"#6b8299"}}>Add monthly data first</span>}
        </div>
        {analyzing&&<div style={{display:"flex",alignItems:"center",gap:10,padding:16,background:"#f8fafc",borderRadius:10,fontSize:12,color:"#3d617e"}}><Loader size={13} className="spinning"/> APEX is analyzing goals, probabilities, and life events…</div>}
        {advice.map(a=>(
          <div key={a.id}>
            <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:8}}>
              <span style={{fontSize:10,color:"#6b8299"}}>{a.date}</span>
              <span style={{fontSize:9,background:"#dde4ee",color:"#6b8299",padding:"2px 7px",borderRadius:4}}>{a.type}</span>
              <span style={{fontSize:10,color:"#6b8299"}}>· {fmt(a.netWorthSnapshot)}</span>
            </div>
            <div className="ax-advice" dangerouslySetInnerHTML={{__html:renderAdvice(a.content)}}/>
          </div>
        ))}
        {!advice.length&&!analyzing&&<div style={{textAlign:"center",padding:50,color:"#6b8299"}}><Brain size={36} color="#dde4ee" style={{margin:"0 auto 12px"}}/><div style={{fontSize:13}}>Run your first analysis to get personalized advice from APEX</div></div>}
      </div>
    </div>
  );

  // ── HISTORY ──────────────────────────────────────────────────────────────────
  if(tab==="history") return(
    <div className="apex">
      {showSettings && <SettingsModal/>}
      <AppHeader metrics={metrics} onTab={setTab} tab={tab} profileName={profile.name} goalAmount={goalAmount} onSettings={()=>setShowSettings(true)} onGoalSave={quickSaveGoal} appMode={appMode} onModeChange={changeMode}/>
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
              <div style={{flex:1,fontSize:11,color:"#3d617e",display:"flex",gap:16,flexWrap:"wrap"}}>
                <span>Investments <b style={{color:"#c9a84c"}}>{fmt(inv)}</b></span>
                <span>Loans <b style={{color:loans>0?"#ff5252":"#00d4a4"}}>{fmt(loans)}</b></span>
                <span>Income <b style={{color:"#111827"}}>{fmt(inc)}</b></span>
                <span>Savings <b style={{color:sav>=0?"#00d4a4":"#ff5252"}}>{fmt(sav)}</b></span>
              </div>
              <button className="ax-btn" style={{fontSize:11}} onClick={()=>{setForm({...e});setTab("update");}}>Edit</button>
            </div>
          );
        })}
        {!entries.length&&<div style={{textAlign:"center",padding:48,color:"#6b8299",fontSize:13}}>No history yet</div>}
      </div>
    </div>
  );

  // ── MF COMPARE ───────────────────────────────────────────────────────────────
  if(tab==="mfcompare") return(
    <div className="apex">
      {showSettings && <SettingsModal/>}
      <AppHeader metrics={metrics} onTab={setTab} tab={tab} profileName={profile.name} goalAmount={goalAmount} onSettings={()=>setShowSettings(true)} onGoalSave={quickSaveGoal} appMode={appMode} onModeChange={changeMode}/>
      <MFErrorBoundary><MFCompareTab entries={entries} mode={appMode}/></MFErrorBoundary>
    </div>
  );

  if(tab==="benchmark") return(
    <div className="apex">
      {showSettings && <SettingsModal/>}
      <AppHeader metrics={metrics} onTab={setTab} tab={tab} profileName={profile.name} goalAmount={goalAmount} onSettings={()=>setShowSettings(true)} onGoalSave={quickSaveGoal} appMode={appMode} onModeChange={changeMode}/>
      <MFErrorBoundary><BenchmarkTab entries={entries} mode={appMode}/></MFErrorBoundary>
    </div>
  );

  // ── RISK LAB (Pro) ────────────────────────────────────────────────────────────
  if(tab==="risklab") return(
    <div className="apex">
      {showSettings && <SettingsModal/>}
      <AppHeader metrics={metrics} onTab={setTab} tab={tab} profileName={profile.name} goalAmount={goalAmount} onSettings={()=>setShowSettings(true)} onGoalSave={quickSaveGoal} appMode={appMode} onModeChange={changeMode}/>
      <MFErrorBoundary><RiskLabTab entries={entries}/></MFErrorBoundary>
    </div>
  );

  // ── DATABASE ─────────────────────────────────────────────────────────────────
  if(tab==="database") return(
    <div className="apex">
      {showSettings && <SettingsModal/>}
      <AppHeader metrics={metrics} onTab={setTab} tab={tab} profileName={profile.name} goalAmount={goalAmount} onSettings={()=>setShowSettings(true)} onGoalSave={quickSaveGoal} appMode={appMode} onModeChange={changeMode}/>
      <div style={{padding:18,display:"flex",flexDirection:"column",gap:16}}>

        {/* Action bar */}
        <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
          <button className="ax-btn" onClick={exportDb}><UploadCloud size={12}/> Export Backup</button>
          <button className="ax-btn" onClick={()=>dbFileRef.current?.click()}><UploadCloud size={12}/> Import Backup</button>
          <input ref={dbFileRef} type="file" accept=".json" style={{display:"none"}} onChange={importDb}/>
          {!resetConfirm
            ? <button className="ax-btn" style={{color:"#ff5252",borderColor:"rgba(255,82,82,.3)"}} onClick={()=>setResetConfirm(true)}><Trash2 size={12}/> Reset Database</button>
            : <div style={{display:"flex",gap:6,alignItems:"center"}}>
                <span style={{fontSize:11,color:"#ff5252"}}>Wipe all data?</span>
                <button className="ax-btn" style={{color:"#ff5252",borderColor:"rgba(255,82,82,.4)"}} onClick={resetDb}>Yes, Reset</button>
                <button className="ax-btn" onClick={()=>setResetConfirm(false)}>Cancel</button>
              </div>
          }
          {dbMsg && <span style={{fontSize:11,color:"#00d4a4",marginLeft:4}}>✓ {dbMsg}</span>}
        </div>

        {/* Snapshots */}
        <div className="ax-card">
          <div style={{fontWeight:600,fontSize:12,marginBottom:12,display:"flex",alignItems:"center",gap:6}}><History size={13}/> Snapshots</div>
          <div style={{display:"flex",gap:8,marginBottom:12}}>
            <input className="ax-input" style={{flex:1}} placeholder="Label (e.g. Before big purchase)" value={snapshotLabel} onChange={e=>setSnapshotLabel(e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&createSnapshot()}/>
            <button className="ax-btn primary" onClick={createSnapshot}><Save size={12}/> Save</button>
          </div>
          {dbView.snapshots.length===0
            ? <div style={{fontSize:11,color:"#6b8299",textAlign:"center",padding:"10px 0"}}>No snapshots yet — save one above to create a restore point</div>
            : dbView.snapshots.map(s=>(
              <div key={s.id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderTop:"1px solid #dde4ee"}}>
                <div style={{flex:1}}>
                  <div style={{fontSize:12,fontWeight:500}}>{s.month}</div>
                  <div style={{fontSize:10,color:"#6b8299"}}>{new Date(s.created_at).toLocaleString("en-IN")}</div>
                </div>
                <button className="ax-btn" style={{fontSize:11}} onClick={()=>restoreSnapshot(s.id)}><RotateCcw size={11}/> Restore</button>
                <button className="ax-btn" style={{fontSize:11,color:"#ff5252",padding:"5px 8px"}} onClick={()=>deleteSnapshot(s.id)}><Trash2 size={11}/></button>
              </div>
            ))
          }
        </div>

        {/* Keys */}
        <div className="ax-card">
          <div style={{fontWeight:600,fontSize:12,marginBottom:12,display:"flex",alignItems:"center",gap:6,justifyContent:"space-between"}}>
            <span style={{display:"flex",alignItems:"center",gap:6}}><Database size={13}/> Stored Keys ({dbView.keys.length})</span>
            <button className="ax-btn" style={{fontSize:10}} onClick={loadDbView}>Refresh</button>
          </div>
          {dbView.keys.length===0
            ? <div style={{fontSize:11,color:"#6b8299",textAlign:"center",padding:"10px 0"}}>No data stored yet</div>
            : dbView.keys.map(k=>(
              <div key={k.key} style={{display:"flex",alignItems:"center",gap:10,padding:"6px 0",borderTop:"1px solid #dde4ee"}}>
                <div style={{flex:1}}>
                  <div style={{fontSize:11,fontFamily:"monospace",color:"#3d617e"}}>{k.key}</div>
                  <div style={{fontSize:9,color:"#6b8299"}}>{new Date(k.updated_at).toLocaleString("en-IN")}</div>
                </div>
                <button className="ax-btn" style={{fontSize:10,color:"#ff5252",padding:"4px 8px"}} onClick={()=>deleteKey(k.key)}><Trash2 size={11}/></button>
              </div>
            ))
          }
        </div>

      </div>
    </div>
  );

  return <>{showSettings && <SettingsModal/>}</>;
}
