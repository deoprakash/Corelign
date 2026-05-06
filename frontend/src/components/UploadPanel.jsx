import { useRef, useState } from 'react'
import useApiBase from '../hooks/useApiBase'
import { useNotification } from '../context/NotificationContext'

export default function UploadPanel() {
  const apiBase = useApiBase()
  const [selectedFiles, setSelectedFiles] = useState([])
  const [uploadState, setUploadState] = useState({ status: 'idle', message: '', progress: 0 })
  const [isDragging, setIsDragging] = useState(false)

  const fileInputRef = useRef(null)
  const activeRequestRef = useRef(null)
  const uploadCanceledRef = useRef(false)
  const { push } = useNotification()

  const handleUpload = async (event) => {
    event.preventDefault()
    if (!selectedFiles.length) {
      setUploadState({ status: 'error', message: 'Select one or more PDF/DOCX files to upload.', progress: 0 })
      return
    }

    uploadCanceledRef.current = false
    setUploadState({ status: 'loading', message: 'Uploading documents...', progress: 0 })

    try {
      const formData = new FormData()
      selectedFiles.forEach((file) => formData.append('files', file))

      const data = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        activeRequestRef.current = xhr

        xhr.open('POST', `${apiBase}/upload/upload`)
        xhr.responseType = 'json'

        xhr.upload.onprogress = (event) => {
          if (!event.lengthComputable) return
          const progress = Math.max(1, Math.min(95, Math.round((event.loaded / event.total) * 100)))
          setUploadState((current) => (current.status === 'loading' ? { ...current, progress } : current))
        }

        xhr.onload = () => {
          activeRequestRef.current = null
          const responseData = xhr.response || {}
          if (xhr.status >= 200 && xhr.status < 300) {
            setUploadState((current) => (current.status === 'loading' ? { ...current, progress: 100 } : current))
            resolve(responseData)
            return
          }

          reject(new Error(responseData?.detail || responseData?.message || 'Upload failed'))
        }

        xhr.onerror = () => {
          activeRequestRef.current = null
          reject(new Error('Upload failed due to a network error'))
        }

        xhr.onabort = () => {
          activeRequestRef.current = null
          uploadCanceledRef.current = true
          reject(new Error('Upload canceled'))
        }

        xhr.send(formData)
      })

      setUploadState({
        status: 'success',
        message: `Uploaded ${data.files_indexed ?? selectedFiles.length} files. ${data.total_chunks_embedded ?? 0} chunks indexed.`,
        progress: 100,
      })
      try {
        push({ type: 'success', title: 'Upload complete', message: `Uploaded ${data.files_indexed ?? selectedFiles.length} files.` })
      } catch (e) {}
    } catch (error) {
      if (uploadCanceledRef.current || error.message === 'Upload canceled') {
        uploadCanceledRef.current = false
        return
      }
      setUploadState({ status: 'error', message: error.message, progress: 0 })
      try { push({ type: 'error', title: 'Upload failed', message: error.message }) } catch (e) {}
    }
  }

  const handleCancelUpload = () => {
    uploadCanceledRef.current = true
    activeRequestRef.current?.abort?.()
    activeRequestRef.current = null
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
            <button className="btn-primary mt-4" type="button" onClick={() => fileInputRef.current?.click()} data-analytics="upload-select-files">Select files</button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button className="btn-primary" type="submit" disabled={uploadState.status === 'loading'} data-analytics="upload-documents">{uploadState.status === 'loading' ? 'Uploading...' : 'Upload documents'}</button>
          {uploadState.status === 'loading' ? (
            <button className="btn-ghost" type="button" onClick={handleCancelUpload} data-analytics="upload-cancel">
              Cancel upload</button>
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
