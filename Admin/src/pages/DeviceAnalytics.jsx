import { useContext, useState, useEffect } from 'react'
import { AdminContext } from '../context/AdminContext'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import { Doughnut } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { apiUrl } from '../lib/api'

ChartJS.register(ArcElement, Tooltip, Legend)

export default function DeviceAnalytics() {
  const { adminPassword } = useContext(AdminContext)
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(apiUrl('/analytics/admin/device-analytics?days=30'), {
          headers: { 'x-admin-password': adminPassword }
        })
        const result = await response.json()
        setData(result)
      } catch (error) {
        console.error('Failed to fetch device analytics:', error)
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

  const chartData = {
    labels: data.map(d => d.device_type),
    datasets: [
      {
        data: data.map(d => d.count),
        backgroundColor: ['#3B82F6', '#10B981', '#F59E0B'],
        borderRadius: 8,
      }
    ]
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1">
        <Navbar />
        <main className="p-6">
          <h2 className="mb-6 text-2xl font-bold text-slate-900">Device Analytics</h2>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="metric-card">
              <h3 className="mb-4 text-lg font-semibold text-slate-800">Device Breakdown</h3>
              {data.length > 0 && <div style={{ height: 300 }}>
                <Doughnut data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
              </div>}
            </div>

            <div className="metric-card">
              <h3 className="mb-4 text-lg font-semibold text-slate-800">Device Distribution</h3>
              <div className="space-y-4">
                {data.map((device, idx) => (
                  <div key={idx}>
                    <div className="mb-2 flex justify-between">
                      <span className="text-sm font-medium text-slate-700">{device.device_type}</span>
                      <span className="text-sm font-semibold text-slate-900">{device.percentage}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-200">
                      <div
                        className="h-2 rounded-full bg-teal-500"
                        style={{ width: `${device.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
