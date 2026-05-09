/**
 * Corelign Analytics Tracking Library
 * Add this to your frontend to automatically track user behavior
 * Usage: Add <script> tag in index.html before </body>
 */

const ANALYTICS_CONFIG = {
  API_BASE: import.meta?.env?.VITE_API_BASE || 'http://localhost:8000',
  ENABLED: true,
  DEBUG: false,
}

let visitorId = null
let sessionId = null
let maxScrollDepth = 0

// Cache and in-flight promise so we only ask the server for IP once
let _cachedClientIP = null
let _clientIPPromise = null

// ========== INITIALIZATION ==========

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
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

  if (ua.indexOf('Firefox') > -1) browser = 'Firefox'
  else if (ua.indexOf('Chrome') > -1) browser = 'Chrome'
  else if (ua.indexOf('Safari') > -1) browser = 'Safari'
  else if (ua.indexOf('Edge') > -1) browser = 'Edge'

  if (ua.indexOf('Windows') > -1) os = 'Windows'
  else if (ua.indexOf('Mac') > -1) os = 'macOS'
  else if (ua.indexOf('X11') > -1) os = 'Linux'
  else if (ua.indexOf('Android') > -1) os = 'Android'
  else if (ua.indexOf('iPhone') > -1 || ua.indexOf('iPad') > -1) os = 'iOS'

  return { browser, os }
}

function getScreenSize() {
  return `${window.innerWidth}x${window.innerHeight}`
}

async function getClientIP() {
  if (_cachedClientIP) return _cachedClientIP
  if (_clientIPPromise) return _clientIPPromise

  _clientIPPromise = (async () => {
    try {
      const response = await fetch(`${ANALYTICS_CONFIG.API_BASE}/analytics/get-client-ip`)
      const data = await response.json()
      _cachedClientIP = data.ip_address || '0.0.0.0'
      return _cachedClientIP
    } catch (error) {
      if (ANALYTICS_CONFIG.DEBUG) console.warn('Could not get client IP:', error)
      _cachedClientIP = '0.0.0.0'
      return _cachedClientIP
    } finally {
      _clientIPPromise = null
    }
  })()

  return _clientIPPromise
}

export async function initTracking() {
  if (!ANALYTICS_CONFIG.ENABLED) return

  // Initialize IDs
  visitorId = localStorage.getItem('visitorId') || generateUUID()
  localStorage.setItem('visitorId', visitorId)
  sessionId = generateUUID()

  if (ANALYTICS_CONFIG.DEBUG) {
    console.log('Analytics initialized', { visitorId, sessionId })
  }

  // Track page view
  trackPageView()

  // Track scroll
  setupScrollTracking()

  // Track button clicks (auto-detect data-analytics attributes)
  setupButtonTracking()
}

// ========== PAGE VIEW TRACKING ==========

export async function trackPageView() {
  if (!visitorId) {
    console.warn('Tracking not initialized. Call initTracking() first')
    return
  }

  const { browser, os } = getBrowserInfo()
  const clientIP = await getClientIP()

  const payload = {
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
  }

  sendEvent(payload)
}

// ========== SCROLL TRACKING ==========

let scrollTimeout
function setupScrollTracking() {
  window.addEventListener('scroll', () => {
    clearTimeout(scrollTimeout)
    scrollTimeout = setTimeout(() => {
      const scrollDepth = Math.round((window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100)
      if (scrollDepth > maxScrollDepth) {
        maxScrollDepth = scrollDepth
        trackScroll(scrollDepth)
      }
    }, 1000)
  })
}

async function trackScroll(scrollDepth) {
  if (!visitorId) return

  const clientIP = await getClientIP()

  const payload = {
    event_type: 'scroll',
    scroll_depth: scrollDepth,
    page: window.location.pathname,
    visitor_id: visitorId,
    session_id: sessionId,
    ip_address: clientIP,
    user_agent: navigator.userAgent,
  }

  sendEvent(payload)
}

// ========== BUTTON CLICK TRACKING ==========

function setupButtonTracking() {
  document.addEventListener('click', (e) => {
    const target = e.target.closest('[data-analytics]')
    if (!target) return

    const buttonName = target.getAttribute('data-analytics')
    trackButtonClick(buttonName)
  })
}

export async function trackButtonClick(buttonName) {
  if (!visitorId || !buttonName) return

  const { browser, os } = getBrowserInfo()
  const clientIP = await getClientIP()

  const payload = {
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
  }

  sendEvent(payload)
}

// ========== DOWNLOAD TRACKING ==========

export async function trackDownloadClick(platform) {
  if (!visitorId) return

  const { browser, os } = getBrowserInfo()
  const clientIP = await getClientIP()

  const payload = {
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
  }

  sendEvent(payload)
}

export async function trackInstallerDownload(platform) {
  if (!visitorId) return

  const clientIP = await getClientIP()

  const payload = {
    platform,
    visitor_id: visitorId,
    session_id: sessionId,
    ip_address: clientIP,
    user_agent: navigator.userAgent,
    device_type: getDeviceType(),
    browser: getBrowserInfo().browser,
    os: getBrowserInfo().os,
  }

  try {
    await fetch(`${ANALYTICS_CONFIG.API_BASE}/analytics/track-installer-download`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  } catch (error) {
    if (ANALYTICS_CONFIG.DEBUG) console.warn('Failed to track installer download:', error)
  }
}

export async function trackAppLaunch(platform, version) {
  if (!visitorId) return

  const payload = {
    platform,
    visitor_id: visitorId,
    app_version: version,
  }

  try {
    await fetch(`${ANALYTICS_CONFIG.API_BASE}/analytics/track-app-launch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  } catch (error) {
    if (ANALYTICS_CONFIG.DEBUG) console.warn('Failed to track app launch:', error)
  }
}

// ========== WORKSPACE/DEMO TRACKING ==========

export async function trackFileUpload(fileName, fileSize, fileType, success, duration) {
  if (!visitorId) return

  const payload = {
    visitor_id: visitorId,
    session_id: sessionId,
    file_name: fileName,
    file_size: fileSize,
    file_type: fileType,
    upload_success: success,
    upload_duration: duration,
  }

  try {
    await fetch(`${ANALYTICS_CONFIG.API_BASE}/analytics/track-file-upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  } catch (error) {
    if (ANALYTICS_CONFIG.DEBUG) console.warn('Failed to track file upload:', error)
  }
}

export async function trackQuery(queryLength, responseTime, success) {
  if (!visitorId) return

  const payload = {
    visitor_id: visitorId,
    session_id: sessionId,
    query_length: queryLength,
    response_time: responseTime,
    success,
  }

  try {
    await fetch(`${ANALYTICS_CONFIG.API_BASE}/analytics/track-query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  } catch (error) {
    if (ANALYTICS_CONFIG.DEBUG) console.warn('Failed to track query:', error)
  }
}

// ========== ERROR TRACKING ==========

export async function trackError(errorType, errorMessage, errorStack, page) {
  if (!visitorId) return

  const clientIP = await getClientIP()

  const payload = {
    event_type: errorType, // "console_error", "api_error", "crash"
    visitor_id: visitorId,
    session_id: sessionId,
    error_message: errorMessage,
    error_stack: errorStack,
    page: page || window.location.pathname,
    ip_address: clientIP,
    user_agent: navigator.userAgent,
  }

  try {
    await fetch(`${ANALYTICS_CONFIG.API_BASE}/analytics/track-error`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  } catch (error) {
    if (ANALYTICS_CONFIG.DEBUG) console.warn('Failed to track error:', error)
  }
}

// Setup global error tracking
window.addEventListener('error', (event) => {
  trackError('console_error', event.message, event.error?.stack, window.location.pathname)
})

window.addEventListener('unhandledrejection', (event) => {
  trackError('unhandled_rejection', event.reason?.message || String(event.reason), event.reason?.stack)
})

// ========== SEND EVENT ==========

async function sendEvent(payload) {
  if (!ANALYTICS_CONFIG.ENABLED) return

  try {
    await fetch(`${ANALYTICS_CONFIG.API_BASE}/analytics/track-event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  } catch (error) {
    if (ANALYTICS_CONFIG.DEBUG) console.warn('Failed to send event:', error)
  }
}

// ========== EXPORTS ==========

export { initTracking, trackPageView, trackButtonClick, trackDownloadClick, trackFileUpload, trackQuery, trackError }
