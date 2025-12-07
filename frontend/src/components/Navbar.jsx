import React, { useState, useRef, useEffect } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { FaUser, FaSignOutAlt, FaBars, FaTimes } from 'react-icons/fa'

const Navbar = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [showProfileDropdown, setShowProfileDropdown] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const dropdownRef = useRef(null)
  const mobileMenuRef = useRef(null)

  // Check if we're on login or signup page
  const isAuthPage = location.pathname === '/' || location.pathname === '/signup'

  // Get user data from localStorage (set by LoginPage or ProfilePage)
  // eslint-disable-next-line no-unused-vars
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user')
    return stored ? JSON.parse(stored) : { firstName: 'User', lastName: '' }
  })

  // COMMENTED OUT: Hardcoded placeholder data
  // const user = {
  //   firstName: 'John',
  //   lastName: 'Doe'
  // }

  // Close dropdown and mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false)
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setShowMobileMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    // Clear token and user data from localStorage
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    // TODO: Add actual logout logic with backend call if needed
    console.log('Logging out')
    navigate('/')
  }
  
  // Adds black background to button when a navbar button is selected 
  const linkClass = ({isActive}) => 
                    isActive ? 'text-white bg-black border-4 border-black font-black uppercase rounded-md px-3 py-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all' 
                  : 'text-white font-bold uppercase rounded-md px-3 py-2 hover:bg-black transition-all'
  
  return (
    <nav className="bg-indigo-900 border-b-4 border-black shadow-[0px_6px_0px_0px_rgba(0,0,0,1)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          {isAuthPage ? (
            <div className="flex flex-shrink-0 items-center cursor-default">
              <div className="bg-white border-4 border-black rounded-full p-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" />
                  <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" fill="currentColor" />
                </svg>
              </div>
              <span className="hidden sm:block text-white text-xl sm:text-2xl font-black uppercase ml-2"
                >SmarTrip Planner</span
              >
            </div>
          ) : (
            <NavLink className="flex flex-shrink-0 items-center" to="/homepage">
              <div className="bg-white border-4 border-black rounded-full p-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">
                <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" />
                  <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" fill="currentColor" />
                </svg>
              </div>
              <span className="hidden sm:block text-white text-xl sm:text-2xl font-black uppercase ml-2"
                >SmarTrip Planner</span
              >
            </NavLink>
          )}

          {/* Mobile Title - Centered */}
          <span className="sm:hidden text-white text-lg font-black uppercase absolute left-1/2 transform -translate-x-1/2"
            >SMARTRIP</span
          >

          {/* Desktop Navigation */}
          {!isAuthPage && (
          <div className="hidden md:flex items-center space-x-2">
            <NavLink
              to="/homepage"
              className={linkClass}
              >Home
            </NavLink>
            <NavLink
              to="/upcoming-trips-page"
              className={linkClass}
              > Upcoming Trips
            </NavLink>
            <NavLink
              to="/past-trips"
              className={linkClass}
              >Past Trips
            </NavLink>

            {/* Profile Button with Dropdown - Desktop */}
            <div className="relative ml-4" ref={dropdownRef}>
              <button
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="w-12 h-12 bg-white border-4 border-black rounded-full flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
              >
                <FaUser className="text-indigo-900 text-xl" />
              </button>

              {/* Dropdown Card */}
              {showProfileDropdown && (
                <div className="absolute right-0 mt-3 w-64 bg-white border-4 border-black rounded-lg shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] z-50">
                  <div className="p-4 border-b-4 border-black">
                    <p className="font-black text-lg uppercase"> {user.firstName} {user.lastName}</p>
                  </div>
                  <div className="p-2">
                    <button
                      onClick={() => {
                        setShowProfileDropdown(false)
                        navigate('/profile')
                      }}
                      className="w-full text-left px-4 py-3 font-bold hover:bg-gray-100 border-2 border-transparent hover:border-black rounded transition-all flex items-center gap-2"
                    >
                      <FaUser /> View Profile
                    </button>
                    <button
                      onClick={() => {
                        setShowProfileDropdown(false)
                        handleLogout()
                      }}
                      className="w-full text-left px-4 py-3 font-bold hover:bg-red-50 border-2 border-transparent hover:border-red-600 rounded transition-all flex items-center gap-2 text-red-600"
                    >
                      <FaSignOutAlt /> Log Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          )}

          {/* Mobile Hamburger Button */}
          {!isAuthPage && (
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="md:hidden w-12 h-12 bg-white border-4 border-black rounded flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
          >
            {showMobileMenu ? (
              <FaTimes className="text-indigo-900 text-xl" />
            ) : (
              <FaBars className="text-indigo-900 text-xl" />
            )}
          </button>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {!isAuthPage && showMobileMenu && (
        <div
          ref={mobileMenuRef}
          className="md:hidden bg-indigo-800 border-t-4 border-black shadow-[0px_6px_0px_0px_rgba(0,0,0,1)]"
        >
          <div className="px-4 py-4 space-y-3">
            <NavLink
              to="/homepage"
              onClick={() => setShowMobileMenu(false)}
              className={({ isActive }) =>
                isActive
                  ? 'block text-white bg-black border-4 border-black font-black uppercase rounded-md px-4 py-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                  : 'block text-white font-bold uppercase rounded-md px-4 py-3 hover:bg-black transition-all'
              }
            >
              Home
            </NavLink>
            <NavLink
              to="/upcoming-trips-page"
              onClick={() => setShowMobileMenu(false)}
              className={({ isActive }) =>
                isActive
                  ? 'block text-white bg-black border-4 border-black font-black uppercase rounded-md px-4 py-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                  : 'block text-white font-bold uppercase rounded-md px-4 py-3 hover:bg-black transition-all'
              }
            >
              Upcoming Trips
            </NavLink>
            <NavLink
              to="/past-trips"
              onClick={() => setShowMobileMenu(false)}
              className={({ isActive }) =>
                isActive
                  ? 'block text-white bg-black border-4 border-black font-black uppercase rounded-md px-4 py-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                  : 'block text-white font-bold uppercase rounded-md px-4 py-3 hover:bg-black transition-all'
              }
            >
              Past Trips
            </NavLink>

            {/* Mobile Profile Section */}
            <div className="pt-4 border-t-4 border-black space-y-3">
              <div className="px-4 py-2">
                <p className="font-black text-white uppercase text-sm">Signed in as</p>
                <p className="font-bold text-white text-lg">{user.firstName} {user.lastName}</p>
              </div>
              <button
                onClick={() => {
                  setShowMobileMenu(false)
                  navigate('/profile')
                }}
                className="w-full text-left px-4 py-3 font-bold text-white hover:bg-indigo-900 rounded transition-all flex items-center gap-2"
              >
                <FaUser /> View Profile
              </button>
              <button
                onClick={() => {
                  setShowMobileMenu(false)
                  handleLogout()
                }}
                className="w-full text-left px-4 py-3 font-bold text-red-300 hover:text-red-100 hover:bg-red-900/30 rounded transition-all flex items-center gap-2"
              >
                <FaSignOutAlt /> Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar