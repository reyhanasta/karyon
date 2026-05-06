# 🚀 KaryaOne HRIS

[![Version](https://img.shields.io/badge/version-0.1.0--alpha-blue.svg)](https://github.com/reyhanasta/karyaone/releases)
[![Laravel](https://img.shields.io/badge/Laravel-12.x-red.svg)](https://laravel.com)
[![React](https://img.shields.io/badge/React-19.x-blue.svg)](https://react.dev)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

**KaryaOne** (KaryaOne) is a modern, high-performance Human Resource Information System (HRIS) designed to streamline organizational workflows. Built with the latest tech stack, it provides a seamless experience for both administrators and employees.

---

## ✨ Key Features

### 👥 Employee Management

- **Centralized Profiles:** Manage comprehensive employee data, departments, and positions.
- **Document Tracking:** Digital storage and management of employee-specific documents (Employment Letters, Contracts, etc.).
- **Dynamic Org Structure:** Manage hierarchical relationships between departments and positions.

### 🕒 Attendance & Shift Management

- **Shift Configuration:** Create flexible work schedules (Morning, Afternoon, Night, etc.).
- **Shift Assignments:** Assign schedules to employees with ease.
- **Shift Change Requests:** Integrated workflow for employees to request shift swaps or changes.

### 🏖 Leave & Overtime

- **Leave Request System:** Automated quota calculation and multi-level approval.
- **Overtime Management:** Request and track overtime hours with granular display/export controls.
- **Export Capabilities:** Generate professional recapitulations in **PDF** and **Excel** formats.

### 🛡 Core Foundation

- **Advanced Approval Hierarchy:** Customizable approval flows involving various organizational roles (Karu, Kabid, HR, etc.).
- **RBAC (Role-Based Access Control):** Granular permissions powered by Spatie.
- **Modern UI/UX:** Clean, responsive interface built with Shadcn UI and Tailwind CSS 4.0 (Dark mode supported).

---

## 🛠 Tech Stack

- **Backend:** [Laravel 12](https://laravel.com)
- **Frontend:** [React](https://react.dev) via [Inertia.js](https://inertiajs.com)
- **Styling:** [Tailwind CSS 4.0](https://tailwindcss.com) & [Shadcn UI](https://ui.shadcn.com)
- **Database:** MySQL / PostgreSQL
- **Real-time:** [Laravel Reverb](https://reverb.laravel.com)
- **Testing:** [Pest PHP](https://pestphp.com)

---

## 🚀 Getting Started

### Prerequisites

- PHP 8.3+
- Node.js 20+
- Composer
- MySQL 8.0+

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/reyhanasta/karyaone.git
   cd KaryaOne
   ```

2. **Install PHP dependencies:**

   ```bash
   composer install
   ```

3. **Install JS dependencies:**

   ```bash
   npm install
   ```

4. **Environment Setup:**

   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

5. **Run Migrations & Seeders:**

   ```bash
   php artisan migrate --seed
   ```

6. **Start Development Server:**

   ```bash
   # Run Laravel & Vite concurrently
   npm run dev
   ```

---

## 🗺 Roadmap

- [x] Core HR Modules (Employee, Dept, Position)
- [x] Shift & Leave Management
- [x] Multi-level Approval Workflow
- [x] Document Export (PDF/Excel)
- [ ] **Attendance System (GPS & Geofencing)** - *Upcoming*
- [ ] **Payroll Management** - *Upcoming*
- [ ] Mobile App Integration

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

The KaryaOne HRIS is open-sourced software licensed under the [MIT license](LICENSE).
