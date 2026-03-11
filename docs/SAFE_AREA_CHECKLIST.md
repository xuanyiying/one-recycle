# Safe Area Adaptation Checklist (安全区域适配检查表)

## Overview
This checklist ensures that all pages in the `client-mini` application properly handle device safe areas (Notch, Dynamic Island, Home Indicator) across various devices (iPhone X/11/12/13/14/15 series, Android full-screen devices).

## Core Strategy
- **Logic**: Use `useSafeArea()` hook to get `top` (statusbar + padding) and `bottom` (home indicator) insets.
- **Style**: Use `padding-bottom: constant(safe-area-inset-bottom); padding-bottom: env(safe-area-inset-bottom);` as CSS fallback.
- **Layout**: Fixed-position elements (bottom buttons, custom headers) must consume safe area spacing.

## Page Checklist

### 1. Home Page (pages/index/index)
- [x] **Top**: Search bar/Nav bar should not be covered by Notch/Status bar. **Verified**: Uses `padding-top: calc(env(safe-area-inset-top) + $page-margin-top)`.
- [x] **Bottom**: Tab bar is standard Taro tab bar, handles safe area automatically.

### 2. Order List Page (pages/order/index)
- [x] **Top**: Tabs are below status bar.
- [x] **Bottom**: "立即下单" button (Empty State) uses standard layout.
- [x] **Popup**: "Select Category" popup must have bottom padding for Home Indicator. **Verified**: Added `padding-bottom: calc(20rpx + env(safe-area-inset-bottom))` to `.category-options`.

### 3. Withdrawal Page (pages/withdrawal/index)
- [x] **Top**: Navigation Bar title is visible.
- [x] **Bottom**: "确认提现" button is floating at bottom. **Verified**: Added `padding-bottom: calc(20rpx + env(safe-area-inset-bottom))` to container.
- [x] **Crash Fix**: Verified no crash on render.

### 4. Profile Page (pages/profile/index)
- [x] **Top**: Custom User Header handles status bar height. **Verified**: Used `useSafeArea` for dynamic top padding.
- [x] **Bottom**: "Log Out" button (if present) needs check. Current design doesn't have a fixed bottom button.

### 5. Order Detail Page (pages/order/detail/index)
- [x] **Bottom**: "Cancel/Pay" action bar must accommodate Home Indicator. **Verified**: Added `padding-bottom` to `.order-detail-page` container and `padding-bottom` to fixed `.action-bar`.

## Automation Test Script Guide

### Setup
Ensure `vitest` environment mocks `Taro.getSystemInfoSync` with various safe area configurations.

```typescript
// Mock iPhone X (Notch + Home Indicator)
vi.mock('@tarojs/taro', () => ({
  default: {
    getSystemInfoSync: () => ({
      safeArea: { top: 44, bottom: 800, height: 756 },
      screenHeight: 844,
      statusBarHeight: 44
    })
  }
}))

// Mock Android (No Notch, No Home Indicator)
vi.mock('@tarojs/taro', () => ({
  default: {
    getSystemInfoSync: () => ({
      safeArea: { top: 0, bottom: 800, height: 800 },
      screenHeight: 800,
      statusBarHeight: 24
    })
  }
}))
```

### Validation Steps
1. **Render Component**: Mount the page/component.
2. **Check Styles**: Verify that fixed containers have `padding-bottom` or `bottom` values that include safe area.
3. **Visual Check**: Ensure no overlap between interactive elements and system areas.
