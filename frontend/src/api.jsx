// ─── Centralized API configuration ───────────────────────────────────────────
// Set VITE_API_URL in your .env file for production.
// Example: VITE_API_URL=https://yourapi.example.com

export const BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:8000';

// ─── Auth helpers ──────────────────────────────────────────────────────────────
export const isAuthenticated = () => Boolean(localStorage.getItem('userID'));

export const getCurrentUserID = () => {
  const id = localStorage.getItem('userID');
  return id ? parseInt(id, 10) : null;
};
