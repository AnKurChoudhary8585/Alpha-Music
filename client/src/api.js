import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000/api' });

export const fetchSongs = () => API.get('/songs');
export const uploadSong = (formData) => API.post('/songs', formData);

export const searchITunes = async (query) => {
  const res = await axios.get(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&limit=25&entity=song`);
  return res.data.results.filter(t => t.previewUrl).map(track => ({
    _id: track.trackId.toString(),
    title: track.trackName,
    artist: track.artistName,
    coverUrl: track.artworkUrl100.replace('100x100bb.jpg', '500x500bb.jpg'),
    audioUrl: track.previewUrl
  }));
};