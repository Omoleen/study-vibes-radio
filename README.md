# 🎧 Study Vibes Radio

> **One-click ambience for studying.** Choose your mood and focus with curated playlists and animated backgrounds.

A beautiful, fully-static web app that creates the perfect study atmosphere with YouTube playlists and animated backgrounds. Built with vanilla JavaScript and designed to work offline as a Progressive Web App.

## ✨ Features

### 🎵 **Core Features**
- **5 Curated Moods**: Lo-Fi Hip Hop, Classical Focus, Synthwave, Nature Sounds, and Smooth Jazz
- **YouTube Integration**: Seamless playlist streaming with custom controls
- **Animated Backgrounds**: Mood-matched video backgrounds with fallback gradients
- **Persistent Settings**: Remembers your last mood, volume, and preferences
- **Sleep Timer**: Auto-pause after 30min, 1hr, 1.5hr, or 2hr
- **Audio-Only Mode**: Hide video player to save bandwidth

### ⌨️ **Keyboard Shortcuts**
- `Space` - Play/Pause
- `←` / `→` - Previous/Next track
- `M` - Mute/Unmute
- `?` - Show/Hide keyboard shortcuts help
- `Escape` - Close help modal

### 🔧 **Accessibility & Performance**
- **Full Keyboard Navigation**: All controls accessible via keyboard
- **Screen Reader Support**: Proper ARIA labels and semantic HTML
- **Reduced Motion**: Respects `prefers-reduced-motion` setting
- **High Contrast**: Adapts to `prefers-contrast: high`
- **Responsive Design**: Works beautifully on desktop, tablet, and mobile
- **Progressive Web App**: Install to home screen, works offline

### 📱 **Progressive Web App Features**
- **Installable**: Add to home screen on mobile/desktop
- **Offline Support**: Core functionality works without internet
- **Background Sync**: Intelligent caching for smooth experience
- **App Shortcuts**: Quick access to favorite moods from home screen

## 🚀 Quick Start

### Option 1: GitHub Pages (Recommended)
1. Fork this repository
2. Go to Settings → Pages
3. Set source to "Deploy from a branch" → `main` → `/ (root)`
4. Your app will be live at `https://yourusername.github.io/study-vibes-radio`

### Option 2: Local Development
```bash
# Clone the repository
git clone https://github.com/yourusername/study-vibes-radio.git
cd study-vibes-radio

# Serve with any static server
python -m http.server 8000
# or
npx serve .
# or
php -S localhost:8000

# Open http://localhost:8000
```

## 📁 Project Structure

```
study-vibes-radio/
├── index.html              # Main HTML file
├── manifest.json           # PWA manifest
├── sw.js                   # Service worker
├── src/
│   ├── main.js            # Main application logic
│   ├── player.js          # YouTube player wrapper
│   ├── vibes.js           # Mood configurations
│   └── styles.css         # All styles
├── public/
│   ├── bg/                # Background videos
│   │   ├── lofi.mp4
│   │   ├── classical.mp4
│   │   ├── synth.mp4
│   │   ├── nature.mp4
│   │   └── jazz.mp4
│   └── icon-*.png         # PWA icons
└── README.md
```

## 🎨 Customization

### Adding New Moods
1. **Edit `src/vibes.js`**:
```javascript
export const VIBES = {
  // ... existing moods
  newmood: {
    name: 'New Mood',
    description: 'Description of the mood',
    playlistId: 'YOUTUBE_PLAYLIST_ID',
    background: 'newmood.mp4',
    color: '#ff6b6b',
    icon: '🎶'
  }
};
```

2. **Add background video**: Place `newmood.mp4` in `public/bg/`
3. **Add fallback gradient**: Update `FALLBACK_GRADIENTS` in `vibes.js`

### Finding YouTube Playlist IDs
1. Go to any YouTube playlist
2. Copy the URL: `https://www.youtube.com/playlist?list=PLrAl6rU75CvOAjCVCG4yUiVWcVmODaJr8`
3. The playlist ID is everything after `list=`: `PLrAl6rU75CvOAjCVCG4yUiVWcVmODaJr8`

### Styling Customization
- **Colors**: Edit CSS custom properties in `src/styles.css`
- **Fonts**: Change the Google Fonts import in `index.html`
- **Layout**: Modify the grid and flexbox layouts in the CSS

## 🛠️ Technical Details

### Architecture
- **Vanilla JavaScript**: No frameworks, just clean ES6+ modules
- **CSS Grid & Flexbox**: Modern, responsive layouts
- **YouTube IFrame API**: Embedded playlists with custom controls
- **Local Storage**: Persistent user preferences
- **Service Worker**: Offline functionality and caching

### Browser Support
- **Modern browsers**: Chrome 60+, Firefox 55+, Safari 12+, Edge 79+
- **Mobile**: iOS Safari 12+, Chrome Mobile 60+
- **PWA features**: Chrome 67+, Firefox 79+, Safari 14+

### Performance
- **Lazy Loading**: Background videos load as needed
- **Efficient Caching**: Service worker caches static assets
- **Optimized Images**: Icons optimized for different screen densities
- **Minimal Bundle**: ~15KB gzipped (excluding videos)

## 🚀 Deployment

### GitHub Pages
1. Push your code to a GitHub repository
2. Go to Settings → Pages
3. Select "Deploy from a branch" → `main` → `/ (root)`
4. Your site will be available at `https://username.github.io/repo-name`

### Netlify
1. Connect your GitHub repository
2. Build command: (leave empty)
3. Publish directory: `./`
4. Deploy!

### Vercel
1. Import your GitHub repository
2. Framework preset: Other
3. Build command: (leave empty)
4. Output directory: `./`
5. Deploy!

### Custom Domain
1. Add your domain to your hosting provider
2. Update the `start_url` in `manifest.json`
3. Update any absolute URLs in the code

## 📝 Adding Background Videos

### Video Requirements
- **Format**: MP4 (H.264 codec recommended)
- **Resolution**: 1920x1080 or higher
- **Duration**: 30 seconds to 2 minutes (will loop)
- **Size**: Keep under 5MB for good performance
- **Content**: Abstract patterns, nature scenes, or mood-appropriate visuals

### Video Sources
- **Free**: Pixabay, Pexels, Unsplash (video sections)
- **Premium**: Shutterstock, Adobe Stock, Getty Images
- **AI-Generated**: RunwayML, Stable Video Diffusion

### Optimization
```bash
# Use FFmpeg to optimize videos
ffmpeg -i input.mp4 -c:v libx264 -crf 28 -preset slow -c:a aac -b:a 128k output.mp4
```

## 🔧 Development

### Local Development
```bash
# Install a simple HTTP server
npm install -g http-server

# Run the server
http-server -p 8000

# Or use Python
python -m http.server 8000
```

### Testing PWA Features
1. **Chrome DevTools**: Application tab → Service Workers
2. **Lighthouse**: Run PWA audit
3. **Mobile Testing**: Chrome DevTools → Device Mode
4. **Offline Testing**: Network tab → Offline

### Debugging
- **Console Logs**: Check browser console for errors
- **Service Worker**: Chrome DevTools → Application → Service Workers
- **Storage**: Application → Storage → Local Storage
- **Network**: Network tab to check failed requests

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Ideas for Contributions
- **New Moods**: Add more music genres or ambient sounds
- **Visualizations**: Audio-reactive background animations
- **Pomodoro Timer**: Built-in focus timer with breaks
- **Custom Playlists**: Let users add their own YouTube playlists
- **Themes**: Light/dark mode toggle
- **Analytics**: Usage tracking (privacy-friendly)

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- **YouTube**: For the incredible music content
- **Inter Font**: Beautiful typography by Rasmus Andersson
- **Heroicons**: Clean, consistent icons
- **MDN Web Docs**: Excellent PWA documentation
- **The Study Community**: For inspiring focus and productivity

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/study-vibes-radio/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/study-vibes-radio/discussions)
- **Email**: your.email@example.com

---

**Made with ❤️ for students and focus enthusiasts worldwide.**

*Happy studying! 🎓*