import express from 'express';
import * as crypto from 'crypto';
import User from './models/User.js';
import { getSongs, uploadSong } from './controllers.js';

const router = express.Router();

router.get('/songs', getSongs);
router.post('/songs/upload', uploadSong);

router.get('/yt-search', async (req, res) => {
  try {
    // using node fetch (available in Node 18+)
    const response = await fetch(`https://www.youtube.com/results?search_query=${encodeURIComponent(req.query.q)}`);
    const html = await response.text();
    const match = html.match(/watch\?v=([a-zA-Z0-9_-]{11})/) || html.match(/"videoId":"([a-zA-Z0-9_-]{11})"/);
    if (match) {
      res.json({ videoId: match[1] });
    } else {
      res.status(404).json({ error: 'Not found in HTML' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/seed', async (req, res) => {
  try {
    const Song = (await import('./models/Song.js')).default;
    await Song.deleteMany({});
    const sampleSongs = [
      { title: 'Coding Lo-Fi', artist: 'Focus beats', audioUrl: '/uploads/audio/dummy1.mp3', coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=500&q=60' },
      { title: 'Daily Mix 1', artist: 'Based on your taste', audioUrl: '/uploads/audio/dummy2.mp3', coverUrl: 'https://images.unsplash.com/photo-1621360811054-03a0889816d9?auto=format&fit=crop&w=500&q=60' },
      { title: 'Bollywood Hits', artist: 'Trending now', audioUrl: '/uploads/audio/dummy3.mp3', coverUrl: 'https://images.unsplash.com/photo-1493225457124-a1a2a44bb48b?auto=format&fit=crop&w=500&q=60' },
      { title: 'Discover Weekly', artist: 'New music for you', audioUrl: '/uploads/audio/dummy4.mp3', coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=500&q=60' }
    ];
    await Song.insertMany(sampleSongs);
    res.json({ message: 'Seeded successfully', sampleSongs });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/auth/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username and password required' });
    
    const existing = await User.findOne({ username });
    if (existing) return res.status(400).json({ error: 'Username already exists' });
    
    const salt = crypto.randomBytes(16).toString('hex');
    const hashedPassword = crypto.scryptSync(password, salt, 64).toString('hex');
    
    const token = crypto.randomBytes(32).toString('hex');
    const user = new User({ username, password: `${salt}:${hashedPassword}`, token });
    await user.save();
    
    res.json({ token, user: { username: user.username, likedSongs: user.likedSongs, playlists: user.playlists } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });
    
    const [salt, key] = user.password.split(':');
    const hashedBuffer = crypto.scryptSync(password, salt, 64);
    
    const keyBuffer = Buffer.from(key, 'hex');
    if (!crypto.timingSafeEqual(hashedBuffer, keyBuffer)) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    
    const token = crypto.randomBytes(32).toString('hex');
    user.token = token;
    await user.save();
    
    res.json({ token, user: { username: user.username, likedSongs: user.likedSongs, playlists: user.playlists } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/auth/sync', async (req, res) => {
  try {
    const { token, likedSongs, playlists } = req.body;
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    
    const user = await User.findOne({ token });
    if (!user) return res.status(401).json({ error: 'Invalid token' });
    
    if (likedSongs) user.likedSongs = likedSongs;
    if (playlists) user.playlists = playlists;
    await user.save();
    
    res.json({ message: 'Synced successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/auth/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    
    const user = await User.findOne({ token });
    if (!user) return res.status(401).json({ error: 'Invalid token' });
    
    res.json({ user: { username: user.username, likedSongs: user.likedSongs, playlists: user.playlists } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;