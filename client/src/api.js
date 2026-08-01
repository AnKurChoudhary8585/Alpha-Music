import axios from 'axios';
import { API_BASE_URL } from './config';

const API = axios.create({ baseURL: `${API_BASE_URL}/api` });

export const fetchSongs = () => API.get('/songs');
export const uploadSong = (formData) => API.post('/songs', formData);

export const searchITunes = async (query) => {
  const res = await axios.get(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&limit=25&entity=song`);
  return res.data.results.map(track => ({
    _id: track.trackId.toString(),
    title: track.trackName,
    artist: track.artistName,
    coverUrl: track.artworkUrl100 ? track.artworkUrl100.replace('100x100bb.jpg', '500x500bb.jpg') : ''
  }));
};