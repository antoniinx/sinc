import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import GroupDetail from './pages/GroupDetail'
import EventDetail from './pages/EventDetail'
import FriendsPage from './pages/FriendsPage'
import LandingPage from './pages/LandingPage'
import FeaturesPage from './pages/FeaturesPage'
import PricingPage from './pages/PricingPage'
import AboutPage from './pages/AboutPage'
import ContactPage from './pages/ContactPage'
import LoadingSpinner from './components/LoadingSpinner'

function AppContent() {
  const { user, loading } = useAuth()

  if (loading) {
    return <LoadingSpinner />
  }

          return (
          <div className="min-h-screen bg-gray-50">
            <Routes>
              <Route 
                path="/login" 
                element={user ? <Navigate to="/" /> : <Login />} 
              />
              <Route 
                path="/register" 
                element={user ? <Navigate to="/" /> : <Register />} 
              />
              <Route 
                path="/" 
                element={user ? <Dashboard /> : <LandingPage />}
              />
              <Route 
                path="/features" 
                element={<FeaturesPage />} 
              />
              <Route 
                path="/pricing" 
                element={<PricingPage />} 
              />
              <Route 
                path="/about" 
                element={<AboutPage />} 
              />
              <Route 
                path="/contact" 
                element={<ContactPage />} 
              />
              <Route 
                path="/groups/:groupId" 
                element={user ? <GroupDetail /> : <Navigate to="/login" />} 
              />
              <Route 
                path="/events/:eventId" 
                element={user ? <EventDetail /> : <Navigate to="/login" />} 
              />
              <Route 
                path="/friends" 
                element={user ? <FriendsPage /> : <Navigate to="/login" />} 
              />
            </Routes>
          </div>
        )
}

function App() {
  return <AppContent />
}

export default App
