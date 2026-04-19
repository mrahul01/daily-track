import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function AddTrack() {
  const navigate = useNavigate();
  const userID = localStorage.getItem("userID");

  const [form, setForm] = useState({
    work: "",
    startTime: "",
    endTime: "",
    track_date: ""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post("http://localhost:8000/add-track", {
        userID: parseInt(userID),
        ...form
      });

      alert("Track added successfully!");
      navigate("/daily-track");
    } catch (err) {
      console.error(err);
      alert("Failed to add track");
    }
  };

  return (
    <div className="login-container">
      <h2>Add Daily Track</h2>

      <form onSubmit={handleSubmit}>

        <input
          type="text"
          name="work"
          placeholder="Work"
          onChange={handleChange}
          required
        />
        <br /><br />

        <input
          type="time"
          name="startTime"
          onChange={handleChange}
          required
        />
        <br /><br />

        <input
          type="time"
          name="endTime"
          onChange={handleChange}
          required
        />
        <br /><br />

        <input
          type="date"
          name="track_date"
          onChange={handleChange}
          required
        />
        <br /><br />

        <button type="submit">Save</button>
      </form>
    </div>
  );
}

export default AddTrack;