import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import '/src/App.css';

function Dashboard() {
  const navigate = useNavigate();

  const userID = localStorage.getItem("userID");
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (!userID) {
      navigate("/login");
      return;
    }

    const fetchUser = async () => {
      try {
        const res = await axios.get(
          `http://localhost:8000/user/${userID}`
        );
        setUser(res.data);
      } catch (err) {
        console.error(err);
        alert("Failed to load user data");
      }
    };

    fetchUser();
  }, [userID, navigate]);

  const handleLogout = () => {
    localStorage.removeItem("userID");
    navigate("/login");
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-card">
        <h2>User Dashboard</h2>

        {user ? (
          <>
            <div className="user-info">
              <strong>User ID:</strong> {user.id}
            </div>

            <div className="user-info">
              <strong>Name:</strong> {user.name}
            </div>

            <div className="user-info">
              <strong>Email:</strong> {user.email}
            </div>

            <div className="user-info">
              <strong>Phone:</strong> {user.phone}
            </div>

            {/* Navigate to Daily Track */}
            <div
              className="user-info clickable"
              onClick={() => navigate("/daily-track")}
            >
              Go to Daily Tracks
            </div>

            <button
              className="logout-btn"
              onClick={handleLogout}
            >
              Logout
            </button>
          </>
        ) : (
          <p className="loading-text">
            Loading user profile...
          </p>
        )}
      </div>
    </div>
  );
}

export default Dashboard;