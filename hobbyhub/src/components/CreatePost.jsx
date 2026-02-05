import { useState, useEffect } from 'react';
import { posts } from '../data';
import { useNavigate, Link } from 'react-router-dom';
import { getCurrentUser } from '../utils/userSession';
import { fullBotCheck, recordSubmission } from '../utils/botProtection';
import { 
  comprehensiveBotCheck, 
  blockFingerprint, 
  isBlockedFingerprint,
  generateDeviceFingerprint,
  logSuspiciousActivity 
} from '../utils/ipBlocking';

export default function CreatePost() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const currentUser = getCurrentUser();
  const navigate = useNavigate();

  useEffect(() => {
    const checkIfBlocked = async () => {
      const fingerprint = generateDeviceFingerprint();
      if (isBlockedFingerprint(fingerprint)) {
        setIsBlocked(true);
        setError('Your device has been temporarily blocked due to suspicious activity. Please try again later.');
      }
    };
    
    checkIfBlocked();
  }, []);

  const isLikelyBot = () => {
    if (honeypot.trim() !== '') {
      console.warn('Honeypot field filled - likely bot');
      return true;
    }

    const spamPatterns = [
      /http|https|www|\.com|\.net|viagra|casino|lottery/gi,
      /click here|buy now|limited offer/gi
    ];
    
    const text = (title + content).toLowerCase();
    if (spamPatterns.some(pattern => pattern.test(text))) {
      setError('Your post contains suspicious content');
      return true;
    }

    if (title.trim().length < 3 || content.trim().length < 10) {
      setError('Title must be at least 3 characters and content at least 10 characters');
      return true;
    }

    return false;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isBlocked) {
      setError('Your device has been blocked. Contact support.');
      return;
    }

    setError('');
    setSubmitting(true);

    try {
      const botCheckResult = fullBotCheck(
        { title, content, honeypot },
        'lastPostSubmit',
        2
      );

      if (botCheckResult.isBot) {
        setError(botCheckResult.errors[0]);
        
        logSuspiciousActivity({
          action: 'create_post_blocked',
          reason: botCheckResult.errors.join('; ')
        });

        setSubmitting(false);
        return;
      }

      const advancedCheck = await comprehensiveBotCheck();
      
      if (advancedCheck.isBotUA) {
        const fingerprint = advancedCheck.fingerprint;
        blockFingerprint(fingerprint, 3600000);
        
        logSuspiciousActivity({
          action: 'create_post_blocked_bot_ua',
          reason: 'Bot user agent detected'
        });

        setError('Bot activity detected. Your device has been temporarily blocked.');
        setSubmitting(false);
        return;
      }

      if (advancedCheck.isBlocked) {
        setIsBlocked(true);
        setError('Your device has been blocked due to previous suspicious activity.');
        setSubmitting(false);
        return;
      }

      const lastSubmit = localStorage.getItem('lastPostSubmit');
      if (lastSubmit && Date.now() - parseInt(lastSubmit) < 2000) {
        setError('Please wait a moment before posting again');
        setSubmitting(false);
        return;
      }

      const newPost = {
        id: Date.now(),
        title,
        content,
        image,
        author: currentUser,
        upvotes: 0,
        createdAt: new Date().toISOString(),
        comments: []
      };
      
      posts.push(newPost);
      localStorage.setItem('lastPostSubmit', Date.now().toString());
      
      navigate('/');
    } catch (err) {
      setError('An error occurred while creating the post');
      logSuspiciousActivity({
        action: 'create_post_error',
        reason: err.message
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container">
      <Link to="/"><button>← Back to Home</button></Link>
      
      <h2>✨ Create a New Post</h2>
      <p>Posted by: <strong>{currentUser}</strong></p>

      {error && <div className="error">{error}</div>}
      {isBlocked && <div className="error">⛔ Your device is temporarily blocked. Please try again later.</div>}

      <form onSubmit={handleSubmit} style={{ opacity: isBlocked ? 0.6 : 1 }}>
        <div>
          <label htmlFor="title">Post Title</label>
          <input 
            id="title"
            required 
            placeholder="What's your hobby about?"
            value={title} 
            onChange={(e) => setTitle(e.target.value)}
            disabled={submitting || isBlocked}
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
            disabled={submitting || isBlocked}
          />
        </div>

        <div>
          <label htmlFor="image">Image URL (optional)</label>
          <input 
            id="image"
            placeholder="https://example.com/image.jpg"
            value={image} 
            onChange={(e) => setImage(e.target.value)}
            disabled={submitting || isBlocked}
          />
        </div>

        <div style={{ display: 'none', visibility: 'hidden' }}>
          <label htmlFor="website">Website</label>
          <input 
            id="website"
            placeholder="Don't fill this"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
            tabIndex="-1"
            autoComplete="off"
          />
        </div>

        <button type="submit" disabled={submitting || isBlocked}>
          {submitting ? '📤 Posting...' : '📤 Post'}
        </button>
      </form>
    </div>
  );
}