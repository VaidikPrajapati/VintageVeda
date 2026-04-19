import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Search, Sparkles, SunMedium, Heart, Bookmark, UserCircle, MessageCircle, ArrowRight, ThumbsUp, Github, Twitter, Mail, LogOut, X, Send, Loader2, Bot, User } from 'lucide-react';
import AuthPage from './pages/AuthPage';
import SearchPage from './pages/SearchPage';
import SpicesPage from './pages/SpicesPage';
import DoshaQuizPage from './pages/DoshaQuizPage';
import ProfilePage from './pages/ProfilePage';
import SupportPage from './pages/SupportPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import { getFeaturedRemedies, getRemedyOfDay, getSeasonalTips, isLoggedIn, logout, getMe, sendChatMessage } from './api';

/* ============================================================
   Helpers
   ============================================================ */
function formatCategory(raw) {
  if (!raw) return '';
  return raw.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

/* ============================================================
   Star Rating Component
   ============================================================ */
function StarRating({ rating = 4, max = 5 }) {
  return (
    <div className="star-rating">
      {Array.from({ length: max }, (_, i) => (
        <span key={i} className={`star ${i < rating ? '' : 'empty'}`}>{'\u2605'}</span>
      ))}
    </div>
  );
}

/* ============================================================
   Layout — Navbar + Footer + Vedabot FAB (hidden on /auth)
   ============================================================ */
function Layout() {
  const location = useLocation();
  const isAuthPage = location.pathname === '/auth' || location.pathname.startsWith('/reset-password');
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoggedIn()) {
      getMe().then(u => setUser(u));
    }
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    setUser(null);
    navigate('/');
  };

  return (
    <div className="layout" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {!isAuthPage && (
        <header className="navbar">
          <Link to="/" className="brand">
            <img src="/logo.jpeg" alt="Vintage Veda Logo" className="brand-logo" />
            <span className="brand-text">Vintage Veda</span>
          </Link>
          <nav className="nav-links">
            <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}>Home</NavLink>
            <NavLink to="/spices" className={({ isActive }) => isActive ? 'active' : ''}>Spices</NavLink>
            <NavLink to="/dosha" className={({ isActive }) => isActive ? 'active' : ''}>Dosha Quiz</NavLink>
          </nav>
          <div className="nav-actions">
            <button className="dark-mode-btn" aria-label="Toggle dark mode">{'\uD83C\uDF19'}</button>
            {user ? (
              <div className="user-nav-group">
                <span className="user-greeting">Hi, {user.full_name.split(' ')[0]}</span>
                <Link to="/profile" className="auth-btn" title="My Profile">
                  <UserCircle size={18} />
                  <span>Profile</span>
                </Link>
                <button className="auth-btn" onClick={handleLogout} title="Logout">
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <Link to="/auth" className="auth-btn">
                <UserCircle size={18} />
                <span>Sign In</span>
              </Link>
            )}
          </div>
        </header>
      )}

      <main className="main-content" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/spices" element={<SpicesPage />} />
          <Route path="/dosha" element={<DoshaQuizPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/support" element={<SupportPage />} />
        </Routes>
      </main>

      {!isAuthPage && (
        <>
          <footer className="site-footer">
            <div className="footer-inner">
              <div className="footer-brand">
                <Link to="/" className="brand" style={{ marginBottom: '0.5rem' }}>
                  <img src="/logo.jpeg" alt="Vintage Veda" className="brand-logo" />
                  <span className="brand-text" style={{ color: 'white' }}>Vintage Veda</span>
                </Link>
                <p>Discover and share traditional Ayurvedic remedies validated by community wisdom. Heal naturally, live traditionally.</p>
              </div>
              <div className="footer-col">
                <h4>Explore</h4>
                <ul>
                  <li><Link to="/">Home</Link></li>
                  <li><Link to="/spices">Spices Encyclopedia</Link></li>
                  <li><Link to="/dosha">Dosha Quiz</Link></li>
                  <li><Link to="/search?type=disease&q=">Browse Remedies</Link></li>
                </ul>
              </div>
              <div className="footer-col">
                <h4>Support</h4>
                <ul>
                  <li><Link to="/support">How It Works</Link></li>
                  <li><Link to="/support">Terms & Conditions</Link></li>
                  <li><Link to="/support">Privacy Policy</Link></li>
                  <li><Link to="/support">Contact Us</Link></li>
                </ul>
              </div>
            </div>
            <div className="footer-bottom">
              <span>{'\u00A9'} 2026 Vintage Veda. Built with {'\uD83C\uDF3F'} for holistic wellness.</span>
              <div className="footer-social">
                <a href="#" aria-label="GitHub"><Github size={18} /></a>
                <a href="#" aria-label="Twitter"><Twitter size={18} /></a>
                <a href="#" aria-label="Email"><Mail size={18} /></a>
              </div>
            </div>
          </footer>

          <VedaBotChat />
        </>
      )}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}

/* ============================================================
   VEDABOT CHAT PANEL — Floating AI Assistant
   ============================================================ */
function VedaBotChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', text: "🙏 Namaste! I'm VedaBot, your Ayurvedic wellness assistant.\n\nDescribe your symptoms and I'll suggest traditional Ayurvedic remedies. I can understand Hindi-English mix too!" }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isTyping) return;

    const userMsg = { role: 'user', text: trimmed };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const history = messages.map(m => ({ role: m.role === 'bot' ? 'assistant' : 'user', content: m.text }));
      const response = await sendChatMessage(trimmed, history);

      if (response) {
        let botText = '';

        if (response.followUpQuestion || response.follow_up_question) {
          botText = response.followUpQuestion || response.follow_up_question;
        } else {
          const disease = response.disease || 'Unknown';
          const explanation = response.explanation || '';
          const dosha = response.doshaImbalance || response.dosha_imbalance || '';
          const confidence = response.confidence || 'low';
          const disclaimer = response.disclaimer || '';

          botText = `🌿 **${disease}**\n\n${explanation}`;
          if (dosha) botText += `\n\n🧘 **Dosha:** ${dosha}`;
          botText += `\n📊 **Confidence:** ${confidence}`;

          if (response.remedies && response.remedies.length > 0) {
            botText += '\n\n💊 **Suggested Remedies:**';
            response.remedies.forEach(r => {
              botText += `\n• ${r.title} (for ${r.disease})`;
            });
          }

          if (disclaimer) botText += `\n\n⚠️ _${disclaimer}_`;
        }

        setMessages(prev => [...prev, { role: 'bot', text: botText }]);
      } else {
        setMessages(prev => [...prev, { role: 'bot', text: '🙏 I could not process that right now. Please make sure you are logged in and try again.' }]);
      }
    } catch (err) {
      console.error('VedaBot error:', err);
      setMessages(prev => [...prev, { role: 'bot', text: '❌ Something went wrong. Please try again in a moment.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatBotText = (text) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/_(.*?)_/g, '<em>$1</em>')
      .replace(/\n/g, '<br/>');
  };

  return (
    <>
      {/* Chat Panel */}
      <div className={`vedabot-panel ${isOpen ? 'open' : ''}`}>
        {/* Header */}
        <div className="vedabot-panel-header">
          <div className="vedabot-header-left">
            <div className="vedabot-avatar">
              <Bot size={20} />
            </div>
            <div>
              <h4>VedaBot AI</h4>
              <span className="vedabot-status">Ayurvedic Wellness Assistant</span>
            </div>
          </div>
          <button className="vedabot-close-btn" onClick={() => setIsOpen(false)} aria-label="Close VedaBot">
            <X size={18} />
          </button>
        </div>

        {/* Messages */}
        <div className="vedabot-messages">
          {messages.map((msg, idx) => (
            <div key={idx} className={`vedabot-msg ${msg.role}`}>
              <div className="vedabot-msg-icon">
                {msg.role === 'bot' ? <Bot size={16} /> : <User size={16} />}
              </div>
              <div
                className="vedabot-msg-bubble"
                dangerouslySetInnerHTML={{ __html: msg.role === 'bot' ? formatBotText(msg.text) : msg.text }}
              />
            </div>
          ))}
          {isTyping && (
            <div className="vedabot-msg bot">
              <div className="vedabot-msg-icon"><Bot size={16} /></div>
              <div className="vedabot-msg-bubble vedabot-typing">
                <span className="typing-dot"></span>
                <span className="typing-dot"></span>
                <span className="typing-dot"></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="vedabot-input-area">
          <input
            ref={inputRef}
            type="text"
            className="vedabot-input"
            placeholder="Describe your symptoms..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isTyping}
          />
          <button
            className="vedabot-send-btn"
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            aria-label="Send message"
          >
            {isTyping ? <Loader2 size={18} className="spin-icon" /> : <Send size={18} />}
          </button>
        </div>
      </div>

      {/* FAB */}
      <button
        className={`vedabot-fab ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Close VedaBot' : 'Open VedaBot AI Assistant'}
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={26} />}
      </button>
      {!isOpen && <span className="vedabot-label">VedaBot</span>}
    </>
  );
}

/* ============================================================
   LANDING PAGE — Fetches real data from API
   ============================================================ */
function LandingPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('disease');
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredRemedies, setFeaturedRemedies] = useState([]);
  const [rotd, setRotd] = useState(null);
  const [seasonal, setSeasonal] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [featured, remedyOfDay, seasonalData] = await Promise.all([
          getFeaturedRemedies(),
          getRemedyOfDay(),
          getSeasonalTips(),
        ]);
        setFeaturedRemedies(featured);
        setRotd(remedyOfDay);
        setSeasonal(seasonalData);
      } catch (e) {
        console.error('Failed to load landing data:', e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery) {
      navigate(`/search?type=${activeTab}&q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const formatUpvotes = (n) => {
    if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
    return n.toString();
  };

  return (
    <div className="landing-page">
      
      {/* --- Hero Section --- */}
      <section className="hero-section">
        <div className="hero-bg-overlay"></div>
        <div className="hero-content">
          <h1>Heal Naturally.<br/>Live Traditionally.</h1>
          <p>Discover time-tested Ayurvedic remedies personalized for your well-being.</p>
        </div>

        <div className="search-widget-container">
          <div className="search-tabs">
            <button 
              className={`search-tab ${activeTab === 'disease' ? 'active' : ''}`}
              onClick={() => setActiveTab('disease')}
            >
              Search by Disease
            </button>
            <button 
              className={`search-tab ${activeTab === 'ingredient' ? 'active' : ''}`}
              onClick={() => setActiveTab('ingredient')}
            >
              Search by Ingredient
            </button>
          </div>
          
          <form className="search-box-inner" onSubmit={handleSearch}>
            <Search color="#A59B93" size={20} />
            <input 
              type="text" 
              placeholder={activeTab === 'disease' ? "Search for a disease (e.g., Migraine)..." : "Search for an ingredient (e.g., Turmeric)..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="search-box-btn">
              <Search size={16} style={{ marginRight: '0.4rem' }} /> Search
            </button>
          </form>
        </div>
      </section>

      {/* --- Seasonal Wellness Banner --- */}
      <section className="seasonal-banner">
        <div className="seasonal-text">
          <h3>Seasonal Wellness</h3>
          <p>
            {seasonal && seasonal.tips
              ? seasonal.tips[0]
              : 'Tips for summer wellness \u2014 stay hydrated, eat cooling foods, and minimize exposure to midday sun for balanced Pitta dosha.'}
          </p>
        </div>
        <Link to="/search?type=disease&q=summer" className="seasonal-cta">
          Learn more <ArrowRight size={18} />
        </Link>
      </section>

      {/* --- Remedy of the Day --- */}
      <section className="rotd-section">
        <div className="rotd-card">
          <div className="rotd-content">
            <div className="rotd-badge">
              <Sparkles size={14} /> REMEDY OF THE DAY
            </div>
            <h2 className="rotd-title">{rotd ? rotd.title : 'Tulsi & Ginger Kadha'}</h2>
            <p className="rotd-desc">
              {rotd ? rotd.short_description : 'Featured Ayurvedic immunity-boosting decoction for combating seasonal changes.'}
            </p>
            <div className="tags-row">
              <span className="tag outline">{rotd ? rotd.disease_name : 'Cough & Cold'}</span>
              <span className="tag filled">{rotd ? formatCategory(rotd.category) : 'Respiratory'}</span>
            </div>
            <Link to={rotd ? `/search?type=disease&q=${encodeURIComponent(rotd.disease_name)}` : '/search?type=disease&q=cough'} className="rotd-cta">
              Learn more <ArrowRight size={16} />
            </Link>
          </div>
          <img 
            src="/rotd-herbs.png" 
            alt="Ayurvedic herbs and spices" 
            className="rotd-image"
          />
        </div>
      </section>

      {/* --- Featured Remedies — 3 Column Grid --- */}
      <section className="featured-section">
        <div className="featured-header">
          <h3>Featured Remedies</h3>
          <Link to="/search?type=disease&q=" className="view-all">View All {'\u2192'}</Link>
        </div>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>Loading remedies...</div>
        ) : (
          <div className="cards-grid">
            {featuredRemedies.map((remedy, idx) => (
              <div key={remedy.id || idx} className={`remedy-card stagger-${idx + 1}`} style={{ animation: 'fadeUp 0.5s ease-out both' }}>
                {remedy.has_allergens && (
                  <div className="allergy-overlay">
                    Allergens: {remedy.allergens_list.join(', ')}
                  </div>
                )}
                <div className="remedy-card-header">
                  <span className="remedy-card-title">{remedy.title}</span>
                  <Bookmark size={18} className="bookmark-icon" />
                </div>
                <div className="remedy-tags">
                  <span className="remedy-tag disease">{remedy.disease_name}</span>
                  <span className="remedy-tag category">{formatCategory(remedy.category)}</span>
                </div>
                <div className="remedy-card-footer">
                  <StarRating rating={4} />
                  <button className="upvote-btn">
                    <ThumbsUp size={14} /> {formatUpvotes(remedy.upvotes)}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  );
}
