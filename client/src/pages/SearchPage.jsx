import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Bookmark, ThumbsUp, AlertTriangle, ChevronDown } from 'lucide-react';
import { searchRemedies } from '../api';

function formatCategory(raw) {
  if (!raw) return '';
  return raw.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

const CATEGORIES = [
  { key: '', label: 'All Categories' },
  { key: 'respiratory', label: 'Respiratory' },
  { key: 'digestive', label: 'Digestive' },
  { key: 'skin_hair', label: 'Skin & Hair' },
  { key: 'mental_health', label: 'Mental Health' },
  { key: 'bones_muscles', label: 'Bones & Muscles' },
  { key: 'womens_health', label: "Women's Health" },
  { key: 'immunity', label: 'Immunity' },
  { key: 'eye_health', label: 'Eye Health' },
  { key: 'oral_health', label: 'Oral Health' },
  { key: 'metabolic', label: 'Metabolic' },
  { key: 'heart_health', label: 'Heart Health' },
  { key: 'kidney', label: 'Kidney' },
];

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialType = searchParams.get('type') || 'disease';
  const initialQuery = searchParams.get('q') || '';

  const [searchType, setSearchType] = useState(initialType);
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [expandedCard, setExpandedCard] = useState(null);

  // Search whenever query params change
  useEffect(() => {
    const q = searchParams.get('q');
    const type = searchParams.get('type') || 'disease';
    if (q !== null) {
      setQuery(q);
      setSearchType(type);
      performSearch(type, q);
    }
  }, [searchParams]);

  const performSearch = async (type, q) => {
    setLoading(true);
    try {
      const data = await searchRemedies(type, q);
      setResults(data.results || data);
      setCount(data.count || (data.results ? data.results.length : data.length));
    } catch (e) {
      console.error('Search failed:', e);
      setResults([]);
      setCount(0);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchParams({ type: searchType, q: query });
  };

  const formatUpvotes = (n) => {
    if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
    return n.toString();
  };

  // Client-side category filter
  const filteredResults = categoryFilter
    ? results.filter(r => r.category === categoryFilter)
    : results;

  return (
    <div className="search-page">
      {/* --- Hero Search Bar --- */}
      <div className="search-hero">
        <form className="search-hero-form" onSubmit={handleSearch}>
          <Search size={20} color="#888" />
          <input
            type="text"
            placeholder={searchType === 'disease' ? 'Search by disease name...' : 'Search by ingredient...'}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <select 
            value={searchType} 
            onChange={(e) => setSearchType(e.target.value)}
            className="search-type-select"
          >
            <option value="disease">By Disease</option>
            <option value="ingredient">By Ingredient</option>
          </select>
          <button type="submit" className="search-hero-btn">Search</button>
        </form>
      </div>

      {/* --- Results Area --- */}
      <div className="search-results-area">
        {/* Sidebar */}
        <aside className="search-sidebar">
          <h4>Categories</h4>
          {CATEGORIES.map(cat => (
            <button
              key={cat.key}
              className={`sidebar-cat-btn ${categoryFilter === cat.key ? 'active' : ''}`}
              onClick={() => setCategoryFilter(cat.key)}
            >
              {cat.label}
            </button>
          ))}
        </aside>

        {/* Results Grid */}
        <div className="search-results-main">
          <div className="search-results-header">
            <span>{loading ? 'Searching...' : `${filteredResults.length} remedies found`}</span>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>Searching remedies...</div>
          ) : filteredResults.length === 0 ? (
            <div className="no-results">
              <h3>No remedies found</h3>
              <p>Try a different search term or browse all categories.</p>
            </div>
          ) : (
            <div className="cards-grid">
              {filteredResults.map((remedy, idx) => (
                <div 
                  key={remedy.id || idx} 
                  className="remedy-card"
                  onClick={() => setExpandedCard(expandedCard === remedy.id ? null : remedy.id)}
                >
                  {remedy.has_allergens && (
                    <div className="allergy-overlay">
                      <AlertTriangle size={12} /> Allergens: {remedy.allergens_list.join(', ')}
                    </div>
                  )}
                  <div className="remedy-card-header">
                    <span className="remedy-card-title">{remedy.title}</span>
                    <Bookmark size={18} className="bookmark-icon" />
                  </div>
                  <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.75rem' }}>
                    {remedy.short_description}
                  </p>
                  <div className="remedy-tags">
                    <span className="remedy-tag disease">{remedy.disease_name}</span>
                    <span className="remedy-tag category">{formatCategory(remedy.category)}</span>
                  </div>

                  {/* Expanded: show ingredients & steps */}
                  {expandedCard === remedy.id && (
                    <div className="remedy-expanded" style={{ marginTop: '1rem', borderTop: '1px solid #e8e0d8', paddingTop: '1rem' }}>
                      <h4 style={{ color: 'var(--color-primary)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Ingredients</h4>
                      <ul style={{ paddingLeft: '1.2rem', marginBottom: '0.75rem' }}>
                        {remedy.ingredients.map((ing, i) => (
                          <li key={i} style={{ fontSize: '0.82rem', color: '#555' }}>
                            {ing.name} {'\u2014'} {ing.quantity}
                          </li>
                        ))}
                      </ul>
                      <h4 style={{ color: 'var(--color-primary)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Preparation</h4>
                      <ol style={{ paddingLeft: '1.2rem' }}>
                        {remedy.preparation_steps.map((step, i) => (
                          <li key={i} style={{ fontSize: '0.82rem', color: '#555', marginBottom: '0.2rem' }}>{step}</li>
                        ))}
                      </ol>
                      {remedy.dosha_balance && (
                        <p style={{ marginTop: '0.75rem', fontSize: '0.82rem', color: 'var(--color-primary)', fontWeight: 600 }}>
                          {remedy.dosha_balance}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="remedy-card-footer">
                    <div className="star-rating">
                      {[1,2,3,4,5].map(s => <span key={s} className={`star ${s <= 4 ? '' : 'empty'}`}>{'\u2605'}</span>)}
                    </div>
                    <button className="upvote-btn">
                      <ThumbsUp size={14} /> {formatUpvotes(remedy.upvotes)}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
