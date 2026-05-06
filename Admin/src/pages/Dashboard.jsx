import { useContext, useState, useEffect } from 'react'
import { AdminContext } from '../context/AdminContext'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import MetricCard from '../components/MetricCard'
import { apiUrl } from '../lib/api'
import { Bar, Line, Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, ArcElement)

export default function Dashboard() {
  const { adminPassword } = useContext(AdminContext)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  // Fetch dashboard data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(apiUrl('/analytics/admin/dashboard'), {
          headers: { 'x-admin-password': adminPassword }
        })
        const result = await response.json()
        setData(result)
      } catch (error) {
        console.error('Failed to fetch dashboard:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [adminPassword])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-slate-600">Loading analytics...</p>
      </div>
    )
  }

  const downloadChartData = data ? {
    labels: ['Windows', 'Linux', 'Mac'],
    datasets: [
      {
        label: 'Downloads',
        data: [
          data.download_analytics?.button_clicks?.windows || 0,
          data.download_analytics?.button_clicks?.linux || 0,
          data.download_analytics?.button_clicks?.mac || 0
        ],
        backgroundColor: ['#3B82F6', '#10B981', '#F59E0B'],
        borderRadius: 8,
      }
    ]
  } : null

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1">
        <Navbar />
        <main className="p-6">
          <h2 className="mb-6 text-2xl font-bold text-slate-900">Dashboard Overview</h2>

          {/* Top Metrics */}
          <div className="mb-6 grid gap-4 md:grid-cols-4">
            <MetricCard label="Total Visitors" value={data?.total_visitors} />
            <MetricCard label="Today's Unique" value={data?.unique_visitors_today} />
            <MetricCard label="Returning" value={data?.returning_visitors} />
            <MetricCard label="Total Downloads" value={data?.download_analytics?.total_downloads} />
          </div>

          {/* Charts Row */}
          <div className="mb-6 grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-semibold text-slate-800">Downloads by Platform</h3>
              {downloadChartData && (
                <div style={{ height: 300 }}>
                  <Bar data={downloadChartData} options={{ responsive: true, maintainAspectRatio: false }} />
                </div>
              )}
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-semibold text-slate-800">Device Breakdown</h3>
              {data?.device_breakdown && (
                <div className="space-y-3">
                  {data.device_breakdown.map((device) => (
                    <div key={device.device_type} className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">{device.device_type}</span>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-32 rounded-full bg-slate-200">
                          <div
                            className="h-2 rounded-full bg-teal-500"
                            style={{ width: `${device.percentage}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-slate-900">{device.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Top Pages & Buttons */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-semibold text-slate-800">Top Pages</h3>
              {data?.top_pages && (
                <div className="space-y-3">
                  {data.top_pages.map((page, idx) => (
                    <div key={idx} className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-0">
                      <span className="text-sm text-slate-600">{page.page}</span>
                      <span className="text-sm font-semibold text-slate-900">{page.total_visits} visits</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-semibold text-slate-800">Top Button Clicks</h3>
              {data?.button_clicks && (
                <div className="space-y-3">
                  {data.button_clicks.map((btn, idx) => (
                    <div key={idx} className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-0">
                      <span className="text-sm text-slate-600">{btn.button_name}</span>
                      <span className="text-sm font-semibold text-slate-900">{btn.total_clicks} clicks</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
