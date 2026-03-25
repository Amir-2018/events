# JWT Auth Project - COMPLETE ✅

## All Steps Completed:
1. package.json deps & scripts ✓
2. .env.example ✓
3. models/client.model.js ✓
4. models/auth.model.js ✓
5. services/authService.js ✓
6. services/eventService.js ✓
7. controllers/authController.js ✓
8. controllers/eventController.js ✓
9. middleware/authMiddleware.js ✓
10. routes/authRoutes.js ✓
11. routes/eventRoutes.js ✓
12. app.js ✓
13. .gitignore & README.md ✓
14. cors installed ✓

## Run the project:
1. Copy `.env.example` → `.env` and set your `MONGO_URI` (local MongoDB or Atlas) and `JWT_SECRET`.
2. `npm run dev`
3. Test API:
   - POST `http://localhost:3000/api/auth/register` body: `{"nom":"Doe","prenom":"John","email":"john@example.com","tel":"0123456789","password":"password123"}`
   - POST `http://localhost:3000/api/auth/login` body: `{"email":"john@example.com","password":"password123"}`
   - GET `http://localhost:3000/api/events` header: `Authorization: Bearer YOUR_TOKEN`

## Features:
- Client inscription avec hash password
- JWT authentication
- Liste événements protégée
- Couplage faible (services injectés)
- Gestion erreurs, CORS

Project fully implemented! 🚀
