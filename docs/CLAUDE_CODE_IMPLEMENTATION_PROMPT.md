# 🏗️ Real Estate Accounts Management System - Complete Implementation Prompt

## 📊 IMPLEMENTATION STATUS

### ✅ COMPLETED PHASES (Production Ready)

**Phase 1: Authentication & User Management** ✅
- Backend: User model, JWT auth (access + refresh tokens), RBAC middleware, audit logging
- Frontend: Login page, protected routes, auth context, token refresh
- Status: COMPLETE & COMMITTED (commit: 7a3b31d)

**Phase 2: Master Data Management (Clients & Land Inventory)** ✅
- Backend: Client, RSNumber, Plot models with full CRUD APIs, area calculations, validation
- Frontend: Client pages (list, detail, new, edit), RS Number pages, Plot inventory, search/filter
- Status: COMPLETE & COMMITTED (commit: e5fe1d3)

**Phase 3: Sales Lifecycle & Receipt Management** ✅
- Backend: Sale model with stages, Receipt model with approval workflow, InstallmentSchedule, Ledger (double-entry)
- Frontend: Sales pages (list, detail, new), Receipts pages (list, new, approval queue), Dashboard with Phase 3 stats
- Status: COMPLETE & COMMITTED (commit: 6df0b7d backend, b0ff29b frontend)

**Phase 4: Expenses & Payroll Management** ✅
- Backend: ExpenseCategory, Expense, Employee, EmployeeCost models with full CRUD APIs, approval workflow for expenses
- Frontend: Expense pages (list, detail, new, approval queue, categories), Employee pages (list, detail, new, edit), Payroll summary, Dashboard updates
- Status: COMPLETE & COMMITTED (commit: 84cf26d backend, 1bc62b4 frontend)

### 🚧 PENDING PHASES

**Phase 5:** Cancellations & Refunds ⏳
**Phase 6:** Banking & Cheques ⏳
**Phase 7:** SMS & Notifications ⏳
**Phase 8:** Reports & Dashboards (Partial - basic dashboard done) ⏳
**Phase 9:** Configuration & Settings ⏳
**Phase 10:** Data Migration & Testing ⏳

### 📈 Progress Summary
- **Modules Completed:** 4 out of 11 (36%)
- **Backend Models:** 16 models created (User, Client, RSNumber, Plot, Sale, Receipt, InstallmentSchedule, Ledger, ExpenseCategory, Expense, Employee, EmployeeCost, etc.)
- **API Endpoints:** 70+ endpoints functional
- **Frontend Pages:** 32+ pages implemented
- **Core Features Working:** Authentication, Client Management, Land Inventory, Sales Tracking, Receipt Management, Expense Management, Payroll Management - All with Approval Workflows

### 📂 Files Implemented (Phase 1-4)

**Backend Files:**
```
backend/src/
├── models/
│   ├── User.ts ✅
│   ├── AuditLog.ts ✅
│   ├── Client.ts ✅
│   ├── RSNumber.ts ✅
│   ├── Plot.ts ✅
│   ├── Sale.ts ✅
│   ├── Receipt.ts ✅
│   ├── InstallmentSchedule.ts ✅
│   ├── Ledger.ts ✅
│   ├── ExpenseCategory.ts ✅
│   ├── Expense.ts ✅
│   ├── Employee.ts ✅
│   └── EmployeeCost.ts ✅
├── controllers/
│   ├── authController.ts ✅
│   ├── clientController.ts ✅
│   ├── landController.ts ✅
│   ├── saleController.ts ✅
│   ├── receiptController.ts ✅
│   ├── installmentController.ts ✅
│   ├── expenseCategoryController.ts ✅
│   ├── expenseController.ts ✅
│   ├── employeeController.ts ✅
│   └── employeeCostController.ts ✅
├── routes/
│   ├── auth.routes.ts ✅
│   ├── client.routes.ts ✅
│   ├── land.routes.ts ✅
│   ├── sale.routes.ts ✅
│   ├── receipt.routes.ts ✅
│   ├── installment.routes.ts ✅
│   ├── expenseCategory.routes.ts ✅
│   ├── expense.routes.ts ✅
│   ├── employee.routes.ts ✅
│   └── employeeCost.routes.ts ✅
├── middlewares/
│   ├── auth.middleware.ts ✅
│   ├── rbac.middleware.ts ✅
│   └── audit.middleware.ts ✅
└── app.ts ✅
```

**Frontend Files:**
```
frontend/app/
├── (auth)/
│   └── login/page.tsx ✅
├── (dashboard)/
│   ├── layout.tsx ✅
│   ├── page.tsx ✅ (Dashboard with Phase 4 stats)
│   ├── clients/
│   │   ├── page.tsx ✅ (List)
│   │   ├── [id]/page.tsx ✅ (Detail)
│   │   ├── new/page.tsx ✅ (Create)
│   │   └── edit/[id]/page.tsx ✅ (Edit)
│   ├── land/
│   │   ├── rs-numbers/
│   │   │   ├── page.tsx ✅ (List)
│   │   │   ├── [id]/page.tsx ✅ (Detail)
│   │   │   └── new/page.tsx ✅ (Create)
│   │   └── plots/
│   │       ├── page.tsx ✅ (List)
│   │       └── [id]/page.tsx ✅ (Detail)
│   ├── sales/
│   │   ├── page.tsx ✅ (List)
│   │   ├── [id]/page.tsx ✅ (Detail with stages)
│   │   └── new/page.tsx ✅ (Create)
│   ├── receipts/
│   │   ├── page.tsx ✅ (List)
│   │   ├── new/page.tsx ✅ (Create)
│   │   └── approval-queue/page.tsx ✅
│   ├── expenses/
│   │   ├── page.tsx ✅ (List)
│   │   ├── [id]/page.tsx ✅ (Detail)
│   │   ├── new/page.tsx ✅ (Create)
│   │   ├── approval-queue/page.tsx ✅
│   │   └── categories/
│   │       ├── page.tsx ✅ (List)
│   │       └── new/page.tsx ✅ (Create)
│   ├── employees/
│   │   ├── page.tsx ✅ (List)
│   │   ├── [id]/page.tsx ✅ (Detail with cost history)
│   │   ├── [id]/costs/new/page.tsx ✅ (Cost entry)
│   │   ├── new/page.tsx ✅ (Create)
│   │   └── edit/[id]/page.tsx ✅ (Edit)
│   └── payroll/
│       └── page.tsx ✅ (Monthly summary)
└── lib/
    └── api.ts ✅ (Complete API client with Phase 1-4 types)
```

### 🎯 Current Working Features

**Authentication & Authorization:**
- ✅ JWT-based login with access and refresh tokens
- ✅ Role-based access control (Admin, AccountManager, HOF)
- ✅ Automatic token refresh on expiration
- ✅ Protected routes with role enforcement
- ✅ Audit logging for all actions

**Client Management:**
- ✅ Full CRUD operations for clients
- ✅ Bangladesh-specific validation (phone: 01XXXXXXXXX, NID: 10-17 digits)
- ✅ Client search and filtering
- ✅ Client detail view with purchase history
- ✅ Pagination support

**Land Inventory Management:**
- ✅ RS Number management with project tracking
- ✅ Plot management under RS Numbers
- ✅ Automatic area calculations (sold/remaining)
- ✅ Overselling prevention validation
- ✅ Plot status tracking (Available/Sold/Reserved)
- ✅ Visual representation of land utilization

**Sales Management:**
- ✅ Create sales with client and plot selection
- ✅ Multi-stage payment tracking (Booking, Installments, Registration, Handover)
- ✅ Automatic sale number generation (SAL-YYYY-MM-XXXXX)
- ✅ Stage-wise payment breakdown with progress bars
- ✅ Automatic calculation of paid/due amounts
- ✅ Visual progress indicators for payment completion

**Receipt Management:**
- ✅ Record payments with multiple payment methods (Cash, Bank Transfer, Cheque, PDC, Mobile Wallet)
- ✅ Conditional form fields (cheque details for Cheque/PDC)
- ✅ Automatic receipt number generation (RCP-YYYY-MM-XXXXX)
- ✅ Multi-level approval workflow:
  - Draft → Accounts Manager → HOF → Approved
- ✅ Approval queue filtered by user role
- ✅ Inline approve/reject with remarks
- ✅ Automatic ledger posting on approval (double-entry)
- ✅ Receipt filtering by approval status and sale

**Expense Management:**
- ✅ Expense category management (configurable categories)
- ✅ Expense recording with category, vendor, description
- ✅ Multiple payment methods support
- ✅ Automatic expense number generation (EXP-YYYY-MM-XXXXX)
- ✅ Multi-level approval workflow (Draft → Accounts → HOF → Approved)
- ✅ Approval queue filtered by user role
- ✅ Inline approve/reject with remarks
- ✅ Expense filtering by status, category, date range
- ✅ Expense statistics and reporting

**Employee & Payroll Management:**
- ✅ Employee master data with full CRUD operations
- ✅ Bangladesh-specific validation (phone, NID)
- ✅ Bank account management per employee
- ✅ Monthly employee cost tracking:
  - Salary, commission, fuel, entertainment
  - Bonus, overtime, other allowances
  - Advances and deductions
  - Automatic net pay calculation
- ✅ Employee cost entry with real-time net pay calculation
- ✅ Employee cost history view
- ✅ Monthly payroll summary with breakdown by cost type
- ✅ Print-friendly payroll reports
- ✅ Payroll statistics (total employees, monthly payroll)

**Dashboard & Reporting:**
- ✅ Executive dashboard with 8 KPI cards:
  - Total Clients
  - Active Sales
  - Total Sales Value (BDT)
  - Amount Due (BDT)
  - Land Inventory (RS Numbers)
  - Total Employees
  - Total Expenses
  - Pending Approvals (Receipts + Expenses)
- ✅ Quick action buttons (8 actions including Phase 4 features)
- ✅ Responsive design with dark mode support
- ✅ Phase 4 statistics integration

**UI/UX Features:**
- ✅ Dark mode support throughout
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ BDT currency formatting with Bangladesh locale
- ✅ Loading states and error handling
- ✅ Toast notifications for user actions
- ✅ Professional UI with Tailwind CSS

---

## 📋 Project Overview
Build a complete **Real Estate Accounts Digitization System** for a Bangladesh-based land development company. The system manages client accounts, land sales, installment tracking, expenses, payroll, bank/cash management, cheque handling, approvals, and automated SMS notifications.

**Business Domain:** Real Estate / Land Development (Bangladesh)
**Currency:** BDT (৳) | **Timezone:** Asia/Dhaka | **Languages:** Bangla + English

---

## 🛠️ Tech Stack

### Frontend (Already Initialized in ./frontend)
- **Framework:** Next.js 16 with React 19, TypeScript
- **Styling:** Tailwind CSS 4
- **UI Components:** Radix UI (dropdown, scroll-area, separator, slot)
- **Icons:** Lucide React
- **Internationalization:** next-intl (for Bangla/English)
- **Theme:** next-themes (dark/light mode support)

### Backend (To Be Built in ./backend)
- **Framework:** Express.js + Node.js (TypeScript)
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT-based auth
- **API:** RESTful with pagination, sorting, filtering
- **SMS:** Integration with Bangladeshi SMS gateway

### Future Migration Path
> Code should be structured for easy migration to **Spring Boot (Java)** backend and **PostgreSQL** database.

---

## 🎯 Core Requirements & Deliverables

### Module 1: Master Data Management

#### 1.1 Clients Management
**Requirements:**
- Client profile: name, phone, address, NID (optional)
- CRUD operations with search and filtering
- View client's purchase history and payment status

**Backend Deliverables:**
- `Client` model (Mongoose schema)
- API endpoints: POST /api/clients, GET /api/clients, GET /api/clients/:id, PUT /api/clients/:id, DELETE /api/clients/:id
- Validation and error handling

**Frontend Deliverables:**
- Client list page with search, filter, pagination
- Client detail view showing all purchases and payments
- Add/Edit client form with validation
- Responsive table/card view

---

#### 1.2 Land Inventory & RS Number System
**Requirements:**
- Each land parcel identified by **RS Number (Dag Number)**
- RS Number properties: project name, location, total area (Acre/Katha/Sq ft)
- Track **sold**, **allocated**, and **remaining** land per RS Number
- Support multiple customers purchasing portions from same RS Number
  - Example: RS#123 has 20 Acre → Customer A buys 5 Acre, Customer B buys 10 Acre → 5 Acre remaining
- List all plots/units under an RS Number

**Backend Deliverables:**
- `RSNumber` model with fields: rsNumber, projectName, location, totalArea, unitType, soldArea, remainingArea
- `Plot` model linked to RSNumber: plotNumber, area, status (available/sold/reserved), clientId, saleDate
- API endpoints for RS Numbers and Plots with automatic calculation of remaining area
- Validation: prevent overselling (sold + allocated ≤ total)

**Frontend Deliverables:**
- RS Number management page (list, add, edit)
- Plot inventory view under each RS Number
- Visual representation of sold vs remaining land (progress bar/pie chart)
- Auto-update remaining area when plot is sold

---

### Module 2: Sales Lifecycle Management

#### 2.1 Sales Stages
**Requirements:**
Track each sale through distinct stages:
1. **Booking** (initial deposit)
2. **Installments** (recurring scheduled payments)
3. **Registration** (deed registration fee)
4. **Handover** (final handover fee)
5. **Other Stages** (mutation, utility connection - configurable)

Each stage stores:
- Planned amount, received amount, due amount
- Payment date, method (Cash/Bank/Cheque/PDC)
- Receipt number and approval status

**Backend Deliverables:**
- `Sale` model with stages array
- `SaleStage` subdocument: stageName, plannedAmount, receivedAmount, dueAmount, status
- `Payment` model: saleId, stageId, amount, method, date, receiptNumber, approvalStatus
- API to create sale, update stages, record payments
- Auto-calculate dues and balances

**Frontend Deliverables:**
- Sales dashboard showing all active sales
- Sale detail page with stage-wise breakdown
- Payment recording form per stage
- Visual progress indicator for each sale stage

---

#### 2.2 Installment Scheduling & Tracking
**Requirements:**
- Auto-generate installment schedules (monthly/quarterly)
- Track: due date, amount, paid date, payment method
- Detect missed installments
- Generate customer statements showing paid/due/overdue

**Backend Deliverables:**
- `InstallmentSchedule` model: saleId, dueDate, amount, status (pending/paid/overdue/missed)
- Cron job or scheduled task to mark overdue installments
- API: GET /api/installments?status=overdue&clientId=xyz
- Customer statement generation endpoint

**Frontend Deliverables:**
- Installment schedule calendar/timeline view
- Mark installment as paid interface
- Overdue installments dashboard (filterable by client/project)
- Printable customer statement

---

### Module 3: Money In (Collections)

#### 3.1 Receipt Management
**Requirements:**
- Receive payments against: booking, installments, registration, handover, others
- Payment methods: Cash, Bank Transfer, Cheque (Current), PDC (Post-Dated Cheque), Mobile Wallet
- Generate Money Receipt with unique number
- Approval workflow: Draft → Accounts Manager → Head of Finance (HOF)
- On approval: auto-post to Cash/Bank ledger and Client ledger
- Printable receipt with company branding

**Backend Deliverables:**
- `Receipt` model: receiptNumber, clientId, saleId, stageId, amount, method, date, instrumentDetails (for cheques), approvalStatus, approvedBy, approvedAt
- `Ledger` model for double-entry bookkeeping: account, debit, credit, transactionType, referenceId
- Receipt number auto-generation (format: RCP-YYYY-MM-XXXXX)
- Approval endpoints: POST /api/receipts/:id/approve, POST /api/receipts/:id/reject
- Ledger posting on approval

**Frontend Deliverables:**
- Receipt entry form with payment method selector
- Receipt list with status filters (draft/pending/approved/rejected)
- Approval queue for Accounts Manager and HOF
- Receipt print/PDF view with company logo and details
- Client ledger view showing all receipts

---

### Module 4: Money Out (Expenses & Refunds)

#### 4.1 Expense Management
**Requirements:**
- Expense categories (configurable): Land Purchase, Salary, Stationery, Utility, Sales Commission, Fuel, Client Entertainment, Other
- Track: date, amount, category, vendor, description, payment method
- Support for recurring expenses (monthly salary, utility bills)
- Approval workflow similar to receipts

**Backend Deliverables:**
- `ExpenseCategory` model: name, description, isActive
- `Expense` model: date, categoryId, amount, vendor, description, method, approvalStatus, receiptAttachment
- API for CRUD operations and approval workflow
- Monthly/yearly expense summaries by category

**Frontend Deliverables:**
- Expense entry form with category dropdown
- Expense list with filters (date range, category, status)
- Approval queue for expenses
- Expense reports by category and time period

---

#### 4.2 Employee Cost Management
**Requirements:**
- Per-employee ledger tracking: salary, commission, fuel reimbursement, client entertainment, advances, deductions
- Monthly cost view per employee
- Annual summary report
- Advance and recovery schedule

**Backend Deliverables:**
- `Employee` model: name, designation, phone, bankAccount, joinDate
- `EmployeeCost` model: employeeId, month, year, salary, commission, fuel, entertainment, advances, deductions, netPay
- API for employee CRUD and cost recording
- Reports: monthly per-employee, yearly summary, commission report

**Frontend Deliverables:**
- Employee management page
- Employee cost entry form (monthly)
- Employee ledger view showing all cost components
- Commission and cost reports with filters

---

#### 4.3 Booking Cancellation & Refund
**Requirements:**
- Mark booking as cancelled with reason and date
- Calculate refundable amount: Total Paid - Office Charge (default 10%, override per client) - Other Deductions
- Support refund in installments (partial, scheduled)
- Track refunded amount vs remaining amount
- Approval workflow for refunds
- Post refund to Client ledger and Money Out

**Backend Deliverables:**
- Add `status` field to Sale model: active/cancelled/completed
- `Cancellation` model: saleId, cancellationDate, reason, totalPaid, officeChargePercent, officeChargeAmount, refundableAmount
- `Refund` model: cancellationId, installmentNumber, dueDate, amount, paidDate, status, approvalStatus
- API to cancel booking, calculate refund, schedule installments, process refund payments

**Frontend Deliverables:**
- Cancel booking form with reason input
- Refund calculation interface showing breakdown
- Refund installment schedule setup (if applicable)
- Refund payment tracking interface
- Cancellation and refund register report

---

### Module 5: Bank & Cash Management

#### 5.1 Multi-Bank & Cash Accounts
**Requirements:**
- Support multiple bank accounts + cash-in-hand
- Track opening balance, current balance, transactions
- Consolidated total balance view
- Bank reconciliation (manual or CSV import)

**Backend Deliverables:**
- `BankAccount` model: bankName, accountNumber, accountType, openingBalance, currentBalance, isActive
- `CashAccount` model: name (e.g., "Cash in Hand"), currentBalance
- Transaction linking to bank/cash accounts
- API for account CRUD and transaction history
- Bank reconciliation endpoints

**Frontend Deliverables:**
- Bank account management page
- Cash account management page
- Consolidated balance dashboard
- Transaction history per account
- Bank reconciliation interface (upload CSV, match transactions)

---

#### 5.2 Cheque & PDC Management
**Requirements:**
- Track all cheques: Post-Dated Cheques (PDC) and Current Cheques
- Fields: chequeNumber, bankName, issueDate, dueDate, amount, clientId, status
- Statuses: Pending, Due Today, Cleared, Overdue, Bounced, Cancelled
- Separate views: Today's Due, Upcoming, Overdue
- Mark as cleared (auto-post to ledger) or bounced (reverse entry, alert)
- Daily reminder for due cheques

**Backend Deliverables:**
- `Cheque` model: chequeNumber, bankName, issueDate, dueDate, amount, clientId, saleId, status, clearedDate, bounceReason
- API endpoints for cheque CRUD and status updates
- Cron job to check due/overdue cheques daily
- Cheque status report endpoints

**Frontend Deliverables:**
- Cheque register with filters (status, date range, client)
- Due Today dashboard showing all cheques due today
- Upcoming cheques view (next 7/30 days)
- Overdue cheques alert list
- Mark as cleared/bounced interface
- Cheque status report

---

### Module 6: Approvals & Controls

#### 6.1 Approval Workflow
**Requirements:**
- Two-step approval: Accounts Manager → Head of Finance (HOF)
- Applied to: receipts, expenses, refunds, manual journals
- Configurable approval thresholds (e.g., refunds > 50,000 BDT need HOF approval)
- Notification to approvers when pending items exist

**Backend Deliverables:**
- `ApprovalThreshold` model: transactionType, minAmount, maxAmount, requiredRole
- Approval status fields in Receipt, Expense, Refund models
- Middleware to check approval permissions based on role and amount
- API: GET /api/approvals/pending?role=AccountManager

**Frontend Deliverables:**
- Approval dashboard showing pending items by type
- Approve/Reject buttons with comment field
- Approval history view per transaction
- Threshold configuration page (Admin only)

---

#### 6.2 Audit & Controls
**Requirements:**
- Back-date lock (prevent edits before lock date)
- Full audit log of create/edit/approve/reject/void actions
- User activity tracking (IP, timestamp, action)
- Immutable audit trail for approved entries

**Backend Deliverables:**
- `AuditLog` model: userId, action, entity, entityId, changes (JSON), ipAddress, timestamp
- Middleware to log all CUD operations
- Lock date configuration in system settings
- Validation to prevent editing locked periods

**Frontend Deliverables:**
- Audit log viewer with filters (user, date, entity type)
- Lock date configuration (Admin only)
- Activity report per user

---

### Module 7: Notifications & SMS

#### 7.1 Automated SMS Triggers
**Requirements:**
- Upcoming installment reminder (N days before due)
- Payment received confirmation
- Missed installment alert (single/multiple months)
- Cheque due today notification
- Event-based and schedule-based triggers
- On/off toggles per notification type

**Backend Deliverables:**
- `SMSTemplate` model: templateCode, messageBN, messageEN, variables, isActive
- `SMSLog` model: phone, message, sentAt, status, deliveryStatus
- SMS service integration (with local Bangladeshi gateway)
- Cron jobs for scheduled SMS (installment reminders, cheque alerts)
- Event hooks for payment confirmations
- API to send test SMS, view SMS logs

**Frontend Deliverables:**
- SMS template management (Admin)
- SMS configuration page (toggle on/off, set reminder days)
- SMS log viewer with status filters
- Test SMS sender

---

#### 7.2 Bulk SMS
**Requirements:**
- Send bulk messages with filters: project, due status, stage, custom client list
- Template variables: {name}, {amount}, {dueDate}, {plot}, {monthsDue}
- Time-window restrictions (e.g., 9 AM - 8 PM only)

**Backend Deliverables:**
- API: POST /api/sms/bulk with filter criteria
- Queue management for bulk sends
- Progress tracking for bulk campaigns

**Frontend Deliverables:**
- Bulk SMS interface with filter builder
- Recipient preview (show matching clients)
- Template selector with variable placeholders
- Send time scheduler
- Campaign progress viewer

---

### Module 8: Reports & Dashboards

#### 8.1 Financial Reports
**Requirements:**
- Day Book / Cash Book / Bank Book
- Receipt & Payment Register (by date range, method)
- General Ledger (account-wise)
- Sub-Ledgers: Client ledger, Employee ledger
- Trial Balance
- Profit & Loss Statement
- Balance Sheet
- Journal Register
- Bank Reconciliation Statement

**Backend Deliverables:**
- Report generation endpoints for each report type
- Date range filtering
- Export to PDF and Excel

**Frontend Deliverables:**
- Reports dashboard with report selector
- Date range picker and filters
- Printable report views
- PDF and Excel download buttons

---

#### 8.2 Sales & Client Reports
**Requirements:**
- Installment Schedule vs Actual (per client/project)
- Aging of Receivables (0-30 / 31-60 / 61-90 / 90+ days)
- Customer Statement (periodic, printable)
- Stage-wise Collection Report (booking/registration/handover)
- Cancellation & Refund Register (with office charge)

**Backend Deliverables:**
- Sales report endpoints with aggregation
- Aging calculation logic
- Customer statement generation

**Frontend Deliverables:**
- Sales reports dashboard
- Aging report with visual breakdown
- Customer statement generator (per client)
- Stage-wise collection summary

---

#### 8.3 Expense & Payroll Reports
**Requirements:**
- Expense by Category (month/quarter/year)
- Expense by Project
- Per-Employee Cost Summary (salary, commission, fuel, etc.)
- Commission Report
- Utility/Stationery trend (month-wise)

**Backend Deliverables:**
- Expense aggregation endpoints
- Employee cost summary endpoints

**Frontend Deliverables:**
- Expense dashboard with charts
- Category-wise expense breakdown
- Employee cost reports
- Trend charts for recurring expenses

---

#### 8.4 KPI Dashboard
**Requirements:**
- Total Collections (month/quarter/YTD) vs Target
- Total Outstanding & Aging breakdown
- Today's Due Installments & Due Cheques
- Expense by Category (month-to-date), Top 5 heads
- Per-Employee monthly spend
- Refunds count & amount (period)

**Backend Deliverables:**
- Dashboard KPI endpoints with aggregated data
- Target vs actual comparison logic

**Frontend Deliverables:**
- Executive dashboard with KPI cards
- Charts: line (collections trend), bar (expenses), pie (aging)
- Today's alerts (due installments, due cheques)
- Drill-down capability to detailed views

---

### Module 9: Configuration & Settings

#### 9.1 System Settings
**Requirements:**
- Office charge default % (global, per-client override)
- Installment schedules (frequency, grace days)
- SMS templates and sending windows
- Approval thresholds and routes
- Lock dates
- Payment methods (add/edit/disable)
- Expense categories (add/edit/disable)
- Number formatting (BDT currency)
- Company branding (logo, name, address for receipts)

**Backend Deliverables:**
- `SystemSetting` model: key-value store
- `PaymentMethod` model
- `ExpenseCategory` model
- Settings API endpoints

**Frontend Deliverables:**
- System settings page (Admin only)
- Payment methods management
- Expense categories management
- Branding configuration (upload logo)
- Lock date configuration

---

### Module 10: Authentication & User Management

#### 10.1 Roles & Permissions
**Roles:**
1. **System Admin** - Full access, user management, configuration
2. **Account Manager** - Create/verify receipts & expenses, manage PDCs, reports
3. **Head of Finance (HOF)** - Approvals, final reports, audit, period close

**Requirements:**
- JWT-based authentication
- Role-based access control (RBAC)
- User CRUD operations (Admin only)
- Password reset functionality
- Session management

**Backend Deliverables:**
- `User` model: username, email, password (hashed), role, isActive
- Auth middleware for JWT verification
- Role-based authorization middleware
- Auth endpoints: login, logout, register (admin only), password reset
- Refresh token mechanism

**Frontend Deliverables:**
- Login page
- User management page (Admin)
- Add/Edit user form with role selector
- Change password interface
- Protected routes based on role

---

### Module 11: Data Migration

#### 11.1 Historical Data Import (2017-2025)
**Requirements:**
- Import clients, plots, opening balances, stage histories, receipts, expenses, employee costs, PDCs
- CSV/Excel templates with validation
- Preview before import
- Error reporting for invalid rows
- Rollback capability

**Backend Deliverables:**
- Import endpoints for each entity type
- CSV parsing and validation
- Bulk insert with transaction support
- Import log and error reporting

**Frontend Deliverables:**
- Data import wizard
- Template download buttons
- CSV upload interface
- Validation error display
- Import progress tracker
- Import history log

---

## 📐 Project Structure

### Backend Structure (./backend)
```
backend/
├── src/
│   ├── config/
│   │   ├── db.ts (MongoDB connection)
│   │   ├── jwt.ts (JWT configuration)
│   │   └── sms.ts (SMS gateway config)
│   ├── models/
│   │   ├── User.ts
│   │   ├── Client.ts
│   │   ├── RSNumber.ts
│   │   ├── Plot.ts
│   │   ├── Sale.ts
│   │   ├── Payment.ts
│   │   ├── InstallmentSchedule.ts
│   │   ├── Receipt.ts
│   │   ├── Expense.ts
│   │   ├── Employee.ts
│   │   ├── EmployeeCost.ts
│   │   ├── Cancellation.ts
│   │   ├── Refund.ts
│   │   ├── BankAccount.ts
│   │   ├── CashAccount.ts
│   │   ├── Cheque.ts
│   │   ├── Ledger.ts
│   │   ├── AuditLog.ts
│   │   ├── SMSTemplate.ts
│   │   ├── SMSLog.ts
│   │   └── SystemSetting.ts
│   ├── controllers/
│   │   ├── authController.ts
│   │   ├── clientController.ts
│   │   ├── landController.ts
│   │   ├── saleController.ts
│   │   ├── receiptController.ts
│   │   ├── expenseController.ts
│   │   ├── employeeController.ts
│   │   ├── refundController.ts
│   │   ├── bankController.ts
│   │   ├── chequeController.ts
│   │   ├── approvalController.ts
│   │   ├── reportController.ts
│   │   ├── smsController.ts
│   │   └── settingsController.ts
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── client.routes.ts
│   │   ├── land.routes.ts
│   │   ├── sale.routes.ts
│   │   ├── receipt.routes.ts
│   │   ├── expense.routes.ts
│   │   ├── employee.routes.ts
│   │   ├── refund.routes.ts
│   │   ├── bank.routes.ts
│   │   ├── cheque.routes.ts
│   │   ├── approval.routes.ts
│   │   ├── report.routes.ts
│   │   ├── sms.routes.ts
│   │   └── settings.routes.ts
│   ├── middlewares/
│   │   ├── auth.middleware.ts (JWT verification)
│   │   ├── rbac.middleware.ts (Role-based access)
│   │   ├── audit.middleware.ts (Audit logging)
│   │   ├── validation.middleware.ts
│   │   └── error.middleware.ts
│   ├── services/
│   │   ├── smsService.ts (SMS gateway integration)
│   │   ├── ledgerService.ts (Double-entry posting)
│   │   ├── reportService.ts (Report generation)
│   │   └── cronService.ts (Scheduled jobs)
│   ├── utils/
│   │   ├── numberGenerator.ts (Receipt numbers, etc.)
│   │   ├── dateUtils.ts
│   │   └── validators.ts
│   ├── types/
│   │   └── index.ts (TypeScript type definitions)
│   └── app.ts (Express app setup)
├── .env.example
├── package.json
└── tsconfig.json
```

### Frontend Structure (./frontend - Already Initialized)
```
frontend/
├── app/
│   ├── (auth)/
│   │   └── login/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx (Dashboard layout with sidebar)
│   │   ├── page.tsx (Main dashboard/KPIs)
│   │   ├── clients/
│   │   │   ├── page.tsx (Client list)
│   │   │   ├── [id]/page.tsx (Client detail)
│   │   │   └── new/page.tsx (Add client)
│   │   ├── land/
│   │   │   ├── rs-numbers/page.tsx
│   │   │   └── plots/page.tsx
│   │   ├── sales/
│   │   │   ├── page.tsx (Sales list)
│   │   │   ├── [id]/page.tsx (Sale detail)
│   │   │   └── new/page.tsx (Create sale)
│   │   ├── collections/
│   │   │   ├── receipts/page.tsx
│   │   │   └── installments/page.tsx
│   │   ├── expenses/
│   │   │   └── page.tsx
│   │   ├── employees/
│   │   │   ├── page.tsx
│   │   │   └── [id]/costs/page.tsx
│   │   ├── refunds/
│   │   │   └── page.tsx
│   │   ├── banking/
│   │   │   ├── accounts/page.tsx
│   │   │   ├── cheques/page.tsx
│   │   │   └── reconciliation/page.tsx
│   │   ├── approvals/
│   │   │   └── page.tsx
│   │   ├── reports/
│   │   │   ├── page.tsx (Reports dashboard)
│   │   │   ├── financial/page.tsx
│   │   │   ├── sales/page.tsx
│   │   │   └── expenses/page.tsx
│   │   ├── sms/
│   │   │   ├── templates/page.tsx
│   │   │   ├── bulk/page.tsx
│   │   │   └── logs/page.tsx
│   │   └── settings/
│   │       ├── system/page.tsx
│   │       ├── users/page.tsx
│   │       └── import/page.tsx
│   └── api/ (API route handlers if needed)
├── components/
│   ├── ui/ (Radix UI components - already set up)
│   ├── dashboard/
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   └── KPICard.tsx
│   ├── clients/
│   │   ├── ClientList.tsx
│   │   ├── ClientForm.tsx
│   │   └── ClientCard.tsx
│   ├── sales/
│   │   ├── SaleForm.tsx
│   │   ├── StageProgress.tsx
│   │   └── InstallmentTable.tsx
│   ├── receipts/
│   │   ├── ReceiptForm.tsx
│   │   └── ReceiptPrint.tsx
│   ├── approvals/
│   │   └── ApprovalQueue.tsx
│   ├── reports/
│   │   └── ReportViewer.tsx
│   └── common/
│       ├── DataTable.tsx
│       ├── DateRangePicker.tsx
│       ├── SearchBar.tsx
│       └── Pagination.tsx
├── lib/
│   ├── api.ts (Axios instance)
│   ├── auth.ts (Auth helpers)
│   ├── utils.ts
│   └── constants.ts
├── messages/ (for next-intl)
│   ├── en.json
│   └── bn.json
└── public/
    ├── images/
    └── icons/
```

---

## 🔧 Environment Configuration

### Backend .env.example
```env
# Server
NODE_ENV=development
PORT=5000
API_BASE_URL=http://localhost:5000

# Database
MONGODB_URI=mongodb://localhost:27017/arshinagar-accounts
MONGODB_TEST_URI=mongodb://localhost:27017/arshinagar-accounts-test

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-refresh-token-secret
JWT_REFRESH_EXPIRES_IN=30d

# SMS Gateway (Bangladeshi Provider)
SMS_GATEWAY_URL=https://api.smsgateway.bd/api/send
SMS_API_KEY=your-sms-api-key
SMS_SENDER_ID=YourCompany
SMS_ENABLED=true

# Timezone
TZ=Asia/Dhaka

# Cron Jobs
ENABLE_CRON_JOBS=true
INSTALLMENT_REMINDER_DAYS=3
CHEQUE_ALERT_TIME=09:00

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads

# Email (Optional for notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@yourcompany.com

# System Defaults
DEFAULT_OFFICE_CHARGE_PERCENT=10
DEFAULT_CURRENCY=BDT
DEFAULT_LOCALE=bn-BD
```

### Frontend .env.local
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_APP_NAME=Arshinagar Account Management
NEXT_PUBLIC_DEFAULT_LOCALE=bn
```

---

## 🚀 Development Phases & Implementation Order

### ✅ Phase 1: Foundation (Week 1-2) - COMPLETE
**Backend:** ✅
1. ✅ Project setup (Express + TypeScript + MongoDB)
2. ✅ User model and authentication (JWT access + refresh tokens)
3. ✅ Auth middleware and RBAC (3 roles: Admin, AccountManager, HOF)
4. ✅ User CRUD endpoints
5. ✅ Audit logging middleware

**Frontend:** ✅
1. ✅ Login page with dark mode support
2. ✅ Dashboard layout with sidebar navigation
3. ✅ Protected route wrapper with role-based access
4. ✅ API client setup (Axios with interceptors for token refresh)
5. ✅ Auth context provider

**Deliverable:** ✅ Working login system with role-based access

**Files Created:**
- Backend: `User.ts`, `authController.ts`, `auth.routes.ts`, `auth.middleware.ts`, `rbac.middleware.ts`, `audit.middleware.ts`
- Frontend: `app/(auth)/login/page.tsx`, `lib/api.ts`, `app/(dashboard)/layout.tsx`

---

### ✅ Phase 2: Master Data (Week 3-4) - COMPLETE
**Backend:** ✅
1. ✅ Client model and CRUD APIs (with Bangladesh phone/NID validation)
2. ✅ RSNumber model and APIs (with area tracking)
3. ✅ Plot model and APIs (automatic area calculations, overselling prevention)
4. ✅ Validation and error handling

**Frontend:** ✅
1. ✅ Client management pages (list, add, edit, view with purchase history)
2. ✅ RS Number management (with sold/remaining area visualization)
3. ✅ Plot inventory under RS Number
4. ✅ Search and filtering with pagination

**Deliverable:** ✅ Complete client and land inventory management

**Files Created:**
- Backend: `Client.ts`, `RSNumber.ts`, `Plot.ts`, `clientController.ts`, `landController.ts`, `client.routes.ts`, `land.routes.ts`
- Frontend:
  - `app/(dashboard)/clients/page.tsx`, `app/(dashboard)/clients/[id]/page.tsx`, `app/(dashboard)/clients/new/page.tsx`, `app/(dashboard)/clients/edit/[id]/page.tsx`
  - `app/(dashboard)/land/rs-numbers/page.tsx`, `app/(dashboard)/land/rs-numbers/[id]/page.tsx`, `app/(dashboard)/land/rs-numbers/new/page.tsx`
  - `app/(dashboard)/land/plots/page.tsx`, `app/(dashboard)/land/plots/[id]/page.tsx`

---

### ✅ Phase 3: Sales & Collections (Week 5-7) - COMPLETE
**Backend:** ✅
1. ✅ Sale model with stages (Booking, Installments, Registration, Handover)
2. ✅ InstallmentSchedule model with status tracking
3. ✅ Receipt model with multi-level approval workflow
4. ✅ Receipt approval workflow (Draft → Accounts → HOF → Approved)
5. ✅ Ledger service (double-entry bookkeeping)
6. ✅ Auto-generation of sale numbers (SAL-YYYY-MM-XXXXX) and receipt numbers (RCP-YYYY-MM-XXXXX)
7. ✅ Automatic calculation of paid/due amounts, stage progress

**Frontend:** ✅
1. ✅ Create sale workflow with client/plot selection
2. ✅ Sale detail page with stage-wise breakdown and progress bars
3. ✅ Receipt entry form with payment method-specific fields (cheque details)
4. ✅ Approval queue for Accounts Manager and HOF roles
5. ✅ Sales list with filtering and search
6. ✅ Receipts list with approval status filtering
7. ✅ Dashboard integration with Phase 3 statistics

**Deliverable:** ✅ Complete sales and collection tracking with approvals

**Files Created:**
- Backend: `Sale.ts`, `Receipt.ts`, `InstallmentSchedule.ts`, `Ledger.ts`, `saleController.ts`, `receiptController.ts`, `installmentController.ts`, `sale.routes.ts`, `receipt.routes.ts`, `installment.routes.ts`
- Frontend:
  - `app/(dashboard)/sales/page.tsx`, `app/(dashboard)/sales/[id]/page.tsx`, `app/(dashboard)/sales/new/page.tsx`
  - `app/(dashboard)/receipts/page.tsx`, `app/(dashboard)/receipts/new/page.tsx`, `app/(dashboard)/receipts/approval-queue/page.tsx`
  - Updated `app/(dashboard)/page.tsx` with Phase 3 stats

**Key Features Implemented:**
- Multi-stage payment tracking with visual progress indicators
- Role-based approval workflow for receipts
- Payment method handling (Cash, Bank Transfer, Cheque, PDC, Mobile Wallet)
- Automatic ledger posting on approval
- BDT currency formatting with Bangladesh locale
- Conditional form fields based on payment method
- Client statement view showing all transactions

---

### ✅ Phase 4: Expenses & Payroll (Week 8-9) - COMPLETE
**Status:** COMPLETE & COMMITTED

**Backend:** ✅
1. ✅ ExpenseCategory model with configurable categories
2. ✅ Expense model with approval workflow (Draft → Accounts → HOF → Approved)
3. ✅ Employee model with Bangladesh-specific validation
4. ✅ EmployeeCost model with automatic net pay calculation
5. ✅ Expense reporting and statistics APIs
6. ✅ Auto-generation of expense numbers (EXP-YYYY-MM-XXXXX)
7. ✅ Automatic ledger posting on expense approval

**Frontend:** ✅
1. ✅ Expense management pages (list, detail, new)
2. ✅ Expense category management (list, new)
3. ✅ Expense approval queue for role-based approvals
4. ✅ Employee management (list, detail, new, edit)
5. ✅ Employee cost entry with real-time net pay calculation
6. ✅ Monthly payroll summary with breakdown by cost type
7. ✅ Dashboard integration with Phase 4 statistics
8. ✅ Print-friendly payroll reports

**Deliverable:** ✅ Complete expense and payroll management with approval workflows

**Files Created:**
- Backend: `ExpenseCategory.ts`, `Expense.ts`, `Employee.ts`, `EmployeeCost.ts`, `expenseCategoryController.ts`, `expenseController.ts`, `employeeController.ts`, `employeeCostController.ts`, `expenseCategory.routes.ts`, `expense.routes.ts`, `employee.routes.ts`, `employeeCost.routes.ts`
- Frontend:
  - `app/(dashboard)/expenses/page.tsx`, `app/(dashboard)/expenses/[id]/page.tsx`, `app/(dashboard)/expenses/new/page.tsx`, `app/(dashboard)/expenses/approval-queue/page.tsx`
  - `app/(dashboard)/expenses/categories/page.tsx`, `app/(dashboard)/expenses/categories/new/page.tsx`
  - `app/(dashboard)/employees/page.tsx`, `app/(dashboard)/employees/[id]/page.tsx`, `app/(dashboard)/employees/new/page.tsx`, `app/(dashboard)/employees/edit/[id]/page.tsx`
  - `app/(dashboard)/employees/[id]/costs/new/page.tsx`
  - `app/(dashboard)/payroll/page.tsx`
  - Updated `app/(dashboard)/page.tsx` with Phase 4 stats
  - Updated `app/(dashboard)/layout.tsx` with Phase 4 navigation

**Key Features Implemented:**
- Configurable expense categories
- Multi-level approval workflow for expenses (similar to receipts)
- Automatic expense number generation
- Employee master data with bank account management
- Monthly employee cost tracking with 9 cost components
- Real-time net pay calculation in cost entry form
- Monthly payroll summary with totals and breakdown
- Print-friendly payroll reports
- Phase 4 statistics integration in dashboard
- Role-based access for payroll (AccountManager, HOF, Admin)

---

### ⏳ Phase 5: Cancellations & Refunds (Week 10-11) - PENDING
**Status:** NOT YET STARTED

**Backend:** ⏳
1. ⏳ Cancellation model
2. ⏳ Refund model and installment logic
3. ⏳ Refund calculation service
4. ⏳ Approval workflow for refunds

**Frontend:** ⏳
1. ⏳ Cancel booking interface
2. ⏳ Refund calculation form
3. ⏳ Refund installment scheduler
4. ⏳ Refund tracking view

**Deliverable:** ⏳ Complete refund workflow

---

### ⏳ Phase 6: Banking & Cheques (Week 12-13) - PENDING
**Status:** NOT YET STARTED

**Backend:** ⏳
1. ⏳ BankAccount and CashAccount models
2. ⏳ Cheque model and status tracking
3. ⏳ Bank reconciliation logic
4. ⏳ Cron job for cheque due alerts

**Frontend:** ⏳
1. ⏳ Bank account management
2. ⏳ Cheque register
3. ⏳ Due cheques dashboard
4. ⏳ Bank reconciliation interface

**Deliverable:** ⏳ Banking and cheque management

---

### ⏳ Phase 7: SMS & Notifications (Week 14-15) - PENDING
**Status:** NOT YET STARTED

**Backend:** ⏳
1. ⏳ SMSTemplate model
2. ⏳ SMSLog model
3. ⏳ SMS service integration
4. ⏳ Cron jobs for scheduled SMS
5. ⏳ Event hooks for payment confirmations
6. ⏳ Bulk SMS API

**Frontend:** ⏳
1. ⏳ SMS template management
2. ⏳ SMS configuration
3. ⏳ Bulk SMS interface
4. ⏳ SMS logs viewer

**Deliverable:** ⏳ Automated SMS system

---

### ⏳ Phase 8: Reports & Dashboards (Week 16-18) - PARTIAL
**Status:** PARTIALLY COMPLETE (Basic KPI dashboard done, detailed reports pending)

**Backend:** ⏳
1. ⏳ Report generation services
2. ⏳ Financial report endpoints (Day Book, Cash Book, Bank Book, P&L, Balance Sheet)
3. ⏳ Sales report endpoints (Aging, Customer Statement, Stage-wise Collection)
4. ✅ Basic KPI calculation endpoints (sales stats, client stats)
5. ⏳ Export to PDF/Excel

**Frontend:**
1. ✅ Basic KPI dashboard with 6 stat cards
2. ⏳ Reports dashboard with report selector
3. ⏳ Financial reports pages
4. ⏳ Sales reports pages
5. ⏳ KPI dashboard with charts (line, bar, pie)
6. ⏳ Export functionality

**Deliverable:** ⏳ Complete reporting system (only basic dashboard complete)

---

### ⏳ Phase 9: Configuration & Settings (Week 19) - PENDING
**Status:** NOT YET STARTED

**Backend:** ⏳
1. ⏳ SystemSetting model
2. ⏳ Settings CRUD APIs
3. ⏳ Lock date enforcement

**Frontend:** ⏳
1. ⏳ System settings page
2. ⏳ Payment method configuration
3. ⏳ Expense category configuration
4. ⏳ Branding upload

**Deliverable:** ⏳ System configuration interface

---

### ⏳ Phase 10: Data Migration & Testing (Week 20-21) - PENDING
**Status:** NOT YET STARTED

**Backend:** ⏳
1. ⏳ CSV import endpoints
2. ⏳ Validation logic
3. ⏳ Bulk insert with rollback
4. ⏳ Import logging

**Frontend:** ⏳
1. ⏳ Data import wizard
2. ⏳ Template downloads
3. ⏳ Validation error display

**Testing:** ⏳
1. ⏳ Unit tests for critical services
2. ⏳ Integration tests for APIs
3. ⏳ End-to-end tests for workflows
4. ⏳ Load testing

**Deliverable:** ⏳ Production-ready system with data migration

---

## 📝 Development Guidelines

### Code Quality Standards
1. **TypeScript:** Use strict type checking
2. **Naming:** camelCase for variables/functions, PascalCase for classes/components
3. **Comments:** JSDoc for functions, inline for complex logic
4. **Error Handling:** Always use try-catch, return consistent error format
5. **Validation:** Validate all inputs (use Joi or Zod for backend, Zod for frontend)
6. **Logging:** Use structured logging (Winston or Pino)
7. **Security:** Sanitize inputs, use parameterized queries, hash passwords (bcrypt)

### API Response Format
```typescript
// Success response
{
  success: true,
  data: { /* result */ },
  message: "Operation successful"
}

// Error response
{
  success: false,
  error: {
    code: "ERROR_CODE",
    message: "Human-readable error message",
    details: { /* validation errors, etc. */ }
  }
}

// Paginated response
{
  success: true,
  data: [ /* items */ ],
  pagination: {
    page: 1,
    limit: 20,
    total: 100,
    totalPages: 5
  }
}
```

### Database Design Principles
1. Use proper indexes (compound indexes for common queries)
2. Store dates as Date objects (MongoDB ISODate)
3. Use enums for status fields
4. Implement soft delete (isDeleted flag) for audit trail
5. Use references (ObjectId) for relationships, populate when needed
6. Store currency amounts as integers (BDT in paisa: 100 paisa = 1 BDT) or use Decimal128

### Frontend Best Practices
1. Use React Server Components where possible (Next.js 13+ App Router)
2. Client components only when needed (interactivity, hooks)
3. Fetch data in server components, pass as props
4. Use React Query for client-side data fetching and caching
5. Implement optimistic updates for better UX
6. Show loading states and error boundaries
7. Make forms accessible (proper labels, ARIA attributes)
8. Responsive design (mobile-first approach)

---

## 🧪 Testing Requirements

### Backend Testing
1. Unit tests for services and utilities (Jest)
2. Integration tests for API endpoints (Supertest)
3. Test authentication and authorization
4. Test approval workflows
5. Test ledger posting logic
6. Test calculations (refund, aging, etc.)

### Frontend Testing
1. Component tests (React Testing Library)
2. E2E tests for critical flows (Playwright or Cypress)
3. Test form validations
4. Test role-based access

---

## 📚 Documentation Requirements

### Backend Documentation
1. API documentation (Swagger/OpenAPI or Postman collection)
2. Model schemas with field descriptions
3. Setup and deployment guide
4. Environment variables guide

### Frontend Documentation
1. Component documentation (Storybook optional)
2. Routing structure
3. State management approach
4. Setup guide

---

## 🎯 Acceptance Criteria

### Functional
- [ ] All CRUD operations work correctly
- [ ] Approval workflows function as specified
- [ ] Reports generate accurate data
- [ ] SMS sends successfully
- [ ] Role-based access is enforced
- [ ] Data migration imports without errors
- [ ] Calculations (refund, aging, due amounts) are accurate
- [ ] Cheque tracking updates statuses correctly
- [ ] Ledger postings are double-entry and balanced

### Non-Functional
- [ ] System handles 100 concurrent users
- [ ] Dashboard loads in < 2 seconds
- [ ] API responses in < 500ms for simple queries
- [ ] Secure (no SQL injection, XSS, CSRF vulnerabilities)
- [ ] Mobile responsive
- [ ] Works in Chrome, Firefox, Safari, Edge
- [ ] Bangla and English localization works
- [ ] Data backed up daily

---

## 🚦 Getting Started

### Step 1: Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and other settings
npm run dev
```

### Step 2: Frontend Setup (Already Done)
```bash
cd frontend
npm install
# Create .env.local with API URL
npm run dev
```

### Step 3: Database Seeding
```bash
cd backend
npm run seed  # Create initial admin user and system settings
```

### Step 4: Start Development
- Backend: http://localhost:5000
- Frontend: http://localhost:3000
- Login with seeded admin credentials

---

## 🎓 Key Business Logic Examples

### Example 1: RS Number Land Allocation
```
RS Number: #123
Total Area: 20 Acre
Project: Green Valley

Sales:
- Client A: 5 Acre (Sold)
- Client B: 10 Acre (Sold)
- Remaining: 5 Acre (Available)

On new sale:
1. Check remaining area >= requested area
2. If yes, create plot, mark as sold, update remaining area
3. If no, reject with error
```

### Example 2: Refund Calculation
```
Booking Amount: 500,000 BDT
Installments Paid: 3 x 50,000 = 150,000 BDT
Total Paid: 650,000 BDT

Office Charge: 10% (configurable per client)
Office Charge Amount: 65,000 BDT

Refundable Amount: 650,000 - 65,000 = 585,000 BDT

Refund Plan: 6 monthly installments
Per Installment: 585,000 / 6 = 97,500 BDT

Track each refund payment until 585,000 fully paid
```

### Example 3: Installment Overdue Detection
```
Installment Due Date: 2024-11-01
Today: 2024-11-15

Status: Overdue (15 days)

Trigger SMS:
- Template: "Dear {name}, your installment of {amount} BDT for plot {plot} was due on {dueDate}. Please make payment soon."
- Send once when first detected as overdue
- Send reminder every 7 days until paid
```

### Example 4: Approval Workflow
```
Receipt Amount: 75,000 BDT

Step 1: Account Executive creates receipt → Status: Draft
Step 2: Account Manager reviews and approves → Status: Pending HOF
Step 3: Check approval threshold:
        - If amount > 50,000: Requires HOF approval
        - Else: Auto-approve
Step 4: HOF approves → Status: Approved
Step 5: On approval:
        - Generate receipt number (RCP-2024-11-00123)
        - Post to ledger:
          - Debit: Bank/Cash Account (75,000)
          - Credit: Client Account (75,000)
        - Send SMS confirmation to client
        - Make receipt printable
```

---

## 🎯 Next Steps (Recommended Implementation Order)

### Immediate Next Phase: Phase 4 - Expenses & Payroll
**Why this phase:**
- Complements existing sales and receipt tracking
- Provides complete financial picture (money in + money out)
- Required before implementing comprehensive financial reports

**Implementation includes:**
1. ExpenseCategory model and management
2. Expense model with approval workflow (similar to receipts)
3. Employee model and CRUD
4. EmployeeCost tracking (salary, commission, fuel, etc.)
5. Monthly expense reports and employee cost summaries

### Subsequent Phases in Priority Order:
1. **Phase 5:** Cancellations & Refunds - Handle booking cancellations and refund workflows
2. **Phase 6:** Banking & Cheques - Complete bank account and cheque management
3. **Phase 8:** Reports & Dashboards (Complete) - Financial reports, sales reports, exports
4. **Phase 7:** SMS & Notifications - Automate customer communication
5. **Phase 9:** Configuration & Settings - System configuration interface
6. **Phase 10:** Data Migration & Testing - Production readiness

---

## 🎯 Original Implementation Request

**✅ PHASES 1-3 COMPLETE - This section is for reference**

**Priority Order:**
1. ✅ Phase 1 (Authentication & User Management) - COMPLETE
2. ✅ Phase 2 (Master Data - Clients & Land) - COMPLETE
3. ✅ Phase 3 (Sales & Collections) - COMPLETE
4. ⏳ Continue with Phase 4 (Expenses & Payroll)

**For Each Phase:**
- Create backend models, routes, controllers
- Implement corresponding frontend pages and components
- Ensure proper error handling and validation
- Add TypeScript types
- Follow the folder structure defined above
- Use consistent code style and naming conventions

**Important Notes:**
- ✅ Frontend initialized in ./frontend with Next.js 15, React 19, Tailwind, Radix UI
- ✅ Backend created in ./backend with Express + TypeScript + MongoDB
- ✅ TypeScript used for both frontend and backend
- ✅ Bangladesh-specific requirements implemented (BDT currency, phone/NID validation)
- ⏳ Code structured for future Java + PostgreSQL migration

---

## 📞 Support & Questions

**For clarification on any requirement, please ask before starting new phases.**

**Current Status:** Phases 1-3 production-ready and committed to git. Ready to proceed with Phase 4 or any other priority phase based on business requirements.
