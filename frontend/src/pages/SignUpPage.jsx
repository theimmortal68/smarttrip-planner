import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SignUpPage = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rePassword, setRePassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== rePassword) {
      setError("Passwords do not match.");
      return;
    }
    try {
      const res = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, email, password })
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.message || 'Signup failed.');
        return;
      }
      navigate('/login');
    } catch {
      setError('Network error. Please try again.');
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center py-8 px-4 relative overflow-hidden" style={{ backgroundColor: '#5fefdb' }}>
      {/* Decorative Travel Icons - Messy Fridge Magnet Style */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Vertical Airplane Path - Left side (messier) */}
        <svg className="absolute left-2 top-0 w-32 h-full hidden xl:block" style={{zIndex: 0}}>
          <path 
            d="M 65 30 Q 18 165, 82 285 Q 28 405, 72 525 Q 18 645, 68 765 Q 25 885, 75 1000" 
            stroke="rgba(0,0,0,0.11)" 
            strokeWidth="3" 
            strokeDasharray="7,13" 
            fill="none"
          />
        </svg>

        {/* Vertical Airplane Path - Right side (messier) */}
        <svg className="absolute right-1 top-0 w-32 h-full hidden xl:block" style={{zIndex: 0}}>
          <path 
            d="M 42 65 Q 92 195, 48 315 Q 102 435, 38 555 Q 88 675, 45 795 Q 95 915, 40 1020" 
            stroke="rgba(0,0,0,0.11)" 
            strokeWidth="3" 
            strokeDasharray="7,13" 
            fill="none"
          />
        </svg>

        {/* Top Left - Passport (very crooked) */}
        <div className="absolute top-8 left-5 bg-purple-300 border-4 border-black rounded-lg p-2.5 shadow-[8px_6px_0px_0px_rgba(0,0,0,1)] -rotate-[19deg] hidden xl:block" style={{zIndex: 1}}>
          <svg className="w-9 h-9 text-black" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"></path>
            <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"></path>
          </svg>
        </div>

        {/* Top Right - Airplane (askew) */}
        <div className="absolute top-12 right-9 bg-yellow-300 border-4 border-black rounded-full p-2.5 shadow-[7px_8px_0px_0px_rgba(0,0,0,1)] rotate-[27deg] hidden xl:block">
          <svg className="w-8 h-8 text-black" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path>
          </svg>
        </div>

        {/* Upper Left - Camera (closer to card) */}
        <div className="absolute top-[32%] left-[12%] bg-pink-300 border-4 border-black rounded-lg p-3 shadow-[6px_7px_0px_0px_rgba(0,0,0,1)] rotate-[14deg] hidden xl:block">
          <svg className="w-7 h-7 text-black" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"></path>
          </svg>
        </div>

        {/* Middle Left - Suitcase (closer to card) */}
        <div className="absolute top-1/2 left-[15%] bg-orange-300 border-4 border-black rounded-lg p-2.5 shadow-[5px_8px_0px_0px_rgba(0,0,0,1)] rotate-[22deg] hidden xl:block">
          <svg className="w-9 h-9 text-black" fill="currentColor" viewBox="0 0 20 20">
            <path d="M8 5a1 1 0 100 2h4a1 1 0 100-2H8zM2 9a1 1 0 011-1h14a1 1 0 011 1v9a1 1 0 01-1 1H3a1 1 0 01-1-1V9z"></path>
          </svg>
        </div>

        {/* Upper Right - Ticket (closer to card) */}
        <div className="absolute top-[30%] right-[14%] bg-red-300 border-4 border-black rounded-lg p-2.5 shadow-[7px_6px_0px_0px_rgba(0,0,0,1)] rotate-[16deg] hidden xl:block">
          <svg className="w-8 h-8 text-black" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 6a2 2 0 012-2h12a2 2 0 012 2v2a2 2 0 100 4v2a2 2 0 01-2 2H4a2 2 0 01-2-2v-2a2 2 0 100-4V6z"></path>
          </svg>
        </div>

        {/* Middle Right - Map Pin (closer to card) */}
        <div className="absolute top-[52%] right-[16%] bg-green-300 border-4 border-black rounded-full p-3 shadow-[8px_5px_0px_0px_rgba(0,0,0,1)] -rotate-[25deg] hidden xl:block">
          <svg className="w-8 h-8 text-black" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"></path>
          </svg>
        </div>

        {/* Bottom Left - Compass (rotated) */}
        <div className="absolute bottom-16 left-8 bg-blue-300 border-4 border-black rounded-full p-3 shadow-[6px_8px_0px_0px_rgba(0,0,0,1)] rotate-[18deg] hidden xl:block">
          <svg className="w-8 h-8 text-black -rotate-[18deg]" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.736 6.979C9.208 6.193 9.696 6 10 6c.304 0 .792.193 1.264.979a1 1 0 001.715-1.029C12.279 4.784 11.232 4 10 4s-2.279.784-2.979 1.95c-.285.475-.507 1-.67 1.55H6a1 1 0 000 2h.013a9.358 9.358 0 000 1H6a1 1 0 100 2h.351c.163.55.385 1.075.67 1.55C7.721 15.216 8.768 16 10 16s2.279-.784 2.979-1.95a1 1 0 10-1.715-1.029c-.472.786-.96.979-1.264.979-.304 0-.792-.193-1.264-.979a4.265 4.265 0 01-.264-.521H10a1 1 0 100-2H8.017a7.36 7.36 0 010-1H10a1 1 0 100-2H8.472c.08-.185.167-.36.264-.521z" clipRule="evenodd"></path>
          </svg>
        </div>

        {/* Bottom Right - Globe (new icon, askew) */}
        <div className="absolute bottom-20 right-10 bg-teal-300 border-4 border-black rounded-full p-2.5 shadow-[5px_7px_0px_0px_rgba(0,0,0,1)] -rotate-[23deg] hidden xl:block">
          <svg className="w-8 h-8 text-black" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z" clipRule="evenodd"></path>
          </svg>
        </div>

        {/* Mobile Top Left - Suitcase */}
        <div className="absolute top-5 left-5 bg-orange-300 border-3 border-black rounded-lg p-2 shadow-[5px_4px_0px_0px_rgba(0,0,0,1)] rotate-[21deg] xl:hidden">
          <svg className="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 20 20">
            <path d="M8 5a1 1 0 100 2h4a1 1 0 100-2H8zM2 9a1 1 0 011-1h14a1 1 0 011 1v9a1 1 0 01-1 1H3a1 1 0 01-1-1V9z"></path>
          </svg>
        </div>

        {/* Mobile Top Right - Airplane */}
        <div className="absolute top-7 right-5 bg-yellow-300 border-3 border-black rounded-full p-2 shadow-[4px_5px_0px_0px_rgba(0,0,0,1)] -rotate-[17deg] xl:hidden">
          <svg className="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path>
          </svg>
        </div>

        {/* Mobile Bottom - Compass */}
        <div className="absolute bottom-10 left-6 bg-blue-300 border-3 border-black rounded-full p-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rotate-[19deg] xl:hidden">
          <svg className="w-5 h-5 text-black -rotate-[19deg]" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.736 6.979C9.208 6.193 9.696 6 10 6c.304 0 .792.193 1.264.979a1 1 0 001.715-1.029C12.279 4.784 11.232 4 10 4s-2.279.784-2.979 1.95c-.285.475-.507 1-.67 1.55H6a1 1 0 000 2h.013a9.358 9.358 0 000 1H6a1 1 0 100 2h.351c.163.55.385 1.075.67 1.55C7.721 15.216 8.768 16 10 16s2.279-.784 2.979-1.95a1 1 0 10-1.715-1.029c-.472.786-.96.979-1.264.979-.304 0-.792-.193-1.264-.979a4.265 4.265 0 01-.264-.521H10a1 1 0 100-2H8.017a7.36 7.36 0 010-1H10a1 1 0 100-2H8.472c.08-.185.167-.36.264-.521z" clipRule="evenodd"></path>
          </svg>
        </div>
      </div>

      <div className="container m-auto max-w-2xl w-full relative z-10">
        <div className="bg-white px-6 sm:px-8 py-8 border-4 border-black rounded-lg shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] sm:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] m-4 md:m-0">
          <form onSubmit={handleSubmit}>
            <h2 className="text-3xl sm:text-4xl text-center font-black uppercase mb-8">Sign Up</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6">
              <div>
                <label className="block text-gray-900 font-black uppercase mb-2 text-sm">First Name</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  className="border-4 border-black rounded w-full py-3 px-4 font-bold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                  placeholder="eg. John"
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-gray-900 font-black uppercase mb-2 text-sm">Last Name</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  className="border-4 border-black rounded w-full py-3 px-4 font-bold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                  placeholder="eg. Smith"
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  required
                />
              </div>
            </div>

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
                placeholder="Enter your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="mb-6">
              <label className="block text-gray-900 font-black uppercase mb-2 text-sm">Re-Enter Your Password</label>
              <input
                type="password"
                id="re-enter-password"
                name="re-enter-password"
                className="border-4 border-black rounded w-full py-3 px-4 font-bold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                placeholder="Confirm your password"
                value={rePassword}
                onChange={e => setRePassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-100 border-4 border-red-600 rounded">
                <p className="font-bold text-red-900 text-center uppercase text-sm">{error}</p>
              </div>
            )}

            <div>
              <button
                className="bg-black text-white font-black uppercase py-3 px-6 rounded w-full border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
                type="submit"
              >
                Create Account
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default SignUpPage;