import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import DailyTrack from "./components/DailyTrack";
import AddTrack from "./components/AddTrack";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/daily-track" element={<DailyTrack />} />
      <Route path="/add-track" element={<AddTrack />} />
    </Routes>
    
  );
}

export default App;