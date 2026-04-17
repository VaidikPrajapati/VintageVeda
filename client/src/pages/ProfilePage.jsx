import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Shield, Heart, Leaf, Moon, Sun, ArrowLeft, Save, Loader2 } from 'lucide-react';
import { getMe, updateProfile, isLoggedIn } from '../api';

export default function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // Editable fields
  const [allergies, setAllergies] = useState('');
  const [doshaType, setDoshaType] = useState('unknown');
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate('/auth');
      return;
    }
    getMe().then(u => {
      if (u) {
        setUser(u);
        setAllergies(u.allergies?.join(', ') || '');
        setDoshaType(u.dosha_type || 'unknown');
        setDarkMode(u.dark_mode || false);
      }
      setLoading(false);
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    const allergyList = allergies.split(',').map(a => a.trim()).filter(Boolean);
    const result = await updateProfile({
      allergies: allergyList,
      dosha_type: doshaType,
      dark_mode: darkMode,
    });
    if (result.ok) {
      setMessage('Profile updated successfully!');
    } else {
      setMessage('Failed to update profile.');
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-loading">
          <Loader2 size={32} className="spin-icon" />
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="profile-page">
        <div className="profile-error">
          <p>Unable to load profile. Please <Link to="/auth">sign in</Link> again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-container">

        <Link to="/" className="profile-back-link">
          <ArrowLeft size={18} /> Back to Home
        </Link>

        {/* Profile Header */}
        <div className="profile-header">
          <div className="profile-avatar">
            {user.full_name.charAt(0).toUpperCase()}
          </div>
          <div className="profile-header-info">
            <h1>{user.full_name}</h1>
            <p className="profile-email">
              <Mail size={14} /> {user.email}
            </p>
            <div className="profile-badges">
              {user.email_verified && (
                <span className="profile-badge verified">
                  <Shield size={12} /> Verified
                </span>
              )}
              <span className="profile-badge role">
                {user.role === 'admin' ? 'Admin' : 'Member'}
              </span>
              {user.dosha_type !== 'unknown' && (
                <span className={`profile-badge dosha dosha-${user.dosha_type}`}>
                  <Leaf size={12} /> {user.dosha_type.charAt(0).toUpperCase() + user.dosha_type.slice(1)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Profile Info Cards */}
        <div className="profile-grid">

          {/* Account Info */}
          <div className="profile-card">
            <h3><User size={18} /> Account Information</h3>
            <div className="profile-field">
              <label>Full Name</label>
              <p>{user.full_name}</p>
            </div>
            <div className="profile-field">
              <label>Email</label>
              <p>{user.email}</p>
            </div>
            <div className="profile-field">
              <label>Member Since</label>
              <p>{new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            <div className="profile-field">
              <label>Profile Status</label>
              <p>{user.profile_complete ? 'Complete' : 'Incomplete'}</p>
            </div>
          </div>

          {/* Health Preferences */}
          <div className="profile-card">
            <h3><Heart size={18} /> Health & Preferences</h3>
            
            <div className="profile-field">
              <label>Dosha Type</label>
              <select value={doshaType} onChange={e => setDoshaType(e.target.value)} className="profile-select">
                <option value="unknown">Not Determined</option>
                <option value="vata">Vata</option>
                <option value="pitta">Pitta</option>
                <option value="kapha">Kapha</option>
              </select>
              {doshaType === 'unknown' && (
                <Link to="/dosha" className="profile-inline-link">Take the Dosha Quiz →</Link>
              )}
            </div>

            <div className="profile-field">
              <label>Allergies</label>
              <input 
                type="text" 
                className="profile-input"
                placeholder="e.g., Peanuts, Dairy, Gluten"
                value={allergies}
                onChange={e => setAllergies(e.target.value)}
              />
              <small>Separate multiple allergies with commas</small>
            </div>

            <div className="profile-field">
              <label>Dark Mode</label>
              <button 
                className={`profile-toggle ${darkMode ? 'active' : ''}`}
                onClick={() => setDarkMode(!darkMode)}
              >
                {darkMode ? <Moon size={16} /> : <Sun size={16} />}
                {darkMode ? 'On' : 'Off'}
              </button>
            </div>

            {message && (
              <div className={`profile-message ${message.includes('success') ? 'success' : 'error'}`}>
                {message}
              </div>
            )}

            <button className="profile-save-btn" onClick={handleSave} disabled={saving}>
              {saving ? (
                <><Loader2 size={16} className="spin-icon" /> Saving...</>
              ) : (
                <><Save size={16} /> Save Changes</>
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
