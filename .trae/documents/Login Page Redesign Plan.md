# Admin Web Login Page Redesign Plan

I will redesign the login page to align with the new "Deep Space & Neon Glass" aesthetic and switch the authentication method to Account/Password as requested.

## 1. Component Creation
-   **Create `Checkbox` Component** (`src/components/ui/checkbox.tsx`):
    -   Implement a custom checkbox using `radix-ui` primitives or pure React/Tailwind.
    -   Style it to match the new Neon/Glass theme (glowing border when checked).

## 2. Login Page Redesign (`src/app/(auth)/login/page.tsx`)
-   **Visual Style**:
    -   **Background**: Deep Space gradient (inherited from `globals.css`).
    -   **Layout**: 
        -   **Desktop**: Split screen. Left side for Branding/Visuals (Hero text, decorative neon elements). Right side for the Login Form (Glassmorphism card).
        -   **Mobile**: Single column, centered form.
-   **Form Implementation**:
    -   **Input Fields**:
        -   **Username/Account**: Text input with icon (User).
        -   **Password**: Password input with toggle visibility eye icon.
    -   **Controls**:
        -   "Remember Me" checkbox.
        -   "Forgot Password" link (hover effect: text-primary).
    -   **Validation**:
        -   Use `zod` schema: Username (required), Password (min 6 chars).
        -   Real-time error feedback using `react-hook-form`.
-   **Authentication Logic**:
    -   Switch from SMS code to `authService.login({ account, password })`.
    -   Implement "Remember Me" logic (persist username to `localStorage`).
    -   Error Handling: Display clear Toast messages for invalid credentials.

## 3. Verification
-   **Responsiveness**: Verify layout on Mobile (375px) vs Desktop (1440px).
-   **Functionality**: Test successful login, validation errors, and "Remember Me" persistence.
-   **Browser Compatibility**: Ensure gradients and glass effects render correctly across major browsers (Chrome/Safari/Firefox).

**Next Step**: Upon approval, I will create the Checkbox component and rewrite the Login page.