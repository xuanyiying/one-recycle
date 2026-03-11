# Admin Web Refactoring & Feature Expansion Plan

This plan integrates the original refactoring goals with the new requirements for **Recycling Category Management** and **Tenant Recharge**, ensuring a complete, production-grade system.

## 1. Preparation & Design System (Day 1-3)
**Goal**: Establish visual foundation, remove Ant Design, and setup Tailwind.
*   **Dependency Management**: Uninstall `antd`. Install `tailwindcss`, `postcss`, `react-hook-form`, `zod`, `lucide-react`, `recharts` (for reports).
*   **Tailwind Config**: Define Design Tokens (Colors, Typography, Spacing).
*   **Base Components**: Build atomic components (`Button`, `Input`, `Table`, `Modal`, `Tree`, `Card`) using Tailwind.

## 2. Architecture & Core Infrastructure (Day 4-8)
**Goal**: Implement Next.js App Router, Auth, and basic API infrastructure.
*   **API Client**: `fetch` wrapper with Token Refresh, Error Handling, and `baseURL` management.
*   **Authentication**: `AuthGuard` (Server Session), Login/Logout flow.
*   **Layout**: Rebuild `Sidebar` and `Header` with responsive design.
*   **Global Error Handling**: `ErrorBoundary` and Audit Logging infrastructure.

## 3. Business Feature Migration (Day 9-15)
**Goal**: Migrate existing modules to new architecture.
*   **Dashboard**: Server Components for stats.
*   **Users & Orders**: List/Detail/Edit with Server Actions or API routes.
*   **Couriers & Inventory**: Management interfaces.

## 4. Enhanced Category Management (Day 16-18)
**Goal**: Implement advanced category management with standards and pricing.
*   **Backend Extensions**:
    *   Update `Category` entity: Add `classificationStandard` (Rich Text/JSON) and `stats` fields.
    *   Add `GET /api/category/stats`: Return weight/count per category.
*   **Frontend Implementation**:
    *   **Tree Table View**: Visual hierarchy management.
    *   **Configuration Form**: Manage Pricing (`Fixed`/`Range`), Unit, and Classification Standards.
    *   **Statistics**: Visual charts (Pie/Bar) for category distribution.

## 5. Tenant Recharge & Finance Module (Day 19-22)
**Goal**: Implement recharge flow, wallet management, and reconciliation.
*   **Backend Extensions**:
    *   **Recharge Plans**: Create `RechargePlan` entity (Amount, Bonus, Tag).
    *   **Account Service**: Implement `creditBalance(userId, amount, reason)` with Prisma Transactions.
    *   **Recharge Flow**: `POST /api/recharge` (Create Order) -> Payment Callback -> `AccountService.creditBalance`.
    *   **Reconciliation**: `GET /api/finance/reconciliation` (Compare DB vs Payment Gateway).
*   **Frontend Implementation**:
    *   **Plan Management**: CRUD for Recharge Plans/Discounts.
    *   **Finance Dashboard**: Recharge Records, Balance Inquiry, Manual Recharge (Audit required).
    *   **Reconciliation Report**: Visual difference highlighting.

## 6. Performance, Testing & Delivery (Day 23-25)
**Goal**: Optimization and final verification.
*   **Performance**: Virtual Scrolling for large lists, Image optimization.
*   **Testing**: Unit Tests (Jest/RTL) > 80% coverage, MSW Mocks.
*   **DevOps**: Dockerfile optimization (<200MB), Deployment Docs.

## Next Steps
I will begin with **Phase 1: Dependency Management & Tailwind Initialization**.
1.  Remove Ant Design.
2.  Install Tailwind stack.
3.  Configure Design Tokens.
