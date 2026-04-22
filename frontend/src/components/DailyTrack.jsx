import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import "/src/App.css";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AF19FF"];

const safeString = (val) => {
  if (val === null || val === undefined) return "-";
  if (typeof val === "string") return val || "-";
  if (typeof val === "number") return String(val);
  if (typeof val === "object") {
    if (val instanceof Date) return val.toLocaleString();
    return JSON.stringify(val);
  }
  return String(val);
};

const toSeconds = (time) => {
  try {
    if (!time) return 0;
    if (typeof time === "number") return time % (24 * 3600);
    if (time instanceof Date)
      return time.getHours() * 3600 + time.getMinutes() * 60 + time.getSeconds();
    if (typeof time === "string") {
      const timePart = time.includes("T") ? time.split("T")[1] : time;
      const clean = timePart.substring(0, 8);
      const [h, m, s = 0] = clean.split(":").map(Number);
      return h * 3600 + m * 60 + s;
    }
    return 0;
  } catch {
    return 0;
  }
};

const formatTime = (seconds) => {
  if (!seconds) return "-";

  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);

  const date = new Date();
  date.setHours(hrs, mins, 0);

  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

const getDuration = (startTime, endTime) => {
  try {
    let start = toSeconds(startTime);
    let end = toSeconds(endTime);

    let duration = end - start;
    if (duration < 0) duration = end + 24 * 3600 - start;

    const totalMinutes = Math.round(duration / 60);
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;

    if (hours === 0) return `${mins} min`;
    if (mins === 0) return `${hours} hr`;
    return `${hours} hr ${mins} min`;
  } catch {
    return "-";
  }
};

const getHoursDecimal = (startTime, endTime) => {
  try {
    let start = toSeconds(startTime);
    let end = toSeconds(endTime);

    let duration = end - start;
    if (duration < 0) duration = end + 24 * 3600 - start;

    return duration / 3600;
  } catch {
    return 0;
  }
};

function DailyTrack() {
  const navigate = useNavigate();
  const userID = localStorage.getItem("userID");

  const [data, setData] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setSelectedDate(today);
  }, []);

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
      .catch(() => setData([]));
  }, [userID]);

  const filteredData = selectedDate
    ? data.filter((item) => safeString(item.track_date) === selectedDate)
    : data;

  const workSummary = {};

  filteredData.forEach((item) => {
    const work = safeString(item.work);
    if (work === "-") return;

    const hours = getHoursDecimal(item.startTime, item.endTime);
    workSummary[work] = (workSummary[work] || 0) + hours;
  });

  const pieData = Object.keys(workSummary).map((key) => {
    const totalMins = Math.round(workSummary[key] * 60);
    const h = Math.floor(totalMins / 60);
    const m = totalMins % 60;

    return {
      name: key,
      value: parseFloat(workSummary[key].toFixed(2)),
      label: h === 0 ? `${m}m` : m === 0 ? `${h}h` : `${h}h ${m}m`,
    };
  });

  const totalMinsAll = filteredData.reduce((sum, item) => {
    return sum + Math.round(getHoursDecimal(item.startTime, item.endTime) * 60);
  }, 0);

  const totalH = Math.floor(totalMinsAll / 60);
  const totalM = totalMinsAll % 60;

  const totalLabel =
    totalH === 0 ? `${totalM} min` : totalM === 0 ? `${totalH} hr` : `${totalH} hr ${totalM} min`;

  return (
    <div className="daily-track-container">

      <div className="daily-track-header">
        <h2>Daily Track Records</h2>

        <div className="header-buttons">
          <button className="btn" onClick={() => navigate("/dashboard")}>
            ← Back
          </button>

          <button className="btn btn-green" onClick={() => navigate("/add-track")}>
            + Add Track
          </button>
        </div>
      </div>

      <div className="date-filter">
        <label>Select Date:</label>

        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />

        {filteredData.length > 0 && (
          <span>
            {filteredData.length} record(s) — <strong>{totalLabel}</strong>
          </span>
        )}
      </div>

      {filteredData.length > 0 ? (
        <div className="content-wrapper">

          <div className="table-container">
            <h3>Work Details</h3>

            <table className="table">
              <thead>
                <tr>
                  <th>Work</th>
                  <th>Duration</th>
                  <th>Start</th>
                  <th>End</th>
                </tr>
              </thead>

              <tbody>
                {filteredData.map((item, i) => (
                  <tr key={i}>
                    <td>
                      <span
                        className="work-dot"
                        style={{
                          background:
                            COLORS[
                              Object.keys(workSummary).indexOf(safeString(item.work)) %
                                COLORS.length
                            ],
                        }}
                      />
                      {safeString(item.work)}
                    </td>

                    <td className="center">
                      {getDuration(item.startTime, item.endTime)}
                    </td>

                    <td className="center">
                      {formatTime(item.startTime)}
                    </td>

                    <td className="center">
                      {formatTime(item.endTime)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="divider" />
          <div className="pie-container">
            
            <h3>Work Distribution</h3>
        <hr style={{ border: "1px solid #ccc", margin: "20px 0" }} />
            <PieChart width={500} height={400}>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                labelLine={false}
                label={({ name, payload }) => `${name} (${payload.label})`}
              >
                {pieData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>

              <Tooltip formatter={(value, name, props) => [props.payload.label, name]} />
              <Legend />
            </PieChart>
          </div>

        </div>
      ) : (
        <p className="no-data">No records found for this date.</p>
      )}
    </div>
  );
}

export default DailyTrack;