import React, { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaCalendarAlt, FaPlane, FaHotel, FaCar, FaPencilAlt } from 'react-icons/fa'
import { TripContext } from '../context/TripContext'

// Single flight component used for each created flight
const FlightItem = ({ flight, onChange, onRemove, onAdd, canRemove }) => {
  const { id, departure, airline, flightNumber, seats, customName } = flight
  const [isEditingName, setIsEditingName] = useState(false)
  const [editNameValue, setEditNameValue] = useState(customName || `Flight ${id}`)

  const handlePickerChange = (e) => {
    const val = e.target.value // yyyy-mm-dd
    if (!val) return onChange(id, 'departure', '')
    const [y, m, d] = val.split('-')
    onChange(id, 'departure', `${m}/${d}/${y}`)
  }

  const handleSaveName = () => {
    onChange(id, 'customName', editNameValue)
    setIsEditingName(false)
  }

  const displayName = customName || `Flight ${id}`

  return (
    <div className="mb-6 sm:mb-8 p-4 sm:p-6 border-4 border-black rounded-lg bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div className="flex items-center gap-2">
          <h3 className="font-black uppercase text-sm sm:text-base">{displayName}</h3>
          {!isEditingName && (
            <button type="button" onClick={() => setIsEditingName(true)} title="Edit Flight Name" className="text-indigo-900 hover:text-indigo-700 font-bold">
              <FaPencilAlt />
            </button>
          )}
        </div>
        {canRemove && (
          <button type="button" onClick={() => onRemove(id)} className="text-xs sm:text-sm text-red-600 hover:text-red-800 font-bold uppercase border-2 border-red-600 px-2 py-1 rounded hover:bg-red-50">Remove</button>
        )}
      </div>

      {isEditingName && (
        <div className="mb-4 flex gap-2 items-center">
          <input
            type="text"
            value={editNameValue}
            onChange={(e) => setEditNameValue(e.target.value)}
            className="border-4 border-black rounded py-2 px-3 flex-1 font-bold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
            placeholder="Enter flight name"
            autoFocus
          />
          <button type="button" onClick={handleSaveName} className="text-xs sm:text-sm text-green-700 hover:text-green-900 font-bold uppercase border-2 border-green-700 px-2 py-1 rounded hover:bg-green-50">Save</button>
          <button type="button" onClick={() => setIsEditingName(false)} className="text-xs sm:text-sm text-gray-700 hover:text-gray-900 font-bold uppercase border-2 border-gray-700 px-2 py-1 rounded hover:bg-gray-50">Cancel</button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        <div>
          <label className="block text-gray-900 font-black uppercase mb-2 text-xs sm:text-sm">Departure Date</label>
          <input
            type="date"
            value={departure}
            onChange={(e) => onChange(id, 'departure', e.target.value)}
            className="border-4 border-black rounded w-full py-2 sm:py-3 px-3 sm:px-4 font-bold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
            min={new Date().toISOString().split('T')[0]}
            required
          />
        </div>

        <div>
          <label className="block text-gray-900 font-black uppercase mb-2 text-xs sm:text-sm">Airline</label>
          <input type="text" value={airline} onChange={(e) => onChange(id, 'airline', e.target.value)} className="border-4 border-black rounded w-full py-2 sm:py-3 px-3 sm:px-4 font-bold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black" placeholder="Airline name" />
        </div>

        <div>
          <label className="block text-gray-900 font-black uppercase mb-2 text-xs sm:text-sm">Flight Number</label>
          <input type="text" value={flightNumber} onChange={(e) => onChange(id, 'flightNumber', e.target.value)} className="border-4 border-black rounded w-full py-2 sm:py-3 px-3 sm:px-4 font-bold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black" placeholder="e.g. BA123" />
        </div>

        <div>
          <label className="block text-gray-900 font-black uppercase mb-2 text-xs sm:text-sm">Seats</label>
          <input type="text" value={seats} onChange={(e) => {
            const val = e.target.value;
            if (/^[a-zA-Z0-9]*$/.test(val)) {
              onChange(id, 'seats', val);
            }
          }} className="border-4 border-black rounded w-full py-2 sm:py-3 px-3 sm:px-4 font-bold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black" placeholder="Seats" />
        </div>
      </div>
      <div className="flex justify-end mt-3 sm:mt-4">
        <button
          type="button"
          onClick={() => onAdd && onAdd()}
          className="text-xs sm:text-sm text-indigo-900 hover:text-indigo-700 font-bold uppercase border-2 border-indigo-900 px-3 py-1.5 rounded hover:bg-indigo-50"
        >
          Add another flight
        </button>
      </div>
    </div>
  )
}

const AddFlight = () => {
  const navigate = useNavigate()
  const _ctx = useContext(TripContext) || {}
  const { setFlightData, flightData = { flights: [], totalCost: '' }, selectedTrip } = _ctx

  // keep the per-page start/end states if you need them for the overall flight booking
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  // dynamic flights list - initialize with context data if available, otherwise one empty flight
  const [flights, setFlights] = useState(() => {
    if (flightData?.flights?.length > 0) return flightData.flights.map(f => ({ ...f }))
    return [{ id: 1, departure: '', airline: '', flightNumber: '', seats: '', customName: '' }]
  })
  const [nextId, setNextId] = useState(() => {
    if (flightData?.flights?.length > 0) {
      return Math.max(...flightData.flights.map(f => f.id)) + 1
    }
    return 2
  })
  const [totalCost, setTotalCost] = useState(() => flightData?.totalCost || '')

  // Convert mm/dd/yyyy to yyyy-mm-dd (kept for parity with other pages)
  const formatDateToInput = (dateStr) => {
    if (!dateStr) return ''
    const parts = dateStr.split('/')
    if (parts.length !== 3) return ''
    const [month, day, year] = parts
    return `${year}-${month}-${day}`
  }

  const handleStartDateChange = (e) => setStartDate(e.target.value)
  const handleEndDateChange = (e) => setEndDate(e.target.value)

  const addFlight = () => {
    setFlights((prev) => [...prev, { id: nextId, departure: '', airline: '', flightNumber: '', seats: '', customName: '' }])
    setNextId((n) => n + 1)
  }

  const updateFlight = (id, field, value) => {
    setFlights((prev) => prev.map((f) => (f.id === id ? { ...f, [field]: value } : f)))
  }

  const removeFlight = (id) => setFlights((prev) => prev.filter((f) => f.id !== id))

  const handleSubmit = (e) => {
    e.preventDefault()
    // Save flight data to context
    setFlightData({
      flights: flights,
      totalCost: totalCost
    })
    // Redirect to edit-trip page if editing, otherwise add-trip page
    if (selectedTrip) {
      navigate('/trip-details/edit-trip')
    } else {
      navigate('/add-trip')
    }
  }

  return (
    <>
      <section className="bg-gray-50 min-h-screen py-6 sm:py-12 px-4">
        <div className="container m-auto max-w-2xl py-12 sm:py-24">
          <div className="bg-white px-6 sm:px-8 py-8 sm:py-10 mb-4 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] sm:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-lg m-4 md:m-0">
            <form onSubmit={handleSubmit}>
              <h2 className="text-3xl sm:text-4xl text-center font-black uppercase mb-6 sm:mb-8">Add Flight</h2>

              <div className="mb-6 sm:mb-8">
                <label className="block text-gray-900 font-black uppercase mb-2 sm:mb-3 text-xs sm:text-sm">Total Cost</label>
                <input type="text" id="totalCost" name="totalCost" value={totalCost} onChange={(e) => {
                  const val = e.target.value;
                  if (/^[0-9.]*$/.test(val)) {
                    setTotalCost(val);
                  }
                }} className="border-4 border-black rounded w-full py-2 sm:py-3 px-3 sm:px-4 font-bold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black mb-2" placeholder="eg. 299.99" />
              </div>



              {/* Render dynamic flight items */}
              {flights.map((f) => (
                <FlightItem
                  key={f.id}
                  flight={f}
                  onChange={updateFlight}
                  onRemove={removeFlight}
                  onAdd={addFlight}
                  canRemove={flights.length > 1}
                />
              ))}

              <div>
                <button className="bg-indigo-900 hover:bg-indigo-700 text-white font-black uppercase py-4 px-6 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all w-full rounded" type="submit">Save Flights</button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </>
  )
}

export default AddFlight