import React, { useContext } from 'react'
import { Link } from 'react-router-dom'
import { TripContext } from '../context/TripContext'

const ViewAllTrips = () => {
  const _ctx = useContext(TripContext) || {}
  const { upcomingTrips } = _ctx

  // Only render if there are trips
  if (!upcomingTrips || upcomingTrips.length === 0) {
    return null
  }

  return (
    <section className="m-auto max-w-lg my-10 px-6">
      <Link
        to="/upcoming-trips-page"
        className="block bg-indigo-900 hover:bg-indigo-700 text-white text-center font-black uppercase py-4 px-6 border-4 border-black rounded shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
        >View All Upcoming Trips
      </Link>
    </section>
  )
}

export default ViewAllTrips