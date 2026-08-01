import axios from 'axios';
import { API_BASE_URL } from './config';

const API = axios.create({ baseURL: `${API_BASE_URL}/api` });

export const fetchSongs = () => API.get('/songs');
export const uploadSong = (formData) => API.post('/songs', formData);

export const searchITunes = async (query) => {
  if (!query) return [];

  // Primary: Fetch Full Songs from JioSaavn 320kbps CDN (Full length 3-5 min MP3s)
  try {
    const res = await axios.get(`https://saavn.dev/api/search/songs?query=${encodeURIComponent(query)}&limit=25`, { timeout: 3000 });
    const results = res.data?.data?.results || res.data?.results;
    if (results && results.length > 0) {
      return results.map(track => {
        const downloadArr = track.downloadUrl || [];
        const bestAudio = downloadArr[4]?.url || downloadArr[3]?.url || downloadArr[2]?.url || downloadArr[0]?.url || '';
        const imageArr = track.image || [];
        const bestImage = imageArr[2]?.url || imageArr[1]?.url || imageArr[0]?.url || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500';
        return {
          _id: track.id || (Date.now() + Math.random()).toString(),
          title: track.name || track.title || 'Untitled',
          artist: track.primaryArtists || track.artist || 'Artist',
          coverUrl: bestImage,
          audioUrl: bestAudio // Full length 320kbps MP3 audio stream!
        };
      });
    }
  } catch (err) {
    console.warn("Saavn search failed, falling back to iTunes...", err);
  }

  // Secondary Fallback: iTunes API
  try {
    const res = await axios.get(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&limit=25&entity=song`, { timeout: 3000 });
    if (res.data?.results) {
      return res.data.results.map(track => ({
        _id: track.trackId.toString(),
        title: track.trackName,
        artist: track.artistName,
        coverUrl: track.artworkUrl100 ? track.artworkUrl100.replace('100x100bb.jpg', '500x500bb.jpg') : '',
        audioUrl: ''
      }));
    }
  } catch (err) {
    console.warn("iTunes fallback failed:", err);
  }

  return [];
};