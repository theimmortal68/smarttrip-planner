

import React, { useContext, useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { FaCalendarAlt, FaPlane, FaHotel, FaCar } from 'react-icons/fa'
import { TripContext } from '../context/TripContext'

const EditTripPage = () => {
  const navigate = useNavigate()
  const _ctx = useContext(TripContext) || {}
  const { selectedTrip, setSelectedTrip, updateTrip, setFlightData, setCarRentalData, setActivityData, setLodgingData, flightData = { flights: [], totalCost: '' }, carRentalData = {}, activityData = [], lodgingData = [] } = _ctx


  // Trip main fields
  const [name, setTripName] = useState('')
  const [location, setTripLocation] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [notes, setDescription] = useState('')

  // Flights (array) and total cost
  const [flights, setFlights] = useState([])
  const [flightTotalCost, setFlightTotalCost] = useState('')


  // Car rental (object)
  const [carRental, setCarRental] = useState(null)

  // Activities (array)
  const [activities, setActivities] = useState([])
  // Lodging (array)
  const [lodgings, setLodgings] = useState([])


  useEffect(() => {
    if (selectedTrip) {
      setTripName(selectedTrip.name || '')
      setTripLocation(selectedTrip.location || '')
      setStartDate(selectedTrip.startDate || '')
      setEndDate(selectedTrip.endDate || '')
      setDescription(selectedTrip.notes || '')
      // Flights - check context first (for newly added items), then fall back to selectedTrip
      if (flightData?.flights?.length > 0) {
        setFlights(flightData.flights.map(f => ({ ...f })))
        setFlightTotalCost(flightData.totalCost || '')
      } else if (selectedTrip.flightData && Array.isArray(selectedTrip.flightData.flights)) {
        setFlights(selectedTrip.flightData.flights.map(f => ({ ...f })))
        setFlightTotalCost(selectedTrip.flightData.totalCost || '')
      } else {
        setFlights([])
        setFlightTotalCost('')
      }
      // Car rental - check context first
      if (carRentalData?.rentalAgency) {
        setCarRental({ ...carRentalData })
      } else if (selectedTrip.carRentalData && selectedTrip.carRentalData.rentalAgency) {
        setCarRental({ ...selectedTrip.carRentalData })
      } else {
        setCarRental(null)
      }
      // Activities - check context first
      if (activityData?.length > 0) {
        setActivities(activityData.map(a => ({ ...a })))
      } else if (selectedTrip.activityData && Array.isArray(selectedTrip.activityData)) {
        setActivities(selectedTrip.activityData.map(a => ({ ...a })))
      } else {
        setActivities([])
      }
      // Lodging - check context first
      if (lodgingData?.length > 0) {
        setLodgings(lodgingData.map(l => ({ ...l })))
      } else if (selectedTrip.lodgingData && Array.isArray(selectedTrip.lodgingData)) {
        setLodgings(selectedTrip.lodgingData.map(l => ({ ...l })))
      } else {
        setLodgings([])
      }
    }
  }, [selectedTrip, flightData, carRentalData, activityData, lodgingData])

  if (!selectedTrip) {
    return (
      <section className="bg-indigo-50 py-10">
        <div className="container m-auto px-6 max-w-2xl">
          <div className="bg-white p-6 rounded-lg shadow-md mt-6">
            <p className="text-gray-600">No trip selected. Please select a trip from the upcoming trips page.</p>
          </div>
        </div>
      </section>
    )
  }


  // --- Flights handlers ---
  const handleFlightChange = (id, field, value) => {
    setFlights(prev => prev.map(f => f.id === id ? { ...f, [field]: value } : f))
  }
  const handleAddFlight = () => {
    const nextId = flights.length > 0 ? Math.max(...flights.map(f => f.id)) + 1 : 1
    setFlights(prev => [...prev, { id: nextId, departure: '', airline: '', flightNumber: '', seats: '', customName: '' }])
  }
  const handleRemoveFlight = (id) => {
    setFlights(prev => prev.filter(f => f.id !== id))
  }

  // --- Car rental handlers ---
  const handleCarRentalChange = (e) => {
    const { name, value } = e.target
    setCarRental(prev => ({ ...prev, [name]: value }))
  }
  const handleCarRentalNestedChange = (section, field, value) => {
    setCarRental(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }))
  }

  // --- Activities handlers ---
  const handleActivityChange = (id, field, value) => {
    setActivities(prev => prev.map(a => a.id === id ? { ...a, [field]: value } : a))
  }
  const handleAddActivity = () => {
    const nextId = activities.length > 0 ? Math.max(...activities.map(a => a.id)) + 1 : 1
    setActivities(prev => [...prev, { id: nextId, activityName: '', startDate: '', startTime: '', endDate: '', endTime: '', venue: '', address: '', phone: '', website: '', email: '', totalCost: '' }])
  }
  const handleRemoveActivity = (id) => {
    setActivities(prev => prev.filter(a => a.id !== id))
  }

  // --- Lodging handlers ---
  const handleLodgingChange = (id, field, value) => {
    setLodgings(prev => prev.map(l => l.id === id ? { ...l, [field]: value } : l))
  }
  const handleAddLodging = () => {
    const nextId = lodgings.length > 0 ? Math.max(...lodgings.map(l => l.id)) + 1 : 1
    setLodgings(prev => [...prev, { id: nextId, lodgingName: '', startDate: '', startTime: '', endDate: '', endTime: '', venue: '', address: '', phone: '', website: '', email: '', confirmationNumber: '', totalCost: '' }])
  }
  const handleRemoveLodging = (id) => {
    setLodgings(prev => prev.filter(l => l.id !== id))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!selectedTrip) return
    const updatedTrip = {
      ...selectedTrip,
      name,
      location,
      startDate,
      endDate,
      notes,
      flightData: flights.length > 0 ? { flights, totalCost: flightTotalCost } : undefined,
      carRentalData: carRental && carRental.rentalAgency ? carRental : undefined,
      activityData: activities.length > 0 ? activities : undefined,
      lodgingData: lodgings.length > 0 ? lodgings : undefined
    }
    updateTrip(updatedTrip)
    setSelectedTrip(updatedTrip)
    navigate('/upcoming-trips-page/trip-details')
  }

  return (
    <section className="bg-gray-50 min-h-screen py-6 sm:py-12 px-4">
      <div className="container m-auto max-w-2xl py-12 sm:py-24">
        <div className="bg-white px-6 sm:px-8 py-8 sm:py-10 mb-4 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] sm:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-lg m-4 md:m-0">
          <form onSubmit={handleSubmit}>
            <h2 className="text-3xl sm:text-4xl text-center font-black uppercase mb-6 sm:mb-8">Edit Trip</h2>

            <div className="mb-4 sm:mb-6">
              <label className="block text-gray-900 font-black uppercase mb-2 sm:mb-3 text-xs sm:text-sm">Trip Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={name}
                onChange={e => setTripName(e.target.value)}
                className="border-4 border-black rounded w-full py-2 sm:py-3 px-3 sm:px-4 font-bold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                placeholder="eg. Family Holiday"
                required
              />
            </div>

            <div className="mb-4 sm:mb-6">
              <label className="block text-gray-900 font-black uppercase mb-2 sm:mb-3 text-xs sm:text-sm">Trip Location</label>
              <input
                type="text"
                id="location"
                name="location"
                value={location}
                onChange={e => setTripLocation(e.target.value)}
                className="border-4 border-black rounded w-full py-2 sm:py-3 px-3 sm:px-4 font-bold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                placeholder="eg. Hagerstown, Maryland"
                required
              />
            </div>

            <div className="mb-4 sm:mb-6">
              <label className="block text-gray-900 font-black uppercase mb-2 sm:mb-3 text-xs sm:text-sm">Start Date</label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="border-4 border-black rounded w-full py-2 sm:py-3 px-3 sm:px-4 font-bold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>

            <div className="mb-4 sm:mb-6">
              <label className="block text-gray-900 font-black uppercase mb-2 sm:mb-3 text-xs sm:text-sm">End Date</label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="border-4 border-black rounded w-full py-2 sm:py-3 px-3 sm:px-4 font-bold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                min={startDate || new Date().toISOString().split('T')[0]}
                required
              />
            </div>

            <div className="mb-6 sm:mb-8">
              <label htmlFor="description" className="block text-gray-900 font-black uppercase mb-2 sm:mb-3 text-xs sm:text-sm">Description</label>
              <textarea
                id="notes"
                name="notes"
                value={notes}
                onChange={e => setDescription(e.target.value)}
                className="border-4 border-black rounded w-full py-2 sm:py-3 px-3 sm:px-4 font-bold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                rows="4"
                placeholder="Add daily activities etc."
              ></textarea>
            </div>

            {/* --- Flights Section --- */}
            {flights.length > 0 && (
              <div className="mb-6 sm:mb-8 p-4 sm:p-6 bg-blue-100 rounded-lg border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <h3 className="text-lg sm:text-xl font-black uppercase mb-4">✈️ Edit Flight Details</h3>
                <div className="mb-4 sm:mb-6">
                  <label className="block text-gray-900 font-black uppercase mb-2 sm:mb-3 text-xs sm:text-sm">Total Cost</label>
                  <input
                    type="text"
                    value={flightTotalCost}
                    onChange={e => { const val = e.target.value; if (/^[0-9.]*$/.test(val)) setFlightTotalCost(val) }}
                    className="border-4 border-black rounded w-full py-2 sm:py-3 px-3 sm:px-4 font-bold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                    placeholder="eg. 299.99"
                  />
                </div>
                {flights.map((flight, idx) => (
                  <div key={flight.id} className="mb-4 sm:mb-6 p-4 sm:p-6 border-4 border-black rounded-lg bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <div className="flex items-center gap-2">
                        <h3 className="font-black uppercase text-sm sm:text-base">{flight.customName || `Flight ${flight.id}`}</h3>
                      </div>
                      {flights.length > 1 && (
                        <button type="button" onClick={() => handleRemoveFlight(flight.id)} className="text-xs sm:text-sm text-red-600 hover:text-red-800 font-bold uppercase border-2 border-red-600 px-2 py-1 rounded hover:bg-red-50">Remove</button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <label className="block text-gray-900 font-black uppercase mb-2 text-xs sm:text-sm">Departure Date</label>
                        <input
                          type="date"
                          value={flight.departure}
                          onChange={(e) => handleFlightChange(flight.id, 'departure', e.target.value)}
                          className="border-4 border-black rounded w-full py-2 sm:py-3 px-3 sm:px-4 font-bold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                          min={new Date().toISOString().split('T')[0]}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-gray-900 font-black uppercase mb-2 text-xs sm:text-sm">Airline</label>
                        <input type="text" value={flight.airline} onChange={e => handleFlightChange(flight.id, 'airline', e.target.value)} className="border-4 border-black rounded w-full py-2 sm:py-3 px-3 sm:px-4 font-bold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black" placeholder="Airline name" />
                      </div>
                      <div>
                        <label className="block text-gray-900 font-black uppercase mb-2 text-xs sm:text-sm">Flight Number</label>
                        <input type="text" value={flight.flightNumber} onChange={e => handleFlightChange(flight.id, 'flightNumber', e.target.value)} className="border-4 border-black rounded w-full py-2 sm:py-3 px-3 sm:px-4 font-bold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black" placeholder="e.g. BA123" />
                      </div>
                      <div>
                        <label className="block text-gray-900 font-black uppercase mb-2 text-xs sm:text-sm">Seats</label>
                        <input type="text" value={flight.seats} onChange={e => handleFlightChange(flight.id, 'seats', e.target.value)} className="border-4 border-black rounded w-full py-2 sm:py-3 px-3 sm:px-4 font-bold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black" placeholder="Seats" />
                      </div>
                    </div>
                  </div>
                ))}
                <div className="flex justify-end mt-3 sm:mt-4">
                  <button type="button" onClick={handleAddFlight} className="text-xs sm:text-sm text-indigo-900 hover:text-indigo-700 font-bold uppercase border-2 border-indigo-900 px-3 py-1.5 rounded hover:bg-indigo-50">Add another flight</button>
                </div>
              </div>
            )}

            {/* --- Car Rental Section --- */}
            {carRental && (
              <div className="mb-6 sm:mb-8 p-4 sm:p-6 bg-green-100 rounded-lg border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <h3 className="text-lg sm:text-xl font-black uppercase mb-4">🚗 Edit Car Rental Details</h3>
                <div className="mb-4 sm:mb-6">
                  <label className="block text-gray-900 font-black uppercase mb-2 text-xs sm:text-sm">Rental Agency</label>
                  <input type="text" name="title" value={carRental.title} onChange={handleCarRentalChange} className="border-4 border-black rounded w-full py-2 sm:py-3 px-3 sm:px-4 font-bold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black" placeholder="Rental Agency" />
                </div>
                <div className="mb-4 sm:mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-900 font-black uppercase mb-2 text-xs sm:text-sm">Pickup Date</label>
                    <input type="date" name="pickupDate" value={carRental.pickupDate} onChange={handleCarRentalChange} className="border-4 border-black rounded w-full py-2 sm:py-3 px-3 sm:px-4 font-bold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black" min={new Date().toISOString().split('T')[0]} required />
                  </div>
                  <div>
                    <label className="block text-gray-900 font-black uppercase mb-2 text-xs sm:text-sm">Pickup Time</label>
                    <input type="time" name="pickupTime" value={carRental.pickupTime} onChange={handleCarRentalChange} className="border-4 border-black rounded w-full py-2 sm:py-3 px-3 sm:px-4 font-bold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black" />
                  </div>
                </div>
                <div className="mb-4 sm:mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-900 font-black uppercase mb-2 text-xs sm:text-sm">Dropoff Date</label>
                    <input type="date" name="dropoffDate" value={carRental.dropoffDate} onChange={handleCarRentalChange} className="border-4 border-black rounded w-full py-2 sm:py-3 px-3 sm:px-4 font-bold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black" min={carRental.pickupDate || new Date().toISOString().split('T')[0]} required />
                  </div>
                  <div>
                    <label className="block text-gray-900 font-black uppercase mb-2 text-xs sm:text-sm">Dropoff Time</label>
                    <input type="time" name="dropoffTime" value={carRental.dropoffTime} onChange={handleCarRentalChange} className="border-4 border-black rounded w-full py-2 sm:py-3 px-3 sm:px-4 font-bold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black" />
                  </div>
                </div>
                <div className="mb-4 sm:mb-6">
                  <label className="block text-gray-900 font-black uppercase mb-2 text-xs sm:text-sm">Website</label>
                  <input type="text" name="website" value={carRental.website} onChange={handleCarRentalChange} className="border-4 border-black rounded w-full py-2 sm:py-3 px-3 sm:px-4 font-bold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black" placeholder="Website" />
                </div>
                <div className="mb-4 sm:mb-6">
                  <label className="block text-gray-900 font-black uppercase mb-2 text-xs sm:text-sm">Email</label>
                  <input type="email" name="email" value={carRental.email} onChange={handleCarRentalChange} className="border-4 border-black rounded w-full py-2 sm:py-3 px-3 sm:px-4 font-bold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black" placeholder="Email" />
                </div>
                <div className="mb-4 sm:mb-6">
                  <label className="block text-gray-900 font-black uppercase mb-2 text-xs sm:text-sm">Confirmation Number</label>
                  <input type="text" name="confirmationNumber" value={carRental.confirmationNumber} onChange={handleCarRentalChange} className="border-4 border-black rounded w-full py-2 sm:py-3 px-3 sm:px-4 font-bold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black" placeholder="Confirmation number" />
                </div>
                <div className="mb-6 sm:mb-8">
                  <label className="block text-gray-900 font-black uppercase mb-2 text-xs sm:text-sm">Total Cost</label>
                  <input type="text" name="totalCost" value={carRental.totalCost} onChange={e => {
                    const val = e.target.value
                    if (/^[0-9.]*$/.test(val)) handleCarRentalChange(e)
                  }} className="border-4 border-black rounded w-full py-2 sm:py-3 px-3 sm:px-4 font-bold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black" placeholder="Total Cost" />
                </div>
                {/* Pickup Location */}
                <h3 className="text-base sm:text-lg font-black uppercase mt-8 mb-4">Pickup Location</h3>
                <div className="mb-4 sm:mb-6">
                  <label className="block text-gray-900 font-black uppercase mb-2 text-xs sm:text-sm">Pickup Location</label>
                  <input type="text" value={carRental.pickupLocation?.location || ''} onChange={e => handleCarRentalNestedChange('pickupLocation', 'location', e.target.value)} className="border-4 border-black rounded w-full py-2 sm:py-3 px-3 sm:px-4 font-bold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black" placeholder="Pickup location" />
                </div>
                <div className="mb-4 sm:mb-6">
                  <label className="block text-gray-900 font-black uppercase mb-2 text-xs sm:text-sm">Address</label>
                  <input type="text" value={carRental.pickupLocation?.address || ''} onChange={e => handleCarRentalNestedChange('pickupLocation', 'address', e.target.value)} className="border-4 border-black rounded w-full py-2 sm:py-3 px-3 sm:px-4 font-bold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black" placeholder="Address" />
                </div>
                <div className="mb-6 sm:mb-8">
                  <label className="block text-gray-900 font-black uppercase mb-2 text-xs sm:text-sm">Phone</label>
                  <input type="text" value={carRental.pickupLocation?.phone || ''} onChange={e => handleCarRentalNestedChange('pickupLocation', 'phone', e.target.value)} className="border-4 border-black rounded w-full py-2 sm:py-3 px-3 sm:px-4 font-bold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black" placeholder="Phone" />
                </div>
                {/* Dropoff Location */}
                <h3 className="text-base sm:text-lg font-black uppercase mt-8 mb-4">Dropoff Location</h3>
                <div className="mb-4 sm:mb-6">
                  <label className="block text-gray-900 font-black uppercase mb-2 text-xs sm:text-sm">Dropoff Location</label>
                  <input type="text" value={carRental.dropoffLocation?.location || ''} onChange={e => handleCarRentalNestedChange('dropoffLocation', 'location', e.target.value)} className="border-4 border-black rounded w-full py-2 sm:py-3 px-3 sm:px-4 font-bold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black" placeholder="Dropoff location" />
                </div>
                <div className="mb-4 sm:mb-6">
                  <label className="block text-gray-900 font-black uppercase mb-2 text-xs sm:text-sm">Address</label>
                  <input type="text" value={carRental.dropoffLocation?.address || ''} onChange={e => handleCarRentalNestedChange('dropoffLocation', 'address', e.target.value)} className="border-4 border-black rounded w-full py-2 sm:py-3 px-3 sm:px-4 font-bold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black" placeholder="Address" />
                </div>
                <div className="mb-6 sm:mb-8">
                  <label className="block text-gray-900 font-black uppercase mb-2 text-xs sm:text-sm">Phone</label>
                  <input type="text" value={carRental.dropoffLocation?.phone || ''} onChange={e => handleCarRentalNestedChange('dropoffLocation', 'phone', e.target.value)} className="border-4 border-black rounded w-full py-2 sm:py-3 px-3 sm:px-4 font-bold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black" placeholder="Phone" />
                </div>
                {/* Rental Info */}
                <h3 className="text-base sm:text-lg font-black uppercase mt-8 mb-4">Rental Information</h3>
                <div className="mb-4 sm:mb-6">
                  <label className="block text-gray-900 font-black uppercase mb-2 text-xs sm:text-sm">Car Type</label>
                  <input type="text" value={carRental.rentalInfo?.carType || ''} onChange={e => handleCarRentalNestedChange('rentalInfo', 'carType', e.target.value)} className="border-4 border-black rounded w-full py-2 sm:py-3 px-3 sm:px-4 font-bold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black" placeholder="Car type" />
                </div>
                <div className="mb-4 sm:mb-6">
                  <label className="block text-gray-900 font-black uppercase mb-2 text-xs sm:text-sm">Mileage Charges</label>
                  <input type="text" value={carRental.rentalInfo?.mileageCharges || ''} onChange={e => {
                    const val = e.target.value
                    if (/^[0-9.]*$/.test(val)) handleCarRentalNestedChange('rentalInfo', 'mileageCharges', val)
                  }} className="border-4 border-black rounded w-full py-2 sm:py-3 px-3 sm:px-4 font-bold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black" placeholder="Mileage charges" />
                </div>
                <div className="mb-6 sm:mb-8">
                  <label className="block text-gray-900 font-black uppercase mb-2 text-xs sm:text-sm">Car Details</label>
                  <input type="text" value={carRental.rentalInfo?.carDetails || ''} onChange={e => handleCarRentalNestedChange('rentalInfo', 'carDetails', e.target.value)} className="border-4 border-black rounded w-full py-2 sm:py-3 px-3 sm:px-4 font-bold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black" placeholder="Car details" />
                </div>
              </div>
            )}

            {/* --- Activities Section --- */}
            {activities.length > 0 && (
              <div className="mb-6 sm:mb-8 p-4 sm:p-6 bg-yellow-100 rounded-lg border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <h3 className="text-lg sm:text-xl font-black uppercase mb-4">🎭 Edit Activity Details</h3>
                {activities.map((activity, idx) => (
                  <div key={activity.id} className="mb-4 sm:mb-6 p-4 sm:p-6 border-4 border-black rounded-lg bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <div className="flex items-center gap-2">
                        <h3 className="font-black uppercase text-sm sm:text-base">{activity.activityName || `Activity ${activity.id}`}</h3>
                      </div>
                      {activities.length > 1 && (
                        <button type="button" onClick={() => handleRemoveActivity(activity.id)} className="text-xs sm:text-sm text-red-600 hover:text-red-800 font-bold uppercase border-2 border-red-600 px-2 py-1 rounded hover:bg-red-50">Remove</button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <label className="block text-gray-900 font-black uppercase mb-2 text-xs sm:text-sm">Activity Name</label>
                        <input type="text" value={activity.activityName} onChange={e => handleActivityChange(activity.id, 'activityName', e.target.value)} className="border-4 border-black rounded w-full py-2 sm:py-3 px-3 sm:px-4 font-bold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black" placeholder="Activity Name" />
                      </div>
                      <div>
                        <label className="block text-gray-900 font-black uppercase mb-2 text-xs sm:text-sm">Venue</label>
                        <input type="text" value={activity.venue} onChange={e => handleActivityChange(activity.id, 'venue', e.target.value)} className="border-4 border-black rounded w-full py-2 sm:py-3 px-3 sm:px-4 font-bold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black" placeholder="Venue" />
                      </div>
                      <div>
                        <label className="block text-gray-900 font-black uppercase mb-2 text-xs sm:text-sm">Start Date</label>
                        <input type="date" value={activity.startDate} onChange={e => handleActivityChange(activity.id, 'startDate', e.target.value)} className="border-4 border-black rounded w-full py-2 sm:py-3 px-3 sm:px-4 font-bold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black" />
                      </div>
                      <div>
                        <label className="block text-gray-900 font-black uppercase mb-2 text-xs sm:text-sm">Start Time</label>
                        <input type="time" value={activity.startTime} onChange={e => handleActivityChange(activity.id, 'startTime', e.target.value)} className="border-4 border-black rounded w-full py-2 sm:py-3 px-3 sm:px-4 font-bold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black" />
                      </div>
                      <div>
                        <label className="block text-gray-900 font-black uppercase mb-2 text-xs sm:text-sm">End Date</label>
                        <input type="date" value={activity.endDate} onChange={e => handleActivityChange(activity.id, 'endDate', e.target.value)} className="border-4 border-black rounded w-full py-2 sm:py-3 px-3 sm:px-4 font-bold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black" min={activity.startDate || new Date().toISOString().split('T')[0]} />
                      </div>
                      <div>
                        <label className="block text-gray-900 font-black uppercase mb-2 text-xs sm:text-sm">End Time</label>
                        <input type="time" value={activity.endTime} onChange={e => handleActivityChange(activity.id, 'endTime', e.target.value)} className="border-4 border-black rounded w-full py-2 sm:py-3 px-3 sm:px-4 font-bold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black" />
                      </div>
                      <div>
                        <label className="block text-gray-900 font-black uppercase mb-2 text-xs sm:text-sm">Address</label>
                        <input type="text" value={activity.address} onChange={e => handleActivityChange(activity.id, 'address', e.target.value)} className="border-4 border-black rounded w-full py-2 sm:py-3 px-3 sm:px-4 font-bold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black" placeholder="Address" />
                      </div>
                      <div>
                        <label className="block text-gray-900 font-black uppercase mb-2 text-xs sm:text-sm">Phone</label>
                        <input type="text" value={activity.phone} onChange={e => handleActivityChange(activity.id, 'phone', e.target.value)} className="border-4 border-black rounded w-full py-2 sm:py-3 px-3 sm:px-4 font-bold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black" placeholder="Phone" />
                      </div>
                      <div>
                        <label className="block text-gray-900 font-black uppercase mb-2 text-xs sm:text-sm">Website</label>
                        <input type="text" value={activity.website} onChange={e => handleActivityChange(activity.id, 'website', e.target.value)} className="border-4 border-black rounded w-full py-2 sm:py-3 px-3 sm:px-4 font-bold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black" placeholder="Website" />
                      </div>
                      <div>
                        <label className="block text-gray-900 font-black uppercase mb-2 text-xs sm:text-sm">Email</label>
                        <input type="email" value={activity.email} onChange={e => handleActivityChange(activity.id, 'email', e.target.value)} className="border-4 border-black rounded w-full py-2 sm:py-3 px-3 sm:px-4 font-bold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black" placeholder="Email" />
                      </div>
                      <div>
                        <label className="block text-gray-900 font-black uppercase mb-2 text-xs sm:text-sm">Total Cost</label>
                        <input type="text" value={activity.totalCost} onChange={e => { const val = e.target.value; if (/^[0-9.]*$/.test(val)) handleActivityChange(activity.id, 'totalCost', val) }} className="border-4 border-black rounded w-full py-2 sm:py-3 px-3 sm:px-4 font-bold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black" placeholder="Total Cost" />
                      </div>
                    </div>
                  </div>
                ))}
                <div className="flex justify-end mt-3 sm:mt-4">
                  <button type="button" onClick={handleAddActivity} className="text-xs sm:text-sm text-yellow-700 hover:text-yellow-900 font-bold uppercase border-2 border-yellow-700 px-3 py-1.5 rounded hover:bg-yellow-50">Add another activity</button>
                </div>
              </div>
            )}

            {/* --- Lodging Section --- */}
            {lodgings.length > 0 && (
              <div className="mb-6 sm:mb-8 p-4 sm:p-6 bg-purple-100 rounded-lg border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <h3 className="text-lg sm:text-xl font-black uppercase mb-4">🏨 Edit Lodging Details</h3>
                {lodgings.map((lodging, idx) => (
                  <div key={lodging.id} className="mb-4 sm:mb-6 p-4 sm:p-6 border-4 border-black rounded-lg bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <div className="flex items-center gap-2">
                        <h3 className="font-black uppercase text-sm sm:text-base">{lodging.lodgingName || `Lodging ${lodging.id}`}</h3>
                      </div>
                      {lodgings.length > 1 && (
                        <button type="button" onClick={() => handleRemoveLodging(lodging.id)} className="text-xs sm:text-sm text-red-600 hover:text-red-800 font-bold uppercase border-2 border-red-600 px-2 py-1 rounded hover:bg-red-50">Remove</button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <label className="block text-gray-900 font-black uppercase mb-2 text-xs sm:text-sm">Lodging Name</label>
                        <input type="text" value={lodging.title} onChange={e => handleLodgingChange(lodging.id, 'title', e.target.value)} className="border-4 border-black rounded w-full py-2 sm:py-3 px-3 sm:px-4 font-bold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black" placeholder="Lodging name" />
                      </div>
                      <div>
                        <label className="block text-gray-900 font-black uppercase mb-2 text-xs sm:text-sm">Venue</label>
                        <input type="text" value={lodging.venue} onChange={e => handleLodgingChange(lodging.id, 'venue', e.target.value)} className="border-4 border-black rounded w-full py-2 sm:py-3 px-3 sm:px-4 font-bold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black" placeholder="Venue" />
                      </div>
                      <div>
                        <label className="block text-gray-900 font-black uppercase mb-2 text-xs sm:text-sm">Start Date</label>
                        <input type="date" value={lodging.startDate} onChange={e => handleLodgingChange(lodging.id, 'startDate', e.target.value)} className="border-4 border-black rounded w-full py-2 sm:py-3 px-3 sm:px-4 font-bold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black" />
                      </div>
                      <div>
                        <label className="block text-gray-900 font-black uppercase mb-2 text-xs sm:text-sm">Start Time</label>
                        <input type="time" value={lodging.startTime} onChange={e => handleLodgingChange(lodging.id, 'startTime', e.target.value)} className="border-4 border-black rounded w-full py-2 sm:py-3 px-3 sm:px-4 font-bold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black" />
                      </div>
                      <div>
                        <label className="block text-gray-900 font-black uppercase mb-2 text-xs sm:text-sm">End Date</label>
                        <input type="date" value={lodging.endDate} onChange={e => handleLodgingChange(lodging.id, 'endDate', e.target.value)} className="border-4 border-black rounded w-full py-2 sm:py-3 px-3 sm:px-4 font-bold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black" min={lodging.startDate || new Date().toISOString().split('T')[0]} />
                      </div>
                      <div>
                        <label className="block text-gray-900 font-black uppercase mb-2 text-xs sm:text-sm">End Time</label>
                        <input type="time" value={lodging.endTime} onChange={e => handleLodgingChange(lodging.id, 'endTime', e.target.value)} className="border-4 border-black rounded w-full py-2 sm:py-3 px-3 sm:px-4 font-bold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black" />
                      </div>
                      <div>
                        <label className="block text-gray-900 font-black uppercase mb-2 text-xs sm:text-sm">Address</label>
                        <input type="text" value={lodging.address} onChange={e => handleLodgingChange(lodging.id, 'address', e.target.value)} className="border-4 border-black rounded w-full py-2 sm:py-3 px-3 sm:px-4 font-bold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black" placeholder="Address" />
                      </div>
                      <div>
                        <label className="block text-gray-900 font-black uppercase mb-2 text-xs sm:text-sm">Phone</label>
                        <input type="text" value={lodging.phone} onChange={e => handleLodgingChange(lodging.id, 'phone', e.target.value)} className="border-4 border-black rounded w-full py-2 sm:py-3 px-3 sm:px-4 font-bold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black" placeholder="Phone" />
                      </div>
                      <div>
                        <label className="block text-gray-900 font-black uppercase mb-2 text-xs sm:text-sm">Website</label>
                        <input type="text" value={lodging.website} onChange={e => handleLodgingChange(lodging.id, 'website', e.target.value)} className="border-4 border-black rounded w-full py-2 sm:py-3 px-3 sm:px-4 font-bold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black" placeholder="Website" />
                      </div>
                      <div>
                        <label className="block text-gray-900 font-black uppercase mb-2 text-xs sm:text-sm">Email</label>
                        <input type="email" value={lodging.email} onChange={e => handleLodgingChange(lodging.id, 'email', e.target.value)} className="border-4 border-black rounded w-full py-2 sm:py-3 px-3 sm:px-4 font-bold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black" placeholder="Email" />
                      </div>
                      <div>
                        <label className="block text-gray-900 font-black uppercase mb-2 text-xs sm:text-sm">Confirmation Number</label>
                        <input type="text" value={lodging.confirmationNumber} onChange={e => handleLodgingChange(lodging.id, 'confirmationNumber', e.target.value)} className="border-4 border-black rounded w-full py-2 sm:py-3 px-3 sm:px-4 font-bold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black" placeholder="Confirmation number" />
                      </div>
                      <div>
                        <label className="block text-gray-900 font-black uppercase mb-2 text-xs sm:text-sm">Total Cost</label>
                        <input type="text" value={lodging.totalCost} onChange={e => { const val = e.target.value; if (/^[0-9.]*$/.test(val)) handleLodgingChange(lodging.id, 'totalCost', val) }} className="border-4 border-black rounded w-full py-2 sm:py-3 px-3 sm:px-4 font-bold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black" placeholder="Total Cost" />
                      </div>
                    </div>
                  </div>
                ))}
                <div className="flex justify-end mt-3 sm:mt-4">
                  <button type="button" onClick={handleAddLodging} className="text-xs sm:text-sm text-purple-700 hover:text-purple-900 font-bold uppercase border-2 border-purple-700 px-3 py-1.5 rounded hover:bg-purple-50">Add another lodging</button>
                </div>
              </div>
            )}

            <div className="mb-6 grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => {
                  // Sync current state to context before navigating
                  if (activities.length > 0) setActivityData(activities)
                  navigate('/add-trip/add-activity')
                }}
                className="bg-yellow-400 hover:bg-yellow-500 text-black font-black uppercase py-3 px-4 border-4 border-black rounded shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex items-center justify-center gap-2 w-full"
              >
                <FaCalendarAlt /> Add Activity
              </button>
              <button
                type="button"
                onClick={() => {
                  // Sync current state to context before navigating
                  if (flights.length > 0) setFlightData({ flights, totalCost: flightTotalCost })
                  navigate('/add-trip/add-flight')
                }}
                className="bg-blue-400 hover:bg-blue-500 text-black font-black uppercase py-3 px-4 border-4 border-black rounded shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex items-center justify-center gap-2 w-full"
              >
                <FaPlane /> Add Flight
              </button>
              <button
                type="button"
                onClick={() => {
                  // Sync current state to context before navigating
                  if (lodgings.length > 0) setLodgingData(lodgings)
                  navigate('/add-trip/add-lodging')
                }}
                className="bg-purple-400 hover:bg-purple-500 text-black font-black uppercase py-3 px-4 border-4 border-black rounded shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex items-center justify-center gap-2 w-full"
              >
                <FaHotel /> Add Lodging
              </button>
              <button
                type="button"
                onClick={() => {
                  // Sync current state to context before navigating
                  if (carRental) setCarRentalData(carRental)
                  navigate('/add-trip/add-car')
                }}
                className="bg-green-400 hover:bg-green-500 text-black font-black uppercase py-3 px-4 border-4 border-black rounded shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex items-center justify-center gap-2 w-full"
              >
                <FaCar /> Add Car Rental
              </button>
            </div>

            <div>
              <button
                className="bg-indigo-900 hover:bg-indigo-700 text-white font-black uppercase py-4 px-6 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all w-full rounded"
                type="submit"
              >
                Save Trip
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  )
}

export default EditTripPage