'use client';

import React, { useState } from 'react';

export default function Page() {
  const [showModal, setShowModal] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    setScanResult(null);

    // Simulate AI sub-grade analysis process
    setTimeout(() => {
      setIsScanning(false);
      setScanResult({
        centeringLR: '55/45',
        centeringTB: '52/48',
        centeringScore: 9.5,
        surfaceScore: 9.0,
        surfaceDefects: ['1x Micro-scratch (Top-Left)', 'Clean Foil / Zero Print Dots'],
        overallGrade: 'PSA 9 / GEM MINT Potential'
      });
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center p-6 font-sans">
      <div className="w-full max-w-xl flex justify-between items-center mb-6">
        <span className="text-xs font-bold tracking-wider text-slate-400 uppercase">
          Free Scans Remaining: <span className="text-red-400">0</span>
        </span>
        <span className="text-xs font-semibold px-3 py-1 bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 rounded-full">
          Frick's PreGrade Pro AI
        </span>
      </div>

      <main className="w-full max-w-xl text-center space-y-6">
        <h1 className="text-3xl font-black tracking-tight leading-tight">
          CENTERING & SURFACE SUB-GRADE ANALYSIS
        </h1>
        <p className="text-slate-400 text-sm">
          Upload front & back card photos for automated alignment geometry and surface inspection.
        </p>

        {/* Upload Dropzone */}
        <label className="relative block border-2 border-dashed border-slate-700 hover:border-cyan-500 rounded-2xl p-6 cursor-pointer transition-all bg-slate-800/40 overflow-hidden shadow-xl">
          <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
          <div className="flex flex-col items-center space-y-2">
            <span className="text-3xl">📷</span>
            <p className="text-slate-200 font-semibold text-base">Select Card Photo to Analyze</p>
            <p className="text-xs text-slate-500">Supports Pokémon, Sports, and Magic Cards</p>
          </div>
        </label>

        {/* Loading Indicator */}
        {isScanning && (
          <div className="bg-slate-800/80 border border-cyan-500/40 p-6 rounded-2xl animate-pulse space-y-3">
            <p className="text-cyan-400 font-bold text-sm">Measuring Border Geometry & Scanning Surface...</p>
            <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
              <div className="bg-cyan-500 h-full w-2/3 animate-pulse"></div>
            </div>
          </div>
        )}

        {/* Breakdown Output */}
        {scanResult && (
          <div className="bg-slate-800/90 border border-slate-700 p-6 rounded-2xl space-y-6 text-left shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-700 pb-4">
              <div>
                <p className="text-xs text-slate-400 uppercase font-semibold">Predicted Grade</p>
                <p className="text-xl font-black text-cyan-400">{scanResult.overallGrade}</p>
              </div>
              <button 
                onClick={() => setShowModal(true)}
                className="bg-cyan-500 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs hover:bg-cyan-400"
              >
                Save Full PDF Report
              </button>
            </div>

            {/* Centering Breakdown */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-slate-200">📐 Centering Breakdown</span>
                <span className="text-xs font-bold text-cyan-400">{scanResult.centeringScore} / 10</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-700/50">
                  <p className="text-slate-400">Left / Right</p>
                  <p className="text-base font-extrabold text-white">{scanResult.centeringLR}</p>
                </div>
                <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-700/50">
                  <p className="text-slate-400">Top / Bottom</p>
                  <p className="text-base font-extrabold text-white">{scanResult.centeringTB}</p>
                </div>
              </div>
            </div>

            {/* Surface Breakdown */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-slate-200">🔍 Surface & Hologram Breakdown</span>
                <span className="text-xs font-bold text-cyan-400">{scanResult.surfaceScore} / 10</span>
              </div>
              <ul className="bg-slate-900/60 p-3 rounded-lg border border-slate-700/50 space-y-2 text-xs">
                {scanResult.surfaceDefects.map((defect, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-slate-300">
                    <span className="text-cyan-400">•</span> {defect}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </main>

      {/* Paywall Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 max-w-md w-full space-y-6 relative shadow-2xl">
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white text-sm"
            >
              ✕
            </button>

            <div className="text-center space-y-2">
              <span className="text-4xl">⚡</span>
              <h2 className="text-2xl font-black tracking-tight text-white">UNLOCK UNLIMITED SUB-GRADES</h2>
              <p className="text-slate-400 text-sm">
                Get full centering ratios, surface defect mapping, and high-resolution PDF exports for all your submissions.
              </p>
            </div>

            <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-700/50 text-center">
              <p className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">SubGrade Pro AI Access</p>
              <p className="text-3xl font-black mt-1">$6.60 <span className="text-sm font-normal text-slate-400">/ month</span></p>
            </div>

            <button 
              onClick={() => window.location.href = 'https://buy.stripe.com/14A6oH3QbbM03HVeik7kc00'}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 font-bold text-white text-lg hover:brightness-110 shadow-lg shadow-cyan-500/25 transition-all"
            >
              Unlock Unlimited Scans
            </button>
          </div>
        </div>
      )}
    </div>
  );
}