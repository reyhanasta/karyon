---
type: "architecture_decisions"
project_context: "SaaS Multi-Tenant Commercial Product"
multi_tenant: true
tenant_isolation: "tenant_id column"
---

# HR Management System - Architecture Decisions & Clarifications

## 1. Multi-Tenant Architecture
- **Decision**: The system will be designed for multi-tenancy from Day 1.
- **Implementation**: Every relevant database table will include a `tenant_id` column to ensure strict data isolation between organizations.

## 2. Dynamic Overtime Logic
- **Rounding Rules**:
  - Overtime less than 45 minutes is considered 0 (discarded).
  - Overtime of 45 minutes or more is rounded up to 1 full hour.
- **Configurability**: Overtime rules and rounding logic must be configurable per tenant in the future.

## 3. Attendance & Shift Flexibility
- **Acknowledgment**: Acknowledged the need to handle dynamic shifts and edge cases rather than relying solely on static schedules.

## 4. Approval Delegation Workflow
- **Manual Control**: The decision to delegate approvals (e.g., when a Head of Room/Department Head is absent) will remain a **manual process managed by HR**.
- **Workflow Engine**: Agreed to build a reusable workflow engine/system rather than relying solely on hardcoded fixed approvals.

## 5. Backup Strategy & Offsite Storage
- **Current Strategy**: Daily backups are saved to the server's local hard drive, which is synchronized to Google Drive.
- **Contingency**: If the VPS goes down entirely, Google Drive serves as the secondary media.
- *(Note: Your Google Drive setup exactly fulfills the definition of an "offsite backup," as it stores a copy of your data in a geographically separate cloud location away from your primary VPS).*

## 6. Project Commitments
- **Commercial Standard**: The application will be treated and built as a serious commercial product.
- **SaaS Foundation**: `tenant_id` will be integrated from the beginning.
- **Customization**: Critical features like overtime will be configurable on a per-tenant basis.