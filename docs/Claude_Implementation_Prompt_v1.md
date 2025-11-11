# Prompt: Real Estate Accounts Digitization System — Implementation Guide for Code Generation

## 🧭 Overview
We are building a **Real Estate Accounts Digitization System** for a client in Bangladesh.  
The system manages all financial operations related to **land sales, installment payments, refunds, expenses, payroll, and cheques**, with **automated SMS reminders**, **approval workflows**, and **financial reports**.

This document summarizes the business logic, tech stack, requirements, and expectations so the model (Claude) can generate consistent and production-grade code.

---

## 🧱 Phase 1 Tech Stack (Current)
**Frontend:** Next.js (React 18, TypeScript preferred, Tailwind CSS 3)  
**Backend:** Express.js + Node.js (TypeScript preferred)  
**Database:** MongoDB (Mongoose ORM)  
**Auth:** JWT-based authentication  
**Deployment:** AWS (EC2, S3, Route53, SSL)  
**SMS Gateway:** Local Bangladeshi provider (masked sender ID)  

> ⚙️ In future, backend will migrate to **Java (Spring Boot)** and database to **PostgreSQL**. Code should be structured cleanly for easy migration.

---

## 🧩 Core Modules (As per SOW v1.1)

### 1. Client & Land Management
- Each land is mapped to an **RS Number (Dag Number)**.
- An RS Number can have multiple plots (e.g., 20 acres → split among customers).
- System tracks **sold**, **allocated**, and **remaining** land.

### 2. Plot Inventory System
- List of available plots under each RS Number.
- Auto-update remaining area after each sale.

### 3. Installment & Payment Tracking
- Auto-generate installment schedules.
- Store booking, installment, registration, handover payments.
- Each payment must have a receipt and approval status.

### 4. Booking Cancellation & Refund
- Handle refund workflows with **variable office charge** (default 10%).
- Option to refund in **installments**.
- System tracks how much refunded and how much remaining.

### 5. Expense & Payroll
- Expense categories: Land Purchase, Salary, Utility, Stationery, Commission, etc.
- Employee cost per month (salary, fuel, client dinners, commission).
- Reporting by category and by employee.

### 6. Multi-Bank & Cash Management
- Maintain multiple **bank accounts + cash-in-hand**.
- Show consolidated balance.
- Handle **bank reconciliation** manually or via CSV import.

### 7. Cheque & PDC Management
- Track all **post-dated and current cheques**.
- Status: Pending, Due Today, Cleared, Overdue, Bounced.
- Reminder system for due/overdue cheques.

### 8. Notifications & SMS
- Automated SMS:
  - Upcoming installment reminders.
  - Payment received confirmations.
  - Missed installment notifications.
  - Cheque due today alerts.
- Bulk messaging by filters (e.g., project, due status, etc.).

### 9. Approvals
- 2-step approval: **Accounts Manager → Head of Finance (HOF)**.
- Applied for all money-in/money-out transactions.

### 10. Reports & Dashboards
- Ledger, Trial Balance, P&L, Balance Sheet.
- Customer Statement (due, paid, missed).
- Expense by category and employee.
- KPIs: Total collection, due amount, outstanding balance.

---

## 🧠 Key Roles
1. **System Admin** – Full control, user management, configuration.  
2. **Account Manager** – Manage receipts, expenses, cheques, and reports.  
3. **Head of Finance (HOF)** – Approve financial actions, view analytics.

---

## 🧩 API Expectations (Backend)
- Use Express.js Router structure (modular by domain).
- Models for: `Client`, `Land`, `RSNumber`, `Booking`, `Installment`, `Expense`, `Employee`, `Cheque`, `Transaction`, `Notification`.
- JWT authentication middleware.
- Role-based access control (Admin, AccountManager, HOF).
- RESTful endpoints with pagination, sorting, and filtering.
- Centralized error handling and logging.
- Config-driven SMS service integration.

---

## 🖥️ Frontend (Next.js)
- Role-based dashboard views.
- Components for:
  - Client list & detail view (with installments and payments)
  - RS Number → Plots → Remaining area tree
  - Expense entry and filtering by category
  - Cheque due today/upcoming table
  - Approvals screen (pending items)
  - Financial dashboard (summary cards & charts)
- Use Tailwind + Shadcn UI components.
- Axios for API calls, React Query for caching.
- Reusable form components (Formik + Yup for validation).

---

## ⚙️ Development Phases
1. **Phase 1:** Authentication, Master Setup (Client, Land, RS, Bank)
2. **Phase 2:** Receipts & Installments + SMS confirmation
3. **Phase 3:** Expenses, Refunds, Payroll
4. **Phase 4:** Cheque Tracking, Reporting, Dashboard

Each phase should include:
- Backend routes & DB models
- Corresponding frontend UI
- Test data seeding
- REST API documentation (Swagger or Postman collection)

---

## 📦 Project Output Expectation
When generating code:
1. Use modular folder structure (`controllers`, `routes`, `models`, `middlewares`, `services`).  
2. Include example `.env` configuration.  
3. Add sample API response schema.  
4. Generate frontend and backend aligned (same data models).  
5. Include comments on future migration to PostgreSQL and Java backend.  

---

## 🧾 Example Output Prompt (for Claude)
> “Generate backend code for Phase 1 (Client & Land Management) using Express + Mongoose with JWT auth.  
> Include routes, models, and controllers for Clients and Lands (with RS Number logic).  
> Then generate matching Next.js frontend pages for managing clients and RS plots with forms and tables.”

---

### 🧠 Important Note for Claude
You are the lead engineer tasked with developing a clean, scalable MERN (Next.js + Express + MongoDB) implementation of the above requirements.  
Follow production standards, comment your code clearly, and make it migration-ready for future Java + PostgreSQL upgrade.

---

**Prepared by:**  
Hasan Sakhawat  
Software Engineer | Project Architect  
Real Estate Accounts Digitization System (Bangladesh)
