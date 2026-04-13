import { BrowserRouter, Link, Navigate, Route, Routes } from 'react-router-dom'
import Header from './components/Header'
import Home from './pages/Home'
import Workspace from './pages/Workspace'
import AboutUs from './pages/AboutUs'
import ContactUs from './pages/ContactUs'
import Insights from './pages/Insights'
import BookDemo from './pages/BookDemo'
import Download from './pages/Download'
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
              <Route path="/book-demo" element={<BookDemo />} />
              <Route path="/download" element={<Download />} />
              <Route path="/about-us" element={<Navigate to="/about" replace />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          <Footer />

          <Link
            to="/contact"
            aria-label="Contact Corelign"
            className="group fixed bottom-6 right-6 z-50 inline-flex items-center gap-3 rounded-full border border-slate-300/80 bg-slate-50/95 px-4 py-3 text-sm font-semibold text-slate-600 shadow-lg shadow-slate-900/10 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-slate-400 hover:bg-slate-100 hover:text-slate-800 hover:shadow-xl hover:shadow-slate-900/15"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-700 text-white shadow-inner shadow-white/10 transition-transform duration-300 group-hover:scale-105">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                <path d="M12 2a10 10 0 0 0-8.66 15L2 22l5-1.34A10 10 0 1 0 12 2Zm0 18a8 8 0 0 1-4.05-1.1l-.29-.17-2.95.79.79-2.95-.17-.29A8 8 0 1 1 12 20Zm4.47-6.11c-.24-.12-1.43-.71-1.65-.79-.22-.08-.38-.12-.54.12-.16.24-.62.79-.76.95-.14.16-.28.18-.52.06-.24-.12-1-.37-1.9-1.18-.7-.62-1.18-1.39-1.32-1.63-.14-.24-.01-.37.11-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.3-.74-1.78-.2-.48-.4-.41-.54-.42l-.46-.01c-.16 0-.42.06-.64.3-.22.24-.86.84-.86 2.06s.88 2.4 1 2.56c.12.16 1.72 2.63 4.17 3.69.58.25 1.03.4 1.38.51.58.18 1.11.15 1.53.09.47-.07 1.43-.58 1.63-1.14.2-.56.2-1.04.14-1.14-.06-.1-.22-.16-.46-.28Z" />
              </svg>
            </span>
            <span className="hidden sm:inline">Contact Us</span>
          </Link>

          <ToastContainer />
        </div>
      </BrowserRouter>
    </NotificationProvider>
  )
}

export default App
