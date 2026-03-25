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
2. Install deps: `npm install`
3. Run: `npm run dev`

Note: the API auto-creates the table `clients` if it doesn't exist.

## API
- `POST /api/auth/register` body: `{ nom, prenom, email, tel, password }`
- `POST /api/auth/login` body: `{ email, password }`
- `GET /api/events` (header: `Authorization: Bearer <token>`)

## Architecture
- MVC with services layer
- JWT Auth
- PostgreSQL (pg)
