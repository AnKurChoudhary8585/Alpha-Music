import React from 'react';
import { useMusicStore } from '../store';
import { API_BASE_URL } from '../config';

export default function Library() {
  const { playlists, setCurrentTrack } = useMusicStore();

  return (
    <div>
      <h1 style={{ marginBottom: '25px' }}>Your Library</h1>
      {playlists?.length === 0 ? (
        <p style={{ color: 'gray' }}>You haven't created any playlists yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {playlists?.map(playlist => (
            <div key={playlist.id} style={{ background: '#181818', padding: '20px', borderRadius: '8px' }}>
              <h2>{playlist.name}</h2>
              {playlist.songs.length === 0 ? (
                <p style={{ color: 'gray', fontSize: '14px', marginTop: '10px' }}>No songs in this playlist.</p>
              ) : (
                <div className="song-grid" style={{ marginTop: '15px' }}>
                  {playlist.songs.map(song => (
                    <div key={song._id} className="card" onClick={() => setCurrentTrack(song)}>
                      <img src={song.coverUrl.startsWith('http') ? song.coverUrl : `${API_BASE_URL}${song.coverUrl}`} className="card-img" alt="cover" />
                      <h4>{song.title}</h4>
                      <p style={{color: 'gray', fontSize: '12px'}}>{song.artist}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
