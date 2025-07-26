# Environment Configuration Guide

This guide explains how to configure the Fitness Builder UI for different deployment scenarios.

## Configuration Overview

The UI uses environment variables to connect to the Fitness Builder API service. The API serves:
- **API endpoints** at `/api/v1/*`
- **Video files** at `/storage/*` (newly added)

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Base URL for API endpoints | `http://192.168.0.47:8000/api/v1` |
| `VITE_API_ROOT_URL` | Root URL for video files | `http://192.168.0.47:8000` |

## Deployment Scenarios

### 1. Local Development

**Default behavior** - no environment variables needed:
- API Base: `http://localhost:8000/api/v1`
- API Root: `http://localhost:8000`

### 2. Local Network (LAN)

Create a `.env` file:
```bash
VITE_API_BASE_URL=http://192.168.0.47:8000/api/v1
VITE_API_ROOT_URL=http://192.168.0.47:8000
```

### 3. Tailscale Remote Access

Create a `.env` file with your Tailscale IP:
```bash
VITE_API_BASE_URL=http://100.x.x.x:8000/api/v1
VITE_API_ROOT_URL=http://100.x.x.x:8000
```

**To find your Tailscale IP:**
```bash
tailscale ip
```

### 4. Docker/Portainer

Set environment variables in Portainer:
```
VITE_API_BASE_URL=http://192.168.0.47:8000/api/v1
VITE_API_ROOT_URL=http://192.168.0.47:8000
```

### 5. Public Domain

For production deployment:
```bash
VITE_API_BASE_URL=https://your-domain.com/api/v1
VITE_API_ROOT_URL=https://your-domain.com
```

## Video File Access

The API now serves video files at the `/storage` path. For example:
- API returns: `"video_path": "storage/clips/filename.mp4"`
- UI loads: `http://your-api-host:8000/storage/clips/filename.mp4`

## Testing Configuration

1. **Check API connectivity:**
   ```bash
   curl http://your-api-host:8000/health
   ```

2. **Check video file access:**
   ```bash
   curl -I http://your-api-host:8000/storage/clips/filename.mp4
   ```

3. **Check environment variables:**
   Open browser console in development mode to see logged URLs.

## Troubleshooting

### Videos Not Loading
1. Verify API is serving static files at `/storage`
2. Check network connectivity to API host
3. Verify video files exist in API storage volume
4. Check browser console for URL construction logs

### API Connection Issues
1. Verify API service is running
2. Check firewall/network settings
3. Verify environment variables are set correctly
4. Test with curl or browser directly

### Tailscale Issues
1. Ensure both devices are on Tailscale network
2. Use Tailscale IP, not local IP
3. Check Tailscale ACLs allow traffic
4. Verify API service is accessible via Tailscale 