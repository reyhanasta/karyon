---
type: "requirements_discovery"
project_context: "Generic HRMS to future SaaS"
priority_phase: "Clinic first"
tech_stack: "Laravel (Monolith) + Inertia + React"
deployment_strategy: "Local VPS -> Cloud Hosting"
---

# HR Management System - Discovery & Architecture

## 1. Operational Rules & Blindspot Checks
- **Shift Scheduling**:
  - Shifts are strictly pre-defined per department by the management team.
  - Schedules cannot be changed abruptly; modifications require a lengthy discussion and adjustment process.
  - **Attendance Tracking**: Clock-in times are directly compared against the master shift table to automatically identify and log employee tardiness.
- **Photo Storage & Security**:
  - Selfie data is stored solely on the VPS within private storage (not publicly accessible).
  - Maximum data retention period is 3 months.
  - Access is restricted exclusively to the Administrator.
  - Encryption should be added to further prevent any potential data leaks.
- **Overtime Calculation**:
  - Overtime is calculated on a per-hour basis.
  - *Example*: If a shift is 08:00 - 16:00, and the employee clock-outs at 17:30, it is counted as exactly 1 hour of overtime.
- **Approval Workflow**:
  - Standard sequence: HR -> Head of Room (*Kepala Ruangan*) -> Director (*Direktur*).
  - **Flexibility/Delegation**: The system must support flexible delegation. For example, if the Head of Room is unavailable, approval can be delegated up to the Director, or if both are absent, delegated back to HR.

## 2. Architecture & Infrastructure
- **Core Technology Stack**:
  - **Backend**: Monolithic Architecture using Laravel.
  - **Frontend**: React driven by Inertia.js.
- **Hosting Strategy**:
  - **MVP Phase**: Hosted on a Local VPS.
  - **Scale Phase**: Migration to Cloud Hosting once the application runs reliably.
- **Data Safety & Integrity**:
  - Routine, automated backups utilizing the VPS's built-in backup features.
  - **Audit Logging**: Comprehensive audit logs for all critical system decisions, such as request submissions and approvals.

## 3. Product Vision & Business Strategy
- **Application Scope**: Designed to be a Generic Human Resource Management System (HRMS).
- **Initial Focus**: Prioritizing the Clinic (*Klinik*) use case and requirements first.
- **Future Roadmap**: The application architecture and business model are planned to evolve into a multi-tenant SaaS (Software as a Service) platform in the future.