import React, { useContext } from 'react'
import { FaMapMarker } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import { TripContext } from '../context/TripContext'

const PastTripsPage = () => {
  const { upcomingTrips = [], setSelectedTrip } = useContext(TripContext)
  const navigate = useNavigate()

  // Filter for past trips (end date is before today)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const pastTrips = upcomingTrips.filter(trip => {
    if (!trip.endDate) return false
    const endDate = new Date(trip.endDate)
    return endDate < today
  })

  const handleViewTrip = (trip) => {
    setSelectedTrip(trip)
    navigate('/trip-details')
  }

  return (
    <>
    <section className="bg-gray-50 px-4 py-10">
      <div className="max-w-4xl mx-auto px-2 sm:px-4 m-auto">
        <h2 className="text-3xl sm:text-4xl font-black uppercase text-black mb-6 sm:mb-8 text-center">
          Past Trips
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:gap-6">
          {pastTrips.length === 0 ? (
            <div className="bg-white border-4 border-black rounded-lg shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] sm:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 sm:p-8 text-center">
              <p className="text-gray-800 text-lg sm:text-xl font-black uppercase mb-2">No Past Trips Yet</p>
              <p className="text-gray-600 text-sm sm:text-base font-bold mt-2">Your completed trips will appear here.</p>
            </div>
          ) : (
            pastTrips.map((trip) => (
              <div key={trip.id} className="bg-white border-4 border-black rounded-lg shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] sm:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative">
                <div className="p-4 sm:p-6">
                  <div className="mb-4 sm:mb-6">
                    <div className="text-gray-700 my-2 text-xs sm:text-sm font-bold break-words">
                      {trip.startDate && trip.endDate 
                        ? `${new Date(trip.startDate).toLocaleDateString()} - ${new Date(trip.endDate).toLocaleDateString()}`
                        : 'Dates not set'}
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black uppercase break-words">{trip.tripName || 'Untitled Trip'}</h3>
                  </div>

                  <div className="mb-4 sm:mb-5 font-bold text-xs sm:text-sm text-gray-700 break-words">
                    {trip.description || 'No description'}
                  </div>

                  <div className="border-t-4 border-black mb-4 sm:mb-5"></div>

                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
                    <div className="text-red-600 font-bold text-xs sm:text-sm break-words">
                      <FaMapMarker className="inline text-sm sm:text-lg mr-2 mb-1"/>
                      {trip.tripLocation || 'No location set'}
                    </div>
                    <button
                      onClick={() => handleViewTrip(trip)}
                      className="w-full sm:w-auto bg-indigo-900 hover:bg-indigo-700 text-white font-black uppercase px-4 sm:px-6 py-2 sm:py-3 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all rounded text-sm sm:text-base"
                    >
                      View Trip
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
    </>
  )
}

export default PastTripsPage