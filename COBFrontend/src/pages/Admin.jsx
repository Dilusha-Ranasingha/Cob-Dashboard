"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { getToken, clearToken } from "../auth"
import { useNavigate } from "react-router-dom"

const Admin = () => {
  const [date, setDate] = useState("")
  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")
  const [message, setMessage] = useState("")

  const calculateDuration = (start, end) => {
    const [sh, sm] = start.split(":").map(Number)
    const [eh, em] = end.split(":").map(Number)
    const startMin = sh * 60 + sm
    let endMin = eh * 60 + em
    if (endMin < startMin) endMin += 1440 // next day
    const diffMin = endMin - startMin
    const hours = Math.floor(diffMin / 60)
    const mins = diffMin % 60
    return `${hours}h ${mins}m`
  }

  const navigate = useNavigate()
  const [cobs, setCobs] = useState([])
  const [editingId, setEditingId] = useState(null)

  // Notify other tabs/pages (e.g., Dashboard) to refresh when data changes
  const notifyCobChange = () => {
    try {
      const channel = new BroadcastChannel("cob-updates")
      channel.postMessage({ type: "COB_UPDATED", at: Date.now() })
      channel.close()
    } catch (_) {
      // BroadcastChannel may not be supported; fall back to storage events
    }
    try {
      localStorage.setItem("COB_UPDATED", String(Date.now()))
      // Optional cleanup to avoid clutter; keep event for listeners
      // setTimeout(() => localStorage.removeItem("COB_UPDATED"), 0)
    } catch (_) {
      // Ignore storage errors (e.g., private mode)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const durationText = calculateDuration(startTime, endTime)
    try {
      const API = import.meta.env.VITE_API_BASE_URL
      await axios.post(
        `${API}/cobs`,
        { date, startTime, endTime, durationText },
        {
          headers: { Authorization: `Bearer ${getToken()}` },
        },
      )
      // Refresh table immediately to show the new record without a manual reload
      await fetchCobs()
      // Notify other open pages (Dashboard) to refresh
      notifyCobChange()
      setMessage("Added successfully!")
      setDate("")
      setStartTime("")
      setEndTime("")
    } catch (err) {
      setMessage("Error adding entry")
    }
  }

  const API = import.meta.env.VITE_API_BASE_URL

  const fetchCobs = async () => {
    try {
      const res = await axios.get(`${API}/cobs`)
      setCobs(res.data)
    } catch (e) {
      // ignore
    }
  }

  useEffect(() => {
    fetchCobs()
  }, [])

  const startEdit = (cob) => {
    setEditingId(cob._id)
    setDate(cob.date)
    setStartTime(cob.startTime)
    setEndTime(cob.endTime)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setDate("")
    setStartTime("")
    setEndTime("")
  }

  const saveEdit = async (id) => {
    const durationText = calculateDuration(startTime, endTime)
    try {
      await axios.put(
        `${API}/cobs/${id}`,
        { date, startTime, endTime, durationText },
        {
          headers: { Authorization: `Bearer ${getToken()}` },
        },
      )
    setMessage("Updated successfully!")
    cancelEdit()
    fetchCobs()
    notifyCobChange()
  } catch (e) {
    setMessage("Error updating entry")
  }
  }

  const deleteRow = async (id) => {
    if (!confirm("Delete this entry?")) return
    try {
      await axios.delete(`${API}/cobs/${id}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      })
    setMessage("Deleted successfully!")
    fetchCobs()
    notifyCobChange()
  } catch (e) {
    setMessage("Error deleting entry")
  }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
      </div>

      <div className="relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent mb-2">
            Admin Panel
          </h1>
          <p className="text-white/60">Manage COB Entries</p>
          <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-blue-500 mx-auto rounded-full mt-4"></div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="max-w-2xl mx-auto mb-8 bg-white/10 backdrop-blur-lg border border-white/20 p-8 rounded-2xl shadow-2xl transform transition-all duration-300 hover:scale-105 hover:shadow-purple-500/25"
        >
          <h2 className="text-xl font-semibold text-white mb-6 text-center">Add New COB Entry</h2>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="group">
              <label className="block text-white/80 text-sm font-medium mb-2 group-focus-within:text-purple-300 transition-colors">
                Date
              </label>
              <input
                type="date"
                value={
                  date
                    ? (() => {
                        // Convert DD/MM/YYYY to YYYY-MM-DD for input
                        const [d, m, y] = date.split("/")
                        if (d && m && y) return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`
                        return ""
                      })()
                    : ""
                }
                onChange={(e) => {
                  // Convert YYYY-MM-DD to DD/MM/YYYY for state
                  const val = e.target.value
                  if (val) {
                    const [y, m, d] = val.split("-")
                    setDate(`${d}/${m}/${y}`)
                  } else {
                    setDate("")
                  }
                }}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 hover:bg-white/15"
                required
              />
            </div>

            <div className="group">
              <label className="block text-white/80 text-sm font-medium mb-2 group-focus-within:text-purple-300 transition-colors">
                Start Time
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 hover:bg-white/15"
                required
              />
            </div>

            <div className="group">
              <label className="block text-white/80 text-sm font-medium mb-2 group-focus-within:text-purple-300 transition-colors">
                End Time
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 hover:bg-white/15"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-6 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/25 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            Add Entry
          </button>

          {message && (
            <div className="mt-4 p-3 bg-emerald-500/20 border border-emerald-500/30 rounded-xl">
              <p className="text-emerald-200 text-sm text-center">{message}</p>
            </div>
          )}
        </form>

        <div className="max-w-6xl mx-auto bg-white/10 backdrop-blur-lg border border-white/20 p-8 rounded-2xl shadow-2xl">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">COB Entries</h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="text-left py-4 px-4 text-white/80 font-semibold">Date</th>
                  <th className="text-left py-4 px-4 text-white/80 font-semibold">Start Time</th>
                  <th className="text-left py-4 px-4 text-white/80 font-semibold">End Time</th>
                  <th className="text-left py-4 px-4 text-white/80 font-semibold">Duration</th>
                  <th className="text-left py-4 px-4 text-white/80 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {cobs.map((cob, index) => (
                  <tr
                    key={cob._id}
                    className="border-b border-white/10 hover:bg-white/5 transition-colors duration-200"
                  >
                    <td className="py-4 px-4">
                      {editingId === cob._id ? (
                        <input
                          type="date"
                          className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                          value={
                            date
                              ? (() => {
                                  const [d, m, y] = date.split("/")
                                  if (d && m && y) return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`
                                  return ""
                                })()
                              : ""
                          }
                          onChange={(e) => {
                            const val = e.target.value
                            if (val) {
                              const [y, m, d] = val.split("-")
                              setDate(`${d}/${m}/${y}`)
                            } else {
                              setDate("")
                            }
                          }}
                        />
                      ) : (
                        <span className="text-white">{cob.date}</span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      {editingId === cob._id ? (
                        <input
                          type="time"
                          className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                          value={startTime}
                          onChange={(e) => setStartTime(e.target.value)}
                        />
                      ) : (
                        <span className="text-white">{cob.startTime}</span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      {editingId === cob._id ? (
                        <input
                          type="time"
                          className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                          value={endTime}
                          onChange={(e) => setEndTime(e.target.value)}
                        />
                      ) : (
                        <span className="text-white">{cob.endTime}</span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-purple-300 font-medium">{cob.durationText}</span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex gap-2">
                        {editingId === cob._id ? (
                          <>
                            <button
                              className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 rounded-lg text-sm transition-colors duration-200 transform hover:scale-105"
                              onClick={() => saveEdit(cob._id)}
                            >
                              Save
                            </button>
                            <button
                              className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded-lg text-sm transition-colors duration-200 transform hover:scale-105"
                              onClick={cancelEdit}
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-sm transition-colors duration-200 transform hover:scale-105"
                              onClick={() => startEdit(cob)}
                            >
                              Edit
                            </button>
                            <button
                              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg text-sm transition-colors duration-200 transform hover:scale-105"
                              onClick={() => deleteRow(cob._id)}
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex justify-center gap-6 mt-8">
          <a
            href="/"
            className="bg-white/10 backdrop-blur-lg border border-white/20 text-white px-6 py-3 rounded-xl hover:bg-white/20 transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
          >
            Back to Dashboard
          </a>
          <button
            className="bg-red-600/80 backdrop-blur-lg border border-red-500/30 text-white px-6 py-3 rounded-xl hover:bg-red-700/80 transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
            onClick={() => {
              clearToken()
              navigate("/login")
            }}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}

export default Admin
