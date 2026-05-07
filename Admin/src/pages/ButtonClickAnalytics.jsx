import { useContext, useState, useEffect } from 'react'
import { AdminContext } from '../context/AdminContext'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import { apiUrl } from '../lib/api'

export default function ButtonClickAnalytics() {
  const { adminPassword } = useContext(AdminContext)
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(apiUrl('/analytics/admin/button-clicks?days=30'), {
          headers: { 'x-admin-password': adminPassword }
        })
        const result = await response.json()
        setData(result)
      } catch (error) {
        console.error('Failed to fetch button clicks:', error)
      } finally {
        setLoading(false)
      }
    }
    
    // Fetch immediately
    fetchData()
    
    // Refresh every 5 minutes (300000 ms)
    const interval = setInterval(fetchData, 300000)
    
    // Cleanup interval on unmount
    return () => clearInterval(interval)
  }, [adminPassword])

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1">
          <Navbar />
          <div className="flex items-center justify-center p-6">
            <p className="text-slate-600">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1">
        <Navbar />
        <main className="p-6">
          <h2 className="mb-6 text-2xl font-bold text-slate-900">Button Click Analytics</h2>

          <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Button Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Total Clicks</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Unique Users</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Repeated Users</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(data) && data.length > 0 ? (
                  data.map((button, idx) => (
                    <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-6 py-4 text-sm text-slate-700 font-medium">{button.button_name}</td>
                      <td className="px-6 py-4 text-sm text-slate-700">{button.total_clicks}</td>
                      <td className="px-6 py-4 text-sm text-slate-700">{button.unique_users}</td>
                      <td className="px-6 py-4 text-sm text-slate-700">{button.repeated_users}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-sm text-slate-500">
                      No button click data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  )
}
