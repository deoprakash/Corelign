import { useRef, useState } from 'react'
import useApiBase from '../hooks/useApiBase'
import { useNotification } from '../context/NotificationContext'

export default function UploadPanel() {
  const apiBase = useApiBase()
  const [selectedFiles, setSelectedFiles] = useState([])
  const [uploadState, setUploadState] = useState({ status: 'idle', message: '', progress: 0 })
  const [isDragging, setIsDragging] = useState(false)

  const fileInputRef = useRef(null)
  const { push } = useNotification()

  const handleUpload = async (event) => {
    event.preventDefault()
    if (!selectedFiles.length) {
      setUploadState({ status: 'error', message: 'Select one or more PDF/DOCX files to upload.', progress: 0 })
      return
    }

    setUploadState({ status: 'loading', message: 'Uploading documents...', progress: 0 })

    try {
      const formData = new FormData()
      selectedFiles.forEach((file) => formData.append('files', file))

      const response = await fetch(`${apiBase}/upload/upload`, {
        method: 'POST',
        body: formData,
      })

      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(data?.detail || 'Upload failed')
      }

      setUploadState({
        status: 'success',
        message: `Uploaded ${data.files_indexed ?? selectedFiles.length} files. ${data.total_chunks_embedded ?? 0} chunks indexed.`,
        progress: 100,
      })
      try {
        push({ type: 'success', title: 'Upload complete', message: `Uploaded ${data.files_indexed ?? selectedFiles.length} files.` })
      } catch (e) {}
    } catch (error) {
      setUploadState({ status: 'error', message: error.message, progress: 0 })
      try { push({ type: 'error', title: 'Upload failed', message: error.message }) } catch (e) {}
    }
  }

  const handleCancelUpload = () => {
    setUploadState({ status: 'idle', message: '', progress: 0 })
  }

  const handleDrop = (event) => {
    event.preventDefault()
    setIsDragging(false)
    const droppedFiles = Array.from(event.dataTransfer.files || [])
    if (droppedFiles.length) setSelectedFiles(droppedFiles)
  }

  return (
    <div className="glass rounded-3xl p-6 lg:p-5 xl:p-6">
      <h1 className="font-display text-2xl font-semibold text-slate-900">Upload & Index</h1>
      <p className="mt-2 text-sm text-slate-600">Add DOCX/PDF files and we will chunk, embed, and index them automatically.</p>
      <form className="mt-6 space-y-4" onSubmit={handleUpload}>
        <div
          className={`rounded-2xl border border-dashed p-5 transition ${isDragging ? 'border-teal-400 bg-teal-100/80' : 'border-teal-200 bg-teal-50/70'}`}
          onDragEnter={(event) => { event.preventDefault(); setIsDragging(true) }}
          onDragOver={(event) => { event.preventDefault(); setIsDragging(true) }}
          onDragLeave={(event) => { event.preventDefault(); setIsDragging(false) }}
          onDrop={handleDrop}
        >
          <input
            accept=".pdf,.docx"
            className="hidden"
            multiple
            onChange={(event) => setSelectedFiles(Array.from(event.target.files || []))}
            ref={fileInputRef}
            type="file"
          />
          <div className="text-center">
            <p className="text-sm font-medium text-slate-700">{isDragging ? 'Drop files here' : 'Drag & drop files or browse'}</p>
            <p className="text-xs text-slate-500">Supports PDF & DOCX</p>
            <button className="btn-primary mt-4" type="button" onClick={() => fileInputRef.current?.click()}>Select files</button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button className="btn-primary" type="submit" disabled={uploadState.status === 'loading'}>{uploadState.status === 'loading' ? 'Uploading...' : 'Upload documents'}</button>
          {uploadState.status === 'loading' ? (
            <button className="btn-ghost" type="button" onClick={handleCancelUpload}>Cancel upload</button>
          ) : null}
          {selectedFiles.length ? (
            <span className="text-xs text-slate-500">Selected ({selectedFiles.length}): {selectedFiles.slice(0, 3).map((file) => file.name).join(', ')}{selectedFiles.length > 3 ? ', ...' : ''}</span>
          ) : null}
        </div>

        {uploadState.status === 'loading' ? (
          <div className="rounded-2xl bg-white/80 px-4 py-3">
            <div className="mb-2 flex items-center justify-between text-xs text-slate-500"><span>Uploading</span><span>{uploadState.progress}%</span></div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100"><div className="h-full bg-teal-500 transition-all" style={{ width: `${uploadState.progress}%` }} /></div>
          </div>
        ) : null}

        {uploadState.message ? (
          <div className={`rounded-2xl px-4 py-3 text-sm ${uploadState.status === 'success' ? 'bg-teal-50 text-teal-700' : uploadState.status === 'error' ? 'bg-rose-50 text-rose-700' : 'bg-slate-100 text-slate-600'}`}>{uploadState.message}</div>
        ) : null}
      </form>
    </div>
  )
}
