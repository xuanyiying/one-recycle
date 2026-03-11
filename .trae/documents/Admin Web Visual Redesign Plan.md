# Admin Web Visual Redesign Plan (Based on SkillsMP Style)

I have analyzed the current `apps/admin-web` project structure. It uses **Next.js 14**, **Tailwind CSS**, and a **Shadcn UI-compatible** theming system (CSS variables). This makes the visual redesign highly efficient as we can leverage the existing design token infrastructure.

I will delegate the core design and implementation to the **UI Design Expert** agent to ensure high-quality, pixel-perfect results matching the reference style.

## Phase 1: Visual Style Extraction & Design System Setup
1.  **Style Analysis**:
    *   Use the `ui-design-expert` agent to analyze the visual characteristics of `https://skillsmp.com/` (Color palette, Typography, Spacing, Shadows, Border Radius).
    *   *Note: Since I cannot directly browse the site, I will rely on the agent's capabilities or fallback to a "Modern AI/Tech Marketplace" aesthetic (Deep purples/blues, glassmorphism, clean typography) if direct extraction is limited, while asking you for specific screenshots if needed.*
2.  **Token Definition**:
    *   Create a new **Design Token Map** for Light and Dark modes.
    *   Update `src/app/globals.css` with the new color palette (Primary, Secondary, Accent, Background, Foreground).
    *   Update `tailwind.config.js` to reflect the new font family and border radius rules.

## Phase 2: Component Standardization (UI Kit)
1.  **Core Components**:
    *   Refine `Button`, `Input`, `Card`, `Badge` components in `src/components/ui` to match the new look (e.g., adjusting padding, hover effects, transitions).
    *   Implement "SkillsMP-style" micro-interactions (e.g., subtle glows on hover, scale effects).
2.  **Navigation & Layout**:
    *   Redesign `Sidebar.tsx` and `Header.tsx` to match the reference site's navigation style (likely glass effect or specific sidebar treatment).
3.  **UI Kit Demo**:
    *   Create a reusable `src/styles/design-tokens.ts` (or simply ensure CSS variables are comprehensive).
    *   (Optional) Create a temporary `_test/uikit` page to verify all components in isolation.

## Phase 3: Page Adaptation & Polish
1.  **Dashboard & Forms**:
    *   Apply the new card and chart styles to `dashboard/page.tsx`.
    *   Update form layouts to be consistent with the new spacing system.
2.  **Responsive Check**:
    *   Verify layout on 1366px (Laptop) and 2560px (Ultrawide) screens.
    *   Ensure mobile menu adaptations work smoothly.

## Phase 4: Verification
1.  **Review**: Check key pages (Login, Dashboard, User List) for visual consistency.
2.  **Dark Mode Test**: Verify seamless switching between Light and Dark themes.

**Next Step**: Upon confirmation, I will launch the **UI Design Expert** agent to begin the design system overhaul.