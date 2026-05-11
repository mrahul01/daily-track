import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export function Sidebar({ userName, onLogout }) {
  const navigate     = useNavigate();
  const { pathname } = useLocation();

  const links = [
    { path: '/dashboard',   label: 'Profile',    icon: '👤' },
    { path: '/daily-track', label: 'Daily Track', icon: '📋' },
    { path: '/add-track',   label: 'Add Entry',   icon: '＋' },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">⏱</div>
        <span className="sidebar-logo-text">DailyTrack</span>
      </div>

      <nav className="sidebar-nav">
        {links.map((l) => (
          <button
            key={l.path}
            className={`sidebar-link${pathname === l.path ? ' active' : ''}`}
            onClick={() => navigate(l.path)}
          >
            <span>{l.icon}</span> {l.label}
          </button>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <div style={{
          padding: '8px 12px', fontSize: 13,
          color: 'var(--text-muted)', marginBottom: 8,
        }}>
          Signed in as{' '}
          <strong style={{
            color: 'var(--text-heading)', display: 'block',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {userName || '…'}
          </strong>
        </div>
        <button
          className="sidebar-link"
          onClick={onLogout}
          style={{ width: '100%', color: 'var(--red)' }}
        >
          <span>↩</span> Logout
        </button>
      </div>
    </aside>
  );
}
