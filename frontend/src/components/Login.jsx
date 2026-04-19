import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '/src/App.css';

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    userID: '',
    password: ''
  });

  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.userID || !formData.password) {
      setMessage("Please fill all fields");
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const res = await axios.post('http://localhost:8000/login', {
        userID: Number(formData.userID),
        password: formData.password
      });
      console.log(res.data);
      localStorage.setItem("userID", formData.userID);

      setMessage(res.data.message);

      navigate('/dashboard');

    } catch (err) {
      setMessage(err.response?.data?.detail || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Login</h2>

        <input
          type="number"
          placeholder="User ID"
          value={formData.userID}
          onChange={(e) =>
            setFormData({ ...formData, userID: e.target.value })
          }
        />

        <input
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
        />

        <button type="submit" disabled={loading}>
          {loading ? "Signing in..." : "Sign In"}
        </button>

        <p className="toggle-text">
          Don't have an account?{" "}
          <span onClick={() => navigate('/register')}>
            Register here
          </span>
        </p>

        {message && <p className="msg">{message}</p>}
      </form>
    </div>
  );
}

export default Login;