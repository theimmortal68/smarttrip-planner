
import React, { useContext, useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { FaUser, FaUserPlus, FaTimes, FaArrowLeft } from 'react-icons/fa'
import { TripContext } from '../context/TripContext'
import { API_BASE_URL } from '../utils/api';

const ManageSharingPage = () => {
  const { tripId } = useParams()
  const navigate = useNavigate()
  const { upcomingTrips = [], tripMembers, setTripMembers } = useContext(TripContext) || {}
  const trip = upcomingTrips?.find(t => String(t.id) === String(tripId))
  
  // COMMENTED OUT: Mock data for testing - replaced with backend fetch
  // const mockUsers = [
  //   { id: 1, first_name: 'Alice', last_name: 'Johnson', email: 'alice.johnson@example.com' },
  //   { id: 2, first_name: 'Bob', last_name: 'Smith', email: 'bob.smith@example.com' },
  //   { id: 3, first_name: 'Charlie', last_name: 'Davis', email: 'charlie.davis@example.com' },
  //   { id: 4, first_name: 'Diana', last_name: 'Martinez', email: 'diana.martinez@example.com' },
  //   { id: 5, first_name: 'Ethan', last_name: 'Wilson', email: 'ethan.wilson@example.com' }
  // ]
  
  // const mockCurrentUser = { id: 1, first_name: 'Alice', last_name: 'Johnson', email: 'alice.johnson@example.com' }
  
  // const mockMembers = [
  //   { id: 1, user_id: 1, first_name: 'Alice', last_name: 'Johnson', email: 'alice.johnson@example.com', role: 'owner' },
  //   { id: 2, user_id: 2, first_name: 'Bob', last_name: 'Smith', email: 'bob.smith@example.com', role: 'editor' },
  //   { id: 3, user_id: 3, first_name: 'Charlie', last_name: 'Davis', email: 'charlie.davis@example.com', role: 'viewer' }
  // ]
  
  const [currentUser, setCurrentUser] = useState(null)
  const [allUsers, setAllUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRole, setSelectedRole] = useState('viewer')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showDropdown, setShowDropdown] = useState(false)
  const [showNotification, setShowNotification] = useState(false)
  const [showRemoveNotification, setShowRemoveNotification] = useState(false)
  const [showRoleChangeNotification, setShowRoleChangeNotification] = useState(false)
  const [currentUserRole, setCurrentUserRole] = useState(null)
  
  // Get members for this trip from context (memoized to prevent re-render issues)
  const members = useMemo(() => tripMembers?.[tripId] || [], [tripMembers, tripId])

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tripId])

  useEffect(() => {
    // Filter users based on search query
    if (searchQuery.trim() === '') {
      setFilteredUsers([])
      setShowDropdown(false)
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = allUsers.filter(user => {
        // Exclude current user and already added members
        const isCurrentUser = currentUser && user.id === currentUser.id
        const isAlreadyMember = members.some(member => member.user_id === user.id)
        if (isCurrentUser || isAlreadyMember) return false
        
        // Filter by name or email
        const fullName = `${user.first_name} ${user.last_name}`.toLowerCase()
        return fullName.includes(query) || user.email.toLowerCase().includes(query)
      })
      setFilteredUsers(filtered)
      setShowDropdown(filtered.length > 0)
    }
  }, [searchQuery, allUsers, members, currentUser])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const token = localStorage.getItem('token')
      // Note: Backend authentication required - uncomment when backend is ready
      // if (!token) {
      //   setError('Not authenticated')
      //   navigate('/')
      //   return
      // }

      // Fetch current user from localStorage (set by LoginPage/ProfilePage)
      const storedUser = localStorage.getItem('user')
      if (storedUser) {
        const user = JSON.parse(storedUser)
        setCurrentUser(user)
      }

      // For testing without backend: show error but don't redirect
      if (!token) {
        setError('Backend not connected - member management requires authentication')
        setLoading(false)
        return
      }

      // Fetch trip members
      // Backend should return: [{ id, user_id, first_name, last_name, email, role }, ...]
      const membersRes = await fetch(`${API_BASE_URL}/trips/${tripId}/members`, {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!membersRes.ok) {
        const errorData = await membersRes.json().catch(() => ({}))
        throw new Error(errorData.message || 'Failed to fetch trip members')
      }

      const membersData = await membersRes.json()
      // Transform backend format (firstName, lastName, userId) to match component format (first_name, last_name, user_id)
      const transformedMembers = membersData.map(m => ({
        id: m.id,
        user_id: m.userId,
        first_name: m.firstName,
        last_name: m.lastName,
        email: m.email,
        role: m.role,
        joined_at: m.joinedAt
      }))
      setTripMembers({ ...tripMembers, [tripId]: transformedMembers || [] })

      // Fetch all users for search
      // Backend should return: [{ id, firstName, lastName, email }, ...]
      const usersRes = await fetch(`${API_BASE_URL}/users`, {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!usersRes.ok) {
        const errorData = await usersRes.json().catch(() => ({}))
        throw new Error(errorData.message || 'Failed to fetch users')
      }

      const usersData = await usersRes.json()
      // Transform backend format (firstName, lastName) to match component format (first_name, last_name)
      const transformedUsers = usersData.map(u => ({
        id: u.id,
        first_name: u.firstName,
        last_name: u.lastName,
        email: u.email
      }))
      setAllUsers(transformedUsers)

      // Set current user's role from members list
      if (storedUser) {
        const user = JSON.parse(storedUser)
        const userMember = membersData.find(m => m.userId === user.id)
        setCurrentUserRole(userMember?.role || null)
      }
    } catch (err) {
      console.error('Error loading data:', err)
      setError(err.message || 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleAddMember = async (user) => {
    try {
      setError(null)
      
      const token = localStorage.getItem('token')
      if (!token) {
        setError('Not authenticated')
        return
      }

      // Add trip member
      // Backend should accept: { email: string, role: string }
      const res = await fetch(`${API_BASE_URL}/trips/${tripId}/members`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: user.email,
          role: selectedRole
        })
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.message || 'Failed to add member')
      }

      // Refresh members list
      const membersRes = await fetch(`${API_BASE_URL}/trips/${tripId}/members`, {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (membersRes.ok) {
        const membersData = await membersRes.json()
        const transformedMembers = membersData.map(m => ({
          id: m.id,
          user_id: m.userId,
          first_name: m.firstName,
          last_name: m.lastName,
          email: m.email,
          role: m.role,
          joined_at: m.joinedAt
        }))
        setTripMembers({ ...tripMembers, [tripId]: transformedMembers || [] })
      }
      
      // Show notification
      setShowNotification(true)
      setTimeout(() => setShowNotification(false), 3000)
      
      // Clear search
      setSearchQuery('')
      setShowDropdown(false)
    } catch (err) {
      console.error('Error adding member:', err)
      setError(err.message || 'Failed to add member')
    }
  }

  const handleRemoveMember = async (memberId, role) => {
    // Prevent removing owner
    if (role === 'owner') {
      alert('Cannot remove the trip owner')
      return
    }

    try {
      setError(null)
      
      const token = localStorage.getItem('token')
      if (!token) {
        setError('Not authenticated')
        return
      }

      // Remove trip member
      const res = await fetch(`${API_BASE_URL}/trips/${tripId}/members/${memberId}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.message || 'Failed to remove member')
      }

      // Refresh members list
      const membersRes = await fetch(`${API_BASE_URL}/trips/${tripId}/members`, {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (membersRes.ok) {
        const membersData = await membersRes.json()
        const transformedMembers = membersData.map(m => ({
          id: m.id,
          user_id: m.userId,
          first_name: m.firstName,
          last_name: m.lastName,
          email: m.email,
          role: m.role,
          joined_at: m.joinedAt
        }))
        setTripMembers({ ...tripMembers, [tripId]: transformedMembers || [] })
      }
      
      // Show notification
      setShowRemoveNotification(true)
      setTimeout(() => setShowRemoveNotification(false), 3000)
    } catch (err) {
      console.error('Error removing member:', err)
      setError(err.message || 'Failed to remove member')
    }
  }

  const handleChangeRole = async (memberId, newRole) => {
    try {
      setError(null)
      
      const token = localStorage.getItem('token')
      if (!token) {
        setError('Not authenticated')
        return
      }

      // Find the member's email to update their role
      const member = members.find(m => m.id === memberId)
      if (!member) {
        throw new Error('Member not found')
      }

      // Update member role - backend expects email and role in the body
      // The POST /trips/:tripId/members endpoint handles both add and update
      const res = await fetch(`${API_BASE_URL}/trips/${tripId}/members`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          email: member.email,
          role: newRole 
        })
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.message || 'Failed to change role')
      }

      // Refresh members list
      const membersRes = await fetch(`${API_BASE_URL}/trips/${tripId}/members`, {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (membersRes.ok) {
        const membersData = await membersRes.json()
        const transformedMembers = membersData.map(m => ({
          id: m.id,
          user_id: m.userId,
          first_name: m.firstName,
          last_name: m.lastName,
          email: m.email,
          role: m.role,
          joined_at: m.joinedAt
        }))
        setTripMembers({ ...tripMembers, [tripId]: transformedMembers || [] })
      }
      
      // Show role change notification
      setShowRoleChangeNotification(true)
      setTimeout(() => setShowRoleChangeNotification(false), 3000)
    } catch (err) {
      console.error('Error changing role:', err)
      setError(err.message || 'Failed to change role')
    }
  }

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'owner':
        return 'bg-yellow-400 text-black'
      case 'co_owner':
        return 'bg-orange-400 text-black'
      case 'editor':
        return 'bg-green-400 text-black'
      case 'viewer':
        return 'bg-blue-300 text-black'
      default:
        return 'bg-gray-400 text-black'
    }
  }

  const getRoleLabel = (role) => {
    switch (role) {
      case 'owner':
        return 'Creator'
      case 'co_owner':
        return 'Co-Creator'
      case 'editor':
        return 'Editor'
      case 'viewer':
        return 'Member'
      default:
        return role
    }
  }

  // Permission check: Can current user manage roles?
  const canManageRoles = () => {
    return currentUserRole === 'owner' || currentUserRole === 'co_owner'
  }

  // Permission check: Can current user remove this member?
  const canRemoveMember = (memberRole) => {
    if (memberRole === 'owner') return false // Can't remove owner
    if (currentUserRole === 'owner') return true // Owner can remove anyone except owner
    if (currentUserRole === 'co_owner' && memberRole !== 'co_owner') return true // Co-owner can remove editors and viewers
    return false
  }

  // Permission check: Can current user change this member's role?
  const canChangeRole = (memberRole) => {
    if (memberRole === 'owner') return false // Can't change owner's role
    if (currentUserRole === 'owner') return true // Owner can change anyone's role except owner
    if (currentUserRole === 'co_owner' && memberRole !== 'co_owner') return true // Co-owner can change editors and viewers
    return false
  }

  // Get available roles for role selector based on current user's role
  const getAvailableRoles = () => {
    if (currentUserRole === 'owner') {
      return [
        { value: 'viewer', label: 'Member (Viewer)' },
        { value: 'editor', label: 'Editor' },
        { value: 'co_owner', label: 'Co-Creator' }
      ]
    }
    if (currentUserRole === 'co_owner') {
      return [
        { value: 'viewer', label: 'Member (Viewer)' },
        { value: 'editor', label: 'Editor' }
      ]
    }
    return []
  }

  // Get available roles for changing a specific member's role
  const getAvailableRolesForMember = (memberRole) => {
    const roles = getAvailableRoles()
    // Add current role if not already in list (for co_owner when current user is co_owner)
    const hasCurrentRole = roles.some(r => r.value === memberRole)
    if (!hasCurrentRole && memberRole !== 'owner') {
      const roleLabels = {
        co_owner: 'Co-Creator',
        editor: 'Editor',
        viewer: 'Member (Viewer)'
      }
      return [{ value: memberRole, label: roleLabels[memberRole] || memberRole }, ...roles]
    }
    return roles
  }

  if (loading) {
    return (
      <section className="bg-gray-50 min-h-screen flex items-center justify-center py-12 px-4">
        <div className="bg-white border-4 border-black rounded-lg shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-8 max-w-2xl w-full">
          <p className="text-center font-black uppercase text-lg">Loading...</p>
        </div>
      </section>
    )
  }

  return (
    <section className="bg-gray-50 min-h-screen py-6 sm:py-12 px-4">
      {/* Add Member Notification Popup */}
      {showNotification && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-[slideUpFade_3s_ease-in-out]">
          <div className="bg-green-400 text-black font-black uppercase px-6 py-4 border-4 border-black rounded shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            ✓ Trip Member Added
          </div>
        </div>
      )}

      {/* Remove Member Notification Popup */}
      {showRemoveNotification && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-[shakeAndSlide_3s_ease-in-out]">
          <div className="bg-red-500 text-white font-black uppercase px-6 py-4 border-4 border-black rounded shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <span className="text-black mr-2">✕</span> Trip Member Removed
          </div>
        </div>
      )}

      {/* Role Change Notification Popup */}
      {showRoleChangeNotification && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-[slideUpFade_3s_ease-in-out] px-4 w-full max-w-md">
          <div className="bg-yellow-400 text-black font-black uppercase px-4 sm:px-6 py-3 sm:py-4 border-4 border-black rounded shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] sm:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-xs sm:text-base">
            ✓ Member Role Successfully Changed
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate('/upcoming-trips-page')}
          className="inline-flex items-center gap-2 bg-white text-black font-black uppercase px-4 py-2 border-4 border-black rounded shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all mb-6"
        >
          <FaArrowLeft /> Back to Trips
        </button>

        <div className="bg-white border-4 border-black rounded-lg shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] sm:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 sm:p-8">
          <h2 className="text-2xl sm:text-3xl font-black uppercase mb-4 sm:mb-6">
            Manage Sharing
          </h2>
          
          <div className="mb-6 p-4 bg-gray-100 border-2 border-black rounded">
            <p className="font-bold text-sm uppercase text-gray-700">Trip</p>
            <p className="font-black text-lg">{trip?.name || 'Unknown Trip'}</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-100 border-4 border-red-600 rounded">
              <p className="font-bold text-red-900">{error}</p>
            </div>
          )}

          {/* Add Member Section */}
          {canManageRoles() && (
          <div className="mb-8">
            <h3 className="text-lg sm:text-xl font-black uppercase mb-4 flex items-center gap-2">
              <FaUserPlus /> Add Member
            </h3>
            
            {/* Role Selection */}
            {canManageRoles() && (
            <div className="mb-4">
              <label className="block text-gray-900 font-black uppercase mb-2 text-xs sm:text-sm">
                Role
              </label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="border-4 border-black rounded w-full py-2 sm:py-3 px-3 sm:px-4 font-bold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
              >
                {getAvailableRoles().map(role => (
                  <option key={role.value} value={role.value}>{role.label}</option>
                ))}
              </select>
            </div>
            )}

            {/* Search Input */}
            <div className="mb-4 relative">
              <label className="block text-gray-900 font-black uppercase mb-2 text-xs sm:text-sm">
                Search Users
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Type name or email..."
                className="border-4 border-black rounded w-full py-2 sm:py-3 px-3 sm:px-4 font-bold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
              />
              
              {/* Dropdown */}
              {showDropdown && filteredUsers.length > 0 && (
                <div className="absolute z-10 w-full mt-2 bg-white border-4 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] max-h-60 overflow-y-auto">
                  {filteredUsers.map(user => (
                    <button
                      key={user.id}
                      onClick={() => handleAddMember(user)}
                      className="w-full text-left px-4 py-3 hover:bg-gray-100 border-b-2 border-black last:border-b-0 transition-colors"
                    >
                      <p className="font-black text-sm">{user.first_name} {user.last_name}</p>
                      <p className="text-xs text-gray-600 font-bold">{user.email}</p>
                    </button>
                  ))}
                </div>
              )}
              
              {searchQuery && filteredUsers.length === 0 && (
                <div className="absolute z-10 w-full mt-2 bg-white border-4 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4">
                  <p className="text-sm font-bold text-gray-600">No users found</p>
                </div>
              )}
            </div>
          </div>
          )}

          {/* Members List */}
          <div>
            <h3 className="text-lg sm:text-xl font-black uppercase mb-4">
              Trip Members ({members.length})
            </h3>
            
            {members.length === 0 ? (
              <div className="p-6 bg-gray-100 border-2 border-black rounded text-center">
                <p className="font-bold text-gray-600">No members yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {members.map(member => (
                  <div
                    key={member.id}
                    className="p-4 bg-white border-4 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                      <FaUser className="text-lg sm:text-xl text-gray-700 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-sm sm:text-base truncate">
                          {member.first_name && member.last_name 
                            ? `${member.first_name} ${member.last_name}`
                            : 'Name not set'}
                          {currentUser && member.user_id === currentUser.id && (
                            <span className="ml-2 text-xs font-bold text-gray-600">(You)</span>
                          )}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-600 font-bold truncate">{member.email}</p>
                      </div>
                      
                      {/* Role Badge or Dropdown */}
                      {canChangeRole(member.role) ? (
                        <select
                          value={member.role}
                          onChange={(e) => handleChangeRole(member.id, e.target.value)}
                          className={`px-2 py-1 rounded font-black uppercase text-xs border-2 border-black ${getRoleBadgeColor(member.role)} flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity`}
                        >
                          {getAvailableRolesForMember(member.role).map(role => (
                            <option key={role.value} value={role.value}>
                              {getRoleLabel(role.value)}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className={`px-2 sm:px-3 py-1 rounded font-black uppercase text-xs ${getRoleBadgeColor(member.role)} flex-shrink-0`}>
                          {getRoleLabel(member.role)}
                        </span>
                      )}
                    </div>
                    {canRemoveMember(member.role) && (
                      <button
                        onClick={() => handleRemoveMember(member.id, member.role)}
                        className="bg-red-600 text-white font-bold px-2 py-2 sm:px-3 sm:py-2 rounded border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all flex-shrink-0"
                        title="Remove member"
                      >
                        <FaTimes className="text-sm" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export default ManageSharingPage
