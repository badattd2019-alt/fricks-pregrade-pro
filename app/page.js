'use client';

import React, { useState, useEffect } from 'react';

export default function MarketplacePage() {
  const [cards, setCards] = useState([]);
  const [isEditing, setIsEditing] = useState(null);
  const [editForm, setEditForm] = useState({
    title: '',
    price: '',
    grade: '',
    imageUrl: ''
  });

  // Load cards from localStorage on initial load
  useEffect(() => {
    const saved = localStorage.getItem('pregrade_marketplace_cards');
    if (saved) {
      try {
        setCards(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse cards from storage', e);
      }
    } else {
      // Default initial mock cards if empty
      const initialCards = [
        {
          id: 'card-1',
          title: '1989 Upper Deck Ken Griffey Jr. #1',
          price: '249.99',
          grade: 'PSA 10 (Gem Mint)',
          imageUrl: 'https://images.pokemontcg.io/pgo/11_hires.png'
        },
        {
          id: 'card-2',
          title: '1999 Base Set Charizard Holo #4',
          price: '399.00',
          grade: 'BGS 9.5 (Mint+)',
          imageUrl: 'https://images.pokemontcg.io/swsh4/25_hires.png'
        }
      ];
      setCards(initialCards);
      localStorage.setItem('pregrade_marketplace_cards', JSON.stringify(initialCards));
    }
  }, []);

  // Save cards helper
  const syncCards = (updatedCards) => {
    setCards(updatedCards);
    localStorage.setItem('pregrade_marketplace_cards', JSON.stringify(updatedCards));
  };

  // REMOVE CARD FUNCTION
  const handleRemoveCard = (id) => {
    const confirmed = window.confirm('Are you sure you want to remove this card listing?');
    if (!confirmed) return;

    const filteredCards = cards.filter((card) => card.id !== id);
    syncCards(filteredCards);
  };

  // START EDITING
  const handleStartEdit = (card) => {
    setIsEditing(card.id);
    setEditForm({
      title: card.title || '',
      price: card.price || '',
      grade: card.grade || '',
      imageUrl: card.imageUrl || ''
    });
  };

  // CANCEL EDITING
  const handleCancelEdit = () => {
    setIsEditing(null);
    setEditForm({ title: '', price: '', grade: '', imageUrl: '' });
  };

  // SAVE UPDATED CARD
  const handleSaveUpdate = (e) => {
    e.preventDefault();
    if (!editForm.title || !editForm.price) {
      alert('Title and Price are required.');
      return;
    }

    const updatedList = cards.map((card) => {
      if (card.id === isEditing) {
        return {
          ...card,
          title: editForm.title,
          price: parseFloat(editForm.price).toFixed(2),
          grade: editForm.grade,
          imageUrl: editForm.imageUrl || card.imageUrl
        };
      }
      return card;
    });

    syncCards(updatedList);
    setIsEditing(null);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#020617', color: '#f8fafc', padding: '24px' }}>
      <header style={{ maxWidth: '1200px', margin: '0 auto 32px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#38bdf8' }}>
          Fricks Pre-Grade & Verified Marketplace
        </h1>
        <p style={{ color: '#94a3b8' }}>Manage, inspect, update, and remove active listings</p>
      </header>

      <main style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {cards.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px', backgroundColor: '#0f172a', borderRadius: '12px' }}>
            <p style={{ color: '#94a3b8', fontSize: '18px' }}>No active listings available in the marketplace.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
            {cards.map((card) => (
              <div
                key={card.id}
                style={{
                  backgroundColor: '#0f172a',
                  border: '1px solid #1e293b',
                  borderRadius: '12px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                {isEditing === card.id ? (
                  /* EDIT MODE */
                  <form onSubmit={handleSaveUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <h3 style={{ fontSize: '16px', color: '#38bdf8', margin: '0' }}>Edit Listing</h3>
                    
                    <label style={{ fontSize: '12px', color: '#94a3b8' }}>
                      Card Title:
                      <input
                        type="text"
                        value={editForm.title}
                        onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '8px',
                          marginTop: '4px',
                          backgroundColor: '#1e293b',
                          border: '1px solid #334155',
                          borderRadius: '6px',
                          color: '#fff'
                        }}
                        required
                      />
                    </label>

                    <label style={{ fontSize: '12px', color: '#94a3b8' }}>
                      Price ($):
                      <input
                        type="number"
                        step="0.01"
                        value={editForm.price}
                        onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '8px',
                          marginTop: '4px',
                          backgroundColor: '#1e293b',
                          border: '1px solid #334155',
                          borderRadius: '6px',
                          color: '#fff'
                        }}
                        required
                      />
                    </label>

                    <label style={{ fontSize: '12px', color: '#94a3b8' }}>
                      Grade / Condition:
                      <input
                        type="text"
                        value={editForm.grade}
                        onChange={(e) => setEditForm({ ...editForm, grade: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '8px',
                          marginTop: '4px',
                          backgroundColor: '#1e293b',
                          border: '1px solid #334155',
                          borderRadius: '6px',
                          color: '#fff'
                        }}
                      />
                    </label>

                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                      <button
                        type="submit"
                        style={{
                          flex: 1,
                          backgroundColor: '#22c55e',
                          color: '#fff',
                          border: 'none',
                          padding: '8px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: 'bold'
                        }}
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        style={{
                          flex: 1,
                          backgroundColor: '#475569',
                          color: '#fff',
                          border: 'none',
                          padding: '8px',
                          borderRadius: '6px',
                          cursor: 'pointer'
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  /* VIEW MODE */
                  <>
                    <div>
                      <div
                        style={{
                          width: '100%',
                          height: '240px',
                          backgroundColor: '#020617',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          overflow: 'hidden',
                          marginBottom: '12px'
                        }}
                      >
                        <img
                          src={card.imageUrl}
                          alt={card.title}
                          style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                          onError={(e) => {
                            e.target.src = 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Pok%C3%A9_Ball_icon.svg/512px-Pok%C3%A9_Ball_icon.svg.png';
                          }}
                        />
                      </div>
                      <h2 style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 4px', color: '#f8fafc' }}>
                        {card.title}
                      </h2>
                      <p style={{ color: '#38bdf8', fontSize: '13px', margin: '0 0 8px' }}>
                        {card.grade || 'Ungraded / Raw'}
                      </p>
                      <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#22c55e', margin: '0 0 16px' }}>
                        ${card.price}
                      </p>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => handleStartEdit(card)}
                        style={{
                          flex: 1,
                          backgroundColor: '#2563eb',
                          color: '#fff',
                          border: 'none',
                          padding: '8px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: '600'
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleRemoveCard(card.id)}
                        style={{
                          flex: 1,
                          backgroundColor: '#dc2626',
                          color: '#fff',
                          border: 'none',
                          padding: '8px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: '600'
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
