import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import CreateTrip from './create-trip'
import { ClerkProvider } from '@clerk/clerk-react'
import MyTrips from './my-trips'
import Layout from './components/custom/Layout'
import ViewTrip from './view-trip/index.jsx'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable key!")
}

const router = createBrowserRouter([
  {
    element: <Layout />,  // Parent layout with Header
    children: [
      {
        path: '/',
        element: <App />
      },
      {
        path: '/create-trip',
        element: <CreateTrip />
      },
      {
        path: '/my-trips',
        element: <MyTrips />
      },
      {
        path: '/view-trip',
        element: <ViewTrip />
      }
    ]
  }
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
      <RouterProvider router={router} />
    </ClerkProvider>
  </StrictMode>,
)
