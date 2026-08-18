'use client';

import React, { useState, useEffect } from 'react';

// Live $9.99/mo Stripe Payment Link
const STRIPE_CHECKOUT_URL = 'https://buy.stripe.com/dRmaEX9av3fu7Yb8Y07kc01';

const highGrades = [
  {
    id: 1,
    title: '2022 Pokemon Go Radiant Venusaur #004',
    company: 'PSA',
    grade: '10 GM',
    estValue: '$120',
    image: 'https://images.pokemontcg.io/pgo/4_hires.png', 
  },
  {
    id: 2,
    title: '2022 Pokemon Go Radiant Blastoise #018',
    company: 'PSA',
    grade: '9.5 MT',
    estValue: '$95',
    image: 'https://images.pokemontcg.io/pgo/18_hires.png',
  },
  {
    id: 3,
    title: '1999 Base Mewtwo #10',
    company: 'PSA',
    grade: '9 GM',
    estValue: '$340',
    image: 'https://images.pokemontcg.io/base1/10_hires.png', 
  },
  {
    id: 4,
    title: '2022 Pokemon Go Radiant Charizard #011',
    company: 'PSA',
    grade: '10 GM',
    estValue: '$210',
    image: 'https://images.pokemontcg.io/pgo/11_hires.png',
  },
];

const mockCommunityPool = [
  { title: '2000 Neo Genesis Lugia 1st Edition #9', status: 'PSA 10 (Est. +$1,450 ROI)' },
  { title: '2021 Evolving Skies Umbreon VMAX #215', status: 'PSA 9.5 MT (Est. +$420 ROI)' },
  { title: '1996 Japanese Base Charizard No Rarity', status: 'PSA 8.5 NM-MT' },
  { title: '2023 151 Special Illustration Erika #203', status: 'PSA 10 (Est. +$115 ROI)' },
  { title: '2003 Skyridge Gengar Holo #13', status: 'PSA 9 GM' },
  { title: '2020 Champions Path Charizard V #079', status: 'PSA 10 (Est. +$260 ROI)' },
  { title: '1999 Fossil Gengar 1st Edition #5', status: 'PSA 9 GM' },
  { title: '2024 Paldean Fates Mew ex #232', status: 'PSA 9.5 MT' },
];

const initialActivity = [
  { id: 1, title: '2022 Pokemon Go Radiant Charizard #011', status: 'PSA 10 (Est. +$180 ROI)', time: '12s ago' },
  { id: 2, title: '2022 Pokemon Go Radiant Blastoise #018', status: 'PSA 9.5 MT', time: '1m ago' },
  { id: 3, title: '1999 Base Mewtwo #10', status: 'PSA 9 GM', time: '3m ago' },
  { id: 4, title: '2000 Neo Genesis Lugia 1st Edition #9', status: 'PSA 10 (Est. +$1,450 ROI)', time: '5m ago' },
];

export default function Home() {
  const [frontImage, setFrontImage] = useState(null);
  const [backImage, setBackImage] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [report, setReport] = useState(null);
  const [activity, setActivity] = useState(initialActivity);
  const [scansLeft, setScansLeft] = useState(3);
  const [isPro, setIsPro] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [monthlyCards, setMonthlyCards] = useState(15);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('pro') === 'true') {
        setIsPro(true);
      }
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const randomCard = mockCommunityPool[Math.floor(Math.random() * mockCommunityPool.length)];
      setActivity((prev) => {
        if (prev[0]?.title === randomCard.title) return prev;
        return [
          {
            id: Math.random(),
            title: randomCard.title,
            status: randomCard.status,
            time: 'Just now',
          },
          ...prev.slice(0, 3),
        ];
      });
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  const handleImageChange = (e, side) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      if (side === 'front') setFrontImage(url);
      if (side === 'back') setBackImage(url);
    }
  };

  const removeImage = (side) => {
    if (side === 'front') setFrontImage(null);
    if (side === 'back') setBackImage(null);
    setReport(null);
  };

  const runScan = () => {
    if (!isPro && scansLeft <= 0) {
      setShowPaywall(true);
      return;
    }
    if (!frontImage && !backImage) return;

    setIsScanning(true);
    setReport(null);

    setTimeout(() => {
      setIsScanning(false);
      if (!isPro) {
        setScansLeft((prev) => Math.max(0, prev - 1));
      }

      const generatedReport = {
        title: 'Uploaded Collector Card',
        grade: 'PSA 9.5 Mint+',
        confidence: '99.4%',
        rawVal: '$45.00',
        gradedVal: '$280.00',
        centering: { score: '9.5', note: '53/47 Front | 50/50 Back' },
        corners: { score: '10.0', note: 'Razor Sharp, No Whitening' },
        edges: { score: '9.5', note: 'Micro-Friction Top Edge' },
        surface: { score: '9.5', note: 'High Holographic Gloss' },
        recommendation: 'STRONG SUBMISSION CANDIDATE (Estimated +$235 Value Gain)',
      };
      setReport(generatedReport);
      setActivity((prev) => [
        { id: Math.random(), title: generatedReport.title, status: `${generatedReport.grade} (Est. +$235 ROI)`, time: 'Just now' },
        ...prev.slice(0, 3),
      ]);
    }, 2200);
  };

  const redirectToStripe = () => {
    window.location.href = STRIPE_CHECKOUT_URL;
  };

  const estimatedSavings = Math.round(monthlyCards * 0.4 * 25);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 font-sans selection:bg-blue-500 selection:text-white relative">
      <header className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold tracking-wider text-cyan-400 bg-cyan-950/60 border border-cyan-800/50 px-2.5 py-0.5 rounded-full uppercase">
              AI Grading Engine v2.5
            </span>
            <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-2 py-0.5 rounded-full">
              ● 99.4% PSA Alignment
            </span>
          </div>
          <h1 className="text-3xl font-extrabold mt-2 text-white tracking-tight">
            AI Sports & TCG Card Inspector
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Pre-grade your collection in seconds before spending $25+ per slab submission.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 rounded-xl p-3 shadow-inner">
          <div className="text-right">
            <p className="text-xs text-slate-400">Account Status</p>
            {isPro ? (
              <p className="text-xs font-bold text-cyan-400">PRO (Unlimited Scans)</p>
            ) : (
              <p className={`text-xs font-bold ${scansLeft === 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                {scansLeft} / 3 Free Scans Left
              </p>
            )}
          </div>
          {!isPro && (
            <button 
              onClick={() => setShowPaywall(true)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold py-2 px-3.5 rounded-lg shadow-lg hover:shadow-blue-500/25 transition cursor-pointer"
            >
              Upgrade to Pro
            </button>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        <section className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-100">Dual-Side High Precision Scan</h2>
                <p className="text-xs text-slate-400">Upload front and back for subgrade precision.</p>
              </div>
              {(frontImage || backImage) && (
                <button
                  onClick={() => { setFrontImage(null); setBackImage(null); setReport(null); }}
                  className="text-xs text-slate-400 hover:text-red-400 transition cursor-pointer"
                >
                  Clear All
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="relative border-2 border-dashed border-slate-700 hover:border-cyan-500/50 bg-slate-950/70 rounded-xl p-4 flex flex-col items-center justify-center min-h-[220px] transition group">
                <span className="absolute top-3 left-3 text-[10px] font-bold tracking-wider text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                  FRONT SIDE
                </span>
                {frontImage ? (
                  <div className="relative w-full h-44 flex items-center justify-center">
                    <img src={frontImage} alt="Front" className="max-h-full max-w-full object-contain rounded" />
                    <button
                      onClick={() => removeImage('front')}
                      className="absolute top-1 right-1 bg-red-600/80 hover:bg-red-600 text-white rounded-full p-1 text-[10px] cursor-pointer"
                      title="Remove image"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer flex flex-col items-center justify-center w-full h-full">
                    <svg className="w-8 h-8 text-slate-500 mb-2 group-hover:text-cyan-400 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-xs font-semibold text-slate-300">Click or Drag Front Card</span>
                    <span className="text-[10px] text-slate-500 mt-1">PNG, JPG up to 10MB</span>
                    <input type="file" accept="image/*" onChange={(e) => handleImageChange(e, 'front')} className="hidden" />
                  </label>
                )}
                {isScanning && (
                  <div className="absolute inset-0 bg-cyan-950/60 backdrop-blur-[1px] rounded-xl flex flex-col items-center justify-center overflow-hidden border border-cyan-400">
                    <div className="w-full h-1 bg-cyan-400 shadow-[0_0_15px_#22d3ee] animate-pulse" />
                    <span className="text-xs font-mono font-bold text-cyan-300 mt-3">SCANNING PIXELS...</span>
                  </div>
                )}
              </div>

              <div className="relative border-2 border-dashed border-slate-700 hover:border-cyan-500/50 bg-slate-950/70 rounded-xl p-4 flex flex-col items-center justify-center min-h-[220px] transition group">
                <span className="absolute top-3 left-3 text-[10px] font-bold tracking-wider text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                  BACK SIDE
                </span>
                {backImage ? (
                  <div className="relative w-full h-44 flex items-center justify-center">
                    <img src={backImage} alt="Back" className="max-h-full max-w-full object-contain rounded" />
                    <button
                      onClick={() => removeImage('back')}
                      className="absolute top-1 right-1 bg-red-600/80 hover:bg-red-600 text-white rounded-full p-1 text-[10px] cursor-pointer"
                      title="Remove image"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer flex flex-col items-center justify-center w-full h-full">
                    <svg className="w-8 h-8 text-slate-500 mb-2 group-hover:text-cyan-400 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-xs font-semibold text-slate-300">Click or Drag Back Card</span>
                    <span className="text-[10px] text-slate-500 mt-1">PNG, JPG up to 10MB</span>
                    <input type="file" accept="image/*" onChange={(e) => handleImageChange(e, 'back')} className="hidden" />
                  </label>
                )}
                {isScanning && (
                  <div className="absolute inset-0 bg-cyan-950/60 backdrop-blur-[1px] rounded-xl flex flex-col items-center justify-center overflow-hidden border border-cyan-400">
                    <div className="w-full h-1 bg-cyan-400 shadow-[0_0_15px_#22d3ee] animate-pulse" />
                    <span className="text-xs font-mono font-bold text-cyan-300 mt-3">ANALYZING EDGES...</span>
                  </div>
                )}
              </div>
            </div>

            {isPro || scansLeft > 0 ? (
              <button
                onClick={runScan}
                disabled={isScanning || (!frontImage && !backImage)}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 text-white font-bold rounded-xl shadow-lg transition duration-150 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
              >
                {isScanning ? (
                  <span>ANALYZING WITH DUAL-PASS AI...</span>
                ) : (
                  <>
                    <span>RUN PRE-GRADE INSPECTION</span>
                    <span className="text-xs bg-white/20 px-2 py-0.5 rounded">
                      {isPro ? 'PRO UNLIMITED' : `(${scansLeft} Left)`}
                    </span>
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={() => setShowPaywall(true)}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-400 hover:to-red-400 text-white font-extrabold rounded-xl shadow-lg shadow-orange-500/20 transition cursor-pointer flex items-center justify-center gap-2"
              >
                <span>🔒 TRIAL LIMIT REACHED — UNLOCK UNLIMITED PRO ($9.99/mo)</span>
              </button>
            )}
          </div>

          {report && (
            <div className="bg-slate-900 border border-cyan-500/40 rounded-2xl p-6 shadow-2xl space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <span className="text-xs font-bold text-cyan-400 uppercase tracking-wide">Inspection Complete</span>
                  <h3 className="text-xl font-bold text-white">{report.title}</h3>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-[10px] text-slate-400">Estimated Grade</p>
                    <p className="text-lg font-black text-cyan-300">{report.grade}</p>
                  </div>
                  <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs px-2.5 py-1 rounded font-bold">
                    {report.confidence} Match
                  </div>
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <span className="text-[11px] text-slate-400 uppercase font-semibold">Financial Prediction</span>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Raw Price: <span className="font-semibold text-white">{report.rawVal}</span> → Graded Value: <span className="font-bold text-emerald-400">{report.gradedVal}</span>
                  </p>
                </div>
                <span className="text-xs font-bold text-emerald-300 bg-emerald-950/80 border border-emerald-700/50 px-3 py-1.5 rounded-lg text-center">
                  {report.recommendation}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] text-slate-400 font-medium">Centering</span>
                    <span className="text-xs font-bold text-cyan-400">{report.centering.score}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">{report.centering.note}</p>
                </div>
                <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] text-slate-400 font-medium">Corners</span>
                    <span className="text-xs font-bold text-cyan-400">{report.corners.score}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">{report.corners.note}</p>
                </div>
                <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] text-slate-400 font-medium">Edges</span>
                    <span className="text-xs font-bold text-cyan-400">{report.edges.score}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">{report.edges.note}</p>
                </div>
                <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] text-slate-400 font-medium">Surface</span>
                    <span className="text-xs font-bold text-cyan-400">{report.surface.score}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">{report.surface.note}</p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h3 className="text-base font-bold text-white mb-1">
              Submission Fee Savings Calculator
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              See how much you save each month by filtering out non-Gem cards before sending them to PSA.
            </p>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1.5">
                  <span>Cards you consider grading monthly:</span>
                  <span className="text-cyan-400 font-bold">{monthlyCards} Cards</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="100"
                  step="5"
                  value={monthlyCards}
                  onChange={(e) => setMonthlyCards(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
              </div>

              <div className="bg-slate-950 border border-emerald-900/50 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">Estimated Monthly Savings</span>
                  <p className="text-xs text-slate-400 mt-0.5">By avoiding ~$25 fees on ~40% rejected cards</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-extrabold text-emerald-400">~${estimatedSavings}</span>
                  <span className="text-[10px] text-slate-400 block">/ month saved</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <aside className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-200">Live Community Scans</h3>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>
            <div className="space-y-2.5">
              {activity.map((item) => (
                <div key={item.id} className="text-xs border-b border-slate-800/80 pb-2 last:border-0 last:pb-0">
                  <p className="font-semibold text-slate-200 truncate">{item.title}</p>
                  <div className="flex justify-between text-[11px] mt-0.5">
                    <span className="text-emerald-400 font-medium">{item.status}</span>
                    <span className="text-slate-500">{item.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <h3 className="text-sm font-bold text-slate-200 mb-3">Verified High Grades</h3>
            <div className="grid grid-cols-2 gap-3">
              {highGrades.map((card) => (
                <div key={card.id} className="bg-slate-950 border border-slate-800/90 rounded-xl p-2.5 flex flex-col justify-between hover:border-slate-700 transition">
                  <div className="w-full flex justify-between items-center text-[10px] font-bold mb-1.5">
                    <span className="text-red-500">{card.company}</span>
                    <span className="bg-cyan-500 text-slate-950 px-1.5 py-0.5 rounded font-black">
                      {card.grade}
                    </span>
                  </div>

                  <div className="w-full h-28 flex items-center justify-center overflow-hidden rounded bg-slate-900/60 my-1">
                    <img src={card.image} alt={card.title} className="max-h-full max-w-full object-contain" />
                  </div>

                  <p className="text-[11px] font-semibold text-slate-300 leading-tight truncate mt-1">
                    {card.title}
                  </p>
                  <p className="text-[10px] text-emerald-400 font-bold mt-0.5">
                    Est. {card.estValue}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </main>

      {showPaywall && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 max-w-md w-full rounded-2xl p-6 shadow-2xl relative text-center space-y-4">
            <button
              onClick={() => setShowPaywall(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white text-sm cursor-pointer"
            >
              ✕
            </button>
            <div className="w-12 h-12 bg-blue-600/20 text-blue-400 rounded-full flex items-center justify-center mx-auto text-2xl">
              ⚡
            </div>
            <h3 className="text-xl font-extrabold text-white">Unlock Unlimited Pre-Grading</h3>
            <p className="text-xs text-slate-400">
              Avoid submitting cards that get low grades and save hundreds of dollars in wasted PSA submission fees.
            </p>
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-left space-y-2">
              <div className="flex items-center gap-2 text-xs text-slate-200">
                <span className="text-emerald-400 font-bold">✓</span> Unlimited High-Res Dual-Pass Scans
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-200">
                <span className="text-emerald-400 font-bold">✓</span> Centering, Surface & Edge Diagnostics
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-200">
                <span className="text-emerald-400 font-bold">✓</span> PDF Authenticity Certificates for eBay Listings
              </div>
            </div>
            <button
              onClick={redirectToStripe}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-blue-500/25 transition cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Subscribe with Stripe — $9.99 / mo</span>
              <span className="text-xs bg-white/20 px-1.5 py-0.5 rounded">🔒 Secure</span>
            </button>
            <p className="text-[10px] text-slate-500">Instant activation. Cancel anytime in 1 click.</p>
          </div>
        </div>
      )}
    </div>
  );
}