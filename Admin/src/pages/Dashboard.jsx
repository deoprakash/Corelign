import { useContext, useEffect, useMemo, useState } from 'react'
import { AdminContext } from '../context/AdminContext'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import MetricCard from '../components/MetricCard'
import { apiUrl } from '../lib/api'
import { Bar, Doughnut, Line } from 'react-chartjs-2'
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
  Filler,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, Filler)

const chartColors = {
  teal: '#0f766e',
  tealSoft: 'rgba(15, 118, 110, 0.12)',
  slate: '#0f172a',
  blue: '#2563eb',
  amber: '#f59e0b',
  rose: '#e11d48',
}

const emptyArray = []

function Panel({ title, eyebrow, children, className = '' }) {
  return (
    <section className={`rounded-[1.75rem] border border-white/60 bg-white/75 p-5 shadow-xl shadow-slate-900/5 backdrop-blur-xl ${className}`}>
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          {eyebrow && <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-700">{eyebrow}</p>}
          <h3 className="mt-1 text-lg font-bold text-slate-900">{title}</h3>
        </div>
      </div>
      {children}
    </section>
  )
}

function ProgressList({ items, labelKey, valueKey, emptyLabel }) {
  const max = Math.max(...items.map((item) => Number(item[valueKey]) || Number(item.percentage) || 0), 1)

  if (!items.length) {
    return <p className="text-sm text-slate-500">{emptyLabel}</p>
  }

  return (
    <div className="space-y-4">
      {items.slice(0, 5).map((item, index) => {
        const rawValue = Number(item[valueKey]) || Number(item.percentage) || 0
        const width = item.percentage ?? Math.round((rawValue / max) * 100)
        return (
          <div key={`${item[labelKey]}-${index}`}>
            <div className="mb-2 flex items-center justify-between gap-3 text-sm">
              <span className="truncate font-semibold text-slate-700">{item[labelKey] || 'Unknown'}</span>
              <span className="font-bold text-slate-950">{item.percentage ? `${item.percentage}%` : rawValue.toLocaleString()}</span>
            </div>
            <div className="h-2.5 rounded-full bg-slate-100">
              <div className="h-2.5 rounded-full bg-teal-600" style={{ width: `${Math.min(width, 100)}%` }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}

function RankedList({ items, labelKey, valueKey, suffix = '', emptyLabel }) {
  if (!items?.length) {
    return <p className="text-sm text-slate-500">{emptyLabel}</p>
  }

  return (
    <div className="space-y-3">
      {items.slice(0, 6).map((item, index) => (
        <div key={`${item[labelKey]}-${index}`} className="flex items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-white/70 px-4 py-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-800">{item[labelKey] || 'Unknown'}</p>
          </div>
          <p className="shrink-0 text-sm font-bold text-slate-950">
            {Number(item[valueKey] || 0).toLocaleString()}
            {suffix}
          </p>
        </div>
      ))}
    </div>
  )
}

export default function Dashboard() {
  const { adminPassword } = useContext(AdminContext)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [chartMode, setChartMode] = useState('visitors')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(apiUrl('/analytics/admin/dashboard'), {
          headers: { 'x-admin-password': adminPassword },
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
    const interval = setInterval(fetchData, 300000)
    return () => clearInterval(interval)
  }, [adminPassword])

  const dailyVisitors = data?.daily_visitors || emptyArray
  const dailyBounce = data?.daily_bounce || emptyArray
  const deviceBreakdown = data?.device_breakdown || emptyArray
  const osBreakdown = data?.os_breakdown || emptyArray
  const countries = data?.country_analytics || emptyArray

  const trendData = useMemo(() => {
    if (chartMode === 'bounce_rate') {
      return {
        labels: dailyBounce.map((day) => day.date),
        datasets: [
          {
            label: 'Bounce Rate',
            data: dailyBounce.map((day) => day.bounce_rate),
            borderColor: chartColors.rose,
            backgroundColor: 'rgba(225, 29, 72, 0.1)',
            fill: true,
            tension: 0.35,
            pointRadius: 3,
            borderWidth: 2,
          },
        ],
      }
    }

    return {
      labels: dailyVisitors.map((day) => day.date),
      datasets: [
        {
          label: chartMode === 'page_views' ? 'Page Views' : 'Visitors',
          data: dailyVisitors.map((day) => (chartMode === 'page_views' ? day.page_views || day.visitors : day.visitors)),
          borderColor: chartColors.teal,
          backgroundColor: chartColors.tealSoft,
          fill: true,
          tension: 0.35,
          pointRadius: 3,
          borderWidth: 2,
        },
      ],
    }
  }, [chartMode, dailyBounce, dailyVisitors])

  const downloadChartData = {
    labels: ['Windows', 'Linux', 'Mac'],
    datasets: [
      {
        label: 'Downloads',
        data: [
          data?.download_analytics?.button_clicks?.windows || 0,
          data?.download_analytics?.button_clicks?.linux || 0,
          data?.download_analytics?.button_clicks?.mac || 0,
        ],
        backgroundColor: [chartColors.teal, chartColors.blue, chartColors.amber],
        borderRadius: 10,
      },
    ],
  }

  const deviceChartData = {
    labels: deviceBreakdown.map((item) => item.device_type),
    datasets: [
      {
        data: deviceBreakdown.map((item) => item.percentage),
        backgroundColor: [chartColors.teal, chartColors.blue, chartColors.amber, chartColors.rose],
        borderWidth: 0,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: chartColors.slate,
        padding: 12,
        titleColor: '#fff',
        bodyColor: '#cbd5e1',
        cornerRadius: 12,
      },
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#64748b' } },
      y: { beginAtZero: true, grid: { color: 'rgba(148, 163, 184, 0.18)' }, ticks: { color: '#64748b' } },
    },
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <div className="glass rounded-[2rem] px-8 py-6 text-center">
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-teal-700">Corelign</p>
          <p className="mt-2 text-lg font-semibold text-slate-800">Loading analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <div className="flex">
        <Sidebar />
        <div className="min-w-0 flex-1">
          <Navbar />
          <main className="mx-auto w-full max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">
            <section className="mb-6 overflow-hidden rounded-[2rem] border border-white/60 bg-slate-950 px-5 py-6 text-white shadow-2xl shadow-slate-900/15 sm:px-7">
              <div className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr] lg:items-end">
                <div>
                  <p className="pill bg-white/10 text-teal-100 ring-1 ring-white/10">Realtime website intelligence</p>
                  <h2 className="mt-5 max-w-3xl text-3xl font-bold tracking-tight sm:text-4xl">
                    Monitor traffic, downloads, devices, and user intent from one modern command center.
                  </h2>
                  <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300">
                    Dashboard refreshes every 5 minutes and keeps the same Corelign design language as the public app.
                  </p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/10 p-5">
                  <p className="text-sm font-semibold text-slate-300">Total sessions</p>
                  <p className="mt-2 text-4xl font-bold">{(data?.session_analytics?.total_sessions || 0).toLocaleString()}</p>
                  <p className="mt-3 text-xs font-medium text-teal-100">Active source: production analytics API</p>
                </div>
              </div>
            </section>

            <section className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <MetricCard
                label="Visitors"
                value={data?.total_visitors}
                helper="Unique users tracked"
                accent="teal"
                onClick={() => setChartMode('visitors')}
                active={chartMode === 'visitors'}
              />
              <MetricCard
                label="Page Views"
                value={data?.page_views}
                helper="All page impressions"
                accent="blue"
                onClick={() => setChartMode('page_views')}
                active={chartMode === 'page_views'}
              />
              <MetricCard
                label="Bounce Rate"
                value={data?.bounce_rate ?? 0}
                suffix="%"
                helper="Single-page exits"
                accent="rose"
                change={data?.bounce_delta !== undefined && data?.bounce_delta !== null ? Math.abs(data.bounce_delta) : undefined}
                trend={data?.bounce_delta > 0 ? 'down' : data?.bounce_delta < 0 ? 'up' : undefined}
                onClick={() => setChartMode('bounce_rate')}
                active={chartMode === 'bounce_rate'}
              />
              <MetricCard
                label="Sessions"
                value={data?.session_analytics?.total_sessions}
                helper="Tracked browsing sessions"
                accent="amber"
              />
            </section>

            <section className="mb-6 grid gap-6 xl:grid-cols-[1.55fr_0.75fr]">
              <Panel title={chartMode === 'bounce_rate' ? 'Bounce Rate Trend' : chartMode === 'page_views' ? 'Page View Trend' : 'Visitor Trend'} eyebrow="Performance">
                {trendData.labels.length ? (
                  <div className="h-[340px]">
                    <Line data={trendData} options={chartOptions} />
                  </div>
                ) : (
                  <div className="flex h-[340px] items-center justify-center rounded-3xl bg-slate-50 text-sm font-medium text-slate-500">
                    No timeseries data available
                  </div>
                )}
              </Panel>

              <Panel title="Device Mix" eyebrow="Audience">
                {deviceBreakdown.length ? (
                  <>
                    <div className="mx-auto h-[220px] max-w-[260px]">
                      <Doughnut
                        data={deviceChartData}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          cutout: '68%',
                          plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, color: '#475569' } } },
                        }}
                      />
                    </div>
                    <div className="mt-5">
                      <ProgressList items={deviceBreakdown} labelKey="device_type" valueKey="percentage" emptyLabel="No device data" />
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-slate-500">No device data available</p>
                )}
              </Panel>
            </section>

            <section className="mb-6 grid gap-6 xl:grid-cols-3">
              <Panel title="Countries" eyebrow="Reach">
                <ProgressList items={countries} labelKey="country" valueKey="visitors" emptyLabel="No country data available" />
              </Panel>

              <Panel title="Operating Systems" eyebrow="Devices">
                <ProgressList items={osBreakdown} labelKey="os" valueKey="percentage" emptyLabel="No OS data available" />
              </Panel>

              <Panel title="Downloads by Platform" eyebrow="Conversion">
                <div className="h-[260px]">
                  <Bar data={downloadChartData} options={chartOptions} />
                </div>
              </Panel>
            </section>

            <section className="grid gap-6 xl:grid-cols-3">
              <Panel title="Top Pages" eyebrow="Navigation">
                <RankedList items={data?.top_pages || emptyArray} labelKey="page" valueKey="total_visits" suffix=" visits" emptyLabel="No page data available" />
              </Panel>

              <Panel title="Top Button Clicks" eyebrow="Actions">
                <RankedList items={data?.button_clicks || emptyArray} labelKey="button_name" valueKey="total_clicks" suffix=" clicks" emptyLabel="No button data available" />
              </Panel>

              <Panel title="Top Referrers" eyebrow="Acquisition">
                <RankedList items={data?.referrers || emptyArray} labelKey="referrer" valueKey="visitors" emptyLabel="No referrer data available" />
              </Panel>
            </section>
          </main>
        </div>
      </div>
    </div>
  )
}
