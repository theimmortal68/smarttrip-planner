# API Integration Overview (SmartTrip Planner)

This document summarizes the API architecture and deployment details and aligns with the current repository state (Express backend with `/health` at port 3000).

## Base URLs
- **Local:** `http://localhost:3000`
- **Render (planned):** `https://<your-api>.onrender.com`

## Authentication
- Google OAuth (server verifies ID token)
- App issues a short‑lived JWT used as Bearer token for API requests

## Core Endpoints
| Route | Method | Purpose |
|------|--------|---------|
| `/health` | GET | Health probe (current repo) |
| `/api/auth/google/start` | GET | Redirect to Google OAuth |
| `/api/auth/google/callback` | GET | OAuth callback; app issues JWT |
| `/api/auth/me` | GET | Current user profile (JWT) |
| `/api/trips` | GET/POST | List or create trips (JWT) |
| `/api/trips/:id` | GET/PATCH/DELETE | Trip detail & updates (JWT) |
| `/api/trips/:id/members` | POST | Invite a member (JWT) |
| `/api/trips/:id/itinerary` | POST | Add itinerary item (JWT) |
| `/api/places/autocomplete` | GET | Places suggestions (JWT) |
| `/api/geocode` | GET | Address → lat/lng (JWT) |
| `/api/directions` | GET | Route summary (JWT) |

## Testing Tools
- **Postman/Insomnia:** manual tests and collections
- **Jest + supertest:** automated API tests (CI target ≥85% coverage)

## Deployment
- **Backend:** Render (Web Service) — build `npm ci && npm run build`; start `node src/app.js`
- **Frontend:** Vercel — set `NEXT_PUBLIC_GOOGLE_MAPS_KEY` and `API_BASE_URL`
- **Domains:** `api.smarttrip.example`, `app.smarttrip.example`

## CI/CD
- GitHub Actions: lint, test, build on pull requests; preview deploys on main

## Notes
- All sensitive credentials are set via environment variables and are not committed to the repo.
