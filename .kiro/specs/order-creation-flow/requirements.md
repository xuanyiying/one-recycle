# Requirements Document: Order Creation Flow

## Introduction

The Order Creation Flow enables users to submit recycling orders through a multi-step process. Users select recyclable items, provide item details with photos, choose a delivery address, select a preferred pickup time, review order details, and confirm submission. This flow is the core user journey in OneRecycle, converting user intent into actionable orders for the dispatch system.

## Glossary

- **Order**: A complete recycling request containing items, address, time slot, and pricing information
- **Item**: An individual recyclable object being submitted (e.g., iPhone 13 Pro, winter coat)
- **Category**: A classification of recyclable items (e.g., Electronics, Clothing, Books)
- **Condition**: The quality state of an item (New, Good, Fair)
- **Address**: A delivery location with recipient name, phone, and full address details
- **Time Slot**: A predefined 2-hour window for courier pickup (e.g., 14:00-16:00)
- **Pricing Estimate**: A calculated price range based on item category, condition, and weight
- **Order Confirmation**: Final review page before order submission showing all details and total price

## Requirements

### Requirement 1: Item Selection and Details

**User Story:** As a user, I want to select recyclable items and provide detailed information about each item, so that the system can accurately estimate value and dispatch appropriate couriers.

#### Acceptance Criteria

1. WHEN a user initiates the order creation flow THEN the system SHALL display a form to add recyclable items with category selection
2. WHEN a user selects a category THEN the system SHALL display category-specific fields (brand, model, condition, weight/quantity, photos)
3. WHEN a user uploads item photos THEN the system SHALL accept up to 6 photos per item and store them for courier reference
4. WHEN a user enters item details THEN the system SHALL validate that required fields (category, condition) are completed before allowing progression
5. WHEN a user adds multiple items THEN the system SHALL maintain a list of all added items and allow removal of individual items

### Requirement 2: Address Selection and Management

**User Story:** As a user, I want to select or manage delivery addresses, so that the courier knows exactly where to pick up my items.

#### Acceptance Criteria

1. WHEN a user reaches the address selection step THEN the system SHALL display all previously saved addresses with the default address pre-selected
2. WHEN a user has no saved addresses THEN the system SHALL prompt the user to add a new address before proceeding
3. WHEN a user selects an address THEN the system SHALL validate that the address is within the service area
4. WHEN a user chooses to add a new address THEN the system SHALL display a form with fields for recipient name, phone number, region, and detailed address
5. WHEN a user saves an address THEN the system SHALL persist the address and allow it to be selected for future orders

### Requirement 3: Time Slot Selection

**User Story:** As a user, I want to select a convenient pickup time slot, so that the courier can arrive when I'm available.

#### Acceptance Criteria

1. WHEN a user reaches the time selection step THEN the system SHALL display available time slots for the next 7 days
2. WHEN a user selects a date THEN the system SHALL show only time slots with available capacity (not fully booked)
3. WHEN a user selects a time slot THEN the system SHALL reserve that slot temporarily for 15 minutes while the user completes checkout
4. WHEN a user's reservation expires THEN the system SHALL release the slot and prompt the user to select another time
5. WHEN a user confirms a time slot THEN the system SHALL display the selected date and time on the order confirmation page

### Requirement 4: Pricing Estimation and Display

**User Story:** As a user, I want to see an estimated price for my items before confirming the order, so that I can decide whether to proceed.

#### Acceptance Criteria

1. WHEN a user adds an item THEN the system SHALL calculate and display a price estimate based on category, condition, and quantity
2. WHEN a user modifies item details THEN the system SHALL recalculate the total estimate in real-time
3. WHEN the system displays pricing THEN the system SHALL show both individual item estimates and a total estimate range
4. WHEN displaying pricing THEN the system SHALL include a disclaimer that actual price depends on courier evaluation
5. WHEN a user reaches order confirmation THEN the system SHALL display itemized pricing with any applicable fees or discounts

### Requirement 5: Order Review and Confirmation

**User Story:** As a user, I want to review all order details before submission, so that I can verify everything is correct.

#### Acceptance Criteria

1. WHEN a user reaches the confirmation page THEN the system SHALL display a complete summary of all items, address, time slot, and pricing
2. WHEN a user reviews the order THEN the system SHALL allow editing of items, address, or time slot by returning to previous steps
3. WHEN a user confirms the order THEN the system SHALL validate all required information is present and complete
4. WHEN order submission succeeds THEN the system SHALL generate a unique order number and display a success page
5. WHEN order submission fails THEN the system SHALL display a specific error message and allow the user to retry or modify details

### Requirement 6: Form Data Persistence

**User Story:** As a user, I want my form data to persist as I navigate through the order creation flow, so that I don't lose information if I go back to edit.

#### Acceptance Criteria

1. WHEN a user navigates between steps THEN the system SHALL preserve all entered data in the current step
2. WHEN a user returns to a previous step THEN the system SHALL restore all previously entered data for that step
3. WHEN a user closes the app or loses connection THEN the system SHALL save draft order data locally
4. WHEN a user returns to the app THEN the system SHALL offer to restore the draft order or start fresh
5. WHEN a user completes an order THEN the system SHALL clear the draft data from local storage

### Requirement 7: Input Validation and Error Handling

**User Story:** As a user, I want clear feedback when I make mistakes, so that I can correct them and proceed smoothly.

#### Acceptance Criteria

1. WHEN a user submits a form with missing required fields THEN the system SHALL highlight the missing fields and display specific error messages
2. WHEN a user enters invalid data (e.g., non-numeric weight) THEN the system SHALL display an inline error message below the field
3. WHEN a user attempts to submit an order with no items THEN the system SHALL prevent submission and display a message requiring at least one item
4. WHEN a user selects an address outside the service area THEN the system SHALL display a message explaining the limitation
5. WHEN a network error occurs during submission THEN the system SHALL display a retry option and preserve the order data

### Requirement 8: User Feedback and Loading States

**User Story:** As a user, I want visual feedback during processing, so that I know the system is working and my action was received.

#### Acceptance Criteria

1. WHEN a user submits the order THEN the system SHALL display a loading indicator and disable the submit button
2. WHEN the system processes the order THEN the system SHALL show progress or a spinner animation
3. WHEN order processing completes THEN the system SHALL navigate to the success page with the order number
4. WHEN a user adds or removes items THEN the system SHALL update the item count and total price with smooth animation
5. WHEN a user selects a time slot THEN the system SHALL provide immediate visual confirmation of the selection
