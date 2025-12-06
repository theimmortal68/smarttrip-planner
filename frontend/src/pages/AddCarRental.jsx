import React, { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { TripContext } from '../context/TripContext'

const AddCarRental = () => {
  const navigate = useNavigate()
  const _ctx = useContext(TripContext) || {}
  const { setCarRentalData, carRentalData = {}, selectedTrip } = _ctx

  const [formData, setFormData] = useState(() => {
    // Initialize with context data if available (for edit mode)
    if (carRentalData?.title) {
      return { ...carRentalData }
    }
    return {
      title: '',
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
    }
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleNestedChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }))
  }

  const handleTotalCostChange = (e) => {
    const val = e.target.value
    if (/^[0-9.]*$/.test(val)) {
      setFormData(prev => ({
        ...prev,
        totalCost: val
      }))
    }
  }

  const handleMileageChange = (e) => {
    const val = e.target.value
    if (/^[0-9.]*$/.test(val)) {
      handleNestedChange('rentalInfo', 'mileageCharges', val)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Save car rental data to context
    setCarRentalData(formData)
    // Navigate to edit-trip if editing, otherwise add-trip
    if (selectedTrip) {
      navigate('/trip-details/edit-trip')
    } else {
      navigate('/add-trip')
    }
  }
  return (
    <section className="bg-gray-50 min-h-screen py-6 sm:py-12 px-4">
      <div className="container m-auto max-w-2xl py-12 sm:py-24">
        <div className="bg-white px-6 sm:px-8 py-8 sm:py-10 mb-4 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] sm:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-lg m-4 md:m-0">
          <form onSubmit={handleSubmit}>
            <h2 className="text-3xl sm:text-4xl text-center font-black uppercase mb-6 sm:mb-8">Add Car Rental</h2>

            {/* Rental Agency */}
            <div className="mb-4 sm:mb-6">
              <label className="block text-gray-900 font-black uppercase mb-2 sm:mb-3 text-xs sm:text-sm">Rental Agency</label>
              <input type="text" name="title" value={formData.title} onChange={handleChange} className="border-4 border-black rounded w-full py-2 sm:py-3 px-3 sm:px-4 font-bold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black" placeholder="Rental Agency" />
            </div>

            {/* Pickup Date & Time */}
            <div className="mb-4 sm:mb-6 flex gap-4">
              <div className="flex-1">
                <label className="block text-gray-900 font-black uppercase mb-2 sm:mb-3 text-xs sm:text-sm">Pickup Date</label>
                <input type="date" name="pickupDate" value={formData.pickupDate} onChange={handleChange} className="border-4 border-black rounded w-full py-2 sm:py-3 px-3 sm:px-4 font-bold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black" min={new Date().toISOString().split('T')[0]} required />
              </div>
              <div className="flex-1">
                <label className="block text-gray-900 font-black uppercase mb-2 sm:mb-3 text-xs sm:text-sm">Pickup Time</label>
                <input type="time" name="pickupTime" value={formData.pickupTime} onChange={handleChange} className="border-4 border-black rounded w-full py-2 sm:py-3 px-3 sm:px-4 font-bold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black" />
              </div>
            </div>

            {/* Dropoff Date & Time */}
            <div className="mb-6 flex gap-4">
              <div className="flex-1">
                <label className="block text-gray-900 font-black uppercase mb-2 sm:mb-3 text-xs sm:text-sm">Dropoff Date</label>
                <input type="date" name="dropoffDate" value={formData.dropoffDate} onChange={handleChange} className="border-4 border-black rounded w-full py-2 sm:py-3 px-3 sm:px-4 font-bold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black" min={formData.pickupDate || new Date().toISOString().split('T')[0]} required />
              </div>
              <div className="flex-1">
                <label className="block text-gray-900 font-black uppercase mb-2 sm:mb-3 text-xs sm:text-sm">Dropoff Time</label>
                <input type="time" name="dropoffTime" value={formData.dropoffTime} onChange={handleChange} className="border-4 border-black rounded w-full py-2 sm:py-3 px-3 sm:px-4 font-bold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black" />
              </div>
            </div>

            {/* Website */}
            <div className="mb-4 sm:mb-6">
              <label className="block text-gray-900 font-black uppercase mb-2 sm:mb-3 text-xs sm:text-sm">Website</label>
              <input type="text" name="website" value={formData.website} onChange={handleChange} className="border-4 border-black rounded w-full py-2 sm:py-3 px-3 sm:px-4 font-bold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black" placeholder="Website" />
            </div>

            {/* Email */}
            <div className="mb-4 sm:mb-6">
              <label className="block text-gray-900 font-black uppercase mb-2 sm:mb-3 text-xs sm:text-sm">Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} className="border-4 border-black rounded w-full py-2 sm:py-3 px-3 sm:px-4 font-bold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black" placeholder="Email" />
            </div>

            {/* Confirmation Number */}
            <div className="mb-4 sm:mb-6">
              <label className="block text-gray-900 font-black uppercase mb-2 sm:mb-3 text-xs sm:text-sm">Confirmation Number</label>
              <input type="text" name="confirmationNumber" value={formData.confirmationNumber} onChange={handleChange} className="border-4 border-black rounded w-full py-2 sm:py-3 px-3 sm:px-4 font-bold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black" placeholder="Confirmation number" />
            </div>

            {/* Total Cost */}
            <div className="mb-6 sm:mb-8">
              <label className="block text-gray-900 font-black uppercase mb-2 sm:mb-3 text-xs sm:text-sm">Total Cost</label>
              <input
                type="text"
                name="totalCost"
                value={formData.totalCost}
                onChange={handleTotalCostChange}
                className="border-4 border-black rounded w-full py-2 sm:py-3 px-3 sm:px-4 font-bold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                placeholder="Total Cost"
              />
            </div>

            {/* Pickup Location Section */}
            <h3 className="text-xl sm:text-2xl font-black uppercase mt-8 mb-4 sm:mb-6">Pickup Location</h3>

            <div className="mb-4 sm:mb-6">
              <label className="block text-gray-900 font-black uppercase mb-2 sm:mb-3 text-xs sm:text-sm">Pickup Location</label>
              <input type="text" value={formData.pickupLocation.location} onChange={(e) => handleNestedChange('pickupLocation', 'location', e.target.value)} className="border-4 border-black rounded w-full py-2 sm:py-3 px-3 sm:px-4 font-bold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black" placeholder="Pickup location" />
            </div>

            <div className="mb-4 sm:mb-6">
              <label className="block text-gray-900 font-black uppercase mb-2 sm:mb-3 text-xs sm:text-sm">Address</label>
              <input type="text" value={formData.pickupLocation.address} onChange={(e) => handleNestedChange('pickupLocation', 'address', e.target.value)} className="border-4 border-black rounded w-full py-2 sm:py-3 px-3 sm:px-4 font-bold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black" placeholder="Address" />
            </div>

            <div className="mb-6 sm:mb-8">
              <label className="block text-gray-900 font-black uppercase mb-2 sm:mb-3 text-xs sm:text-sm">Phone</label>
              <input type="text" value={formData.pickupLocation.phone} onChange={(e) => handleNestedChange('pickupLocation', 'phone', e.target.value)} className="border-4 border-black rounded w-full py-2 sm:py-3 px-3 sm:px-4 font-bold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black" placeholder="Phone" />
            </div>

            {/* Dropoff Location Section */}
            <h3 className="text-xl sm:text-2xl font-black uppercase mt-8 mb-4 sm:mb-6">Dropoff Location</h3>

            <div className="mb-4 sm:mb-6">
              <label className="block text-gray-900 font-black uppercase mb-2 sm:mb-3 text-xs sm:text-sm">Dropoff Location</label>
              <input type="text" value={formData.dropoffLocation.location} onChange={(e) => handleNestedChange('dropoffLocation', 'location', e.target.value)} className="border-4 border-black rounded w-full py-2 sm:py-3 px-3 sm:px-4 font-bold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black" placeholder="Dropoff location" />
            </div>

            <div className="mb-4 sm:mb-6">
              <label className="block text-gray-900 font-black uppercase mb-2 sm:mb-3 text-xs sm:text-sm">Address</label>
              <input type="text" value={formData.dropoffLocation.address} onChange={(e) => handleNestedChange('dropoffLocation', 'address', e.target.value)} className="border-4 border-black rounded w-full py-2 sm:py-3 px-3 sm:px-4 font-bold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black" placeholder="Address" />
            </div>

            <div className="mb-6 sm:mb-8">
              <label className="block text-gray-900 font-black uppercase mb-2 sm:mb-3 text-xs sm:text-sm">Phone</label>
              <input type="text" value={formData.dropoffLocation.phone} onChange={(e) => handleNestedChange('dropoffLocation', 'phone', e.target.value)} className="border-4 border-black rounded w-full py-2 sm:py-3 px-3 sm:px-4 font-bold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black" placeholder="Phone" />
            </div>

            {/* Rental Information Section */}
            <h3 className="text-xl sm:text-2xl font-black uppercase mt-8 mb-4 sm:mb-6">Rental Information</h3>

            <div className="mb-4 sm:mb-6">
              <label className="block text-gray-900 font-black uppercase mb-2 sm:mb-3 text-xs sm:text-sm">Car Type</label>
              <input type="text" value={formData.rentalInfo.carType} onChange={(e) => handleNestedChange('rentalInfo', 'carType', e.target.value)} className="border-4 border-black rounded w-full py-2 sm:py-3 px-3 sm:px-4 font-bold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black" placeholder="Car type" />
            </div>

            <div className="mb-4 sm:mb-6">
              <label className="block text-gray-900 font-black uppercase mb-2 sm:mb-3 text-xs sm:text-sm">Mileage Charges</label>
              <input
                type="text"
                value={formData.rentalInfo.mileageCharges}
                onChange={handleMileageChange}
                className="border-4 border-black rounded w-full py-2 sm:py-3 px-3 sm:px-4 font-bold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                placeholder="Mileage charges"
              />
            </div>

            <div className="mb-6 sm:mb-8">
              <label className="block text-gray-900 font-black uppercase mb-2 sm:mb-3 text-xs sm:text-sm">Car Details</label>
              <input type="text" value={formData.rentalInfo.carDetails} onChange={(e) => handleNestedChange('rentalInfo', 'carDetails', e.target.value)} className="border-4 border-black rounded w-full py-2 sm:py-3 px-3 sm:px-4 font-bold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black" placeholder="Car details" />
            </div>

            <div>
              <button className="bg-indigo-900 hover:bg-indigo-700 text-white font-black uppercase py-4 px-6 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all w-full rounded" type="submit">Save Car Rental</button>
            </div>
          </form>
        </div>
      </div>
    </section>
  )
}

export default AddCarRental