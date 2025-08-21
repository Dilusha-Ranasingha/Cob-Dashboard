"use client"

import { useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import { setToken } from "../auth"

const Login = () => {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    try {
      const API = import.meta.env.VITE_API_BASE_URL
      const res = await axios.post(`${API}/auth/login`, { username, password })
      setToken(res.data.token)
      navigate("/admin")
    } catch (err) {
      const msg = err?.response?.data?.message || "Login failed"
      setError(msg)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="relative bg-white/10 backdrop-blur-lg border border-white/20 p-8 rounded-2xl shadow-2xl w-full max-w-md transform transition-all duration-300 hover:scale-105 hover:shadow-purple-500/25"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent mb-2">
            Admin Login
          </h1>
          <div className="w-16 h-1 bg-gradient-to-r from-purple-500 to-blue-500 mx-auto rounded-full"></div>
        </div>

        <div className="space-y-6">
          <div className="group">
            <label className="block text-white/80 text-sm font-medium mb-2 group-focus-within:text-purple-300 transition-colors">
              Username
            </label>
            <input
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 hover:bg-white/15"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
            />
          </div>

          <div className="group">
            <label className="block text-white/80 text-sm font-medium mb-2 group-focus-within:text-purple-300 transition-colors">
              Password
            </label>
            <input
              type="password"
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 hover:bg-white/15"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-xl">
            <p className="text-red-200 text-sm text-center">{error}</p>
          </div>
        )}

        <button
          type="submit"
          className="w-full mt-8 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-transparent"
        >
          Sign In
        </button>
      </form>
    </div>
  )
}

export default Login
