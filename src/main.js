// Study Vibes Radio - Main Application Logic

import { VIBES, DEFAULT_VIBE, FALLBACK_GRADIENTS } from './vibes.js';
import * as Player from './player.js';

// Application state
let currentVibe = null;
let isAudioOnly = false;
let sleepTimer = null;
let sleepTimerInterval = null;
let isPlayerInitialized = false;

// DOM elements
const elements = {
    bgVideo: null,
    bgFallback: null,
    greeting: null,
    moodCards: null,
    playerContainer: null,
    playerLoading: null,
    playPauseBtn: null,
    prevBtn: null,
    nextBtn: null,
    muteBtn: null,
    volumeSlider: null,
    volumeFill: null,
    trackInfo: null,
    trackTitle: null,
    trackArtist: null,
    audioToggle: null,
    sleepTimerSelect: null,
    timerDisplay: null,
    timerText: null,
    shortcutsHelp: null
};

// Initialize the application
document.addEventListener('DOMContentLoaded', async () => {
    initializeElements();
    setupEventListeners();
    setDynamicGreeting();
    createMoodCards();
    initializeVolumeControls(); // Initialize volume controls
    loadSettings();
    
    // Wait for YouTube API to be ready with better timing
    waitForYouTubeAPI();
});

// Better YouTube API loading
function waitForYouTubeAPI() {
    const maxAttempts = 50; // 5 seconds max
    let attempts = 0;
    
    const checkAPI = () => {
        attempts++;
        
        if (typeof YT !== 'undefined' && YT.Player && YT.loaded === 1) {
            console.log('YouTube API ready after', attempts, 'attempts');
            initializeYouTubePlayer();
        } else if (attempts < maxAttempts) {
            setTimeout(checkAPI, 100);
        } else {
            console.error('YouTube API failed to load after', attempts, 'attempts');
            elements.playerLoading.innerHTML = `
                <p>YouTube API failed to load.</p>
                <p>This might be due to:</p>
                <ul style="text-align: left; margin: 1rem 0;">
                    <li>Ad blockers blocking YouTube</li>
                    <li>Network connectivity issues</li>
                    <li>Corporate firewall restrictions</li>
                </ul>
                <p>Try refreshing the page or disabling ad blockers.</p>
            `;
        }
    };
    
    // Start checking immediately
    checkAPI();
}

// Initialize DOM element references
function initializeElements() {
    elements.bgVideo = document.getElementById('bg-video');
    elements.bgFallback = document.getElementById('bg-fallback');
    elements.greeting = document.getElementById('greeting');
    elements.moodCards = document.getElementById('mood-cards');
    elements.playerContainer = document.getElementById('player-container');
    elements.playerLoading = document.getElementById('player-loading');
    elements.playPauseBtn = document.getElementById('play-pause-btn');
    elements.prevBtn = document.getElementById('prev-btn');
    elements.nextBtn = document.getElementById('next-btn');
    elements.muteBtn = document.getElementById('mute-btn');
    elements.volumeSlider = document.getElementById('volume-slider');
    elements.volumeFill = document.querySelector('.volume-fill');
    elements.trackInfo = document.getElementById('track-info');
    elements.trackTitle = elements.trackInfo.querySelector('.track-title');
    elements.trackArtist = elements.trackInfo.querySelector('.track-artist');
    elements.audioToggle = document.getElementById('audio-toggle');
    elements.sleepTimerSelect = document.getElementById('sleep-timer-select');
    elements.timerDisplay = document.getElementById('timer-display');
    elements.timerText = document.getElementById('timer-text');
    elements.shortcutsHelp = document.getElementById('shortcuts-help');
}

// Set up event listeners
function setupEventListeners() {
    // Player controls
    elements.playPauseBtn.addEventListener('click', togglePlayPause);
    elements.prevBtn.addEventListener('click', previousTrack);
    elements.nextBtn.addEventListener('click', nextTrack);
    elements.muteBtn.addEventListener('click', toggleMute);
    elements.volumeSlider.addEventListener('input', handleVolumeChange);
    elements.volumeSlider.addEventListener('change', handleVolumeChange);
    
    // Audio toggle
    elements.audioToggle.addEventListener('click', toggleAudioOnly);
    
    // Sleep timer
    elements.sleepTimerSelect.addEventListener('change', handleSleepTimerChange);
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
    
    // Background video error handling
    elements.bgVideo.addEventListener('error', handleVideoError);
    elements.bgVideo.addEventListener('loadstart', () => {
        elements.bgFallback.classList.remove('active');
    });
    elements.bgVideo.addEventListener('canplay', () => {
        elements.bgFallback.classList.remove('active');
    });
    
    // Prevent context menu on video
    elements.bgVideo.addEventListener('contextmenu', (e) => e.preventDefault());
}

// Set dynamic greeting based on time of day
function setDynamicGreeting() {
    const hour = new Date().getHours();
    let greeting;
    
    if (hour < 12) {
        greeting = 'Good morning, ready to focus?';
    } else if (hour < 17) {
        greeting = 'Good afternoon, ready to focus?';
    } else {
        greeting = 'Good evening, ready to focus?';
    }
    
    elements.greeting.textContent = greeting;
}

// Create mood cards
function createMoodCards() {
    elements.moodCards.innerHTML = '';
    
    Object.entries(VIBES).forEach(([key, vibe]) => {
        const card = document.createElement('button');
        card.className = 'mood-card';
        card.style.color = vibe.color;
        card.setAttribute('data-vibe', key);
        card.setAttribute('aria-label', `Select ${vibe.name} mood`);
        card.setAttribute('tabindex', '0');
        
        card.innerHTML = `
            <span class="mood-icon">${vibe.icon}</span>
            <div class="mood-name">${vibe.name}</div>
            <div class="mood-description">${vibe.description}</div>
        `;
        
        card.addEventListener('click', () => selectVibe(key));
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                selectVibe(key);
            }
        });
        
        elements.moodCards.appendChild(card);
    });
}

// Select a vibe/mood
async function selectVibe(vibeKey) {
    if (!VIBES[vibeKey]) return;
    
    const vibe = VIBES[vibeKey];
    currentVibe = vibeKey;
    
    // Update UI
    updateActiveMoodCard(vibeKey);
    updateBackground(vibe);
    updateTrackInfo(vibe.name, vibe.description);
    
    // Load playlist if player is ready
    if (isPlayerInitialized) {
        const success = Player.loadPlaylist(vibe.playlistId);
        if (success) {
            // Auto-play after loading
            setTimeout(() => {
                Player.play();
            }, 1000);
        }
    }
    
    // Save to localStorage
    saveSettings();
}

// Update active mood card styling
function updateActiveMoodCard(activeKey) {
    const cards = elements.moodCards.querySelectorAll('.mood-card');
    cards.forEach(card => {
        if (card.getAttribute('data-vibe') === activeKey) {
            card.classList.add('active');
        } else {
            card.classList.remove('active');
        }
    });
}

// Update background video/image
function updateBackground(vibe) {
    const videoPath = `public/bg/${vibe.background}`;
    
    // Fade out current video
    elements.bgVideo.classList.add('fade-out');
    
    setTimeout(() => {
        elements.bgVideo.src = videoPath;
        elements.bgVideo.classList.remove('fade-out');
        elements.bgVideo.classList.add('fade-in');
        
        // Set fallback gradient
        elements.bgFallback.style.background = FALLBACK_GRADIENTS[currentVibe] || FALLBACK_GRADIENTS.lofi;
    }, 250);
}

// Handle video loading errors
function handleVideoError() {
    console.warn('Background video failed to load, using fallback');
    elements.bgFallback.classList.add('active');
}

// Initialize YouTube player
async function initializeYouTubePlayer() {
    try {
        console.log('Initializing YouTube player...');
        console.log('YT object available:', typeof YT !== 'undefined');
        
        await Player.initializePlayer();
        isPlayerInitialized = true;
        
        // Set up player callbacks
        Player.setCallbacks({
            onReady: handlePlayerReady,
            onStateChange: handlePlayerStateChange,
            onError: handlePlayerError
        });
        
        // Hide loading indicator
        elements.playerLoading.style.display = 'none';
        
        // Load default vibe if set
        if (currentVibe) {
            const vibe = VIBES[currentVibe];
            Player.loadPlaylist(vibe.playlistId);
        }
        
    } catch (error) {
        console.error('Failed to initialize YouTube player:', error);
        console.error('Error details:', error.message);
        elements.playerLoading.innerHTML = `
            <p>Failed to load player.</p>
            <p>Error: ${error.message}</p>
            <p>Try refreshing or check console for details.</p>
        `;
    }
}

// Handle player ready event
function handlePlayerReady() {
    console.log('YouTube player ready');
    
    // Set initial volume from slider
    const currentVolume = parseInt(elements.volumeSlider.value);
    Player.setVolume(currentVolume);
    updateVolumeDisplay(currentVolume);
    updateMuteButton();
    
    console.log('Player volume set to:', currentVolume);
}

// Handle player state changes
function handlePlayerStateChange(event) {
    const state = event.data;
    
    // Update play/pause button
    if (state === Player.PlayerState.PLAYING) {
        elements.playPauseBtn.classList.add('playing');
        elements.playPauseBtn.setAttribute('aria-label', 'Pause');
    } else {
        elements.playPauseBtn.classList.remove('playing');
        elements.playPauseBtn.setAttribute('aria-label', 'Play');
    }
    
    // Update track info when video changes
    if (state === Player.PlayerState.PLAYING || state === Player.PlayerState.PAUSED) {
        updateCurrentTrackInfo();
    }
}

// Handle player errors
function handlePlayerError(event) {
    console.error('YouTube player error:', event.data);
    
    const errorMessages = {
        2: 'Invalid playlist ID',
        5: 'HTML5 player error',
        100: 'Video not found',
        101: 'Video cannot be embedded',
        150: 'Video cannot be embedded (disguised 101)'
    };
    
    const message = errorMessages[event.data] || 'Unknown player error';
    elements.trackTitle.textContent = 'Error loading playlist';
    elements.trackArtist.textContent = message;
}

// Update current track info
function updateCurrentTrackInfo() {
    const videoInfo = Player.getCurrentVideoInfo();
    if (videoInfo) {
        elements.trackTitle.textContent = videoInfo.title;
        elements.trackArtist.textContent = videoInfo.author;
    }
}

// Update track info display
function updateTrackInfo(title, artist) {
    elements.trackTitle.textContent = title;
    elements.trackArtist.textContent = artist;
}

// Player control functions
function togglePlayPause() {
    if (isPlayerInitialized) {
        Player.togglePlayPause();
    }
}

function previousTrack() {
    if (isPlayerInitialized) {
        Player.previousTrack();
    }
}

function nextTrack() {
    if (isPlayerInitialized) {
        Player.nextTrack();
    }
}

function toggleMute() {
    if (isPlayerInitialized) {
        Player.toggleMute();
        updateMuteButton();
    }
}

// Update mute button appearance
function updateMuteButton() {
    const state = Player.getPlayerState();
    if (state.isMuted) {
        elements.muteBtn.classList.add('muted');
        elements.muteBtn.setAttribute('aria-label', 'Unmute');
    } else {
        elements.muteBtn.classList.remove('muted');
        elements.muteBtn.setAttribute('aria-label', 'Mute');
    }
}

// Handle volume slider changes
function handleVolumeChange(event) {
    const volume = parseInt(event.target.value);
    console.log('Volume changed to:', volume); // Debug log
    
    if (isPlayerInitialized) {
        Player.setVolume(volume);
        updateVolumeDisplay(volume);
        updateMuteButton();
        
        // Save volume to localStorage
        localStorage.setItem('vibe-volume', volume.toString());
    } else {
        console.log('Player not initialized, storing volume for later');
        // Store volume for when player is ready
        localStorage.setItem('vibe-volume', volume.toString());
        updateVolumeDisplay(volume);
    }
}

// Update volume display
function updateVolumeDisplay(volume) {
    elements.volumeFill.style.width = `${volume}%`;
    console.log('Volume display updated to:', volume + '%'); // Debug log
}

// Initialize volume controls
function initializeVolumeControls() {
    // Set default volume
    const defaultVolume = 50;
    elements.volumeSlider.value = defaultVolume;
    updateVolumeDisplay(defaultVolume);
    
    // Load saved volume
    const savedVolume = localStorage.getItem('vibe-volume');
    if (savedVolume) {
        const volume = parseInt(savedVolume);
        elements.volumeSlider.value = volume;
        updateVolumeDisplay(volume);
        console.log('Loaded saved volume:', volume);
    }
}

// Toggle audio-only mode
function toggleAudioOnly() {
    isAudioOnly = !isAudioOnly;
    
    if (isAudioOnly) {
        elements.audioToggle.classList.add('active');
        elements.audioToggle.setAttribute('aria-label', 'Exit audio-only mode');
        elements.playerContainer.style.display = 'none';
        
        // Set lower quality for audio-only
        if (isPlayerInitialized) {
            Player.setPlaybackQuality('small');
        }
    } else {
        elements.audioToggle.classList.remove('active');
        elements.audioToggle.setAttribute('aria-label', 'Enter audio-only mode');
        elements.playerContainer.style.display = 'block';
        
        // Restore normal quality
        if (isPlayerInitialized) {
            Player.setPlaybackQuality('default');
        }
    }
    
    saveSettings();
}

// Handle sleep timer changes
function handleSleepTimerChange(event) {
    const minutes = parseInt(event.target.value);
    
    // Clear existing timer
    if (sleepTimer) {
        clearTimeout(sleepTimer);
        sleepTimer = null;
    }
    
    if (sleepTimerInterval) {
        clearInterval(sleepTimerInterval);
        sleepTimerInterval = null;
    }
    
    if (minutes > 0) {
        startSleepTimer(minutes);
        elements.timerDisplay.classList.remove('hidden');
    } else {
        elements.timerDisplay.classList.add('hidden');
    }
}

// Start sleep timer
function startSleepTimer(minutes) {
    const endTime = Date.now() + (minutes * 60 * 1000);
    
    // Update timer display every second
    sleepTimerInterval = setInterval(() => {
        const remaining = Math.max(0, endTime - Date.now());
        const remainingMinutes = Math.floor(remaining / 60000);
        const remainingSeconds = Math.floor((remaining % 60000) / 1000);
        
        elements.timerText.textContent = `Timer: ${remainingMinutes}:${remainingSeconds.toString().padStart(2, '0')}`;
        
        if (remaining <= 0) {
            clearInterval(sleepTimerInterval);
            elements.timerDisplay.classList.add('hidden');
            elements.sleepTimerSelect.value = 'off';
            
            // Pause player
            if (isPlayerInitialized) {
                Player.pause();
            }
        }
    }, 1000);
    
    // Set main timer
    sleepTimer = setTimeout(() => {
        if (isPlayerInitialized) {
            Player.pause();
        }
        elements.timerDisplay.classList.add('hidden');
        elements.sleepTimerSelect.value = 'off';
    }, minutes * 60 * 1000);
}

// Handle keyboard shortcuts
function handleKeyboardShortcuts(event) {
    // Don't handle shortcuts when typing in inputs
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'SELECT') {
        return;
    }
    
    switch (event.key) {
        case ' ':
            event.preventDefault();
            togglePlayPause();
            break;
            
        case 'ArrowLeft':
            event.preventDefault();
            previousTrack();
            break;
            
        case 'ArrowRight':
            event.preventDefault();
            nextTrack();
            break;
            
        case 'm':
        case 'M':
            event.preventDefault();
            toggleMute();
            break;
            
        case '?':
            event.preventDefault();
            toggleShortcutsHelp();
            break;
            
        case 'Escape':
            if (!elements.shortcutsHelp.classList.contains('hidden')) {
                elements.shortcutsHelp.classList.add('hidden');
            }
            break;
    }
}

// Toggle keyboard shortcuts help
function toggleShortcutsHelp() {
    elements.shortcutsHelp.classList.toggle('hidden');
}

// Save settings to localStorage
function saveSettings() {
    const settings = {
        vibe: currentVibe,
        volume: Player.getVolume(),
        isAudioOnly: isAudioOnly
    };
    
    localStorage.setItem('vibe-settings', JSON.stringify(settings));
}

// Load settings from localStorage
function loadSettings() {
    try {
        const saved = localStorage.getItem('vibe-settings');
        if (saved) {
            const settings = JSON.parse(saved);
            
            // Load vibe
            if (settings.vibe && VIBES[settings.vibe]) {
                selectVibe(settings.vibe);
            } else {
                selectVibe(DEFAULT_VIBE);
            }
            
            // Load audio-only mode
            if (settings.isAudioOnly) {
                toggleAudioOnly();
            }
            
            // Volume will be loaded when player is ready
        } else {
            // Load default vibe
            selectVibe(DEFAULT_VIBE);
        }
    } catch (error) {
        console.error('Error loading settings:', error);
        selectVibe(DEFAULT_VIBE);
    }
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (sleepTimer) clearTimeout(sleepTimer);
    if (sleepTimerInterval) clearInterval(sleepTimerInterval);
    Player.destroy();
});

// Export for debugging
window.StudyVibesRadio = {
    Player,
    selectVibe,
    toggleAudioOnly,
    currentVibe: () => currentVibe,
    isAudioOnly: () => isAudioOnly
}; 