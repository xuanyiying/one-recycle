# Profile UI Redesign Design Document

## Overview

This design document outlines the comprehensive redesign of the OneRecycle profile system, focusing on iOS Human Interface Guidelines compliance while maintaining full functionality with existing APIs. The design emphasizes visual hierarchy, intuitive navigation, and responsive behavior across all supported mini-program platforms.

## Architecture

### Component Structure
```
Profile System
├── Main Profile Page (index.tsx)
│   ├── User Info Card
│   ├── Statistics Grid
│   ├── Account Balance Section
│   ├── Menu List
│   └── Logout Section
├── Profile Edit Page (edit/index.tsx)
│   ├── Avatar Upload
│   ├── Form Fields
│   └── Save Actions
└── Shared Components
    ├── IOSCard
    ├── IOSButton
    ├── IOSInput
    └── IOSList
```

### API Integration
- **User Service**: getUserInfo, updateUserInfo for profile data
- **Account Service**: getMyAccount, getMyStats for financial data
- **Order Service**: getUserOrders for activity statistics
- **Navigation**: Taro routing for page transitions

## Components and Interfaces

### 1. User Information Card

**Design Specifications:**
- **Layout**: Horizontal flex layout with avatar left, details right
- **Avatar**: 70pt (140rpx) circular image with edit overlay
- **Typography**: 
  - Nickname: iOS Title 2 (44rpx), bold weight
  - User Level: iOS Callout (32rpx), blue accent
  - Phone: iOS Footnote (26rpx), secondary label color
- **Spacing**: 20pt margins, 8pt vertical gaps between text elements
- **Interactive**: Avatar tap navigates to edit page with scale animation

**Responsive Behavior:**
- Small screens: Vertical layout, centered alignment, 60pt avatar
- Standard/Large: Horizontal layout as specified

### 2. Statistics Grid

**Design Specifications:**
- **Layout**: 2x2 CSS Grid with 16pt gaps
- **Card Design**: 
  - Minimum height: 70pt (140rpx)
  - Border radius: 16pt
  - Gradient backgrounds: Orange, Green, Blue, Purple
  - White text with 0.8 opacity labels
- **Content Structure**:
  - Icon: 24pt size, white color, 8pt bottom margin
  - Value: iOS Title 2 (44rpx), bold, white
  - Label: iOS Footnote (26rpx), white with transparency
- **Interactions**: Scale to 0.95 on press, navigate to detail views

**Data Mapping:**
- Orders: totalOrders from AccountStats
- Earnings: totalIncome from AccountStats  
- Carbon: calculated as totalIncome * 0.02kg
- Balance: availableBalance from Account

### 3. Account Balance Section

**Design Specifications:**
- **Layout**: Card container with balance display and action buttons
- **Balance Display**:
  - Amount: iOS Large Title (68rpx), bold
  - Currency symbol: Included in formatAmount output
  - Frozen balance: Warning text if > 0
- **Action Buttons**:
  - Withdrawal and Transaction buttons
  - iOS secondary button style
  - Horizontal layout with 16pt gap
- **Conditional Display**: Only show if account data exists

### 4. Menu List

**Design Specifications:**
- **List Structure**: iOS grouped list style
- **Item Design**:
  - Height: 56pt (112rpx) minimum
  - Padding: 16pt horizontal
  - Icon: 18pt size, tertiary label color
  - Title: iOS Body (34rpx), medium weight
  - Arrow: iOS Title 3 (40rpx), tertiary color
- **Menu Items**:
  - Address Management → /pages/address/index
  - Customer Service → Contact action
  - Settings → /pages/settings/index
- **Interactions**: Background color change on press, iOS transition animations

### 5. Logout Section

**Design Specifications:**
- **Button Style**: iOS destructive button (red background)
- **Dimensions**: Full width, 48pt (96rpx) height
- **Typography**: iOS Body (34rpx), medium weight, white text
- **Spacing**: 32pt top margin for visual separation
- **Interaction**: Confirmation modal before logout execution

## Data Models

### UserInfo Interface
```typescript
interface UserInfo {
  avatarUrl: string
  nickName: string
  mobile: string
}
```

### Stats Interface
```typescript
interface Stats {
  totalOrders: number
  totalAmount: number
  savedCarbon: number
}
```

### Account Integration
- Uses existing Account type from account service
- Leverages AccountStats for statistics display
- Maintains compatibility with current API structure

## Error Handling

### Loading States
- **Initial Load**: iOS-standard loading spinner with brand color
- **Pull Refresh**: Native Taro pull-to-refresh implementation
- **Error Recovery**: Toast notifications for API failures with retry options

### Validation
- **Profile Edit**: Real-time validation with iOS error styling
- **Network Errors**: Graceful degradation with cached data fallback
- **Authentication**: Redirect to login if session expires

### User Feedback
- **Success Actions**: iOS-standard toast messages
- **Confirmations**: Native modal dialogs for destructive actions
- **Progress**: Loading states for async operations

## Testing Strategy

### Unit Testing Focus
- Component rendering with various data states
- API integration error handling
- Responsive layout calculations
- User interaction event handling

### Integration Testing
- End-to-end user flows (view → edit → save)
- Cross-platform compatibility (WeChat, Alipay, etc.)
- Network failure scenarios
- Authentication state management

### Visual Testing
- iOS design compliance verification
- Dark mode compatibility
- Screen size responsiveness
- Animation smoothness

## Implementation Notes

### iOS Design System Usage
- Extend existing .ios-card, .ios-button, .ios-list classes
- Use CSS custom properties for iOS system colors
- Implement proper safe area handling
- Follow 8pt grid system for all spacing

### Performance Considerations
- Lazy load user avatar images
- Cache account data with appropriate TTL
- Minimize re-renders with useCallback hooks
- Optimize bundle size with code splitting

### Accessibility
- Proper semantic HTML structure
- ARIA labels for interactive elements
- Keyboard navigation support
- Screen reader compatibility

### Platform Compatibility
- Taro component usage for cross-platform support
- Platform-specific styling where needed
- Consistent behavior across mini-program platforms
- Native navigation integration