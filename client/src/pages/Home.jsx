import React, { useEffect, useState } from 'react';
import { searchITunes } from '../api';
import { useMusicStore } from '../store';
import { API_BASE_URL } from '../config';

export default function Home() {
  const { songs, setSongs, setCurrentTrack } = useMusicStore();
  const [err, setErr] = useState(null);

  useEffect(() => {
    searchITunes('top hits 2024')
      .then(res => setSongs(res))
      .catch(e => {
        console.error("Could not fetch songs from iTunes", e);
        setErr("Could not fetch songs from iTunes. Please check your connection.");
      });
  }, [setSongs]);

  return (
    <div>
      <h1 style={{marginBottom: '25px'}}>Good Afternoon</h1>
      {err && <p style={{color: 'red'}}>{err}</p>}
      {songs.length === 0 && !err && <p style={{color: 'gray'}}>No songs found. Visit {API_BASE_URL}/api/seed</p>}
      <div className="song-grid">
        {songs.map(song => (
          <div key={song._id} className="card" onClick={() => setCurrentTrack(song)}>
            <img src={song.coverUrl.startsWith('http') ? song.coverUrl : `${API_BASE_URL}${song.coverUrl}`} className="card-img" alt="cover" />
            <h4>{song.title}</h4>
            <p style={{color: 'gray', fontSize: '12px'}}>{song.artist}</p>
          </div>
        ))}
      </div>
    </div>
  );
}