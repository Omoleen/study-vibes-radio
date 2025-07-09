// Study Vibes Radio - YouTube Player API Wrapper

let player = null;
let isPlayerReady = false;
let currentPlaylistId = null;
let playerState = {
    volume: 50,
    isMuted: false,
    isPlaying: false,
    currentTrackIndex: 0
};

// Event callbacks
const callbacks = {
    onReady: null,
    onStateChange: null,
    onError: null,
    onPlaylistChange: null
};

// Initialize the YouTube player
export function initializePlayer(containerId = 'youtube-player') {
    return new Promise((resolve, reject) => {
        // Check if YouTube API is loaded and ready
        if (typeof YT === 'undefined' || typeof YT.Player === 'undefined') {
            reject(new Error('YouTube API not loaded'));
            return;
        }

        // Wait for YT.Player to be fully ready
        if (YT.loaded !== 1) {
            console.log('YouTube API loaded but not ready, waiting...');
            setTimeout(() => initializePlayer(containerId).then(resolve).catch(reject), 100);
            return;
        }

        try {
            player = new YT.Player(containerId, {
                height: '100%',
                width: '100%',
                playerVars: {
                    autoplay: 0,
                    controls: 0, // Hide YouTube controls
                    disablekb: 1, // Disable keyboard controls
                    fs: 0, // Disable fullscreen
                    iv_load_policy: 3, // Hide annotations
                    modestbranding: 1, // Hide YouTube logo
                    playsinline: 1, // Play inline on mobile
                    rel: 0, // Don't show related videos
                    showinfo: 0, // Hide video info
                    origin: window.location.origin
                },
                events: {
                    onReady: (event) => {
                        isPlayerReady = true;
                        playerState.volume = 50;
                        event.target.setVolume(playerState.volume);
                        
                        if (callbacks.onReady) {
                            callbacks.onReady(event);
                        }
                        resolve(player);
                    },
                    onStateChange: (event) => {
                        handleStateChange(event);
                        if (callbacks.onStateChange) {
                            callbacks.onStateChange(event);
                        }
                    },
                    onError: (event) => {
                        console.error('YouTube player error:', event.data);
                        if (callbacks.onError) {
                            callbacks.onError(event);
                        }
                    }
                }
            });
        } catch (error) {
            reject(error);
        }
    });
}

// Handle player state changes
function handleStateChange(event) {
    const state = event.data;
    
    switch (state) {
        case YT.PlayerState.PLAYING:
            playerState.isPlaying = true;
            break;
        case YT.PlayerState.PAUSED:
        case YT.PlayerState.ENDED:
            playerState.isPlaying = false;
            break;
        case YT.PlayerState.BUFFERING:
            // Handle buffering if needed
            break;
        case YT.PlayerState.CUED:
            // Video is cued and ready to play
            break;
    }
}

// Load a playlist
export function loadPlaylist(playlistId, startIndex = 0) {
    if (!isPlayerReady || !player) {
        console.warn('Player not ready');
        return false;
    }

    try {
        currentPlaylistId = playlistId;
        playerState.currentTrackIndex = startIndex;
        
        player.loadPlaylist({
            list: playlistId,
            index: startIndex,
            startSeconds: 0,
            suggestedQuality: 'default'
        });
        
        if (callbacks.onPlaylistChange) {
            callbacks.onPlaylistChange(playlistId);
        }
        
        return true;
    } catch (error) {
        console.error('Error loading playlist:', error);
        return false;
    }
}

// Play the current video
export function play() {
    if (!isPlayerReady || !player) return false;
    
    try {
        player.playVideo();
        return true;
    } catch (error) {
        console.error('Error playing video:', error);
        return false;
    }
}

// Pause the current video
export function pause() {
    if (!isPlayerReady || !player) return false;
    
    try {
        player.pauseVideo();
        return true;
    } catch (error) {
        console.error('Error pausing video:', error);
        return false;
    }
}

// Toggle play/pause
export function togglePlayPause() {
    if (!isPlayerReady || !player) return false;
    
    const state = player.getPlayerState();
    if (state === YT.PlayerState.PLAYING) {
        return pause();
    } else {
        return play();
    }
}

// Go to next track
export function nextTrack() {
    if (!isPlayerReady || !player) return false;
    
    try {
        player.nextVideo();
        playerState.currentTrackIndex++;
        return true;
    } catch (error) {
        console.error('Error going to next track:', error);
        return false;
    }
}

// Go to previous track
export function previousTrack() {
    if (!isPlayerReady || !player) return false;
    
    try {
        player.previousVideo();
        if (playerState.currentTrackIndex > 0) {
            playerState.currentTrackIndex--;
        }
        return true;
    } catch (error) {
        console.error('Error going to previous track:', error);
        return false;
    }
}

// Set volume (0-100)
export function setVolume(volume) {
    if (!isPlayerReady || !player) return false;
    
    try {
        const clampedVolume = Math.max(0, Math.min(100, volume));
        player.setVolume(clampedVolume);
        playerState.volume = clampedVolume;
        playerState.isMuted = clampedVolume === 0;
        return true;
    } catch (error) {
        console.error('Error setting volume:', error);
        return false;
    }
}

// Get current volume
export function getVolume() {
    if (!isPlayerReady || !player) return playerState.volume;
    
    try {
        return player.getVolume();
    } catch (error) {
        console.error('Error getting volume:', error);
        return playerState.volume;
    }
}

// Mute the player
export function mute() {
    if (!isPlayerReady || !player) return false;
    
    try {
        player.mute();
        playerState.isMuted = true;
        return true;
    } catch (error) {
        console.error('Error muting player:', error);
        return false;
    }
}

// Unmute the player
export function unmute() {
    if (!isPlayerReady || !player) return false;
    
    try {
        player.unMute();
        playerState.isMuted = false;
        return true;
    } catch (error) {
        console.error('Error unmuting player:', error);
        return false;
    }
}

// Toggle mute
export function toggleMute() {
    if (!isPlayerReady || !player) return false;
    
    try {
        if (player.isMuted()) {
            return unmute();
        } else {
            return mute();
        }
    } catch (error) {
        console.error('Error toggling mute:', error);
        return false;
    }
}

// Get current player state
export function getPlayerState() {
    if (!isPlayerReady || !player) return playerState;
    
    try {
        return {
            ...playerState,
            isPlaying: player.getPlayerState() === YT.PlayerState.PLAYING,
            isMuted: player.isMuted(),
            volume: player.getVolume(),
            currentTime: player.getCurrentTime(),
            duration: player.getDuration()
        };
    } catch (error) {
        console.error('Error getting player state:', error);
        return playerState;
    }
}

// Get current video info
export function getCurrentVideoInfo() {
    if (!isPlayerReady || !player) return null;
    
    try {
        const videoData = player.getVideoData();
        return {
            title: videoData.title || 'Unknown Title',
            author: videoData.author || 'Unknown Artist',
            videoId: videoData.video_id
        };
    } catch (error) {
        console.error('Error getting video info:', error);
        return null;
    }
}

// Set playback quality
export function setPlaybackQuality(quality = 'default') {
    if (!isPlayerReady || !player) return false;
    
    try {
        player.setPlaybackQuality(quality);
        return true;
    } catch (error) {
        console.error('Error setting playback quality:', error);
        return false;
    }
}

// Get available quality levels
export function getAvailableQualityLevels() {
    if (!isPlayerReady || !player) return [];
    
    try {
        return player.getAvailableQualityLevels();
    } catch (error) {
        console.error('Error getting quality levels:', error);
        return [];
    }
}

// Set event callbacks
export function setCallbacks(newCallbacks) {
    Object.assign(callbacks, newCallbacks);
}

// Check if player is ready
export function isReady() {
    return isPlayerReady && player !== null;
}

// Destroy the player
export function destroy() {
    if (player) {
        try {
            player.destroy();
        } catch (error) {
            console.error('Error destroying player:', error);
        }
        player = null;
        isPlayerReady = false;
        currentPlaylistId = null;
    }
}

// Get current playlist ID
export function getCurrentPlaylistId() {
    return currentPlaylistId;
}

// YouTube Player States (for external use)
export const PlayerState = {
    UNSTARTED: -1,
    ENDED: 0,
    PLAYING: 1,
    PAUSED: 2,
    BUFFERING: 3,
    CUED: 5
};

// Error codes
export const ErrorCode = {
    INVALID_PARAM: 2,
    HTML5_ERROR: 5,
    VIDEO_NOT_FOUND: 100,
    EMBED_NOT_ALLOWED: 101,
    EMBED_NOT_ALLOWED_DISGUISE: 150
};

// Export player instance for advanced usage
export { player }; 