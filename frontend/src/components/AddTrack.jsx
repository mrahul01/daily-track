import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { BASE_URL } from '../api';

const today = () => new Date().toISOString().split('T')[0];

function AddTrack() {
  const navigate = useNavigate();
  const userID   = localStorage.getItem('userID');
  const userName = localStorage.getItem('userName') || '';

  const [form, setForm] = useState({
    work: '', startTime: '', endTime: '', track_date: today(),
  });
  const [errors,  setErrors]  = useState({});
  const [loading, setLoading] = useState(false);
  const [apiMsg,  setApiMsg]  = useState({ type: '', text: '' });

  const validate = () => {
    const e = {};
    if (!form.work.trim())   e.work      = 'Work description is required';
    if (!form.startTime)     e.startTime = 'Start time is required';
    if (!form.endTime)       e.endTime   = 'End time is required';
    if (form.startTime && form.endTime && form.startTime >= form.endTime)
                             e.endTime   = 'End time must be after start time';
    if (!form.track_date)    e.track_date = 'Date is required';
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    setApiMsg({ type: '', text: '' });
    try {
      await axios.post(`${BASE_URL}/add-track`, {
        userID: parseInt(userID, 10),
        ...form,
      });
      setApiMsg({ type: 'success', text: 'Entry saved! Redirecting…' });
      setTimeout(() => navigate('/daily-track'), 1000);
    } catch (err) {
      setApiMsg({ type: 'error', text: err.response?.data?.detail || 'Failed to save. Try again.' });
    } finally {
      setLoading(false);
    }
  };

  const set = (field) => (e) => {
    setForm((p) => ({ ...p, [field]: e.target.value }));
    setErrors((p) => ({ ...p, [field]: '' }));
  };

  const handleLogout = () => { localStorage.clear(); navigate('/login'); };

  return (
    <div className="app-layout">
      <Sidebar userName={userName} onLogout={handleLogout} />

      <main className="main-content">
        <div className="add-track-page">
          <h1 className="page-heading">Add Entry</h1>
          <p className="page-subheading">Log a new work session to your daily track</p>

          <div className="add-track-card">
            <form onSubmit={handleSubmit} noValidate>
              <div className="field">
                <label htmlFor="work">What did you work on?</label>
                <input
                  id="work"
                  type="text"
                  placeholder="e.g. Design review, Coding, Meetings…"
                  value={form.work}
                  onChange={set('work')}
                  maxLength={30}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  {errors.work
                    ? <span className="field-error">{errors.work}</span>
                    : <span />}
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {form.work.length}/30
                  </span>
                </div>
              </div>

              <div className="time-row">
                <div className="field">
                  <label htmlFor="startTime">Start Time</label>
                  <input
                    id="startTime"
                    type="time"
                    value={form.startTime}
                    onChange={set('startTime')}
                  />
                  {errors.startTime && <span className="field-error">{errors.startTime}</span>}
                </div>

                <div className="field">
                  <label htmlFor="endTime">End Time</label>
                  <input
                    id="endTime"
                    type="time"
                    value={form.endTime}
                    onChange={set('endTime')}
                  />
                  {errors.endTime && <span className="field-error">{errors.endTime}</span>}
                </div>
              </div>

              <div className="field">
                <label htmlFor="track_date">Date</label>
                <input
                  id="track_date"
                  type="date"
                  value={form.track_date}
                  onChange={set('track_date')}
                />
                {errors.track_date && <span className="field-error">{errors.track_date}</span>}
              </div>

              {/* Duration preview */}
              {form.startTime && form.endTime && form.startTime < form.endTime && (() => {
                const [sh, sm] = form.startTime.split(':').map(Number);
                const [eh, em] = form.endTime.split(':').map(Number);
                const total = (eh * 60 + em) - (sh * 60 + sm);
                const h = Math.floor(total / 60), m = total % 60;
                const label = h === 0 ? `${m}m` : m === 0 ? `${h}h` : `${h}h ${m}m`;
                return (
                  <div style={{
                    padding: '10px 14px', background: 'var(--accent-light)',
                    borderRadius: 'var(--radius-sm)', marginBottom: 16,
                    fontSize: 13.5, color: 'var(--accent)', fontWeight: 500,
                    display: 'flex', alignItems: 'center', gap: 8,
                  }}>
                    <span>⏱</span> Duration: <strong>{label}</strong>
                  </div>
                );
              })()}

              {apiMsg.text && (
                <div className={`alert alert-${apiMsg.type}`} style={{ marginBottom: 14 }}>
                  {apiMsg.type === 'error' ? '⚠ ' : '✓ '}{apiMsg.text}
                </div>
              )}

              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={loading}>
                  {loading && <span className="spinner" />}
                  {loading ? 'Saving…' : 'Save Entry'}
                </button>
                <button type="button" className="btn btn-ghost" onClick={() => navigate('/daily-track')}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AddTrack;
