/**
 * IP Blocking and Bot Detection Logging
 * Works with GitHub Pages by using client-side storage and optional Firebase backend
 */

/**
 * Store blocked fingerprint locally
 * @param {string} fingerprint - Device/bot fingerprint
 * @param {number} durationMs - How long to block (default: 1 hour)
 */
export const blockFingerprint = (fingerprint, durationMs = 3600000) => {
  const blockedList = JSON.parse(localStorage.getItem('blockedFingerprints') || '[]');
  
  const entry = {
    fingerprint,
    blockedAt: Date.now(),
    expiresAt: Date.now() + durationMs,
    reason: 'Bot detection'
  };
  
  blockedList.push(entry);
  localStorage.setItem('blockedFingerprints', JSON.stringify(blockedList));
  
  console.warn(`Fingerprint blocked: ${fingerprint}`);
};

/**
 * Check if fingerprint is currently blocked
 */
export const isBlockedFingerprint = (fingerprint) => {
  const blockedList = JSON.parse(localStorage.getItem('blockedFingerprints') || '[]');
  const now = Date.now();
  
  // Remove expired entries
  const activeBlocks = blockedList.filter(entry => entry.expiresAt > now);
  localStorage.setItem('blockedFingerprints', JSON.stringify(activeBlocks));
  
  return activeBlocks.some(entry => entry.fingerprint === fingerprint);
};

/**
 * Generate device fingerprint (simulates IP-like identification)
 * Uses browser properties to identify unique devices
 */
export const generateDeviceFingerprint = () => {
  const components = [
    navigator.userAgent,
    navigator.language,
    new Date().getTimezoneOffset(),
    screen.width + 'x' + screen.height,
    navigator.hardwareConcurrency || 'unknown'
  ];
  
  // Simple hash function
  let hash = 0;
  const str = components.join('|');
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  return Math.abs(hash).toString(16);
};

/**
 * Log suspicious activity for review
 * Can optionally send to Firebase or backend
 */
export const logSuspiciousActivity = (data) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    fingerprint: generateDeviceFingerprint(),
    userAgent: navigator.userAgent,
    url: window.location.href,
    ...data
  };
  
  // Store locally for debugging
  const logs = JSON.parse(localStorage.getItem('suspiciousActivityLogs') || '[]');
  logs.push(logEntry);
  
  // Keep only last 100 entries
  if (logs.length > 100) {
    logs.shift();
  }
  localStorage.setItem('suspiciousActivityLogs', JSON.stringify(logs));
  
  console.warn('Suspicious activity logged:', logEntry);
  
  // Optionally send to Firebase (see Firebase integration below)
  sendToFirebaseAnalytics(logEntry);
};

/**
 * Send bot detection data to Firebase
 * Requires Firebase SDK to be installed
 */
export const sendToFirebaseAnalytics = (data) => {
  try {
    // Check if Firebase is available
    if (typeof window.firebase !== 'undefined') {
      // Log custom event to Firebase Analytics
      window.firebase.analytics().logEvent('bot_detected', {
        reason: data.reason || 'unknown',
        timestamp: data.timestamp,
        url: data.url
      });
    }
  } catch (err) {
    console.log('Firebase not available'); // Silent fail, not critical
  }
};

/**
 * Check if user agent looks like a bot
 */
export const detectBotUserAgent = () => {
  const botPatterns = [
    /bot|crawler|spider|scraper|curl|wget|python|java(?!script)|perl|ruby|php|asp|node|requests|http-client|axios/i,
    /headless|phantom|selenuim|playwright|puppeteer|nightmarejs/i,
    /googlebot|bingbot|slurp|duckduckbot|baiduspider|yandexbot|sogoubot|exabot/i
  ];
  
  const userAgent = navigator.userAgent;
  return botPatterns.some(pattern => pattern.test(userAgent));
};

/**
 * Advanced fingerprinting with multiple factors
 */
export const getAdvancedFingerprint = async () => {
  const fingerprint = {
    basic: generateDeviceFingerprint(),
    userAgent: navigator.userAgent,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: navigator.language,
    platform: navigator.platform,
    cookiesEnabled: navigator.cookieEnabled,
    doNotTrack: navigator.doNotTrack,
    maxTouchPoints: navigator.maxTouchPoints,
    vendor: navigator.vendor,
    hardwareConcurrency: navigator.hardwareConcurrency,
    deviceMemory: navigator.deviceMemory,
    screen: {
      width: screen.width,
      height: screen.height,
      colorDepth: screen.colorDepth,
      pixelDepth: screen.pixelDepth
    }
  };
  
  // Canvas fingerprinting (detects headless browsers)
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#f60';
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = '#069';
    ctx.fillText('BrowserID', 2, 15);
    fingerprint.canvas = canvas.toDataURL();
  } catch (e) {
    // Headless browser detected
    fingerprint.canvas = 'HEADLESS_BROWSER';
  }
  
  // WebGL fingerprinting
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    fingerprint.webgl = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
  } catch (e) {
    fingerprint.webgl = 'UNAVAILABLE';
  }
  
  return fingerprint;
};

/**
 * Comprehensive bot detection including IP simulation
 */
export const comprehensiveBotCheck = async () => {
  const fingerprint = generateDeviceFingerprint();
  const advancedFingerprint = await getAdvancedFingerprint();
  
  const checks = {
    isBotUA: detectBotUserAgent(),
    isBlocked: isBlockedFingerprint(fingerprint),
    hasCanvasIssue: advancedFingerprint.canvas === 'HEADLESS_BROWSER',
    hasWebGLIssue: advancedFingerprint.webgl === 'UNAVAILABLE',
    fingerprint,
    advancedFingerprint
  };
  
  if (checks.isBotUA || checks.hasCanvasIssue || checks.hasWebGLIssue) {
    logSuspiciousActivity({
      reason: 'Advanced bot detection triggered',
      ...checks
    });
  }
  
  return checks;
};

/**
 * Get all suspicious activity logs (for admin review)
 */
export const getSuspiciousActivityLogs = () => {
  return JSON.parse(localStorage.getItem('suspiciousActivityLogs') || '[]');
};

/**
 * Get all blocked fingerprints (for admin review)
 */
export const getBlockedFingerprints = () => {
  const blocked = JSON.parse(localStorage.getItem('blockedFingerprints') || '[]');
  const now = Date.now();
  
  // Return only active blocks
  return blocked.filter(entry => entry.expiresAt > now);
};

/**
 * Clear all logs (admin function)
 */
export const clearAllLogs = () => {
  localStorage.removeItem('suspiciousActivityLogs');
  localStorage.removeItem('blockedFingerprints');
  console.log('Cleared all bot detection logs');
};

/**
 * Export logs as JSON for analysis
 */
export const exportLogsAsJSON = () => {
  const logs = getSuspiciousActivityLogs();
  const blocked = getBlockedFingerprints();
  
  const data = {
    exportDate: new Date().toISOString(),
    suspiciousActivity: logs,
    blockedFingerprints: blocked
  };
  
  return JSON.stringify(data, null, 2);
};
