import React, { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { TripContext } from '../context/TripContext'

const AddActivity = () => {
  const navigate = useNavigate()
  const _ctx = useContext(TripContext) || {}
  const { activityData = [], setActivityData, selectedTrip } = _ctx

  const [form, setForm] = useState({
    activityName: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    venue: '',
    address: '',
    phone: '',
    website: '',
    email: '',
    totalCost: ''
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name === 'totalCost') {
      if (!/^[0-9.]*$/.test(value)) return
    }
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setActivityData(prev => [...prev, { ...form, id: Date.now() }])
    setForm({
      activityName: '',
      startDate: '',
      startTime: '',
      endDate: '',
      endTime: '',
      venue: '',
      address: '',
      phone: '',
      website: '',
      email: '',
      totalCost: ''
    })
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
            <h2 className="text-3xl sm:text-4xl text-center font-black uppercase mb-6 sm:mb-8">Add Activity</h2>

            {/* Activity Name */}
            <div className="mb-4 sm:mb-6">
              <label className="block text-gray-900 font-black uppercase mb-2 sm:mb-3 text-xs sm:text-sm">Activity Name</label>
              <input type="text" name="activityName" value={form.activityName} onChange={handleChange} className="border-4 border-black rounded w-full py-2 sm:py-3 px-3 sm:px-4 font-bold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black" placeholder="Activity Name" />
            </div>

            {/* Start Date & Time */}
            <div className="mb-4 sm:mb-6 flex gap-4">
              <div className="flex-1">
                <label className="block text-gray-900 font-black uppercase mb-2 sm:mb-3 text-xs sm:text-sm">Start Date</label>
                <input type="date" name="startDate" value={form.startDate} onChange={handleChange} className="border-4 border-black rounded w-full py-2 sm:py-3 px-3 sm:px-4 font-bold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black" min={new Date().toISOString().split('T')[0]} required />
              </div>
              <div className="flex-1">
                <label className="block text-gray-900 font-black uppercase mb-2 sm:mb-3 text-xs sm:text-sm">Start Time</label>
                <input type="time" name="startTime" value={form.startTime} onChange={handleChange} className="border-4 border-black rounded w-full py-2 sm:py-3 px-3 sm:px-4 font-bold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black" />
              </div>
            </div>

            {/* End Date & Time */}
            <div className="mb-4 sm:mb-6 flex gap-4">
              <div className="flex-1">
                <label className="block text-gray-900 font-black uppercase mb-2 sm:mb-3 text-xs sm:text-sm">End Date</label>
                <input type="date" name="endDate" value={form.endDate} onChange={handleChange} className="border-4 border-black rounded w-full py-2 sm:py-3 px-3 sm:px-4 font-bold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black" min={form.startDate || new Date().toISOString().split('T')[0]} required />
              </div>
              <div className="flex-1">
                <label className="block text-gray-900 font-black uppercase mb-2 sm:mb-3 text-xs sm:text-sm">End Time</label>
                <input type="time" name="endTime" value={form.endTime} onChange={handleChange} className="border-4 border-black rounded w-full py-2 sm:py-3 px-3 sm:px-4 font-bold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black" />
              </div>
            </div>

            {/* Venue */}
            <div className="mb-4 sm:mb-6">
              <label className="block text-gray-900 font-black uppercase mb-2 sm:mb-3 text-xs sm:text-sm">Venue</label>
              <input type="text" name="venue" value={form.venue} onChange={handleChange} className="border-4 border-black rounded w-full py-2 sm:py-3 px-3 sm:px-4 font-bold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black" placeholder="Venue" />
            </div>

            {/* Address */}
            <div className="mb-4 sm:mb-6">
              <label className="block text-gray-900 font-black uppercase mb-2 sm:mb-3 text-xs sm:text-sm">Address</label>
              <input type="text" name="address" value={form.address} onChange={handleChange} className="border-4 border-black rounded w-full py-2 sm:py-3 px-3 sm:px-4 font-bold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black" placeholder="Address" />
            </div>

            {/* Phone Number */}
            <div className="mb-4 sm:mb-6">
              <label className="block text-gray-900 font-black uppercase mb-2 sm:mb-3 text-xs sm:text-sm">Phone Number</label>
              <input type="text" name="phone" value={form.phone} onChange={handleChange} className="border-4 border-black rounded w-full py-2 sm:py-3 px-3 sm:px-4 font-bold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black" placeholder="Phone number" />
            </div>

            {/* Website */}
            <div className="mb-4 sm:mb-6">
              <label className="block text-gray-900 font-black uppercase mb-2 sm:mb-3 text-xs sm:text-sm">Website</label>
              <input type="text" name="website" value={form.website} onChange={handleChange} className="border-4 border-black rounded w-full py-2 sm:py-3 px-3 sm:px-4 font-bold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black" placeholder="Website" />
            </div>

            {/* Email */}
            <div className="mb-4 sm:mb-6">
              <label className="block text-gray-900 font-black uppercase mb-2 sm:mb-3 text-xs sm:text-sm">Email</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} className="border-4 border-black rounded w-full py-2 sm:py-3 px-3 sm:px-4 font-bold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black" placeholder="Email" />
            </div>

            {/* Total Cost */}
            <div className="mb-6">
              <label className="block text-gray-900 font-black uppercase mb-2 sm:mb-3 text-xs sm:text-sm">Total Cost</label>
              <input
                type="text"
                name="totalCost"
                value={form.totalCost}
                onChange={handleChange}
                className="border-4 border-black rounded w-full py-2 sm:py-3 px-3 sm:px-4 font-bold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                placeholder="Total Cost"
              />
            </div>

            <div>
              <button className="bg-indigo-900 hover:bg-indigo-700 text-white font-black uppercase py-4 px-6 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all w-full rounded" type="submit">Save Activity</button>
            </div>
          </form>
        </div>
      </div>
    </section>
  )
}

export default AddActivity