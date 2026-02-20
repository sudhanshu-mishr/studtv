# MovieStream

A simple movie streaming site powered by VidKing API.

## Features
- Watch movies using VidKing embed.
- Switch between movies using TMDB ID.
- Responsive dark theme.

## Deployment on Render

This project is configured for deployment on Render as a Static Site.

### Automatic Deployment
1. Connect your GitHub repository to Render.
2. Render will automatically detect `render.yaml` and configure the service.
3. If not using `render.yaml`, create a **Static Site** service with the following settings:
   - **Build Command:** `echo "Skipping build"` (or leave empty if supported)
   - **Publish Directory:** `.`

### Manual Deployment
You can also deploy manually by uploading the files to a static hosting provider.
