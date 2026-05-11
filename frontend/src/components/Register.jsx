import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { BASE_URL } from '../api';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^[6-9]\d{9}$/;

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    userNAME: '', emailID: '', phoneNO: '', password: '', confirmPassword: '',
  });
  const [errors,  setErrors]  = useState({});
  const [apiMsg,  setApiMsg]  = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!formData.userNAME.trim())                         e.userNAME       = 'Full name is required';
    if (!formData.emailID)                                 e.emailID        = 'Email is required';
    else if (!emailRegex.test(formData.emailID))           e.emailID        = 'Invalid email address';
    if (formData.phoneNO && !phoneRegex.test(formData.phoneNO)) e.phoneNO  = 'Enter a valid 10-digit mobile number';
    if (!formData.password)                                e.password       = 'Password is required';
    else if (formData.password.length < 8)                 e.password       = 'Minimum 8 characters';
    if (formData.password !== formData.confirmPassword)    e.confirmPassword = 'Passwords do not match';
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    setApiMsg({ type: '', text: '' });
    try {
      await axios.post(`${BASE_URL}/register`, {
        userNAME: formData.userNAME.trim(),
        emailID:  formData.emailID,
        phoneNO:  formData.phoneNO || '0000000000',
        password: formData.password,
      });
      setApiMsg({ type: 'success', text: 'Account created! Redirecting to login…' });
      setTimeout(() => navigate('/login'), 1400);
    } catch (err) {
      const detail = err.response?.data?.detail || 'Registration failed.';
      setApiMsg({ type: 'error', text: detail === 'Email already registered' ? 'This email is already registered.' : detail });
    } finally {
      setLoading(false);
    }
  };

  const set = (field) => (e) => {
    setFormData((p) => ({ ...p, [field]: e.target.value }));
    setErrors((p) => ({ ...p, [field]: '' }));
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">⏱</div>
          <span className="auth-logo-text">DailyTrack</span>
        </div>
        <h2>Create account</h2>
        <p className="auth-subtitle">Start tracking your daily work in minutes</p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label htmlFor="userNAME">Full Name</label>
            <input id="userNAME" type="text" placeholder="Rahul Sharma" value={formData.userNAME} onChange={set('userNAME')} autoComplete="name" />
            {errors.userNAME && <span className="field-error">{errors.userNAME}</span>}
          </div>

          <div className="field">
            <label htmlFor="reg-email">Email</label>
            <input id="reg-email" type="email" placeholder="you@example.com" value={formData.emailID} onChange={set('emailID')} autoComplete="email" />
            {errors.emailID && <span className="field-error">{errors.emailID}</span>}
          </div>

          <div className="field">
            <label htmlFor="phoneNO">Phone <span style={{ opacity: 0.5 }}>(optional)</span></label>
            <input id="phoneNO" type="tel" placeholder="9876543210" value={formData.phoneNO} onChange={set('phoneNO')} autoComplete="tel" />
            {errors.phoneNO && <span className="field-error">{errors.phoneNO}</span>}
          </div>

          <div className="field">
            <label htmlFor="reg-pwd">Password</label>
            <input id="reg-pwd" type="password" placeholder="Min. 8 characters" value={formData.password} onChange={set('password')} autoComplete="new-password" />
            {errors.password && <span className="field-error">{errors.password}</span>}
          </div>

          <div className="field">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input id="confirmPassword" type="password" placeholder="Repeat password" value={formData.confirmPassword} onChange={set('confirmPassword')} autoComplete="new-password" />
            {errors.confirmPassword && <span className="field-error">{errors.confirmPassword}</span>}
          </div>

          {apiMsg.text && (
            <div className={`alert alert-${apiMsg.type}`}>
              {apiMsg.type === 'error' ? '⚠ ' : '✓ '}{apiMsg.text}
            </div>
          )}

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading && <span className="spinner" />}
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="auth-toggle">
          Already have an account? <span onClick={() => navigate('/login')}>Sign in</span>
        </p>
      </div>
    </div>
  );
}

export default Register;
