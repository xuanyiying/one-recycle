# Implementation Plan: Order Creation Flow

## Overview

This implementation plan breaks down the Order Creation Flow into discrete, manageable coding tasks. Each task builds incrementally on previous tasks, starting with core data models and state management, then implementing each step of the flow, followed by integration and testing.

---

## Tasks

- [x] 1. Set up project structure and core types

  - Create directory structure for order creation flow components
  - Define TypeScript interfaces for Order, Item, Address, TimeSlot
  - Set up Redux/Context store for global state (addresses, time slots, service area)
  - Create utility functions for validation and calculations
  - _Requirements: 1.1, 2.1, 3.1, 4.1_

- [ ]\* 1.1 Write unit tests for data models and validation utilities

  - Test Item validation (required fields, photo limits)
  - Test Address validation (service area checking)
  - Test TimeSlot validation (capacity, availability)
  - Test price calculation logic
  - _Requirements: 1.4, 2.3, 3.2, 4.1_

- [x] 2. Implement Item Form component (Step 1)

  - Create ItemForm component with category selector
  - Implement category-specific field rendering
  - Create PhotoUploader sub-component with 6-photo limit
  - Implement item list display with add/remove functionality
  - Connect to Redux store for state management
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [ ]\* 2.1 Write property test for item addition

  - **Feature: order-creation-flow, Property 1: Item Addition Increases Count**
  - **Validates: Requirements 1.5**

- [ ]\* 2.2 Write property test for category-specific fields

  - **Feature: order-creation-flow, Property 1.2: Category-Specific Fields Display**
  - **Validates: Requirements 1.2**

- [ ]\* 2.3 Write property test for photo upload limit

  - **Feature: order-creation-flow, Property 10: Photo Upload Limit Enforcement**
  - **Validates: Requirements 1.3**

- [x] 3. Implement price calculation and display

  - Create PriceEstimate component
  - Implement real-time price recalculation on item modification
  - Display individual item prices and total range
  - Add disclaimer text about courier evaluation
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [ ]\* 3.1 Write property test for price recalculation

  - **Feature: order-creation-flow, Property 2: Price Recalculation on Item Modification**
  - **Validates: Requirements 4.2**

- [x] 4. Implement Address Selection component (Step 2)

  - Create AddressSelection component
  - Display saved addresses with radio selection
  - Implement address validation against service area
  - Create AddressForm modal for adding/editing addresses
  - Handle "no addresses" edge case with prompt
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ]\* 4.1 Write property test for address validation

  - **Feature: order-creation-flow, Property 3: Address Validation Against Service Area**
  - **Validates: Requirements 2.3**

- [ ]\* 4.2 Write property test for address persistence

  - **Feature: order-creation-flow, Property 5: Address Persistence and Retrieval**
  - **Validates: Requirements 2.5**

- [x] 5. Implement Time Slot Selection component (Step 3)

  - Create TimeSlotSelection component
  - Implement date picker for next 7 days
  - Display available time slots with capacity indicators
  - Implement 15-minute slot reservation logic
  - Handle slot expiry and release
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ]\* 5.1 Write property test for time slot availability

  - **Feature: order-creation-flow, Property 3.2: Time Slot Availability Filtering**
  - **Validates: Requirements 3.2**

- [ ]\* 5.2 Write property test for slot reservation expiry

  - **Feature: order-creation-flow, Property 4: Time Slot Reservation Expiry**
  - **Validates: Requirements 3.4**

- [x] 6. Implement Order Confirmation component (Step 4)

  - Create OrderConfirmation component
  - Display complete order summary (items, address, time, pricing)
  - Implement edit buttons to return to previous steps
  - Add terms agreement checkbox
  - Implement order submission with loading state
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ]\* 6.1 Write property test for order submission atomicity

  - **Feature: order-creation-flow, Property 8: Order Submission Atomicity**
  - **Validates: Requirements 5.3, 5.4**

- [ ]\* 6.2 Write property test for loading state during submission

  - **Feature: order-creation-flow, Property 9: Loading State During Submission**
  - **Validates: Requirements 8.1, 8.2**

- [x] 7. Implement form state persistence

  - Create draft order service for local storage
  - Implement auto-save on form changes
  - Create draft recovery UI on app launch
  - Implement draft cleanup after successful submission
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ]\* 7.1 Write property test for draft persistence

  - **Feature: order-creation-flow, Property 5: Draft Order Persistence**
  - **Validates: Requirements 6.1, 6.2, 6.3, 6.4**

- [ ]\* 7.2 Write property test for form data restoration

  - **Feature: order-creation-flow, Property 6: Form Data Restoration on Back Navigation**
  - **Validates: Requirements 6.1, 6.2**

- [x] 8. Implement input validation and error handling

  - Create validation service with all validation rules
  - Implement field-level validation with error messages
  - Create form-level validation before submission
  - Implement error display UI components
  - Handle network errors with retry logic
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ]\* 8.1 Write property test for required field validation

  - **Feature: order-creation-flow, Property 7: Required Field Validation**
  - **Validates: Requirements 7.1, 7.4**

- [x] 9. Implement loading states and user feedback

  - Add loading indicators for async operations
  - Implement button disabled states during submission
  - Add success/error toast notifications
  - Implement smooth animations for item/price updates
  - Add visual confirmation for time slot selection
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ]\* 9.1 Write property test for loading state and button disable

  - **Feature: order-creation-flow, Property 9: Loading State Prevents Duplicate Submissions**
  - **Validates: Requirements 8.1**

- [x] 10. Implement Order Success page

  - Create OrderSuccess component
  - Display order number and confirmation details
  - Implement navigation to order details or home
  - Add order tracking link
  - _Requirements: 5.4_

- [x] 11. Integrate all components into flow container

  - Create OrderCreationFlow container component
  - Implement step navigation (next/back)
  - Connect all components to Redux store
  - Implement data flow between steps
  - Handle form state transitions
  - _Requirements: 1.1, 2.1, 3.1, 5.1_

- [x] 11.1 Write integration tests for complete flow

  - Test full order creation from item selection to success
  - Test back navigation and data restoration
  - Test error scenarios and recovery
  - Test draft persistence and recovery
  - _Requirements: All_

- [x] 12. Checkpoint - Ensure all tests pass

  - Ensure all tests pass, ask the user if questions arise.

- [ ] 13. Implement API integration

  - Create API client for order submission
  - Implement address validation API call
  - Implement time slot availability API call
  - Implement price estimation API call
  - Add error handling and retry logic
  - _Requirements: 2.3, 3.2, 4.1, 5.4_

- [x] 13.1 Create order submission API endpoint integration

  - Implement POST /api/orders endpoint call
  - Handle order creation response with order number
  - Implement error handling for submission failures
  - Add retry logic with exponential backoff
  - _Requirements: 5.4_

- [ ] 13.2 Implement address validation API integration

  - Create API call to validate address against service area
  - Handle validation response and error cases
  - Update AddressSelection component to use API
  - _Requirements: 2.3_

- [x] 13.3 Implement time slot availability API integration

  - Create API call to fetch available time slots
  - Handle slot data and capacity information
  - Update TimeSlotSelection component to use API
  - _Requirements: 3.2_

- [x] 13.4 Implement price estimation API integration

  - Create API call to calculate item prices
  - Handle pricing response with min/max ranges
  - Update PriceEstimate component to use API
  - _Requirements: 4.1_

- [ ] 14. Implement iOS design system compliance

  - Apply iOS design tokens (colors, typography, spacing)
  - Ensure all buttons are 44pt (88rpx) minimum
  - Apply proper spacing (8pt grid system)
  - Implement safe area insets
  - Add dark mode support
  - _Requirements: All_

- [ ]\* 14.1 Write visual regression tests

  - Test component rendering against design specs
  - Verify spacing and alignment
  - Verify color usage and contrast
  - _Requirements: All_

- [ ] 15. Performance optimization

  - Implement image lazy loading for photos
  - Optimize re-renders with React.memo
  - Implement virtual scrolling for long lists
  - Add code splitting for components
  - _Requirements: All_

- [ ] 16. Final Checkpoint - Ensure all tests pass

  - Ensure all tests pass, ask the user if questions arise.

- [ ] 17. Documentation and handoff
  - Document component APIs and usage
  - Create troubleshooting guide for common issues
  - Document state management patterns
  - Create developer guide for extending the flow
  - _Requirements: All_
