import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { setToken } from '../auth';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
  const API = import.meta.env.VITE_API_BASE_URL;
  const res = await axios.post(`${API}/auth/login`, { username, password });
      setToken(res.data.token);
      navigate('/admin');
    } catch (err) {
      const msg = err?.response?.data?.message || 'Login failed';
      setError(msg);
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen p-4 flex items-center justify-center">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow w-full max-w-sm">
        <h1 className="text-xl font-bold mb-4">Admin Login</h1>
        <div className="mb-3">
          <label className="block mb-1">Username</label>
          <input className="border p-2 w-full" value={username} onChange={(e) => setUsername(e.target.value)} required />
        </div>
        <div className="mb-3">
          <label className="block mb-1">Password</label>
          <input type="password" className="border p-2 w-full" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
        <button type="submit" className="bg-blue-600 text-white p-2 w-full">Login</button>
      </form>
    </div>
  );
};

export default Login;
