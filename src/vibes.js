// Study Vibes Radio - Mood Configuration
// Maps each mood to YouTube playlist ID and background video

export const VIBES = {
  lofi: {
    name: 'Lo-Fi Hip Hop',
    description: 'Chill beats to study/relax to',
    playlistId: 'PLOzDu-MXXLliO9fBNZOQTBDddoA3FzZUo', // ChilledCow Lo-Fi playlist
    background: 'lofi.mp4',
    color: '#6366f1', // indigo
    icon: '🎵'
  },
  classical: {
    name: 'Classical Focus',
    description: 'Timeless compositions for deep work',
    playlistId: 'PLYppVOa3h8VqJuKzVlGN5-WZMFmVVhXKH', // Classical study music
    background: 'classical.mp4',
    color: '#8b5cf6', // violet
    icon: '🎼'
  },
  synth: {
    name: 'Synthwave',
    description: 'Retro electronic vibes',
    playlistId: 'PLYppVOa3h8VqJuKzVlGN5-WZMFmVVhXKH', // Synthwave playlist
    background: 'synth.mp4',
    color: '#ec4899', // pink
    icon: '🌆'
  },
  nature: {
    name: 'Nature Sounds',
    description: 'Forest, rain, and ocean ambience',
    playlistId: 'PLYppVOa3h8VqJuKzVlGN5-WZMFmVVhXKH', // Nature sounds
    background: 'nature.mp4',
    color: '#10b981', // emerald
    icon: '🌿'
  },
  jazz: {
    name: 'Smooth Jazz',
    description: 'Mellow jazz for concentration',
    playlistId: 'PLYppVOa3h8VqJuKzVlGN5-WZMFmVVhXKH', // Jazz playlist
    background: 'jazz.mp4',
    color: '#f59e0b', // amber
    icon: '🎷'
  }
};

export const DEFAULT_VIBE = 'lofi';

// Fallback background color if video fails to load
export const FALLBACK_GRADIENTS = {
  lofi: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  classical: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  synth: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  nature: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  jazz: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
}; 