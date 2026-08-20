import React, { useState } from 'react';

export interface CardItem {
  id: string;
  name: string;
  category: 'Sports' | 'TCG';
  gradeEstimated: number;
  centering: string;
  corners: string;
  edges: string;
  surface: string;
  imageUrl: string;
  sellerId: string;
  isListed: boolean;
  price?: number;
}

export default function App() {
  // Current active user
  const [currentUser] = useState({ id: 'user_101', name: 'Collector_One' });

  // Navigation tab state
  const [activeTab, setActiveTab] = useState<'market' | 'vault' | 'inspector'>('market');

  // Input state for listing prices
  const [listingPrices, setListingPrices] = useState<{ [cardId: string]: string }>({});

  // App database state
  const [cards, setCards] = useState<CardItem[]>([
    {
      id: 'c1',
      name: 'Charizard Base Set Unlimited #4',
      category: 'TCG',
      gradeEstimated: 8.5,
      centering: '9.0',
      corners: '8.5',
      edges: '8.0',
      surface: '8.5',
      imageUrl: 'https://images.unsplash.com/photo-1613771404784-3a5686aa2be3?w=500',
      sellerId: 'user_101', // Owned by currentUser (Listed)
      isListed: true,
      price: 450,
    },
    {
      id: 'c2',
      name: '1986 Michael Jordan Fleer #57',
      category: 'Sports',
      gradeEstimated: 9.0,
      centering: '9.5',
      corners: '9.0',
      edges: '8.5',
      surface: '9.0',
      imageUrl: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=500',
      sellerId: 'user_999', // Listed by someone else
      isListed: true,
      price: 2800,
    },
    {
      id: 'c3',
      name: 'Pikachu Illustrator Promo',
      category: 'TCG',
      gradeEstimated: 9.5,
      centering: '9.5',
      corners: '9.5',
      edges: '9.5',
      surface: '9.5',
      imageUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=500',
      sellerId: 'user_101', // Owned by currentUser (In Vault)
      isListed: false,
    },
  ]);

  // Inspection form states
  const [cardName, setCardName] = useState('');
  const [cardCategory, setCardCategory] = useState<'Sports' | 'TCG'>('TCG');
  const [cardImage, setCardImage] = useState('');

  // 1. DELIST FUNCTION: Remove card from marketplace
  const handleRemoveFromMarket = (cardId: string) => {
    setCards((prev) =>
      prev.map((c) => {
        if (c.id === cardId && c.sellerId === currentUser.id) {
          return { ...c, isListed: false, price: undefined };
        }
        return c;
      })
    );
  };

  // 2. LIST FUNCTION: Post card from vault to marketplace
  const handleListOnMarket = (cardId: string) => {
    const priceNum = parseFloat(listingPrices[cardId]);
    if (isNaN(priceNum) || priceNum <= 0) {
      alert('Please enter a valid listing price.');
      return;
    }

    setCards((prev) =>
      prev.map((c) => {
        if (c.id === cardId && c.sellerId === currentUser.id) {
          return { ...c, isListed: true, price: priceNum };
        }
        return c;
      })
    );
  };

  // 3. BUY FUNCTION: Transfer ownership to current user
  const handleBuyCard = (cardId: string) => {
    setCards((prev) =>
      prev.map((c) => {
        if (c.id === cardId) {
          return { ...c, sellerId: currentUser.id, isListed: false, price: undefined };
        }
        return c;
      })
    );
    alert('Card purchased! It has been transferred to your Vault.');
  };

  // 4. INSPECT / ADD NEW CARD FUNCTION
  const handleInspectCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardName.trim()) return;

    const simulatedGrade = (Math.floor(Math.random() * 4) + 7) + 0.5; // Random 7.5 - 10.0
    const newCard: CardItem = {
      id: 'c_' + Date.now(),
      name: cardName,
      category: cardCategory,
      gradeEstimated: simulatedGrade,
      centering: '9.0',
      corners: '8.5',
      edges: '9.0',
      surface: '9.0',
      imageUrl: cardImage || 'https://images.unsplash.com/photo-1613771404784-3a5686aa2be3?w=500',
      sellerId: currentUser.id,
      isListed: false,
    };

    setCards([newCard, ...cards]);
    setCardName('');
    setCardImage('');
    setActiveTab('vault');
  };

  const marketListings = cards.filter((c) => c.isListed);
  const userVault = cards.filter((c) => c.sellerId === currentUser.id);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900 sticky top-0 z-10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/30">
              P
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">PreGrade Pro</h1>
              <p className="text-xs text-slate-400">AI Optical Grading & Trading Exchange</p>
            </div>
          </div>

          <div className="flex gap-2 bg-slate-800/80 p-1 rounded-xl border border-slate-700">
            <button
              onClick={() => setActiveTab('market')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'market' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Marketplace ({marketListings.length})
            </button>
            <button
              onClick={() => setActiveTab('vault')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'vault' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              My Vault ({userVault.length})
            </button>
            <button
              onClick={() => setActiveTab('inspector')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'inspector' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Grade Card
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto p-6">
        {/* VIEW 1: MARKETPLACE */}
        {activeTab === 'market' && (
          <section>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-white">Active Market Listings</h2>
              <span className="text-xs text-slate-400">{marketListings.length} Cards available</span>
            </div>

            {marketListings.length === 0 ? (
              <div className="text-center py-20 border border-dashed border-slate-800 rounded-2xl bg-slate-900/50">
                <p className="text-slate-400">No cards currently listed on the marketplace.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {marketListings.map((card) => {
                  const isOwner = card.sellerId === currentUser.id;
                  return (
                    <div key={card.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col shadow-lg">
                      <div className="relative aspect-4/3 w-full bg-slate-950 overflow-hidden">
                        <img src={card.imageUrl} alt={card.name} className="w-full h-full object-cover" />
                        <div className="absolute top-2 left-2 bg-slate-950/80 backdrop-blur px-2 py-1 rounded text-[10px] font-bold uppercase text-indigo-400 border border-slate-800">
                          {card.category}
                        </div>
                        <div className="absolute top-2 right-2 bg-amber-500/90 text-slate-950 px-2 py-0.5 rounded text-xs font-black shadow">
                          GRADE {card.gradeEstimated}
                        </div>
                      </div>

                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="font-semibold text-sm line-clamp-1">{card.name}</h3>
                          <div className="flex justify-between text-[11px] text-slate-400 mt-2 bg-slate-950/50 p-2 rounded-lg border border-slate-800">
                            <span>Centering: {card.centering}</span>
                            <span>Corners: {card.corners}</span>
                            <span>Edges: {card.edges}</span>
                          </div>
                          <p className="text-xl font-bold text-emerald-400 mt-3">${card.price?.toLocaleString()}</p>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-800">
                          {isOwner ? (
                            <button
                              onClick={() => handleRemoveFromMarket(card.id)}
                              className="w-full bg-rose-600 hover:bg-rose-700 text-white font-medium py-2 rounded-xl text-xs transition active:scale-[0.98]"
                            >
                              Remove from Market
                            </button>
                          ) : (
                            <button
                              onClick={() => handleBuyCard(card.id)}
                              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded-xl text-xs transition active:scale-[0.98]"
                            >
                              Buy Card
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* VIEW 2: USER VAULT / INVENTORY */}
        {activeTab === 'vault' && (
          <section>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-white">My Card Vault</h2>
              <span className="text-xs text-slate-400">{userVault.length} Cards in your collection</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {userVault.map((card) => (
                <div key={card.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col shadow-lg">
                  <div className="relative aspect-4/3 w-full bg-slate-950 overflow-hidden">
                    <img src={card.imageUrl} alt={card.name} className="w-full h-full object-cover" />
                    <div className="absolute top-2 right-2 bg-amber-500/90 text-slate-950 px-2 py-0.5 rounded text-xs font-black shadow">
                      GRADE {card.gradeEstimated}
                    </div>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-semibold text-sm line-clamp-1">{card.name}</h3>
                      <p className="text-xs text-slate-400 mt-1">
                        Status:{' '}
                        {card.isListed ? (
                          <span className="text-emerald-400 font-semibold">Listed for ${card.price}</span>
                        ) : (
                          <span className="text-slate-500">Unlisted in Vault</span>
                        )}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800">
                      {card.isListed ? (
                        <button
                          onClick={() => handleRemoveFromMarket(card.id)}
                          className="w-full bg-rose-600 hover:bg-rose-700 text-white font-medium py-2 rounded-xl text-xs transition"
                        >
                          Delist from Marketplace
                        </button>
                      ) : (
                        <div className="flex gap-2">
                          <input
                            type="number"
                            placeholder="Price ($)"
                            value={listingPrices[card.id] || ''}
                            onChange={(e) =>
                              setListingPrices({ ...listingPrices, [card.id]: e.target.value })
                            }
                            className="w-1/2 bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                          />
                          <button
                            onClick={() => handleListOnMarket(card.id)}
                            className="w-1/2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-1.5 rounded-xl text-xs transition"
                          >
                            List for Sale
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* VIEW 3: OPTICAL GRADING INSPECTOR */}
        {activeTab === 'inspector' && (
          <section className="max-w-xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h2 className="text-lg font-bold text-white mb-1">Optical Pre-Grade Inspector</h2>
            <p className="text-xs text-slate-400 mb-6">Upload or specify a card to simulate edge, corner, and centering inspection.</p>

            <form onSubmit={handleInspectCard} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Card Name / Set</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 2003 LeBron James Topps Chrome #111"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                <select
                  value={cardCategory}
                  onChange={(e) => setCardCategory(e.target.value as 'Sports' | 'TCG')}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="TCG">TCG (Pokémon, Magic, Yu-Gi-Oh)</option>
                  <option value="Sports">Sports (Basketball, Baseball, Football)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Card Image URL</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={cardImage}
                  onChange={(e) => setCardImage(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl text-sm transition mt-4 shadow-lg shadow-indigo-600/30"
              >
                Run Optical AI Scan & Add to Vault
              </button>
            </form>
          </section>
        )}
      </main>
    </div>
  );
}
