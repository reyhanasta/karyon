# 🚀 Project Plan: HRMS MVP (Human Resource Management System)

> **Tech Stack:** Laravel 12, Inertia.js (React), MySQL, Shadcn/UI, Spatie Permission.
> **Version:** 1.0.0-MVP
> **Status:** Planning Phase

---

## 📌 1. Project Overview
Build an internal human resource information system to manage employee data structurally, and facilitate digital leave and overtime requests.

### Core Objectives:
1.  **Centralized Data:** Single Source of Truth (SSOT) for employee data.
2.  **Self-Service:** Employees can independently request leave or overtime.
3.  **Automated Workflow:** Multi-level approval system.

---

## 🛠 2. Technical Stack Specification
| Layer | Technology | Notes |
| :--- | :--- | :--- |
| **Backend** | Laravel 12 | PHP 8.3+ |
| **Frontend** | React + Inertia.js | SPA feel with SSR capability |
| **UI Library** | Shadcn/UI + Tailwind CSS | Radix UI primitives |
| **Database** | MySQL 8.0 | Relational storage |
| **RBAC** | Spatie Laravel Permission | Role & Permission management |
| **Icons/Assets**| Lucide React | Clean & consistent icons |

---

## 🏗 3. Database & Schema Design (MVP)

### Roles (Spatie)
* `super-admin`: Full system access.
* `hr-admin`: Manage employees & recapitulations.
* `manager`: Approve subordinate's leave/overtime requests.
* `employee`: Submit leave/overtime requests & view profile.

### Tables Reference
* **users**: Employee Number / NIP (unique), email, password, role_id.
* **employees**: user_id, full_name, position, department, join_date, leave_quota (default 12).
* **leave_requests**: employee_id, leave_type_id, start_date, end_date, reason, status (pending/approved/rejected).
* **overtime_requests**: employee_id, date, start_time, end_time, description, status.

---

## 📅 4. Development Roadmap (Phases)

### Phase 1: Environment & Base Setup 🛠
- [ ] Initialize Laravel 12 with `@inertiajs/react`.
- [ ] Install Shadcn/UI & configure Tailwind.
- [ ] Install & Configure Spatie Permission.
- [ ] Setup Database Migrations & Seeders (Default Roles & Admin User).

### Phase 2: Employee Management (Master Data) 👥
- [ ] Create `Employee` Model, Controller, and Migration.
- [ ] UI: Employee Data Table (TanStack Table).
- [ ] UI: Add/Edit Employee Form (React Hook Form + Zod).
- [ ] Logic: Assign roles to specific employees.

### Phase 3: Leave Management Module 🏖
- [ ] Logic: Validate remaining leave quota before submitting.
- [ ] UI: Employee Dashboard (Remaining Leave & History).
- [ ] UI: Admin/Manager Approval Inbox.
- [ ] Logic: Automatically deduct `leave_quota` if status = `approved`.

### Phase 4: Overtime Module 🕒
- [ ] UI: Overtime Request Form.
- [ ] UI: Monthly Overtime Recapitulation (Admin View).
- [ ] Logic: Total overtime hours calculation.

### Phase 5: Final Polish & Export 🏁
- [ ] UI: Toast Notifications (Sonner).
- [ ] Feature: Export Recapitulation (Excel/PDF) - *Optional for MVP*.
- [ ] Deployment Readiness (Optimization & Caching).

---

## 🤖 5. Automation & Standards (Robot-Friendly)

### Code Style
* **Backend:** PSR-12, Laravel Pint.
* **Frontend:** ESLint, Prettier, TypeScript (Recommended).

### API / Route Convention
* Web Routes: `routes/web.php` (Inertia focused).
* Naming: `employees.index`, `leaves.store`, `overtime.update`.

### Key Business Rules
1.  `leave_requests` can only be created if `leave_quota` > requested days.
2.  `overtime_requests` cannot overlap on the same date for the same user.
3.  Non-admin users can ONLY see their own data.

---

## 📋 6. Next Steps
1.  Setup repository on GitHub/GitLab.
2.  Run `laravel new` and install the starter kit.
3.  Implement initial Database Migrations.