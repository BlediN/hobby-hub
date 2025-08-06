import { useState } from 'react';
import { posts } from '../data';
import { useNavigate } from 'react-router-dom';

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
      <h2>Create a New Post</h2>
      <form onSubmit={handleSubmit}>
        <input required placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <textarea placeholder="Content" value={content} onChange={(e) => setContent(e.target.value)} />
        <input placeholder="Image URL" value={image} onChange={(e) => setImage(e.target.value)} />
        <button type="submit">Create</button>
      </form>
    </div>
  );
}