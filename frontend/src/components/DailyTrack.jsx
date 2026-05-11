import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { Sidebar } from './Sidebar';
import { BASE_URL } from '../api';

const COLORS = ['#e85d26', '#2a9d5c', '#2176ae', '#f4a261', '#9b5de5', '#00b4d8'];

// ─── Time Helpers ──────────────────────────────────────────────────────────────
const toSecs = (t) => {
  try {
    if (!t) return 0;
    const part = typeof t === 'string' && t.includes('T') ? t.split('T')[1] : String(t);
    const [h, m, s = 0] = part.substring(0, 8).split(':').map(Number);
    return h * 3600 + m * 60 + s;
  } catch { return 0; }
};

const fmtTime = (t) => {
  const secs = toSecs(t);
  const d = new Date();
  d.setHours(Math.floor(secs / 3600), Math.floor((secs % 3600) / 60), 0);
  return d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true });
};

const durMins = (s, e) => {
  let diff = toSecs(e) - toSecs(s);
  if (diff < 0) diff += 86400;
  return Math.round(diff / 60);
};

const fmtDur = (m) => {
  if (!m) return '—';
  const h = Math.floor(m / 60), mn = m % 60;
  if (h === 0) return `${mn}m`;
  if (mn === 0) return `${h}h`;
  return `${h}h ${mn}m`;
};

// ─── Custom Pie Label ─────────────────────────────────────────────────────────
const PieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, payload }) => {
  const R   = Math.PI / 180;
  const r   = innerRadius + (outerRadius - innerRadius) * 0.55;
  const x   = cx + r * Math.cos(-midAngle * R);
  const y   = cy + r * Math.sin(-midAngle * R);
  return (
    <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central"
          fontSize={11} fontWeight={600}>
      {payload.label}
    </text>
  );
};

function DailyTrack() {
  const navigate = useNavigate();
  const userID   = localStorage.getItem('userID');
  const userName = localStorage.getItem('userName') || '';

  const [data,    setData]    = useState([]);
  const [date,    setDate]    = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { setDate(new Date().toISOString().split('T')[0]); }, []);

  useEffect(() => {
    if (!userID) { navigate('/login'); return; }
    setLoading(true);
    axios.get(`${BASE_URL}/get-track/${userID}`)
      .then((res) => setData(Array.isArray(res.data) ? res.data : []))
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, [userID, navigate]);

  const filtered    = date ? data.filter((r) => String(r.track_date) === date) : data;
  const totalMins   = filtered.reduce((s, r) => s + durMins(r.startTime, r.endTime), 0);

  // Aggregate by work type
  const workMap = {};
  filtered.forEach((r) => {
    const w = r.work || 'Unknown';
    workMap[w] = (workMap[w] || 0) + durMins(r.startTime, r.endTime);
  });

  const pieData = Object.entries(workMap).map(([name, mins]) => ({
    name, value: parseFloat((mins / 60).toFixed(2)), label: fmtDur(mins), mins,
  }));

  const workKeys = Object.keys(workMap);

  const handleLogout = () => { localStorage.clear(); navigate('/login'); };

  return (
    <div className="app-layout">
      <Sidebar userName={userName} onLogout={handleLogout} />

      <main className="main-content">
        <div className="track-page-header">
          <div>
            <h1 className="page-heading">Daily Track</h1>
            <p className="page-subheading">Your work entries and time breakdown</p>
          </div>
          <div className="track-header-actions">
            <button className="btn btn-green-outline btn-sm" onClick={() => navigate('/add-track')}>
              ＋ Add Entry
            </button>
          </div>
        </div>

        <div className="date-bar">
          <label>Date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          {filtered.length > 0 && (
            <span className="summary-pill">
              {filtered.length} {filtered.length === 1 ? 'entry' : 'entries'} ·{' '}
              <strong>{fmtDur(totalMins)}</strong> tracked
            </span>
          )}
        </div>

        {loading ? (
          <div className="card" style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
            Loading entries…
          </div>
        ) : filtered.length === 0 ? (
          <div className="card">
            <div className="no-data">
              <div className="no-data-icon">📭</div>
              <p>No entries found for this date.</p>
              <button
                className="btn btn-primary"
                style={{ marginTop: 16, maxWidth: 200 }}
                onClick={() => navigate('/add-track')}
              >
                Add Entry
              </button>
            </div>
          </div>
        ) : (
          <div className="track-grid">
            {/* Table */}
            <div className="card">
              <div className="card-header">
                <span className="card-title">Work Entries</span>
                <span style={{ fontSize: 13, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  {date}
                </span>
              </div>
              <table className="track-table">
                <thead>
                  <tr>
                    <th>Work</th>
                    <th>Duration</th>
                    <th>Start</th>
                    <th>End</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item, i) => {
                    const ci = workKeys.indexOf(item.work || 'Unknown') % COLORS.length;
                    return (
                      <tr key={i}>
                        <td>
                          <span className="work-badge">
                            <span className="work-dot" style={{ background: COLORS[ci] }} />
                            {item.work || '—'}
                          </span>
                        </td>
                        <td>
                          <span className="duration-chip">
                            {fmtDur(durMins(item.startTime, item.endTime))}
                          </span>
                        </td>
                        <td><span className="time-text">{fmtTime(item.startTime)}</span></td>
                        <td><span className="time-text">{fmtTime(item.endTime)}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pie */}
            <div className="card chart-card">
              <div className="card-header">
                <span className="card-title">Distribution</span>
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                  {fmtDur(totalMins)} total
                </span>
              </div>

              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    labelLine={false}
                    label={PieLabel}
                  >
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(_, name, props) => [props.payload.label, name]}
                    contentStyle={{
                      fontSize: 13, borderRadius: 8,
                      border: '1px solid var(--border)',
                      background: 'var(--bg-card)',
                      color: 'var(--text-heading)',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>

              <div className="chart-legend" style={{ padding: '0 16px 16px' }}>
                {pieData.map((entry, i) => (
                  <div key={i} className="legend-item">
                    <span className="legend-left">
                      <span className="legend-dot" style={{ background: COLORS[i % COLORS.length] }} />
                      {entry.name}
                    </span>
                    <span className="legend-time">{entry.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default DailyTrack;
