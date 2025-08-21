"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
} from "recharts"

const Dashboard = () => {
  const [cobs, setCobs] = useState([])
  const [filteredCobs, setFilteredCobs] = useState([])
  const [fromDate, setFromDate] = useState("")
  const [toDate, setToDate] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCobs()
  }, [])

  // Real-time updates: listen for updates broadcast from Admin and re-fetch
  useEffect(() => {
    let channel
    const onUpdate = () => {
      fetchCobs()
    }
    try {
      channel = new BroadcastChannel("cob-updates")
      channel.onmessage = (e) => {
        if (e?.data?.type === "COB_UPDATED") onUpdate()
      }
    } catch (_) {
      // BroadcastChannel not supported; ignore
    }

    const storageListener = (e) => {
      if (e.key === "COB_UPDATED") onUpdate()
    }
    window.addEventListener("storage", storageListener)

    // Optional gentle polling fallback (e.g., single-tab use); 60s interval
    const interval = setInterval(() => {
      // Only poll if page is visible to reduce unnecessary calls
      if (document.visibilityState === "visible") fetchCobs()
    }, 60000)

    return () => {
      try {
        channel && channel.close()
      } catch (_) {}
      window.removeEventListener("storage", storageListener)
      clearInterval(interval)
    }
  }, [])

  const fetchCobs = async () => {
    try {
      setLoading(true)
      const API = import.meta.env.VITE_API_BASE_URL
      const res = await axios.get(`${API}/cobs`)
      const sorted = res.data.sort((a, b) => parseDate(a.date) - parseDate(b.date))
      setCobs(sorted)
      setFilteredCobs(sorted)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const parseDate = (dateStr) => {
    const [d, m, y] = dateStr.split("/").map(Number)
    return new Date(y, m - 1, d)
  }

  const filterData = () => {
    let filtered = cobs
    if (fromDate) {
      const from = new Date(fromDate)
      filtered = filtered.filter((cob) => parseDate(cob.date) >= from)
    }
    if (toDate) {
      const to = new Date(toDate)
      filtered = filtered.filter((cob) => parseDate(cob.date) <= to)
    }
    setFilteredCobs(filtered)
  }

  useEffect(() => {
    filterData()
  }, [fromDate, toDate, cobs])

  const getChartData = () => {
    return filteredCobs.map((cob) => {
      const startHours = timeToHours(cob.startTime)
      let endHours = timeToHours(cob.endTime)
      if (endHours < startHours) endHours += 24
      const durationHours = endHours - startHours
      return { date: cob.date, startHours, endHours, durationHours }
    })
  }

  const timeToHours = (time) => {
    const [h, m] = time.split(":").map(Number)
    return h + m / 60
  }

  const latestCob = filteredCobs[filteredCobs.length - 1] || {}
  const chartData = getChartData()

  const totalRecords = filteredCobs.length
  const avgDuration =
    chartData.length > 0
      ? (chartData.reduce((sum, item) => sum + item.durationHours, 0) / chartData.length).toFixed(2)
      : 0
  const maxDuration = chartData.length > 0 ? Math.max(...chartData.map((item) => item.durationHours)).toFixed(2) : 0
  const minDuration = chartData.length > 0 ? Math.min(...chartData.map((item) => item.durationHours)).toFixed(2) : 0

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-white text-lg font-medium">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 p-6">
      <div className="mb-8 animate-fade-in">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400 text-center mb-2">
          DFCC Production COB Analyzer
        </h1>
        <p className="text-gray-400 text-center text-lg">Real-time production monitoring and analytics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/20 backdrop-blur-sm border border-blue-500/20 rounded-2xl p-6 hover:scale-105 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/25">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-400 text-sm font-medium uppercase tracking-wide">Total Records</p>
              <p className="text-3xl font-bold text-white mt-2">{totalRecords}</p>
            </div>
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <div className="w-6 h-6 bg-blue-500 rounded-md"></div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/20 backdrop-blur-sm border border-emerald-500/20 rounded-2xl p-6 hover:scale-105 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/25">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-400 text-sm font-medium uppercase tracking-wide">Avg Duration</p>
              <p className="text-3xl font-bold text-white mt-2">{avgDuration}h</p>
            </div>
            <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
              <div className="w-6 h-6 bg-emerald-500 rounded-md"></div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/20 backdrop-blur-sm border border-amber-500/20 rounded-2xl p-6 hover:scale-105 transition-all duration-300 hover:shadow-2xl hover:shadow-amber-500/25">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-400 text-sm font-medium uppercase tracking-wide">Max Duration</p>
              <p className="text-3xl font-bold text-white mt-2">{maxDuration}h</p>
            </div>
            <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center">
              <div className="w-6 h-6 bg-amber-500 rounded-md"></div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/20 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-6 hover:scale-105 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/25">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-400 text-sm font-medium uppercase tracking-wide">Min Duration</p>
              <p className="text-3xl font-bold text-white mt-2">{minDuration}h</p>
            </div>
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
              <div className="w-6 h-6 bg-purple-500 rounded-md"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-1">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-500 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">COB Records</h2>
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            </div>

            <div className="bg-gray-900/50 rounded-xl border border-gray-700/50 max-h-[500px] overflow-auto">
              <table className="w-full">
                <thead className="sticky top-0 bg-gray-800/80 backdrop-blur-sm">
                  <tr>
                    <th className="text-left p-4 text-gray-300 font-semibold border-b border-gray-700">Date</th>
                    <th className="text-left p-4 text-gray-300 font-semibold border-b border-gray-700">Start</th>
                    <th className="text-left p-4 text-gray-300 font-semibold border-b border-gray-700">End</th>
                    <th className="text-left p-4 text-gray-300 font-semibold border-b border-gray-700">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCobs.map((cob, i) => (
                    <tr key={i} className="hover:bg-white/5 transition-colors duration-200 border-b border-gray-800/50">
                      <td className="p-4 text-white font-medium">{cob.date}</td>
                      <td className="p-4 text-blue-400">{cob.startTime}</td>
                      <td className="p-4 text-emerald-400">{cob.endTime}</td>
                      <td className="p-4 text-amber-400 font-semibold">{cob.durationText}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="xl:col-span-2 space-y-8">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-500">
            <h2 className="text-xl font-bold text-white mb-4">Date Range Filter</h2>
            <div className="flex gap-4 flex-wrap">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-gray-400 text-sm font-medium mb-2">From Date</label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="w-full bg-gray-900/50 text-white border border-gray-600 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:border-gray-500"
                />
              </div>
              <div className="flex-1 min-w-[200px]">
                <label className="block text-gray-400 text-sm font-medium mb-2">To Date</label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="w-full bg-gray-900/50 text-white border border-gray-600 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:border-gray-500"
                />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-cyan-500/10 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:scale-[1.02] transition-all duration-300">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              Latest COB
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-gray-400 text-sm">Date</p>
                <p className="text-white font-bold text-lg">{latestCob.date}</p>
              </div>
              <div className="text-center">
                <p className="text-gray-400 text-sm">Start</p>
                <p className="text-blue-400 font-bold text-lg">{latestCob.startTime}</p>
              </div>
              <div className="text-center">
                <p className="text-gray-400 text-sm">End</p>
                <p className="text-emerald-400 font-bold text-lg">{latestCob.endTime}</p>
              </div>
              <div className="text-center">
                <p className="text-gray-400 text-sm">Duration</p>
                <p className="text-amber-400 font-bold text-lg">{latestCob.durationText}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-500">
              <h2 className="text-xl font-bold text-white mb-4">Start & End Times</h2>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                  <XAxis dataKey="date" tick={{ fill: "#9CA3AF", fontSize: 12 }} stroke="#6B7280" />
                  <YAxis tick={{ fill: "#9CA3AF", fontSize: 12 }} stroke="#6B7280" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(17, 24, 39, 0.95)",
                      border: "1px solid rgba(59, 130, 246, 0.3)",
                      borderRadius: "12px",
                      color: "#fff",
                      backdropFilter: "blur(10px)",
                    }}
                  />
                  <Legend wrapperStyle={{ color: "#fff" }} />
                  <Line
                    type="monotone"
                    dataKey="startHours"
                    stroke="#60A5FA"
                    name="Start"
                    strokeWidth={3}
                    dot={{ fill: "#60A5FA", strokeWidth: 2, r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="endHours"
                    stroke="#34D399"
                    name="End"
                    strokeWidth={3}
                    dot={{ fill: "#34D399", strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-500">
              <h2 className="text-xl font-bold text-white mb-4">Duration Trend</h2>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                  <XAxis dataKey="date" tick={{ fill: "#9CA3AF", fontSize: 12 }} stroke="#6B7280" />
                  <YAxis tick={{ fill: "#9CA3AF", fontSize: 12 }} stroke="#6B7280" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(17, 24, 39, 0.95)",
                      border: "1px solid rgba(245, 158, 11, 0.3)",
                      borderRadius: "12px",
                      color: "#fff",
                      backdropFilter: "blur(10px)",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="durationHours"
                    stroke="#F59E0B"
                    fill="url(#durationGradient)"
                    strokeWidth={3}
                  />
                  <defs>
                    <linearGradient id="durationGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-500">
              <h2 className="text-xl font-bold text-white mb-4">Duration Bars</h2>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                  <XAxis dataKey="date" tick={{ fill: "#9CA3AF", fontSize: 12 }} stroke="#6B7280" />
                  <YAxis tick={{ fill: "#9CA3AF", fontSize: 12 }} stroke="#6B7280" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(17, 24, 39, 0.95)",
                      border: "1px solid rgba(139, 92, 246, 0.3)",
                      borderRadius: "12px",
                      color: "#fff",
                      backdropFilter: "blur(10px)",
                    }}
                  />
                  <Bar dataKey="durationHours" fill="#8B5CF6" name="Duration (hrs)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-500">
              <h2 className="text-xl font-bold text-white mb-4">Duration Line</h2>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                  <XAxis dataKey="date" tick={{ fill: "#9CA3AF", fontSize: 12 }} stroke="#6B7280" />
                  <YAxis tick={{ fill: "#9CA3AF", fontSize: 12 }} stroke="#6B7280" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(17, 24, 39, 0.95)",
                      border: "1px solid rgba(34, 197, 94, 0.3)",
                      borderRadius: "12px",
                      color: "#fff",
                      backdropFilter: "blur(10px)",
                    }}
                  />
                  <Line
                    type="linear"
                    dataKey="durationHours"
                    stroke="#22C55E"
                    name="Duration (hrs)"
                    strokeWidth={3}
                    dot={{ fill: "#22C55E", strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12 text-center">
        <a
          href="/login"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/25"
        >
          <span>Go to Admin</span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </a>
      </div>
    </div>
  )
}

export default Dashboard
