# Arshinagar Account Management - Backend

Backend API for the Arshinagar Real Estate Account Management System built with Express.js, TypeScript, and MongoDB.

## Features

- JWT-based authentication with access and refresh tokens
- Role-based access control (RBAC) - Admin, Account Manager, HOF
- Comprehensive audit logging
- Security best practices (Helmet, CORS, Rate Limiting, Input Sanitization)
- Error handling with consistent API responses
- Request validation using express-validator
- Structured logging with Winston

## Tech Stack

- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT (jsonwebtoken)
- **Security:** bcryptjs, helmet, cors, express-rate-limit, express-mongo-sanitize
- **Validation:** express-validator
- **Logging:** Winston, Morgan

## Prerequisites

- Node.js >= 18.0.0
- MongoDB installed and running locally or MongoDB Atlas account
- npm or yarn package manager

## Installation

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and update the following variables:
   ```env
   # Database
   MONGODB_URI=mongodb://localhost:27017/arshinagar-accounts

   # JWT Secrets (CHANGE IN PRODUCTION!)
   JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars
   JWT_REFRESH_SECRET=your-refresh-token-secret-change-in-production-min-32-chars

   # Server
   PORT=5000
   NODE_ENV=development

   # CORS
   CORS_ORIGIN=http://localhost:3000
   ```

4. **Seed initial users:**
   ```bash
   npm run seed
   ```

   This will create three default users:
   - **Admin:** admin@arshinagar.com / Admin@123
   - **Account Manager:** manager@arshinagar.com / Manager@123
   - **Head of Finance:** hof@arshinagar.com / Hof@123

   **IMPORTANT:** Change these passwords in production!

## Running the Server

### Development Mode
```bash
npm run dev
```

Server will start on http://localhost:5000 with hot-reloading.

### Production Mode
```bash
# Build TypeScript
npm run build

# Start server
npm start
```

## API Endpoints

### Health Check
```
GET /health
```

### Authentication

#### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@arshinagar.com",
  "password": "Admin@123"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGci...",
    "refreshToken": "eyJhbGci...",
    "expiresIn": 604800,
    "user": {
      "id": "...",
      "username": "admin",
      "email": "admin@arshinagar.com",
      "role": "Admin"
    }
  },
  "message": "Login successful"
}
```

#### Register (Admin Only)
```
POST /api/auth/register
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "username": "newuser",
  "email": "newuser@arshinagar.com",
  "password": "Password@123",
  "role": "AccountManager"
}
```

#### Refresh Token
```
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGci..."
}
```

#### Logout
```
POST /api/auth/logout
Authorization: Bearer {accessToken}
```

#### Get Profile
```
GET /api/auth/profile
Authorization: Bearer {accessToken}
```

#### Get All Users (Admin Only)
```
GET /api/auth/users
Authorization: Bearer {accessToken}
```

#### Update User (Admin Only)
```
PUT /api/auth/users/:id
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "username": "updatedname",
  "role": "HOF",
  "isActive": true
}
```

#### Delete User (Admin Only)
```
DELETE /api/auth/users/:id
Authorization: Bearer {accessToken}
```

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── db.ts              # MongoDB connection
│   │   └── jwt.ts             # JWT configuration
│   ├── models/
│   │   ├── User.ts            # User model with role-based access
│   │   └── AuditLog.ts        # Audit log model
│   ├── controllers/
│   │   └── authController.ts  # Authentication controllers
│   ├── routes/
│   │   └── auth.routes.ts     # Authentication routes
│   ├── middlewares/
│   │   ├── auth.middleware.ts       # JWT verification
│   │   ├── rbac.middleware.ts       # Role-based access control
│   │   ├── audit.middleware.ts      # Audit logging
│   │   ├── error.middleware.ts      # Error handling
│   │   └── validation.middleware.ts # Input validation
│   ├── utils/
│   │   ├── logger.ts          # Winston logger
│   │   └── seed.ts            # Database seeding
│   ├── types/
│   │   └── index.ts           # TypeScript types
│   └── app.ts                 # Express app setup
├── logs/                       # Application logs
├── .env.example               # Environment variables template
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## User Roles

### Admin
- Full system access
- User management (create, update, delete users)
- All configuration and settings
- SMS management
- System settings

### Head of Finance (HOF)
- Final approvals for high-value transactions
- Financial reports access
- Banking and reconciliation
- Employee cost management
- Audit logs access

### Account Manager
- Create and verify receipts & expenses
- Manage clients and sales
- Record payments
- Manage PDCs
- View reports

## Security Features

1. **Password Security:** Bcrypt hashing with salt rounds of 12
2. **JWT Tokens:** Separate access and refresh tokens
3. **Rate Limiting:**
   - General API: 100 requests per 15 minutes
   - Auth endpoints: 10 requests per 15 minutes
4. **Input Sanitization:** MongoDB injection prevention
5. **Security Headers:** Helmet middleware for security headers
6. **CORS:** Configured to allow frontend origin only
7. **Audit Logging:** All actions are logged for accountability

## Error Handling

All API responses follow a consistent format:

### Success Response
```json
{
  "success": true,
  "data": { /* result data */ },
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": { /* additional error details */ }
  }
}
```

### Common Error Codes
- `INVALID_CREDENTIALS` - Wrong email or password
- `UNAUTHORIZED` - Missing or invalid token
- `FORBIDDEN` - Insufficient permissions
- `TOKEN_EXPIRED` - Token has expired
- `VALIDATION_ERROR` - Input validation failed
- `DUPLICATE_ENTRY` - Resource already exists
- `NOT_FOUND` - Resource not found
- `INTERNAL_ERROR` - Server error

## Development Guidelines

### Code Style
- Use TypeScript strict mode
- Follow camelCase for variables/functions
- Follow PascalCase for classes/types
- Add JSDoc comments for functions
- Use async/await for asynchronous operations

### Adding New Routes
1. Create model in `src/models/`
2. Create controller in `src/controllers/`
3. Create route file in `src/routes/`
4. Add route to `src/app.ts`
5. Add middleware for authentication and authorization
6. Add audit logging if needed

### Database Conventions
- Use proper indexes for common queries
- Store dates as Date objects
- Use enums for status fields
- Implement soft delete with `isDeleted` flag
- Use references (ObjectId) for relationships

## Testing

To test the API endpoints, you can use:
- Postman
- cURL
- Thunder Client (VS Code extension)
- Any HTTP client

Example cURL request:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@arshinagar.com","password":"Admin@123"}'
```

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running: `sudo systemctl status mongod`
- Check connection string in `.env`
- Verify MongoDB is listening on port 27017

### Port Already in Use
- Change PORT in `.env` file
- Or kill the process using port 5000:
  ```bash
  lsof -i :5000
  kill -9 <PID>
  ```

### Module Not Found Errors
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again

## Production Deployment

1. **Set environment to production:**
   ```env
   NODE_ENV=production
   ```

2. **Use strong secrets:**
   - Generate secure JWT secrets (at least 32 characters)
   - Use environment variables, never commit secrets

3. **Use production MongoDB:**
   - Use MongoDB Atlas or managed MongoDB service
   - Enable authentication
   - Use connection string with credentials

4. **Enable HTTPS:**
   - Use reverse proxy (nginx, Apache)
   - Obtain SSL certificate (Let's Encrypt)

5. **Use process manager:**
   ```bash
   npm install -g pm2
   pm2 start dist/app.js --name arshinagar-api
   pm2 save
   pm2 startup
   ```

6. **Monitor logs:**
   ```bash
   pm2 logs arshinagar-api
   ```

## License

Proprietary - Arshinagar Real Estate

## Support

For issues and questions, contact the development team.
