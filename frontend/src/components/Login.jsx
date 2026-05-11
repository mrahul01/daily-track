import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { BASE_URL } from '../api';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ emailID: '', password: '' });
  const [errors, setErrors]     = useState({});
  const [apiMsg, setApiMsg]     = useState('');
  const [loading, setLoading]   = useState(false);

  const validate = () => {
    const e = {};
    if (!formData.emailID)                       e.emailID  = 'Email is required';
    else if (!emailRegex.test(formData.emailID)) e.emailID  = 'Invalid email address';
    if (!formData.password)                      e.password = 'Password is required';
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    setApiMsg('');
    setErrors({});

    try {
      const res = await axios.post(`${BASE_URL}/login`, {
        emailID:  formData.emailID,
        password: formData.password,
      });

      localStorage.setItem('userID',   res.data.user.id);
      localStorage.setItem('userName', res.data.user.name);
      navigate('/dashboard');
    } catch (err) {
      const detail = err.response?.data?.detail || 'Login failed. Try again.';
      const msgMap = {
        'User not found': 'No account found with this email.',
        'Wrong password': 'Incorrect password. Please try again.',
      };
      setApiMsg(msgMap[detail] || detail);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    setErrors((prev)   => ({ ...prev, [field]: '' }));
    setApiMsg('');
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">⏱</div>
          <span className="auth-logo-text">DailyTrack</span>
        </div>

        <h2>Welcome back</h2>
        <p className="auth-subtitle">Sign in to your account to continue</p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label htmlFor="emailID">Email</label>
            <input
              id="emailID"
              type="email"
              placeholder="you@example.com"
              value={formData.emailID}
              onChange={handleChange('emailID')}
              autoComplete="email"
            />
            {errors.emailID && <span className="field-error">{errors.emailID}</span>}
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange('password')}
              autoComplete="current-password"
            />
            {errors.password && <span className="field-error">{errors.password}</span>}
          </div>

          {apiMsg && (
            <div className="alert alert-error">
              <span>⚠</span> {apiMsg}
            </div>
          )}

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading && <span className="spinner" />}
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="auth-toggle">
          Don't have an account?{' '}
          <span onClick={() => navigate('/register')}>Create one</span>
        </p>
      </div>
    </div>
  );
}

export default Login;
