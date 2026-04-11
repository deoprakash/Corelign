import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Header from './components/Header'
import Home from './pages/Home'
import Workspace from './pages/Workspace'
import AboutUs from './pages/AboutUs'
import ContactUs from './pages/ContactUs'
import Insights from './pages/Insights'
import Footer from './components/Footer'
import { NotificationProvider } from './context/NotificationContext'
import ToastContainer from './components/ToastContainer'

function App() {
  return (
    <NotificationProvider>
      <BrowserRouter>
        <div className="relative overflow-hidden">
          <Header />

          <main className="mx-auto flex w-full max-w-[1600px] flex-col gap-16 px-6 pb-20 pt-4">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/workspace" element={<Workspace />} />
              <Route path="/insights" element={<Insights />} />
              <Route path="/about" element={<AboutUs />} />
              <Route path="/contact" element={<ContactUs />} />
              <Route path="/about-us" element={<Navigate to="/about" replace />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          <Footer />

          <ToastContainer />
        </div>
      </BrowserRouter>
    </NotificationProvider>
  )
}

export default App
