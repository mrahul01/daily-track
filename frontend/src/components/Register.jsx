import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '/src/App.css';

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    userID: '',
    userNAME: '',
    emailID: '',
    phoneNO: '',
    password: ''
  });

  const [msg, setMsg] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post('http://localhost:8000/register', {
        userID: Number(formData.userID),
        name: formData.userNAME,
        email: formData.emailID,
        phone: formData.phoneNO,
        password: formData.password
      });

      setMsg(res.data.message);

      setTimeout(() => {
        navigate('/login');
      }, 1000);

    } catch (err) {
      setMsg(err.response?.data?.detail || "Registration failed");
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleRegister}>
        <h2>Register</h2>

        <input
          type="number"
          placeholder="User ID"
          onChange={e =>
            setFormData({ ...formData, userID: e.target.value })
          }
          required
        />

        <input
          type="text"
          placeholder="Full Name"
          onChange={e =>
            setFormData({ ...formData, userNAME: e.target.value })
          }
          required
        />

        <input
          type="email"
          placeholder="Email"
          onChange={e =>
            setFormData({ ...formData, emailID: e.target.value })
          }
          required
        />

        <input
          type="text"
          placeholder="Phone Number"
          onChange={e =>
            setFormData({ ...formData, phoneNO: e.target.value })
          }
          required
        />

        <input
          type="password"
          placeholder="Password"
          onChange={e =>
            setFormData({ ...formData, password: e.target.value })
          }
          required
        />

        <button type="submit">Create Account</button>

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