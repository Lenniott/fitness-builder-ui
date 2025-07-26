# Fitness Builder UI

A React-based user interface for the Fitness Builder service.

## Environment Configuration

The application uses environment variables to configure API endpoints. Create a `.env` file in the root directory with the following variables:

```bash
# For local development
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_API_ROOT_URL=http://localhost:8000

# For production/docker
# VITE_API_BASE_URL=http://your-api-server:8000/api/v1
# VITE_API_ROOT_URL=http://your-api-server:8000
```

### Default Configuration
- **Development**: Uses `localhost:8000` by default
- **Production**: Uses environment variables if set, otherwise falls back to localhost

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure API endpoints (optional):
   Create a `.env` file with your API server address

3. Run the app:
   ```bash
   npm run dev
   ```

## Build

```bash
npm run build
```

## Docker Deployment

### Using Docker Compose

1. **Build and run with docker-compose:**
   ```bash
   docker-compose up -d --build
   ```

2. **Access the application:**
   - Local: http://localhost:8888
   - Container API: http://192.168.0.47:8000

### Using Portainer

1. **Build the image:**
   ```bash
   docker build -t fitness-builder-ui .
   ```

2. **Configure in Portainer:**
   - **Image:** `fitness-builder-ui`
   - **Port:** `8888:8888`
   - **Environment Variables:**
     ```
     VITE_API_BASE_URL=http://192.168.0.47:8000/api/v1
     VITE_API_ROOT_URL=http://192.168.0.47:8000
     ```
   - **Network:** Connect to your existing network with the API server
   - **Restart Policy:** `unless-stopped`

### Environment Configuration

The application uses environment variables to configure API endpoints:

- **Development:** Uses `localhost:8000` by default
- **Production:** Uses environment variables or falls back to `localhost:8000`
- **Docker:** Configure via `VITE_API_BASE_URL` and `VITE_API_ROOT_URL`
- **Tailscale:** Use your Tailscale IP for remote access

#### Example Configurations

**Local Network:**
```bash
VITE_API_BASE_URL=http://192.168.0.47:8000/api/v1
VITE_API_ROOT_URL=http://192.168.0.47:8000
```

**Tailscale Remote Access:**
```bash
VITE_API_BASE_URL=http://100.x.x.x:8000/api/v1
VITE_API_ROOT_URL=http://100.x.x.x:8000
```

**Public Domain:**
```bash
VITE_API_BASE_URL=https://your-domain.com/api/v1
VITE_API_ROOT_URL=https://your-domain.com
```
