Here’s your updated README with the added paragraph (cleanly integrated):

---

# JWT Auth Project (PostgreSQL)

## Setup

1. Create/update `.env` with your Neon (or PostgreSQL) credentials and JWT secret:

   ```
   PGHOST=...
   PGDATABASE=...
   PGUSER=...
   PGPASSWORD=...
   PGPORT=5432
   PGSSLMODE=require

   JWT_SECRET=your_very_secure_secret_key
   PORT=3000
   ```

2. Install deps:
   `npm install`

3. Run:
   `npm run dev`

## Frontend Setup

To launch the frontend:

1. Navigate to the `frontend` folder
2. Install dependencies:
   `npm install`
3. Run the development server:
   `npm run dev`

## Database

The API auto-creates:

* `clients` (for auth)
* `events`
* `event_registrations` (client ↔ event)

## API

### Auth

* `POST /api/auth/register`
  body: `{ nom, prenom, email, tel, password }`

* `POST /api/auth/login`
  body: `{ email, password }`

### Events

**Public (no token):**

* `POST /api/events`
  body: `{ nom, date?, image?, adresse? }`

* `DELETE /api/events/:eventId`

* `GET /api/events/:eventId/clients`

**Protected (requires header `Authorization: Bearer <token>`):**

* `GET /api/events`
  returns events + `clients` registered for each event

* `GET /api/events/:eventId`
  returns event details + `clients`

* `POST /api/events/:eventId/register`
  registers the logged-in client to the event

## Architecture

* MVC with services layer
* JWT Authentication
* PostgreSQL (`pg`)
