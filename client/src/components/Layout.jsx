import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Player from './Player';
import { useMusicStore } from '../store';
import { API_BASE_URL } from '../config';

export default function Layout({ children }) {
  const { currentTrack, isPlaylistModalOpen, setIsPlaylistModalOpen, createPlaylist } = useMusicStore();
  const [newPlaylistName, setNewPlaylistName] = useState('');

  const handleCreatePlaylist = () => {
    if (newPlaylistName.trim()) {
      createPlaylist(newPlaylistName.trim());
      setNewPlaylistName('');
      setIsPlaylistModalOpen(false);
    }
  };

  return (
    <div className="app-container">
      {isPlaylistModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#282828', padding: '24px', borderRadius: '8px', width: '300px', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
            <h2 style={{ marginBottom: '16px', fontSize: '18px', color: 'white' }}>Create New Playlist</h2>
            <input 
              type="text" 
              placeholder="Playlist name" 
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #555', background: '#3E3E3E', color: 'white', marginBottom: '20px', outline: 'none', boxSizing: 'border-box' }}
              autoFocus
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button 
                onClick={() => setIsPlaylistModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#b3b3b3', cursor: 'pointer', padding: '8px 16px', fontWeight: 'bold' }}>
                Cancel
              </button>
              <button 
                onClick={handleCreatePlaylist}
                style={{ background: '#1db954', border: 'none', color: 'black', borderRadius: '20px', cursor: 'pointer', padding: '8px 16px', fontWeight: 'bold' }}>
                Create
              </button>
            </div>
          </div>
        </div>
      )}
      <Sidebar />
      <main className="content">
        {currentTrack && (
          <div key={currentTrack._id} style={{
            display: 'flex', 
            alignItems: 'flex-end', 
            gap: '24px', 
            background: 'linear-gradient(transparent 0, rgba(0,0,0,0.5) 100%)', 
            padding: '30px', 
            borderRadius: '8px', 
            marginBottom: '30px',
            animation: 'zoomIn 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) forwards'
          }}>
             <img src={currentTrack.coverUrl.startsWith('http') ? currentTrack.coverUrl : `${API_BASE_URL}${currentTrack.coverUrl}`} style={{ width: '192px', height: '192px', borderRadius: '4px', boxShadow: '0 4px 60px rgba(0,0,0,.5)' }} alt="cover" />
             <div style={{ flex: 1 }}>
               <p style={{ fontSize: '14px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '8px', color: '#fff' }}>Now Playing</p>
               <h1 style={{ fontSize: '4.5rem', fontWeight: 900, margin: 0, lineHeight: 1.1, color: '#fff' }}>{currentTrack.title}</h1>
               <p style={{ color: '#b3b3b3', fontSize: '1.2rem', marginTop: '12px', fontWeight: 'bold' }}>{currentTrack.artist}</p>
             </div>
          </div>
        )}
        {children}
        <Outlet />
      </main>
      <Player />
    </div>
  );
}