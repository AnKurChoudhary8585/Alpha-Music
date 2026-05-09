import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMusicStore } from '../store';

export default function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { setUser, setToken, setLikedSongs, setPlaylists } = useMusicStore();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      setUser(data.user);
      setToken(data.token);
      setLikedSongs(data.user.likedSongs);
      setPlaylists(data.user.playlists);
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div style={{ background: '#181818', padding: '40px', borderRadius: '8px', width: '300px', textAlign: 'center' }}>
        <h2 style={{ marginBottom: '20px' }}>Sign up for Alpha Music</h2>
        {error && <p style={{ color: 'red', fontSize: '14px', marginBottom: '10px' }}>{error}</p>}
        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input 
            type="text" 
            placeholder="Username" 
            value={username}
            onChange={e => setUsername(e.target.value)}
            style={{ padding: '12px', borderRadius: '4px', border: '1px solid #555', background: '#3E3E3E', color: 'white' }}
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{ padding: '12px', borderRadius: '4px', border: '1px solid #555', background: '#3E3E3E', color: 'white' }}
          />
          <button type="submit" style={{ background: '#1db954', color: 'black', padding: '12px', borderRadius: '20px', border: 'none', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}>
            SIGN UP
          </button>
        </form>
        <p style={{ marginTop: '20px', color: 'gray', fontSize: '14px' }}>
          Already have an account? <Link to="/login" style={{ color: 'white', textDecoration: 'none' }}>Log in</Link>
        </p>
      </div>
    </div>
  );
}
