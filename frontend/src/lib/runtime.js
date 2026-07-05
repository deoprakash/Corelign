function detectDeviceType() {
  const userAgent = navigator.userAgent.toLowerCase()

  if (/tablet|ipad/.test(userAgent)) {
    return 'tablet'
  }
  if (/mobile|android|iphone|ipod/.test(userAgent)) {
    return 'mobile'
  }
  return 'desktop'
}

function detectBrowser(userAgent) {
  const lower = userAgent.toLowerCase()
  if (lower.includes('firefox')) return 'firefox'
  if (lower.includes('edg/')) return 'edge'
  if (lower.includes('chrome')) return 'chrome'
  if (lower.includes('safari')) return 'safari'
  return 'unknown'
}

function detectOs(userAgent) {
  const lower = userAgent.toLowerCase()
  if (lower.includes('windows')) return 'windows'
  if (lower.includes('mac os')) return 'macos'
  if (lower.includes('android')) return 'android'
  if (lower.includes('linux')) return 'linux'
  if (lower.includes('iphone') || lower.includes('ipad')) return 'ios'
  return 'unknown'
}

export async function getDeviceInfo() {
  const userAgent = navigator.userAgent
  return {
    user_agent: userAgent,
    device_type: detectDeviceType(),
    browser: detectBrowser(userAgent),
    os: detectOs(userAgent),
    platform: navigator.platform,
    language: navigator.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    screen: {
      width: window.screen.width,
      height: window.screen.height,
      pixel_ratio: window.devicePixelRatio,
    },
  }
}
