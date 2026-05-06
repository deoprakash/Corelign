/**
 * Corelign event tracking helper.
 * Neutral filename to avoid ad/privacy blockers that target telemetry/analytics paths.
 */

const TRACKING_CONFIG = {
  API_BASE: import.meta?.env?.VITE_API_BASE || 'http://localhost:8000',
  ENABLED: true,
  DEBUG: false,
}

let visitorId = null
let sessionId = null
let maxScrollDepth = 0
let lastTrackedPath = null
let initialized = false

const DOWNLOAD_BUTTONS = {
  'download-windows': 'windows',
  download_windows: 'windows',
  'download-linux': 'linux',
  download_linux: 'linux',
  'download-mac': 'mac',
  download_mac: 'mac',
}

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

function getDeviceType() {
  if (window.innerWidth < 768) return 'mobile'
  if (window.innerWidth < 1024) return 'tablet'
  return 'desktop'
}

function getBrowserInfo() {
  const ua = navigator.userAgent
  let browser = 'Unknown'
  let os = 'Unknown'

  if (ua.includes('Firefox')) browser = 'Firefox'
  else if (ua.includes('Chrome')) browser = 'Chrome'
  else if (ua.includes('Safari')) browser = 'Safari'
  else if (ua.includes('Edge')) browser = 'Edge'

  if (ua.includes('Windows')) os = 'Windows'
  else if (ua.includes('Mac')) os = 'macOS'
  else if (ua.includes('X11')) os = 'Linux'
  else if (ua.includes('Android')) os = 'Android'
  else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS'

  return { browser, os }
}

function getScreenSize() {
  return `${window.innerWidth}x${window.innerHeight}`
}

async function getClientIP() {
  try {
    const response = await fetch(`${TRACKING_CONFIG.API_BASE}/analytics/get-client-ip`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })
    const data = await response.json()
    return data.ip_address || '0.0.0.0'
  } catch (error) {
    if (TRACKING_CONFIG.DEBUG) console.warn('Could not get client IP:', error)
    return '0.0.0.0'
  }
}

export async function initTracking() {
  if (!TRACKING_CONFIG.ENABLED || initialized) return
  initialized = true

  visitorId = localStorage.getItem('visitorId') || generateUUID()
  localStorage.setItem('visitorId', visitorId)
  sessionId = generateUUID()

  trackCurrentPage()
  setupScrollTracking()
  setupButtonTracking()
  setupRouteTracking()
}

function trackCurrentPage() {
  const currentPath = window.location.pathname
  if (currentPath === lastTrackedPath) return

  maxScrollDepth = 0
  lastTrackedPath = currentPath
  trackPageView()
}

export async function trackPageView() {
  if (!visitorId) return

  const { browser, os } = getBrowserInfo()
  const clientIP = await getClientIP()

  sendEvent({
    event_type: 'page_view',
    page: window.location.pathname,
    visitor_id: visitorId,
    session_id: sessionId,
    ip_address: clientIP,
    user_agent: navigator.userAgent,
    device_type: getDeviceType(),
    browser,
    os,
    screen_size: getScreenSize(),
  })
}

let scrollTimeout
function setupScrollTracking() {
  window.addEventListener('scroll', () => {
    clearTimeout(scrollTimeout)
    scrollTimeout = setTimeout(() => {
      const denominator = document.documentElement.scrollHeight - window.innerHeight
      if (denominator <= 0) return

      const scrollDepth = Math.round((window.scrollY / denominator) * 100)
      if (scrollDepth > maxScrollDepth) {
        maxScrollDepth = scrollDepth
        trackScroll(scrollDepth)
      }
    }, 1000)
  }, { passive: true })
}

async function trackScroll(scrollDepth) {
  if (!visitorId) return

  const clientIP = await getClientIP()
  sendEvent({
    event_type: 'scroll',
    scroll_depth: scrollDepth,
    page: window.location.pathname,
    visitor_id: visitorId,
    session_id: sessionId,
    ip_address: clientIP,
    user_agent: navigator.userAgent,
  })
}

function setupButtonTracking() {
  document.addEventListener('click', (event) => {
    const target = event.target.closest?.('[data-analytics]')
    if (!target) return

    const buttonName = target.getAttribute('data-analytics')
    trackButtonClick(buttonName)
  })
}

function setupRouteTracking() {
  const notifyRouteChange = () => {
    window.setTimeout(trackCurrentPage, 0)
  }

  const originalPushState = window.history.pushState
  const originalReplaceState = window.history.replaceState

  window.history.pushState = function pushState(...args) {
    const result = originalPushState.apply(this, args)
    notifyRouteChange()
    return result
  }

  window.history.replaceState = function replaceState(...args) {
    const result = originalReplaceState.apply(this, args)
    notifyRouteChange()
    return result
  }

  window.addEventListener('popstate', notifyRouteChange)
}

export async function trackButtonClick(buttonName) {
  if (!visitorId || !buttonName) return

  const { browser, os } = getBrowserInfo()
  const clientIP = await getClientIP()

  sendEvent({
    event_type: 'click',
    button_name: buttonName,
    page: window.location.pathname,
    visitor_id: visitorId,
    session_id: sessionId,
    ip_address: clientIP,
    device_type: getDeviceType(),
    browser,
    os,
    user_agent: navigator.userAgent,
  })

  const downloadPlatform = DOWNLOAD_BUTTONS[buttonName]
  if (downloadPlatform) {
    sendDownload(downloadPlatform, clientIP, browser, os)
  }
}

export async function trackDownloadClick(platform) {
  if (!visitorId) return

  const { browser, os } = getBrowserInfo()
  const clientIP = await getClientIP()

  sendEvent({
    event_type: 'click',
    button_name: `download_${platform}`,
    page: window.location.pathname,
    visitor_id: visitorId,
    session_id: sessionId,
    ip_address: clientIP,
    device_type: getDeviceType(),
    browser,
    os,
    user_agent: navigator.userAgent,
  })

  sendDownload(platform, clientIP, browser, os)
}

async function sendDownload(platform, clientIP, browser, os) {
  try {
    await fetch(`${TRACKING_CONFIG.API_BASE}/analytics/track-download`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        platform,
        visitor_id: visitorId,
        session_id: sessionId,
        ip_address: clientIP,
        device_type: getDeviceType(),
        browser,
        os,
        user_agent: navigator.userAgent,
      }),
    })
  } catch (error) {
    if (TRACKING_CONFIG.DEBUG) console.warn('Failed to track download:', error)
  }
}

export async function trackInstallerDownload(platform) {
  if (!visitorId) return

  const clientIP = await getClientIP()
  try {
    await fetch(`${TRACKING_CONFIG.API_BASE}/analytics/track-installer-download`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        platform,
        visitor_id: visitorId,
        session_id: sessionId,
        ip_address: clientIP,
        user_agent: navigator.userAgent,
        device_type: getDeviceType(),
        browser: getBrowserInfo().browser,
        os: getBrowserInfo().os,
      }),
    })
  } catch (error) {
    if (TRACKING_CONFIG.DEBUG) console.warn('Failed to track installer download:', error)
  }
}

export async function trackAppLaunch(platform, version) {
  if (!visitorId) return

  try {
    await fetch(`${TRACKING_CONFIG.API_BASE}/analytics/track-app-launch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ platform, visitor_id: visitorId, app_version: version }),
    })
  } catch (error) {
    if (TRACKING_CONFIG.DEBUG) console.warn('Failed to track app launch:', error)
  }
}

export async function trackFileUpload(fileName, fileSize, fileType, success, duration) {
  if (!visitorId) return

  try {
    await fetch(`${TRACKING_CONFIG.API_BASE}/analytics/track-file-upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        visitor_id: visitorId,
        session_id: sessionId,
        file_name: fileName,
        file_size: fileSize,
        file_type: fileType,
        upload_success: success,
        upload_duration: duration,
      }),
    })
  } catch (error) {
    if (TRACKING_CONFIG.DEBUG) console.warn('Failed to track file upload:', error)
  }
}

export async function trackQuery(queryLength, responseTime, success) {
  if (!visitorId) return

  try {
    await fetch(`${TRACKING_CONFIG.API_BASE}/analytics/track-query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        visitor_id: visitorId,
        session_id: sessionId,
        query_length: queryLength,
        response_time: responseTime,
        success,
      }),
    })
  } catch (error) {
    if (TRACKING_CONFIG.DEBUG) console.warn('Failed to track query:', error)
  }
}

export async function trackError(errorType, errorMessage, errorStack, page) {
  if (!visitorId) return

  const clientIP = await getClientIP()
  try {
    await fetch(`${TRACKING_CONFIG.API_BASE}/analytics/track-error`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_type: errorType,
        visitor_id: visitorId,
        session_id: sessionId,
        error_message: errorMessage,
        error_stack: errorStack,
        page: page || window.location.pathname,
        ip_address: clientIP,
        user_agent: navigator.userAgent,
      }),
    })
  } catch (error) {
    if (TRACKING_CONFIG.DEBUG) console.warn('Failed to track error:', error)
  }
}

window.addEventListener('error', (event) => {
  trackError('console_error', event.message, event.error?.stack, window.location.pathname)
})

window.addEventListener('unhandledrejection', (event) => {
  trackError('unhandled_rejection', event.reason?.message || String(event.reason), event.reason?.stack)
})

async function sendEvent(payload) {
  if (!TRACKING_CONFIG.ENABLED) return

  try {
    await fetch(`${TRACKING_CONFIG.API_BASE}/analytics/track-event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  } catch (error) {
    if (TRACKING_CONFIG.DEBUG) console.warn('Failed to send event:', error)
  }
}
