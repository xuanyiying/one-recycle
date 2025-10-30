# Profile UI Redesign Requirements

## Introduction

This document outlines the requirements for redesigning the OneRecycle mini-program profile page and its sub-pages to follow strict iOS design guidelines while maintaining functionality with existing APIs and improving user experience.

## Glossary

- **Profile_System**: The complete user profile management system including main profile page and sub-pages
- **User_Account**: User's personal information, statistics, and account balance data
- **iOS_Design_System**: Apple Human Interface Guidelines implementation for consistent UI/UX
- **Mini_Program**: Taro-based cross-platform application (WeChat, Alipay, TikTok, Kuaishou)
- **Account_Service**: Backend service providing user account and transaction data
- **User_Service**: Backend service providing user profile and address management

## Requirements

### Requirement 1

**User Story:** As a user, I want to view my profile information in a clean, iOS-native interface, so that I can easily access my account details and statistics.

#### Acceptance Criteria

1. WHEN the user opens the profile page, THE Profile_System SHALL display user avatar, nickname, phone number, and user level using iOS Title 2 typography (44rpx)
2. WHILE displaying user information, THE Profile_System SHALL use iOS card design with proper spacing (16pt margins, 20pt section gaps)
3. THE Profile_System SHALL implement iOS-compliant touch targets with minimum 44pt (88rpx) height for interactive elements
4. WHERE user avatar is displayed, THE Profile_System SHALL show an edit overlay with iOS blue accent color on touch
5. THE Profile_System SHALL support pull-to-refresh functionality with iOS-standard loading indicators

### Requirement 2

**User Story:** As a user, I want to see my account statistics in an intuitive visual format, so that I can quickly understand my recycling activity and earnings.

#### Acceptance Criteria

1. WHEN displaying statistics, THE Profile_System SHALL present data in a 2x2 grid layout with iOS-compliant spacing (16pt gaps)
2. THE Profile_System SHALL use distinct gradient backgrounds for each statistic card (orders, earnings, carbon savings, balance)
3. WHILE showing statistics, THE Profile_System SHALL use iOS Title 2 (44rpx) for values and iOS Footnote (26rpx) for labels
4. THE Profile_System SHALL implement iOS-standard touch feedback with 0.95 scale animation on press
5. WHERE statistics are interactive, THE Profile_System SHALL navigate to appropriate detail pages or show modal dialogs

### Requirement 3

**User Story:** As a user, I want to access profile-related functions through a clean menu interface, so that I can manage my account settings and preferences efficiently.

#### Acceptance Criteria

1. THE Profile_System SHALL display menu items using iOS list design with 56pt (112rpx) minimum height
2. WHEN showing menu items, THE Profile_System SHALL use iOS Body typography (34rpx) for titles and iOS tertiary label color for icons
3. THE Profile_System SHALL implement iOS-standard list item interactions with background color changes on press
4. WHERE menu items have badges or indicators, THE Profile_System SHALL use iOS red accent color (#FF3B30) with proper contrast
5. THE Profile_System SHALL group related menu items with appropriate section spacing (20pt between groups)

### Requirement 4

**User Story:** As a user, I want to manage my account balance and transactions, so that I can track my earnings and perform withdrawals.

#### Acceptance Criteria

1. THE Profile_System SHALL display account balance with prominent iOS Large Title typography (68rpx)
2. WHEN showing balance actions, THE Profile_System SHALL provide withdrawal and transaction history buttons with iOS button design
3. THE Profile_System SHALL format currency amounts using the Account_Service formatAmount method
4. WHERE frozen balance exists, THE Profile_System SHALL display warning information with appropriate iOS warning colors
5. THE Profile_System SHALL navigate to transaction and withdrawal pages maintaining iOS transition animations

### Requirement 5

**User Story:** As a user, I want the profile interface to work consistently across different screen sizes and platforms, so that I have a uniform experience regardless of device.

#### Acceptance Criteria

1. THE Profile_System SHALL implement responsive design supporting small (≤375pt), standard (≤414pt), and large (>414pt) screen sizes
2. WHEN on small screens, THE Profile_System SHALL adjust avatar size to 60pt and use vertical layout for user information
3. THE Profile_System SHALL maintain iOS safe area compliance with proper top and bottom padding
4. THE Profile_System SHALL support both light and dark mode using iOS system colors
5. WHERE touch interactions occur, THE Profile_System SHALL provide appropriate haptic feedback and visual responses

### Requirement 6

**User Story:** As a user, I want to edit my profile information easily, so that I can keep my account details up to date.

#### Acceptance Criteria

1. THE Profile_System SHALL provide a profile edit page with iOS-compliant form design
2. WHEN editing profile, THE Profile_System SHALL use iOS input field design with 44pt (88rpx) height and proper focus states
3. THE Profile_System SHALL validate input data and show iOS-standard error messages using iOS red color
4. THE Profile_System SHALL implement iOS keyboard handling with proper scroll behavior
5. WHERE profile updates occur, THE Profile_System SHALL use the User_Service updateUserInfo API and show success feedback

### Requirement 7

**User Story:** As a user, I want secure logout functionality, so that I can safely exit my account when needed.

#### Acceptance Criteria

1. THE Profile_System SHALL provide a logout button using iOS destructive button style with red background
2. WHEN logout is initiated, THE Profile_System SHALL show iOS-standard confirmation modal with "确认退出" title
3. THE Profile_System SHALL clear user session data and navigate to login page using Taro.reLaunch
4. THE Profile_System SHALL implement proper error handling for logout failures
5. THE Profile_System SHALL maintain logout button at bottom of page with 32pt top margin for visual separation