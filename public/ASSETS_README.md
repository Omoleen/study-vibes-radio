# Assets Required

This directory needs the following assets to be fully functional:

## PWA Icons (Required)
Create these PNG icons for the Progressive Web App:

- `icon-72.png` (72x72)
- `icon-96.png` (96x96)
- `icon-128.png` (128x128)
- `icon-144.png` (144x144)
- `icon-152.png` (152x152)
- `icon-192.png` (192x192)
- `icon-384.png` (384x384)
- `icon-512.png` (512x512)

### Creating Icons
1. **Design**: Create a 512x512 icon with the 🎧 headphones theme
2. **Tools**: Use Figma, Canva, or online icon generators
3. **Resize**: Use tools like [RealFaviconGenerator](https://realfavicongenerator.net/) to create all sizes
4. **Style**: Modern, clean design with good contrast

## Background Videos (Required)
Add these MP4 files to the `bg/` directory:

- `lofi.mp4` - Chill, abstract patterns or cozy study scenes
- `classical.mp4` - Elegant, flowing visuals or classical instruments
- `synth.mp4` - Neon, retro-futuristic animations
- `nature.mp4` - Forest, rain, or ocean scenes
- `jazz.mp4` - Smooth, warm visuals or jazz club atmosphere

### Video Requirements
- **Format**: MP4 (H.264 codec)
- **Resolution**: 1920x1080 minimum
- **Duration**: 30 seconds to 2 minutes (will loop)
- **Size**: Under 5MB each for good performance
- **Content**: Abstract, non-distracting visuals that match the mood

### Video Sources
**Free Options:**
- [Pixabay](https://pixabay.com/videos/) - Free stock videos
- [Pexels](https://www.pexels.com/videos/) - High-quality free videos
- [Unsplash](https://unsplash.com/videos) - Beautiful free video content

**Premium Options:**
- [Shutterstock](https://www.shutterstock.com/video)
- [Adobe Stock](https://stock.adobe.com/video)
- [Getty Images](https://www.gettyimages.com/videos)

**AI-Generated:**
- [RunwayML](https://runwayml.com/) - AI video generation
- [Stable Video Diffusion](https://stability.ai/) - Open-source AI video

### Video Optimization
Use FFmpeg to optimize your videos:

```bash
# Optimize for web
ffmpeg -i input.mp4 -c:v libx264 -crf 28 -preset slow -c:a aac -b:a 128k -movflags +faststart output.mp4

# Reduce file size further
ffmpeg -i input.mp4 -vf scale=1280:720 -c:v libx264 -crf 30 -preset slow -c:a aac -b:a 96k output.mp4
```

## Screenshots (Optional)
For better PWA experience, add:

- `screenshot-wide.png` (1280x720) - Desktop view
- `screenshot-narrow.png` (640x1136) - Mobile view

## Fallback Behavior
The app will work without these assets but with reduced functionality:
- **Missing icons**: Browser will use default app icon
- **Missing videos**: Gradient backgrounds will be used instead
- **Missing screenshots**: PWA install prompt may be less appealing

## Quick Setup
1. Create or download the required assets
2. Place them in the appropriate directories
3. Ensure file names match exactly
4. Test the app locally before deploying

The app is designed to gracefully handle missing assets, so you can add them incrementally! 