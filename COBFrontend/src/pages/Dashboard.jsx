import { useEffect, useState } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';

const Dashboard = () => {
  const [cobs, setCobs] = useState([]);
  const [filteredCobs, setFilteredCobs] = useState([]);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  useEffect(() => {
    fetchCobs();
  }, []);

  const fetchCobs = async () => {
    try {
  const API = import.meta.env.VITE_API_BASE_URL;
  const res = await axios.get(`${API}/cobs`);
      const sorted = res.data.sort((a, b) => parseDate(a.date) - parseDate(b.date));
      setCobs(sorted);
      setFilteredCobs(sorted);
    } catch (err) {
      console.error(err);
    }
  };

  const parseDate = (dateStr) => {
    const [d, m, y] = dateStr.split('/').map(Number);
    return new Date(y, m - 1, d);
  };

  const filterData = () => {
    let filtered = cobs;
    if (fromDate) {
      const from = new Date(fromDate);
      filtered = filtered.filter(cob => parseDate(cob.date) >= from);
    }
    if (toDate) {
      const to = new Date(toDate);
      filtered = filtered.filter(cob => parseDate(cob.date) <= to);
    }
    setFilteredCobs(filtered);
  };

  useEffect(() => {
    filterData();
  }, [fromDate, toDate, cobs]);

  const getChartData = () => {
    return filteredCobs.map(cob => {
      const startHours = timeToHours(cob.startTime);
      let endHours = timeToHours(cob.endTime);
      if (endHours < startHours) endHours += 24;
      const durationHours = (endHours - startHours);
      return { date: cob.date, startHours, endHours, durationHours };
    });
  };

  const timeToHours = (time) => {
    const [h, m] = time.split(':').map(Number);
    return h + m / 60;
  };

  const latestCob = filteredCobs[filteredCobs.length - 1] || {};

  const chartData = getChartData();

  return (
    <div className="bg-gray-100 min-h-screen p-4">
      <h1 className="text-2xl font-bold text-center bg-black text-white py-2">DFCC - Production COB Analyzer</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div className="bg-white p-4 shadow">
          <h2 className="text-lg font-bold bg-red-600 text-white p-2">COB Table</h2>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-2">Date</th>
                <th className="border p-2">Start Time</th>
                <th className="border p-2">End Time</th>
                <th className="border p-2">DurationText</th>
              </tr>
            </thead>
            <tbody>
              {filteredCobs.map((cob, i) => (
                <tr key={i}>
                  <td className="border p-2">{cob.date}</td>
                  <td className="border p-2">{cob.startTime}</td>
                  <td className="border p-2">{cob.endTime}</td>
                  <td className="border p-2">{cob.durationText}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div>
          <div className="bg-white p-4 shadow mb-4">
            <h2 className="text-lg font-bold bg-red-600 text-white p-2">Date Range</h2>
            <div className="flex space-x-4">
              <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} className="border p-2" />
              <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} className="border p-2" />
            </div>
          </div>
          <div className="bg-white p-4 shadow mb-4">
            <h2 className="text-lg font-bold bg-red-600 text-white p-2">Latest COB</h2>
            <p>{latestCob.date} Start: {latestCob.startTime}, End: {latestCob.endTime}, Duration: {latestCob.durationText}</p>
          </div>
          <div className="bg-white p-4 shadow mb-4">
            <h2 className="text-lg font-bold bg-red-600 text-white p-2">Start Time and End Time</h2>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="startHours" stroke="#add8e6" name="StartHours" />
                <Line type="monotone" dataKey="endHours" stroke="#00008b" name="EndHours" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white p-4 shadow">
            <h2 className="text-lg font-bold bg-red-600 text-white p-2">COB Duration</h2>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="durationHours" stroke="#ff7300" fill="#ff7300" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white p-4 shadow mt-4">
            <h2 className="text-lg font-bold bg-red-600 text-white p-2">COB Duration (Bar)</h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="durationHours" fill="#3182ce" name="Duration (hrs)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white p-4 shadow mt-4">
            <h2 className="text-lg font-bold bg-red-600 text-white p-2">COB Duration (Line)</h2>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="linear" dataKey="durationHours" stroke="#16a34a" name="Duration (hrs)" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
  <a href="/login" className="block text-center mt-4 text-blue-500">Go to Admin</a>
    </div>
  );
};

export default Dashboard;