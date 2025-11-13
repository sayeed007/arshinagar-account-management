import swaggerJsdoc from 'swagger-jsdoc';
import { Options } from 'swagger-jsdoc';

const options: Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Arshinagar Account Management API',
      version: '1.0.0',
      description: `
# Arshinagar Account Management System API

A comprehensive real estate and land management system API for managing:
- **Clients**: Customer information and profiles
- **Land Management**: RS Numbers, Plots, Land inventory
- **Sales**: Property sales, stages, and tracking
- **Receipts & Payments**: Payment processing with multi-level approval
- **Installments**: Payment schedules and tracking
- **Cheques**: PDC and current cheque management
- **Expenses**: Company expenses with approval workflow
- **Employees**: Staff management and payroll
- **Cancellations & Refunds**: Sale cancellations and refund processing
- **Bank Accounts**: Bank and cash account management
- **Reports**: Financial and operational reports
- **SMS**: SMS templates and notification system
- **Settings**: System configuration and settings

## Authentication
All API endpoints require JWT authentication. Include the token in the Authorization header:
\`\`\`
Authorization: Bearer <your_jwt_token>
\`\`\`

## Response Format
All API responses follow this structure:
\`\`\`json
{
  "success": true,
  "data": { ... },
  "message": "Success message",
  "pagination": {
    "total": 100,
    "page": 1,
    "totalPages": 10
  }
}
\`\`\`

Error responses:
\`\`\`json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description",
    "details": { ... }
  }
}
\`\`\`

## Approval Workflow
Many entities (Receipts, Expenses, Refunds) use a multi-level approval workflow:
1. **Draft** → 2. **Pending Accounts** → 3. **Pending HOF** → 4. **Approved**

## Roles
- **Admin**: Full system access
- **Account Manager**: Manage transactions, first-level approvals
- **HOF (Head of Finance)**: Final approvals, financial oversight
      `,
      contact: {
        name: 'API Support',
        email: 'support@arshinagar.com',
      },
      license: {
        name: 'Private',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000/api',
        description: 'Development server',
      },
      {
        url: 'https://api.arshinagar.com/api',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token obtained from /auth/login endpoint',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            error: {
              type: 'object',
              properties: {
                code: {
                  type: 'string',
                  example: 'VALIDATION_ERROR',
                },
                message: {
                  type: 'string',
                  example: 'Validation failed',
                },
                details: {
                  type: 'object',
                  additionalProperties: true,
                },
              },
            },
          },
        },
        Pagination: {
          type: 'object',
          properties: {
            total: {
              type: 'number',
              example: 100,
            },
            page: {
              type: 'number',
              example: 1,
            },
            totalPages: {
              type: 'number',
              example: 10,
            },
            limit: {
              type: 'number',
              example: 10,
            },
          },
        },
        Client: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            clientNumber: { type: 'string', example: 'CLT-2024-00001' },
            name: { type: 'string', example: 'Ahmed Rahman' },
            fatherName: { type: 'string', example: 'Abdul Rahman' },
            phone: { type: 'string', example: '+8801712345678' },
            alternatePhone: { type: 'string', example: '+8801812345678' },
            email: { type: 'string', example: 'ahmed@example.com' },
            nid: { type: 'string', example: '1234567890123' },
            address: { type: 'string', example: 'Dhaka, Bangladesh' },
            notes: { type: 'string', example: 'VIP client' },
            isActive: { type: 'boolean', example: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Sale: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            saleNumber: { type: 'string', example: 'SAL-2024-00001' },
            clientId: { type: 'string' },
            plot: {
              type: 'object',
              properties: {
                plotId: { type: 'string' },
                plotNumber: { type: 'string' },
                rsNumber: { type: 'string' },
                area: { type: 'number' },
                unitType: { type: 'string', enum: ['Katha', 'Bigha', 'Acre', 'Decimal', 'Square Feet'] },
                pricePerUnit: { type: 'number' },
                project: { type: 'string' },
              },
            },
            totalPrice: { type: 'number', example: 5000000 },
            paidAmount: { type: 'number', example: 1000000 },
            dueAmount: { type: 'number', example: 4000000 },
            saleDate: { type: 'string', format: 'date' },
            status: {
              type: 'string',
              enum: ['Active', 'Completed', 'Cancelled', 'OnHold'],
              example: 'Active',
            },
            stages: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  _id: { type: 'string' },
                  stageName: { type: 'string', enum: ['Booking', 'Installments', 'Registration', 'Handover', 'Other'] },
                  plannedAmount: { type: 'number' },
                  receivedAmount: { type: 'number' },
                  dueAmount: { type: 'number' },
                  status: { type: 'string', enum: ['Pending', 'InProgress', 'Completed', 'Cancelled'] },
                },
              },
            },
          },
        },
        Receipt: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            receiptNumber: { type: 'string', example: 'RCP-2024-00001' },
            clientId: { type: 'string' },
            saleId: { type: 'string' },
            stageId: { type: 'string' },
            installmentId: { type: 'string' },
            receiptType: { type: 'string', enum: ['Sale', 'Installment', 'Advance', 'Registration', 'Other'] },
            amount: { type: 'number', example: 100000 },
            method: { type: 'string', enum: ['Cash', 'Bank Transfer', 'Cheque', 'PDC', 'Mobile Banking'] },
            receiptDate: { type: 'string', format: 'date' },
            approvalStatus: {
              type: 'string',
              enum: ['Draft', 'Pending Accounts', 'Pending HOF', 'Approved', 'Rejected'],
            },
            postedToLedger: { type: 'boolean' },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    tags: [
      { name: 'Auth', description: 'Authentication endpoints' },
      { name: 'Users', description: 'User management' },
      { name: 'Clients', description: 'Client/Customer management' },
      { name: 'Land', description: 'RS Numbers and Plots management' },
      { name: 'Sales', description: 'Property sales management' },
      { name: 'Receipts', description: 'Payment receipts and processing' },
      { name: 'Installments', description: 'Payment schedules' },
      { name: 'Cheques', description: 'Cheque management' },
      { name: 'Expenses', description: 'Company expenses' },
      { name: 'Employees', description: 'Employee management' },
      { name: 'Cancellations', description: 'Sale cancellations and refunds' },
      { name: 'Reports', description: 'Financial and operational reports' },
      { name: 'SMS', description: 'SMS templates and notifications' },
      { name: 'Settings', description: 'System settings' },
      { name: 'Bank Accounts', description: 'Bank account management' },
    ],
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'], // Path to the API routes
};

export const swaggerSpec = swaggerJsdoc(options);
