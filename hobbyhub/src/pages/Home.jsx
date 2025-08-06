import { useState } from 'react';
import { posts } from '../data';
import PostCard from '../components/PostCard';
import { Link } from 'react-router-dom';

export default function Home() {
  const [sortBy, setSortBy] = useState('createdAt');
  const [search, setSearch] = useState('');

  const sortedPosts = [...posts]
    .filter(p => p.title.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => sortBy === 'upvotes' ? b.upvotes - a.upvotes : new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <div className="container">
      <h1>HobbyHub</h1>
      <Link to="/create"><button>Create New Post</button></Link>
      <input placeholder="Search by title" value={search} onChange={(e) => setSearch(e.target.value)} />
      <select onChange={(e) => setSortBy(e.target.value)}>
        <option value="createdAt">Newest</option>
        <option value="upvotes">Most Upvoted</option>
      </select>
      {sortedPosts.map(post => <PostCard key={post.id} post={post} />)}
    </div>
  );
}