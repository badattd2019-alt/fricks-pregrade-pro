'use client';

import React, { useState } from 'react';

export default function Home() {
  const [certId, setCertId] = useState('');

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col items-center justify-center p-6">
      <div className="max-w-xl w-full bg-neutral-900 border border-neutral-800 rounded-xl p-8 shadow-2xl text-center">
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
          Fricks Pre-Grade Pro
        </h1>
        <p className="text-neutral-400 mb-6">
          AI Card Pre-Grading & Authenticity Vault
        </p>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="Enter Certificate ID..."
            value={certId}
            onChange={(e) => setCertId(e.target.value)}
            className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
          />
          <button
            type="button"
            className="w-full py-3 bg-amber-500 hover:bg-amber-600 font-semibold rounded-lg text-black transition-colors"
          >
            Lookup Certificate
          </button>
        </div>
      </div>
    </main>
  );
}
