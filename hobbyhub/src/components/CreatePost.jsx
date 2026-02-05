import { useState } from 'react';
import { posts } from '../data';
import { useNavigate, Link } from 'react-router-dom';

export default function CreatePost() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const newPost = {
      id: Date.now(),
      title,
      content,
      image,
      upvotes: 0,
      createdAt: new Date().toISOString(),
      comments: []
    };
    posts.push(newPost);
    navigate('/');
  };

  return (
    <div className="container">
      <Link to="/"><button>← Back to Home</button></Link>
      
      <h2>✨ Create a New Post</h2>
      <p>Share your hobby with the community!</p>

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="title">Post Title</label>
          <input 
            id="title"
            required 
            placeholder="What's your hobby about?"
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
          />
        </div>

        <div>
          <label htmlFor="content">Content</label>
          <textarea 
            id="content"
            placeholder="Share your thoughts, tips, and experiences about your hobby..."
            value={content} 
            onChange={(e) => setContent(e.target.value)}
            rows="6"
          />
        </div>

        <div>
          <label htmlFor="image">Image URL (optional)</label>
          <input 
            id="image"
            placeholder="https://example.com/image.jpg"
            value={image} 
            onChange={(e) => setImage(e.target.value)} 
          />
        </div>

        <button type="submit">📤 Post</button>
      </form>
    </div>
  );
}