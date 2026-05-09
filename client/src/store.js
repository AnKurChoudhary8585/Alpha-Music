import { create } from 'zustand';

export const useMusicStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,
  setUser: (user) => {
    if (user) localStorage.setItem('user', JSON.stringify(user));
    else localStorage.removeItem('user');
    set({ user });
  },
  setToken: (token) => {
    if (token) localStorage.setItem('token', token);
    else localStorage.removeItem('token');
    set({ token });
  },
  currentTrack: null,
  isPlaying: false,
  songs: [],
  likedSongs: JSON.parse(localStorage.getItem('user'))?.likedSongs || [],
  playlists: JSON.parse(localStorage.getItem('user'))?.playlists || [],
  setLikedSongs: (likedSongs) => set({ likedSongs }),
  setPlaylists: (playlists) => set({ playlists }),
  isPlaylistModalOpen: false,
  setIsPlaylistModalOpen: (isOpen) => set({ isPlaylistModalOpen: isOpen }),
  setSongs: (songs) => set({ songs }),
  setCurrentTrack: (track) => set({ currentTrack: track, isPlaying: true }),
  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  toggleLike: (track) => set((state) => {
    const isLiked = state.likedSongs.some(s => s._id === track._id);
    if (isLiked) {
      return { likedSongs: state.likedSongs.filter(s => s._id !== track._id) };
    } else {
      return { likedSongs: [...state.likedSongs, track] };
    }
  }),
  createPlaylist: (name) => set((state) => {
    const newPlaylist = { id: Date.now().toString(), name, songs: [] };
    return { playlists: [...state.playlists, newPlaylist] };
  }),
  addToPlaylist: (playlistId, track) => set((state) => {
    const updatedPlaylists = state.playlists.map(p => {
      if (p.id === playlistId) {
        if (p.songs.some(s => s._id === track._id)) return p;
        return { ...p, songs: [...p.songs, track] };
      }
      return p;
    });
    return { playlists: updatedPlaylists };
  }),
  nextTrack: () => set((state) => {
    if (!state.currentTrack || state.songs.length === 0) return state;
    const currentIndex = state.songs.findIndex(s => s._id === state.currentTrack._id);
    const nextIndex = (currentIndex + 1) % state.songs.length;
    return { currentTrack: state.songs[nextIndex], isPlaying: true };
  }),
  prevTrack: () => set((state) => {
    if (!state.currentTrack || state.songs.length === 0) return state;
    const currentIndex = state.songs.findIndex(s => s._id === state.currentTrack._id);
    const prevIndex = (currentIndex - 1 + state.songs.length) % state.songs.length;
    return { currentTrack: state.songs[prevIndex], isPlaying: true };
  })
}));