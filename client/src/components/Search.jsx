import React, { useState, useEffect } from 'react';
import { useMusicStore } from '../store';
import { Search as SearchIcon } from 'lucide-react';
import { searchITunes } from '../api';

export default function Search() {
  const { setCurrentTrack, setSongs } = useMusicStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query) {
        setResults([]);
        return;
    }
    const timeoutId = setTimeout(() => {
      setLoading(true);
      searchITunes(query)
        .then(res => {
            setResults(res);
            setLoading(false);
        })
        .catch(e => {
            console.error(e);
            setLoading(false);
        });
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [query]);

  const handlePlay = (song) => {
    setSongs(results); // update playlist for next/prev
    setCurrentTrack(song);
  };

  return (
    <div>
      <div style={{ position: 'relative', marginBottom: '30px' }}>
        <SearchIcon size={20} style={{ position: 'absolute', top: '10px', left: '15px', color: 'gray' }} />
        <input 
          type="text" 
          placeholder="What do you want to listen to?" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ width: '100%', maxWidth: '400px', padding: '12px 15px 12px 45px', borderRadius: '30px', border: 'none', background: '#242424', color: 'white', fontSize: '14px', outline: 'none' }}
        />
      </div>

      <h2 style={{ marginBottom: '20px' }}>{query ? 'Search Results' : 'Search for an artist or song'}</h2>
      {loading && <p style={{ color: 'gray' }}>Loading...</p>}
      <div className="song-grid">
        {!loading && results.length > 0 ? results.map(song => (
          <div key={song._id} className="card" onClick={() => handlePlay(song)}>
            <img src={song.coverUrl} className="card-img" alt="cover" />
            <h4>{song.title}</h4>
            <p style={{color: 'gray', fontSize: '12px'}}>{song.artist}</p>
          </div>
        )) : (
            !loading && query && <p style={{ color: 'gray' }}>No songs found for "{query}"</p>
        )}
      </div>
    </div>
  );
}
