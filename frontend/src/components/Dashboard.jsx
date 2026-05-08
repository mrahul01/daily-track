import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaEdit, FaSave, FaTimes } from "react-icons/fa";
import "/src/App.css";

const BASE_URL = "http://localhost:8000";

function Dashboard() {
  const navigate = useNavigate();

  const userID = localStorage.getItem("userID");
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [updatedUser, setUpdatedUser] = useState({
    name: "",
    email: "",
    phone: ""
  });

  useEffect(() => {
    if (!userID) {
      navigate("/login");
      return;
    }

    const fetchUser = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/user/${userID}`);
        setUser(res.data);
        setUpdatedUser({
          name: res.data.name,
          email: res.data.email,
          phone: res.data.phone
        });
      } catch (err) {
        alert("Failed to load user data");
      }
    };

    fetchUser();
  }, [userID, navigate]);

  const handleLogout = () => {
    localStorage.removeItem("userID");
    navigate("/login");
  };

  const handleChange = (e) => {
    setUpdatedUser({
      ...updatedUser,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = async () => {
    try {
      await axios.put(`${BASE_URL}/user/${userID}`, updatedUser);
      setUser(updatedUser);
      setEditMode(false);
      alert("Profile updated successfully");
    } catch (err) {
      alert("Update failed");
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-card">

        <div className="dashboard-header">
          <h2>Dashboard</h2>

          {!editMode ? (
            <FaEdit className="edit-icon" onClick={() => setEditMode(true)} />
          ) : (
            <div>
              <FaSave className="edit-icon" onClick={handleSave} />
              <FaTimes className="edit-icon" onClick={() => setEditMode(false)} />
            </div>
          )}
        </div>

        {user ? (
          <>
            <div className="user-info">
              <strong>Name:</strong>{" "}
              {editMode ? (
                <input
                  name="name"
                  value={updatedUser.name}
                  onChange={handleChange}
                />
              ) : (
                user.name
              )}
            </div>

            <div className="user-info">
              <strong>Email:</strong>{" "}
              {editMode ? (
                <input
                  name="email"
                  value={updatedUser.email}
                  onChange={handleChange}
                />
              ) : (
                user.email
              )}
            </div>

            <div className="user-info">
              <strong>Phone:</strong>{" "}
              {editMode ? (
                <input
                  name="phone"
                  value={updatedUser.phone}
                  onChange={handleChange}
                />
              ) : (
                user.phone
              )}
            </div>

            <div className="dashboard-actions">
              <div
                className="action-card"
                onClick={() => navigate("/daily-track")}
              >
                View Your Daily Track
              </div>
            </div>

            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <p>Loading...</p>
        )}
      </div>
    </div>
  );
}

export default Dashboard;