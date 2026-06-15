import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Search from './components/Search';
import Library from './pages/Library';
import Playlist from './pages/Playlist';
import LikedSongs from './pages/LikedSongs';
import Login from './pages/Login';
import Register from './pages/Register';
import { useMusicStore } from './store';
import { API_BASE_URL } from './config';

function App() {
  const { token, likedSongs, playlists, user, setUser } = useMusicStore();

  useEffect(() => {
    if (token) {
      fetch(`${API_BASE_URL}/api/auth/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, likedSongs, playlists })
      }).catch(console.error);
      
      if (user) {
        // Prevent infinite loop by checking if they actually changed
        if (JSON.stringify(user.likedSongs) !== JSON.stringify(likedSongs) || 
            JSON.stringify(user.playlists) !== JSON.stringify(playlists)) {
            setUser({ ...user, likedSongs, playlists });
        }
      }
    }
  }, [likedSongs, playlists, token]);

  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/library" element={<Library />} />
          <Route path="/playlist" element={<Playlist />} />
          <Route path="/liked" element={<LikedSongs />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;