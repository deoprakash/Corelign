import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AdminProvider } from './context/AdminContext'
import AdminLogin from './pages/AdminLogin'
import Dashboard from './pages/Dashboard'
import DownloadAnalytics from './pages/DownloadAnalytics'
import VisitorAnalytics from './pages/VisitorAnalytics'
import ButtonClickAnalytics from './pages/ButtonClickAnalytics'
import DeviceAnalytics from './pages/DeviceAnalytics'
import BlockedAddresses from './pages/BlockedAddresses'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <AdminProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<AdminLogin />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/downloads"
            element={
              <ProtectedRoute>
                <DownloadAnalytics />
              </ProtectedRoute>
            }
          />
          <Route
            path="/visitors"
            element={
              <ProtectedRoute>
                <VisitorAnalytics />
              </ProtectedRoute>
            }
          />
          <Route
            path="/buttons"
            element={
              <ProtectedRoute>
                <ButtonClickAnalytics />
              </ProtectedRoute>
            }
          />
          <Route
            path="/devices"
            element={
              <ProtectedRoute>
                <DeviceAnalytics />
              </ProtectedRoute>
            }
          />
          <Route
            path="/blocked"
            element={
              <ProtectedRoute>
                <BlockedAddresses />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AdminProvider>
  )
}

export default App
