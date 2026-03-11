# Admin Web Refactoring Plan

This plan addresses the complete refactoring of `apps/admin-web` to remove Ant Design, adopt Tailwind CSS, and leverage Next.js 13+ App Router features, aligning with the server's domain model.

## 1. Preparation & Design System (Day 1-3)
**Goal**: Establish the visual foundation and remove Ant Design dependencies.

*   **Dependency Management**: Uninstall `antd`, `@ant-design/*`. Install `tailwindcss`, `postcss`, `autoprefixer`, `clsx`, `tailwind-merge`, `react-hook-form`, `zod`, `@hookform/resolvers`, `lucide-react` (for icons).
*   **Tailwind Configuration**:
    *   Initialize `tailwind.config.js`.
    *   Define **Design Tokens** (Colors, Typography, Spacing, Breakpoints) matching the "distinctive, production-grade" aesthetic.
    *   Configure `globals.css` with Tailwind directives.
*   **Base Component Library (Atomic Design)**:
    *   Develop reusable, accessible components using Tailwind:
        *   `Button`, `Input`, `Select`, `Checkbox`
        *   `Card`, `Modal` (Dialog), `Drawer`
        *   `Table` (supporting sorting/pagination props)
        *   `Toast` / `Notification` system
    *   **Deliverable**: A set of pure Tailwind React components replacing Ant Design equivalents.

## 2. Architecture & Core Infrastructure (Day 4-10)
**Goal**: Implement the Next.js App Router architecture and Authentication.

*   **API Client (`src/lib/api.ts`)**:
    *   Create a `fetch` wrapper handling `BaseURL`, `Authorization` headers, and `401` Token Refresh.
    *   Support both **Server-Side** (using `next/headers` for cookies) and **Client-Side** calls.
*   **Authentication & Permissions**:
    *   Implement `src/components/AuthGuard.tsx` (HOC/Wrapper) for Server Session validation.
    *   Handle `302 Redirect` to `/login` for unauthenticated users.
    *   Handle `403 Forbidden` for unauthorized access.
*   **Global Error Handling**:
    *   Create `src/components/ErrorBoundary.tsx`.
    *   Create `global-error.tsx` and `not-found.tsx`.
*   **Layout Refactor**:
    *   Rebuild `Sidebar` and `Header` using Tailwind.
    *   Implement responsive layouts.

## 3. Feature Migration (Day 11-18)
**Goal**: Rewrite all pages using Server Components and new Data Fetching patterns.

*   **Pattern**:
    *   **Page (Server)**: Fetch initial data, render Layout.
    *   **List (Client)**: Handle interactive Sorting, Filtering, Pagination (URL synced).
    *   **Form (Client)**: `React Hook Form` + `Zod` validation.
*   **Modules**:
    *   **Dashboard**: Re-implement charts and stats using Server Data fetching.
    *   **Users**: List, Detail, Edit (with optimistic updates or revalidation).
    *   **Orders**: Complex filtering, Status updates.
    *   **Inventory/Couriers**: Management interfaces.
*   **Audit Logging**:
    *   Integrate `/audit` API calls for sensitive actions (Delete, Update).

## 4. Performance, Testing & DevOps (Day 19-22)
**Goal**: Optimization, Verification, and Deployment preparation.

*   **Performance**:
    *   Optimize Images (`next/image`).
    *   Verify LCP/FCP metrics (Lighthouse > 90).
    *   Implement Virtual Scrolling for lists > 1000 items.
*   **Testing**:
    *   Setup `Jest` + `React Testing Library`.
    *   Write Unit Tests for Components and Utils (Coverage ≥ 80%).
    *   Setup `MSW` for API mocking.
*   **DevOps**:
    *   Create Multi-stage `Dockerfile` (< 200MB).
    *   Create `nginx.conf` example.
    *   Document Environment Variables.

## Next Steps
I will begin with **Phase 1: Dependency Management & Tailwind Initialization**.
1.  Remove Ant Design.
2.  Install Tailwind and related tools.
3.  Create the `tailwind.config.js` with the new Design Tokens.
