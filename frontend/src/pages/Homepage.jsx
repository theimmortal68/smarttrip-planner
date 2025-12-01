import React, { useContext } from 'react'
import Hero from '../components/Hero'
import AddTrip from '../components/AddTrip'
import RecentUpcomingTrips from '../components/RecentUpcomingTrips'
import ViewAllTrips from '../components/ViewAllTrips'
import { TripContext } from '../context/TripContext'

const Homepage = () => {
  const _ctx = useContext(TripContext) || {}
  const { upcomingTrips } = _ctx
  const hasTrips = upcomingTrips && upcomingTrips.length > 0

  return (
    <>
      {/* Main viewport section with Hero and AddTrip - always fits in viewport */}
      <div className="relative h-[calc(100vh-80px)] overflow-hidden">
        <Hero title="Plan Your Next Trip" subtitle="Keep track of all your past, current and upcoming trips!"/>
        <AddTrip/>
        
        {/* Neo-brutalist "Upcoming Trips" label - only show if there are trips */}
        {hasTrips && (
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
            <div className="bg-yellow-300 border-3 border-black rounded-lg px-3 py-1.5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] inline-flex items-center gap-2 rotate-1">
              <p className="text-xs sm:text-sm font-black text-black uppercase">
                Upcoming Trips
              </p>
              <div className="animate-bounce">
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-black" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
                </svg>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Trips section - only rendered if there are trips */}
      <RecentUpcomingTrips/>
      <ViewAllTrips/>
    </>
  )
}

export default Homepage