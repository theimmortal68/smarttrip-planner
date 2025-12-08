import React, { useState, useContext, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FaCalendarAlt, FaPlane, FaHotel, FaCar } from 'react-icons/fa'
import { TripContext } from '../context/TripContext'

const AddTripPage = () => {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [showWarningModal, setShowWarningModal] = useState(false)
  const [pendingNavigation, setPendingNavigation] = useState(null)
  const _ctx = useContext(TripContext) || {}
  const { 
    flightData = { flights: [], totalCost: '' }, 
    carRentalData = {}, 
    activityData = [], 
    lodgingData = [],
    tripFormData = {},
    setTripFormData,
    clearTripFormData,
    addTrip, 
    clearFlightData, 
    clearCarRentalData, 
    setActivityData, 
    setLodgingData 
  } = _ctx

  // Destructure trip form data from context
  const { name = '', location: tripLocation = '', startDate = '', endDate = '', notes = '' } = tripFormData

  // Update handlers to use context
  const handleFieldChange = (field, value) => {
    setTripFormData({ ...tripFormData, [field]: value })
  }

  // Intercept navigation attempts
  useEffect(() => {
    const hasUnsavedData = () => {
      return name || tripLocation || startDate || endDate || notes || 
             flightData.flights.length > 0 || carRentalData.title || 
             activityData.length > 0 || lodgingData.length > 0
    }

    const handleClick = (e) => {
      // Check if clicked element is a link
      const link = e.target.closest('a')
      if (!link) return

      const href = link.getAttribute('href')
      if (!href) return

      // Allow itinerary pages
      const itineraryPaths = ['add-flight', 'add-lodging', 'add-activity', 'add-car']
      if (itineraryPaths.some(path => href.includes(path))) {
        return
      }

      // Check for unsaved data
      if (hasUnsavedData()) {
        e.preventDefault()
        setPendingNavigation(href)
        setShowWarningModal(true)
      }
    }

    document.addEventListener('click', handleClick, true) // Use capture phase
    return () => document.removeEventListener('click', handleClick, true)
  }, [name, tripLocation, startDate, endDate, notes, flightData, carRentalData, activityData, lodgingData])

  // Confirm leave without saving
  const confirmLeave = () => {
    clearFlightData()
    clearCarRentalData()
    setActivityData([])
    setLodgingData([])
    clearTripFormData()
    setShowWarningModal(false)
    if (pendingNavigation) {
      navigate(pendingNavigation)
    }
  }

  // Cancel leave
  const cancelLeave = () => {
    setShowWarningModal(false)
    setPendingNavigation(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitError('')
    
    // Create trip object with all data
    const tripData = {
      name,
      location: tripLocation,
      startDate,
      endDate,
      notes,
      flightData,
      carRentalData,
      activityData,
      lodgingData
    }

    try {
      // Save trip to context (which now calls the backend)
      await addTrip(tripData)

      // Clear all trip data after successful save
      clearFlightData()
      clearCarRentalData()
      setActivityData([])
      setLodgingData([])
      clearTripFormData()

      // Redirect to upcoming trips page
      navigate('/upcoming-trips-page')
    } catch (err) {
      setSubmitError('Failed to save trip. Please try again.')
      console.error('Error saving trip:', err)
    } finally {
      setIsSubmitting(false)
    }
  }
  return (
    <>
      <section className="bg-gray-50 min-h-screen py-6 sm:py-8 px-2 sm:px-4">
      <div className="container m-auto max-w-2xl py-4 sm:py-8">
        <div
          className="bg-white px-4 sm:px-8 py-6 sm:py-10 mb-4 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] sm:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-lg m-2 sm:m-4 md:m-0"
        >
          <form onSubmit={handleSubmit}>
            <h2 className="text-3xl sm:text-4xl text-center font-black uppercase mb-6 sm:mb-8">Add Trip</h2>

            <div className="mb-4 sm:mb-6">
              <label className="block text-gray-900 font-black uppercase mb-2 sm:mb-3 text-xs sm:text-sm"
                >Trip Name</label
              >
              <input
                type="text"
                id="name"
                name="name"
                value={name}
                onChange={(e) => handleFieldChange('name', e.target.value)}
                className="border-4 border-black rounded w-full py-2 sm:py-3 px-3 sm:px-4 text-sm sm:text-base font-bold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                placeholder="eg. Family Holiday"
                required
              />
            </div>

            <div className="mb-6">
              <label className="block text-gray-900 font-black uppercase mb-3 text-sm"
                >Trip Location</label
              >
              <input
                type="text"
                id="location"
                name="location"
                value={tripLocation}
                onChange={(e) => handleFieldChange('location', e.target.value)}
                className="border-4 border-black rounded w-full py-2 sm:py-3 px-3 sm:px-4 text-sm sm:text-base font-bold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                placeholder="eg. Paris, France"
                required
              />
            </div>

            <div className="mb-6">
              <label className="block text-gray-900 font-black uppercase mb-3 text-sm"
                >Start Date</label
              >
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={startDate}
                onChange={(e) => handleFieldChange('startDate', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                required
                className="border-4 border-black rounded w-full py-3 px-4 font-bold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                placeholder="mm/dd/yyyy"
              />
            </div>

            <div className="mb-6">
              <label className="block text-gray-900 font-black uppercase mb-3 text-sm"
                >End Date</label
              >
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={endDate}
                onChange={(e) => handleFieldChange('endDate', e.target.value)}
                min={startDate || new Date().toISOString().split('T')[0]}
                required
                className="border-4 border-black rounded w-full py-3 px-4 font-bold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                placeholder="mm/dd/yyyy"
              />
            </div>

            <div className="mb-6">
              <label
                htmlFor="description"
                className="block text-gray-900 font-black uppercase mb-3 text-sm"
                >Description</label
              >
              <textarea
                id="notes"
                name="notes"
                value={notes}
                onChange={(e) => handleFieldChange('notes', e.target.value)}
                className="border-4 border-black rounded w-full py-3 px-4 font-bold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                rows="4"
                placeholder="Add daily activities etc."
              ></textarea>
            </div>

            {/* Display Flights if they exist */}
            {flightData.flights.length > 0 && (
              <div className="mb-6 p-4 sm:p-6 bg-blue-100 rounded-lg border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <h3 className="text-lg sm:text-xl font-black uppercase mb-4">✈️ Flight Details</h3>
                {flightData.flights.map((flight) => (
                  <div key={flight.id} className="mb-3 p-3 sm:p-4 bg-white rounded border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <p className="font-black uppercase text-sm sm:text-base mb-2">{flight.title || `Flight ${flight.id}`}</p>
                    <p className="text-xs sm:text-sm text-gray-900 font-bold">Departure: {flight.departure}</p>
                    <p className="text-xs sm:text-sm text-gray-900 font-bold">Airline: {flight.airline}</p>
                    <p className="text-xs sm:text-sm text-gray-900 font-bold">Flight Number: {flight.flightNumber}</p>
                    <p className="text-xs sm:text-sm text-gray-900 font-bold">Seats: {flight.numberOfGuests}</p>
                  </div>
                ))}
                <div className="border-t-4 border-black pt-3 mt-3">
                  <p className="font-black uppercase text-sm sm:text-base">Total Cost: ${flightData.totalCost || '0.00'}</p>
                </div>
              </div>
            )}

            {/* Display Car Rental if it exists */}
            {carRentalData.title && (
              <div className="mb-6 p-4 sm:p-6 bg-green-100 rounded-lg border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <h3 className="text-lg sm:text-xl font-black uppercase mb-4">🚗 Car Rental Details</h3>
                
                <div className="mb-3 p-3 sm:p-4 bg-white rounded border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <p className="font-black uppercase text-sm sm:text-base mb-2">Rental Information</p>
                  <p className="text-xs sm:text-sm text-gray-900 font-bold">Agency: {carRentalData.title}</p>
                  <p className="text-xs sm:text-sm text-gray-900 font-bold">Pickup: {carRentalData.pickupDate} at {carRentalData.pickupTime}</p>
                  <p className="text-xs sm:text-sm text-gray-900 font-bold">Dropoff: {carRentalData.dropoffDate} at {carRentalData.dropoffTime}</p>
                  <p className="text-xs sm:text-sm text-gray-900 font-bold">Confirmation: {carRentalData.confirmationNumber}</p>
                  {carRentalData.website && <p className="text-xs sm:text-sm text-gray-900 font-bold">Website: {carRentalData.website}</p>}
                  {carRentalData.email && <p className="text-xs sm:text-sm text-gray-900 font-bold">Email: {carRentalData.email}</p>}
                </div>

                {(carRentalData.pickupLocation.location || carRentalData.pickupLocation.address) && (
                  <div className="mb-3 p-3 sm:p-4 bg-white rounded border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <p className="font-black uppercase text-xs sm:text-sm mb-2">Pickup Location</p>
                    {carRentalData.pickupLocation.location && <p className="text-xs sm:text-sm text-gray-900 font-bold">Location: {carRentalData.pickupLocation.location}</p>}
                    {carRentalData.pickupLocation.address && <p className="text-xs sm:text-sm text-gray-900 font-bold">Address: {carRentalData.pickupLocation.address}</p>}
                    {carRentalData.pickupLocation.phone && <p className="text-xs sm:text-sm text-gray-900 font-bold">Phone: {carRentalData.pickupLocation.phone}</p>}
                  </div>
                )}

                {(carRentalData.dropoffLocation.location || carRentalData.dropoffLocation.address) && (
                  <div className="mb-3 p-3 sm:p-4 bg-white rounded border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <p className="font-black uppercase text-xs sm:text-sm mb-2">Dropoff Location</p>
                    {carRentalData.dropoffLocation.location && <p className="text-xs sm:text-sm text-gray-900 font-bold">Location: {carRentalData.dropoffLocation.location}</p>}
                    {carRentalData.dropoffLocation.address && <p className="text-xs sm:text-sm text-gray-900 font-bold">Address: {carRentalData.dropoffLocation.address}</p>}
                    {carRentalData.dropoffLocation.phone && <p className="text-xs sm:text-sm text-gray-900 font-bold">Phone: {carRentalData.dropoffLocation.phone}</p>}
                  </div>
                )}

                {(carRentalData.rentalInfo.carType || carRentalData.rentalInfo.mileageCharges) && (
                  <div className="mb-3 p-3 sm:p-4 bg-white rounded border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <p className="font-black uppercase text-xs sm:text-sm mb-2">Vehicle Information</p>
                    {carRentalData.rentalInfo.carType && <p className="text-xs sm:text-sm text-gray-900 font-bold">Car Type: {carRentalData.rentalInfo.carType}</p>}
                    {carRentalData.rentalInfo.mileageCharges && <p className="text-xs sm:text-sm text-gray-900 font-bold">Mileage Charges: ${carRentalData.rentalInfo.mileageCharges}</p>}
                    {carRentalData.rentalInfo.carDetails && <p className="text-xs sm:text-sm text-gray-900 font-bold">Details: {carRentalData.rentalInfo.carDetails}</p>}
                  </div>
                )}

                <div className="border-t-4 border-black pt-3 mt-3">
                  <p className="font-black uppercase text-sm sm:text-base">Total Cost: ${carRentalData.totalCost || '0.00'}</p>
                </div>
              </div>
            )}


            {/* Display Activities if they exist */}
            {activityData.length > 0 && (
              <div className="mb-6 p-4 sm:p-6 bg-yellow-100 rounded-lg border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <h3 className="text-lg sm:text-xl font-black uppercase mb-4">🎭 Activity Details</h3>
                {activityData.map((activity) => (
                  <div key={activity.id} className="mb-3 p-3 sm:p-4 bg-white rounded border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <p className="font-black uppercase text-sm sm:text-base mb-2">{activity.title}</p>
                    <p className="text-xs sm:text-sm text-gray-900 font-bold">Start: {activity.startDate} {activity.startTime}</p>
                    <p className="text-xs sm:text-sm text-gray-900 font-bold">End: {activity.endDate} {activity.endTime}</p>
                    <p className="text-xs sm:text-sm text-gray-900 font-bold">Venue: {activity.venue}</p>
                    <p className="text-xs sm:text-sm text-gray-900 font-bold">Address: {activity.address}</p>
                    <p className="text-xs sm:text-sm text-gray-900 font-bold">Phone: {activity.phone}</p>
                    <p className="text-xs sm:text-sm text-gray-900 font-bold">Website: {activity.website}</p>
                    <p className="text-xs sm:text-sm text-gray-900 font-bold">Email: {activity.email}</p>
                    <p className="text-xs sm:text-sm text-gray-900 font-bold">Total Cost: ${activity.totalCost}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Display Lodging if it exists */}
            {lodgingData.length > 0 && (
              <div className="mb-6 p-4 sm:p-6 bg-purple-100 rounded-lg border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <h3 className="text-lg sm:text-xl font-black uppercase mb-4">🏨 Lodging Details</h3>
                {lodgingData.map((lodging) => (
                  <div key={lodging.id} className="mb-3 p-3 sm:p-4 bg-white rounded border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <p className="font-black uppercase text-sm sm:text-base mb-2">{lodging.title}</p>
                    <p className="text-xs sm:text-sm text-gray-900 font-bold">Start: {lodging.startDate} {lodging.startTime}</p>
                    <p className="text-xs sm:text-sm text-gray-900 font-bold">End: {lodging.endDate} {lodging.endTime}</p>
                    <p className="text-xs sm:text-sm text-gray-900 font-bold">Venue: {lodging.venue}</p>
                    <p className="text-xs sm:text-sm text-gray-900 font-bold">Address: {lodging.address}</p>
                    <p className="text-xs sm:text-sm text-gray-900 font-bold">Phone: {lodging.phone}</p>
                    <p className="text-xs sm:text-sm text-gray-900 font-bold">Website: {lodging.website}</p>
                    <p className="text-xs sm:text-sm text-gray-900 font-bold">Email: {lodging.email}</p>
                    <p className="text-xs sm:text-sm text-gray-900 font-bold">Confirmation: {lodging.confirmationNumber}</p>
                    <p className="text-xs sm:text-sm text-gray-900 font-bold">Total Cost: ${lodging.totalCost}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="mb-4 sm:mb-6 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <Link to="add-activity" className="bg-yellow-400 hover:bg-yellow-500 text-black font-black uppercase py-3 px-4 border-4 border-black rounded shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex items-center justify-center gap-2 w-full">
                <FaCalendarAlt /> Add Activity
              </Link>
              <Link to="add-flight" className="bg-blue-400 hover:bg-blue-500 text-black font-black uppercase py-3 px-4 border-4 border-black rounded shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex items-center justify-center gap-2 w-full">
                <FaPlane /> Add Flight
              </Link>
              <Link to="add-lodging" className="bg-purple-400 hover:bg-purple-500 text-black font-black uppercase py-3 px-4 border-4 border-black rounded shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex items-center justify-center gap-2 w-full">
                <FaHotel /> Add Lodging
              </Link>
              <Link to="add-car" className="bg-green-400 hover:bg-green-500 text-black font-black uppercase py-3 px-4 border-4 border-black rounded shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex items-center justify-center gap-2 w-full">
                <FaCar /> Add Car Rental
              </Link>
            </div>

            {submitError && (
              <div className="mb-4 p-4 bg-red-100 border-4 border-red-500 rounded text-red-700 font-bold">
                {submitError}
              </div>
            )}

            <div>
              <button
                className="bg-indigo-900 hover:bg-indigo-700 text-white font-black uppercase py-4 px-6 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all w-full rounded disabled:opacity-50 disabled:cursor-not-allowed"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving Trip...' : 'Save Trip'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>

      {/* Warning Modal */}
      {showWarningModal && (
        <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center z-50 px-4">
          <div className="bg-yellow-300 border-4 border-black rounded-lg shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-md w-full p-6">
            <h3 className="text-2xl font-black uppercase mb-4 text-black">⚠️ Warning!</h3>
              <p className="text-black font-bold mb-6">
                You have unsaved trip data. If you leave this page without saving, all your changes will be lost.
              </p>
            <div className="flex gap-3 flex-col sm:flex-row">
              <button
                onClick={cancelLeave}
                className="flex-1 bg-white hover:bg-gray-100 text-black font-black uppercase py-3 px-4 border-4 border-black rounded shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
              >
                Stay & Continue
              </button>
              <button
                onClick={confirmLeave}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-black uppercase py-3 px-4 border-4 border-black rounded shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
              >
                Leave Without Saving
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default AddTripPage