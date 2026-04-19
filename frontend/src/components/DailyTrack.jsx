import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function DailyTrack() {
  const navigate = useNavigate();
  const userID = localStorage.getItem("userID");

  const [data, setData] = useState([]);

  useEffect(() => {
    if (!userID) return;

    axios
      .get(`http://localhost:8000/get-track/${userID}`)
      .then((res) => {
        const records = Array.isArray(res.data)
          ? res.data
          : res.data.data || [];

        setData(records);
      })
      .catch((err) => {
        console.error(err);
        setData([]);
      });
  }, [userID]);

  return (
    <div className="login-container">
      <h2>Daily Track Records</h2>

      <button onClick={() => navigate("/dashboard")}>
        Back
      </button>

      <button
        onClick={() => navigate("/add-track")}
        style={{
          marginLeft: "10px",
          padding: "8px 12px",
          background: "green",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer"
        }}
      >
      Add Daily Track
      </button>

      <h3>Work Details</h3>

      {data.length > 0 ? (
        <table border="1" style={{ width: "100%", marginTop: "10px" }}>
          <thead>
            <tr>
              <th>Work</th>
              <th>Start Time</th>
              <th>End Time</th>
              <th>Date</th>
            </tr>
          </thead>

          <tbody>
            {data.map((item, index) => 
            {
              let starting = new Date(item.startTime * 1000).toISOString().slice(11, 19);
              let ending = new Date(item.endTime * 1000).toISOString().slice(11, 19);
              return (
                <tr key={index}>
                  <td>{item.work}</td>
                  <td>{starting}</td>
                  <td>{ending}</td>
                  <td>{item.track_date}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        <p>No records found</p>
      )}
    </div>
  );
}

export default DailyTrack;