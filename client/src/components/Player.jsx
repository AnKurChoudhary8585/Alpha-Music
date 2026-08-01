import React, { useRef, useState, useEffect } from 'react';
import { useMusicStore } from '../store';
import { API_BASE_URL } from '../config';
import { Play, Pause, SkipBack, SkipForward, Volume2, Heart, FolderPlus, ChevronDown, Repeat, Shuffle, Download, Share2, ThumbsDown, ThumbsUp, Cast, MoreVertical } from 'lucide-react';

const Player = () => {
  const { currentTrack, isPlaying, togglePlay, setIsPlaying, nextTrack, prevTrack, likedSongs, toggleLike, playlists, setIsPlaylistModalOpen, addToPlaylist } = useMusicStore();
  const audioRef = useRef(null);
  const playerRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [showPlaylistMenu, setShowPlaylistMenu] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [activeSource, setActiveSource] = useState('none'); // 'audio' | 'youtube' | 'none'

  const isLiked = currentTrack && likedSongs?.some(s => s._id === currentTrack._id);

  // Initialize HTML5 Audio Element
  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => setDuration(audio.duration);
    const onEnded = () => nextTrack();
    const onError = () => {
      console.warn("Audio element failed, trying YouTube fallback...");
      setActiveSource('youtube');
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
      audio.pause();
    };
  }, [nextTrack]);

  // Initialize YouTube Iframe API
  useEffect(() => {
    const initPlayer = () => {
        playerRef.current = new window.YT.Player('yt-player-container', {
          height: '0',
          width: '0',
          playerVars: { 
            autoplay: 1, 
            controls: 0,
            origin: window.location.origin,
            enablejsapi: 1
          },
          events: {
            onReady: () => setIsPlayerReady(true),
            onStateChange: (e) => {
              if (e.data === window.YT.PlayerState.ENDED) {
                nextTrack();
              }
            },
            onError: (e) => {
              console.warn('YouTube Player error:', e.data);
              setTimeout(() => nextTrack(), 1500);
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

  // Fetch Full Song Source (Direct Stream or YouTube Video ID) across redundant instances
  const getFullSongSource = async (title, artist) => {
    const query = `${title} ${artist} audio`;

    // 1. Try Backend API
    try {
      const res = await fetch(`${API_BASE_URL}/api/yt-search?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.videoId) return { videoId: data.videoId };
      }
    } catch (e) {
      console.warn("Backend API search failed:", e);
    }

    // 2. Try Piped API instances for direct full audio stream OR video ID
    const pipedNodes = [
      'https://pipedapi.kavin.rocks',
      'https://api.piped.yt',
      'https://pipedapi.lunar.icu',
      'https://pipedapi.drgns.space'
    ];

    for (const node of pipedNodes) {
      try {
        const searchRes = await fetch(`${node}/search?q=${encodeURIComponent(query)}&filter=music_videos`);
        if (searchRes.ok) {
          const searchData = await searchRes.json();
          if (searchData.items && searchData.items.length > 0) {
            const itemUrl = searchData.items[0].url || '';
            const vId = itemUrl.includes('v=') ? itemUrl.split('v=')[1] : null;
            if (vId) {
              try {
                const streamRes = await fetch(`${node}/streams/${vId}`);
                if (streamRes.ok) {
                  const streamData = await streamRes.json();
                  if (streamData.audioStreams && streamData.audioStreams.length > 0) {
                    const bestStream = streamData.audioStreams.find(s => s.mimeType?.includes('audio/mp4') || s.mimeType?.includes('audio/webm')) || streamData.audioStreams[0];
                    if (bestStream?.url) {
                      return { streamUrl: bestStream.url, videoId: vId };
                    }
                  }
                }
              } catch (streamErr) {
                console.warn("Stream resolution failed:", streamErr);
              }
              return { videoId: vId };
            }
          }
        }
      } catch (nodeErr) {
        console.warn(`Piped node ${node} failed:`, nodeErr);
      }
    }

    // 3. Try Invidious API instances
    const invidiousNodes = [
      'https://invidious.nerdvpn.de',
      'https://inv.tux.pizza',
      'https://invidious.drgns.space'
    ];

    for (const node of invidiousNodes) {
      try {
        const res = await fetch(`${node}/api/v1/search?q=${encodeURIComponent(query)}&type=video`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0 && data[0].videoId) {
            return { videoId: data[0].videoId };
          }
        }
      } catch (nodeErr) {
        console.warn(`Invidious node ${node} failed:`, nodeErr);
      }
    }

    return null;
  };

  // Play current track logic (STRICTLY FULL SONGS)
  useEffect(() => {
    if (!currentTrack) return;

    let isSubscribed = true;

    const playTrack = async () => {
      // Pause any running audio
      if (audioRef.current) {
        audioRef.current.pause();
      }

      setCurrentTime(0);
      setDuration(0);

      // Search for full-length song source
      const source = await getFullSongSource(currentTrack.title, currentTrack.artist);
      if (!isSubscribed) return;

      // Mode A: Direct Full-Length Audio Stream (.m4a / .webm / .mp3)
      if (source?.streamUrl && audioRef.current) {
        audioRef.current.src = source.streamUrl;
        audioRef.current.volume = volume;
        try {
          await audioRef.current.play();
          if (isSubscribed) {
            setActiveSource('audio');
            setIsPlaying(true);
            return;
          }
        } catch (err) {
          console.warn("Direct stream playback failed, retrying YouTube player...", err);
        }
      }

      // Mode B: YouTube Iframe (retries until player instance is ready)
      if (source?.videoId) {
        let attempts = 0;
        const loadYTVideo = () => {
          if (!isSubscribed) return;
          if (playerRef.current && typeof playerRef.current.loadVideoById === 'function') {
            setActiveSource('youtube');
            playerRef.current.loadVideoById(source.videoId);
            setIsPlaying(true);
          } else if (attempts < 20) {
            attempts++;
            setTimeout(loadYTVideo, 250);
          } else {
            console.error("YouTube Player instance failed to initialize");
          }
        };
        loadYTVideo();
        return;
      }

      console.error("No full song source found for", currentTrack.title);
    };

    playTrack();

    return () => {
      isSubscribed = false;
    };
  }, [currentTrack]);

  // Toggle play/pause control
  useEffect(() => {
    if (activeSource === 'audio' && audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(e => console.warn(e));
      } else {
        audioRef.current.pause();
      }
    } else if (activeSource === 'youtube' && isPlayerReady && playerRef.current?.playVideo) {
      if (isPlaying) {
        playerRef.current.playVideo();
      } else {
        playerRef.current.pauseVideo();
      }
    }
  }, [isPlaying, activeSource, isPlayerReady]);

  // YouTube interval timer for progress bar
  useEffect(() => {
    let interval;
    if (activeSource === 'youtube' && isPlaying && isPlayerReady) {
      interval = setInterval(() => {
        if (playerRef.current?.getCurrentTime) {
          setCurrentTime(playerRef.current.getCurrentTime());
          setDuration(playerRef.current.getDuration() || 0);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeSource, isPlaying, isPlayerReady]);

  const handleTogglePlay = () => {
    if (!currentTrack) return;
    togglePlay();
  };

  const handleSeek = (e) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (activeSource === 'audio' && audioRef.current) {
      audioRef.current.currentTime = newTime;
    } else if (activeSource === 'youtube' && isPlayerReady && playerRef.current?.seekTo) {
      playerRef.current.seekTo(newTime, true);
    }
  };

  const handleVolumeChange = (e) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    if (audioRef.current) {
      audioRef.current.volume = newVol;
    }
    if (isPlayerReady && playerRef.current?.setVolume) {
      playerRef.current.setVolume(newVol * 100);
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
                <img src={currentTrack.coverUrl.startsWith('http') ? currentTrack.coverUrl : `${API_BASE_URL}${currentTrack.coverUrl}`} style={{ width: '50px', height: '50px', background: '#333', borderRadius: '4px', objectFit: 'cover' }} alt="cover" />
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
                <img src={currentTrack.coverUrl.startsWith('http') ? currentTrack.coverUrl : `${API_BASE_URL}${currentTrack.coverUrl}`} className="fs-image" alt="cover" />
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