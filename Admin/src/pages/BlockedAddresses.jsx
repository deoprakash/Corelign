import { useContext, useState, useEffect } from 'react'
import { AdminContext } from '../context/AdminContext'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import { apiUrl } from '../lib/api'

export default function BlockedAddresses() {
  const { adminPassword } = useContext(AdminContext)
  const [blockedIPs, setBlockedIPs] = useState([])
  const [newIP, setNewIP] = useState('')
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(true)

  const fetchBlockedIPs = async () => {
    try {
      const response = await fetch(apiUrl('/analytics/admin/blocked-ips'), {
        headers: { 'x-admin-password': adminPassword }
      })
      const result = await response.json()
      setBlockedIPs(result.blocked_addresses || [])
    } catch (error) {
      console.error('Failed to fetch blocked IPs:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBlockedIPs()
  }, [adminPassword])

  const handleBlockIP = async (e) => {
    e.preventDefault()
    if (!newIP) return

    try {
      await fetch(apiUrl('/analytics/admin/block-ip'), {
        method: 'POST',
        headers: {
          'x-admin-password': adminPassword,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ip_address: newIP, reason })
      })
      setNewIP('')
      setReason('')
      fetchBlockedIPs()
    } catch (error) {
      console.error('Failed to block IP:', error)
    }
  }

  const handleUnblockIP = async (ip) => {
    try {
      await fetch(apiUrl('/analytics/admin/unblock-ip'), {
        method: 'POST',
        headers: {
          'x-admin-password': adminPassword,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ip_address: ip })
      })
      fetchBlockedIPs()
    } catch (error) {
      console.error('Failed to unblock IP:', error)
    }
  }

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
          <h2 className="mb-6 text-2xl font-bold text-slate-900">Blocked IP Addresses</h2>

          {/* Block Form */}
          <div className="mb-6 rounded-2xl bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-slate-800">Block New IP Address</h3>
            <form onSubmit={handleBlockIP} className="flex gap-3">
              <input
                type="text"
                placeholder="Enter IP address (e.g., 192.168.1.1)"
                value={newIP}
                onChange={(e) => setNewIP(e.target.value)}
                className="flex-1 rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <input
                type="text"
                placeholder="Reason (optional)"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="flex-1 rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <button type="submit" className="btn-primary">
                Block
              </button>
            </form>
          </div>

          {/* Blocked IPs Table */}
          <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">IP Address</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Reason</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Blocked At</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Action</th>
                </tr>
              </thead>
              <tbody>
                {blockedIPs.length > 0 ? (
                  blockedIPs.map((item, idx) => (
                    <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-6 py-4 text-sm font-mono text-slate-700">{item.ip_address}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{item.reason || '-'}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {item.blocked_at ? new Date(item.blocked_at).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleUnblockIP(item.ip_address)}
                          className="btn-ghost text-xs py-1 px-3"
                        >
                          Unblock
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-sm text-slate-500">
                      No blocked IPs
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
