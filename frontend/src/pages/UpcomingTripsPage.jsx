import React, { useContext, useState, useEffect } from 'react'
import { Outlet, Link, useNavigate } from 'react-router-dom'
import { FaLink, FaUser } from 'react-icons/fa'
import { TripContext } from '../context/TripContext'

const UpcomingTripsPage = () => {
  const _ctx = useContext(TripContext) || {}
  const { upcomingTrips = [], setSelectedTrip, tripMembers = {}, setTripMembers } = _ctx
  const navigate = useNavigate()
  const [currentUser, setCurrentUser] = useState(null)

  // COMMENTED OUT: Mock data for testing - replaced with backend fetch
  // const mockCurrentUser = { id: 1, first_name: 'Alice', last_name: 'Johnson', email: 'alice.johnson@example.com' }
  // const mockMembers = [
  //   { id: 1, user_id: 1, first_name: 'Alice', last_name: 'Johnson', email: 'alice.johnson@example.com', role: 'owner' },
  //   { id: 2, user_id: 2, first_name: 'Bob', last_name: 'Smith', email: 'bob.smith@example.com', role: 'editor' },
  //   { id: 3, user_id: 3, first_name: 'Charlie', last_name: 'Davis', email: 'charlie.davis@example.com', role: 'viewer' }
  // ]

  // Filter out past trips (only show upcoming/future trips)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const futureTrips = upcomingTrips.filter(trip => {
    if (!trip.endDate) return true // Show trips without end date
    const endDate = new Date(trip.endDate)
    return endDate >= today
  })

  useEffect(() => {
    loadCurrentUser()
  }, [])

  useEffect(() => {
    if (futureTrips.length > 0) {
      loadTripMembers()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [futureTrips.length])

  const loadCurrentUser = async () => {
    try {
      // Get current user from localStorage (set by LoginPage/ProfilePage)
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          setCurrentUser({
            id: user.id,
            first_name: user.firstName,
            last_name: user.lastName,
            email: user.email,
          });
        } catch (err) {
          console.error('Invalid user in localStorage, clearing it', err);
          localStorage.removeItem('user');
        }
      }      
    } catch (err) {
      console.error('Error loading current user:', err)
    }
  }

  const loadTripMembers = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      console.log('No token found - skipping member loading')
      return
    }

    const membersData = { ...tripMembers }
    for (const trip of futureTrips) {
      // Skip if already loaded
      if (tripMembers[trip.id]) continue
      
      try {
        // Fetch trip members from backend
        // Backend should return: [{ id, user_id, first_name, last_name, email, role }, ...]
        const res = await fetch(`/api/trips/${trip.id}/members`, {
          method: 'GET',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (res.ok) {
          const members = await res.json()
          membersData[trip.id] = members || []
        } else {
          console.error(`Failed to fetch members for trip ${trip.id}`)
          membersData[trip.id] = []
        }
      } catch (err) {
        console.error(`Error loading members for trip ${trip.id}:`, err)
        membersData[trip.id] = []
      }
    }
    setTripMembers(membersData)
  }

  const handleViewTrip = (trip) => {
    setSelectedTrip(trip)
    navigate('/upcoming-trips-page/trip-details')
  }

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'owner':
        return 'bg-yellow-400 text-black border-2 border-black'
      case 'co_owner':
        return 'bg-orange-400 text-black border-2 border-black'
      case 'editor':
        return 'bg-green-400 text-black border-2 border-black'
      case 'viewer':
        return 'bg-blue-300 text-black border-2 border-black'
      default:
        return 'bg-gray-400 text-black border-2 border-black'
    }
  }

  const getRoleLabel = (role) => {
    switch (role) {
      case 'owner':
        return 'Creator'
      case 'co_owner':
        return 'Co-Owner'
      case 'editor':
        return 'Editor'
      case 'viewer':
        return 'Member'
      default:
        return role
    }
  }

  return (
    <section className='bg-gray-50 px-4 py-10'>
      <h2 className="text-3xl sm:text-4xl font-black uppercase mb-6 sm:mb-8 text-center">Upcoming Trips</h2>
      
      {/* Display newly saved trips */}
      {futureTrips.length > 0 ? (
        <div className="mb-8">
          <div className="flex justify-center">
            <div className="w-full max-w-md">
              {futureTrips.map((trip) => (
                <div key={trip.id} className="mb-4 sm:mb-6">
                  {/* Neo Brutalism Card */}
                  <div className="bg-white border-4 border-black rounded-lg p-4 sm:p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] sm:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                    <div className="mb-4 pb-4 border-b-4 border-black">
                      <h3 className="text-xl sm:text-2xl font-black mb-2 uppercase break-words">{trip.tripName}</h3>
                      <p className="text-xs sm:text-sm font-bold uppercase text-gray-700 break-words">📍 {trip.tripLocation}</p>
                    </div>
                    
                    <div className="mb-4">
                      <p className="text-xs sm:text-sm font-bold mb-2">📅 DATES</p>
                      <p className="font-mono text-xs sm:text-sm text-gray-800 break-all">{trip.startDate} → {trip.endDate}</p>
                    </div>

                    {trip.description && (
                      <div className="mb-4 p-2 sm:p-3 bg-gray-100 border-2 border-black rounded">
                        <p className="text-xs font-black uppercase mb-1">Description</p>
                        <p className="text-xs sm:text-sm text-gray-800 break-words">{trip.description}</p>
                      </div>
                    )}
                    
                    {/* Show flight details if available */}
                    {trip.flightData && trip.flightData.flights.length > 0 && (
                      <div className="mb-4 p-3 bg-blue-100 border-3 border-black rounded">
                        <p className="text-xs font-black uppercase mb-2">✈️ Flights ({trip.flightData.flights.length})</p>
                        {trip.flightData.flights.map((flight) => (
                          <p key={flight.id} className="text-sm font-bold text-gray-800 mb-1">{flight.customName || `Flight ${flight.id}`} - {flight.airline}</p>
                        ))}
                        {trip.flightData.totalCost && <p className="text-sm font-black mt-2">TOTAL: ${trip.flightData.totalCost}</p>}
                      </div>
                    )}

                    {/* Show car rental details if available */}
                    {trip.carRentalData && trip.carRentalData.rentalAgency && (
                      <div className="mb-4 p-3 bg-green-100 border-3 border-black rounded">
                        <p className="text-xs font-black uppercase mb-2">🚗 Car Rental</p>
                        <p className="text-sm font-bold text-gray-800 mb-1">{trip.carRentalData.rentalAgency}</p>
                        {trip.carRentalData.totalCost && <p className="text-sm font-black mt-2">TOTAL: ${trip.carRentalData.totalCost}</p>}
                      </div>
                    )}


                    {/* Show lodging details if available */}
                    {trip.lodgingData && trip.lodgingData.length > 0 && (
                      <div className="mb-4 p-3 bg-purple-100 border-3 border-black rounded">
                        <p className="text-xs font-black uppercase mb-2">🏨 Lodging ({trip.lodgingData.length})</p>
                        {trip.lodgingData.map((lodging) => (
                          <p key={lodging.id} className="text-sm font-bold text-gray-800 mb-1">{lodging.lodgingName} - {lodging.venue}</p>
                        ))}
                      </div>
                    )}

                    {/* Show activity details if available */}
                    {trip.activityData && trip.activityData.length > 0 && (
                      <div className="mb-4 p-3 bg-yellow-100 border-3 border-black rounded">
                        <p className="text-xs font-black uppercase mb-2">🗓️ Activities ({trip.activityData.length})</p>
                        {trip.activityData.map((activity) => (
                          <p key={activity.id} className="text-sm font-bold text-gray-800 mb-1">{activity.activityName} - {activity.venue}</p>
                        ))}
                      </div>
                    )}

                    {/* Show trip members section - always visible, just above View Trip button */}
                    <div className="mb-4 p-3 sm:p-4 bg-gray-50 border-4 border-black rounded">
                      <p className="text-xs sm:text-sm font-black uppercase mb-3 flex items-center gap-2">
                        <FaUser /> Trip Members {tripMembers[trip.id] && `(${tripMembers[trip.id].length})`}
                      </p>
                      {tripMembers[trip.id] && tripMembers[trip.id].length > 0 ? (
                        <div className="space-y-2">
                          {tripMembers[trip.id].slice(0, 3).map((member) => (
                            <div key={member.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-2 bg-white border-2 border-black rounded">
                              <div className="flex-1 min-w-0">
                                <p className="font-black text-xs sm:text-sm truncate">
                                  {member.first_name} {member.last_name}
                                  {currentUser && member.user_id === currentUser.id && (
                                    <span className="ml-1 text-xs font-bold text-gray-600">(You)</span>
                                  )}
                                </p>
                                <p className="text-xs text-gray-600 font-bold truncate">{member.email}</p>
                              </div>
                              <span className={`px-2 py-1 rounded font-black uppercase text-xs ${getRoleBadgeColor(member.role)} flex-shrink-0 self-start sm:self-center`}>
                                {getRoleLabel(member.role)}
                              </span>
                            </div>
                          ))}
                          {tripMembers[trip.id].length > 3 && (
                            <p className="text-xs font-bold text-gray-600 mt-2 pl-2">
                              +{tripMembers[trip.id].length - 3} more member{tripMembers[trip.id].length - 3 > 1 ? 's' : ''}
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-xs sm:text-sm text-gray-600 font-bold">Loading members...</p>
                      )}
                    </div>

                    {/* View Trip Button */}
                    <button
                      onClick={() => handleViewTrip(trip)}
                      className="w-full bg-black text-white border-4 border-black rounded font-black uppercase py-2 sm:py-3 px-3 sm:px-4 mt-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all text-sm sm:text-lg"
                    >
                      View Trip
                    </button>
                      {/* Manage Sharing Button */}
                      <Link
                        to={`/upcoming-trips-page/manage-sharing/${trip.id}`}
                        className="w-full flex items-center justify-center gap-2 bg-white border-4 border-black rounded font-black uppercase py-2 sm:py-3 px-3 sm:px-4 mt-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all text-sm sm:text-lg text-black"
                        style={{ textDecoration: 'none' }}
                      >
                        <FaLink className="text-base sm:text-xl mr-2" /> Manage Sharing
                      </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto px-2 sm:px-4">
          <div className="bg-white border-4 border-black rounded-lg shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] sm:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 sm:p-8 text-center">
            <p className="text-gray-800 text-lg sm:text-xl font-black uppercase mb-2">No Upcoming Trips Yet</p>
            <p className="text-gray-600 text-sm sm:text-base font-bold mt-2 mb-6">Start planning your next adventure!</p>
            <Link
              to="/add-trip"
              className="inline-block bg-black text-white border-4 border-black rounded-lg font-black uppercase py-3 px-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all text-base sm:text-lg"
            >
              + Add Trip
            </Link>
          </div>
        </div>
      )}

      <Outlet/>
    </section>
  )
}

export default UpcomingTripsPage
