import { Routes, Route, Navigate } from 'react-router-dom';
import { isUserLoggedIn } from './utils/userSession';
import Login from './components/Login';
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
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<ProtectedRoute element={<Home />} />} />
      <Route path="/create" element={<ProtectedRoute element={<CreatePost />} />} />
      <Route path="/post/:id" element={<ProtectedRoute element={<PostPage />} />} />
      <Route path="/edit/:id" element={<ProtectedRoute element={<EditPost />} />} />
      <Route path="/admin" element={<ProtectedRoute element={<AdminDashboard />} />} />
    </Routes>
  );
}

export default App;