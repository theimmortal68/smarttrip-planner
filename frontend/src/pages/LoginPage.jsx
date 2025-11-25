// src/pages/LoginPage.jsx
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FaGoogle } from 'react-icons/fa'

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

const LoginPage = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.message || data.error || 'Invalid credentials')
        setLoading(false)
        return
      }

      const data = await res.json().catch(() => ({}))

      if (data.token) {
        localStorage.setItem('token', data.token)
      }

      setLoading(false)
      navigate('/homepage')
    } catch (err) {
      console.error('Login error:', err)
      setError('Network error. Please try again.')
      setLoading(false)
    }
  }

  const handleGoogleLogin = () => {
    // This will be e.g. https://smarttrip.myflix.media/api/auth/google
    window.location.href = `${API_BASE_URL}/auth/google`
  }

  return (
    <>
      <section className="bg-white min-h-screen flex items-center justify-center">
        <div className="container m-auto max-w-xl">
          <div className="bg-white px-6 py-8 mb-4 shadow-md rounded-md border-3 m-4 md:m-0">
            <form onSubmit={handleSubmit}>
              <h2 className="text-3xl text-center font-semibold mb-6">Login</h2>

              <div className="mb-4">
                <label className="block text-gray-700 font-bold mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="border rounded w-full py-2 px-3 mb-2"
                  placeholder="eg. name@domain.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 font-bold mb-2">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  className="border rounded w-full py-2 px-3 mb-2"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>

              {error && (
                <div className="mb-4 text-red-600 font-bold text-center">
                  {error}
                </div>
              )}

              <div>
                <button
                  className="bg-indigo-900 hover:bg-indigo-600 mt-5 mb-4 text-white font-bold py-2 px-4 rounded-lg w-full focus:outline-none focus:shadow-outline"
                  type="submit"
                  disabled={!email || !password || loading}
                >
                  {loading ? 'Signing in...' : 'Login'}
                </button>
              </div>

              <div>
                <Link
                  to="/signup"
                  className="block bg-indigo-900 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg w-full text-center focus:outline-none focus:shadow-outline"
                  style={{ textDecoration: 'none' }}
                >
                  Sign Up
                </Link>
              </div>

              <div className="flex flex-row mb-4 mt-4">
                <div className="flex-grow border-t border-gray-400 mt-3 mr-3"></div>
                <p className="text-black">or sign in with:</p>
                <div className="flex-grow border-t border-gray-400 mt-3 ml-3"></div>
              </div>

              <div>
                <button
                  className="bg-green-400 hover:bg-indigo-600 text-black font-bold py-2 px-4 rounded-lg w-full focus:outline-none focus:shadow-outline"
                  type="button"
                  onClick={handleGoogleLogin}
                >
                  <FaGoogle className="inline text-lg mr-2 mb-1" /> Google
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </>
  )
}

export default LoginPage
