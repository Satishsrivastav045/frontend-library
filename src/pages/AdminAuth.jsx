import { useState } from 'react';
import { adminLogin, adminRegister } from '../services/api';
import { useNavigate } from 'react-router-dom';

const AdminAuth = () => {
  const navigate = useNavigate();

  const [mode, setMode] = useState('login'); // login | register
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: ''
  });

  const submit = async (event) => {
    event.preventDefault();

    if (!form.email || !form.password) {
      return alert('Email & Password required');
    }

    if (mode === 'register' && !form.name) {
      return alert('Name required');
    }

    try {
      setLoading(true);

      if (mode === 'register') {
        await adminRegister(form);
        alert('✅ Admin registered, now login');
        setMode('login');
      } else {
        const res = await adminLogin({
          email: form.email,
          password: form.password
        });

        localStorage.setItem('adminToken', res.data.token);
        navigate('/dashboard');
      }

    } catch (err) {
      alert(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={page}>
      <div style={card}>
        <h2 style={title}>
          📚 Student <span style={{ color: '#f97316' }}>Study Library</span>
        </h2>

        <form onSubmit={submit}>
          {/* 🔀 TOGGLE */}
          <div style={toggle}>
            <button
              type="button"
              onClick={() => setMode('login')}
              style={mode === 'login' ? activeTab : tab}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setMode('register')}
              style={mode === 'register' ? activeTab : tab}
            >
              Register
            </button>
          </div>

          {/* REGISTER NAME */}
          {mode === 'register' && (
            <input
              style={input}
              placeholder="Admin Name"
              autoComplete="name"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
            />
          )}

          <input
            style={input}
            placeholder="Email"
            autoComplete="email"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
          />

          <input
            style={input}
            type="password"
            placeholder="Password"
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
          />

          <button type="submit" style={submitBtn} disabled={loading}>
            {loading
              ? 'Please wait...'
              : mode === 'login'
              ? 'Login'
              : 'Register'}
          </button>
        </form>
      </div>
    </div>
  );
};

/* 🎨 STYLES */
const page = {
  minHeight: '100vh',
  background: '#020617',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

const card = {
  width: 420,
  background: '#020617',
  padding: 30,
  borderRadius: 14,
  border: '1px solid #1f2937',
  boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
  color: '#fff',
  textAlign: 'center'
};

const title = {
  marginBottom: 20,
  fontWeight: 700
};

const toggle = {
  display: 'flex',
  marginBottom: 20,
  borderRadius: 8,
  overflow: 'hidden',
  border: '1px solid #374151'
};

const tab = {
  flex: 1,
  padding: 10,
  background: '#020617',
  color: '#9ca3af',
  border: 'none',
  cursor: 'pointer'
};

const activeTab = {
  ...tab,
  background: '#f97316',
  color: '#fff',
  fontWeight: 600
};

const input = {
  width: '100%',
  padding: '12px 14px',
  marginBottom: 15,
  borderRadius: 8,
  border: '1px solid #374151',
  background: '#020617',
  color: '#fff',
  outline: 'none'
};

const submitBtn = {
  width: '100%',
  padding: 12,
  background: '#f97316',
  border: 'none',
  borderRadius: 8,
  fontWeight: 600,
  cursor: 'pointer',
  color: '#fff'
};

export default AdminAuth;
