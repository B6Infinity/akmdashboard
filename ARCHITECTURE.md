# AKM Dashboard - Microservices Architecture

This is a **production-ready, split-stack microservices application** with separate frontend and backend services.

## Directory Structure

```
akmdashboard/
├── frontend/                    # Next.js UI Service
│   ├── app/
│   │   ├── layout.js            # Root layout with fonts and global styles
│   │   ├── page.js              # Home page (renders Dashboard)
│   │   └── globals.css          # Complete theme and component styles
│   ├── components/
│   │   ├── Dashboard.jsx        # Main UI container, theme toggle, stats
│   │   └── WardMap.jsx          # Leaflet map integration
│   ├── package.json
│   ├── next.config.js
│   ├── README.md                # Frontend run instructions
│   └── .next/                   # Build output (generated)
│
├── backend/                     # Express API Service
│   ├── server.js                # Express app, /api/wards endpoint
│   ├── data/
│   │   └── wardData.js          # Ward metadata (single source of truth)
│   ├── package.json
│   ├── README.md                # Backend run instructions
│   └── node_modules/            # Dependencies (generated)
│
├── AKM_Wards.geojson            # Ward boundary polygons (shared)
└── ARCHITECTURE.md              # This file
```

## Service Responsibilities

### Backend (Express, Port 4000)

**Owns:** Ward data, GeoJSON enrichment, API contract

- Runs on `http://localhost:4000`
- Serves `GET /api/wards` → returns enriched GeoJSON
- Merges ward metadata (population, area, density) into GeoJSON features
- Reads from `wardData.js` as the single source of truth
- Reads `AKM_Wards.geojson` from parent directory
- CORS-enabled for frontend cross-origin requests

**Files:**
- `backend/server.js` – Express app entry point
- `backend/data/wardData.js` – Ward records database
- `backend/package.json` – Minimal dependencies (express, cors)

### Frontend (Next.js, Port 3000)

**Owns:** UI/UX, rendering, user interactions, state management

- Runs on `http://localhost:3000`
- Renders React components (Dashboard, WardMap)
- Fetches enriched GeoJSON from backend API
- Manages theme (light/dark) and layer visibility
- Renders Leaflet map with dynamic colors based on density
- No duplicate data – all ward info comes from backend

**Files:**
- `frontend/app/layout.js` – Root HTML structure, font imports
- `frontend/app/page.js` – Home route (imports Dashboard)
- `frontend/app/globals.css` – All styles (variables, components, theme)
- `frontend/components/Dashboard.jsx` – Sidebar, stats, ward list, controls
- `frontend/components/WardMap.jsx` – Leaflet map setup and rendering
- `frontend/package.json` – Next.js + React dependencies

## Data Flow

```
User Browser (http://localhost:3000)
     ↓
Frontend loads → fetches GET http://localhost:4000/api/wards
     ↓
Backend API → reads wardData.js + AKM_Wards.geojson
     ↓
Backend returns enriched GeoJSON with ward_id, ward_name, 
population, area_ha, density
     ↓
Frontend parses response → derives summary stats + ward list
     ↓
Renders map with Leaflet, colors by density
```

## Running Both Services

### Start Backend (Terminal 1)
```powershell
cd backend
npm run dev
# Backend running on http://localhost:4000
```

### Start Frontend (Terminal 2)
```powershell
cd frontend
npm run dev
# Frontend running on http://localhost:3000
```

### Access the App
Open browser: **http://localhost:3000**

## Production Deployment

### Backend
- Deploy `backend/` as a containerized Node.js API
- Environment: `PORT=4000` (or custom)
- Database: Replace `wardData.js` with real database queries
- GeoJSON: Host `AKM_Wards.geojson` on a CDN or database

### Frontend
- Build: `npm run build` inside `frontend/`
- Deploy static files from `.next/` to a CDN or Node.js server
- Set `NEXT_PUBLIC_BACKEND_URL` environment variable to production API

### Docker Example (Backend)
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY backend .
RUN npm install --production
EXPOSE 4000
CMD ["npm", "run", "start"]
```

### Docker Example (Frontend)
```dockerfile
FROM node:20-alpine as builder
WORKDIR /app
COPY frontend .
RUN npm install && npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/.next .next
COPY --from=builder /app/node_modules node_modules
COPY --from=builder /app/public public
COPY --from=builder /app/package.json .
EXPOSE 3000
ENV NEXT_PUBLIC_BACKEND_URL=http://api.example.com
CMD ["npm", "start"]
```

## Features

✅ **Light & Dark Mode** – Separate buttons, persistent via localStorage  
✅ **Layer Toggle** – Hide/show GeoJSON layer with toggle pill  
✅ **Responsive Design** – Sidebar collapses on mobile  
✅ **Interactive Map** – Click wards to zoom, hover for tooltip, click for popup  
✅ **Dynamic Colors** – Density gradient from light blue to dark blue  
✅ **Stats Cards** – Total population, ward count, max/avg density  
✅ **Sortable Ward List** – Sorted by density descending  
✅ **Clean UI** – No number overflow, crisp typography, consistent spacing  

## Environment Variables

### Frontend
- `NEXT_PUBLIC_BACKEND_URL` – Backend API URL (default: `http://localhost:4000`)

### Backend
- `PORT` – Server port (default: `4000`)

## Tech Stack

**Frontend:**
- Next.js 15 (App Router)
- React 19 (Client Components)
- Leaflet 1.9 (Map rendering)
- Custom CSS (variables, grid layouts)

**Backend:**
- Express.js 4 (API server)
- CORS (cross-origin support)
- Node.js 18+ (runtime)

## Notes

- This is **not a monorepo tool** (no Turbo, Nx, or Lerna) – just two independent npm projects
- Each service has its own `package.json`, `node_modules`, and build process
- The only shared file is `AKM_Wards.geojson` (referenced from backend relative path)
- Ward data is the single source of truth in `backend/data/wardData.js`
- Frontend derives all display state from the backend API response
