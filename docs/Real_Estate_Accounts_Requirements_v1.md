# Real Estate Accounts Digitization — Requirements v1 (Bangladesh)

## 1) Goal & Scope
Digitize the client’s full accounting and cashflow operations for land sales, collections, refunds, expenses, payroll/employee costs, and bank/cash management—with approvals, reports, cheque tracking, and SMS notifications.  
**Business domain:** Real Estate / Land Development (Bangladesh)  
**Primary currency:** BDT (৳) **Timezone:** Asia/Dhaka **Languages:** Bangla / English (for UI and SMS)

---

## 2) Core Modules

### A. Master Data
- **Clients & Land Inventory**
  - Client profile: name, phone, address, NID (optional)
  - Land / Plot / Unit details: project, RS Number (Bangla Dag Number), size (Acre / Katha / Sq ft), status
  - Each **RS Number** can represent a larger land parcel (e.g., 20 Acre).  
    - Within that RS Number, multiple customers may purchase portions:  
      e.g., Customer 1 buys 5 Acre, Customer 2 buys 10 Acre → 5 Acre remaining.  
    - The system must maintain **RS-wise available / sold / remaining** land balance.
  - Ability to list plots under an RS Number and view remaining land area.

- **Price Plans & Installments**
  - Booking amount, installment plan, registration fee, handover fee, other stage-based fees.

---

### B. Sales Lifecycle (Per Client ⇄ Land)
Track each sale as distinct **stages**, each with cost, receipt, and date:
1. **Booking**
2. **Installments** (recurring / scheduled)
3. **Registration**
4. **Handover**
5. **Other configurable stages** (mutation, utility connection, etc.)

Each stage stores: planned amount, received amount, due amount, payment method, receipt status, approval trail.

---

### C. Money In (Collections)
- Receive against: booking, installments, registration, handover, others.
- Payment methods: **Cash**, **Bank transfer**, **Cheque (current/PDC)**, **Mobile wallet** (optional, e.g., bKash/Nagad later).
- System generates **Money Receipt** → routed for **Accounts Manager → HOF** approval.
- On approval: auto-post to **Cash/Bank ledger** and **Client ledger**; printable receipt.
- **Missed-installment** detection & customer statements.

---

### D. Money Out (Expenses & Refunds)
- Expense categories: **Land Purchase**, **Salary**, **Stationery**, **Utility**, **Sales commission**, **Fuel**, **Client entertainment**, **Other** (configurable).
- **Employee Cost** ledger (per employee): salary, commission, fuel, reimbursements, advances, deductions.
- **Booking Cancellation & Refunds**
  - Compute refundable amount considering **variable office charge %** (default 10%, override per client).
  - Support **refund by installments** (partial, scheduled).
  - Track “how much repaid already” vs “remaining”.
  - Post to ledgers and include in Money Out.
- **Manual Journal/Adjustments** with approval and audit.

---

### E. Bank & Cash Management
- Multiple **Bank Accounts** + **Cash-in-hand**.
- Consolidated **Total Balance** view.
- **Bank Reconciliation** (import CSV/statement, match receipts/payments).
- **Cheque Register**
  - **PDC (Post-Dated Cheques)** tracking: issue date, due date, client, amount, bank.
  - Statuses: Pending, Due Today, Overdue, Cleared, Bounced, Cancelled.
  - UI lists for **Today**, **Upcoming**, and **Overdue**.

---

### F. Approvals & Controls
- Draft → Accounts Manager → **Head of Finance (HOF)** approval.
- Configurable approval thresholds (e.g., refunds > X need HOF).
- **Back-date lock** (prevent edits before lock date).
- Full **audit log** of create/edit/approve/reject/void.

---

### G. Notifications & SMS
- **Automated SMS**:
  - Upcoming installment reminder (N days before due).
  - Payment received confirmation.
  - Missed installment (single/multiple months).
  - Cheque due today.
- **Bulk SMS** (filters: project, due status, stage, custom list).
- Templated messages (Bangla/English), variable placeholders (name, amount, due date, plot, months due).
- Time-window / cut-off settings to avoid late-night sends.
- Event-based and schedule-based triggers, with on/off toggles.

---

### H. Data Migration
- Import historical data **2017–2025**:
  - Clients, plots, opening balances, stage histories, receipts, expenses, employee costs, PDCs.
  - Predefined CSV/Excel templates; validation feedback.

---

## 3) Roles & Permissions
1. **System Admin**
   - Master settings, users/roles, office charge defaults, SMS templates, stage definitions, lock dates.
2. **Account Manager**
   - Create/verify receipts & expenses, manage PDCs, run reconciliations, generate routine reports.
3. **HR Head / Head of Finance (HOF)**
   - Approvals (collections, refunds, journals), payroll oversight, final reports, audit & period close.

> (Optional later: Sales Executive read/create for their clients only.)

---

## 4) Key Workflows

### 4.1 Collections (Money In)
1) Create receipt → attach stage (booking/installment/registration/hand-over/other)  
2) Validate (amount ≤ due, method, instrument details)  
3) Send for approval → Approved → Post to ledgers & print receipt  
4) Triggers:
   - SMS confirmation to client
   - Update client statement and aging

### 4.2 Refund on Cancellation
1) Mark **Cancellation** with reason & date  
2) System computes: Paid so far − Office charge (configurable) − Any other deductions = Refundable  
3) Choose **lump sum** or **installment refund plan**  
4) Approval → Post to Money Out, client ledger updates, SMS sent

### 4.3 PDC Cheques
- Register PDC → appear in **Upcoming/TODAY** views  
- On due date: mark **Cleared** (auto-post) or **Bounced** (reverse, alert, optional penalty)  
- Daily SMS/Alert list for due cheques

### 4.4 Employee Costs
- Record salary, commission, fuel, reimbursements, advances
- Per-employee monthly cost view + annual summary
- Optional advances & recovery schedule

---

## 5) Reporting (minimum set for a “standard” accounts system)

### Financial & Books
- **Day Book / Cash Book / Bank Book**
- **Receipt & Payment Register** (by date range, method)
- **General Ledger** (account-wise)
- **Sub-Ledgers**: Client ledger, Employee ledger
- **Trial Balance**
- **Profit & Loss**
- **Balance Sheet**
- **Journal Register**
- **Bank Reconciliation Statement**

### Sales & Client
- **Installment Schedule vs Actual** (per client / per project)
- **Aging of Receivables** (0–30/31–60/61–90/90+)
- **Customer Statement** (periodic, printable/PDF)
- **Stage-wise Collection Report** (booking/registration/handover)
- **Cancellation & Refund Register** (with office charge)

### Cheque & Reminders
- **PDC Schedule** (Upcoming, Today, Overdue)
- **Cheque Status Report** (Cleared/Bounced)
- **SMS Campaign Log** (template, count, delivery status)

### Expenses & Payroll
- **Expense by Category** (month/quarter/year)
- **Expense by Project**
- **Per-Employee Cost Summary** (salary, commission, fuel, etc.)
- **Commission Report**
- **Utility/Stationery trend** (month-wise)

> (Local tax/VAT/TDS reports can be added later if required.)

---

## 6) Configuration & Policies
- Office charge default % for cancellations (global) + per-client override.
- Installment schedules (frequency, grace days, penalty rules—optional).
- SMS templates (BN/EN), sending windows, gateway credentials.
- Approval thresholds & routes.
- Lock dates, number formatting (BDT), calendar/holidays.
- Payment methods and expense categories (add/edit/disable).

---

## 7) Non-Functional
- **Security**: Role-based access, activity logs, IP/time audits.
- **Data integrity**: Double-entry postings; immutable audit trail for approved entries.
- **Backups & Restore**: Daily snapshot + on-demand.
- **Performance**: Dashboards and reports under typical loads (to be sized).
- **Localization**: BDT format, Bangla/English UI and SMS.
- **Export**: CSV/XLSX/PDF for key reports.
- **API-ready**: For SMS gateway; optional bank import formats.

---

## 8) KPIs & Dashboards
- Total Collections (month/quarter/YTD) vs Target
- Total Outstanding & Aging
- Today’s **Due Installments** & **Due Cheques**
- Expense by Category (month-to-date), Top 5 heads
- Per-Employee monthly spend
- Refunds count & amount (period)

---

## 9) Open Points to Confirm with Client
1. Final list of **sales stages** (booking, installments, registration, handover, others) and their rules.  
2. **Office charge** rules: default %, min/max, waiver permissions.  
3. **Penalty/late fee** policy for missed installments (yes/no, rate, grace days).  
4. Preferred **SMS gateway** and sender ID policy; Bangla support.  
5. **Bank reconciliation** file formats (CSV/Excel samples).  
6. Whether **mobile wallet** receipts (bKash/Nagad) are in scope initially.  
7. Exact **approval threshold** amounts and who approves what.  
8. Any **statutory reports** (VAT/TDS) needed now or later.  
9. Historical **data migration** sources and sample files.  
10. Any **branding** requirements for receipts/statements.
