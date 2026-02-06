import { Routes, Route, Navigate } from 'react-router-dom';
import { isUserLoggedIn } from './utils/userSession';
import Login from './components/Login';
import LoginPortal from './components/LoginPortal';
import Home from './pages/Home';
import CreatePost from './components/CreatePost';
import PostPage from './components/PostPage';
import EditPost from './components/EditPost';
import AdminDashboard from './components/AdminDashboard';
import './styles.css';

// Protected route component
function ProtectedRoute({ element }) {
  return isUserLoggedIn() ? element : <Navigate to="/login" replace />;
}

function App() {
  const year = new Date().getFullYear();
  return (
    <div className="app-shell">
      <div className="app-content">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/login-portal" element={<LoginPortal />} />
          <Route path="/" element={<ProtectedRoute element={<Home />} />} />
          <Route path="/create" element={<ProtectedRoute element={<CreatePost />} />} />
          <Route path="/post/:id" element={<ProtectedRoute element={<PostPage />} />} />
          <Route path="/edit/:id" element={<ProtectedRoute element={<EditPost />} />} />
          <Route path="/admin" element={<ProtectedRoute element={<AdminDashboard />} />} />
        </Routes>
      </div>
      <footer className="site-footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <h3>Ndoni, B</h3>
            <p>Software Engineer · Located in USA</p>
          </div>
          <div className="footer-links">
            <a className="footer-link" href="mailto:bledi_nd@hotmail.com">
              <span className="footer-icon" aria-hidden="true">✉️</span>
              Email
            </a>
            <a
              className="footer-link"
              href="https://www.linkedin.com/in/bndoni/"
              target="_blank"
              rel="noreferrer"
            >
              <span className="footer-icon" aria-hidden="true">🔗</span>
              LinkedIn
            </a>
            <a className="footer-link" href="https://github.com/BlediN" target="_blank" rel="noreferrer">
              <span className="footer-icon" aria-hidden="true">🐙</span>
              GitHub
            </a>
          </div>
          <div className="footer-meta">
            <p>(c) {year} Ndoni, B. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;