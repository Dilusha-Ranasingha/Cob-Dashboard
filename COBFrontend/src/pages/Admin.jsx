import { useState } from 'react';
import axios from 'axios';
import { getToken, clearToken } from '../auth';
import { useNavigate } from 'react-router-dom';

const Admin = () => {
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [message, setMessage] = useState('');

  const calculateDuration = (start, end) => {
    let [sh, sm] = start.split(':').map(Number);
    let [eh, em] = end.split(':').map(Number);
    let startMin = sh * 60 + sm;
    let endMin = eh * 60 + em;
    if (endMin < startMin) endMin += 1440; // next day
    const diffMin = endMin - startMin;
    const hours = Math.floor(diffMin / 60);
    const mins = diffMin % 60;
    return `${hours}h ${mins}m`;
  };

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const durationText = calculateDuration(startTime, endTime);
    try {
      await axios.post('http://localhost:5001/api/cobs', { date, startTime, endTime, durationText }, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setMessage('Added successfully!');
      setDate('');
      setStartTime('');
      setEndTime('');
    } catch (err) {
      setMessage('Error adding entry');
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen p-4">
      <h1 className="text-2xl font-bold text-center">Admin - Add COB Entry</h1>
      <form onSubmit={handleSubmit} className="max-w-md mx-auto mt-4 bg-white p-4 shadow">
        <div className="mb-4">
          <label className="block">Date (DD/MM/YYYY)</label>
          <input type="text" value={date} onChange={e => setDate(e.target.value)} className="border p-2 w-full" placeholder="01/07/2025" required />
        </div>
        <div className="mb-4">
          <label className="block">Start Time (HH:MM)</label>
          <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="border p-2 w-full" required />
        </div>
        <div className="mb-4">
          <label className="block">End Time (HH:MM)</label>
          <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className="border p-2 w-full" required />
        </div>
        <button type="submit" className="bg-blue-500 text-white p-2 w-full">Add Entry</button>
        {message && <p className="mt-2 text-center">{message}</p>}
      </form>
      <div className="flex justify-center gap-4 mt-4">
        <a href="/" className="text-blue-500">Back to Dashboard</a>
        <button className="text-red-600" onClick={() => { clearToken(); navigate('/login'); }}>Logout</button>
      </div>
    </div>
  );
};

export default Admin;