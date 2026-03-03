---
type: "technical_requirements"
overtime_calculation: "Exact Time"
development_timeline: "2 to 4 weeks"
monetization_phase: "Free/Beta Pilot"
---

# HR Management System - Technical Strategy & Logistics

## 1. Precise Overtime Calculation
- **Revised Rule**: Overtime will be calculated **accurately down to the minute** with no rounding.
- *Example*: Working an extra 1 hour counts as exactly 1 hour. Working an extra 1 hour 30 minutes counts as exactly 1h 30m.

## 2. Pragmatic Development Approach (No Over-engineering)
- **Scope Restriction**: Build to solve immediate internal needs and the primary needs of the Clinic first. Avoid unnecessary complexities that don't serve the MVP.

## 3. Backup Execution
- **Methodology**: Automated daily database dumps and compressed (`.zip`) entire storage backups.

## 4. SaaS Optimizations & Security
- **Legal Compliance**: Add a Consent Clause during tenant onboarding.
- **Data Protection**: Encrypt highly sensitive database columns (e.g., National ID/KTP Number, Tax ID/NPWP).
- **Access Control**: Implement extremely strict role-based access restrictions.

## 5. System Migration & Observability
- **Data Migration Strategy**:
  - Employee data will be imported via Excel/CSV.
  - Historical attendance data will not be migrated (starting fresh).
  - An import tool/script needs to be built for migrating the employee Excel data.
- **Observability implemented for SaaS**:
  - Separate log channels isolated per tenant.
  - Implement an error tracking and notifier system (equivalent to Sentry).

## 6. Pilot Timeline & Runway
- **Pilot User**: 1 Clinic is confirmed and ready to be the pilot user.
- **Deadline Target**: The aggressive goal for the MVP is **2 weeks**, with a realistic runway maximum of **1 month** to finish development.
- **Monetization**: It will be deployed for **free** initially to gather data and feedback, before rolling out any paid billing models.