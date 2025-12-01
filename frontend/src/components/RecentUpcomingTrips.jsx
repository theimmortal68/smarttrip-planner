import React, { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaLink } from 'react-icons/fa'
import { TripContext } from '../context/TripContext'

const RecentUpcomingTrips = () => {
  const _ctx = useContext(TripContext) || {}
  const { upcomingTrips = [], setSelectedTrip } = _ctx
  const navigate = useNavigate()

  // Filter out past trips (only show upcoming/future trips)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const futureTrips = upcomingTrips.filter(trip => {
    if (!trip.endDate) return true // Show trips without end date
    const endDate = new Date(trip.endDate)
    return endDate >= today
  })

  // Sort by start date (closest to today first)
  const sortedTrips = [...futureTrips].sort((a, b) => {
    const dateA = new Date(a.startDate)
    const dateB = new Date(b.startDate)
    return dateA - dateB
  })

  // Limit Trips to 3 on homepage
  const recentTrips = sortedTrips.slice(0, 3)

  const handleViewTrip = (trip) => {
    setSelectedTrip(trip)
    navigate('/upcoming-trips-page/trip-details')
  }

  // Only render if there are trips
  if (futureTrips.length === 0) {
    return null
  }

  return (
    <section className="bg-gray-50 px-4 py-10">
<<<<<<< HEAD
      <div className="max-w-4xl mx-auto px-2 sm:px-4 m-auto">
        <h2 className="text-3xl sm:text-4xl font-black uppercase text-black mb-6 sm:mb-8 text-center">
          Upcoming Trips
        </h2>
        <div className="flex justify-center">
          <div className="w-full max-w-md space-y-4 sm:space-y-6">
=======
      <div className="max-w-7xl mx-auto px-2 sm:px-4 m-auto">
        <h2 className="text-3xl sm:text-4xl font-black uppercase text-black mb-6 sm:mb-8 text-center">
          Recent Upcoming Trips
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 items-start">
>>>>>>> aa6d1484a8c7e5ff664c7e8ce7daa6566ca1b7c8
            {recentTrips.map((trip) => (
              <div key={trip.id}>
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

<<<<<<< HEAD
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
=======
                  {/* Days until trip counter */}
                  {(() => {
                    const startDate = new Date(trip.startDate)
                    const daysUntil = Math.ceil((startDate - today) / (1000 * 60 * 60 * 24))
                    
                    if (daysUntil < 0) {
                      return (
                        <div className="mb-4 p-2 sm:p-3 bg-green-300 border-4 border-black rounded shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                          <p className="text-xs sm:text-sm font-black uppercase text-black">🎉 Trip In Progress!</p>
                        </div>
                      )
                    } else if (daysUntil === 0) {
                      return (
                        <div className="mb-4 p-2 sm:p-3 bg-yellow-300 border-4 border-black rounded shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                          <p className="text-xs sm:text-sm font-black uppercase text-black">🚀 Trip Starts Today!</p>
                        </div>
                      )
                    } else if (daysUntil === 1) {
                      return (
                        <div className="mb-4 p-2 sm:p-3 bg-orange-300 border-4 border-black rounded shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                          <p className="text-xs sm:text-sm font-black uppercase text-black">⏰ Trip Starts Tomorrow!</p>
                        </div>
                      )
                    } else {
                      return (
                        <div className="mb-4 p-2 sm:p-3 bg-pink-300 border-4 border-black rounded shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                          <p className="text-xs sm:text-sm font-black uppercase text-black">🕒 In {daysUntil} Days</p>
                        </div>
                      )
                    }
                  })()}

                  {/* Summary badges for itinerary items */}
                  <div className="mb-4 flex flex-wrap gap-2 min-h-[60px] sm:min-h-[80px] items-start content-start">
                    {trip.flightData && trip.flightData.flights.length > 0 && (
                      <span className="bg-blue-400 border-2 border-black px-3 py-1 rounded font-black text-xs uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        ✈️ {trip.flightData.flights.length} {trip.flightData.flights.length === 1 ? 'Flight' : 'Flights'}
                      </span>
                    )}
                    {trip.carRentalData && trip.carRentalData.rentalAgency && (
                      <span className="bg-green-400 border-2 border-black px-3 py-1 rounded font-black text-xs uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        🚗 Car Rental
                      </span>
                    )}
                    {trip.lodgingData && trip.lodgingData.length > 0 && (
                      <span className="bg-purple-400 border-2 border-black px-3 py-1 rounded font-black text-xs uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        🏨 {trip.lodgingData.length} {trip.lodgingData.length === 1 ? 'Lodging' : 'Lodgings'}
                      </span>
                    )}
                    {trip.activityData && trip.activityData.length > 0 && (
                      <span className="bg-yellow-400 border-2 border-black px-3 py-1 rounded font-black text-xs uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        🗓️ {trip.activityData.length} {trip.activityData.length === 1 ? 'Activity' : 'Activities'}
                      </span>
                    )}
                  </div>
>>>>>>> aa6d1484a8c7e5ff664c7e8ce7daa6566ca1b7c8

                  {/* View Trip Button */}
                  <button
                    onClick={() => handleViewTrip(trip)}
                    className="w-full bg-black text-white border-4 border-black rounded font-black uppercase py-2 sm:py-3 px-3 sm:px-4 mt-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all text-sm sm:text-lg"
                  >
                    View Trip
                  </button>
                  {/* Manage Sharing Button */}
                  <button
                    onClick={() => navigate(`/upcoming-trips-page/manage-sharing/${trip.id}`)}
                    className="w-full flex items-center justify-center gap-2 bg-white border-4 border-black rounded font-black uppercase py-2 sm:py-3 px-3 sm:px-4 mt-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all text-sm sm:text-lg text-black"
                  >
                    <FaLink className="text-base sm:text-xl" /> Manage Sharing
                  </button>
                </div>
              </div>
            ))}
<<<<<<< HEAD
          </div>
=======
>>>>>>> aa6d1484a8c7e5ff664c7e8ce7daa6566ca1b7c8
        </div>
      </div>
    </section>
  )
}

export default RecentUpcomingTrips