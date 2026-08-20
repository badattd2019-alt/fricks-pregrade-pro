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
  price: number;
}

export default function FricksPreGradeApp() {
  // Current logged-in user
  const [currentUser] = useState({ id: 'seller_01', name: 'Collector_One' });

  // Navigation tab state
  const [activeTab, setActiveTab] = useState<'scanner' | 'market' | 'inventory'>('market');

  // Editing state for updating listed prices
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [editPriceInput, setEditPriceInput] = useState<string>('');

  // Initial Card Store
  const [cards, setCards] = useState<CardItem[]>([
    {
      id: 'card-101',
      name: '1999 Base Set Charizard Holo #4',
      category: 'TCG',
      gradeEstimated: 8.5,
      centering: '9.0',
      corners: '8.5',
      edges: '8.0',
      surface: '8.5',
      imageUrl: 'https://images.unsplash.com/photo-1613771404784-3a5686aa2be3?w=500',
      sellerId: 'seller_01', // Owned by currentUser
      isListed: true,
      price: 450,
    },
    {
      id: 'card-102',
      name: '2022 Pokemon Go Radiant Charizard #011',
      category: 'TCG',
      gradeEstimated: 10,
      centering: '10.0',
      corners: '9.5',
      edges: '10.0',
      surface: '10.0',
      imageUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=500',
      sellerId: 'seller_999', // Listed by someone else
      isListed: true,
      price: 210,
    },
    {
      id: 'card-103',
      name: '1986 Michael Jordan Fleer #57',
      category: 'Sports',
      gradeEstimated: 9.0,
      centering: '9.5',
      corners: '9.0',
      edges: '8.5',
      surface: '9.0',
      imageUrl: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=500',
      sellerId: 'seller_01',
      isListed: false,
      price: 1500,
    },
  ]);

  // Temporary price inputs for listing unlisted cards
  const [listingInputs, setListingInputs] = useState<{ [cardId: string]: string }>({});

  // 1. REMOVE FROM MARKET (DELIST)
  const handleRemoveFromMarket = (cardId: string) => {
    setCards((prev) =>
      prev.map((card) => {
        if (card.id === cardId && card.sellerId === currentUser.id) {
          return { ...card, isListed: false };
        }
        return card;
      })
    );
  };

  // 2. START EDITING LISTED PRICE
  const handleStartEditing = (card: CardItem) => {
    setEditingCardId(card.id);
    setEditPriceInput(card.price.toString());
  };

  // 3. SAVE UPDATED PRICE
  const handleSaveUpdatedPrice = (cardId: string) => {
    const newPrice = parseFloat(editPriceInput);
    if (isNaN(newPrice) || newPrice <= 0) {
      alert('Please enter a valid price amount.');
      return;
    }

    setCards((prev) =>
      prev.map((card) => {
        if (card.id === cardId && card.sellerId === currentUser.id) {
          return { ...card, price: newPrice };
        }
        return card;
      })
    );

    setEditingCardId(null);
    setEditPriceInput('');
  };

  // 4. LIST CARD FROM INVENTORY
  const handleListCard = (cardId: string) => {
    const priceNum = parseFloat(listingInputs[cardId]);
    if (isNaN(priceNum) || priceNum <= 0) {
      alert('Please enter a valid price to list.');
      return;
    }

    setCards((prev) =>
      prev.map((card) => {
        if (card.id === cardId && card.sellerId === currentUser.id) {
          return { ...card, isListed: true, price: priceNum };
        }
        return card;
      })
    );
  };

  // 5. BUY CARD
  const handleBuyCard = (cardId: string) => {
    setCards((prev) =>
      prev.map((card) => {
        if (card.id === cardId) {
          return { ...card, sellerId: currentUser.id, isListed: false };
        }
        return card;
      })
    );
    alert('Card purchased! It is now stored in your Seller Inventory.');
  };

  const marketListings = cards.filter((c) => c.isListed);
  const sellerInventory = cards.filter((c) => c.sellerId === currentUser.id);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Header Navigation */}
      <header className="border-b border-slate-800 bg-slate-900 px-6 py-4 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto flex flex-wrap justify-between items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-indigo-900/60 text-indigo-400 font-semibold px-2 py-0.5 rounded border border-indigo-700/50">
                AI GRADING ENGINE V5.0
              </span>
              <span className="text-xs text-emerald-400 font-medium">● Live Marketplace & Pricing</span>
            </div>
            <h1 className="text-xl font-bold text-white mt-1">Fricks Pre-Grade & Verified Marketplace</h1>
          </div>

          <div className="flex gap-2 bg-slate-800 p-1 rounded-xl border border-slate-700">
            <button
              onClick={() => setActiveTab('scanner')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
                activeTab === 'scanner' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              ● AI Card Scanner
            </button>
            <button
              onClick={() => setActiveTab('market')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
                activeTab === 'market' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              🏪 Marketplace Store ({marketListings.length})
            </button>
            <button
              onClick={() => setActiveTab('inventory')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
                activeTab === 'inventory' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              📦 My Seller Inventory ({sellerInventory.length})
            </button>
          </div>
        </div>
      </header>

      {/* Main Views */}
      <main className="max-w-6xl mx-auto p-6">
        {/* VIEW 1: MARKETPLACE */}
        {activeTab === 'market' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-white">Live Marketplace Store</h2>
              <span className="text-xs text-slate-400">{marketListings.length} Cards available</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {marketListings.map((card) => {
                const isOwner = card.sellerId === currentUser.id;
                const isEditing = editingCardId === card.id;

                return (
                  <div
                    key={card.id}
                    className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col shadow-lg"
                  >
                    <div className="relative aspect-4/3 w-full bg-slate-950">
                      <img src={card.imageUrl} alt={card.name} className="w-full h-full object-cover" />
                      <div className="absolute top-2 left-2 bg-slate-950/90 text-indigo-400 px-2 py-0.5 rounded text-xs font-bold border border-slate-800">
                        {card.category}
                      </div>
                      <div className="absolute top-2 right-2 bg-amber-500 text-slate-950 px-2.5 py-0.5 rounded text-xs font-black">
                        PSA {card.gradeEstimated} GM
                      </div>
                    </div>

                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-semibold text-sm line-clamp-1">{card.name}</h3>

                        {/* Centering / Subgrade Tags */}
                        <div className="flex justify-between text-[11px] text-slate-400 mt-2 bg-slate-950 p-2 rounded-lg border border-slate-800">
                          <span>Center: {card.centering}</span>
                          <span>Corners: {card.corners}</span>
                          <span>Edges: {card.edges}</span>
                        </div>

                        {/* Price or Edit Price Input */}
                        <div className="mt-3">
                          {isEditing ? (
                            <div className="flex items-center gap-2">
                              <span className="text-emerald-400 font-bold">$</span>
                              <input
                                type="number"
                                value={editPriceInput}
                                onChange={(e) => setEditPriceInput(e.target.value)}
                                className="w-full bg-slate-950 border border-indigo-500 rounded-lg px-2 py-1 text-sm text-white"
                                autoFocus
                              />
                            </div>
                          ) : (
                            <p className="text-2xl font-bold text-emerald-400">
                              ${card.price.toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="mt-4 pt-3 border-t border-slate-800 flex flex-col gap-2">
                        {isOwner ? (
                          <>
                            {isEditing ? (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleSaveUpdatedPrice(card.id)}
                                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 rounded-lg text-xs"
                                >
                                  Save New Price
                                </button>
                                <button
                                  onClick={() => setEditingCardId(null)}
                                  className="px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleStartEditing(card)}
                                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-indigo-400 border border-indigo-900 font-medium py-2 rounded-lg text-xs transition"
                                >
                                  ✏️ Update Price
                                </button>
                                <button
                                  onClick={() => handleRemoveFromMarket(card.id)}
                                  className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-medium py-2 rounded-lg text-xs transition"
                                >
                                  ✕ Remove Card
                                </button>
                              </div>
                            )}
                          </>
                        ) : (
                          <button
                            onClick={() => handleBuyCard(card.id)}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-lg text-xs transition"
                          >
                            Buy Card Now
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* VIEW 2: MY SELLER INVENTORY */}
        {activeTab === 'inventory' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-white">My Seller Inventory</h2>
              <span className="text-xs text-slate-400">{sellerInventory.length} Total Cards</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sellerInventory.map((card) => (
                <div
                  key={card.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col shadow-lg"
                >
                  <div className="relative aspect-4/3 w-full bg-slate-950">
                    <img src={card.imageUrl} alt={card.name} className="w-full h-full object-cover" />
                    <div className="absolute top-2 right-2 bg-amber-500 text-slate-950 px-2 py-0.5 rounded text-xs font-black">
                      PSA {card.gradeEstimated}
                    </div>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-semibold text-sm line-clamp-1">{card.name}</h3>
                      <p className="text-xs text-slate-400 mt-1">
                        Status:{' '}
                        {card.isListed ? (
                          <span className="text-emerald-400 font-semibold">Active in Market (${card.price})</span>
                        ) : (
                          <span className="text-slate-500">Unlisted in Vault</span>
                        )}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800">
                      {card.isListed ? (
                        <button
                          onClick={() => handleRemoveFromMarket(card.id)}
                          className="w-full bg-rose-600 hover:bg-rose-700 text-white font-medium py-2 rounded-lg text-xs transition"
                        >
                          Remove from Market
                        </button>
                      ) : (
                        <div className="flex gap-2">
                          <input
                            type="number"
                            placeholder="Price ($)"
                            value={listingInputs[card.id] || ''}
                            onChange={(e) =>
                              setListingInputs({ ...listingInputs, [card.id]: e.target.value })
                            }
                            className="w-1/2 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                          />
                          <button
                            onClick={() => handleListCard(card.id)}
                            className="w-1/2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-1.5 rounded-lg text-xs transition"
                          >
                            List on Market
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 3: SCANNER PLACEHOLDER */}
        {activeTab === 'scanner' && (
          <div className="text-center py-16 border border-dashed border-slate-800 rounded-2xl bg-slate-900/50">
            <h3 className="text-lg font-bold text-white mb-2">Dual-Side High Precision AI Scanner</h3>
            <p className="text-xs text-slate-400 mb-6">Capture front and back photos to calculate optical centering and subgrades.</p>
            <button
              onClick={() => setActiveTab('market')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-lg"
            >
              Return to Marketplace
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
