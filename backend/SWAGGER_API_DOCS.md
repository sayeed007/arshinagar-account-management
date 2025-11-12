# Swagger API Documentation

The Arshinagar Account Management System now includes comprehensive API documentation powered by Swagger/OpenAPI 3.0.

## 🚀 Quick Start

### Accessing the Documentation

Once the backend server is running, access the Swagger UI at:

```
http://localhost:5000/api/docs
```

### Getting the OpenAPI JSON

Download the OpenAPI specification in JSON format:

```
http://localhost:5000/api/docs.json
```

This JSON can be imported into:
- **Postman**: File → Import → Paste URL
- **Insomnia**: Create → Import from URL
- **Bruno**: Collection → Import Collection

## 🔐 Authentication

Most API endpoints require authentication. To use them in Swagger UI:

1. **Login** using the `/auth/login` endpoint:
   - Click "Try it out"
   - Enter credentials (e.g., `admin@arshinagar.com` / `Admin@123`)
   - Click "Execute"
   - Copy the `accessToken` from the response

2. **Authorize**:
   - Click the "Authorize" button at the top
   - Paste the token in the format: `Bearer <your_token>`
   - Click "Authorize"
   - Click "Close"

Now all authenticated endpoints will include your token automatically!

## 📚 API Categories

The API is organized into the following categories:

### Auth
- User login/logout
- Token refresh
- User registration (Admin only)
- Profile management

### Clients
- Create, read, update, delete clients
- Search clients
- Client statistics

### Land Management
- RS Numbers management
- Plots management
- Land inventory

### Sales
- Property sales tracking
- Multi-stage payment tracking (Booking, Installments, Registration, Handover)
- Sale status management

### Receipts
- Payment receipt processing
- Multi-level approval workflow
- Ledger posting

### Installments
- Payment schedule management
- Installment tracking
- Due date management

### Cheques
- PDC and current cheque management
- Cheque status tracking (Pending, Cleared, Bounced)
- Cheque clearance workflow

### Expenses
- Company expense tracking
- Approval workflow
- Expense categories

### Employees
- Employee management
- Payroll tracking
- Employee cost management

### Cancellations & Refunds
- Sale cancellations
- Refund processing
- Refund installment schedules

### Reports
- Day Book
- Cash Book
- Bank Book
- Customer Statements
- Aging Reports
- Stage-wise Collection Reports
- Expense Reports
- Employee Cost Summaries

### SMS
- SMS template management
- Bulk SMS sending
- SMS logs and delivery tracking

### Settings
- System configuration
- Lock date management
- Office charge percentage

### Bank Accounts
- Bank account management
- Cash account management

## 🧪 Testing with Seed Data

To test the API with realistic data:

```bash
# Seed the database with 1 year of comprehensive data
npm run seed:full
```

This creates:
- 80 clients
- 60 sales
- 720+ installments
- 300+ receipts
- 100+ expenses
- And much more!

Now you can use Swagger UI to:
- Browse existing records
- Test filtering and pagination
- Try CRUD operations
- Test approval workflows

## 📊 Sample Workflows

### 1. Create a New Sale

1. **POST /clients** - Create a new client
2. **GET /land/plots?status=Available** - Find available plots
3. **POST /sales** - Create a sale linking client and plot
4. **GET /sales/{id}** - View the created sale with stages

### 2. Process a Payment

1. **GET /sales** - Get list of sales
2. **POST /receipts** - Create a receipt for a sale
3. **PUT /receipts/{id}/approve** - Approve receipt (Accounts Manager)
4. **PUT /receipts/{id}/approve** - Approve receipt (HOF)
5. **GET /receipts/{id}** - Verify receipt is approved and posted to ledger

### 3. Generate a Report

1. **POST /auth/login** - Login as user
2. **GET /reports/day-book?startDate=2024-01-01&endDate=2024-01-31** - Generate Day Book
3. **GET /reports/customer-statement?clientId=xxx** - Get customer statement

## 🛠️ Advanced Features

### Pagination

Most list endpoints support pagination:

```
GET /clients?page=1&limit=20
```

Response includes:
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "total": 100,
    "page": 1,
    "totalPages": 5,
    "limit": 20
  }
}
```

### Filtering

Filter results using query parameters:

```
GET /clients?isActive=true&search=Ahmed
GET /receipts?approvalStatus=Approved
GET /expenses?status=Approved
```

### Sorting

Sort results:

```
GET /clients?sortBy=name&sortOrder=asc
GET /sales?sortBy=createdAt&sortOrder=desc
```

## 🎯 Response Format

### Success Response

```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful",
  "pagination": { ... }
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "field": "error message"
    }
  }
}
```

## 🔒 Approval Workflow

Many entities follow this approval flow:

1. **Draft** - Initial state
2. **Pending Accounts** - Submitted for accounts approval
3. **Pending HOF** - Pending Head of Finance approval
4. **Approved** - Fully approved, posted to ledger
5. **Rejected** - Rejected at any stage

Entities with approval workflow:
- Receipts
- Expenses
- Refunds

## 🌐 Deployment

### Production URL

In production, access Swagger at:

```
https://api.arshinagar.com/api/docs
```

### Environment Variables

Ensure these are set:

```env
CORS_ORIGIN=https://your-frontend-domain.com
NODE_ENV=production
```

## 📝 Adding New Documentation

To document a new endpoint, add a Swagger comment block:

```typescript
/**
 * @swagger
 * /your-endpoint:
 *   post:
 *     summary: Short description
 *     description: Detailed description
 *     tags: [Category]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               field:
 *                 type: string
 *     responses:
 *       200:
 *         description: Success
 */
router.post('/your-endpoint', handler);
```

## 🤝 Contributing

When adding new endpoints:
1. Add Swagger documentation comments
2. Include request/response examples
3. Document all query parameters
4. Specify authentication requirements
5. Test the documentation in Swagger UI

## 📖 Resources

- [OpenAPI 3.0 Specification](https://swagger.io/specification/)
- [Swagger UI Documentation](https://swagger.io/tools/swagger-ui/)
- [swagger-jsdoc](https://github.com/Surnet/swagger-jsdoc)

## ⚙️ Configuration

The Swagger configuration is located at:

```
backend/src/config/swagger.ts
```

To modify:
- API description
- Server URLs
- Security schemes
- Global schemas
- Tags

## 🎨 Customization

The Swagger UI has been customized:
- Removed topbar
- Custom site title: "Arshinagar API Documentation"
- Custom favicon support

To modify the UI theme, edit the `customCss` option in `app.ts`.

---

**Happy API Testing! 🚀**
