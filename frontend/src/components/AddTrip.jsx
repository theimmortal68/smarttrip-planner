import React, { useContext } from 'react'
import Card from './Card'
import { useNavigate } from 'react-router-dom'
import { FaGlobeAmericas } from 'react-icons/fa'
import { TripContext } from '../context/TripContext'

const HomeCards = () => {
  const navigate = useNavigate()
  const { clearFlightData, clearCarRentalData, setActivityData, setLodgingData, setSelectedTrip } = useContext(TripContext) || {}

  const handleAddTripClick = () => {
    // Clear all itinerary data and selected trip before navigating
    if (clearFlightData) clearFlightData()
    if (clearCarRentalData) clearCarRentalData()
    if (setActivityData) setActivityData([])
    if (setLodgingData) setLodgingData([])
    if (setSelectedTrip) setSelectedTrip(null)
    navigate('/add-trip')
  }

  return (
    <section className="absolute top-[55%] left-1/2 transform -translate-x-1/2 w-full max-w-sm sm:max-w-md md:max-w-lg px-4 z-10">
      <div className="bg-white border-4 border-black rounded-lg p-5 sm:p-7 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <h2 className="text-2xl sm:text-3xl font-black uppercase mb-2">
          <FaGlobeAmericas className='inline text-xl sm:text-2xl mr-2 mb-1'/>
          Explore
        </h2>
        <p className="mt-2 mb-4 font-bold text-sm sm:text-base">
          Add trip details such as location, date, itinerary, etc.
        </p>
        {/* Move button to the right of the card */}
        <div className="flex justify-end">
          <button
            onClick={handleAddTripClick}
            className="bg-black text-white border-4 border-black rounded-lg px-4 sm:px-6 py-2 sm:py-3 font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all text-sm sm:text-base"
          >
            Add Trip
          </button>
        </div>
      </div>
    </section>
  )
}

export default HomeCards