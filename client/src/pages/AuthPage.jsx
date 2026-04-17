import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { EyeOff, Eye, Loader2 } from 'lucide-react';
import { login, signup } from '../api';

export default function AuthPage() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    if (!isLogin) {
      if (!fullName) { setError('Please enter your full name.'); return; }
      if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
      if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
      if (!acceptTerms) { setError('Please accept the Terms & Conditions.'); return; }
    }

    setLoading(true);
    try {
      if (isLogin) {
        const result = await login(email, password);
        if (result.ok) {
          setSuccess('Login successful! Redirecting...');
          setTimeout(() => navigate('/'), 1000);
        } else {
          setError(result.data.detail || 'Invalid email or password.');
        }
      } else {
        const result = await signup(fullName, email, password);
        if (result.ok) {
          setSuccess('Account created! Logging you in...');
          // Auto-login after signup
          const loginResult = await login(email, password);
          if (loginResult.ok) {
            setTimeout(() => navigate('/'), 1000);
          }
        } else {
          setError(result.data.detail || 'Signup failed. Email may already be registered.');
        }
      }
    } catch (err) {
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      
      {/* LEFT PANEL — Botanical Illustration */}
      <div className="auth-left">
        <img 
          src="/auth-botanical.png" 
          alt="Ayurvedic botanical illustration with mortar, pestle, and traditional herbs" 
        />
      </div>

      {/* RIGHT PANEL — Registration Form */}
      <div className="auth-right">
        <div className="auth-form-container">
          
          <Link to="/" className="auth-back-link">
            ← Back to Home
          </Link>

          <h2 className="auth-title">
            {isLogin ? 'Welcome Back' : 'Create Your Account'}
          </h2>
          
          {!isLogin && (
            <div className="auth-step-indicator">
              <div className="auth-step-dot active"></div>
              <div className="auth-step-dot inactive"></div>
              <span className="auth-step-text">Step 1 of 2</span>
            </div>
          )}

          {error && <div className="auth-error">{error}</div>}
          {success && <div className="auth-success">{success}</div>}

          <form className="auth-form" onSubmit={handleSubmit}>
            
            {!isLogin && (
              <input 
                type="text" 
                placeholder="Full Name" 
                className="auth-input"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            )}
            
            <input 
              type="email" 
              placeholder="Email" 
              className="auth-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            
            <div className="auth-input-wrapper">
              <input 
                type={showPassword ? 'text' : 'password'} 
                placeholder="Password" 
                className="auth-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <span className="eye-icon" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
              </span>
            </div>
            
            {!isLogin && (
              <div className="auth-input-wrapper">
                <input 
                  type={showConfirmPassword ? 'text' : 'password'} 
                  placeholder="Confirm Password" 
                  className="auth-input"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <span className="eye-icon" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                  {showConfirmPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                </span>
              </div>
            )}

            {!isLogin && (
              <label className="auth-checkbox-label">
                <input 
                  type="checkbox" 
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                />
                <span>I accept the Terms & Conditions</span>
              </label>
            )}

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? (
                <><Loader2 size={18} className="spin-icon" /> Processing...</>
              ) : (
                isLogin ? 'Login' : 'Sign Up'
              )}
            </button>

            <div className="auth-divider">
              <hr />
              <span>or</span>
              <hr />
            </div>

            <div className="auth-switch-text">
              {isLogin ? (
                <>Don't have an account? <a href="#" onClick={(e) => { e.preventDefault(); setIsLogin(false); setError(''); }}>Sign Up</a></>
              ) : (
                <>Already have an account? <a href="#" onClick={(e) => { e.preventDefault(); setIsLogin(true); setError(''); }}>Login</a></>
              )}
            </div>
          </form>

        </div>
      </div>
    </div>
  );
}
