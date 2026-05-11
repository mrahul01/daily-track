import { Routes, Route, Navigate } from 'react-router-dom';
import { isAuthenticated } from './api';

import Login     from './components/Login';
import Register  from './components/Register';
import Dashboard from './components/Dashboard';
import DailyTrack from './components/DailyTrack';
import AddTrack  from './components/AddTrack';

// ─── Route guard: redirects unauthenticated users to /login ──────────────────
function PrivateRoute({ children }) {
  return isAuthenticated() ? children : <Navigate to="/login" replace />;
}

// ─── Route guard: redirects authenticated users away from auth pages ─────────
function GuestRoute({ children }) {
  return isAuthenticated() ? <Navigate to="/dashboard" replace /> : children;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Guest-only pages */}
      <Route path="/login"    element={<GuestRoute><Login /></GuestRoute>} />
      <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />

      {/* Protected pages */}
      <Route path="/dashboard"   element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/daily-track" element={<PrivateRoute><DailyTrack /></PrivateRoute>} />
      <Route path="/add-track"   element={<PrivateRoute><AddTrack /></PrivateRoute>} />

      {/* 404 fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
