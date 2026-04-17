import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Send, Mail, MessageSquare, HelpCircle, BookOpen, Shield, Loader2 } from 'lucide-react';
import { submitContact } from '../api';

export default function SupportPage() {
  const [activeSection, setActiveSection] = useState('contact');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !subject || !message) {
      setStatus('error:Please fill in all fields.');
      return;
    }
    setLoading(true);
    setStatus('');
    try {
      const result = await submitContact({ name, email, subject, message });
      if (result.ok) {
        setStatus('success:Thank you! We\'ll get back to you within 24 hours.');
        setName(''); setEmail(''); setSubject(''); setMessage('');
      } else {
        setStatus('error:Something went wrong. Please try again.');
      }
    } catch {
      setStatus('error:Network error. Please check your connection.');
    }
    setLoading(false);
  };

  return (
    <div className="support-page">
      <div className="support-container">

        <Link to="/" className="support-back-link">
          <ArrowLeft size={18} /> Back to Home
        </Link>

        <div className="support-hero">
          <h1>Support & Help</h1>
          <p>We're here to help you on your Ayurvedic wellness journey.</p>
        </div>

        {/* Tab Navigation */}
        <div className="support-tabs">
          <button className={`support-tab ${activeSection === 'contact' ? 'active' : ''}`} onClick={() => setActiveSection('contact')}>
            <Mail size={16} /> Contact Us
          </button>
          <button className={`support-tab ${activeSection === 'how' ? 'active' : ''}`} onClick={() => setActiveSection('how')}>
            <HelpCircle size={16} /> How It Works
          </button>
          <button className={`support-tab ${activeSection === 'terms' ? 'active' : ''}`} onClick={() => setActiveSection('terms')}>
            <BookOpen size={16} /> Terms & Conditions
          </button>
          <button className={`support-tab ${activeSection === 'privacy' ? 'active' : ''}`} onClick={() => setActiveSection('privacy')}>
            <Shield size={16} /> Privacy Policy
          </button>
        </div>

        {/* Contact Form */}
        {activeSection === 'contact' && (
          <div className="support-section">
            <div className="support-card contact-card">
              <div className="contact-info-side">
                <h3><MessageSquare size={20} /> Get in Touch</h3>
                <p>Have questions about remedies, your account, or the platform? Drop us a message and our team will respond promptly.</p>
                <div className="contact-details">
                  <div className="contact-item">
                    <Mail size={16} />
                    <span>vintageveda.official@gmail.com</span>
                  </div>
                </div>
              </div>
              <form className="contact-form" onSubmit={handleSubmit}>
                <input type="text" placeholder="Your Name" className="support-input" value={name} onChange={e => setName(e.target.value)} />
                <input type="email" placeholder="Your Email" className="support-input" value={email} onChange={e => setEmail(e.target.value)} />
                <input type="text" placeholder="Subject" className="support-input" value={subject} onChange={e => setSubject(e.target.value)} />
                <textarea placeholder="Your Message..." className="support-textarea" rows={5} value={message} onChange={e => setMessage(e.target.value)} />
                
                {status && (
                  <div className={`support-status ${status.startsWith('success') ? 'success' : 'error'}`}>
                    {status.split(':')[1]}
                  </div>
                )}

                <button type="submit" className="support-submit-btn" disabled={loading}>
                  {loading ? <><Loader2 size={16} className="spin-icon" /> Sending...</> : <><Send size={16} /> Send Message</>}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* How It Works */}
        {activeSection === 'how' && (
          <div className="support-section">
            <div className="support-content-card">
              <h2>How Vintage Veda Works</h2>
              <div className="how-steps">
                <div className="how-step">
                  <div className="step-number">1</div>
                  <h4>Search for Remedies</h4>
                  <p>Search by disease name or ingredient to find traditional Ayurvedic remedies from our curated database.</p>
                </div>
                <div className="how-step">
                  <div className="step-number">2</div>
                  <h4>Discover Your Dosha</h4>
                  <p>Take our Dosha Quiz to understand your Ayurvedic constitution (Vata, Pitta, or Kapha) and get personalized recommendations.</p>
                </div>
                <div className="how-step">
                  <div className="step-number">3</div>
                  <h4>Explore Spices</h4>
                  <p>Browse our Spices Encyclopedia to learn about the healing properties, benefits, and cautions of Ayurvedic spices.</p>
                </div>
                <div className="how-step">
                  <div className="step-number">4</div>
                  <h4>Community Validation</h4>
                  <p>Upvote remedies that worked for you and help the community discover the most effective treatments.</p>
                </div>
                <div className="how-step">
                  <div className="step-number">5</div>
                  <h4>Ask VedaBot</h4>
                  <p>Chat with our AI-powered Ayurvedic assistant for personalized wellness advice and remedy suggestions.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Terms & Conditions */}
        {activeSection === 'terms' && (
          <div className="support-section">
            <div className="support-content-card">
              <h2>Terms & Conditions</h2>
              <p className="legal-updated">Last updated: April 2026</p>
              <div className="legal-content">
                <h4>1. Disclaimer</h4>
                <p>Vintage Veda provides traditional Ayurvedic remedy information for educational purposes only. The content on this platform is not intended as a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or qualified health provider.</p>
                <h4>2. User Accounts</h4>
                <p>You are responsible for maintaining the confidentiality of your account credentials. You agree to provide accurate information during registration and to update your information as needed.</p>
                <h4>3. Community Guidelines</h4>
                <p>Users may upvote remedies based on personal experience. All contributions must be honest and made in good faith. We reserve the right to remove content that violates our community standards.</p>
                <h4>4. Allergen Information</h4>
                <p>While we strive to provide accurate allergen warnings, users should independently verify ingredient safety, especially if they have known allergies or sensitivities.</p>
                <h4>5. Intellectual Property</h4>
                <p>All content, design, and functionality of Vintage Veda are the intellectual property of its creators. Unauthorized reproduction or distribution is prohibited.</p>
              </div>
            </div>
          </div>
        )}

        {/* Privacy Policy */}
        {activeSection === 'privacy' && (
          <div className="support-section">
            <div className="support-content-card">
              <h2>Privacy Policy</h2>
              <p className="legal-updated">Last updated: April 2026</p>
              <div className="legal-content">
                <h4>1. Information We Collect</h4>
                <p>We collect your name, email, and optional health profile data (dosha type, allergies) that you provide during registration and profile completion.</p>
                <h4>2. How We Use Your Data</h4>
                <p>Your data is used to personalize your experience, provide allergy warnings, and improve our remedy recommendations. We never sell your personal information to third parties.</p>
                <h4>3. Data Security</h4>
                <p>We use industry-standard security measures including JWT authentication, password hashing (bcrypt), and encrypted database connections to protect your data.</p>
                <h4>4. Cookies</h4>
                <p>We use local storage to maintain your authentication session. No third-party tracking cookies are used.</p>
                <h4>5. Your Rights</h4>
                <p>You may request deletion of your account and associated data at any time by contacting us at vintageveda.official@gmail.com.</p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
