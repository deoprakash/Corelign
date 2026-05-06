import { useContext, useState, useEffect } from 'react'
import { AdminContext } from '../context/AdminContext'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import MetricCard from '../components/MetricCard'
import { apiUrl } from '../lib/api'

export default function VisitorAnalytics() {
  const { adminPassword } = useContext(AdminContext)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(apiUrl('/analytics/admin/visitors?days=30'), {
          headers: { 'x-admin-password': adminPassword }
        })
        const result = await response.json()
        setData(result)
      } catch (error) {
        console.error('Failed to fetch visitors:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
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
          <h2 className="mb-6 text-2xl font-bold text-slate-900">Visitor Analytics</h2>

          <div className="mb-6 grid gap-4 md:grid-cols-4">
            <MetricCard label="Total Visitors" value={data?.total_visitors} />
            <MetricCard label="Today Unique" value={data?.unique_today} />
            <MetricCard label="Returning Visitors" value={data?.returning} />
            <MetricCard label="Total Sessions" value={data?.session_analytics?.total_sessions} />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="metric-card">
              <h3 className="text-lg font-semibold text-slate-800">Session Metrics</h3>
              <div className="mt-4 space-y-4">
                <div>
                  <p className="text-sm text-slate-600">Average Session Duration</p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">
                    {data?.session_analytics?.total_sessions || 0} sessions
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Returning Visitor Rate</p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">
                    {data?.session_analytics?.returning_percentage || 0}%
                  </p>
                </div>
              </div>
            </div>

            <div className="metric-card">
              <h3 className="text-lg font-semibold text-slate-800">Visitor Breakdown</h3>
              <div className="mt-4 space-y-4">
                <div>
                  <p className="text-sm text-slate-600">New Visitors</p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">
                    {data?.session_analytics?.new_visitors || 0}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Total Unique</p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">
                    {data?.session_analytics?.total_unique_visitors || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
