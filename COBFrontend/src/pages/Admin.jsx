import { useEffect, useState } from 'react';
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
  const [cobs, setCobs] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const durationText = calculateDuration(startTime, endTime);
    try {
  const API = import.meta.env.VITE_API_BASE_URL;
  await axios.post(`${API}/cobs`, { date, startTime, endTime, durationText }, {
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

  const API = import.meta.env.VITE_API_BASE_URL;

  const fetchCobs = async () => {
    try {
      const res = await axios.get(`${API}/cobs`);
      setCobs(res.data);
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    fetchCobs();
  }, []);

  const startEdit = (cob) => {
    setEditingId(cob._id);
    setDate(cob.date);
    setStartTime(cob.startTime);
    setEndTime(cob.endTime);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDate('');
    setStartTime('');
    setEndTime('');
  };

  const saveEdit = async (id) => {
    const durationText = calculateDuration(startTime, endTime);
    try {
      await axios.put(`${API}/cobs/${id}`, { date, startTime, endTime, durationText }, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setMessage('Updated successfully!');
      cancelEdit();
      fetchCobs();
    } catch (e) {
      setMessage('Error updating entry');
    }
  };

  const deleteRow = async (id) => {
    if (!confirm('Delete this entry?')) return;
    try {
      await axios.delete(`${API}/cobs/${id}`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setMessage('Deleted successfully!');
      fetchCobs();
    } catch (e) {
      setMessage('Error deleting entry');
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
      <div className="max-w-4xl mx-auto mt-6 bg-white p-4 shadow">
        <h2 className="text-lg font-bold mb-2">COB Table</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-2">Date</th>
                <th className="border p-2">Start Time</th>
                <th className="border p-2">End Time</th>
                <th className="border p-2">Duration</th>
                <th className="border p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {cobs.map((cob) => (
                <tr key={cob._id}>
                  <td className="border p-2">
                    {editingId === cob._id ? (
                      <input className="border p-1" value={date} onChange={(e)=>setDate(e.target.value)} />
                    ) : cob.date}
                  </td>
                  <td className="border p-2">
                    {editingId === cob._id ? (
                      <input type="time" className="border p-1" value={startTime} onChange={(e)=>setStartTime(e.target.value)} />
                    ) : cob.startTime}
                  </td>
                  <td className="border p-2">
                    {editingId === cob._id ? (
                      <input type="time" className="border p-1" value={endTime} onChange={(e)=>setEndTime(e.target.value)} />
                    ) : cob.endTime}
                  </td>
                  <td className="border p-2">{cob.durationText}</td>
                  <td className="border p-2 space-x-2">
                    {editingId === cob._id ? (
                      <>
                        <button className="bg-green-600 text-white px-2 py-1" onClick={() => saveEdit(cob._id)}>Save</button>
                        <button className="bg-gray-400 text-white px-2 py-1" onClick={cancelEdit}>Cancel</button>
                      </>
                    ) : (
                      <>
                        <button className="bg-blue-600 text-white px-2 py-1" onClick={() => startEdit(cob)}>Edit</button>
                        <button className="bg-red-600 text-white px-2 py-1" onClick={() => deleteRow(cob._id)}>Delete</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="flex justify-center gap-4 mt-4">
        <a href="/" className="text-blue-500">Back to Dashboard</a>
        <button className="text-red-600" onClick={() => { clearToken(); navigate('/login'); }}>Logout</button>
      </div>
    </div>
  );
};

export default Admin;