import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import CreatePost from './components/CreatePost';
import PostPage from './components/PostPage';
import EditPost from './components/EditPost';
import './styles.css';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/create" element={<CreatePost />} />
      <Route path="/post/:id" element={<PostPage />} />
      <Route path="/edit/:id" element={<EditPost />} />
    </Routes>
  );
}

export default App;