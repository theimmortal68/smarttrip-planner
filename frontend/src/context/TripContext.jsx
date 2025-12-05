// Lodging data (array of lodgings) will be defined inside TripProvider

import React, { createContext, useState, useEffect } from 'react'
import { 
  getAllTrips, 
  createTrip as createTripAPI, 
  updateTrip as updateTripAPI, 
  deleteTrip as deleteTripAPI,
  createItineraryItem,
  updateItineraryItem,
  deleteItineraryItem,
  getItineraryItems
} from '../utils/api'


export const TripContext = createContext()


export const TripProvider = ({ children }) => {
  const [lodgingData, setLodgingData] = useState([])
  const [flightData, setFlightData] = useState({
    flights: [],
    totalCost: ''
  })

  const [carRentalData, setCarRentalData] = useState({
    rentalAgency: '',
    pickupDate: '',
    pickupTime: '',
    dropoffDate: '',
    dropoffTime: '',
    website: '',
    email: '',
    confirmationNumber: '',
    totalCost: '',
    pickupLocation: {
      location: '',
      address: '',
      phone: ''
    },
    dropoffLocation: {
      location: '',
      address: '',
      phone: ''
    },
    rentalInfo: {
      carType: '',
      mileageCharges: '',
      carDetails: ''
    }
  })

  // Activity data (array of activities)
  const [activityData, setActivityData] = useState([])

  const [upcomingTrips, setUpcomingTrips] = useState([])
  const [selectedTrip, setSelectedTrip] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  
  // Trip members state - keyed by tripId
  const [tripMembers, setTripMembers] = useState({})

  // Load trips from backend when component mounts
  useEffect(() => {
    const loadTrips = async () => {
      const token = localStorage.getItem('token')
      if (!token) return // Skip if not authenticated
      
      setLoading(true)
      setError(null)
      try {
        const trips = await getAllTrips()
        setUpcomingTrips(trips)
      } catch (err) {
        console.error('Failed to load trips:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadTrips()
  }, [])

  const addTrip = async (tripData) => {
    setLoading(true)
    setError(null)
    try {
      // Extract itinerary data from tripData
      const { flightData, carRentalData, activityData, lodgingData, ...basicTripData } = tripData
      
      // Call backend API to create trip (without itinerary items)
      const newTrip = await createTripAPI(basicTripData)
      
      // Now create itinerary items for the newly created trip
      const tripId = newTrip.id
      
      // Create flight itinerary items
      if (flightData?.flights?.length > 0) {
        for (const flight of flightData.flights) {
          await createItineraryItem(tripId, {
            itemType: 'flight',
            title: flight.customName || `Flight ${flight.id}`,
            startDate: flight.departure,
            numberOfGuests: flight.seats,
            totalCost: flightData.totalCost,
            details: {
              airline: flight.airline,
              flightNumber: flight.flightNumber,
            }
          })
        }
      }
      
      // Create car rental itinerary item
      if (carRentalData?.rentalAgency) {
        await createItineraryItem(tripId, {
          itemType: 'car_rental',
          title: `Car Rental - ${carRentalData.rentalAgency}`,
          startDate: carRentalData.pickupDate,
          endDate: carRentalData.dropoffDate,
          details: carRentalData
        })
      }
      
      // Create activity itinerary items
      if (activityData?.length > 0) {
        for (const activity of activityData) {
          await createItineraryItem(tripId, {
            itemType: 'activity',
            title: activity.activityName,
            startDate: activity.startDate,
            endDate: activity.endDate,
            details: activity
          })
        }
      }
      
      // Create lodging itinerary items
      if (lodgingData?.length > 0) {
        for (const lodging of lodgingData) {
          await createItineraryItem(tripId, {
            itemType: 'lodging',
            title: lodging.lodgingName,
            startDate: lodging.startDate,
            endDate: lodging.endDate,
            details: lodging
          })
        }
      }
      
      // Update local state with the trip returned from backend
      setUpcomingTrips(prev => [newTrip, ...prev])
      return newTrip
    } catch (err) {
      console.error('Failed to create trip:', err)
      setError(err.message)
      
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Update an existing trip by id
  const updateTrip = async (updatedTrip) => {
    if (!updatedTrip || !updatedTrip.id) return
    
    setLoading(true)
    setError(null)
    try {
      // Call backend API to update trip
      const updated = await updateTripAPI(updatedTrip.id, updatedTrip)
      
      // Update local state with the trip returned from backend
      setUpcomingTrips(prev => prev.map(t => t.id === updated.id ? updated : t))
      return updated
    } catch (err) {
      console.error('Failed to update trip:', err)
      setError(err.message)
      
      // Fallback to local state update if backend fails
      setUpcomingTrips(prev => prev.map(t => t.id === updatedTrip.id ? updatedTrip : t))
      return updatedTrip
    } finally {
      setLoading(false)
    }
  }

  // Delete a trip by id
  const deleteTrip = async (tripId) => {
    setLoading(true)
    setError(null)
    try {
      // Call backend API to delete trip
      await deleteTripAPI(tripId)
      
      // Update local state to remove the trip
      setUpcomingTrips(prev => prev.filter(t => t.id !== tripId))
      return true
    } catch (err) {
      console.error('Failed to delete trip:', err)
      setError(err.message)
      return false
    } finally {
      setLoading(false)
    }
  }

  // Load itinerary items for a specific trip
  const loadItineraryItems = async (tripId) => {
    setLoading(true)
    setError(null)
    try {
      const items = await getItineraryItems(tripId)
      
      // Parse itinerary items into their respective categories
      const flights = []
      let carRental = null
      const activities = []
      const lodgings = []
      
      items.forEach(item => {
        switch (item.itemType) {
          case 'flight':
            flights.push({
              id: item.id,
              customName: item.title,
              departure: item.startDate,
              ...item.details
            })
            break
          case 'carRental':
            carRental = {
              id: item.id,
              ...item.details
            }
            break
          case 'activity':
            activities.push({
              id: item.id,
              activityName: item.title,
              startDate: item.startDate,
              endDate: item.endDate,
              ...item.details
            })
            break
          case 'lodging':
            lodgings.push({
              id: item.id,
              lodgingName: item.title,
              startDate: item.startDate,
              endDate: item.endDate,
              ...item.details
            })
            break
          default:
            break
        }
      })
      
      // Update context state
      if (flights.length > 0) {
        setFlightData({ flights, totalCost: flights[0]?.totalCost || '' })
      }
      if (carRental) {
        setCarRentalData(carRental)
      }
      if (activities.length > 0) {
        setActivityData(activities)
      }
      if (lodgings.length > 0) {
        setLodgingData(lodgings)
      }
      
      return { flights, carRental, activities, lodgings }
    } catch (err) {
      console.error('Failed to load itinerary items:', err)
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }

  // Add a single itinerary item (for adding items to existing trips)
  const addItineraryItem = async (tripId, itemType, itemData) => {
    setLoading(true)
    setError(null)
    try {
      const newItem = await createItineraryItem(tripId, {
        itemType: itemType,
        title: itemData.name || itemData.activityName || itemData.lodgingName || `${itemType}`,
        startDate: itemData.startDate || itemData.departure || itemData.pickupDate,
        startTime: itemData.pickupTime || itemData.startTime,
        endTime: itemData.dropoffTime || itemData.endTime,
        endDate: itemData.endDate || itemData.dropoffDate,
        details: itemData
      })
      
      return newItem
    } catch (err) {
      console.error('Failed to add itinerary item:', err)
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Update a single itinerary item
  const updateSingleItineraryItem = async (tripId, itemId, itemType, itemData) => {
    setLoading(true)
    setError(null)
    try {
      const updatedItem = await updateItineraryItem(tripId, itemId, {
        itemType: itemType,
        title: itemData.name || itemData.activityName || itemData.lodgingName || `${itemType}`,
        startDate: itemData.startDate || itemData.departure || itemData.pickupDate,
        endDate: itemData.endDate || itemData.dropoffDate,
        details: itemData
      })
      
      return updatedItem
    } catch (err) {
      console.error('Failed to update itinerary item:', err)
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Delete a single itinerary item
  const deleteSingleItineraryItem = async (tripId, itemId) => {
    setLoading(true)
    setError(null)
    try {
      await deleteItineraryItem(tripId, itemId)
      return true
    } catch (err) {
      console.error('Failed to delete itinerary item:', err)
      setError(err.message)
      return false
    } finally {
      setLoading(false)
    }
  }

  const clearFlightData = () => {
    setFlightData({
      flights: [],
      totalCost: ''
    })
  }

  const clearCarRentalData = () => {
    setCarRentalData({
      rentalAgency: '',
      pickupDate: '',
      pickupTime: '',
      dropoffDate: '',
      dropoffTime: '',
      website: '',
      email: '',
      confirmationNumber: '',
      totalCost: '',
      pickupLocation: {
        location: '',
        address: '',
        phone: ''
      },
      dropoffLocation: {
        location: '',
        address: '',
        phone: ''
      },
      rentalInfo: {
        carType: '',
        mileageCharges: '',
        carDetails: ''
      }
    })
  }

  return (
    <TripContext.Provider value={{
      flightData,
      setFlightData,
      carRentalData,
      setCarRentalData,
      activityData,
      setActivityData,
      lodgingData,
      setLodgingData,
      upcomingTrips,
      addTrip,
      updateTrip,
      deleteTrip,
      clearFlightData,
      clearCarRentalData,
      selectedTrip,
      setSelectedTrip,
      loading,
      error,
      loadItineraryItems,
      addItineraryItem,
      updateSingleItineraryItem,
      deleteSingleItineraryItem,
      tripMembers,
      setTripMembers
    }}>
      {children}
    </TripContext.Provider>
  )
}
