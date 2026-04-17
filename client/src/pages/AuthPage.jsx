import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { EyeOff, Eye, Loader2, ArrowLeft, ArrowRight, Heart, Check } from 'lucide-react';
import { login, signup, completeProfile } from '../api';

export default function AuthPage() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [signupStep, setSignupStep] = useState(1);

  // Step 1: Account fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);

  // Step 2: Health profile fields
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [hasAllergies, setHasAllergies] = useState(false);
  const [allergies, setAllergies] = useState('');
  const [healthGoal, setHealthGoal] = useState('');

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleStep1Submit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    if (isLogin) {
      setLoading(true);
      try {
        const result = await login(email, password);
        if (result.ok) {
          setSuccess('Login successful! Redirecting...');
          setTimeout(() => navigate('/'), 1000);
        } else {
          setError(result.data.detail || 'Invalid email or password.');
        }
      } catch (err) {
        setError('Network error. Please check if the backend is running.');
      } finally {
        setLoading(false);
      }
      return;
    }

    // Signup validation
    if (!fullName) { setError('Please enter your full name.'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (!acceptTerms) { setError('Please accept the Terms & Conditions.'); return; }

    setLoading(true);
    try {
      const result = await signup(fullName, email, password);
      if (result.ok) {
        // Auto-login after signup
        const loginResult = await login(email, password);
        if (loginResult.ok) {
          setSuccess('Account created! Let\'s set up your health profile...');
          setTimeout(() => setSignupStep(2), 1000);
        }
      } else {
        setError(result.data.detail || 'Signup failed. Email may already be registered.');
      }
    } catch (err) {
      setError('Network error. Please check if the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleStep2Submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const profileData = {
        age: age ? parseInt(age) : null,
        gender: gender || null,
        state: state || null,
        city: city || null,
        has_allergies: hasAllergies,
        allergies: hasAllergies ? allergies.split(',').map(a => a.trim()).filter(Boolean) : [],
        health_goal: healthGoal || null,
      };

      const result = await completeProfile(profileData);
      if (result.ok) {
        setSuccess('Profile complete! Redirecting to home...');
        setTimeout(() => navigate('/'), 1500);
      } else {
        setError('Failed to save profile. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkipStep2 = () => {
    navigate('/');
  };

  return (
    <div className="auth-page">
      
      {/* LEFT PANEL */}
      <div className="auth-left">
        <img 
          src="/auth-botanical.png" 
          alt="Ayurvedic botanical illustration with mortar, pestle, and traditional herbs" 
        />
      </div>

      {/* RIGHT PANEL */}
      <div className="auth-right">
        <div className="auth-form-container">
          
          <Link to="/" className="auth-back-link">
            {'\u2190'} Back to Home
          </Link>

          {/* ========== LOGIN / SIGNUP STEP 1 ========== */}
          {(isLogin || signupStep === 1) && (
            <>
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

              <form className="auth-form" onSubmit={handleStep1Submit}>
                
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
                    <span>I accept the <Link to="/support" style={{ color: 'var(--color-primary)', textDecoration: 'underline' }}>Terms & Conditions</Link></span>
                  </label>
                )}

                <button type="submit" className="auth-submit-btn" disabled={loading}>
                  {loading ? (
                    <><Loader2 size={18} className="spin-icon" /> Processing...</>
                  ) : (
                    isLogin ? 'Login' : (<>Next <ArrowRight size={16} /></>)
                  )}
                </button>

                <div className="auth-divider">
                  <hr />
                  <span>or</span>
                  <hr />
                </div>

                <div className="auth-switch-text">
                  {isLogin ? (
                    <>Don't have an account? <a href="#" onClick={(e) => { e.preventDefault(); setIsLogin(false); setError(''); setSuccess(''); }}>Sign Up</a></>
                  ) : (
                    <>Already have an account? <a href="#" onClick={(e) => { e.preventDefault(); setIsLogin(true); setError(''); setSuccess(''); }}>Login</a></>
                  )}
                </div>
              </form>
            </>
          )}

          {/* ========== SIGNUP STEP 2: Health Profile ========== */}
          {!isLogin && signupStep === 2 && (
            <>
              <h2 className="auth-title">
                <Heart size={24} style={{ marginRight: '0.5rem', color: 'var(--color-primary)' }} />
                Health Profile
              </h2>
              
              <div className="auth-step-indicator">
                <div className="auth-step-dot completed"><Check size={10} /></div>
                <div className="auth-step-dot active"></div>
                <span className="auth-step-text">Step 2 of 2</span>
              </div>

              <p className="auth-step2-subtitle">Help us personalize your Ayurvedic experience. All fields are optional.</p>

              {error && <div className="auth-error">{error}</div>}
              {success && <div className="auth-success">{success}</div>}

              <form className="auth-form" onSubmit={handleStep2Submit}>
                
                <div className="auth-row">
                  <div className="auth-field-half">
                    <label className="auth-label">Age</label>
                    <input type="number" placeholder="e.g., 25" className="auth-input" value={age} onChange={e => setAge(e.target.value)} min="1" max="120" />
                  </div>
                  <div className="auth-field-half">
                    <label className="auth-label">Gender</label>
                    <select className="auth-input auth-select" value={gender} onChange={e => setGender(e.target.value)}>
                      <option value="">Select...</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                      <option value="prefer_not_to_say">Prefer not to say</option>
                    </select>
                  </div>
                </div>

                <div className="auth-row">
                  <div className="auth-field-half">
                    <label className="auth-label">State</label>
                    <input type="text" placeholder="e.g., Gujarat" className="auth-input" value={state} onChange={e => setState(e.target.value)} />
                  </div>
                  <div className="auth-field-half">
                    <label className="auth-label">City</label>
                    <input type="text" placeholder="e.g., Ahmedabad" className="auth-input" value={city} onChange={e => setCity(e.target.value)} />
                  </div>
                </div>

                <div className="auth-field">
                  <label className="auth-label">Health Goal</label>
                  <select className="auth-input auth-select" value={healthGoal} onChange={e => setHealthGoal(e.target.value)}>
                    <option value="">Select your goal...</option>
                    <option value="general_wellness">General Wellness</option>
                    <option value="specific_condition">Treat a Specific Condition</option>
                    <option value="explore">Explore Ayurveda</option>
                  </select>
                </div>

                <div className="auth-field">
                  <label className="auth-checkbox-label" style={{ marginBottom: '0.5rem' }}>
                    <input type="checkbox" checked={hasAllergies} onChange={e => setHasAllergies(e.target.checked)} />
                    <span>I have known allergies</span>
                  </label>
                  {hasAllergies && (
                    <input type="text" placeholder="e.g., Peanuts, Dairy, Shellfish" className="auth-input" value={allergies} onChange={e => setAllergies(e.target.value)} />
                  )}
                </div>

                <div className="auth-step2-actions">
                  <button type="button" className="auth-skip-btn" onClick={handleSkipStep2}>
                    Skip for now
                  </button>
                  <button type="submit" className="auth-submit-btn" disabled={loading} style={{ flex: 1 }}>
                    {loading ? (
                      <><Loader2 size={18} className="spin-icon" /> Saving...</>
                    ) : (
                      <><Check size={16} /> Complete Profile</>
                    )}
                  </button>
                </div>

              </form>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
