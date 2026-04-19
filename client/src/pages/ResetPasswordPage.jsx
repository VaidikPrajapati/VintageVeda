import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { EyeOff, Eye, CheckCircle2 } from 'lucide-react';
import { resetPassword } from '../api';

/**
 * Dedicated Reset Password page — reached via /reset-password/:token
 * Uses the same layout/classes as AuthPage for visual consistency.
 */
export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showCpw, setShowCpw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const result = await resetPassword(token, password);
      if (result.ok) {
        setSuccess(true);
      } else {
        setError(result.data?.detail || 'Reset failed. The link may have expired.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Success state
  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-left">
          <img
            src="/auth-botanical.png"
            alt="Ayurvedic botanical illustration with mortar, pestle, and traditional herbs"
          />
        </div>
        <div className="auth-right">
          <div className="auth-form-container">
            <div className="reset-success-box">
              <div className="reset-success-icon">
                <CheckCircle2 size={56} strokeWidth={1.5} />
              </div>
              <h2 className="auth-title">Password Reset Successful!</h2>
              <p className="auth-description">
                Your password has been successfully updated. You can now log in with your new password.
              </p>
              <button
                className="auth-submit-btn"
                onClick={() => navigate('/auth')}
                style={{ marginTop: '1.5rem' }}
              >
                {'\u2190'} Back to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Reset form
  return (
    <div className="auth-page">
      <div className="auth-left">
        <img
          src="/auth-botanical.png"
          alt="Ayurvedic botanical illustration with mortar, pestle, and traditional herbs"
        />
      </div>
      <div className="auth-right">
        <div className="auth-form-container">

          <Link to="/" className="auth-back-link">
            {'\u2190'} Back to Home
          </Link>

          <h2 className="auth-title">
            {'\uD83D\uDD11'} Set New Password
          </h2>
          <p className="auth-description">
            Choose a new password for your account. Make it strong and memorable.
          </p>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="auth-input-wrapper">
              <input
                type={showPw ? 'text' : 'password'}
                placeholder="New Password (min 8 characters)"
                className="auth-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <span className="eye-icon" onClick={() => setShowPw(!showPw)}>
                {showPw ? <Eye size={20} /> : <EyeOff size={20} />}
              </span>
            </div>

            <div className="auth-input-wrapper">
              <input
                type={showCpw ? 'text' : 'password'}
                placeholder="Confirm New Password"
                className="auth-input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <span className="eye-icon" onClick={() => setShowCpw(!showCpw)}>
                {showCpw ? <Eye size={20} /> : <EyeOff size={20} />}
              </span>
            </div>

            <button
              type="submit"
              className="auth-submit-btn"
              disabled={loading}
            >
              {loading ? 'Resetting...' : '\u2713 Reset Password'}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}
