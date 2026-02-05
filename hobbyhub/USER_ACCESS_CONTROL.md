# User Access Control Guide

This guide explains the new user authentication and post ownership system implemented in HobbyHub for educational environments.

## 🔐 System Overview

HobbyHub now uses a **simple username-based system** with **post ownership** to control who can edit/delete posts.

### Key Features:
- ✅ Simple login (username only, no password)
- ✅ User sessions (logged in per browser)
- ✅ Post ownership (track who created each post)
- ✅ Edit/delete permissions (only author or admin)
- ✅ Admin access (special privileges)
- ✅ User management dashboard

---

## 👤 User Roles

### **Regular User**
- Can create posts
- Can edit **only their own posts**
- Can delete **only their own posts**
- Can upvote any post
- Can comment on any post
- Cannot access admin panel

Example:
```
User: "john_doe"
Posts by john_doe: Can edit ✅ Can delete ✅
Posts by others: Can't edit ❌ Can't delete ❌
```

### **Admin User**
- Can create posts
- Can edit **any post**
- Can delete **any post**
- Can upvote any post
- Can comment on any post
- **Can access admin dashboard**
- View all users and activity
- Manage suspicious activity logs
- View blocked fingerprints
- Delete any post from dashboard

**Admin Usernames:**
```
- admin
- teacher
- instructor
```

---

## 🔄 Flow Diagram

```
User Opens App
    ↓
[Check: Is logged in?]
    ├─ NO → Redirect to /login
    │       User enters username
    │       Username stored in sessionStorage
    │       Redirect to Home
    │
    └─ YES → Show Home with posts
```

```
User Creates Post
    ↓
[Post created with author field]
Post object:
{
  id: 1707138000000,
  title: "My Hobby",
  content: "Content here...",
  author: "john_doe",        ← Current user
  upvotes: 0,
  createdAt: "2026-02-05...",
  comments: []
}
```

```
User Views Post
    ↓
[Check: Can this user edit/delete?]
    ├─ User is author? YES → Show Edit & Delete buttons ✅
    ├─ User is admin? YES → Show Edit & Delete buttons ✅
    └─ Neither? → Hide Edit & Delete buttons, show info ℹ️
```

```
User Tries to Edit Post
    ↓
[Check: canEditPost(postAuthor)]
    ├─ Not logged in? → Redirect to login
    ├─ Not author & not admin? → Show "Access Denied" page
    └─ Is author or admin? → Show edit form ✅
```

---

## 💾 How Data is Stored

### **User Session (sessionStorage)**
```javascript
// When user logs in:
sessionStorage.setItem('currentUser', 'john_doe');

// When checking who's logged in:
const currentUser = sessionStorage.getItem('currentUser');

// When logging out:
sessionStorage.removeItem('currentUser');
```

**Why sessionStorage?**
- ✅ Cleared when browser tab closes
- ✅ Only accessible to current tab
- ✅ Perfect for educational settings
- ❌ Not persistent (logs out on refresh)

### **Post Data Structure**
```javascript
{
  id: 1707138000000,
  title: "String",
  content: "String",
  image: "URL",
  author: "username",           // ← NEW: Track author
  upvotes: 0,
  createdAt: "ISO Date",
  comments: ["comment1", ...]
}
```

---

## 🔧 Component Changes

### **1. Login.jsx (NEW)**
**Purpose:** First page users see, get their username

```jsx
// User enters username
// Username validation:
// - Must be 2-50 characters
// - Only alphanumeric, underscore, dash
// - Stored in sessionStorage

// Special usernames with admin access:
if (['admin', 'teacher', 'instructor'].includes(username)) {
  // Grant admin privileges
}
```

### **2. CreatePost.jsx (UPDATED)**
**Added:**
- Get current user: `const currentUser = getCurrentUser();`
- Add author to post: `author: currentUser`
- Show "Posted by: {currentUser}"

```jsx
const newPost = {
  id: Date.now(),
  title,
  content,
  image,
  author: currentUser,    // ← NEW
  upvotes: 0,
  createdAt: new Date().toISOString(),
  comments: []
};
```

### **3. PostCard.jsx (UPDATED)**
**Added:**
- Display author: `👤 {post.author}`
- Show author and date together

```jsx
<div>
  👤 <strong>{post.author || 'Anonymous'}</strong> • 📅 {date}
</div>
```

### **4. PostPage.jsx (UPDATED)**
**Added:**
- Check edit permission: `const canEdit = canEditPost(post.author);`
- Check delete permission: `const canDelete = canDeletePost(post.author);`
- Show author info prominently
- Conditionally show Edit/Delete buttons
- Show info message if not author

```jsx
// Only show Edit button if user can edit
{canEdit && (
  <button onClick={() => navigate(`/edit/${post.id}`)}>
    ✏️ Edit
  </button>
)}

// Only show Delete button if user can delete
{canDelete && (
  <button onClick={handleDelete}>
    🗑️ Delete
  </button>
)}

// Show info if post belongs to someone else
{!canEdit && post.author !== currentUser && (
  <div>ℹ️ Only {post.author} can edit this post</div>
)}
```

### **5. EditPost.jsx (UPDATED)**
**Added:**
- Check permission before showing form
- If user can't edit → Show "Access Denied" page
- Only show form if authorized

```jsx
if (!canEditPost(post.author)) {
  return (
    <div>
      <h2>❌ Access Denied</h2>
      <p>You cannot edit {post.author}'s post</p>
    </div>
  );
}

// Only show form if authorized
return (
  <form onSubmit={handleUpdate}>
    {/* Form fields */}
  </form>
);
```

### **6. Home.jsx (UPDATED)**
**Added:**
- Show current user: `👤 Logged in as: {currentUser}`
- Show admin badge if admin
- Add logout button
- Link to admin panel if admin

```jsx
<p>
  👤 Logged in as: <strong>{currentUser}</strong>
  {isAdmin() && <span>⭐ Admin</span>}
</p>

<button onClick={handleLogout}>🚪 Logout</button>

{isAdmin() && (
  <Link to="/admin"><button>⚙️ Admin</button></Link>
)}
```

### **7. AdminDashboard.jsx (UPDATED)**
**Now shows:**
- ✅ All users and their activity
- ✅ All posts with delete capability
- ✅ Suspicious activity logs
- ✅ Blocked fingerprints
- ✅ Statistics (users, posts, upvotes)
- ✅ User/Admin access check

```jsx
// Only admins can access
if (!isAdmin()) {
  return <div>❌ Access Denied</div>;
}

// Show tabs:
// - Users: List all users, their posts, upvotes
// - Posts: All posts with delete buttons
// - Activity: Suspicious activity logs
// - Blocked: Blocked fingerprints
```

### **8. App.jsx (UPDATED)**
**Added:**
- Login route: `/login`
- ProtectedRoute component (redirects to login if not authenticated)
- Admin route protection

```jsx
function ProtectedRoute({ element }) {
  return isUserLoggedIn() ? element : <Navigate to="/login" />;
}

<Routes>
  <Route path="/login" element={<Login />} />
  <Route path="/" element={<ProtectedRoute element={<Home />} />} />
  <Route path="/admin" element={<ProtectedRoute element={<AdminDashboard />} />} />
  {/* All other routes also protected */}
</Routes>
```

---

## 🔑 Utility Functions

**File:** `src/utils/userSession.js`

### **setCurrentUser(username)**
```javascript
import { setCurrentUser } from '../utils/userSession';

setCurrentUser('john_doe'); // Login user
// Stores in sessionStorage
```

### **getCurrentUser()**
```javascript
const user = getCurrentUser();
// Returns: "john_doe" or null
```

### **isUserLoggedIn()**
```javascript
if (isUserLoggedIn()) {
  // User is logged in
}
```

### **isAdmin()**
```javascript
if (isAdmin()) {
  // Current user is admin
  // Show admin features
}
```

### **canEditPost(postAuthor)**
```javascript
if (canEditPost('john_doe')) {
  // Can edit john_doe's post
  // True if: current user IS john_doe OR current user is admin
}
```

### **canDeletePost(postAuthor)**
```javascript
if (canDeletePost('john_doe')) {
  // Can delete john_doe's post
  // True if: current user IS john_doe OR current user is admin
}
```

### **logoutUser()**
```javascript
logoutUser(); // Clear session, redirect to /login
```

---

## 📊 Usage Examples

### **Example 1: Regular User Creating Post**
```
1. User "alice" logs in
2. Alice clicks "Create New Post"
3. Fills form with title, content, image
4. Clicks "Post"
5. Post created with author: "alice"
6. Alice sees post with Edit & Delete buttons ✅
7. Bob sees same post with NO Edit & Delete buttons ❌
8. Bob sees: "ℹ️ Only alice can edit this post"
```

### **Example 2: Admin Managing Posts**
```
1. Admin "teacher" logs in
2. Admin clicks "⚙️ Admin" button in top right
3. Goes to admin dashboard
4. Sees tabs: Users, Posts, Activity, Blocked
5. Clicks "Posts" tab
6. Sees ALL posts from ALL users
7. Can delete any post using 🗑️ button
8. Can see author, upvotes, date
```

### **Example 3: User Access Denied**
```
1. User "alice" creates post
2. User "bob" views alice's post
3. Bob clicks "Edit" button (not visible) ❌
4. Bob manually goes to /edit/123
5. EditPost component checks: canEditPost("alice")?
6. Current user is "bob", post author is "alice"
7. Bob is not admin
8. Result: "❌ Access Denied - You can't edit alice's post"
9. Bob shown go-back button
```

---

## 🛡️ Security Notes

**Good for educational settings:**
- ✅ Simple to understand
- ✅ No complex authentication
- ✅ Clear ownership tracking
- ✅ Admin oversight available

**Limitations:**
- ❌ No real password security (not intended)
- ❌ Session lost on page refresh
- ❌ Can't truly verify identity (educational only)
- ❌ No account recovery
- ❌ No email verification

**For production, add:**
1. Real authentication (passwords/OAuth)
2. Persistent sessions (database)
3. Password hashing
4. Rate limiting on login
5. Email verification
6. Session tokens/JWT
7. CSRF protection

---

## 🎯 Best Practices for Teachers

### **Setup:**
1. Tell students to use their real names or initials
2. Use "teacher" or "instructor" username for demonstrations
3. Explain post ownership to students

### **Management:**
1. Check admin dashboard regularly
2. Monitor suspicious activity logs
3. Delete inappropriate posts immediately
4. Explain consequences of rule violations

### **Teaching:**
1. Show students their own posts
2. Explain edit/delete restrictions
3. Demonstrate admin dashboard
4. Discuss digital responsibility

---

## 🔄 Session Behavior

### **How Sessions Work**
```
1. User opens app in NEW TAB
   → No session → Redirect to /login
   → User enters username
   → Stored in that TAB's sessionStorage

2. User opens app in SECOND TAB (SAME BROWSER)
   → Separate sessionStorage
   → No session → Redirect to /login again
   → Both tabs have separate sessions

3. User refreshes page
   → Session lost (sessionStorage cleared)
   → Redirected to /login

4. User closes browser tab
   → Session lost for that tab
```

### **Why Use sessionStorage?**
For educational purposes:
- Clean login each class
- No accidental data persistence
- Clear separation between users
- Forces login discipline

---

## ❓ FAQ

**Q: Can I use the same username twice?**
A: Yes, each browser tab has its own session. But in practice, only one per device.

**Q: What if a student forgets to logout?**
A: They need to close the browser tab or refresh. Session doesn't persist.

**Q: How do I become admin?**
A: Only use usernames: "admin", "teacher", "instructor"

**Q: Can I change password?**
A: No passwords - just enter different username (new login)

**Q: Why refresh logs me out?**
A: sessionStorage is cleared on refresh. Use localStorage for persistence if needed.

**Q: Can I recover deleted posts?**
A: No - current app doesn't have soft deletes. Admin can only delete, not restore.

**Improvement option:** Add soft deletes (archive instead of delete)

---

## 🚀 Future Enhancements

- [ ] Soft deletes (archive posts instead of deleting)
- [ ] Post edit history (see changes over time)
- [ ] User profiles (see all posts by a user)
- [ ] Approval system (teacher approves before posting)
- [ ] Comments moderation (teacher can delete comments)
- [ ] Robust authentication (optional for advanced classes)
- [ ] Export class activity as report

---

## 📋 Summary Table

| Feature | Regular User | Admin |
|---------|-------------|-------|
| Create posts | ✅ | ✅ |
| Edit own posts | ✅ | ✅ |
| Edit others' posts | ❌ | ✅ |
| Delete own posts | ✅ | ✅ |
| Delete others' posts | ❌ | ✅ |
| Admin dashboard | ❌ | ✅ |
| Manage users | ❌ | ✅ |
| View activity logs | ❌ | ✅ |
| Delete posts from admin | ❌ | ✅ |

---

Questions? Check the code or contact your instructor!
