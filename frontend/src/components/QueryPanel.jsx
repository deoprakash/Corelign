import { useEffect, useRef, useState } from 'react'
import useApiBase from '../hooks/useApiBase'
import { useNotification } from '../context/NotificationContext'
import { AppContext } from '../context/AppContext'
import { useContext } from 'react'
import { postJson } from '../lib/api'
import { useNavigate } from "react-router-dom";

const STORAGE_KEY = 'chat_history_v1'
const GUEST_QUERY_LIMIT_KEY = 'guest_query_limit_count_v1'
const GUEST_MAX_QUERY_LIMIT = 5

function makeId() {
  return `${Date.now()}-${Math.floor(Math.random() * 10000)}`
}

export default function QueryPanel() {
  const apiBase = useApiBase()
  const { currentUser } = useContext(AppContext)
  const [inputText, setInputText] = useState('')
  const [messages, setMessages] = useState([])
  const [status, setStatus] = useState('idle')
  const [queryCount, setQueryCount] = useState(0)
  const [showRestrictionPopup, setShowRestrictionPopup] = useState(false)
  const listRef = useRef(null)
  const { push } = useNotification()
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setMessages(JSON.parse(raw))

      if (!currentUser) {
        const queryCountRaw = localStorage.getItem(GUEST_QUERY_LIMIT_KEY)
        if (queryCountRaw) {
          const parsed = Number(queryCountRaw)
          if (!Number.isNaN(parsed) && parsed >= 0) {
            setQueryCount(parsed)
          }
        }
      }
    } catch (e) {
      console.warn('Failed to load chat history', e)
    }
  }, [currentUser])

  useEffect(() => {
    if (currentUser) {
      setQueryCount(0)
      setShowRestrictionPopup(false)
    }
  }, [currentUser])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
    } catch (e) {
      console.warn('Failed to save chat history', e)
    }
    // scroll to bottom on new message
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight
  }, [messages])

  const handleSend = async (e) => {
    e?.preventDefault()
    const text = inputText.trim()
    if (!text) return

      if (!currentUser && queryCount >= GUEST_MAX_QUERY_LIMIT) {
        push({
          type: "info",
          title: "Login required",
          message:
            "You have reached the free query limit. Please login to continue.",
        });

        navigate("/login");
        return;
      }

    const userMsg = { id: makeId(), role: 'user', text, createdAt: Date.now() }
    setMessages((m) => [...m, userMsg])
    setInputText('')

    setStatus('loading')
    try {
      const data = await postJson(`${apiBase}/query`, { query: text, top_k: 7 })

      const assistantMsg = {
        id: makeId(),
        role: 'assistant',
        text: data.answer || 'No answer returned.',
        chunks: Array.isArray(data.chunks) ? data.chunks : [],
        sources: Array.isArray(data.sources) ? data.sources : [],
        confidence: typeof data.confidence === 'number' ? data.confidence : null,
        createdAt: Date.now(),
      }

      setMessages((m) => [...m, assistantMsg])

      const nextCount = queryCount + 1
      if (!currentUser) {
        setQueryCount(nextCount)
        localStorage.setItem(GUEST_QUERY_LIMIT_KEY, String(nextCount))
      }

      if (!data.answer || data.answer === '') {
        push({ type: 'warn', title: 'No answer', message: 'No answer returned for this query.' })
      }
    } catch (err) {
      const errMsg = { id: makeId(), role: 'assistant', text: `Error: ${err.message}`, chunks: [], sources: [], createdAt: Date.now() }
      setMessages((m) => [...m, errMsg])
      push({ type: 'error', title: 'Query failed', message: err.message })
    } finally {
      setStatus('idle')
    }
  }

  const clearHistory = () => {
    setMessages([])
    localStorage.removeItem(STORAGE_KEY)
  }

  const renderChunks = (chunks = []) => {
    if (!chunks.length) return null
    return (
      <div className="mt-3 space-y-2 text-sm">
        {chunks.map((c) => (
          <div key={c.id || c.meta?.id || Math.random()} className="rounded-xl bg-slate-50 p-3">
            <div className="text-xs text-slate-500">{c.meta?.source_file || c.metadata?.source_file || 'Source file unknown'}</div>
            <div className="mt-1 text-slate-700">{c.text}</div>
            <div className="mt-2 text-[11px] text-slate-600">
              {typeof c.score === 'number' ? `Similarity: ${c.score.toFixed(3)}` : null}
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="glass flex min-h-[72vh] flex-col rounded-3xl p-6 lg:min-h-[78vh] xl:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-semibold text-slate-900 lg:text-[2rem]">Conversation</h2>
          <p className="mt-1 text-sm text-slate-600">Persistent chat with retrieved chunks and history.</p>
          {!currentUser ? (
            <p className="mt-2 text-xs font-medium text-slate-500">Guest queries used: {queryCount}/{GUEST_MAX_QUERY_LIMIT}</p>
          ) : null}
        </div>
        <div>
          <button className="btn-ghost" onClick={clearHistory} data-analytics="query-clear-history">Clear</button>
        </div>
      </div>

      <div ref={listRef} className="mt-4 min-h-0 flex-1 space-y-4 overflow-y-auto pr-2">
        {messages.length === 0 ? (
          <div className="text-sm text-slate-500">No messages yet — ask a question to begin.</div>
        ) : null}

        {messages.map((msg) => (
          <div key={msg.id} className={`rounded-2xl p-4 ${msg.role === 'user' ? 'bg-white/80 self-end' : 'bg-slate-900 text-slate-100'}`}>
            <div className="flex items-baseline justify-between">
              <div className="text-sm font-medium">{msg.role === 'user' ? 'You' : 'Assistant'}</div>
              <div className="text-[11px] text-slate-400 ml-2">{new Date(msg.createdAt).toLocaleString()}</div>
            </div>
            <div className={`mt-2 text-sm ${msg.role === 'user' ? 'text-slate-700' : ''}`}>{msg.text}</div>
            {msg.role === 'assistant' ? (
              <div className="mt-3 text-xs text-slate-400">
                {msg.confidence !== undefined && msg.confidence !== null ? `Confidence: ${msg.confidence.toFixed(3)}` : null}
              </div>
            ) : null}

            {msg.role === 'assistant' && msg.chunks ? (
              <div className="mt-4">
                <details className="text-sm">
                  <summary className="cursor-pointer text-slate-500">Show Sources ({msg.chunks.length})</summary>
                  {renderChunks(msg.chunks)}
                </details>
              </div>
            ) : null}

            {/* {msg.role === 'assistant' && msg.sources?.length ? (
              <div className="mt-4">
                <details className="text-sm">
                  <summary className="cursor-pointer text-slate-500">Show sources ({msg.sources.length})</summary>
                  {renderSources(msg.sources)}
                </details>
              </div>
            ) : null} */}
          </div>
        ))}
      </div>

      <form className="mt-4 border-t border-white/50 pt-4" onSubmit={handleSend}>
        <textarea value={inputText} onChange={(e) => setInputText(e.target.value)} placeholder="Ask a question about your uploaded documents..." className="min-h-[80px] w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-700 outline-none focus:border-teal-500 disabled:cursor-not-allowed disabled:opacity-60" />
        <div className="mt-3 flex items-center gap-3">
          <button className="btn-primary" type="submit" disabled={status === 'loading'} data-analytics="query-send">{status === 'loading' ? 'Thinking...' : 'Send'}</button>
          <button className="btn-ghost" type="button" onClick={() => setInputText('')} data-analytics="query-clear-input">Clear input</button>
        </div>
      </form>

      {showRestrictionPopup ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
          <div className="glass w-full max-w-md rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-slate-900">Limit over</h3>
            <p className="mt-2 text-sm text-slate-700">
              limit over. please login in
            </p>
            <div className="mt-5 flex justify-end">
              <button className="btn-primary" type="button" onClick={() => setShowRestrictionPopup(false)} data-analytics="query-limit-popup-close">
                Got it
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
