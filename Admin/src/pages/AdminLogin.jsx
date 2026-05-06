import { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AdminContext } from '../context/AdminContext'
import { apiUrl } from '../lib/api'

export default function AdminLogin() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useContext(AdminContext)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!password) {
      setError('Password required')
      setLoading(false)
      return
    }

    try {
      // Test password by making an API call
      const response = await fetch(apiUrl('/analytics/admin/dashboard'), {
        headers: { 'x-admin-password': password }
      })

      if (response.status === 403) {
        setError('Invalid password')
      } else if (response.ok) {
        login(password)
        navigate('/')
      } else {
        setError('Failed to authenticate')
      }
    } catch (err) {
      setError('Connection error. Make sure backend is running.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="rounded-2xl bg-white p-8 shadow-2xl w-full max-w-sm mx-4">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-slate-900">Admin Login</h1>
          <p className="mt-2 text-sm text-slate-500">Corelign Analytics Dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
              Admin Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              disabled={loading}
            />
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full justify-center disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Login'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-500">
          Enter the admin password to access the analytics dashboard
        </p>
      </div>
    </div>
  )
}
