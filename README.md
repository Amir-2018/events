# JWT Auth Project

## Setup
1. Copy `.env.example` to `.env` and update:
   ```
   MONGO_URI=mongodb://localhost:27017/testExam
   JWT_SECRET=your_very_secure_secret_key
   PORT=3000
   ```
2. Install MongoDB or use MongoDB Atlas.
3. `npm run dev`

## API
- POST /api/auth/register {nom, prenom, email, tel, password}
- POST /api/auth/login {email, password}
- GET /api/events (Authorization: Bearer <token>)

## Architecture
- MVC with services layer
- Dependency Injection (singleton services)
- JWT Auth
- MongoDB + Mongoose
# events
