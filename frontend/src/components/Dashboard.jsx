import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { BASE_URL } from '../api';

function Dashboard() {
  const navigate = useNavigate();
  const userID   = localStorage.getItem('userID');

  const [user,        setUser]        = useState(null);
  const [editMode,    setEditMode]    = useState(false);
  const [updatedUser, setUpdatedUser] = useState({ name: '', email: '', phone: '' });
  const [saving,      setSaving]      = useState(false);
  const [saveMsg,     setSaveMsg]     = useState({ type: '', text: '' });
  const [stats,       setStats]       = useState({ today: 0, week: 0, total: 0 });

  useEffect(() => {
    if (!userID) { navigate('/login'); return; }

    axios.get(`${BASE_URL}/user/${userID}`)
      .then((res) => {
        setUser(res.data);
        setUpdatedUser({ name: res.data.name, email: res.data.email, phone: res.data.phone || '' });
      })
      .catch(() => navigate('/login'));

    axios.get(`${BASE_URL}/get-track/${userID}`)
      .then((res) => {
        const records = Array.isArray(res.data) ? res.data : [];
        const today   = new Date().toISOString().split('T')[0];
        const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
        setStats({
          today: records.filter((r) => String(r.track_date) === today).length,
          week:  records.filter((r) => String(r.track_date) >= weekAgo).length,
          total: records.length,
        });
      })
      .catch(() => {});
  }, [userID, navigate]);

  const handleLogout = () => { localStorage.clear(); navigate('/login'); };

  const handleSave = async () => {
    if (!updatedUser.name.trim() || !updatedUser.email) {
      setSaveMsg({ type: 'error', text: 'Name and email are required.' }); return;
    }
    setSaving(true);
    setSaveMsg({ type: '', text: '' });
    try {
      await axios.put(`${BASE_URL}/user/${userID}`, updatedUser);
      setUser({ ...user, ...updatedUser });
      localStorage.setItem('userName', updatedUser.name);
      setEditMode(false);
      setSaveMsg({ type: 'success', text: 'Profile updated successfully.' });
      setTimeout(() => setSaveMsg({ type: '', text: '' }), 3000);
    } catch {
      setSaveMsg({ type: 'error', text: 'Update failed. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const initials = user?.name
    ? user.name.trim().split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <div className="app-layout">
      <Sidebar userName={user?.name} onLogout={handleLogout} />

      <main className="main-content">
        <div className="profile-section">
          <h1 className="page-heading">My Profile</h1>
          <p className="page-subheading">Manage your account information</p>

          {/* Stats row */}
          <div className="stats-row">
            {[
              { label: 'Today',     value: stats.today, sub: 'entries' },
              { label: 'This Week', value: stats.week,  sub: 'entries' },
              { label: 'All Time',  value: stats.total, sub: 'entries' },
            ].map((s) => (
              <div key={s.label} className="stat-card">
                <div className="stat-label">{s.label}</div>
                <div className="stat-value">{s.value}</div>
                <div className="stat-sub">{s.sub}</div>
              </div>
            ))}
          </div>

          {user ? (
            <div className="profile-card">
              <div className="profile-avatar-row">
                <div className="avatar">{initials}</div>
                <div className="avatar-info">
                  <h3>{user.name}</h3>
                  <p>{user.email}</p>
                </div>
              </div>

              <div className="profile-fields">
                {[
                  { key: 'name',  label: 'Full Name',    type: 'text'  },
                  { key: 'email', label: 'Email Address', type: 'email' },
                  { key: 'phone', label: 'Phone Number',  type: 'tel'   },
                ].map(({ key, label, type }) => (
                  <div className="profile-field" key={key}>
                    <label>{label}</label>
                    {editMode ? (
                      <input
                        type={type}
                        value={updatedUser[key] || ''}
                        onChange={(e) => setUpdatedUser((p) => ({ ...p, [key]: e.target.value }))}
                      />
                    ) : (
                      <span className="field-value">
                        {user[key] || <span style={{ opacity: 0.4 }}>—</span>}
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {saveMsg.text && (
                <div className={`alert alert-${saveMsg.type}`} style={{ marginTop: 16 }}>
                  {saveMsg.type === 'error' ? '⚠ ' : '✓ '}{saveMsg.text}
                </div>
              )}

              <div className="profile-actions">
                {!editMode ? (
                  <button className="btn btn-ghost" onClick={() => setEditMode(true)}>
                    ✏ Edit Profile
                  </button>
                ) : (
                  <>
                    <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleSave} disabled={saving}>
                      {saving && <span className="spinner" />}
                      {saving ? 'Saving…' : 'Save Changes'}
                    </button>
                    <button
                      className="btn btn-ghost"
                      onClick={() => {
                        setEditMode(false);
                        setUpdatedUser({ name: user.name, email: user.email, phone: user.phone || '' });
                        setSaveMsg({ type: '', text: '' });
                      }}
                    >
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="profile-card">
              {[80, 200, 150].map((w, i) => (
                <div key={i} className="skeleton" style={{ height: 18, width: w, marginBottom: 14 }} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
