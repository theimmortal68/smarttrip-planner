import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaUser, FaEnvelope, FaTrash } from 'react-icons/fa'

const ProfilePage = () => {
  const navigate = useNavigate()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [loading, setLoading] = useState(true)
  
  // User data from backend or localStorage
const [user, setUser] = useState(() => {
  try {
    const stored = localStorage.getItem('user')
    return stored ? JSON.parse(stored) : null
  } catch (err) {
    console.error('Invalid user in localStorage:', err, localStorage.getItem('user'))
    localStorage.removeItem('user')
    return null
  }
})

  // Fetch fresh user data from backend
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          navigate('/')
          return
        }

        // Fetch pattern similar to login - backend should create this endpoint
        const res = await fetch('/api/users/me', {
          method: 'GET',
          headers: { 
            'Authorization': `Bearer ${token}`
          }
        })

        if (!res.ok) {
          console.error('Failed to fetch user profile')
          setLoading(false)
          return
        }

        const data = await res.json()
        setUser(data)
        // Update localStorage so other pages have fresh data
        localStorage.setItem('user', JSON.stringify(data))
      } catch (err) {
        console.error('Error loading profile:', err)
      } finally {
        setLoading(false)
      }
    }

    loadUserProfile()
  }, [navigate])

  // COMMENTED OUT: Hardcoded placeholder data
  // const user = {
  //   firstName: 'John',
  //   lastName: 'Doe',
  //   email: 'john.doe@example.com'
  // }

  const handleDeleteAccount = async () => {
    try {
      const token = localStorage.getItem('token')
      
      // Fetch pattern similar to login - backend should create this endpoint
      const res = await fetch('/api/users/me', {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`
        }
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        alert(data.message || 'Failed to delete account. Please try again.')
        return
      }

      // Clear all user data from localStorage
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      
      // Navigate to login page
      navigate('/')
    } catch (err) {
      console.error('Error deleting account:', err)
      alert('Network error. Please try again.')
    }
  }

  if (loading) {
    return (
      <section className="bg-gray-50 min-h-screen py-12 px-4 flex items-center justify-center">
        <div className="bg-white border-4 border-black rounded-lg shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8">
          <p className="font-black uppercase text-lg">Loading Profile...</p>
        </div>
      </section>
    )
  }

  if (!user) {
    return (
      <section className="bg-gray-50 min-h-screen py-12 px-4 flex items-center justify-center">
        <div className="bg-white border-4 border-black rounded-lg shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8">
          <p className="font-black uppercase text-lg">User not found</p>
        </div>
      </section>
    )
  }

  return (
    <section className="bg-gray-50 min-h-screen py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Profile Card */}
        <div className="bg-white border-4 border-black rounded-lg shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8 mb-6">
          <div className="flex items-center gap-4 mb-6 pb-6 border-b-4 border-black">
            <div className="w-20 h-20 bg-indigo-900 border-4 border-black rounded-full flex items-center justify-center">
              <FaUser className="text-white text-3xl" />
            </div>
            <div>
              <h1 className="text-3xl font-black uppercase">{user.firstName} {user.lastName}</h1>
              <p className="text-gray-600 font-bold">{user.email}</p>
            </div>
          </div>

          {/* Profile Details */}
          <div className="space-y-4">
            <div className="p-4 bg-gray-100 border-2 border-black rounded">
              <div className="flex items-center gap-3">
                <FaUser className="text-xl" />
                <div>
                  <p className="text-xs font-black uppercase text-gray-600">Name</p>
                  <p className="font-bold text-lg">{user.firstName} {user.lastName}</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-100 border-2 border-black rounded">
              <div className="flex items-center gap-3">
                <FaEnvelope className="text-xl" />
                <div>
                  <p className="text-xs font-black uppercase text-gray-600">Email</p>
                  <p className="font-bold text-lg">{user.email}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Delete Account Section */}
        <div className="bg-red-50 border-4 border-red-600 rounded-lg shadow-[8px_8px_0px_0px_rgba(220,38,38,1)] p-6">
          <h2 className="text-xl font-black uppercase mb-3 text-red-600">Danger Zone</h2>
          <p className="text-gray-700 mb-4 font-bold">
            Once you delete your account, there is no going back. Please be certain.
          </p>
          
          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="bg-red-600 hover:bg-red-700 text-white font-black uppercase px-6 py-3 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
            >
              <FaTrash className="inline mr-2" />
              Delete Account
            </button>
          ) : (
            <div className="space-y-3">
              <p className="font-black text-red-600">Are you absolutely sure?</p>
              <div className="flex gap-3">
                <button
                  onClick={handleDeleteAccount}
                  className="bg-red-600 hover:bg-red-700 text-white font-black uppercase px-6 py-3 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
                >
                  Yes, Delete Forever
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="bg-white hover:bg-gray-100 text-black font-black uppercase px-6 py-3 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default ProfilePage
