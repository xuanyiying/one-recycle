# Design Document: Order Creation Flow

## Overview

The Order Creation Flow is a multi-step user journey that converts user intent into actionable recycling orders. The flow guides users through item selection, address management, time slot booking, and order confirmation. The design prioritizes clarity, data persistence, and smooth transitions between steps while maintaining form state across navigation.

**Key Design Principles:**

- Progressive disclosure: Show only relevant fields based on category selection
- Data persistence: Preserve user input across steps and app sessions
- Real-time feedback: Update pricing and availability instantly
- Error prevention: Validate input early and provide clear guidance
- Accessibility: Support iOS design standards with proper touch targets and contrast

## Architecture

### Component Hierarchy

```
OrderCreationFlow (Container)
├── ItemForm (Step 1)
│   ├── CategorySelector
│   ├── ItemDetailsForm
│   │   ├── PhotoUploader
│   │   ├── ConditionSelector
│   │   └── WeightInput
│   ├── PriceEstimate
│   └── ItemList
├── AddressSelection (Step 2)
│   ├── AddressList
│   ├── AddressCard
│   └── AddressForm (Modal)
├── TimeSlotSelection (Step 3)
│   ├── DatePicker
│   ├── TimeSlotGrid
│   └── AvailabilityIndicator
├── OrderConfirmation (Step 4)
│   ├── OrderSummary
│   ├── PricingBreakdown
│   ├── TermsCheckbox
│   └── SubmitButton
└── OrderSuccess (Final)
    ├── SuccessMessage
    ├── orderNo
    └── ActionButtons
```

### Data Flow

```
User Input → Form State → Validation → API Call → Success/Error
     ↓
Local Storage (Draft)
     ↓
Session Recovery
```

### State Management

**Global State (Redux/Context):**

- User authentication
- User addresses (cached)
- Available time slots
- Service area boundaries

**Page State (React Hooks):**

- Current step (1-4)
- Form data for current step
- Validation errors
- Loading states

**Local Storage:**

- Draft order data (items, address, time)
- User preferences (default address)
- Recent categories

## Components and Interfaces

### ItemForm Component

**Props:**

```typescript
interface ItemFormProps {
  onNext: (items: Item[]) => void;
  onBack?: () => void;
  initialItems?: Item[];
}

interface Item {
  id: string;
  categoryId: string;
  categoryName: string;
  brandModel: string;
  condition: "new" | "good" | "fair";
  weight: number;
  quantity: number;
  photos: string[];
  notes: string;
  estimatedPrice: PriceRange;
}

interface PriceRange {
  min: number;
  max: number;
  currency: "CNY";
}
```

**Behavior:**

- Display category selector with icons and names
- Show category-specific fields dynamically
- Support up to 6 photos per item
- Calculate price estimate in real-time
- Allow adding/removing multiple items
- Validate required fields before proceeding

### AddressSelection Component

**Props:**

```typescript
interface AddressSelectionProps {
  onNext: (address: Address) => void;
  onBack: () => void;
  initialAddress?: Address;
  serviceAreaBoundary?: GeoPolygon;
}

interface Address {
  id: string;
  recipientName: string;
  phoneNumber: string;
  region: string;
  detailedAddress: string;
  label: "home" | "work" | "school" | "other";
  isDefault: boolean;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}
```

**Behavior:**

- Display all saved addresses with radio selection
- Show "Add New Address" option if no addresses exist
- Validate address is within service area
- Allow inline editing of selected address
- Persist new addresses to backend

### TimeSlotSelection Component

**Props:**

```typescript
interface TimeSlotSelectionProps {
  onNext: (slot: TimeSlot) => void;
  onBack: () => void;
  initialSlot?: TimeSlot;
  availableSlots: TimeSlot[];
}

interface TimeSlot {
  id: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  capacity: number;
  booked: number;
  isAvailable: boolean;
}
```

**Behavior:**

- Display next 7 days with availability indicators
- Show time slots with capacity status
- Reserve slot for 15 minutes during checkout
- Release slot if user abandons flow
- Prevent selection of fully booked slots

### OrderConfirmation Component

**Props:**

```typescript
interface OrderConfirmationProps {
  items: Item[];
  address: Address;
  timeSlot: TimeSlot;
  onSubmit: (order: OrderSubmission) => Promise<void>;
  onBack: () => void;
}

interface OrderSubmission {
  items: Item[];
  address: Address;
  timeSlot: TimeSlot;
  notes: string;
}
```

**Behavior:**

- Display complete order summary
- Show itemized pricing with fees
- Allow editing previous steps
- Require terms agreement
- Submit order and handle errors
- Show loading state during submission

## Data Models

### Order Schema

```typescript
interface Order {
  id: string;
  userId: string;
  status: OrderStatus;
  items: OrderItem[];
  address: Address;
  timeSlot: TimeSlot;
  estimatedPrice: PriceRange;
  actualPrice?: number;
  notes: string;
  createdAt: ISO8601DateTime;
  updatedAt: ISO8601DateTime;
  completedAt?: ISO8601DateTime;
}

type OrderStatus =
  | "PENDING"
  | "ASSIGNED"
  | "PICKED_UP"
  | "COMPLETED"
  | "CANCELLED";

interface OrderItem {
  id: string;
  categoryId: string;
  brandModel: string;
  condition: "new" | "good" | "fair";
  weight: number;
  quantity: number;
  photoUrls: string[];
  notes: string;
  estimatedPrice: PriceRange;
  actualPrice?: number;
}
```

### Draft Order (Local Storage)

```typescript
interface DraftOrder {
  id: string;
  items: Item[];
  selectedAddressId?: string;
  selectedTimeSlotId?: string;
  notes: string;
  createdAt: ISO8601DateTime;
  updatedAt: ISO8601DateTime;
  expiresAt: ISO8601DateTime; // 24 hours from creation
}
```

## Correctness Properties

A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.

### Property 1: Item Addition Increases Count

_For any_ order creation session, when a user adds a valid item to the form, the total item count displayed should increase by exactly one.

**Validates: Requirements 1.5**

### Property 2: Price Recalculation on Item Modification

_For any_ item in the order, when the user modifies the item's condition or quantity, the total estimated price should be recalculated and updated within 500ms.

**Validates: Requirements 4.2**

### Property 3: Address Validation Against Service Area

_For any_ address selection, if the address coordinates fall outside the service area boundary, the system should prevent selection and display an error message.

**Validates: Requirements 2.3**

### Property 4: Time Slot Reservation Expiry

_For any_ reserved time slot, if the user does not complete order submission within 15 minutes, the system should automatically release the slot and make it available for other users.

**Validates: Requirements 3.4**

### Property 5: Draft Order Persistence

_For any_ incomplete order creation session, when the user navigates away or closes the app, the system should persist the current form state to local storage and restore it when the user returns within 24 hours.

**Validates: Requirements 6.1, 6.2, 6.3, 6.4**

### Property 6: Form Data Restoration on Back Navigation

_For any_ step in the order creation flow, when the user navigates back to a previous step and then forward again, all previously entered data for that step should be restored exactly as it was.

**Validates: Requirements 6.1, 6.2**

### Property 7: Required Field Validation

_For any_ form submission attempt, if any required field is empty or invalid, the system should prevent submission and highlight all missing/invalid fields with specific error messages.

**Validates: Requirements 7.1, 7.4**

### Property 8: Order Submission Atomicity

_For any_ order submission, either the entire order is created successfully with a unique order number, or the submission fails completely and the order data is preserved for retry—no partial orders should exist.

**Validates: Requirements 5.3, 5.4**

### Property 9: Loading State During Submission

_For any_ order submission, while the request is in flight, the submit button should display a loading indicator and be disabled to prevent duplicate submissions.

**Validates: Requirements 8.1, 8.2**

### Property 10: Photo Upload Limit Enforcement

_For any_ item, the system should accept a maximum of 6 photos and prevent uploading additional photos once the limit is reached.

**Validates: Requirements 1.3**

## Error Handling

### Input Validation Errors

| Error            | Trigger                  | User Message                               | Recovery                                    |
| ---------------- | ------------------------ | ------------------------------------------ | ------------------------------------------- |
| Missing category | Submit without category  | "Please select a category"                 | Highlight field, focus selector             |
| Invalid weight   | Non-numeric or negative  | "Weight must be a positive number"         | Clear field, show placeholder               |
| No items         | Submit with empty list   | "Please add at least one item"             | Show add item button                        |
| Invalid address  | Outside service area     | "This address is outside our service area" | Show service area map, suggest alternatives |
| No time slot     | Submit without time      | "Please select a pickup time"              | Show time picker                            |
| Missing terms    | Submit without agreement | "Please agree to terms"                    | Highlight checkbox, show terms              |

### Network Errors

| Error               | Trigger                | User Message                                | Recovery                            |
| ------------------- | ---------------------- | ------------------------------------------- | ----------------------------------- |
| Network timeout     | API call exceeds 30s   | "Connection timeout. Please try again."     | Show retry button, preserve data    |
| Server error (5xx)  | Backend returns error  | "Server error. Please try again later."     | Show retry button, preserve data    |
| Service unavailable | API returns 503        | "Service temporarily unavailable"           | Show retry button with backoff      |
| Invalid response    | Malformed API response | "Unexpected error. Please contact support." | Show support contact, preserve data |

### Recovery Strategies

1. **Data Preservation**: All form data is saved to local storage before API calls
2. **Retry Logic**: Implement exponential backoff for failed requests (1s, 2s, 4s, 8s)
3. **User Guidance**: Show specific error messages with actionable next steps
4. **Fallback UI**: Display cached data if API fails (e.g., previous addresses)

## Testing Strategy

### Unit Testing

Unit tests verify specific examples and edge cases:

- **Item validation**: Test category-specific field requirements
- **Price calculation**: Test pricing logic with various conditions and quantities
- **Address validation**: Test service area boundary checking
- **Time slot availability**: Test capacity and booking logic
- **Form state management**: Test data persistence and restoration
- **Error messages**: Test error display for various validation failures

### Property-Based Testing

Property-based tests verify universal properties that should hold across all inputs:

- **Property 1**: Item addition always increases count by 1
- **Property 2**: Price recalculation completes within 500ms
- **Property 3**: Invalid addresses are always rejected
- **Property 4**: Reserved slots expire after 15 minutes
- **Property 5**: Draft data persists and restores correctly
- **Property 6**: Back navigation preserves all form data
- **Property 7**: All required fields are validated
- **Property 8**: Order submission is atomic
- **Property 9**: Loading state prevents duplicate submissions
- **Property 10**: Photo upload limit is enforced

### Testing Framework

- **Unit Tests**: Jest with React Testing Library
- **Property Tests**: fast-check for JavaScript
- **Integration Tests**: Cypress for end-to-end flow testing
- **Minimum Coverage**: 100 iterations per property test

### Test Configuration

Each property-based test should:

- Run minimum 100 iterations
- Use smart generators that constrain to valid input space
- Include edge cases (empty lists, boundary values, etc.)
- Be tagged with requirement references
- Use format: `**Feature: order-creation-flow, Property {N}: {description}**`
