import React, { useContext, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FaArrowLeft, FaMapMarkerAlt, FaCalendarAlt } from 'react-icons/fa'
import { TripContext } from '../context/TripContext'

const TripDetailsPage = () => {
  const navigate = useNavigate()
  const ctx = useContext(TripContext)
  const selectedTrip = ctx?.selectedTrip ?? null
  const loadItineraryItems = ctx?.loadItineraryItems
  const deleteTrip = ctx?.deleteTrip
  const setSelectedTrip = ctx?.setSelectedTrip

  const {flightData, carRentalData, activityData, lodgingData} = ctx || {};
  
  // Mock user role (replace with actual API call when backend is ready)
  // For testing: owner/co_owner can delete and edit, editor can only edit, viewer can only view
  const [userRole, setUserRole] = useState('owner') // Change this to test different roles
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  // Load itinerary items when trip is selected
  useEffect(() => {
  if (!selectedTrip?.id || !loadItineraryItems) return;
  loadItineraryItems(selectedTrip.id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [selectedTrip?.id]);
  
  // Permission checks
  const canEdit = () => {
    return userRole === 'owner' || userRole === 'co_owner' || userRole === 'editor'
  }
  
  const canDelete = () => {
    return userRole === 'owner'
  }

  if (!selectedTrip) {
    return (
      <section className="bg-gray-50 min-h-screen py-10 px-4">
        <div className="container m-auto max-w-4xl">
          <Link
            to="/upcoming-trips-page"
            className="inline-flex items-center gap-2 bg-white text-black font-black uppercase px-4 py-2 border-4 border-black rounded shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all mb-6"
          >
            <FaArrowLeft /> Back to Trips
          </Link>
          <div className="bg-white border-4 border-black rounded-lg shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8 text-center">
            <p className="text-gray-800 font-bold text-lg">No trip selected. Please select a trip from the upcoming trips page.</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="bg-gray-50 min-h-screen py-6 sm:py-10 px-4">
      <div className="container m-auto max-w-6xl">
        {/* Back Button */}
        <Link
          to="/upcoming-trips-page"
          className="inline-flex items-center gap-2 bg-white text-black font-black uppercase px-4 py-2 border-4 border-black rounded shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all mb-6"
        >
          <FaArrowLeft /> Back to Trips
        </Link>

        {/* Centered Content */}
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Trip Header Card */}
            <div className="bg-white border-4 border-black rounded-lg shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] sm:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 sm:p-8">
              <div className="mb-4 pb-4 border-b-4 border-black">
                <h1 className="text-3xl sm:text-4xl font-black uppercase mb-4 break-words">
                  {selectedTrip.name}
                </h1>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 text-sm sm:text-base">
                  <div className="flex items-center gap-2 font-bold">
                    <FaMapMarkerAlt className="text-red-600 text-lg" />
                    <span className="break-words">{selectedTrip.location}</span>
                  </div>
                  <div className="flex items-center gap-2 font-bold">
                    <FaCalendarAlt className="text-indigo-900 text-lg" />
                    <span>{selectedTrip.startDate} → {selectedTrip.endDate}</span>
                  </div>
                </div>
              </div>

              {selectedTrip.notes && (
                <div className="p-4 bg-gray-100 border-2 border-black rounded">
                  <p className="text-xs font-black uppercase text-gray-600 mb-2">Description</p>
                  <p className="text-gray-800 font-bold whitespace-pre-wrap break-words">{selectedTrip.notes}</p>
                </div>
              )}
            </div>

            {/* Trip Details Card */}
            <div className="bg-white border-4 border-black rounded-lg shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] sm:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 sm:p-8">
              <h3 className="text-2xl font-black uppercase mb-6 pb-4 border-b-4 border-black">
                Itinerary Details
              </h3>

              {selectedTrip.notes && (
                <div className="mb-6">
                  <h4 className="font-bold text-gray-700 mb-2">Description</h4>
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedTrip.notes}</p>
                </div>
              )}

              {/* Activity Details */}
              {activityData && activityData.length > 0 && (
                <div className="mb-6 p-4 bg-yellow-100 border-4 border-black rounded">
                  <h4 className="font-black text-lg uppercase mb-4">🗓️ Activities</h4>
                  <div className="space-y-4">
                    {activityData.map((activity) => (
                      <div key={activity.id} className="p-3 bg-white border-2 border-black rounded">
                        <p className="font-black text-base mb-2">{activity.title}</p>
                        <div className="text-sm font-bold text-gray-700 space-y-1">
                          <p>📅 Start: {activity.startDate} {activity.startTime}</p>
                          <p>📅 End: {activity.endDate} {activity.endTime}</p>
                          {activity.venue && <p>📍 Venue: {activity.venue}</p>}
                          {activity.address && <p>🏠 Address: {activity.address}</p>}
                          {activity.phone && <p>📞 Phone: {activity.phone}</p>}
                          {activity.website && <p>🌐 Website: {activity.website}</p>}
                          {activity.email && <p>✉️ Email: {activity.email}</p>}
                          {activity.totalCost && <p className="font-black">💰 Total: ${activity.totalCost}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Flight Details */}
              {flightData && flightData.flights.length > 0 && (
                <div className="mb-6 p-4 bg-blue-100 border-4 border-black rounded">
                  <h4 className="font-black text-lg uppercase mb-4">✈️ Flights</h4>
                  <div className="space-y-4">
                    {flightData.flights.map((flight) => (
                      <div key={flight.id} className="p-3 bg-white border-2 border-black rounded">
                        <p className="font-black text-base mb-2">{flight.title || `Flight ${flight.id}`}</p>
                        <div className="text-sm font-bold text-gray-700 space-y-1">
                          {flight.airline && <p>✈️ Airline: {flight.airline}</p>}
                          {flight.flightNumber && <p>🔢 Flight #: {flight.flightNumber}</p>}
                          {flight.departure && <p>📅 Departure: {flight.departure}</p>}
                          {flight.numberOfGuests && <p>💺 Seats: {flight.numberOfGuests}</p>}
                        </div>
                      </div>
                    ))}
                    {flightData.totalCost && (
                      <p className="font-black text-lg mt-2">💰 Total Cost: ${flightData.totalCost}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Car Rental Details */}
              {carRentalData && carRentalData.title && (
                <div className="mb-6 p-4 bg-green-100 border-4 border-black rounded">
                  <h4 className="font-black text-lg uppercase mb-4">🚗 Car Rental</h4>
                  <div className="p-3 bg-white border-2 border-black rounded">
                    <p className="font-black text-base mb-2">{carRentalData.title}</p>
                    <div className="text-sm font-bold text-gray-700 space-y-1">
                      <p>📅 Pickup: {carRentalData.pickupDate} at {carRentalData.pickupTime}</p>
                      <p>📅 Dropoff: {carRentalData.dropoffDate} at {carRentalData.dropoffTime}</p>
                      {carRentalData.confirmationNumber && <p>🔖 Confirmation: {carRentalData.confirmationNumber}</p>}
                      {carRentalData.website && <p>🌐 Website: {carRentalData.website}</p>}
                      {carRentalData.email && <p>✉️ Email: {carRentalData.email}</p>}
                      
                      {carRentalData.pickupLocation?.location && (
                        <div className="mt-3 pt-3 border-t-2 border-gray-300">
                          <p className="font-black mb-1">Pickup Location</p>
                          <p>{carRentalData.pickupLocation.location}</p>
                          {carRentalData.pickupLocation.address && <p>{carRentalData.pickupLocation.address}</p>}
                          {carRentalData.pickupLocation.phone && <p>📞 {carRentalData.pickupLocation.phone}</p>}
                        </div>
                      )}

                      {carRentalData.dropoffLocation?.location && (
                        <div className="mt-3 pt-3 border-t-2 border-gray-300">
                          <p className="font-black mb-1">Dropoff Location</p>
                          <p>{carRentalData.dropoffLocation.location}</p>
                          {carRentalData.dropoffLocation.address && <p>{carRentalData.dropoffLocation.address}</p>}
                          {carRentalData.dropoffLocation.phone && <p>📞 {carRentalData.dropoffLocation.phone}</p>}
                        </div>
                      )}

                      {carRentalData.rentalInfo?.carType && (
                        <div className="mt-3 pt-3 border-t-2 border-gray-300">
                          <p className="font-black mb-1">Vehicle Info</p>
                          <p>🚙 Type: {carRentalData.rentalInfo.carType}</p>
                          {carRentalData.rentalInfo.mileageCharges && <p>💰 Mileage: ${carRentalData.rentalInfo.mileageCharges}</p>}
                          {carRentalData.rentalInfo.carDetails && <p>ℹ️ Details: {carRentalData.rentalInfo.carDetails}</p>}
                        </div>
                      )}

                      {carRentalData.totalCost && (
                        <p className="font-black text-lg mt-3">💰 Total Cost: ${carRentalData.totalCost}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Lodging Details */}
              {lodgingData && lodgingData.length > 0 && (
                <div className="mb-6 p-4 bg-purple-100 border-4 border-black rounded">
                  <h4 className="font-black text-lg uppercase mb-4">🏨 Lodging</h4>
                  <div className="space-y-4">
                    {lodgingData.map((lodging) => (
                      <div key={lodging.id} className="p-3 bg-white border-2 border-black rounded">
                        <p className="font-black text-base mb-2">{lodging.title}</p>
                        <div className="text-sm font-bold text-gray-700 space-y-1">
                          <p>📅 Check-in: {lodging.startDate} {lodging.startTime}</p>
                          <p>📅 Check-out: {lodging.endDate} {lodging.endTime}</p>
                          {lodging.venue && <p>🏨 Venue: {lodging.venue}</p>}
                          {lodging.address && <p>🏠 Address: {lodging.address}</p>}
                          {lodging.phone && <p>📞 Phone: {lodging.phone}</p>}
                          {lodging.website && <p>🌐 Website: {lodging.website}</p>}
                          {lodging.email && <p>✉️ Email: {lodging.email}</p>}
                          {lodging.confirmationNumber && <p>🔖 Confirmation: {lodging.confirmationNumber}</p>}
                          {lodging.totalCost && <p className="font-black">💰 Total: ${lodging.totalCost}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

          {/* Manage Trip Section */}
          {(canEdit() || canDelete()) && (
          <div className="bg-white border-4 border-black rounded-lg shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] sm:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 sm:p-8">
            <h3 className="text-2xl font-black uppercase mb-6 pb-4 border-b-4 border-black">Manage Trip</h3>
            <div className="flex flex-col sm:flex-row gap-4">
              {canEdit() && (
              <Link
                to="edit-trip"
                className="flex-1 bg-indigo-900 hover:bg-indigo-700 text-white text-center font-black uppercase py-4 px-6 border-4 border-black rounded shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
              >
                Edit Trip
              </Link>
              )}
              {canDelete() && (
              <button
                onClick={() => setShowDeleteModal(true)}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-black uppercase py-4 px-6 border-4 border-black rounded shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
              >
                Delete Trip
              </button>
              )}
            </div>
          </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center z-50 px-4">
          <div className="bg-red-300 border-4 border-black rounded-lg shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-600 border-4 border-black rounded w-12 h-12 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-3xl font-black leading-none">X</span>
              </div>
              <h3 className="text-2xl font-black uppercase text-black">Delete Trip?</h3>
            </div>
            <p className="text-black font-bold mb-6">
              Are you sure you want to delete "{selectedTrip.name}"? This action cannot be undone and will permanently remove all trip data and itinerary items.
            </p>
            <div className="flex gap-3 flex-col sm:flex-row">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 bg-white text-black font-black uppercase px-4 py-3 border-4 border-black rounded shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    const success = await deleteTrip(selectedTrip.id)
                    if (success) {
                      setSelectedTrip(null)
                      navigate('/upcoming-trips-page')
                    } else {
                      alert('Failed to delete trip. Please try again.')
                      setShowDeleteModal(false)
                    }
                  } catch (err) {
                    console.error('Error deleting trip:', err)
                    alert('Failed to delete trip. Please try again.')
                    setShowDeleteModal(false)
                  }
                }}
                className="flex-1 bg-red-600 text-white font-black uppercase px-4 py-3 border-4 border-black rounded shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
              >
                Yes, Delete Trip
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default TripDetailsPage