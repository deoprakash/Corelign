import { useMemo } from 'react'

export default function useApiBase() {
  return useMemo(() => {
    const base = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8000'
    return base.replace(/\/$/, '')
  }, [])
}
