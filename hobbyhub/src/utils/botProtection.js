/**
 * Bot Protection Utilities
 * Provides multiple strategies to prevent automated bot submissions
 */

// Spam keywords that are commonly used in bot attacks
const SPAM_KEYWORDS = [
  'viagra', 'casino', 'lottery', 'poker', 'blackjack', 'roulette',
  'buy now', 'click here', 'limited offer', 'act now', 'buy today',
  'free money', 'make money fast', 'work from home', 'get rich quick',
  'click here now', 'check out', 'hot deals', 'special offer',
  'best price', 'order now', 'call now', 'apply now', 'join now'
];

// URL patterns commonly found in spam
const SPAM_URL_PATTERNS = [
  /http:\/\/|https:\/\//gi,
  /www\./gi,
  /\.tk|\.ml|\.ga|\.cf/gi, // Suspicious TLDs
];

/**
 * Check if content contains spam keywords or patterns
 * @param {string} text - Text to check
 * @returns {boolean} - True if spam detected
 */
export const detectSpamContent = (text) => {
  if (!text) return false;
  
  const lowerText = text.toLowerCase();
  
  // Check for spam keywords
  if (SPAM_KEYWORDS.some(keyword => lowerText.includes(keyword))) {
    return true;
  }
  
  // Check for suspicious URL patterns
  if (SPAM_URL_PATTERNS.some(pattern => pattern.test(text))) {
    return true;
  }
  
  return false;
};

/**
 * Check if submission appears to be from a bot based on behavior patterns
 * @param {object} data - Submission data (title, content, etc.)
 * @returns {object} - { isBot: boolean, reason: string }
 */
export const detectBotBehavior = (data) => {
  const { title = '', content = '', honeypot = '' } = data;
  
  // Honeypot field filled (strong indicator of bot)
  if (honeypot && honeypot.trim() !== '') {
    return { isBot: true, reason: 'Honeypot field filled' };
  }
  
  // Content too short (likely bot or lazy user)
  if (title.trim().length < 3) {
    return { isBot: true, reason: 'Title too short' };
  }
  
  if (content.trim().length < 10) {
    return { isBot: true, reason: 'Content too short' };
  }
  
  // Content too long (likely bot spam copy-paste)
  if (title.length > 300 || content.length > 5000) {
    return { isBot: true, reason: 'Content too long' };
  }
  
  // Check for spam content
  if (detectSpamContent(title) || detectSpamContent(content)) {
    return { isBot: true, reason: 'Spam content detected' };
  }
  
  // Check for excessive special characters or non-ASCII (often used in spam)
  const specialCharRatio = (title + content).match(/[^\w\s\.\,\!\?\-]/g)?.length || 0;
  const totalChars = (title + content).length;
  if (specialCharRatio / totalChars > 0.3) {
    return { isBot: true, reason: 'Suspicious character patterns' };
  }
  
  return { isBot: false, reason: null };
};

/**
 * Implement rate limiting based on localStorage
 * @param {string} key - Key for storing last submission time
 * @param {number} minSeconds - Minimum seconds between submissions
 * @returns {object} - { allowed: boolean, secondsUntilNext: number }
 */
export const checkRateLimit = (key = 'lastSubmission', minSeconds = 2) => {
  const lastSubmit = localStorage.getItem(key);
  const now = Date.now();
  
  if (!lastSubmit) {
    return { allowed: true, secondsUntilNext: 0 };
  }
  
  const lastSubmitTime = parseInt(lastSubmit);
  const timeSinceLastSubmit = (now - lastSubmitTime) / 1000;
  
  if (timeSinceLastSubmit < minSeconds) {
    const secondsUntilNext = Math.ceil(minSeconds - timeSinceLastSubmit);
    return { allowed: false, secondsUntilNext };
  }
  
  return { allowed: true, secondsUntilNext: 0 };
};

/**
 * Record submission time for rate limiting
 * @param {string} key - Key for storing submission time
 */
export const recordSubmission = (key = 'lastSubmission') => {
  localStorage.setItem(key, Date.now().toString());
};

/**
 * Check if user is likely a bot based on multiple factors
 * @param {object} data - Submission data
 * @param {string} rateLimitKey - Key for rate limit check
 * @param {number} minSecondsBetween - Minimum seconds between submissions
 * @returns {object} - { isBot: boolean, errors: string[] }
 */
export const fullBotCheck = (data, rateLimitKey = 'lastSubmission', minSecondsBetween = 2) => {
  const errors = [];
  
  // Check bot behavior patterns
  const behaviorCheck = detectBotBehavior(data);
  if (behaviorCheck.isBot) {
    errors.push(behaviorCheck.reason);
  }
  
  // Check rate limiting
  const rateCheck = checkRateLimit(rateLimitKey, minSecondsBetween);
  if (!rateCheck.allowed) {
    errors.push(`Please wait ${rateCheck.secondsUntilNext} second(s) before posting again`);
  }
  
  return {
    isBot: errors.length > 0,
    errors
  };
};

/**
 * Generate a CSRF token for form submission (simple implementation)
 * In production, this should be generated server-side
 */
export const generateCSRFToken = () => {
  const token = Math.random().toString(36).substring(2, 15) + 
                Math.random().toString(36).substring(2, 15);
  sessionStorage.setItem('csrfToken', token);
  return token;
};

/**
 * Validate CSRF token
 */
export const validateCSRFToken = (token) => {
  const storedToken = sessionStorage.getItem('csrfToken');
  return token === storedToken;
};
