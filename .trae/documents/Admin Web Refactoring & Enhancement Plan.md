Based on the comprehensive analysis of your `/Users/yiying/dev-app/one-recycle/apps/admin-web/` project, I have formulated the following refactoring and enhancement plan.

The project is currently a **Next.js 14** application using **Ant Design** and **TypeScript**. While the basic structure is sound, it lacks standardized formatting, testing, and component modularity. The following plan addresses all your requirements.

## 1. Code Structure & Quality Infrastructure
**Goal**: Establish a robust foundation for development and maintenance.
- **Tools Setup**: Install `prettier` and configure it with `eslint` to ensure consistent code style.
- **Directory Organization**:
    - Create `src/hooks` for custom React hooks (data fetching, logic).
    - Create `src/types` for shared TypeScript interfaces (moving them out of service files if reused).
    - Create `src/utils` for helper functions.
- **Clean Up**: Remove inline styles from `layout.tsx` and `Sidebar.tsx` and replace them with **CSS Modules** for better maintainability and performance.

## 2. Component Refactoring & Modularity
**Goal**: Reduce code duplication and improve readability.
- **UsersPage Refactoring**: The current `UsersPage` (Lines 1-685) is too large.
    - Extract `UserModal` (Add/Edit form) into a separate component.
    - Extract `UserDetailModal` into a separate component.
    - Extract `UserStatsCards` into a separate component.
- **Logic Extraction**: Move the data fetching and state management logic from `UsersPage` into a `useUsers` custom hook.

## 3. Feature Completion: Security & Permissions
**Goal**: Implement the missing "Permission Control" core feature.
- **RBAC Implementation**: Create a `PermissionGuard` component and `usePermission` hook.
    - Allow wrapping components like: `<PermissionGuard role={UserRole.ADMIN}><DeleteButton /></PermissionGuard>`.
- **API Robustness**: Enhance `apiClient.ts` to handle token expiration and redirects more gracefully.

## 4. Testing & Reliability
**Goal**: Ensure code stability and prevent regressions.
- **Test Infrastructure**: Install `jest`, `jest-environment-jsdom`, and `@testing-library/react`.
- **Unit Tests**: Write unit tests for `userService` to verify API calls and data transformation.
- **Integration Tests**: Write tests for the `PermissionGuard` to ensure unauthorized users cannot see restricted content.

## 5. UI/UX Optimization
**Goal**: Provide a professional and responsive interface.
- **Responsive Sidebar**: Fix the fixed-width sidebar (currently hardcoded `200px`) to be responsive on smaller screens.
- **Feedback & Loading**: Standardize loading spinners and error error boundaries across all pages.

### Execution Order
1.  **Infra**: Install Prettier/Jest.
2.  **Refactor**: Clean up Layout/Sidebar & Split UsersPage.
3.  **Feature**: Add Permissions.
4.  **Test**: Write Tests.
