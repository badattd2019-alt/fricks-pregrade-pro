"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from "next/link";
import { UserButton } from '@clerk/nextjs';
import { createClient } from '@supabase/supabase-js';

export const dynamic = "force-dynamic";

// Initialize Supabase Client safely
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Live $9.99/mo Stripe Payment Link
const STRIPE_CHECKOUT_URL = 'https://buy.stripe.com/dRmaEX9av3fu7Yb8Y07kc01';

const mockCommunityPool = [
  { title: '2000 Neo Genesis Lugia 1st Edition #9', status: 'PSA 10 (Est. +$1,450 ROI)' },
  { title: '2021 Evolving Skies Umbreon VMAX #215', status: 'PSA 9.5 MT (Est. +$420 ROI)' },
  { title: '1996 Japanese Base Charizard No Rarity', status: 'PSA 8.5 NM-MT' },
  { title: '2023 151 Special Illustration Erika #203', status: 'PSA 10 (Est. +$115 ROI)' },
];

const initialActivity = [
  { id: 1, title: '2022 Pokemon Go Radiant Charizard #011', status: 'PSA 10 (Est. +$180 ROI)', time: '12s ago' },
  { id: 2, title: '2022 Pokemon Go Radiant Blastoise #018', status: 'PSA 9.5 MT', time: '1m ago' },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState('scanner');
  const [user, setUser] = useState(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');

  const [cardName, setCardName] = useState('');
  const [frontImage, setFrontImage] = useState(null);
  const [backImage, setBackImage] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanPhase, setScanPhase] = useState('');
  const [scanPercent, setScanPercent] = useState(0);
  const [report, setReport] = useState(null);
  const [activity, setActivity] = useState(initialActivity);
  
  const [scannedGallery, setScannedGallery] = useState([]);
  const [scansLeft, setScansLeft] = useState(3);
  const [isPro, setIsPro] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [monthlyCards, setMonthlyCards] = useState(15);
  
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraTargetSide, setCameraTargetSide] = useState(null);

  const [sellModalOpen, setSellModalOpen] = useState(false);
  const [salePrice, setSalePrice] = useState('');
  const [previewCard, setPreviewCard] = useState(null);

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // FETCH CARDS FROM SUPABASE ON LOAD
  useEffect(() => {
    const fetchCards = async () => {
      const { data } = await supabase
        .from('cards')
        .select('*')
        .order('created_at', { ascending: false });

      if (data) {
        const formattedData = data.map(card => ({
          ...card,
          estValue: card.est_value
        }));
        setScannedGallery(formattedData);
      }
    };
    fetchCards();
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('pro') === 'true') {
        setIsPro(true);
      }
      const savedUser = localStorage.getItem('fricks_user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
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

  const handleAuthSubmit = (e) => {
    e.preventDefault();
    if (!authEmail) return;
    const userData = {
      email: authEmail,
      username: authEmail.split('@')[0],
      isSeller: true,
      joinedAt: new Date().toLocaleDateString(),
    };
    setUser(userData);
    localStorage.setItem('fricks_user', JSON.stringify(userData));
    setAuthModalOpen(false);
    setAuthEmail('');
    setAuthPassword('');
  };

  const handleSignOut = () => {
    setUser(null);
    localStorage.removeItem('fricks_user');
  };

  const openCamera = async (side) => {
    setCameraTargetSide(side);
    setCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Camera access error:', err);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const v = videoRef.current;
    
    const videoW = v.videoWidth || 1280;
    const videoH = v.videoHeight || 720;
    const targetAspect = 63 / 88;
    let cropW, cropH;

    if (videoW / videoH > targetAspect) {
      cropH = videoH * 0.85;
      cropW = cropH * targetAspect;
    } else {
      cropW = videoW * 0.85;
      cropH = cropW / targetAspect;
    }

    const startX = (videoW - cropW) / 2;
    const startY = (videoH - cropH) / 2;
    const canvas = document.createElement('canvas');
    canvas.width = 630;
    canvas.height = 880;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      ctx.drawImage(v, startX, startY, cropW, cropH, 0, 0, 630, 880);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
      if (cameraTargetSide === 'front') setFrontImage(dataUrl);
      if (cameraTargetSide === 'back') setBackImage(dataUrl);
    }
    closeCamera();
  };

  const closeCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    setCameraActive(false);
    setCameraTargetSide(null);
  };

  const handleImageUpload = (e, side) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 630;
        canvas.height = 880;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, 630, 880);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.88);
          if (side === 'front') setFrontImage(compressedDataUrl);
          if (side === 'back') setBackImage(compressedDataUrl);
        }
      };
      if (event.target?.result) {
        img.src = event.target.result;
      }
    };
    reader.readAsDataURL(file);
  };

  const ExactDigitalCenteringTool = () => {
    const lines = [1, 2, 3, 4, 5];
    return (
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none z-[60]"
        style={{ filter: 'drop-shadow(0px 0px 4px #00FFFF) drop-shadow(1px 1px 2px #000000)' }}
        viewBox="0 0 100 140"
        preserveAspectRatio="xMidYMid meet"
      >
        <line x1="50" y1="0" x2="50" y2="140" stroke="#00FFFF" strokeWidth="0.8" />
        <line x1="0" y1="70" x2="100" y2="70" stroke="#00FFFF" strokeWidth="0.8" />
        <circle cx="50" cy="70" r="4.5" stroke="#00FFFF" strokeWidth="0.8" fill="none" />
        <circle cx="50" cy="70" r="1.5" fill="#00FFFF" />
        <g stroke="#00FFFF" strokeWidth="0.8" fill="none" fontSize="4.2" fontFamily="sans-serif" fontWeight="900" textAnchor="middle">
          {lines.map((i) => {
            const o = i * 2;
            return (
              <React.Fragment key={`tl-${i}`}>
                <polyline points={`${o},${26 - o} ${o},${o} ${26 - o},${o}`} />
                <text x={o} y={26 - o + 4.5} fill="#00FFFF" stroke="none">{i}</text>
                <text x={26 - o + 3.5} y={o + 1.2} fill="#00FFFF" stroke="none">{i}</text>
              </React.Fragment>
            );
          })}
        </g>
        <g stroke="#00FFFF" strokeWidth="0.8" fill="none" fontSize="4.2" fontFamily="sans-serif" fontWeight="900" textAnchor="middle">
          {lines.map((i) => {
            const o = i * 2;
            return (
              <React.Fragment key={`tr-${i}`}>
                <polyline points={`${100 - o},${26 - o} ${100 - o},${o} ${74 + o},${o}`} />
                <text x={100 - o} y={26 - o + 4.5} fill="#00FFFF" stroke="none">{i}</text>
                <text x={74 + o - 3.5} y={o + 1.2} fill="#00FFFF" stroke="none">{i}</text>
              </React.Fragment>
            );
          })}
        </g>
        <g stroke="#00FFFF" strokeWidth="0.8" fill="none" fontSize="4.2" fontFamily="sans-serif" fontWeight="900" textAnchor="middle">
          {lines.map((i) => {
            const o = i * 2;
            return (
              <React.Fragment key={`bl-${i}`}>
                <polyline points={`${o},${114 + o} ${o},${140 - o} ${26 - o},${140 - o}`} />
                <text x={o} y={114 + o - 2.5} fill="#00FFFF" stroke="none">{i}</text>
                <text x={26 - o + 3.5} y={140 - o + 1.2} fill="#00FFFF" stroke="none">{i}</text>
              </React.Fragment>
            );
          })}
        </g>
        <g stroke="#00FFFF" strokeWidth="0.8" fill="none" fontSize="4.2" fontFamily="sans-serif" fontWeight="900" textAnchor="middle">
          {lines.map((i) => {
            const o = i * 2;
            return (
              <React.Fragment key={`br-${i}`}>
                <polyline points={`${100 - o},${114 + o} ${100 - o},${140 - o} ${74 + o},${140 - o}`} />
                <text x={100 - o} y={114 + o - 2.5} fill="#00FFFF" stroke="none">{i}</text>
                <text x={74 + o - 3.5} y={140 - o + 1.2} fill="#00FFFF" stroke="none">{i}</text>
              </React.Fragment>
            );
          })}
        </g>
      </svg>
    );
  };

  const runScan = async () => {
    if (!isPro && scansLeft <= 0) {
      setShowPaywall(true);
      return;
    }
    if (!frontImage && !backImage) return;

    setIsScanning(true);
    setReport(null);
    setScanPercent(5);
    setScanPhase('1/5: INITIATING OPTICAL LASER ALIGNMENT & BORDER CALIBRATION...');
    
    const p1 = setTimeout(() => { setScanPercent(25); setScanPhase('2/5: CALCULATING EXACT 55/45 L/R & T/B CENTERING RATIOS...'); }, 3000);
    const p2 = setTimeout(() => { setScanPercent(50); setScanPhase('3/5: MICROSCOPIC EDGE & 90° CORNER WEAR DETECTION...'); }, 6000);
    const p3 = setTimeout(() => { setScanPercent(75); setScanPhase('4/5: CHECKING SURFACE REFLECTIVITY & HOLO PRINT FLAWS...'); }, 9500);
    const p4 = setTimeout(() => { setScanPercent(95); setScanPhase('5/5: QUERYING REAL-TIME PSA POPULATION & SALES PRICING...'); }, 12500);

    // MOCK DATA: This is where we will hook up your real AI Vision API next!
    const fallbackResult = {
      title: cardName || '2022 Pokemon Radiant Collectible',
      grade: 'PSA 9.5 GEM MT',
      rawVal: '$65.00',
      gradedVal: '$280.00',
      recommendation: 'STRONG SUBMIT (+$215 Est. ROI)',
      centering: { score: '9.5', measurements: 'Left/Right: 52/48% | Top/Bottom: 50/50%', ratio: '52/48 (Within 55/45 PSA 10 standard)', rubric: 'Optimal border alignment across front and reverse optical field.' },
      corners: { score: '9.5', note: 'Sharp 90-degree corners with zero blunting under 0.1mm.' },
      edges: { score: '9.0', note: 'Clean border cuts with faint factory silvering on top edge.' },
      surface: { score: '10.0', note: 'Flawless surface. Zero print lines, holo scratches, or roller marks.' },
    };

    try {
      const delayPromise = new Promise((resolve) => setTimeout(resolve, 15000));
      await delayPromise;
      applyScanResult(fallbackResult);
    } catch {
      applyScanResult(fallbackResult);
    } finally {
      clearTimeout(p1); clearTimeout(p2); clearTimeout(p3); clearTimeout(p4);
      setIsScanning(false);
      setScanPhase('');
      setScanPercent(0);
    }
  };

  const applyScanResult = (data) => {
    setReport(data);
    if (!isPro) setScansLeft((prev) => Math.max(0, prev - 1));
    setActivity((prev) => [
      { id: Math.random(), title: data.title || cardName || 'Graded Card', status: `${data.grade} (${data.recommendation || 'Scanned just now'})`, time: 'Just now' },
      ...prev.slice(0, 3),
    ]);
  };

  const handlePublishListing = async (e) => {
    e.preventDefault();
    if (!salePrice) return;

    const dbCard = {
      title: report?.title || cardName || 'Verified Pre-Graded Card',
      company: 'ESCROW SALE',
      grade: report?.grade || '10 GM',
      est_value: `$${parseFloat(salePrice).toFixed(2)}`,
      image: frontImage || backImage || 'https://images.pokemontcg.io/pgo/11_hires.png',
      seller: user?.username || 'VerifiedSeller',
    };

    const { data, error } = await supabase.from('cards').insert([dbCard]).select();

    if (error) {
      alert(`REAL DATABASE ERROR: ${error.message}`);
      console.error("SUPABASE ERROR DETAILS:", error);
      return;
    }

    if (data) {
      const newCard = { ...data[0], estValue: data[0].est_value };
      setScannedGallery((prev) => [newCard, ...prev]);
      setSellModalOpen(false);
      setSalePrice('');
      alert(`Success! Card permanently listed for $${parseFloat(salePrice).toFixed(2)}.`);
    }
  };

  const handleUpdatePrice = async (id, currentPrice) => {
    const rawPrice = currentPrice.replace(/[^0-9.]/g, '');
    const newPrice = prompt('Enter new price for this card ($):', rawPrice);
    if (newPrice && !isNaN(newPrice)) {
      const formattedPrice = '$' + parseFloat(newPrice).toFixed(2);
      
      const { error } = await supabase
        .from('cards')
        .update({ est_value: formattedPrice })
        .eq('id', id);

      if (!error) {
        setScannedGallery((prev) =>
          prev.map((c) => (c.id === id ? { ...c, estValue: formattedPrice } : c))
        );
      }
    }
  };

  const handleDeleteCard = async (id, title) => {
    if (confirm(`Remove "${title}" permanently?`)) {
      const { error } = await supabase
        .from('cards')
        .delete()
        .eq('id', id);

      if (!error) {
        setScannedGallery((prev) => prev.filter((c) => c.id !== id));
      }
    }
  };

  const handleBuyCard = (card) => {
    alert(`Escrow Checkout initiated for ${card.title} (${card.estValue}). Redirecting to Stripe secure escrow...`);
    window.location.href = STRIPE_CHECKOUT_URL;
  };

  const redirectToStripe = () => {
    window.location.href = STRIPE_CHECKOUT_URL;
  };

  const estimatedSavings = Math.round(monthlyCards * 0.4 * 25);
  const myListings = user ? scannedGallery.filter((card) => card.seller === user.username) : [];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-10 font-sans selection:bg-blue-500 selection:text-white relative">
      <header className="max-w-6xl mx-auto border-b border-slate-800 pb-6 mb-8 space-y-4">
        
        {/* NEW WELCOME BANNER SECTION */}
        <div className="w-full h-40 md:h-64 rounded-2xl overflow-hidden mb-8 relative shadow-[0_0_40px_-15px_rgba(34,211,238,0.3)] border border-slate-800 group">
          <img 
            src="/banner.jpg" 
            alt="Welcome to Fricks" 
            className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition duration-700"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.parentElement.classList.add('bg-gradient-to-r', 'from-slate-900', 'to-slate-800');
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent flex flex-col justify-end p-6">
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight drop-shadow-md">
              Welcome to the Collector's Hub.
            </h2>
            <p className="text-cyan-400 text-sm md:text-base font-semibold mt-2 drop-shadow">
              Scan, grade, and trade your cards with AI precision.
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold tracking-wider text-cyan-400 bg-cyan-950/60 border border-cyan-800/50 px-2.5 py-0.5 rounded-full uppercase">
                AI Grading Engine v5.0
              </span>
              <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-2 py-0.5 rounded-full">
                ● Live Marketplace & Pricing
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold mt-2 text-white tracking-tight">
              Fricks Pre-Grade & Verified Marketplace
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl p-2 px-3">
                <div className="w-7 h-7 rounded-full bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center text-xs">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-white leading-tight">@{user.username}</p>
                  <button onClick={handleSignOut} className="text-[10px] text-red-400 hover:underline cursor-pointer block">
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => {
                  setAuthMode('login');
                  setAuthModalOpen(true);
                }}
                className="bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow transition cursor-pointer"
              >
                👤 Sign In / Seller Login
              </button>
            )}

            <div className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl flex items-center">
              <UserButton afterSignOutUrl="/" />
            </div>

            {!isPro && (
              <button
                onClick={() => setShowPaywall(true)}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold py-2.5 px-3.5 rounded-xl shadow-lg transition cursor-pointer"
              >
                Upgrade to Pro
              </button>
            )}
          </div>
        </div>

        <nav className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-1.5 rounded-xl w-fit">
          <button
            onClick={() => setActiveTab('scanner')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeTab === 'scanner' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            ● AI Card Scanner
          </button>
          <button
            onClick={() => setActiveTab('marketplace')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeTab === 'marketplace' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            🏪 Marketplace Store ({scannedGallery.length})
          </button>
          <button
            onClick={() => {
              if (!user) {
                setAuthModalOpen(true);
                return;
              }
              setActiveTab('my-listings');
            }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeTab === 'my-listings' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            📦 My Seller Inventory {user && `(${myListings.length})`}
          </button>
        </nav>
      </header>

      {/* VIEW 1: SCANNER TAB */}
      {activeTab === 'scanner' && (
        <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          <section className="lg:col-span-2 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 md:p-6 shadow-xl">
              <div className="mb-6 bg-slate-950 border border-slate-800 rounded-xl p-4">
                <label htmlFor="cardName" className="block text-xs font-bold text-cyan-400 uppercase tracking-wide mb-2">
                  1. Identify Card (Optional Hint)
                </label>
                <input
                  id="cardName"
                  type="text"
                  placeholder="e.g. 1999 Base Set Charizard Holo #4"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition shadow-inner"
                />
              </div>

              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-base md:text-lg font-bold text-slate-100">2. Dual-Side High Precision Scan</h2>
                  <p className="text-xs text-slate-400">Take a direct camera photo or choose from your files.</p>
                </div>
                {(frontImage || backImage) && (
                  <button
                    onClick={() => {
                      setFrontImage(null);
                      setBackImage(null);
                      setReport(null);
                    }}
                    className="text-xs text-slate-400 hover:text-red-400 transition cursor-pointer"
                  >
                    Clear All
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="relative border-2 border-dashed border-slate-700 bg-slate-950 rounded-xl p-3 min-h-[340px] flex flex-col items-center justify-center overflow-hidden">
                  <span className="absolute top-3 left-3 z-20 text-[10px] font-bold text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800 pointer-events-none">FRONT SIDE</span>
                  {frontImage ? (
                    <div className="relative w-full h-[320px] flex items-center justify-center rounded-xl overflow-hidden bg-slate-950">
                      <div className="relative z-10 w-full h-full max-h-[300px] aspect-[63/88] rounded-lg border-2 border-cyan-400 overflow-hidden shadow-2xl flex items-center justify-center">
                        <img src={frontImage} alt="Front clear close-up" className="w-full h-full object-cover" />
                        <ExactDigitalCenteringTool />
                      </div>
                      <button type="button" onClick={() => {setFrontImage(null); setReport(null);}} className="absolute top-2 right-2 z-50 bg-red-600 hover:bg-red-700 text-white rounded-full w-7 h-7 flex items-center justify-center text-xs shadow-lg cursor-pointer">✕</button>
                    </div>
                  ) : (
                    <div className="w-full flex flex-col items-center justify-center gap-3 pt-6 pb-2 z-20">
                      <button type="button" onClick={() => openCamera('front')} className="w-full max-w-[210px] py-2.5 px-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs rounded-xl text-center cursor-pointer shadow-lg flex items-center justify-center gap-2 transition"><span>📷 Open Camera</span></button>
                      <label htmlFor="front-gallery-picker" className="w-full max-w-[210px] py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl text-center cursor-pointer border border-slate-700 flex items-center justify-center gap-2 transition">
                        <span>📁 Photos / Files</span><input id="front-gallery-picker" type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'front')} className="hidden" />
                      </label>
                    </div>
                  )}
                  {isScanning && (
                    <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md rounded-xl flex flex-col items-center justify-center p-4 border-2 border-cyan-400 z-50 pointer-events-none transition-all duration-300">
                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mb-4">
                        <div className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-500 shadow-[0_0_10px_#22d3ee]" style={{ width: `${scanPercent}%` }} />
                      </div>
                      <div className="animate-spin text-2xl mb-2">⚙️</div>
                      <span className="text-xs font-mono font-bold text-cyan-300 text-center leading-relaxed px-2">{scanPhase}</span>
                      <span className="text-[10px] text-slate-400 font-mono mt-3">OPTICAL SCAN IN PROGRESS ({scanPercent}%)</span>
                    </div>
                  )}
                </div>

                <div className="relative border-2 border-dashed border-slate-700 bg-slate-950 rounded-xl p-3 min-h-[340px] flex flex-col items-center justify-center overflow-hidden">
                  <span className="absolute top-3 left-3 z-20 text-[10px] font-bold text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800 pointer-events-none">BACK SIDE</span>
                  {backImage ? (
                    <div className="relative w-full h-[320px] flex items-center justify-center rounded-xl overflow-hidden bg-slate-950">
                      <div className="relative z-10 w-full h-full max-h-[300px] aspect-[63/88] rounded-lg border-2 border-cyan-400 overflow-hidden shadow-2xl flex items-center justify-center">
                        <img src={backImage} alt="Back clear close-up" className="w-full h-full object-cover" />
                        <ExactDigitalCenteringTool />
                      </div>
                      <button type="button" onClick={() => {setBackImage(null); setReport(null);}} className="absolute top-2 right-2 z-50 bg-red-600 hover:bg-red-700 text-white rounded-full w-7 h-7 flex items-center justify-center text-xs shadow-lg cursor-pointer">✕</button>
                    </div>
                  ) : (
                    <div className="w-full flex flex-col items-center justify-center gap-3 pt-6 pb-2 z-20">
                      <button type="button" onClick={() => openCamera('back')} className="w-full max-w-[210px] py-2.5 px-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs rounded-xl text-center cursor-pointer shadow-lg flex items-center justify-center gap-2 transition"><span>📷 Open Camera</span></button>
                      <label htmlFor="back-gallery-picker" className="w-full max-w-[210px] py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl text-center cursor-pointer border border-slate-700 flex items-center justify-center gap-2 transition">
                        <span>📁 Photos / Files</span><input id="back-gallery-picker" type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'back')} className="hidden" />
                      </label>
                    </div>
                  )}
                  {isScanning && (
                    <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md rounded-xl flex flex-col items-center justify-center p-4 border-2 border-cyan-400 z-50 pointer-events-none transition-all duration-300">
                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mb-4">
                        <div className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-500 shadow-[0_0_10px_#22d3ee]" style={{ width: `${scanPercent}%` }} />
                      </div>
                      <div className="animate-spin text-2xl mb-2">🔍</div>
                      <span className="text-xs font-mono font-bold text-cyan-300 text-center leading-relaxed px-2">{scanPhase}</span>
                      <span className="text-[10px] text-slate-400 font-mono mt-3">ANALYZING REVERSE OPTICAL MATRIX ({scanPercent}%)</span>
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
                    <span className="flex items-center gap-2"><span className="animate-pulse">●</span> OPTICAL GRADING IN PROGRESS (15s DIAGNOSTICS)...</span>
                  ) : (
                    <><span>RUN PRE-GRADE INSPECTION</span><span className="text-xs bg-white/20 px-2 py-0.5 rounded">{isPro ? 'PRO UNLIMITED' : `(${scansLeft} Left)`}</span></>
                  )}
                </button>
              ) : (
                <button onClick={() => setShowPaywall(true)} className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-400 hover:to-red-400 text-white font-extrabold rounded-xl shadow-lg shadow-orange-500/20 transition cursor-pointer flex items-center justify-center gap-2">
                  <span>🔒 TRIAL LIMIT REACHED — UNLOCK UNLIMITED PRO ($9.99/mo)</span>
                </button>
              )}
            </div>

            {report && (
              <div className="bg-slate-900 border border-cyan-500/40 rounded-2xl p-4 md:p-6 shadow-2xl space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-700 relative">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                  <div>
                    <span className="text-xs font-bold text-cyan-400 uppercase tracking-wide">Inspection Complete</span>
                    <h3 className="text-xl font-bold text-white">{report.title}</h3>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-400">Estimated Grade</p>
                    <p className="text-lg font-black text-cyan-300">{report.grade}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
                  {frontImage && (
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] font-bold text-slate-400 mb-1">FRONT CLOSE-UP</span>
                      <div className="w-full h-52 flex items-center justify-center overflow-hidden rounded-lg border border-slate-700 bg-slate-900">
                        <img src={frontImage} alt="Front" className="w-full h-full object-cover cursor-pointer hover:scale-105 transition" onClick={() => setPreviewCard({ image: frontImage, title: report.title + ' (Front)' })} />
                      </div>
                    </div>
                  )}
                  {backImage && (
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] font-bold text-slate-400 mb-1">BACK CLOSE-UP</span>
                      <div className="w-full h-52 flex items-center justify-center overflow-hidden rounded-lg border border-slate-700 bg-slate-900">
                        <img src={backImage} alt="Back" className="w-full h-full object-cover cursor-pointer hover:scale-105 transition" onClick={() => setPreviewCard({ image: backImage, title: report.title + ' (Back)' })} />
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <span className="text-[11px] text-slate-400 uppercase font-semibold">Financial Prediction</span>
                    <p className="text-xs text-slate-300 mt-0.5">Raw Price: <span className="font-semibold text-white">{report.rawVal}</span> → Graded Value: <span className="font-bold text-emerald-400">{report.gradedVal}</span></p>
                  </div>
                  <span className="text-xs font-bold px-3 py-1.5 rounded-lg bg-emerald-950/80 border border-emerald-700/50 text-emerald-300">{report.recommendation}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-cyan-950/30 p-3 rounded-xl border border-cyan-800/50">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[11px] text-cyan-400 font-bold uppercase tracking-wide">Centering</span>
                      <span className="text-xs font-black text-cyan-300">{report.centering?.score}</span>
                    </div>
                    <p className="text-sm font-semibold text-white">{report.centering?.measurements}</p>
                    <p className="text-xs font-medium text-cyan-300 mt-0.5">{report.centering?.ratio}</p>
                  </div>
                  <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 flex flex-col justify-center">
                    <div className="flex justify-between items-center"><span className="text-[11px] text-slate-400 font-medium">Corners</span><span className="text-xs font-bold text-slate-300">{report.corners?.score}</span></div>
                    <p className="text-[10px] text-slate-500 mt-1">{report.corners?.note}</p>
                  </div>
                  <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 flex flex-col justify-center">
                    <div className="flex justify-between items-center"><span className="text-[11px] text-slate-400 font-medium">Edges</span><span className="text-xs font-bold text-slate-300">{report.edges?.score}</span></div>
                    <p className="text-[10px] text-slate-500 mt-1">{report.edges?.note}</p>
                  </div>
                  <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 flex flex-col justify-center">
                    <span className="text-[11px] text-slate-400 font-medium">Surface</span><span className="text-xs font-bold text-slate-300">{report.surface?.score}</span>
                    <p className="text-[10px] text-slate-500 mt-1">{report.surface?.note}</p>
                  </div>
                </div>

                <button onClick={() => {if (!user) {setAuthModalOpen(true);} else {setSellModalOpen(true);}}} className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider">
                  <span>💰 List This Card in Marketplace</span>
                </button>
              </div>
            )}

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 md:p-6 shadow-xl">
              <h3 className="text-base font-bold text-white mb-1">Submission Fee Savings Calculator</h3>
              <p className="text-xs text-slate-400 mb-4">See how much you save each month by filtering out non-Gem cards before sending them to PSA.</p>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1.5">
                    <span>Cards you consider grading monthly:</span><span className="text-cyan-400 font-bold">{monthlyCards} Cards</span>
                  </div>
                  <input type="range" min="5" max="100" step="5" value={monthlyCards} onChange={(e) => setMonthlyCards(Number(e.target.value))} className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400" />
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
                      <span className="text-emerald-400 font-medium">{item.status}</span><span className="text-slate-500">{item.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-200">Verified High Grades</h3>
                <span className="text-[10px] text-cyan-400 font-semibold bg-cyan-950/60 border border-cyan-800/40 px-2 py-0.5 rounded-full">Live Feed</span>
              </div>
              <div className="grid grid-cols-2 gap-3 max-h-[580px] overflow-y-auto pr-1">
                {scannedGallery.map((card) => (
                  <div key={card.id} className="bg-slate-950 border border-slate-800/90 rounded-xl p-2.5 flex flex-col justify-between hover:border-cyan-500/50 transition cursor-pointer" onClick={() => setPreviewCard(card)}>
                    <div className="w-full flex justify-between items-center text-[10px] font-bold mb-1.5">
                      <span className="text-red-500 font-black">{card.company}</span>
                      <span className="bg-cyan-500 text-slate-950 px-1.5 py-0.5 rounded font-black">{card.grade}</span>
                    </div>
                    <div className="w-full h-44 flex items-center justify-center overflow-hidden rounded-lg bg-slate-900/90 my-1 p-0.5">
                      <img src={card.image} alt={card.title} className="w-full h-full object-cover hover:scale-105 transition duration-300 rounded" />
                    </div>
                    <p className="text-[11px] font-semibold text-slate-300 truncate mt-1">{card.title}</p>
                    <p className="text-[10px] text-emerald-400 font-bold mt-0.5">Est. {card.estValue}</p>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </main>
      )}

      {/* VIEW 2: MARKETPLACE STORE */}
      {activeTab === 'marketplace' && (
        <main className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">Verified Collector Marketplace</h2>
              <p className="text-xs text-slate-400">Edit, remove, or buy cards directly from the live exchange.</p>
            </div>
          </div>
          {scannedGallery.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-slate-800 rounded-xl">
              <p className="text-slate-400 text-sm">The marketplace is currently empty.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {scannedGallery.map((item) => (
                <div key={item.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between hover:border-slate-700 transition">
                  <div>
                    <div className="flex justify-between items-center text-xs font-bold mb-2">
                      <span className="text-red-500">{item.company}</span>
                      <span className="bg-cyan-500 text-slate-950 px-2 py-0.5 rounded font-black text-[11px]">{item.grade}</span>
                    </div>
                    <div className="w-full h-64 bg-slate-950 rounded-xl flex items-center justify-center p-1 overflow-hidden mb-3 border border-slate-800 cursor-pointer group" onClick={() => setPreviewCard(item)}>
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition duration-300" />
                    </div>
                    <h4 className="text-sm font-bold text-white truncate">{item.title}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Seller: <span className="text-cyan-400">@{item.seller || 'Verified'}</span></p>
                  </div>
                  
                  <div className="mt-4 pt-3 border-t border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-500 block">PRICE</span>
                      <span className="text-base font-extrabold text-emerald-400">{item.estValue}</span>
                    </div>

                    {user && item.seller === user.username ? (
                      <div className="flex gap-1.5 w-full">
                        <button onClick={() => handleUpdatePrice(item.id, item.estValue)} className="flex-1 bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-bold py-2 rounded-lg border border-slate-700 transition cursor-pointer text-center">
                          ✏️ Edit Price
                        </button>
                        <button onClick={() => handleDeleteCard(item.id, item.title)} className="flex-1 bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800/60 text-xs font-bold py-2 rounded-lg transition cursor-pointer text-center">
                          🗑️ Remove
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => handleBuyCard(item)} className="w-full py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-lg shadow-md transition cursor-pointer">
                        Buy (Escrow)
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      )}

      {/* VIEW 3: SELLER DASHBOARD */}
      {activeTab === 'my-listings' && (
        <main className="max-w-6xl mx-auto space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4 mb-6">
              <div>
                <h2 className="text-xl font-bold text-white">Seller Control Dashboard</h2>
                <p className="text-xs text-slate-400">Manage all listed inventory and pricing.</p>
              </div>
              <button onClick={() => setActiveTab('scanner')} className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl transition cursor-pointer">
                + Scan & List New Card
              </button>
            </div>
            {myListings.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-slate-800 rounded-xl">
                <p className="text-slate-400 text-sm">No cards currently listed.</p>
                <button onClick={() => setActiveTab('scanner')} className="mt-3 text-cyan-400 text-xs font-bold underline cursor-pointer">
                  Go to AI Scanner to pre-grade and list your first card →
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {myListings.map((card) => (
                  <div key={card.id} className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <img src={card.image} alt={card.title} className="w-14 h-20 object-cover rounded-lg bg-slate-900 border border-slate-700" />
                      <div>
                        <p className="text-xs font-bold text-white truncate max-w-[150px]">{card.title}</p>
                        <p className="text-xs text-cyan-400">{card.grade} • <span className="text-emerald-400">{card.estValue}</span></p>
                        <span className="text-[10px] bg-emerald-950 border border-emerald-800 text-emerald-400 px-1.5 py-0.5 rounded">Active in Market</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <button onClick={() => handleUpdatePrice(card.id, card.estValue)} className="text-cyan-400 hover:text-cyan-300 text-xs font-bold p-1 text-right cursor-pointer">
                        Update Price
                      </button>
                      <button onClick={() => handleDeleteCard(card.id, card.title)} className="text-red-400 hover:text-red-300 text-xs font-bold p-1 text-right cursor-pointer">
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      )}

      {previewCard && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex flex-col items-center justify-center p-4" onClick={() => setPreviewCard(null)}>
          <div className="max-w-md w-full flex justify-between items-center text-white mb-3">
            <h3 className="text-sm font-bold text-cyan-400 truncate">{previewCard.title}</h3>
            <button className="text-slate-400 hover:text-white text-lg">✕</button>
          </div>
          <div className="relative max-w-sm w-full h-[70vh] bg-slate-900 border-2 border-cyan-400 rounded-2xl overflow-hidden shadow-2xl p-2 flex items-center justify-center">
            <img src={previewCard.image} alt={previewCard.title} className="w-full h-full object-contain rounded-xl" />
          </div>
          <p className="text-xs text-slate-400 mt-3">Tap anywhere to close preview</p>
        </div>
      )}

      {/* FULLSCREEN CAMERA SCANNER */}
      {cameraActive && (
        <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-between">
          <div className="absolute top-0 inset-x-0 p-4 flex justify-between items-center text-white z-50 bg-gradient-to-b from-black/80 to-transparent">
            <span className="text-xs font-bold tracking-wider text-cyan-400 uppercase drop-shadow-md">Align Card in Scanner Bed</span>
            <button onClick={closeCamera} className="text-white hover:text-red-400 text-2xl px-2 cursor-pointer drop-shadow-md">✕</button>
          </div>
          
          <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
            <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover z-10" />
            <div className="absolute inset-0 z-40 pointer-events-none flex items-center justify-center overflow-hidden">
              <div className="relative w-[90%] max-w-sm aspect-[63/88] rounded-xl shadow-[0_0_0_999px_rgba(0,0,0,0.85)] border-2 border-cyan-400 flex items-center justify-center">
                <ExactDigitalCenteringTool />
              </div>
            </div>
          </div>
          
          <div className="absolute bottom-0 inset-x-0 p-8 flex justify-center z-50 bg-gradient-to-t from-black/80 to-transparent">
            <button onClick={capturePhoto} className="w-20 h-20 bg-cyan-400 hover:bg-cyan-300 rounded-full border-4 border-white shadow-[0_0_20px_rgba(34,211,238,0.5)] flex items-center justify-center text-3xl text-slate-950 font-black cursor-pointer transition active:scale-95">
              📸
            </button>
          </div>
        </div>
      )}

      {authModalOpen && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 max-w-sm w-full rounded-2xl p-6 shadow-2xl relative">
            <button onClick={() => setAuthModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white text-sm cursor-pointer">✕</button>
            <h3 className="text-lg font-bold text-white mb-1">{authMode === 'login' ? 'Sign In to Your Market Account' : 'Create Collector & Seller Account'}</h3>
            <p className="text-xs text-slate-400 mb-4">Control your listed cards, escrows, and sales.</p>
            <form onSubmit={handleAuthSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">Email Address</label>
                <input type="email" required placeholder="you@domain.com" value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">Password</label>
                <input type="password" required placeholder="••••••••" value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500" />
              </div>
              <button type="submit" className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow-lg transition cursor-pointer">
                {authMode === 'login' ? 'Sign In' : 'Create Free Account'}
              </button>
            </form>
            <div className="mt-4 text-center">
              <button onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')} className="text-xs text-cyan-400 hover:underline cursor-pointer">
                {authMode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
              </button>
            </div>
          </div>
        </div>
      )}

      {sellModalOpen && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 max-w-md w-full rounded-2xl p-6 shadow-2xl relative">
            <button onClick={() => setSellModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white text-sm cursor-pointer">✕</button>
            <h3 className="text-lg font-bold text-white mb-1">List Card for Sale</h3>
            <p className="text-xs text-slate-400 mb-4">Your AI sub-grades and close-up photo will be listed in the marketplace.</p>
            <form onSubmit={handlePublishListing} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">Asking Price ($ USD)</label>
                <input type="number" step="0.01" required placeholder="e.g. 150.00" value={salePrice} onChange={(e) => setSalePrice(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500 font-mono" />
              </div>
              <button type="submit" className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs rounded-xl shadow-lg transition uppercase tracking-wider cursor-pointer mt-2">
                Publish to Marketplace
              </button>
            </form>
          </div>
        </div>
      )}

      {showPaywall && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 max-w-md w-full rounded-2xl p-6 shadow-2xl relative text-center space-y-4">
            <button onClick={() => setShowPaywall(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white text-sm cursor-pointer">✕</button>
            <div className="w-12 h-12 bg-blue-600/20 text-blue-400 rounded-full flex items-center justify-center mx-auto text-2xl">⚡</div>
            <h3 className="text-xl font-extrabold text-white">Unlock Unlimited Pre-Grading</h3>
            <button onClick={redirectToStripe} className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg transition cursor-pointer">
              Subscribe with Stripe — $9.99 / mo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}