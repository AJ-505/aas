# Product Requirements Document
## Cedric Masters Autos — Workshop & Dealership Management System

> A single system to manage every vehicle that comes through your doors — from service to sale. Built for your team. Designed to grow with your business.

---

## 1. Product Overview

**Product:** Web-based workshop and dealership management system  
**First Customer:** Cedric Masters Group (Lagos, Nigeria)  
**Target Market:** Automotive dealerships and after-sales service centres across Africa  
**Strategy:** Built generically from day one so other automotive businesses can use it too

### Core Modules

| Module | Description |
|---|---|
| **After-Sales Service** | End-to-end workshop management: customer intake, technician workflow, spare parts, invoicing |
| **Vehicle Sales** | Inventory tracking, customer leads, sales orders, delivery handover |
| **Administration** | User management, role-based access control, settings |

---

## 2. After-Sales Service Module

### 2.1 Customer Management
- Central customer database (name, phone, email, address)
- Searchable by name or phone
- Full repair history per customer
- One-stop creation: add customer + vehicle + check-in job in a single flow

### 2.2 Vehicle Check-In
- Walk-in or appointment booking
- Service advisor captures plate number, customer name, phone, and reported issue
- Quick lookup: returning customers auto-populate from existing records

### 2.3 Technician Job Intake
- Assigned technician records diagnosis
- Lists required spare parts from the catalogue
- Options for additional customer-authorized work

### 2.4 Spare Parts Catalogue
- Structured catalogue with unique part codes and OEM part numbers
- Tracks both cost price and selling price
- One-click Excel import for initial data load
- Role-locked to inventory clerk for integrity
- Low-stock alerts when quantity falls below reorder level
- Stock movement audit trail (in/out/adjust)

### 2.5 Labour Rate Configuration
- Flat fee per job type (e.g., "Oil change = NGN 5,000")
- Rates set by management, independent of vehicle model or technician
- Simple lookup table: job type -> fixed price

### 2.6 Invoice Generation
- Auto-calculated from parts + labour line items
- VAT applied at configurable rate (default 7.5%)
- Line items snapshot at time of generation (locked after invoicing)
- Manager approval step before customer sees the invoice

### 2.7 Payment Recording
- Multiple methods: cash, transfer, card
- Partial payments supported with balance tracking
- Auto-marks job paid when fully settled

### 2.8 Job Progress Tracking
8-status state machine:

```
Checked In -> Assigned -> Diagnosed -> In Progress -> Ready for Pickup -> Completed -> Paid
                                            |
                                    Waiting Release (if parts needed)
```

- Each transition logged with timestamp and user
- Parts request workflow integrated: technician requests -> inventory manager approves/rejects -> dispatches

### 2.9 Customer Portal (Post-MVP)
- Customers view repair history and download invoices
- Book appointments online

---

## 3. Vehicle Sales Module

### 3.1 Vehicle Inventory
- Track every vehicle: make, model, year, colour, VIN, plate, cost, selling price
- Status: In Stock / Reserved / Sold
- Link to service history: when a sold vehicle returns for service, the system knows its history

### 3.2 Customer Leads & CRM
- Log enquiries and test drives
- Track lead stages: New -> Contacted -> Qualified -> Won / Lost
- Follow-up reminders

### 3.3 Sales Orders
- Create order with agreed price and deposit
- Auto-reserve vehicle
- Balance tracking

### 3.4 Delivery Handover
- Checklist: keys, manual, toolkit, inspection
- Recorded against the sales rep

### 3.5 Trade-In Management (Post-MVP)
- Value, inspect, and apply trade-in credits toward purchase

### 3.6 Sales Commission Tracking (Post-MVP)
- Auto-track commission per sales rep

---

## 4. Administration

### 4.1 User Roles

| Role | Responsibilities |
|---|---|
| Admin | Full system access, manage users, configure rates |
| Service Advisor (CSR) | Front desk: check-in, customer registration |
| Technician | Diagnose issues, work on jobs, request parts |
| Inventory Clerk | Manage parts catalogue, stock levels |
| Finance / Invoice Clerk | Generate invoices, approve, record payments |
| Manager | Approve invoices, oversee operations |
| Sales Rep | Manage leads, create orders, handle deliveries |

### 4.2 Settings
- VAT rate configuration
- Labour type management (name + fixed price)

---

## 5. Cross-Cutting Features

### 5.1 Audit Trail
- Immutable log of all mutations
- Records user, action, entity type, entity ID, timestamp

### 5.2 Reporting & Dashboards (Post-MVP)
- Daily revenue, technician productivity, parts usage
- Profit margin analysis

### 5.3 Multi-Branch Support (Post-MVP)
- Manage Lagos, Abuja, Port Harcourt from one system

### 5.4 Accounting Integration (Post-MVP)
- Send invoices to QuickBooks, Sage, etc.

### 5.5 Excel Import/Export (Post-MVP)
- Download any list as spreadsheet
- Bulk-import customers and parts

---

## 6. Technical Architecture

- **Frontend:** TanStack Start (React 19) + TanStack Router + TailwindCSS v4
- **Backend:** Convex (realtime, serverless)
- **Auth:** Convex Auth with password provider (email + password)
- **Validation:** Zod v4 (shared between frontend and backend)
- **Data Fetching:** TanStack React Query v5
- **Monetary:** All values stored as integer kobo (100 kobo = 1 Naira)
- **Testing:** Vitest (unit) + Playwright (E2E)

---

## 7. Open Questions

1. First-time vs returning customers — different check-in flow or same?
2. Consumable items (oil, coolant, filters) — tracked as parts or handled separately on invoices?
3. Discounts — who can apply them and what are the limits?
4. VAT exemptions — do any customers or transactions qualify?
5. Credit terms — corporate clients on net-30?
