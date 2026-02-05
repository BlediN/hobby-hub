/**
 * User Session Management
 * Simple username-based system for educational apps
 */

const ADMIN_USERNAME = 'admin';
const TEACHER_USERNAME = 'teacher';
const ADMIN_PASSWORD_KEY = 'adminPassword';

const normalizeUsername = (username) => (username || '').trim().toLowerCase();

const generateRandomPassword = (length = 12) => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%';
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const values = new Uint32Array(length);
    crypto.getRandomValues(values);
    let result = '';
    for (let i = 0; i < values.length; i += 1) {
      result += chars[values[i] % chars.length];
    }
    return result;
  }
  let fallback = '';
  for (let i = 0; i < length; i += 1) {
    fallback += chars[Math.floor(Math.random() * chars.length)];
  }
  return fallback;
};

/**
 * Set current user
 */
export const setCurrentUser = (username) => {
  if (!username || username.trim().length === 0) {
    return false;
  }
  
  const cleanUsername = username.trim().substring(0, 50);
  sessionStorage.setItem('currentUser', cleanUsername);
  return true;
};

/**
 * Get current user
 */
export const getCurrentUser = () => {
  return sessionStorage.getItem('currentUser');
};

/**
 * Check if user is logged in
 */
export const isUserLoggedIn = () => {
  return !!sessionStorage.getItem('currentUser');
};

/**
 * Check if current user is admin
 */
export const isAdminUser = () => {
  const user = getCurrentUser();
  if (!user) return false;
  return normalizeUsername(user) === ADMIN_USERNAME;
};

export const isTeacherUser = () => {
  const user = getCurrentUser();
  if (!user) return false;
  return normalizeUsername(user) === TEACHER_USERNAME;
};

export const isAdminViewer = () => isAdminUser() || isTeacherUser();

/**
 * Logout current user
 */
export const logoutUser = () => {
  sessionStorage.removeItem('currentUser');
};

/**
 * Check if user can edit a post
 * @param {string} postAuthor - Original post author
 * @returns {boolean}
 */
export const canEditPost = (postAuthor) => {
  const currentUser = getCurrentUser();
  if (!currentUser) return false;
  
  // Admin can edit any post (teacher is read-only)
  if (isAdminUser()) return true;
  
  // User can only edit their own posts
  return currentUser.toLowerCase() === postAuthor.toLowerCase();
};

/**
 * Check if user can delete a post
 * @param {string} postAuthor - Original post author
 * @returns {boolean}
 */
export const canDeletePost = (postAuthor) => {
  const currentUser = getCurrentUser();
  if (!currentUser) return false;
  
  // Admin can delete any post (teacher is read-only)
  if (isAdminUser()) return true;
  
  // User can only delete their own posts
  return currentUser.toLowerCase() === postAuthor.toLowerCase();
};

/**
 * Get all unique users who have posted
 */
export const getAllPostAuthors = (posts) => {
  const authors = new Set();
  posts.forEach(post => {
    if (post.author) {
      authors.add(post.author);
    }
  });
  return Array.from(authors).sort();
};

/**
 * Get user's posts
 */
export const getUserPosts = (posts, username) => {
  if (!username) return [];
  return posts.filter(post => 
    post.author && post.author.toLowerCase() === username.toLowerCase()
  );
};

export const ensureAdminPassword = () => {
  const existing = localStorage.getItem(ADMIN_PASSWORD_KEY);
  if (existing) {
    return { created: false };
  }
  const password = generateRandomPassword(12);
  localStorage.setItem(ADMIN_PASSWORD_KEY, password);
  return { created: true, password };
};

export const verifyAdminPassword = (password) => {
  const stored = localStorage.getItem(ADMIN_PASSWORD_KEY);
  if (!stored) return false;
  return password === stored;
};

export const changeAdminPassword = (currentPassword, newPassword) => {
  if (!verifyAdminPassword(currentPassword)) {
    return { ok: false, error: 'Current password is incorrect.' };
  }

  if (!newPassword || newPassword.trim().length < 8) {
    return { ok: false, error: 'New password must be at least 8 characters.' };
  }

  localStorage.setItem(ADMIN_PASSWORD_KEY, newPassword.trim());
  return { ok: true };
};

export const hasAdminPassword = () => {
  return !!localStorage.getItem(ADMIN_PASSWORD_KEY);
};
