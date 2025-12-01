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
<<<<<<< HEAD
=======
  
  // Trip members state - keyed by tripId
  const [tripMembers, setTripMembers] = useState({})
>>>>>>> aa6d1484a8c7e5ff664c7e8ce7daa6566ca1b7c8

  // Load trips from backend when component mounts
  useEffect(() => {
    const loadTrips = async () => {
      const token = localStorage.getItem('token')
      if (!token) return // Skip if not authenticated
<<<<<<< HEAD

=======
      
>>>>>>> aa6d1484a8c7e5ff664c7e8ce7daa6566ca1b7c8
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

<<<<<<< HEAD
  // Create a new trip + itinerary
=======
>>>>>>> aa6d1484a8c7e5ff664c7e8ce7daa6566ca1b7c8
  const addTrip = async (tripData) => {
    setLoading(true)
    setError(null)
    try {
<<<<<<< HEAD
      // Extract itinerary data from tripData if provided,
      // otherwise fall back to context state.
      const {
        flightData: fd,
        carRentalData: cd,
        activityData: ad,
        lodgingData: ld,
        ...basicTripData
      } = tripData

      const newTrip = await createTripAPI(basicTripData)

      const itineraryItems = buildItineraryItemsFromData(newTrip, {
        flightData: fd ?? flightData,
        carRentalData: cd ?? carRentalData,
        activityData: ad ?? activityData,
        lodgingData: ld ?? lodgingData
      })

      for (const item of itineraryItems) {
        await createItineraryItem(newTrip.id, item)
      }

      setUpcomingTrips(prev => [newTrip, ...prev])

      // Optionally clear itinerary-related state after save
      setFlightData({ flights: [], totalCost: '' })
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
      setActivityData([])
      setLodgingData([])

      return newTrip
    } catch (err) {
      console.error('Failed to create trip (or itinerary):', err)
      setError(err.message)

      // Fallback: local-only trip if backend fails
=======
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
            item_type: 'flight',
            item_name: flight.customName || `Flight ${flight.id}`,
            start_date: flight.departure,
            details: {
              airline: flight.airline,
              flightNumber: flight.flightNumber,
              seats: flight.seats,
              totalCost: flightData.totalCost
            }
          })
        }
      }
      
      // Create car rental itinerary item
      if (carRentalData?.rentalAgency) {
        await createItineraryItem(tripId, {
          item_type: 'car_rental',
          item_name: `Car Rental - ${carRentalData.rentalAgency}`,
          start_date: carRentalData.pickupDate,
          end_date: carRentalData.dropoffDate,
          details: carRentalData
        })
      }
      
      // Create activity itinerary items
      if (activityData?.length > 0) {
        for (const activity of activityData) {
          await createItineraryItem(tripId, {
            item_type: 'activity',
            item_name: activity.activityName,
            start_date: activity.startDate,
            end_date: activity.endDate,
            details: activity
          })
        }
      }
      
      // Create lodging itinerary items
      if (lodgingData?.length > 0) {
        for (const lodging of lodgingData) {
          await createItineraryItem(tripId, {
            item_type: 'lodging',
            item_name: lodging.lodgingName,
            start_date: lodging.startDate,
            end_date: lodging.endDate,
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
      
      // Fallback to local state if backend fails
>>>>>>> aa6d1484a8c7e5ff664c7e8ce7daa6566ca1b7c8
      const localTrip = {
        id: Date.now(),
        ...tripData,
        createdAt: new Date().toISOString()
      }
      setUpcomingTrips(prev => [localTrip, ...prev])
      return localTrip
    } finally {
      setLoading(false)
    }
  }

  // Update an existing trip by id
  const updateTrip = async (updatedTrip) => {
    if (!updatedTrip || !updatedTrip.id) return
<<<<<<< HEAD

    setLoading(true)
    setError(null)
    try {
      const updated = await updateTripAPI(updatedTrip.id, updatedTrip)

      setUpcomingTrips(prev =>
        prev.map(t => (t.id === updated.id ? updated : t))
      )
=======
    
    setLoading(true)
    setError(null)
    try {
      // Call backend API to update trip
      const updated = await updateTripAPI(updatedTrip.id, updatedTrip)
      
      // Update local state with the trip returned from backend
      setUpcomingTrips(prev => prev.map(t => t.id === updated.id ? updated : t))
>>>>>>> aa6d1484a8c7e5ff664c7e8ce7daa6566ca1b7c8
      return updated
    } catch (err) {
      console.error('Failed to update trip:', err)
      setError(err.message)
<<<<<<< HEAD

      // Fallback to local state update if backend fails
      setUpcomingTrips(prev =>
        prev.map(t => (t.id === updatedTrip.id ? updatedTrip : t))
      )
=======
      
      // Fallback to local state update if backend fails
      setUpcomingTrips(prev => prev.map(t => t.id === updatedTrip.id ? updatedTrip : t))
>>>>>>> aa6d1484a8c7e5ff664c7e8ce7daa6566ca1b7c8
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
<<<<<<< HEAD
      await deleteTripAPI(tripId)

=======
      // Call backend API to delete trip
      await deleteTripAPI(tripId)
      
      // Update local state to remove the trip
>>>>>>> aa6d1484a8c7e5ff664c7e8ce7daa6566ca1b7c8
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
<<<<<<< HEAD
  // Returns array of: { id, dayIndex, title, description, startTime, endTime, locationName, activityType, notes }
=======
>>>>>>> aa6d1484a8c7e5ff664c7e8ce7daa6566ca1b7c8
  const loadItineraryItems = async (tripId) => {
    setLoading(true)
    setError(null)
    try {
      const items = await getItineraryItems(tripId)
<<<<<<< HEAD
      return items
    } catch (err) {
      console.error('Failed to load itinerary items:', err)
      setError(err.message)
      return []
=======
      
      // Parse itinerary items into their respective categories
      const flights = []
      let carRental = null
      const activities = []
      const lodgings = []
      
      items.forEach(item => {
        switch (item.item_type) {
          case 'flight':
            flights.push({
              id: item.id,
              customName: item.item_name,
              departure: item.start_date,
              ...item.details
            })
            break
          case 'car_rental':
            carRental = {
              id: item.id,
              ...item.details
            }
            break
          case 'activity':
            activities.push({
              id: item.id,
              activityName: item.item_name,
              startDate: item.start_date,
              endDate: item.end_date,
              ...item.details
            })
            break
          case 'lodging':
            lodgings.push({
              id: item.id,
              lodgingName: item.item_name,
              startDate: item.start_date,
              endDate: item.end_date,
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
>>>>>>> aa6d1484a8c7e5ff664c7e8ce7daa6566ca1b7c8
    } finally {
      setLoading(false)
    }
  }

<<<<<<< HEAD
  // Add a single itinerary item (for adding to existing trip via generic form)
  const addItineraryItem = async (tripId, itemData) => {
    setLoading(true)
    setError(null)
    try {
      const newItem = await createItineraryItem(tripId, itemData)
=======
  // Add a single itinerary item (for adding items to existing trips)
  const addItineraryItem = async (tripId, itemType, itemData) => {
    setLoading(true)
    setError(null)
    try {
      const newItem = await createItineraryItem(tripId, {
        item_type: itemType,
        item_name: itemData.name || itemData.activityName || itemData.lodgingName || `${itemType}`,
        start_date: itemData.startDate || itemData.departure || itemData.pickupDate,
        end_date: itemData.endDate || itemData.dropoffDate,
        details: itemData
      })
      
>>>>>>> aa6d1484a8c7e5ff664c7e8ce7daa6566ca1b7c8
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
<<<<<<< HEAD
  const updateSingleItineraryItem = async (tripId, itemId, itemData) => {
    setLoading(true)
    setError(null)
    try {
      const updatedItem = await updateItineraryItem(tripId, itemId, itemData)
=======
  const updateSingleItineraryItem = async (tripId, itemId, itemType, itemData) => {
    setLoading(true)
    setError(null)
    try {
      const updatedItem = await updateItineraryItem(tripId, itemId, {
        item_type: itemType,
        item_name: itemData.name || itemData.activityName || itemData.lodgingName || `${itemType}`,
        start_date: itemData.startDate || itemData.departure || itemData.pickupDate,
        end_date: itemData.endDate || itemData.dropoffDate,
        details: itemData
      })
      
>>>>>>> aa6d1484a8c7e5ff664c7e8ce7daa6566ca1b7c8
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
<<<<<<< HEAD
    <TripContext.Provider
      value={{
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
        deleteSingleItineraryItem
      }}
    >
=======
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
>>>>>>> aa6d1484a8c7e5ff664c7e8ce7daa6566ca1b7c8
      {children}
    </TripContext.Provider>
  )
}
<<<<<<< HEAD

=======
>>>>>>> aa6d1484a8c7e5ff664c7e8ce7daa6566ca1b7c8
