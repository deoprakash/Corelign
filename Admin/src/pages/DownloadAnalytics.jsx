import { useContext, useState, useEffect } from 'react'
import { AdminContext } from '../context/AdminContext'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import MetricCard from '../components/MetricCard'
import { apiUrl } from '../lib/api'

export default function DownloadAnalytics() {
  const { adminPassword } = useContext(AdminContext)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(apiUrl('/analytics/admin/downloads?days=30'), {
          headers: { 'x-admin-password': adminPassword }
        })
        const result = await response.json()
        setData(result)
      } catch (error) {
        console.error('Failed to fetch downloads:', error)
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
          <h2 className="mb-6 text-2xl font-bold text-slate-900">Download Analytics</h2>

          <div className="mb-6 grid gap-4 md:grid-cols-4">
            <MetricCard
              label="Button Clicks - Windows"
              value={data?.button_clicks?.windows || 0}
            />
            <MetricCard
              label="Button Clicks - Linux"
              value={data?.button_clicks?.linux || 0}
            />
            <MetricCard
              label="Button Clicks - Mac"
              value={data?.button_clicks?.mac || 0}
            />
            <MetricCard label="Total Downloads" value={data?.total_downloads || 0} />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="metric-card">
              <h3 className="text-lg font-semibold text-slate-800">Installer Downloads</h3>
              <div className="mt-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Windows</span>
                  <span className="font-semibold text-slate-900">{data?.installer_downloads?.windows || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Linux</span>
                  <span className="font-semibold text-slate-900">{data?.installer_downloads?.linux || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Mac</span>
                  <span className="font-semibold text-slate-900">{data?.installer_downloads?.mac || 0}</span>
                </div>
              </div>
            </div>

            <div className="metric-card">
              <h3 className="text-lg font-semibold text-slate-800">App Launches</h3>
              <div className="mt-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Windows</span>
                  <span className="font-semibold text-slate-900">{data?.app_launches?.windows || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Linux</span>
                  <span className="font-semibold text-slate-900">{data?.app_launches?.linux || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Mac</span>
                  <span className="font-semibold text-slate-900">{data?.app_launches?.mac || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
