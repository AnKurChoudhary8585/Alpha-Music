import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Search, Library, Plus, Heart, List, User as UserIcon, LogOut } from 'lucide-react';
import { useMusicStore } from '../store';

const Sidebar = () => {
    const { playlists, setIsPlaylistModalOpen, user, setUser, setToken, setLikedSongs, setPlaylists } = useMusicStore();

    const handleLogout = () => {
        setUser(null);
        setToken(null);
        setLikedSongs([]);
        setPlaylists([]);
    };

    return (
        <aside style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div className="brand-container">
                <Link to="/" style={{ textDecoration: 'none' }}>
                    <div className="logo">Alpha Music</div>
                </Link>
                <div className="craft-credit">Crafted By Ankur</div>
            </div>
            
            <nav style={{ flex: 1, overflowY: 'auto' }}>
                <ul style={{ padding: 0 }}>
                    <li>
                        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: 'inherit' }}>
                            <Home size={20} /> Home
                        </Link>
                    </li>
                    <li>
                        <Link to="/search" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: 'inherit' }}>
                            <Search size={20} /> Search
                        </Link>
                    </li>
                    <li>
                        <Link to="/library" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: 'inherit' }}>
                            <Library size={20} /> Library
                        </Link>
                    </li>
                    <li style={{ marginTop: '20px', fontSize: '0.8rem', textTransform: 'uppercase', color: '#555', paddingLeft: 0 }}>Playlists</li>
                    <li>
                        <div onClick={() => setIsPlaylistModalOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'inherit', cursor: 'pointer' }}>
                            <div style={{ background: '#b3b3b3', color: 'black', padding: '2px', borderRadius: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Plus size={16} />
                            </div>
                            Create Playlist
                        </div>
                    </li>
                    <li>
                        <Link to="/liked" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: 'inherit' }}>
                            <Heart size={20} /> Liked Songs
                        </Link>
                    </li>
                    {playlists?.map(p => (
                        <li key={p.id} style={{ marginTop: '10px' }}>
                            <Link to="/library" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: '#b3b3b3', fontSize: '0.9rem' }}>
                                <List size={16} /> {p.name}
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>
            <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid #333' }}>
                {user ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'white', fontSize: '14px', fontWeight: 'bold' }}>
                            <div style={{ background: '#1db954', color: 'black', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <UserIcon size={18} />
                            </div>
                            {user.username}
                        </div>
                        <LogOut size={18} style={{ cursor: 'pointer', color: '#b3b3b3' }} onClick={handleLogout} />
                    </div>
                ) : (
                    <Link to="/login" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', fontWeight: 'bold', background: '#1db954', padding: '10px', borderRadius: '20px', justifyContent: 'center', color: 'black' }}>
                        Log in
                    </Link>
                )}
            </div>
        </aside>
    );
};
export default Sidebar;
