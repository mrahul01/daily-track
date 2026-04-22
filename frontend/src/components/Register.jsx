import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '/src/App.css';

function Register() {
  const navigate = useNavigate();

  const [isOtpMode, setIsOtpMode] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');

  const [formData, setFormData] = useState({
    userNAME: '',
    emailID: '',
    phoneNO: '',
    password: '',
    isOtpMode: false
  });

  const [msg, setMsg] = useState('');

  // ---------------- FULL REGISTER ----------------
 const handleRegister = async (e) => {
  e.preventDefault();

  if (formData.phoneNO && !/^\d{10}$/.test(formData.phoneNO)) {
    alert("Please enter a valid 10-digit phone number");
    setMsg("Please enter a valid 10-digit phone number");
    return;
  }

  if (isOtpMode) {
    alert("OTP signup is under development");
    setMsg("OTP signup is under development");
    return;
  }

  if (!formData.userNAME || !formData.emailID || !formData.password) {
    setMsg("Please fill all fields");
    return;
  }

  try {
    if (!formData.phoneNO) {
      formData.phoneNO = "0000000000";
    }
    const res = await axios.post('http://localhost:8000/register', {
      userNAME: formData.userNAME,
      emailID: formData.emailID,
      phoneNO: formData.phoneNO,
      password: formData.password
    });
    alert("Registration successful! Redirecting to login...");
    setTimeout(() => navigate("/login"), 1000);

  } catch (err) {
    console.error(err);
    setMsg(err.response?.data?.detail || "Registration failed");
  }
};
const sendOtp = () => {
  alert("OTP feature is under development");
  setMsg("OTP feature is under development");
};

const verifyOtp = () => {
  setMsg("OTP verification is under development");
};


  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleRegister}>
        <h2>Register</h2>

        {/* 🔥 SINGLE TOGGLE BUTTON */}
        <button
          type="button"
          onClick={() => {
            setIsOtpMode(!isOtpMode);
            setOtpSent(false);
            setOtp('');
            if (!isOtpMode) {alert("The otp signup is under development. Please use full signup for now."); setMsg("OTP signup is under development. Please use full signup for now.");}
            else {setMsg('')}
          }}
          style={{
            background: isOtpMode ? "#28a745" : "#007bff",
            color: "white",
            padding: "10px",
            border: "none",
            borderRadius: "6px",
            marginBottom: "15px",
            cursor: "pointer"
          }}
        >
          {isOtpMode ? "Switch to Full Signup" : "Switch to Quick OTP Signup"}
        </button>

        {/* NAME */}
        <input
          type="text"
          placeholder="Full Name"
          onChange={e =>
            setFormData({ ...formData, userNAME: e.target.value })
          }
          required
        />

        {/* PHONE */}
        <input
          type="text"
          placeholder="Phone Number (optional)"
          onChange={e =>
            setFormData({ ...formData, phoneNO: e.target.value })
          }
        />

        {/* FULL SIGNUP MODE */}
        {!isOtpMode && (
          <>
            <input
              type="email"
              placeholder="Email"
              onChange={e =>
                setFormData({ ...formData, emailID: e.target.value })
              }
            />

            <input
              type="password"
              placeholder="Password"
              onChange={e =>
                setFormData({ ...formData, password: e.target.value })
              }
            />

            <button type="submit">Create Account</button>
          </>
        )}

        {/* OTP MODE */}
        {isOtpMode && !otpSent && (
          <button type="button" onClick={sendOtp}>
            Send OTP
          </button>
        )}

        {isOtpMode && otpSent && (
          <>
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />

            <button type="button" onClick={verifyOtp}>
              Verify & Create Account
            </button>
          </>
        )}

        {/* LOGIN LINK */}
        <p className="toggle-text">
          Already have an account?{" "}
          <span onClick={() => navigate('/login')}>
            Login here
          </span>
        </p>

        {msg && <p className="msg">{msg}</p>}
      </form>
    </div>
  );
}

export default Register;