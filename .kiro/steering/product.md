---
inclusion: always
---

# OneRecycle Product Context

OneRecycle is a multi-platform recycling service enabling users to submit recycling orders and schedule door-to-door pickups across WeChat, Alipay, TikTok, and Kuaishou mini-programs.

## Business Flow

1. **Order Creation**: User selects category, uploads photos, provides address, schedules pickup time
2. **Dispatch**: System assigns courier based on location and availability (JD Express integration)
3. **Pickup**: Courier collects items, evaluates condition, confirms pricing on-site
4. **Payment**: User receives payment to account balance, can withdraw to bank/Alipay/WeChat
5. **Inventory**: Items tracked through inventory system for processing

## User Roles & Permissions

- **End Users**: Create orders, manage addresses, view order history, withdraw funds
- **Couriers**: Accept assignments, update order status, evaluate items, process payments
- **Admins**: Manage users, couriers, categories, pricing rules, view analytics, configure system settings

## Key Domain Concepts

- **Categories**: Recyclable item types (clothing, electronics, books, gold, etc.) with pricing rules
- **Orders**: Complete lifecycle from PENDING → ASSIGNED → PICKED_UP → COMPLETED/CANCELLED
- **Addresses**: User delivery addresses with default selection
- **Pricing**: Dynamic estimation based on category, weight, condition, market rates
- **Scheduled Pickup**: Time-slot based scheduling with courier availability
- **Account Balance**: User wallet for receiving payments and withdrawals

## Platform-Specific Considerations

- **WeChat/Alipay/TikTok/Kuaishou**: Each platform has unique authentication, payment, and UI requirements
- **Mini-program limitations**: Storage limits, API restrictions, platform-specific components
- **Cross-platform consistency**: Maintain feature parity while respecting platform differences