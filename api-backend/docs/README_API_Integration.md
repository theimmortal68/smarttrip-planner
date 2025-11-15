# SmartTrip Planner – API Integration README

The API backend in `/api-backend` exposes:

- `GET /health`
- `GET /api/trips`
- `POST /api/trips`
- `GET /api/trips/:id`
- `PATCH /api/trips/:id`
- `DELETE /api/trips/:id`
- `POST /api/trips/:id/members`
- `POST /api/trips/:id/itinerary`
- `GET /api/places/autocomplete`

Auth: `Authorization: Bearer <JWT>` with claims `{ sub, email, role }`.  
Error shape: `{ "error": { "code": number, "message": string } }`.
