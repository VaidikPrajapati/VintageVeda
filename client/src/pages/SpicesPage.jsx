import React, { useState, useEffect } from 'react';
import { getSpices } from '../api';

const SPICE_EMOJIS = {
  'Turmeric': '🟡', 'Cumin': '🫘', 'Fennel': '🌱', 'Cardamom': '💚',
  'Ginger': '🫚', 'Coriander': '🌿', 'Black Pepper': '⚫', 'Cinnamon': '🟤',
  'Ashwagandha': '🌾', 'Fenugreek': '🫛', 'Clove': '🔴', 'Saffron': '🧡',
  'Tulsi': '🍃', 'Neem': '🌿', 'Amla': '🟢',
};

export default function SpicesPage() {
  const [spices, setSpices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSpice, setActiveSpice] = useState(null);

  useEffect(() => {
    async function fetchSpices() {
      try {
        const data = await getSpices();
        setSpices(data);
      } catch (e) {
        console.error('Failed to load spices:', e);
      } finally {
        setLoading(false);
      }
    }
    fetchSpices();
  }, []);

  return (
    <div className="spices-page">
      <div className="spices-hero">
        <h1>Ayurvedic Spices Encyclopedia</h1>
        <p>Explore the healing power of traditional Indian spices — their benefits, cautions, and dosha balance.</p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>Loading spices...</div>
      ) : (
        <div className="spice-grid">
          {spices.map((spice) => (
            <div 
              key={spice.id || spice.slug} 
              className="spice-card"
              onClick={() => setActiveSpice(activeSpice?.slug === spice.slug ? null : spice)}
            >
              <div className="spice-card-header">
                <span className="spice-emoji">{SPICE_EMOJIS[spice.name] || '🌿'}</span>
                <div>
                  <h3>{spice.name}</h3>
                  <p className="spice-sanskrit">{spice.sanskrit_name}</p>
                </div>
              </div>
              <p className="spice-botanical">{spice.botanical_name}</p>
              <div className="dosha-pills">
                <span className="dosha-pill">{spice.dosha_balance}</span>
              </div>

              {/* Expanded detail */}
              {activeSpice?.slug === spice.slug && (
                <div className="spice-detail" style={{ marginTop: '1rem', borderTop: '1px solid #e8e0d8', paddingTop: '1rem' }}>
                  <h4 style={{ color: 'var(--color-primary)', marginBottom: '0.5rem' }}>Benefits</h4>
                  <ul style={{ paddingLeft: '1.2rem', marginBottom: '0.75rem' }}>
                    {spice.benefits.map((b, i) => (
                      <li key={i} style={{ fontSize: '0.85rem', color: '#555', marginBottom: '0.25rem' }}>{b}</li>
                    ))}
                  </ul>
                  {spice.cautions.length > 0 && (
                    <>
                      <h4 style={{ color: '#c0392b', marginBottom: '0.5rem' }}>Cautions</h4>
                      <ul style={{ paddingLeft: '1.2rem' }}>
                        {spice.cautions.map((c, i) => (
                          <li key={i} style={{ fontSize: '0.85rem', color: '#888', marginBottom: '0.25rem' }}>{c}</li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
