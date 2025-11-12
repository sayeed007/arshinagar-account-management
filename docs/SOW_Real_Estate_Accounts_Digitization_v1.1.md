# STATEMENT OF WORK (SOW)

### Project: Real Estate Accounts Digitization System
**Prepared by:** [Your Company Name]
**Date:** November 12, 2025
**Version:** 1.2  

---

## 1. Parties Involved

| **Client** | **Service Provider** |
|-------------|----------------------|
| **Company:** [Client Company Name] | **Company:** [Your Company Name] |
| **Contact:** [Client Representative Name, Title] | **Contact:** [Your Name], Founder & Senior Software Engineer |
| **Email:** [client@email.com] | **Email:** [your@email.com] |
| **Phone:** [client phone] | **Phone:** [your phone] |

---

## 2. Project Overview
Following our meeting on [Meeting Date], **[Your Company Name]** will design, develop, and deploy a **web-based Accounting and Financial Management System** for the client’s Real Estate business operations in Bangladesh.

The system will manage all financial operations related to land projects—client installments, land purchase, salary expenses, refunds, cheque tracking, notifications, and bank/cash reconciliation.

**System Roles:**
- System Admin  
- Accounts Manager  
- HR Head / Head of Finance  

---

## 3. Client Requirements

| # | Requirement |
|---|--------------|
| 1 | **Client & Land Management** — Full client master data, RS (Dag) number-based land allocation, remaining land tracking |
| 2 | **Plot Inventory System** — Track available/sold plots, auto-update from RS allocations |
| 3 | **Installment Scheduling** — Auto-generate payment plans with due dates, penalties, and reminders |
| 4 | **Receipt & Payment Tracking** — Booking, installments, handover, registration with approval chain |
| 5 | **Booking Cancellation Workflow** — Refund calculation with configurable office charge (%) |
| 6 | **Expense Management** — Categorized company expenses (land purchase, utilities, stationery, etc.) |
| 7 | **Employee Cost Tracking** — Per-employee salary, commission, fuel, reimbursement, and deduction records |
| 8 | **Multi-Bank Management** — Multiple bank accounts + cash-in-hand with consolidated balance |
| 9 | **Cheque Register** — Track post-dated and current cheques with alerts for due/overdue |
| 10 | **Automated Notifications** — SMS alerts for due payments, received installments, and cheque reminders |
| 11 | **Bulk Messaging** — Send custom/broadcast SMS for due reminders or announcements |
| 12 | **Approval Workflow** — Multi-level approvals for transactions and edits |
| 13 | **Data Migration Module** — Import historical records (2017–2025) with validation |
| 14 | **Financial Reporting Suite** — Ledger, Trial Balance, P&L, Balance Sheet, Receipts & Payments |
| 15 | **Dashboard & KPIs** — Summary of collections, expenses, outstanding dues, refunds |
| 16 | **Audit Log & Access Control** — Track every change and action by user role |

---

## 4. Scope of Work & Delivery Timeline

| **Phase** | **Activities** | **Deliverables** | **Estimated Duration** |
|------------|----------------|------------------|------------------------|
| **Phase 0 (Initial)** | • Detailed requirement gathering sessions<br>• System architecture design<br>• UI/UX wireframes and mockups<br>• Database schema design<br>• **Client review & approval before coding** | • Business Requirements Document (BRD)<br>• Technical Specification Document<br>• Complete UI/UX designs (Figma/Adobe XD)<br>• Database ER diagrams<br>• Signed approval from client | **2 weeks** |
| **Phase 1** | • Master setup for land, client, RS number tracking<br>• Project and installment schedule module<br>• Role-based access control setup | • Master data module<br>• RS-wise land balance view<br>• Project management interface<br>• User role management | **3 weeks** |
| **Phase 2** | • Collections & Receipts module<br>• Booking and installment payment flows<br>• Multi-level approval workflow<br>• SMS integration for receipts | • Receipt workflow with approval chain<br>• Automated SMS notifications<br>• Collection reports and tracking<br>• Payment history views | **3 weeks** |
| **Phase 3** | • Expense management system<br>• Booking cancellation & refund workflow<br>• Employee cost tracking (salary, commission, fuel)<br>• Payroll integration | • Expense dashboard with categories<br>• Refund calculation engine<br>• Employee cost module<br>• Payroll reports | **3 weeks** |
| **Phase 4** | • Cheque register & tracking system<br>• Bank & cash management<br>• Financial reports suite<br>• Dashboard & KPIs<br>• Data migration module (if opted) | • Cheque alerts (due/overdue)<br>• Multi-bank management interface<br>• Complete financial reports (Ledger, Trial Balance, P&L, Balance Sheet)<br>• Executive dashboard<br>• Historical data import | **3 weeks** |
| **Phase 5 (Testing)** | • Comprehensive system testing<br>• User Acceptance Testing (UAT) with client<br>• Bug fixes and refinements<br>• Performance optimization<br>• Training & documentation<br>• Final deployment to production | • Complete test reports<br>• UAT sign-off from client<br>• User training sessions (video + live)<br>• User manual & documentation<br>• Production deployment<br>• Post-deployment support plan | **2 weeks** |

**Total Project Duration:** 4 months (16 weeks) from SOW signing and initial payment.
*Timeline assumes client feedback within 2 business days per milestone to maintain schedule.*

### Phase 0 - Critical Success Factor
⚠️ **Phase 0 is mandatory** to ensure alignment between client expectations and development. No coding will begin until client formally approves the designs and specifications from Phase 0.

---

## 5. Cost Breakdown

| Item | Description | Cost (BDT) |
|------|--------------|------------|
| **Core System Development** | Land/RS tracking, accounting workflows, receipts, expenses, cheques, reports, SMS integration | **460,000** |
| **Data Migration (Optional)** | Data import, validation & verification (2017–2025) | **60,000** |
| **Setup, Training & Deployment** | AWS setup, domain, SSL, and user training | **40,000** |
| **Total (with Migration)** |  | **560,000 BDT** |
| **Total (without Migration)** |  | **500,000 BDT** |

> *If the client provides cleaned and validated data in the provided Excel template, migration charges may be reduced accordingly.*

---

### Monthly Service Cost

| Item | Description | Cost (BDT) |
|------|--------------|------------|
| **AWS Hosting** | EC2, S3, Storage | ~20,000 |
| **SMS Gateway** | 3,000 masked SMS/month | ~1,000 |
| **Total Monthly Cost** | (First month free) | **21,000 / month** |

---

## 6. Payment Schedule

| Installment | Trigger | Amount (BDT) | % |
|--------------|----------|---------------|-----|
| **1st Payment** | Upon SOW signing (Phase 0 initiation) | **112,000** | 20% |
| **2nd Payment** | After Phase 0 approval & Phase 1 completion | **168,000** | 30% |
| **3rd Payment** | After Phase 3 completion | **168,000** | 30% |
| **4th Payment** | Upon Phase 5 completion, UAT sign-off & production deployment | **112,000** | 20% |
| **Total** | | **560,000** | 100% |

*Payments via bank transfer within 7 days of invoice.*

**Payment Notes:**
- First payment initiates Phase 0 (requirement gathering & design)
- No development coding begins until Phase 0 is approved and 2nd payment is received
- Final payment includes 30 days post-deployment support

---

## 7. Assumptions
- Client will provide: project names, RS Number data, branding assets, and SMS gateway credentials (if applicable).
- Client will participate actively in Phase 0 requirement gathering sessions and provide timely feedback on UI/UX designs.
- All modules in English (Bangla optional for SMS).
- One designated client representative for feedback and approvals.
- No major scope changes without written approval and change request process.
- Historical data will be provided in predefined Excel format with reasonable data quality.
- Client will provide a staging/testing environment access for UAT in Phase 5.

## 8. Post-Deployment Support
- **30 days free support** included after production deployment
- Bug fixes and minor adjustments during support period
- After 30 days: Optional Annual Maintenance Contract (AMC) available at **15% of project cost per year**
- AMC includes: bug fixes, minor enhancements, priority support, and system updates  

---

## 9. Change Request Process
Any scope, cost, or timeline modification must be:
1. Submitted in writing by either party.
2. Reviewed and quoted within 48 hours.
3. Approved via a signed addendum.

---

## 10. Acceptance & Signatures
This SOW is valid for **15 days** from the date above.

| **Client** | **Service Provider** |
|-------------|----------------------|
| Name: ____________________ | Name: [Your Name] |
| Title: ___________________ | Title: Founder |
| Signature: _______________ | Signature: _______________ |
| Date: ____________________ | Date: ____________________ |

---

✅ **Prepared by:**  
[Your Name]  
Founder & Senior Software Engineer  
[Your Company Name]  
[Email] | [Phone]
