import React from 'react'
import {Route, createBrowserRouter, RouterProvider} from 'react-router-dom'
import Homepage from './pages/Homepage'
import ManageSharingPage from './pages/ManageSharingPage'
import UpcomingTripsPage from './pages/UpcomingTripsPage'
import MainLayout from './layouts/MainLayout'
import NotFoundPage from './pages/NotFoundPage'
import TripDetailsPage from './pages/TripDetailsPage'
import AddTripPage from './pages/AddTripPage'
import EditTripPage from './pages/EditTripPage'
import PastTripsPage from './pages/PastTripsPage'
import LoginPage from './pages/LoginPage'
import SignUpPage from './pages/SignUpPage'
import AddFlight from './pages/AddFlight'
import AddLodging from './pages/AddLodging'
import AddActivity from './pages/AddActivity'
import AddCarRental from './pages/AddCarRental'
import ProfilePage from './pages/ProfilePage'
import { TripProvider } from './context/TripContext'

const router = createBrowserRouter(
  [{path: "/", 
    element: <MainLayout/>,
    children: [
      {index: true, element: <LoginPage/>},
      {path: "homepage", element: <Homepage/>},
      {path: "signup", element: <SignUpPage/>},
      {path: "profile", element: <ProfilePage/>},
      {path: "upcoming-trips-page", element: <UpcomingTripsPage/>},
      {path: "upcoming-trips-page/manage-sharing/:tripId", element: <ManageSharingPage/>},
      {path: "upcoming-trips-page/trip-details", element: <TripDetailsPage/>},
      {path: "trip-details", element: <TripDetailsPage/>},
      {path: "add-trip", element: <AddTripPage/>},
      {path: "trip-details/edit-trip", element: <EditTripPage/>},
      {path: "upcoming-trips-page/trip-details/edit-trip", element: <EditTripPage/>},
      {path: "past-trips", element: <PastTripsPage/>},
      {path: "add-trip/add-flight", element: <AddFlight/>},
      {path: "add-trip/add-lodging", element: <AddLodging/>},
      {path: "add-trip/add-activity", element: <AddActivity/>},
      {path: "add-trip/add-car", element: <AddCarRental/>},
      {path: "*", element: <NotFoundPage/>},
    ]
  }]
)

const App = () => {
  return (
    <TripProvider>
      <RouterProvider router={router}/>
    </TripProvider>
  )
}

export default App


