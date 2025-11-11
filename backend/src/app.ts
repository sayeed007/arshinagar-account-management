import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware';
import { sanitizeInput } from './middlewares/validation.middleware';
import { logger } from './utils/logger';

// Import routes
import authRoutes from './routes/auth.routes';
import clientRoutes from './routes/client.routes';
import landRoutes from './routes/land.routes';
import saleRoutes from './routes/sale.routes';
import installmentRoutes from './routes/installment.routes';
import receiptRoutes from './routes/receipt.routes';
import expenseCategoryRoutes from './routes/expenseCategory.routes';
import expenseRoutes from './routes/expense.routes';
import employeeRoutes from './routes/employee.routes';
import employeeCostRoutes from './routes/employeeCost.routes';
import cancellationRoutes from './routes/cancellation.routes';
import refundRoutes from './routes/refund.routes';
import bankAccountRoutes from './routes/bankAccount.routes';
import cashAccountRoutes from './routes/cashAccount.routes';
import chequeRoutes from './routes/cheque.routes';

// Load environment variables
dotenv.config();

// Create Express app
const app: Application = express();

// Connect to MongoDB
connectDB();

// Trust proxy (for deployment behind reverse proxy like nginx)
app.set('trust proxy', 1);

// Security Middleware
app.use(helmet()); // Security headers
app.use(mongoSanitize()); // Prevent MongoDB injection

// CORS Configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests from this IP, please try again later',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to all routes
app.use('/api/', limiter);

// Stricter rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per windowMs
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many authentication attempts, please try again later',
    },
  },
});

app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Body Parser Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Sanitize input
app.use(sanitizeInput);

// Logging Middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(
    morgan('combined', {
      stream: {
        write: (message: string) => logger.info(message.trim()),
      },
    })
  );
}

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/land', landRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/installments', installmentRoutes);
app.use('/api/receipts', receiptRoutes);
app.use('/api/expense-categories', expenseCategoryRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/employee-costs', employeeCostRoutes);
app.use('/api/cancellations', cancellationRoutes);
app.use('/api/refunds', refundRoutes);
app.use('/api/bank-accounts', bankAccountRoutes);
app.use('/api/cash-accounts', cashAccountRoutes);
app.use('/api/cheques', chequeRoutes);

// Welcome Route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to Arshinagar Account Management API',
    version: '1.0.0',
    documentation: '/api/docs',
  });
});

// 404 Handler (must be after all routes)
app.use(notFoundHandler);

// Global Error Handler (must be last)
app.use(errorHandler);

// Start Server
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  logger.info(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  logger.error('Unhandled Rejection:', err);
  // Close server & exit process
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
  logger.error('Uncaught Exception:', err);
  // Close server & exit process
  server.close(() => {
    process.exit(1);
  });
});

export default app;
