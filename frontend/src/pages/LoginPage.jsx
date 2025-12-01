import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FaGoogle } from 'react-icons/fa'
import { API_BASE_URL } from '../utils/api'

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      // change URL if your backend uses a different port/path
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.message || 'Invalid credentials');
        setLoading(false);
        return;
      }

      const data = await res.json().catch(() => ({}));
      // Store the JWT token in localStorage
      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      // Store user data if backend provides it (for Profile page and Navbar)
      // Backend should return: { token: "...", user: { firstName, lastName, email } }
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      setLoading(false);
      // navigate to homepage or upcoming trips
      navigate('/homepage');
    } catch (err) {
      setError('Network error. Please try again.');
      setLoading(false);
    }
  }

  return (
    <>
    <section className="min-h-screen flex items-center justify-center py-8 px-4 relative overflow-hidden" style={{ backgroundColor: '#ff6b7a' }}>
      {/* Decorative Travel Icons - Messy Fridge Magnet Style */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Vertical Airplane Path - Left side (messy) */}
        <svg className="absolute left-2 top-0 w-32 h-full hidden lg:block" style={{zIndex: 0}}>
          <path 
            d="M 65 40 Q 15 160, 85 270 Q 25 380, 75 490 Q 15 600, 65 720" 
            stroke="rgba(0,0,0,0.12)" 
            strokeWidth="3" 
            strokeDasharray="8,12" 
            fill="none"
          />
        </svg>

        {/* Vertical Airplane Path - Right side (messy) */}
        <svg className="absolute right-1 top-0 w-32 h-full hidden lg:block" style={{zIndex: 0}}>
          <path 
            d="M 45 80 Q 95 210, 40 330 Q 105 450, 35 570 Q 85 690, 45 800" 
            stroke="rgba(0,0,0,0.12)" 
            strokeWidth="3" 
            strokeDasharray="8,12" 
            fill="none"
          />
        </svg>

        {/* Top Left - Suitcase (tilted) */}
        <div className="absolute top-8 left-6 bg-orange-300 border-4 border-black rounded-lg p-2.5 shadow-[7px_7px_0px_0px_rgba(0,0,0,1)] rotate-[23deg] hidden lg:block" style={{zIndex: 1}}>
          <svg className="w-9 h-9 text-black" fill="currentColor" viewBox="0 0 20 20">
            <path d="M8 5a1 1 0 100 2h4a1 1 0 100-2H8zM2 9a1 1 0 011-1h14a1 1 0 011 1v9a1 1 0 01-1 1H3a1 1 0 01-1-1V9z"></path>
          </svg>
        </div>

        {/* Top Right - Compass (crooked) */}
        <div className="absolute top-10 right-8 bg-blue-300 border-4 border-black rounded-full p-2.5 shadow-[5px_6px_0px_0px_rgba(0,0,0,1)] -rotate-[17deg] hidden lg:block">
          <svg className="w-8 h-8 text-black rotate-[17deg]" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.736 6.979C9.208 6.193 9.696 6 10 6c.304 0 .792.193 1.264.979a1 1 0 001.715-1.029C12.279 4.784 11.232 4 10 4s-2.279.784-2.979 1.95c-.285.475-.507 1-.67 1.55H6a1 1 0 000 2h.013a9.358 9.358 0 000 1H6a1 1 0 100 2h.351c.163.55.385 1.075.67 1.55C7.721 15.216 8.768 16 10 16s2.279-.784 2.979-1.95a1 1 0 10-1.715-1.029c-.472.786-.96.979-1.264.979-.304 0-.792-.193-1.264-.979a4.265 4.265 0 01-.264-.521H10a1 1 0 100-2H8.017a7.36 7.36 0 010-1H10a1 1 0 100-2H8.472c.08-.185.167-.36.264-.521z" clipRule="evenodd"></path>
          </svg>
        </div>

        {/* Mid Left - Airplane (closer to card) */}
        <div className="absolute top-1/2 left-[15%] bg-yellow-300 border-4 border-black rounded-full p-3 shadow-[6px_5px_0px_0px_rgba(0,0,0,1)] rotate-[31deg] hidden lg:block">
          <svg className="w-7 h-7 text-black" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path>
          </svg>
        </div>

        {/* Mid Right - Passport (closer to card) */}
        <div className="absolute top-[45%] right-[18%] bg-purple-300 border-4 border-black rounded-lg p-2.5 shadow-[8px_5px_0px_0px_rgba(0,0,0,1)] -rotate-[21deg] hidden lg:block">
          <svg className="w-8 h-8 text-black" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"></path>
            <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"></path>
          </svg>
        </div>

        {/* Bottom Left - Camera (rotated more) */}
        <div className="absolute bottom-16 left-10 bg-pink-300 border-4 border-black rounded-lg p-3 shadow-[5px_7px_0px_0px_rgba(0,0,0,1)] -rotate-[14deg] hidden lg:block">
          <svg className="w-9 h-9 text-black" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"></path>
          </svg>
        </div>

        {/* Bottom Right - Map Pin (crooked) */}
        <div className="absolute bottom-20 right-12 bg-green-300 border-4 border-black rounded-full p-3 shadow-[7px_6px_0px_0px_rgba(0,0,0,1)] rotate-[19deg] hidden lg:block">
          <svg className="w-8 h-8 text-black" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"></path>
          </svg>
        </div>

        {/* Mobile Top Left - Airplane */}
        <div className="absolute top-5 left-5 bg-yellow-300 border-3 border-black rounded-full p-2 shadow-[4px_5px_0px_0px_rgba(0,0,0,1)] rotate-[25deg] lg:hidden">
          <svg className="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path>
          </svg>
        </div>

        {/* Mobile Top Right - Camera */}
        <div className="absolute top-7 right-5 bg-pink-300 border-3 border-black rounded-lg p-2 shadow-[5px_4px_0px_0px_rgba(0,0,0,1)] -rotate-[18deg] lg:hidden">
          <svg className="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"></path>
          </svg>
        </div>

        {/* Mobile Bottom - Map Pin */}
        <div className="absolute bottom-12 left-7 bg-green-300 border-3 border-black rounded-full p-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rotate-[14deg] lg:hidden">
          <svg className="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"></path>
          </svg>
        </div>
      </div>

      <div className="container m-auto max-w-xl w-full relative z-10">
        <div
          className="bg-white px-6 sm:px-8 py-8 border-4 border-black rounded-lg shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] sm:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] m-4 md:m-0"
        >
          <form onSubmit={handleSubmit}>
            <h2 className="text-3xl sm:text-4xl text-center font-black uppercase mb-8">Login</h2>

            <div className="mb-6">
              <label className="block text-gray-900 font-black uppercase mb-2 text-sm">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                className="border-4 border-black rounded w-full py-3 px-4 font-bold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                placeholder="eg. name@domain.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="mb-6">
              <label className="block text-gray-900 font-black uppercase mb-2 text-sm">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                className="border-4 border-black rounded w-full py-3 px-4 font-bold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-100 border-4 border-red-600 rounded">
                <p className="font-bold text-red-900 text-center uppercase text-sm">{error}</p>
              </div>
            )}

            <div className="mb-4">
              <button
                className="bg-black text-white font-black uppercase py-3 px-6 rounded w-full border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] disabled:hover:translate-x-0 disabled:hover:translate-y-0"
                type="submit"
                disabled={!email || !password || loading}
              >
                {loading ? 'Signing in...' : 'Login'}
              </button>
            </div>

            <div className="mb-6">
              <Link
                to="/signup"
                className="block bg-white text-black font-black uppercase py-3 px-6 rounded w-full text-center border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
                style={{ textDecoration: 'none' }}
              >
                Sign Up
              </Link>
            </div>

            <div className='flex flex-row items-center mb-6'>
                <div className='flex-grow border-t-4 border-black'></div>
                <p className='text-black font-black uppercase text-xs px-4'>or sign in with</p>
                <div className='flex-grow border-t-4 border-black'></div>    
            </div>
            
           <div>
              <button
                className="bg-green-400 text-black font-black uppercase py-3 px-6 rounded w-full border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
                type="button"
                onClick={() => { window.location.href = `${API_BASE_URL}/auth/google`; }}
              >
                <FaGoogle className="inline text-xl mr-2 mb-1" /> Google
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
