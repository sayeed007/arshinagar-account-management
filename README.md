# Arshinagar Account Management System

A comprehensive real estate and financial management system for Arshinagar, featuring multi-language support, advanced reporting, and complete workflow automation.

## Overview

This is a full-stack application designed to digitize and streamline the accounting and management processes for a real estate business. The system handles everything from land management and plot sales to financial tracking, employee management, and automated SMS notifications.

## Features

### Core Modules
- **Land Management**: Track RS numbers, plots, and land parcels
- **Sales Management**: Complete plot sales workflow with approval system
- **Client Management**: Customer database with transaction history
- **Collections**: Payment tracking and installment management
- **Refunds**: Refund processing with approval workflow
- **Banking**: Multi-account management with cheque tracking
- **Expense Management**: Categorized expenses with approval queue
- **Employee Management**: Staff records, payroll, and attendance
- **Reports**: Comprehensive financial and operational reports

### Key Features
- **Multi-language Support**: English and Bengali (বাংলা)
- **Role-based Access Control**: Admin, Manager, Accountant, and Sales roles
- **Approval Workflows**: Multi-level approval for sales, refunds, and expenses
- **Dark/Light Mode**: Theme switching support
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Real-time Notifications**: SMS integration for important events
- **Audit Trail**: Complete transaction history and logging

## Tech Stack

### Frontend
- **Framework**: Next.js 16 (React 19)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Internationalization**: next-intl
- **UI Components**: Radix UI
- **Charts**: Recharts
- **State Management**: React Context
- **HTTP Client**: Axios

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT
- **Validation**: express-validator
- **API Documentation**: Swagger/OpenAPI
- **Security**: Helmet, CORS, Rate Limiting
- **Logging**: Winston + Morgan

## Project Structure

```
arshinagar-account-management/
├── frontend/                 # Next.js frontend application
│   ├── app/                 # App router pages
│   ├── components/          # React components
│   ├── lib/                 # Utilities and configurations
│   ├── messages/            # i18n translation files
│   └── public/              # Static assets
│
├── backend/                 # Express.js backend API
│   ├── src/
│   │   ├── controllers/    # Request handlers
│   │   ├── models/         # Mongoose schemas
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── middlewares/    # Custom middleware
│   │   ├── config/         # Configuration files
│   │   └── utils/          # Helper functions
│   └── dist/               # Compiled JavaScript
│
└── docs/                    # Project documentation
    ├── DEPLOYMENT_GUIDE.md
    ├── IMPLEMENTATION_GUIDE.md
    └── SOW_Real_Estate_Accounts_Digitization_v1.1.md
```

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- MongoDB instance (local or MongoDB Atlas)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd arshinagar-account-management
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install

   # Create .env file
   cp .env.example .env
   # Edit .env with your configuration

   # Run development server
   npm run dev
   ```

3. **Setup Frontend**
   ```bash
   cd frontend
   npm install

   # Create .env.local file with:
   # NEXT_PUBLIC_API_URL=http://localhost:5000

   # Run development server
   npm run dev
   ```

4. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - API Documentation: http://localhost:5000/api-docs

### Database Setup

**Seed the database with initial data:**
```bash
cd backend
npm run seed:full
```

This will create:
- Default admin user
- Sample data for testing
- SMS templates
- System configurations

**Default Admin Credentials:**
- Username: `admin`
- Password: `admin123`

## Environment Variables

### Backend (.env)
```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/arshinagar

# JWT
JWT_SECRET=your-secret-key-here
JWT_EXPIRE=7d

# CORS (supports multiple origins, comma-separated)
CORS_ORIGIN=http://localhost:3000,https://your-app.vercel.app
# Note: All *.vercel.app domains are automatically allowed

# SMS (Optional)
SMS_API_KEY=your-sms-api-key
SMS_SENDER_ID=your-sender-id
```

### Frontend (.env.local)
```env
# API Endpoint
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## Deployment

The application is configured for easy deployment:

- **Frontend**: Vercel (with `/frontend` as root directory)
- **Backend**: Render.com
- **Database**: MongoDB Atlas (Free tier)

See [DEPLOYMENT_GUIDE.md](./docs/DEPLOYMENT_GUIDE.md) for detailed deployment instructions.

### Quick Deploy

**Backend (Render):**
- Root Directory: `backend`
- Build Command: `npm install && npm run build`
- Start Command: `npm start`

**Frontend (Vercel):**
- Root Directory: `frontend`
- Framework: Next.js
- Build Command: `npm run build`
- Output Directory: `.next`

## Recent Fixes

### CORS Configuration Enhancement
Fixed CORS errors when accessing backend from Vercel deployments:
- Updated CORS configuration to support multiple origins (comma-separated)
- Automatically allows all `*.vercel.app` domains for preview deployments
- Supports both production and preview URLs from Vercel
- See: `backend/src/app.ts:55-84`

### Vercel Middleware Error Fix
Fixed `MIDDLEWARE_INVOCATION_FAILED` error when deploying from monorepo:
- Converted dynamic imports to static imports in `frontend/lib/i18n/request.ts`
- Ensures Edge Runtime compatibility on Vercel
- See commit: `d87b2c6` and latest fix

## Available Scripts

### Backend
```bash
npm run dev          # Start development server with hot reload
npm run build        # Build for production
npm start            # Start production server
npm run seed:full    # Seed database with sample data
npm test             # Run tests
npm run lint         # Run ESLint
```

### Frontend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
```

## Documentation

- [Deployment Guide](./docs/DEPLOYMENT_GUIDE.md) - How to deploy to production
- [Implementation Guide](./docs/IMPLEMENTATION_GUIDE.md) - Development guidelines
- [Statement of Work](./docs/SOW_Real_Estate_Accounts_Digitization_v1.1.md) - Project requirements

## API Documentation

When running the backend, interactive API documentation is available at:
- Swagger UI: `http://localhost:5000/api-docs`

## Security

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting on sensitive endpoints
- MongoDB injection prevention
- CORS configuration
- Helmet security headers
- Input validation and sanitization

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

ISC

## Support

For issues and questions, please refer to the documentation in the `docs/` folder or contact the development team.

---

**Built with:** Next.js, React, TypeScript, Express, MongoDB, and Tailwind CSS
