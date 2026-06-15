import React from 'react';
import { useMusicStore } from '../store';
import { API_BASE_URL } from '../config';

export default function LikedSongs() {
  const { likedSongs, setCurrentTrack } = useMusicStore();

  return (
    <div>
      <h1 style={{ marginBottom: '25px' }}>Liked Songs</h1>
      {likedSongs?.length === 0 ? (
        <p style={{ color: 'gray' }}>You haven't liked any songs yet.</p>
      ) : (
        <div className="song-grid">
          {likedSongs?.map(song => (
            <div key={song._id} className="card" onClick={() => setCurrentTrack(song)}>
              <img src={song.coverUrl.startsWith('http') ? song.coverUrl : `${API_BASE_URL}${song.coverUrl}`} className="card-img" alt="cover" />
              <h4>{song.title}</h4>
              <p style={{color: 'gray', fontSize: '12px'}}>{song.artist}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
