import React, { useRef, useState, useEffect } from 'react';
import { useMusicStore } from '../store';
import { Play, Pause, SkipBack, SkipForward, Volume2, Heart, FolderPlus, ChevronDown, Repeat, Shuffle, Download, Share2, ThumbsDown, ThumbsUp, Cast, MoreVertical } from 'lucide-react';

const Player = () => {
  const { currentTrack, isPlaying, togglePlay, setIsPlaying, nextTrack, prevTrack, likedSongs, toggleLike, playlists, setIsPlaylistModalOpen, addToPlaylist } = useMusicStore();
  const playerRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [showPlaylistMenu, setShowPlaylistMenu] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const isLiked = currentTrack && likedSongs?.some(s => s._id === currentTrack._id);

  useEffect(() => {
    const initPlayer = () => {
        playerRef.current = new window.YT.Player('yt-player-container', {
          height: '0',
          width: '0',
          playerVars: { autoplay: 1, controls: 0 },
          events: {
            onReady: () => setIsPlayerReady(true),
            onStateChange: (e) => {
              if (e.data === window.YT.PlayerState.ENDED) {
                nextTrack();
              }
            }
          }
        });
    };

    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      window.onYouTubeIframeAPIReady = initPlayer;
    } else if (window.YT && window.YT.Player && !playerRef.current) {
      initPlayer();
    }
  }, [nextTrack]);

  useEffect(() => {
    const fetchAndPlayVideo = async () => {
      if (isPlayerReady && currentTrack && playerRef.current.loadVideoById) {
        try {
          const query = `${currentTrack.title} ${currentTrack.artist} audio`;
          const res = await fetch(`http://localhost:5000/api/yt-search?q=${encodeURIComponent(query)}`);
          const data = await res.json();
          if (data.videoId) {
            playerRef.current.loadVideoById(data.videoId);
            setIsPlaying(true);
          } else {
             console.error('Video not found');
             setIsPlaying(false);
          }
        } catch (error) {
           console.error('Error fetching video ID:', error);
           setIsPlaying(false);
        }
      }
    };
    fetchAndPlayVideo();
  }, [currentTrack, isPlayerReady, setIsPlaying]);

  useEffect(() => {
    if (isPlayerReady && playerRef.current && playerRef.current.playVideo) {
        if (isPlaying) {
            playerRef.current.playVideo();
        } else {
            playerRef.current.pauseVideo();
        }
    }
  }, [isPlaying, isPlayerReady]);

  useEffect(() => {
    let interval;
    if (isPlaying && isPlayerReady) {
      interval = setInterval(() => {
        if (playerRef.current && playerRef.current.getCurrentTime) {
            setCurrentTime(playerRef.current.getCurrentTime());
            setDuration(playerRef.current.getDuration());
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, isPlayerReady]);

  const handleTogglePlay = () => {
    if (!currentTrack) return;
    togglePlay();
  };

  const handleSeek = (e) => {
    if (isPlayerReady && playerRef.current.seekTo) {
        playerRef.current.seekTo(e.target.value, true);
        setCurrentTime(e.target.value);
    }
  };
  const handleVolumeChange = (e) => {
    if (isPlayerReady && playerRef.current.setVolume) {
        playerRef.current.setVolume(e.target.value * 100);
        setVolume(e.target.value);
    }
  };

  const formatTime = (time) => {
    if (isNaN(time) || time === 0) return "0:00";
    const min = Math.floor(time / 60);
    const sec = Math.floor(time % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  return (
    <>
    <div className="music-player">
        <div id="yt-player-container" style={{ position: 'absolute', width: 0, height: 0, opacity: 0 }}></div>
        <div 
          style={{ display: 'flex', alignItems: 'center', gap: '15px', width: '30%', cursor: currentTrack ? 'pointer' : 'default' }}
          onClick={() => currentTrack && setIsFullScreen(true)}
        >
            {currentTrack ? (
                <img src={currentTrack.coverUrl.startsWith('http') ? currentTrack.coverUrl : `http://localhost:5000${currentTrack.coverUrl}`} style={{ width: '50px', height: '50px', background: '#333', borderRadius: '4px', objectFit: 'cover' }} alt="cover" />
            ) : (
                <div style={{ width: '50px', height: '50px', background: '#333', borderRadius: '4px' }}></div>
            )}
            <div>
                <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{currentTrack ? currentTrack.title : 'Select a Song'}</div>
                <div style={{ fontSize: '12px', color: 'gray' }}>{currentTrack ? currentTrack.artist : 'Artist Name'}</div>
            </div>
        </div>

        <div className="controls" style={{ width: '40%' }}>
            <div className="play-btns">
                <SkipBack size={20} style={{ cursor: 'pointer', color: '#b3b3b3' }} onClick={prevTrack} />
                <span style={{ cursor: 'pointer', background: 'white', color: 'black', borderRadius: '50%', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={handleTogglePlay}>
                    {isPlaying ? <Pause size={20} fill="black" /> : <Play size={20} fill="black" style={{ marginLeft: '2px' }} />}
                </span>
                <SkipForward size={20} style={{ cursor: 'pointer', color: '#b3b3b3' }} onClick={nextTrack} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', fontSize: '12px', color: '#b3b3b3' }}>
                <span>{formatTime(currentTime)}</span>
                <input 
                  type="range" 
                  min="0" 
                  max={duration || 100} 
                  value={currentTime} 
                  onChange={handleSeek} 
                  style={{ flex: 1, height: '4px', cursor: 'pointer', accentColor: '#1db954' }} 
                />
                <span>{formatTime(duration)}</span>
            </div>
        </div>

        <div style={{ width: '30%', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '15px', color: '#b3b3b3' }}>
            <Heart 
              size={18} 
              style={{ cursor: 'pointer', color: isLiked ? '#1db954' : '#b3b3b3' }} 
              fill={isLiked ? '#1db954' : 'none'}
              onClick={() => currentTrack && toggleLike(currentTrack)} 
            />
            <div style={{ position: 'relative' }}>
                <FolderPlus size={18} style={{ cursor: 'pointer' }} onClick={() => currentTrack && setShowPlaylistMenu(!showPlaylistMenu)} />
                {showPlaylistMenu && (
                    <div style={{ position: 'absolute', bottom: '30px', right: '-10px', background: '#282828', padding: '10px', borderRadius: '4px', zIndex: 10, width: '150px', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
                        <div style={{ fontSize: '12px', marginBottom: '8px', color: 'white', fontWeight: 'bold' }}>Add to Playlist</div>
                        {playlists?.map(p => (
                            <div key={p.id} style={{ cursor: 'pointer', fontSize: '12px', padding: '4px 0', color: '#ccc' }} onClick={() => { addToPlaylist(p.id, currentTrack); setShowPlaylistMenu(false); }}>
                                {p.name}
                            </div>
                        ))}
                        <div style={{ cursor: 'pointer', fontSize: '12px', padding: '4px 0', color: '#1db954', borderTop: '1px solid #444', marginTop: '4px', paddingTop: '8px' }} onClick={() => {
                            setIsPlaylistModalOpen(true);
                            setShowPlaylistMenu(false);
                        }}>+ Create New</div>
                    </div>
                )}
            </div>
            <Volume2 size={18} />
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.01" 
              value={volume} 
              onChange={handleVolumeChange} 
              style={{ width: '80px', height: '4px', cursor: 'pointer', accentColor: '#1db954' }}
            />
        </div>
    </div>

    {isFullScreen && currentTrack && (
        <div className="full-screen-player">
            <div className="fs-top-bar">
                <ChevronDown size={28} style={{ cursor: 'pointer' }} onClick={() => setIsFullScreen(false)} />
            </div>

            <div className="fs-image-container">
                <img src={currentTrack.coverUrl.startsWith('http') ? currentTrack.coverUrl : `http://localhost:5000${currentTrack.coverUrl}`} className="fs-image" alt="cover" />
            </div>

            <div className="fs-info-row">
                <div>
                    <div className="fs-title">{currentTrack.title}</div>
                    <div className="fs-artist">{currentTrack.artist}</div>
                </div>
            </div>

            <div className="fs-actions">
                <div className="fs-action-btn" onClick={() => toggleLike(currentTrack)}>
                    <ThumbsUp size={18} fill={isLiked ? 'white' : 'none'} color={isLiked ? 'white' : 'currentColor'} /> 
                    <span>{isLiked ? 'Liked' : 'Like'}</span>
                </div>
                <div className="fs-action-btn" onClick={() => {
                  setIsPlaylistModalOpen(true);
                  setIsFullScreen(false);
                }}>
                    <FolderPlus size={18} /> <span>Save</span>
                </div>
                <div className="fs-action-btn" onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    alert("Link copied to clipboard!");
                }}>
                    <Share2 size={18} /> <span>Share</span>
                </div>
            </div>

            <div className="fs-progress">
                <input 
                  type="range" 
                  className="fs-progress-bar"
                  min="0" 
                  max={duration || 100} 
                  value={currentTime} 
                  onChange={handleSeek} 
                />
                <div className="fs-time">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                </div>
            </div>

            <div className="fs-controls" style={{ justifyContent: 'center', gap: '40px' }}>
                <SkipBack size={36} className="fs-control-icon" onClick={prevTrack} />
                <div className="fs-play-btn" onClick={handleTogglePlay}>
                    {isPlaying ? <Pause size={32} fill="black" /> : <Play size={32} fill="black" style={{ marginLeft: '4px' }} />}
                </div>
                <SkipForward size={36} className="fs-control-icon" onClick={nextTrack} />
            </div>
        </div>
    )}
    </>
  );
};
export default Player;