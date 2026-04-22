import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '/src/App.css';

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    emailID: '',
    password: ''
  });

  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // OTP STATES
  const [isPhoneLogin, setIsPhoneLogin] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');

  // ---------------- EMAIL LOGIN ----------------
 const handleSubmit = async (e) => {
  e.preventDefault();

  if (isPhoneLogin) {
    alert("Phone login is under development 🚧");
    return;
  }

  // Basic validation
  if (!formData.emailID || !formData.password) {
    setMessage("Please fill all fields");
    alert("Please fill all fields");
    return;
  }

  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(formData.emailID)) {
    setMessage("Invalid email format");
    alert("Please enter a valid email address");
    return;
  }

  // Phone validation (optional if used somewhere)
  const phoneRegex = /^[6-9]\d{9}$/;
  if (formData.phoneNO && !phoneRegex.test(formData.phoneNO)) {
    setMessage("Invalid phone number");
    alert("Please enter a valid 10-digit phone number");
    return;
  }

  setLoading(true);
  setMessage('');

  try {
    const res = await axios.post('http://localhost:8000/login', {
      emailID: formData.emailID,
      password: formData.password
    });

    localStorage.setItem("userID", res.data.user.id);

    setMessage(res.data.message);
    alert("Login successful ");

    navigate('/dashboard');

  } catch (err) {
    const errorMsg = err.response?.data?.detail || "Login failed";

    // 🎯 Custom alerts based on backend response
    if (errorMsg === "User not found") {
      alert("Email is not registered ");
    } else if (errorMsg === "Wrong password") {
      alert("Incorrect password ");
    } else {
      alert(errorMsg);
    }

    setMessage(errorMsg);

  } finally {
    setLoading(false);
  }
};

  // ---------------- SEND OTP ----------------
  const sendOtp = async () => {
    alert("OTP requests are reached limit. Please try to login using email,password.");
    setMessage("OTP requests are reached limit. Please try to login using email,password.");
    if (!formData.emailID) {
      alert("Please enter your phone number");
      setMessage("Please enter your phone number");
      return;
    }


  };

  // ---------------- VERIFY OTP ----------------
  const verifyOtp = async () => {
    alert("OTP verification is under development");
    setMessage("OTP verification is under development");
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Login</h2>

        {/* EMAIL OR PHONE INPUT */}
        <input
          type="text"
          placeholder="Email or Phone"
          value={formData.emailID}
          onChange={(e) => {
            const value = e.target.value;

            setFormData({ ...formData, emailID: value });

            // detect phone login
            if (/^[0-9]{10}$/.test(value)) {
              setIsPhoneLogin(true);
            } else {
              setIsPhoneLogin(false);
              setOtpSent(false);
            }
          }}
        />

        {/* PASSWORD ONLY FOR EMAIL LOGIN */}
        {!isPhoneLogin && (
          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
          />
        )}

        {/* EMAIL LOGIN BUTTON */}
        {!isPhoneLogin && (
          <button type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        )}

        {/* PHONE LOGIN - SEND OTP */}
        {isPhoneLogin && !otpSent && (
          <button type="button" onClick={sendOtp}>
            Send OTP
          </button>
        )}

        {/* PHONE LOGIN - VERIFY OTP */}
        {isPhoneLogin && otpSent && (
          <>
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />

            <button type="button" onClick={verifyOtp}>
              Verify OTP
            </button>
          </>
        )}

        {/* REGISTER LINK */}
        <p className="toggle-text">
          Don't have an account?{" "}
          <span onClick={() => navigate('/register')}>
            Register here
          </span>
        </p>

        {/* MESSAGE */}
        {message && <p className="msg">{message}</p>}
      </form>
    </div>
  );
}

export default Login;