'use client';

import React, { useState, useEffect, useRef } from 'react';
import Webcam from 'react-webcam';

const INITIAL_CARDS = [
  {
    id: '1',
    name: '2022 Pokemon Go Radiant Venusaur #004',
    seller: 'OfficialVault',
    price: 120,
    gradingCompany: 'PSA',
    grade: '10 GM',
    imageUrl: 'https://images.pokemontcg.io/pgo/4_hires.png',
    status: 'for_sale',
  },
  {
    id: '2',
    name: '2022 Pokemon Go Radiant Blastoise #018',
    seller: 'CollectorZone',
    price: 95,
    gradingCompany: 'PSA',
    grade: '9.5 MT',
    imageUrl: 'https://images.pokemontcg.io/pgo/18_hires.png',
    status: 'for_sale',
  },
  {
    id: '3',
    name: '1999 Base Mewtwo #10',
    seller: 'VintageVault',
    price: 340,
    gradingCompany: 'PSA',
    grade: '9 GM',
    imageUrl: 'https://images.pokemontcg.io/base1/10_hires.png',
    status: 'for_sale',
  },
  {
    id: '4',
    name: '2022 Pokemon Go Radiant Charizard #011',
    seller: 'FricksVault',
    price: 210,
    gradingCompany: 'PSA',
    grade: '10 GM',
    imageUrl: 'https://images.pokemontcg.io/pgo/11_hires.png',
    status: 'for_sale',
  },
];

const LIVE_FEEDS = [
  { id: '1', name: '2020 Champions Path Charizard V #079', grade: 'PSA 10 (Est. +$260 ROI)', time: 'Just now' },
  { id: '2', name: '2023 151 Special Illustration Erika #203', grade: 'PSA 10 (Est. +$115 ROI)', time: 'Just now' },
  { id: '3', name: '2003 Skyridge Gengar Holo #13', grade: 'PSA 9 GM', time: 'Just now' },
  { id: '4', name: '2000 Neo Genesis Lugia 1st Edition #9', grade: 'PSA 10 (Est. +$1,450 ROI)', time: 'Just now' },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState('scanner');
  const [cards, setCards] = useState(INITIAL_CARDS);

  const [cardHint, setCardHint] = useState('');
  const [monthlyCards, setMonthlyCards] = useState(15);
  const [scansLeft, setScansLeft] = useState(3);
  const [frontImage, setFrontImage] = useState(null);
  const [backImage, setBackImage] = useState(null);

  // Live Webcam state
  const [activeCameraSide, setActiveCameraSide] = useState(null);
  const webcamRef = useRef(null);

  // Modal State for Cards
  const [editingCard, setEditingCard] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    price: 100,
    gradingCompany: 'PSA',
    grade: '10 GM',
    imageUrl: 'https://images.pokemontcg.io/pgo/4_hires.png',
    status: 'for_sale',
  });

  // Dedicated Native Camera Inputs (Direct Shutter)
  const frontCameraInputRef = useRef(null);
  const backCameraInputRef = useRef(null);

  // Dedicated Gallery Inputs (Photo Picker)
  const frontGalleryInputRef = useRef(null);
  const backGalleryInputRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem('fricks_inventory');
    if (saved) {
      try {
        setCards(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const saveToStorage = (updated) => {
    setCards(updated);
    localStorage.setItem('fricks_inventory', JSON.stringify(updated));
  };

  const handleFileUpload = (e, side) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      if (side === 'front') setFrontImage(url);
      if (side === 'back') setBackImage(url);
    }
  };

  const captureWebcam = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (activeCameraSide === 'front') setFrontImage(imageSrc);
      if (activeCameraSide === 'back') setBackImage(imageSrc);
      setActiveCameraSide(null);
    }
  };

  const handleOpenEdit = (card) => {
    setEditingCard(card);
    setFormData({
      name: card.name,
      price: card.price,
      gradingCompany: card.gradingCompany,
      grade: card.grade,
      imageUrl: card.imageUrl,
      status: card.status,
    });
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editingCard) return;
    const updated = cards.map((c) => (c.id === editingCard.id ? { ...c, ...formData } : c));
    saveToStorage(updated);
    setEditingCard(null);
  };

  const handleDeleteCard = (id) => {
    if (window.confirm('Are you sure you want to remove this card from inventory?')) {
      const updated = cards.filter((c) => c.id !== id);
      saveToStorage(updated);
    }
  };

  const handleCreateCard = (e) => {
    e.preventDefault();
    const newCard = {
      id: Date.now().toString(),
      seller: 'MyVault',
      ...formData,
    };
    const updated = [newCard, ...cards];
    saveToStorage(updated);
    setIsAddModalOpen(false);
    setFormData({
      name: '',
      price: 100,
      gradingCompany: 'PSA',
      grade: '10 GM',
      imageUrl: 'https://images.pokemontcg.io/pgo/4_hires.png',
      status: 'for_sale',
    });
  };

  return (
    <div className="min-h-screen bg-[#060b13] text-slate-100 p-4 md:p-8 lg:p-10 font-sans antialiased selection:bg-cyan-500 selection:text-white">
      {/* DIRECT CAMERA INPUTS (Opens device camera directly) */}
      <input
        type="file"
        ref={frontCameraInputRef}
        onChange={(e) => handleFileUpload(e, 'front')}
        accept="image/*"
        capture="environment"
        className="hidden"
      />
      <input
        type="file"
        ref={backCameraInputRef}
        onChange={(e) => handleFileUpload(e, 'back')}
        accept="image/*"
        capture="environment"
        className="hidden"
      />

      {/* GALLERY / FILE PICKER INPUTS */}
      <input
        type="file"
        ref={frontGalleryInputRef}
        onChange={(e) => handleFileUpload(e, 'front')}
        accept="image/*"
        className="hidden"
      />
      <input
        type="file"
        ref={backGalleryInputRef}
        onChange={(e) => handleFileUpload(e, 'back')}
        accept="image/*"
        className="hidden"
      />

      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* HEADER SECTION */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-800/80 pb-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide bg-cyan-950/80 text-cyan-400 border border-cyan-500/30">
                AI GRADING ENGINE V5.0
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Live Scanner &amp; Marketplace Active
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
              [Fricks Pre-Grade &amp; Verified Marketplace](https://fricks-pregrade-pro.vercel.app/)
            </h1>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-slate-900 border border-slate-700 text-slate-200 hover:bg-slate-800 transition-colors shadow-sm">
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>Sign In / Seller Login</span>
            </button>
            <button className="px-4 py-2 text-sm font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-500 shadow-md shadow-blue-900/30 transition-transform active:scale-95">
              Upgrade to Pro
            </button>
          </div>
        </header>

        {/* NAVIGATION TABS */}
        <nav className="flex items-center gap-2 p-1.5 bg-slate-900/80 border border-slate-800 rounded-xl w-fit">
          <button
            onClick={() => setActiveTab('scanner')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'scanner'
                ? 'bg-slate-800 text-cyan-400 border border-cyan-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-cyan-400"></span>
            AI Card Scanner
          </button>
          <button
            onClick={() => setActiveTab('marketplace')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'marketplace'
                ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-950/50'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <span>🏪</span>
            Marketplace Store ({cards.filter((c) => c.status === 'for_sale').length})
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'inventory'
                ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-950/50'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <span>📦</span>
            My Seller Inventory ({cards.length})
          </button>
        </nav>

        {/* TAB 1: SCANNER VIEW */}
        {activeTab === 'scanner' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
                <div className="space-y-2">
                  <label className="block text-xs font-bold tracking-wider text-cyan-400 uppercase">
                    1. Identify Card (Optional Hint)
                  </label>
                  <input
                    type="text"
                    value={cardHint}
                    onChange={(e) => setCardHint(e.target.value)}
                    placeholder="e.g. 1999 Base Set Charizard Holo #4"
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                </div>

                <div className="space-y-4">
                  <div>
                    <h2 className="text-base font-bold text-white">2. Dual-Side High Precision Scan</h2>
                    <p className="text-xs text-slate-400">Take a direct camera photo or choose from your files.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Front Side */}
                    <div className="flex flex-col justify-between border-2 border-dashed border-slate-800 hover:border-slate-700 rounded-xl p-4 bg-slate-950/40 text-center min-h-[220px]">
                      <span className="text-[10px] font-black tracking-widest text-slate-500">FRONT SIDE</span>
                      {frontImage ? (
                        <div className="my-auto h-28 flex items-center justify-center overflow-hidden rounded-lg border border-slate-800">
                          <img src={frontImage} alt="Front Scan" className="h-full w-full object-contain" />
                        </div>
                      ) : (
                        <div className="my-auto text-slate-600 text-xs flex flex-col items-center gap-1">
                          <span className="text-2xl">🎴</span>
                          <span>Drop or capture front side</span>
                        </div>
                      )}
                      <div className="space-y-2 mt-2">
                        <button
                          onClick={() => frontCameraInputRef.current?.click()}
                          className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow transition-colors flex items-center justify-center gap-1.5"
                        >
                          📷 Open Camera
                        </button>
                        <button
                          onClick={() => frontGalleryInputRef.current?.click()}
                          className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                        >
                          📁 Photos / Files
                        </button>
                      </div>
                    </div>

                    {/* Back Side */}
                    <div className="flex flex-col justify-between border-2 border-dashed border-slate-800 hover:border-slate-700 rounded-xl p-4 bg-slate-950/40 text-center min-h-[220px]">
                      <span className="text-[10px] font-black tracking-widest text-slate-500">BACK SIDE</span>
                      {backImage ? (
                        <div className="my-auto h-28 flex items-center justify-center overflow-hidden rounded-lg border border-slate-800">
                          <img src={backImage} alt="Back Scan" className="h-full w-full object-contain" />
                        </div>
                      ) : (
                        <div className="my-auto text-slate-600 text-xs flex flex-col items-center gap-1">
                          <span className="text-2xl">🎴</span>
                          <span>Drop or capture back side</span>
                        </div>
                      )}
                      <div className="space-y-2 mt-2">
                        <button
                          onClick={() => backCameraInputRef.current?.click()}
                          className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow transition-colors flex items-center justify-center gap-1.5"
                        >
                          📷 Open Camera
                        </button>
                        <button
                          onClick={() => backGalleryInputRef.current?.click()}
                          className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                        >
                          📁 Photos / Files
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setScansLeft((prev) => Math.max(0, prev - 1))}
                    className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-extrabold text-sm tracking-wide shadow-lg shadow-cyan-950/50 hover:opacity-95 active:scale-[0.99] transition-all"
                  >
                    RUN PRE-GRADE INSPECTION ({scansLeft} Left)
                  </button>
                </div>
              </div>

              {/* SAVINGS CALCULATOR */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
                <div>
                  <h3 className="text-base font-bold text-white">Submission Fee Savings Calculator</h3>
                  <p className="text-xs text-slate-400">See how much you save each month by filtering out non-Gem cards before sending them to PSA.</p>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-300">Cards you consider grading monthly:</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={monthlyCards}
                        onChange={(e) => setMonthlyCards(Math.max(0, Number(e.target.value)))}
                        className="w-24 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-sm text-white font-semibold focus:outline-none focus:border-cyan-500"
                      />
                      <span className="text-sm text-slate-400">Cards</span>
                    </div>
                  </div>

                  <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3 text-right sm:min-w-[220px]">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      ESTIMATED MONTHLY SAVINGS
                    </span>
                    <p className="text-xs text-slate-400 mt-0.5">By avoiding ~$25 fees on ~40% rejected cards</p>
                    <div className="text-xl font-black text-emerald-400 mt-1">
                      ~${(monthlyCards * 10).toLocaleString()} / month saved
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* COMMUNITY FEED */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                  <h3 className="text-base font-bold text-white">Live Community Scans</h3>
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                </div>

                <div className="space-y-3">
                  {LIVE_FEEDS.map((item) => (
                    <div key={item.id} className="p-3 bg-slate-950/60 border border-slate-800/70 rounded-xl flex items-center justify-between gap-3 hover:border-slate-700 transition-colors">
                      <div className="space-y-0.5">
                        <h4 className="text-xs font-semibold text-slate-200">{item.name}</h4>
                        <p className="text-[11px] font-bold text-cyan-400">{item.grade}</p>
                      </div>
                      <span className="text-[10px] text-slate-500 whitespace-nowrap">{item.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2 & 3: MARKETPLACE & SELLER INVENTORY VIEWS */}
        {(activeTab === 'marketplace' || activeTab === 'inventory') && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white">
                  {activeTab === 'inventory' ? 'My Card Inventory & Management' : 'Verified Collector Marketplace'}
                </h2>
                <p className="text-sm text-slate-400">
                  {activeTab === 'inventory'
                    ? 'Edit listings, adjust prices, or remove items from sale.'
                    : 'All cards are verified and backed by Escrow protection.'}
                </p>
              </div>

              {activeTab === 'inventory' && (
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="px-4 py-2 text-sm font-semibold rounded-lg bg-cyan-500 text-slate-950 hover:bg-cyan-400 shadow-md shadow-cyan-950/40 transition-all flex items-center gap-2"
                >
                  <span>+</span> Add New Card to Vault
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {cards
                .filter((c) => (activeTab === 'marketplace' ? c.status === 'for_sale' : true))
                .map((card) => (
                  <div
                    key={card.id}
                    className="group flex flex-col bg-slate-900/60 border border-slate-800 hover:border-cyan-500/50 rounded-2xl p-4 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-950/30"
                  >
                    <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-800/60">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 text-xs font-black tracking-wider text-rose-400 bg-rose-950/40 border border-rose-800/40 rounded">
                          {card.gradingCompany}
                        </span>
                        <span className="px-2 py-0.5 text-xs font-bold text-cyan-300 bg-cyan-950/60 border border-cyan-500/30 rounded-md">
                          {card.grade}
                        </span>
                      </div>
                      {card.status === 'vault_only' && (
                        <span className="text-[10px] uppercase font-bold text-amber-400 bg-amber-950/40 border border-amber-800/40 px-2 py-0.5 rounded">
                          Vault Only
                        </span>
                      )}
                    </div>

                    <div className="relative w-full aspect-[5/7] bg-slate-950/80 rounded-xl overflow-hidden flex items-center justify-center p-2 mb-4 border border-slate-800/80">
                      <img
                        src={card.imageUrl}
                        alt={card.name}
                        className="w-full h-full object-contain rounded drop-shadow-md group-hover:scale-105 transition-transform"
                      />
                    </div>

                    <div className="space-y-1 mb-4 flex-grow">
                      <h3 className="text-sm font-semibold text-slate-100 line-clamp-2 min-h-[2.5rem] leading-snug" title={card.name}>
                        {card.name}
                      </h3>
                      <p className="text-xs text-slate-400">
                        Seller: <span className="text-cyan-400 font-medium">@{card.seller}</span>
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-800/70 flex items-center justify-between gap-3 mt-auto">
                      <div>
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          {card.status === 'for_sale' ? 'Price' : 'Valuation'}
                        </span>
                        <span className="text-lg font-black text-white">${card.price.toLocaleString()}</span>
                      </div>

                      {activeTab === 'inventory' ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(card)}
                            className="px-2.5 py-1.5 text-xs font-semibold rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteCard(card.id)}
                            className="px-2.5 py-1.5 text-xs font-semibold rounded bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/40 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      ) : (
                        <button className="px-3.5 py-2 text-xs font-bold rounded-lg bg-emerald-500 text-slate-950 hover:bg-emerald-400 active:scale-95 transition-all shadow-md shadow-emerald-950/40">
                          Buy (Escrow)
                        </button>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

      </div>

      {/* WEBCAM MODAL */}
      {activeCameraSide && (
        <div className="fixed inset-0 bg-black/85 z-50 flex flex-col items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 flex flex-col items-center p-4 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Scan Card {activeCameraSide}
            </h3>
            <div className="w-full aspect-[4/3] rounded-xl overflow-hidden bg-black border border-slate-800">
              <Webcam
                ref={webcamRef}
                audio={false}
                screenshotFormat="image/jpeg"
                videoConstraints={{ facingMode: 'environment' }}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex gap-3 w-full">
              <button
                onClick={() => setActiveCameraSide(null)}
                className="w-1/2 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={captureWebcam}
                className="w-1/2 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-lg text-xs font-extrabold"
              >
                Capture Photo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT / CREATE CARD MODAL */}
      {(editingCard || isAddModalOpen) && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white">
                {editingCard ? 'Edit Card Details' : 'Add Card to Inventory'}
              </h3>
              <button
                onClick={() => {
                  setEditingCard(null);
                  setIsAddModalOpen(false);
                }}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={editingCard ? handleSaveEdit : handleCreateCard} className="space-y-4 text-sm">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase">Card Title</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. 1999 Base Charizard Holo #4"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase">Price ($ USD)</label>
                  <input
                    type="number"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase">Grade</label>
                  <input
                    type="text"
                    value={formData.grade}
                    onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                    placeholder="10 GM"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="for_sale">Listed for Sale on Marketplace</option>
                  <option value="vault_only">Personal Vault Only (Hidden from store)</option>
                </select>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setEditingCard(null);
                    setIsAddModalOpen(false);
                  }}
                  className="w-1/2 py-2.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 font-semibold hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}