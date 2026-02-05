// import { useParams, useNavigate } from 'react-router-dom';
// import { posts } from '../data';
// import { useState } from 'react';

// export default function PostPage() {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const post = posts.find(p => p.id === Number(id));
//   const [comment, setComment] = useState('');

//   if (!post) {
//     return (
//       <div className="container">
//         <h2>Post not found</h2>
//         <button onClick={() => navigate('/')}>Go Home</button>
//       </div>
//     );
//   }

//   const handleUpvote = () => {
//     post.upvotes += 1;
//     navigate(0);
//   };

//   const handleComment = () => {
//     if (comment.trim()) {
//       post.comments.push(comment);
//       setComment('');
//       navigate(0);
//     }
//   };

//   const handleDelete = () => {
//     const index = posts.findIndex(p => p.id === post.id);
//     posts.splice(index, 1);
//     navigate('/');
//   };

//   return (
//     <div className="container">
//       <h2>{post.title}</h2>
//       <p>{post.content}</p>

//       {post.image && post.image.startsWith('http') ? (
//         <img
//           src={post.image}
//           alt="Post"
//           width="300"
//           onError={(e) => {
//             e.target.onerror = null;
//             e.target.style.display = 'none';
//           }}
//         />
//       ) : (
//         <p>No image available</p>
//       )}

//       <p>Upvotes: {post.upvotes}</p>
//       <button onClick={handleUpvote}>Upvote</button>
//       <button onClick={() => navigate(`/edit/${post.id}`)}>Edit</button>
//       <button onClick={handleDelete}>Delete</button>

//       <h3>Comments</h3>
//       <ul>
//         {post.comments.map((c, i) => (
//           <li key={i}>{c}</li>
//         ))}
//       </ul>
//       <input
//         value={comment}
//         onChange={(e) => setComment(e.target.value)}
//         placeholder="Add comment"
//       />
//       <button onClick={handleComment}>Comment</button>
//     </div>
//   );
// }


// import { useParams, useNavigate } from 'react-router-dom';
// import { posts } from '../data';
// import { useState } from 'react';

// export default function PostPage() {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const post = posts.find(p => p.id === Number(id));

//   const [upvotes, setUpvotes] = useState(post?.upvotes || 0);
//   const [comments, setComments] = useState(post?.comments || []);
//   const [comment, setComment] = useState('');

//   if (!post) {
//     return (
//       <div className="container">
//         <h2>Post not found</h2>
//         <button onClick={() => navigate('/')}>Go Home</button>
//       </div>
//     );
//   }

//   const handleUpvote = () => {
//     post.upvotes += 1;
//     setUpvotes(post.upvotes); // trigger re-render
//   };

//   const handleComment = () => {
//     if (comment.trim()) {
//       post.comments.push(comment);
//       setComments([...post.comments]); // trigger re-render
//       setComment('');
//     }
//   };

//   const handleDelete = () => {
//     const index = posts.findIndex(p => p.id === post.id);
//     posts.splice(index, 1);
//     navigate('/');
//   };

//   return (
//     <div className="container">
//       <h2>{post.title}</h2>
//       <p>{post.content}</p>

//       {post.image && post.image.startsWith('http') ? (
//         <img
//           src={post.image}
//           alt="Post"
//           width="300"
//           onError={(e) => {
//             e.target.onerror = null;
//             e.target.style.display = 'none';
//           }}
//         />
//       ) : (
//         <p>No image available</p>
//       )}

//       <p>Upvotes: {upvotes}</p>
//       <button onClick={handleUpvote}>Upvote</button>
//       <button onClick={() => navigate(`/edit/${post.id}`)}>Edit</button>
//       <button onClick={handleDelete}>Delete</button>

//       <h3>Comments</h3>
//       <ul>
//         {comments.map((c, i) => (
//           <li key={i}>{c}</li>
//         ))}
//       </ul>
//       <input
//         value={comment}
//         onChange={(e) => setComment(e.target.value)}
//         placeholder="Add comment"
//       />
//       <button onClick={handleComment}>Comment</button>
//     </div>
//   );
// }




import { useParams, useNavigate } from 'react-router-dom';
import { posts } from '../data';
import { useState } from 'react';
import { getCurrentUser, canEditPost, canDeletePost } from '../utils/userSession';
import { fullBotCheck, recordSubmission } from '../utils/botProtection';

export default function PostPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const post = posts.find(p => p.id === Number(id));

  const [upvotes, setUpvotes] = useState(post?.upvotes || 0);
  const [comments, setComments] = useState(post?.comments || []);
  const [comment, setComment] = useState('');
  const [commentError, setCommentError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!post) {
    return (
      <div className="container">
        <h2>Post not found</h2>
        <button onClick={() => navigate('/')}>← Back to Posts</button>
      </div>
    );
  }

  const handleUpvote = () => {
    post.upvotes += 1;
    setUpvotes(post.upvotes);
  };

  const handleComment = (e) => {
    e.preventDefault();
    setCommentError('');
    setSubmitting(true);

    try {
      const botCheck = fullBotCheck(
        { title: 'Comment', content: comment, honeypot: '' },
        'lastCommentSubmit',
        1
      );

      if (botCheck.isBot) {
        setCommentError(botCheck.errors[0]);
        setSubmitting(false);
        return;
      }

      if (comment.trim().length < 2) {
        setCommentError('Comment must be at least 2 characters');
        setSubmitting(false);
        return;
      }

      if (comment.trim().length > 500) {
        setCommentError('Comment must be less than 500 characters');
        setSubmitting(false);
        return;
      }

      post.comments.push(comment);
      setComments([...post.comments]);
      setComment('');
      recordSubmission('lastCommentSubmit');
    } catch (err) {
      setCommentError('Error posting comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = () => {
    if (!canDeletePost(post.author)) {
      alert('You do not have permission to delete this post');
      return;
    }

    if (window.confirm('Are you sure you want to delete this post? This cannot be undone.')) {
      const index = posts.findIndex(p => p.id === post.id);
      posts.splice(index, 1);
      navigate('/');
    }
  };

  const canEdit = canEditPost(post.author);
  const canDelete = canDeletePost(post.author);

  return (
    <div className="container post-page">
      <button onClick={() => navigate('/')}>← Back to Posts</button>

      <h2>{post.title}</h2>
      
      <div style={{
        padding: '1rem',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        borderRadius: '8px',
        marginBottom: '1.5rem'
      }}>
        👤 <strong>{post.author || 'Anonymous'}</strong> • 📅 {new Date(post.createdAt).toLocaleDateString()}
      </div>

      {post.image && post.image.startsWith('http') ? (
        <img
          src={post.image}
          alt="Post"
          onError={(e) => {
            e.target.onerror = null;
            e.target.style.display = 'none';
          }}
        />
      ) : null}

      <p>{post.content}</p>

      <div className="post-meta">
        <div className="post-meta-item">
          <span className="post-meta-label">Upvotes</span>
          <span className="post-meta-value">👍 {upvotes}</span>
        </div>
        <div className="post-meta-item">
          <span className="post-meta-label">Created</span>
          <span className="post-meta-value">{new Date(post.createdAt).toLocaleDateString()}</span>
        </div>
      </div>

      <div className="button-group">
        <button onClick={handleUpvote}>👍 Upvote ({upvotes})</button>
        {canEdit && (
          <button onClick={() => navigate(`/edit/${post.id}`)}>✏️ Edit</button>
        )}
        {canDelete && (
          <button onClick={handleDelete} style={{backgroundColor: '#ef4444'}}>🗑️ Delete</button>
        )}
      </div>

      {!canEdit && post.author && post.author !== currentUser && (
        <div style={{
          padding: '0.8rem',
          backgroundColor: 'rgba(107, 114, 128, 0.2)',
          borderRadius: '6px',
          fontSize: '0.9rem',
          marginTop: '1rem'
        }}>
          ℹ️ Only <strong>{post.author}</strong> can edit this post
        </div>
      )}

      <div className="comments-section">
        <h3>💬 Comments ({comments.length})</h3>
        {comments.length > 0 ? (
          comments.map((c, i) => (
            <div key={i} className="comment">
              <p>{c}</p>
            </div>
          ))
        ) : (
          <p>No comments yet. Be the first to comment!</p>
        )}

        {commentError && <div className="error" style={{ marginTop: '1rem' }}>{commentError}</div>}

        <form onSubmit={handleComment} className="mt-2">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add your comment here..."
            rows="3"
            disabled={submitting}
          />
          <small style={{ color: '#888' }}>{comment.length}/500 characters</small>
          <button type="submit" disabled={submitting}>
            {submitting ? '💬 Posting...' : '💬 Post Comment'}
          </button>
        </form>
      </div>
    </div>
  );
}
