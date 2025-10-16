# OneRecycle Mini-Program Optimization Design Document

## Overview

This design document outlines the comprehensive optimization plan for the OneRecycle multi-platform mini-program. The optimization focuses on four key areas:

1. **Service Integration**: Consolidating auth-service and account-service to eliminate redundancy
2. **Feature Completion**: Implementing missing core features (login flow, order management, address management)
3. **UI/UX Consistency**: Establishing unified design system and component library
4. **Performance & Reliability**: Optimizing load times, implementing offline support, and enhancing error handling

### Design Goals

- Eliminate service duplication between auth-service and account-service
- Provide seamless cross-platform user experience (WeChat, Alipay, TikTok, Kuaishou)
- Achieve <1s page load time and <500ms API response time
- Maintain 99.9% system availability
- Support offline functionality for core features

### Design Principles

- **Separation of Concerns**: Clear boundaries between authentication and account management
- **Progressive Enhancement**: Core features work offline, enhanced features require network
- **Mobile-First**: Optimized for mobile devices with limited resources
- **Consistency**: Unified UI/UX across all platforms
- **Scalability**: Architecture supports future growth and feature additions

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Mini-Program Clients                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  WeChat  │  │ Alipay   │  │  TikTok  │  │ Kuaishou │   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘   │
└───────┼─────────────┼─────────────┼─────────────┼──────────┘
        │             │             │             │
        └─────────────┴─────────────┴─────────────┘
                          │
                    ┌─────▼─────┐
                    │    API    │
                    │  Gateway  │
                    │  (3002)   │
                    └─────┬─────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
   ┌────▼────┐      ┌────▼────┐      ┌────▼────┐
   │  Auth   │◄────►│ Account │◄────►│  Order  │
   │ Service │ gRPC │ Service │ gRPC │ Service │
   │ (3007)  │      │ (3001)  │      │ (3003)  │
   └────┬────┘      └────┬────┘      └────┬────┘
        │                │                 │
        └────────────────┼─────────────────┘
                         │
                    ┌────▼────┐
                    │ Message │
                    │  Queue  │
                    │ (Redis) │
                    └────┬────┘
                         │
                    ┌────▼────┐
                    │Postgres │
                    │Database │
                    └─────────┘
```

### Service Responsibilities

#### Auth Service (Consolidated Authentication)
**Responsibilities:**
- User authentication and login
- SMS verification code sending and validation
- JWT token generation and validation
- Third-party platform OAuth (WeChat, Alipay, TikTok, Kuaishou)
- Session management
- Token refresh mechanism

**Key APIs:**
- `POST /auth/login/platform` - Platform-based login (WeChat, Alipay, etc.)
- `POST /auth/login/phone` - Phone number login
- `POST /auth/sms/send` - Send SMS verification code
- `POST /auth/sms/verify` - Verify SMS code
- `POST /auth/token/refresh` - Refresh JWT token
- `POST /auth/logout` - User logout

#### Account Service (User Profile Management)
**Responsibilities:**
- User profile management (nickname, avatar, phone)
- Address management (CRUD operations)
- User identity linking (multiple platforms)
- User status management
- User query and search

**Key APIs:**
- `GET /account/profile` - Get user profile
- `PUT /account/profile` - Update user profile
- `GET /account/addresses` - List user addresses
- `POST /account/addresses` - Create new address
- `PUT /account/addresses/:id` - Update address
- `DELETE /account/addresses/:id` - Delete address
- `POST /account/identities/link` - Link platform identity

#### Communication Pattern

**Auth → Account (gRPC):**
```typescript
// When auth-service needs to create/update user
service AccountService {
  rpc CreateUser(CreateUserRequest) returns (UserResponse);
  rpc GetUserByIdentity(GetUserByIdentityRequest) returns (UserResponse);
  rpc UpdateUserIdentity(UpdateUserIdentityRequest) returns (UserResponse);
}
```

**Account → Auth (JWT Validation):**
```typescript
// Account service validates JWT tokens via middleware
// No direct service call needed - uses shared JWT secret
```

### Data Flow

#### Login Flow
```
User → Mini-Program → API Gateway → Auth Service
                                         ↓
                                    Validate Platform Code
                                         ↓
                                    Get Platform User Info
                                         ↓
                                    gRPC → Account Service
                                         ↓
                                    Create/Update User
                                         ↓
                                    Generate JWT Token
                                         ↓
User ← Mini-Program ← API Gateway ← Return Token + User Info
```

#### Order Creation Flow
```
User → Mini-Program → API Gateway → Order Service
                                         ↓
                                    Validate JWT Token
                                         ↓
                                    Get User Info (from token)
                                         ↓
                                    Create Order
                                         ↓
                                    Publish to Message Queue
                                         ↓
User ← Mini-Program ← API Gateway ← Return Order Info
```



## Components and Interfaces

### Frontend Components

#### 1. Authentication Module

**LoginPage Component**
```typescript
interface LoginPageProps {
  platform: 'weapp' | 'alipay' | 'tt' | 'kwai';
  redirectUrl?: string;
}

interface LoginPageState {
  loading: boolean;
  nickname: string;
  avatarUrl: string;
  error: string | null;
}

// Features:
// - Platform authorization button
// - Nickname input with validation
// - Auto-login for returning users
// - Error handling and retry
```

**AuthService (Frontend)**
```typescript
class AuthService {
  // Platform login
  async loginWithPlatform(platform: string, code: string, nickname?: string): Promise<LoginResponse>
  
  // Phone login
  async loginWithPhone(phone: string, code: string): Promise<LoginResponse>
  
  // SMS operations
  async sendSmsCode(phone: string): Promise<void>
  
  // Token management
  async refreshToken(): Promise<string>
  async logout(): Promise<void>
  
  // Token storage
  getToken(): string | null
  setToken(token: string): void
  clearToken(): void
  
  // Auto-login check
  async checkLoginStatus(): Promise<boolean>
}
```

#### 2. Order Management Module

**OrderList Component**
```typescript
interface OrderListProps {
  status?: OrderStatus;
  pageSize?: number;
}

interface OrderListState {
  orders: Order[];
  loading: boolean;
  hasMore: boolean;
  currentPage: number;
}

// Features:
// - Tab-based status filtering
// - Pull-to-refresh
// - Infinite scroll
// - Empty state handling
// - Skeleton loading
```

**OrderDetail Component**
```typescript
interface OrderDetailProps {
  orderId: string;
}

interface OrderDetailState {
  order: Order | null;
  loading: boolean;
  timeline: OrderTimeline[];
  courierInfo: CourierInfo | null;
}

// Features:
// - Complete order information display
// - Order timeline visualization
// - Courier contact information
// - Cancel order functionality
// - Customer service entry
```

**OrderCreate Component**
```typescript
interface OrderCreateProps {
  categoryId?: string;
}

interface OrderCreateState {
  category: Category | null;
  images: string[];
  description: string;
  address: Address | null;
  scheduledTime: Date | null;
  estimatedPrice: number;
}

// Features:
// - Category selection
// - Image upload (max 9, with compression)
// - Description input with templates
// - Address selection
// - Time slot selection
// - Price estimation
// - Draft saving (offline support)
```

#### 3. Address Management Module

**AddressList Component**
```typescript
interface AddressListProps {
  selectable?: boolean;
  onSelect?: (address: Address) => void;
}

interface AddressListState {
  addresses: Address[];
  loading: boolean;
  defaultAddressId: string | null;
}

// Features:
// - Address list display
// - Default address indicator
// - Edit/Delete actions
// - Add new address button
// - Selection mode for order creation
```

**AddressForm Component**
```typescript
interface AddressFormProps {
  addressId?: string;
  onSave: (address: Address) => void;
}

interface AddressFormState {
  name: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  detail: string;
  isDefault: boolean;
  location: { lat: number; lng: number } | null;
}

// Features:
// - Map-based location selection
// - Region picker (province/city/district)
// - Form validation
// - Default address toggle
// - Auto-fill from map selection
```

#### 4. Profile Module

**ProfilePage Component**
```typescript
interface ProfilePageState {
  user: User | null;
  balance: number;
  frozenBalance: number;
  loading: boolean;
}

// Features:
// - User avatar and nickname display
// - Balance information
// - Quick action buttons (orders, addresses, settings)
// - Platform binding status
// - Avatar upload
// - Nickname editing
```

**SettingsPage Component**
```typescript
interface SettingsPageState {
  notificationEnabled: boolean;
  dataCollectionEnabled: boolean;
}

// Features:
// - Notification settings
// - Privacy settings
// - About us
// - Privacy policy
// - Logout button
```

### Backend Interfaces

#### Auth Service APIs

```typescript
// Platform Login
POST /auth/login/platform
Request: {
  platform: 'weapp' | 'alipay' | 'tt' | 'kwai';
  code: string;
  nickname?: string;
  avatarUrl?: string;
}
Response: {
  token: string;
  refreshToken: string;
  user: {
    id: string;
    nickname: string;
    avatarUrl: string;
    phone?: string;
  };
}

// Phone Login
POST /auth/login/phone
Request: {
  phone: string;
  code: string;
}
Response: {
  token: string;
  refreshToken: string;
  user: User;
}

// Send SMS Code
POST /auth/sms/send
Request: {
  phone: string;
  type: 'login' | 'bind';
}
Response: {
  success: boolean;
  expiresIn: number;
}

// Refresh Token
POST /auth/token/refresh
Request: {
  refreshToken: string;
}
Response: {
  token: string;
  refreshToken: string;
}
```

#### Account Service APIs

```typescript
// Get Profile
GET /account/profile
Headers: { Authorization: 'Bearer <token>' }
Response: {
  id: string;
  nickname: string;
  avatarUrl: string;
  phone?: string;
  identities: PlatformIdentity[];
  createdAt: string;
  updatedAt: string;
}

// Update Profile
PUT /account/profile
Request: {
  nickname?: string;
  avatarUrl?: string;
}
Response: User

// List Addresses
GET /account/addresses
Response: {
  addresses: Address[];
  defaultAddressId: string | null;
}

// Create Address
POST /account/addresses
Request: {
  name: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  detail: string;
  isDefault: boolean;
  location?: { lat: number; lng: number };
}
Response: Address

// Update Address
PUT /account/addresses/:id
Request: Partial<Address>
Response: Address

// Delete Address
DELETE /account/addresses/:id
Response: { success: boolean }

// Link Platform Identity
POST /account/identities/link
Request: {
  platform: string;
  platformUserId: string;
  openid?: string;
  unionid?: string;
}
Response: User
```

#### gRPC Service Interfaces

```protobuf
// account.proto
syntax = "proto3";

service AccountService {
  rpc CreateUser(CreateUserRequest) returns (UserResponse);
  rpc GetUserById(GetUserByIdRequest) returns (UserResponse);
  rpc GetUserByIdentity(GetUserByIdentityRequest) returns (UserResponse);
  rpc UpdateUser(UpdateUserRequest) returns (UserResponse);
  rpc LinkIdentity(LinkIdentityRequest) returns (UserResponse);
}

message CreateUserRequest {
  string nickname = 1;
  string avatar_url = 2;
  string phone = 3;
  PlatformIdentity identity = 4;
}

message PlatformIdentity {
  string platform = 1;
  string platform_user_id = 2;
  string openid = 3;
  string unionid = 4;
}

message UserResponse {
  string id = 1;
  string nickname = 2;
  string avatar_url = 3;
  string phone = 4;
  repeated PlatformIdentity identities = 5;
  string created_at = 6;
  string updated_at = 7;
}
```



## Data Models

### User Model (Account Service)

```typescript
interface User {
  id: string;                    // UUID
  nickname: string;              // 2-20 characters
  avatarUrl: string;             // Profile picture URL
  phone?: string;                // Phone number (optional, for linking)
  status: UserStatus;            // active | suspended | deleted
  identities: PlatformIdentity[]; // Multiple platform identities
  createdAt: Date;
  updatedAt: Date;
}

enum UserStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  DELETED = 'deleted'
}

interface PlatformIdentity {
  id: string;
  userId: string;
  platform: Platform;            // weapp | alipay | tt | kwai
  platformUserId: string;        // Platform-specific user ID
  openid?: string;               // WeChat/TikTok openid
  unionid?: string;              // WeChat unionid
  createdAt: Date;
  updatedAt: Date;
}

enum Platform {
  WEAPP = 'weapp',      // WeChat Mini-Program
  ALIPAY = 'alipay',    // Alipay Mini-Program
  TIKTOK = 'tt',        // TikTok Mini-Program
  KUAISHOU = 'kwai'     // Kuaishou Mini-Program
}
```

### Address Model (Account Service)

```typescript
interface Address {
  id: string;                    // UUID
  userId: string;                // Foreign key to User
  name: string;                  // Contact name
  phone: string;                 // Contact phone (11 digits)
  province: string;              // Province
  city: string;                  // City
  district: string;              // District
  detail: string;                // Detailed address
  isDefault: boolean;            // Default address flag
  location?: {                   // GPS coordinates (optional)
    lat: number;
    lng: number;
  };
  createdAt: Date;
  updatedAt: Date;
}
```

### Session Model (Auth Service)

```typescript
interface Session {
  id: string;                    // UUID
  userId: string;                // Foreign key to User
  token: string;                 // JWT access token (hashed)
  refreshToken: string;          // Refresh token (hashed)
  platform: Platform;            // Login platform
  deviceInfo?: {                 // Device information
    model: string;
    system: string;
    version: string;
  };
  expiresAt: Date;               // Token expiration time
  refreshExpiresAt: Date;        // Refresh token expiration
  lastActiveAt: Date;            // Last activity timestamp
  createdAt: Date;
}
```

### Order Model (Order Service)

```typescript
interface Order {
  id: string;                    // UUID
  userId: string;                // Foreign key to User
  orderNo: string;               // Human-readable order number
  categoryId: string;            // Foreign key to Category
  status: OrderStatus;
  images: string[];              // Item photos (max 9)
  description: string;           // Item description
  estimatedPrice: number;        // Estimated price (cents)
  actualPrice?: number;          // Actual price after evaluation (cents)
  address: OrderAddress;         // Snapshot of address
  scheduledTime: Date;           // Scheduled pickup time
  courierId?: string;            // Assigned courier ID
  courierInfo?: CourierInfo;     // Courier information
  cancelReason?: string;         // Cancellation reason
  timeline: OrderTimeline[];     // Status change history
  createdAt: Date;
  updatedAt: Date;
}

enum OrderStatus {
  PENDING = 'pending',           // Waiting for courier
  ACCEPTED = 'accepted',         // Courier accepted
  IN_PROGRESS = 'in_progress',   // Courier on the way
  COMPLETED = 'completed',       // Order completed
  CANCELLED = 'cancelled'        // Order cancelled
}

interface OrderAddress {
  name: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  detail: string;
  location?: { lat: number; lng: number };
}

interface CourierInfo {
  id: string;
  name: string;
  phone: string;
  avatarUrl?: string;
}

interface OrderTimeline {
  status: OrderStatus;
  timestamp: Date;
  description: string;
  operator?: string;
}
```

### Category Model (Category Service)

```typescript
interface Category {
  id: string;
  name: string;                  // Category name (e.g., "服装", "电子产品")
  icon: string;                  // Category icon URL
  description: string;           // Category description
  priceRange: {                  // Price range
    min: number;
    max: number;
  };
  requirements: string[];        // Recycling requirements
  sortOrder: number;             // Display order
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Database Schema (Prisma)

#### Account Service Schema

```prisma
model User {
  id         String             @id @default(uuid())
  nickname   String             @db.VarChar(20)
  avatarUrl  String             @map("avatar_url")
  phone      String?            @unique @db.VarChar(11)
  status     UserStatus         @default(ACTIVE)
  identities PlatformIdentity[]
  addresses  Address[]
  createdAt  DateTime           @default(now()) @map("created_at")
  updatedAt  DateTime           @updatedAt @map("updated_at")

  @@map("users")
}

enum UserStatus {
  ACTIVE
  SUSPENDED
  DELETED
}

model PlatformIdentity {
  id             String   @id @default(uuid())
  userId         String   @map("user_id")
  platform       Platform
  platformUserId String   @map("platform_user_id")
  openid         String?
  unionid        String?
  user           User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt      DateTime @default(now()) @map("created_at")
  updatedAt      DateTime @updatedAt @map("updated_at")

  @@unique([platform, platformUserId])
  @@index([userId])
  @@map("platform_identities")
}

enum Platform {
  WEAPP
  ALIPAY
  TIKTOK
  KUAISHOU
}

model Address {
  id        String   @id @default(uuid())
  userId    String   @map("user_id")
  name      String   @db.VarChar(50)
  phone     String   @db.VarChar(11)
  province  String   @db.VarChar(50)
  city      String   @db.VarChar(50)
  district  String   @db.VarChar(50)
  detail    String   @db.VarChar(200)
  isDefault Boolean  @default(false) @map("is_default")
  lat       Float?
  lng       Float?
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@index([userId])
  @@map("addresses")
}
```

#### Auth Service Schema

```prisma
model Session {
  id               String    @id @default(uuid())
  userId           String    @map("user_id")
  tokenHash        String    @map("token_hash") @db.VarChar(64)
  refreshTokenHash String    @map("refresh_token_hash") @db.VarChar(64)
  platform         String    @db.VarChar(20)
  deviceModel      String?   @map("device_model")
  deviceSystem     String?   @map("device_system")
  deviceVersion    String?   @map("device_version")
  expiresAt        DateTime  @map("expires_at")
  refreshExpiresAt DateTime  @map("refresh_expires_at")
  lastActiveAt     DateTime  @default(now()) @map("last_active_at")
  createdAt        DateTime  @default(now()) @map("created_at")

  @@index([userId])
  @@index([tokenHash])
  @@index([expiresAt])
  @@map("sessions")
}

model SmsCode {
  id        String   @id @default(uuid())
  phone     String   @db.VarChar(11)
  code      String   @db.VarChar(6)
  type      String   @db.VarChar(20) // login | bind
  expiresAt DateTime @map("expires_at")
  used      Boolean  @default(false)
  createdAt DateTime @default(now()) @map("created_at")

  @@index([phone, type, expiresAt])
  @@map("sms_codes")
}
```



## Error Handling

### Error Classification

#### 1. Client-Side Errors (4xx)

```typescript
enum ClientErrorCode {
  // Authentication errors (401)
  UNAUTHORIZED = 'UNAUTHORIZED',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  INVALID_TOKEN = 'INVALID_TOKEN',
  
  // Authorization errors (403)
  FORBIDDEN = 'FORBIDDEN',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  
  // Validation errors (400)
  INVALID_INPUT = 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
  INVALID_PHONE_FORMAT = 'INVALID_PHONE_FORMAT',
  INVALID_SMS_CODE = 'INVALID_SMS_CODE',
  
  // Resource errors (404)
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  ORDER_NOT_FOUND = 'ORDER_NOT_FOUND',
  ADDRESS_NOT_FOUND = 'ADDRESS_NOT_FOUND',
  
  // Business logic errors (409)
  DUPLICATE_PHONE = 'DUPLICATE_PHONE',
  ORDER_ALREADY_CANCELLED = 'ORDER_ALREADY_CANCELLED',
  CANNOT_DELETE_DEFAULT_ADDRESS = 'CANNOT_DELETE_DEFAULT_ADDRESS',
  
  // Rate limiting (429)
  TOO_MANY_REQUESTS = 'TOO_MANY_REQUESTS',
  SMS_RATE_LIMIT_EXCEEDED = 'SMS_RATE_LIMIT_EXCEEDED'
}
```

#### 2. Server-Side Errors (5xx)

```typescript
enum ServerErrorCode {
  // Internal errors (500)
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  
  // Service unavailable (503)
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  THIRD_PARTY_SERVICE_ERROR = 'THIRD_PARTY_SERVICE_ERROR',
  
  // Gateway errors (502, 504)
  BAD_GATEWAY = 'BAD_GATEWAY',
  GATEWAY_TIMEOUT = 'GATEWAY_TIMEOUT'
}
```

### Error Response Format

```typescript
interface ErrorResponse {
  success: false;
  error: {
    code: string;              // Error code (e.g., 'INVALID_INPUT')
    message: string;           // User-friendly error message
    details?: any;             // Additional error details
    timestamp: string;         // ISO 8601 timestamp
    requestId: string;         // Request tracking ID
  };
}

// Example
{
  "success": false,
  "error": {
    "code": "INVALID_PHONE_FORMAT",
    "message": "手机号格式不正确",
    "details": {
      "field": "phone",
      "value": "123456"
    },
    "timestamp": "2025-10-16T10:30:00Z",
    "requestId": "req_abc123"
  }
}
```

### Frontend Error Handling Strategy

#### 1. Global Error Interceptor

```typescript
class ApiClient {
  private async handleError(error: any): Promise<never> {
    // Network errors
    if (!error.response) {
      if (navigator.onLine === false) {
        throw new AppError('NETWORK_OFFLINE', '网络连接已断开，请检查网络设置');
      }
      throw new AppError('NETWORK_ERROR', '网络请求失败，请稍后重试');
    }

    const { status, data } = error.response;

    // Token expired - auto refresh
    if (status === 401 && data.error.code === 'TOKEN_EXPIRED') {
      try {
        await this.refreshToken();
        return this.retryRequest(error.config);
      } catch (refreshError) {
        // Refresh failed - redirect to login
        await this.redirectToLogin();
        throw new AppError('SESSION_EXPIRED', '登录已过期，请重新登录');
      }
    }

    // Other client errors
    if (status >= 400 && status < 500) {
      throw new AppError(
        data.error.code,
        data.error.message,
        data.error.details
      );
    }

    // Server errors
    if (status >= 500) {
      throw new AppError(
        'SERVER_ERROR',
        '服务器繁忙，请稍后重试',
        { originalError: data.error }
      );
    }

    throw new AppError('UNKNOWN_ERROR', '未知错误，请稍后重试');
  }
}
```

#### 2. Component-Level Error Handling

```typescript
// Error boundary for React components
class ErrorBoundary extends React.Component<Props, State> {
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to monitoring service
    logger.error('Component error', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack
    });

    // Show user-friendly error message
    Taro.showToast({
      title: '页面加载失败',
      icon: 'none',
      duration: 2000
    });
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback onRetry={this.handleRetry} />;
    }
    return this.props.children;
  }
}

// Usage in pages
export default function OrderListPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState<AppError | null>(null);
  const [loading, setLoading] = useState(false);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await orderService.getOrders();
      setOrders(data);
    } catch (err) {
      setError(err as AppError);
      // Show toast for user
      Taro.showToast({
        title: err.message,
        icon: 'none'
      });
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return <ErrorView error={error} onRetry={loadOrders} />;
  }

  return <OrderList orders={orders} loading={loading} />;
}
```

#### 3. Retry Strategy

```typescript
class RetryStrategy {
  async executeWithRetry<T>(
    fn: () => Promise<T>,
    options: RetryOptions = {}
  ): Promise<T> {
    const {
      maxRetries = 3,
      retryDelay = 1000,
      backoffMultiplier = 2,
      retryableErrors = ['NETWORK_ERROR', 'GATEWAY_TIMEOUT']
    } = options;

    let lastError: Error;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        
        // Don't retry if error is not retryable
        if (!this.isRetryable(error, retryableErrors)) {
          throw error;
        }
        
        // Don't retry on last attempt
        if (attempt === maxRetries) {
          throw error;
        }
        
        // Wait before retry with exponential backoff
        const delay = retryDelay * Math.pow(backoffMultiplier, attempt);
        await this.sleep(delay);
      }
    }
    
    throw lastError!;
  }

  private isRetryable(error: any, retryableErrors: string[]): boolean {
    return retryableErrors.includes(error.code);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

### Backend Error Handling

#### 1. Global Exception Filter (NestJS)

```typescript
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorCode = 'INTERNAL_SERVER_ERROR';
    let message = '服务器内部错误';
    let details: any = undefined;

    // Handle known exceptions
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      if (typeof exceptionResponse === 'object') {
        errorCode = exceptionResponse['code'] || errorCode;
        message = exceptionResponse['message'] || message;
        details = exceptionResponse['details'];
      }
    }

    // Handle Prisma errors
    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      status = HttpStatus.BAD_REQUEST;
      errorCode = 'DATABASE_ERROR';
      message = this.getPrismaErrorMessage(exception);
    }

    // Log error
    this.logger.error({
      requestId: request.id,
      method: request.method,
      url: request.url,
      status,
      errorCode,
      message,
      stack: exception instanceof Error ? exception.stack : undefined
    });

    // Send response
    response.status(status).json({
      success: false,
      error: {
        code: errorCode,
        message,
        details,
        timestamp: new Date().toISOString(),
        requestId: request.id
      }
    });
  }
}
```

#### 2. Custom Business Exceptions

```typescript
export class BusinessException extends HttpException {
  constructor(
    code: string,
    message: string,
    details?: any,
    status: HttpStatus = HttpStatus.BAD_REQUEST
  ) {
    super(
      {
        code,
        message,
        details
      },
      status
    );
  }
}

// Usage examples
throw new BusinessException(
  'INVALID_SMS_CODE',
  '验证码错误或已过期',
  { attemptsRemaining: 2 }
);

throw new BusinessException(
  'ORDER_ALREADY_CANCELLED',
  '订单已取消，无法再次取消',
  { orderId: '123' },
  HttpStatus.CONFLICT
);
```

### Error Monitoring and Logging

```typescript
interface ErrorLog {
  level: 'error' | 'warn' | 'info';
  timestamp: string;
  requestId: string;
  userId?: string;
  errorCode: string;
  message: string;
  stack?: string;
  context: {
    service: string;
    method: string;
    url?: string;
    params?: any;
  };
}

class ErrorLogger {
  async logError(error: Error, context: any): Promise<void> {
    const errorLog: ErrorLog = {
      level: 'error',
      timestamp: new Date().toISOString(),
      requestId: context.requestId,
      userId: context.userId,
      errorCode: error['code'] || 'UNKNOWN_ERROR',
      message: error.message,
      stack: error.stack,
      context: {
        service: context.service,
        method: context.method,
        url: context.url,
        params: context.params
      }
    };

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error(errorLog);
    }

    // Send to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      await this.sendToMonitoring(errorLog);
    }

    // Store in database for analysis
    await this.storeInDatabase(errorLog);
  }
}
```



## Testing Strategy

### Testing Pyramid

```
                    ┌─────────────┐
                    │   E2E Tests │  (10%)
                    │  Integration│
                    └─────────────┘
                  ┌─────────────────┐
                  │ Integration Tests│  (30%)
                  │  API Tests       │
                  └─────────────────┘
              ┌───────────────────────┐
              │    Unit Tests          │  (60%)
              │  Business Logic        │
              └───────────────────────┘
```

### 1. Unit Tests

**Frontend Unit Tests (Jest + React Testing Library)**

```typescript
// Component tests
describe('LoginPage', () => {
  it('should render login button', () => {
    const { getByText } = render(<LoginPage platform="weapp" />);
    expect(getByText('微信授权登录')).toBeInTheDocument();
  });

  it('should validate nickname input', async () => {
    const { getByPlaceholderText, getByText } = render(<LoginPage platform="weapp" />);
    const input = getByPlaceholderText('请输入昵称');
    
    fireEvent.change(input, { target: { value: 'a' } });
    await waitFor(() => {
      expect(getByText('昵称长度为2-20个字符')).toBeInTheDocument();
    });
  });

  it('should call login API on submit', async () => {
    const mockLogin = jest.fn().mockResolvedValue({ token: 'abc123' });
    jest.spyOn(authService, 'loginWithPlatform').mockImplementation(mockLogin);
    
    const { getByText } = render(<LoginPage platform="weapp" />);
    fireEvent.click(getByText('微信授权登录'));
    
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('weapp', expect.any(String));
    });
  });
});

// Service tests
describe('AuthService', () => {
  it('should store token after login', async () => {
    const authService = new AuthService();
    const response = { token: 'abc123', user: { id: '1' } };
    
    jest.spyOn(apiClient, 'post').mockResolvedValue(response);
    
    await authService.loginWithPlatform('weapp', 'code123');
    
    expect(authService.getToken()).toBe('abc123');
  });

  it('should clear token on logout', async () => {
    const authService = new AuthService();
    authService.setToken('abc123');
    
    await authService.logout();
    
    expect(authService.getToken()).toBeNull();
  });
});
```

**Backend Unit Tests (Jest + NestJS Testing)**

```typescript
// Service tests
describe('AuthService', () => {
  let service: AuthService;
  let accountService: AccountService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: AccountService,
          useValue: {
            createUser: jest.fn(),
            getUserByIdentity: jest.fn()
          }
        }
      ]
    }).compile();

    service = module.get<AuthService>(AuthService);
    accountService = module.get<AccountService>(AccountService);
  });

  it('should create new user on first login', async () => {
    const platformData = {
      platform: 'weapp',
      code: 'code123',
      nickname: 'TestUser'
    };

    jest.spyOn(accountService, 'getUserByIdentity').mockResolvedValue(null);
    jest.spyOn(accountService, 'createUser').mockResolvedValue({
      id: '1',
      nickname: 'TestUser'
    });

    const result = await service.loginWithPlatform(platformData);

    expect(accountService.createUser).toHaveBeenCalled();
    expect(result.token).toBeDefined();
  });

  it('should return existing user on subsequent login', async () => {
    const existingUser = { id: '1', nickname: 'TestUser' };
    
    jest.spyOn(accountService, 'getUserByIdentity').mockResolvedValue(existingUser);

    const result = await service.loginWithPlatform({
      platform: 'weapp',
      code: 'code123'
    });

    expect(accountService.createUser).not.toHaveBeenCalled();
    expect(result.user.id).toBe('1');
  });
});

// Repository tests
describe('AddressRepository', () => {
  let repository: AddressRepository;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [AddressRepository, PrismaService]
    }).compile();

    repository = module.get<AddressRepository>(AddressRepository);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should set new address as default if user has no addresses', async () => {
    jest.spyOn(prisma.address, 'count').mockResolvedValue(0);
    jest.spyOn(prisma.address, 'create').mockResolvedValue({
      id: '1',
      isDefault: true
    } as any);

    const result = await repository.create({
      userId: '1',
      name: 'Test',
      phone: '13800138000',
      province: '北京市',
      city: '北京市',
      district: '朝阳区',
      detail: '测试地址',
      isDefault: false
    });

    expect(result.isDefault).toBe(true);
  });
});
```

### 2. Integration Tests

**API Integration Tests**

```typescript
describe('Auth API (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule]
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    
    prisma = app.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  describe('POST /auth/login/platform', () => {
    it('should return token and user info', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login/platform')
        .send({
          platform: 'weapp',
          code: 'test_code',
          nickname: 'TestUser'
        })
        .expect(201);

      expect(response.body).toMatchObject({
        token: expect.any(String),
        refreshToken: expect.any(String),
        user: {
          id: expect.any(String),
          nickname: 'TestUser'
        }
      });
    });

    it('should return 400 for invalid platform', async () => {
      await request(app.getHttpServer())
        .post('/auth/login/platform')
        .send({
          platform: 'invalid',
          code: 'test_code'
        })
        .expect(400);
    });
  });

  describe('POST /auth/token/refresh', () => {
    it('should return new tokens', async () => {
      // First login to get refresh token
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login/platform')
        .send({
          platform: 'weapp',
          code: 'test_code',
          nickname: 'TestUser'
        });

      const { refreshToken } = loginResponse.body;

      // Refresh token
      const response = await request(app.getHttpServer())
        .post('/auth/token/refresh')
        .send({ refreshToken })
        .expect(200);

      expect(response.body).toMatchObject({
        token: expect.any(String),
        refreshToken: expect.any(String)
      });
    });
  });
});
```

**gRPC Integration Tests**

```typescript
describe('Account gRPC Service', () => {
  let client: AccountServiceClient;
  let prisma: PrismaService;

  beforeAll(async () => {
    // Setup gRPC client
    client = new AccountServiceClient(
      'localhost:50051',
      grpc.credentials.createInsecure()
    );
    
    prisma = new PrismaService();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should create user via gRPC', (done) => {
    const request: CreateUserRequest = {
      nickname: 'TestUser',
      avatarUrl: 'https://example.com/avatar.jpg',
      identity: {
        platform: 'weapp',
        platformUserId: 'test_user_id',
        openid: 'test_openid'
      }
    };

    client.createUser(request, (error, response) => {
      expect(error).toBeNull();
      expect(response).toMatchObject({
        id: expect.any(String),
        nickname: 'TestUser'
      });
      done();
    });
  });

  it('should get user by identity', (done) => {
    const request: GetUserByIdentityRequest = {
      platform: 'weapp',
      platformUserId: 'test_user_id'
    };

    client.getUserByIdentity(request, (error, response) => {
      expect(error).toBeNull();
      expect(response.id).toBeDefined();
      done();
    });
  });
});
```

### 3. End-to-End Tests

**Mini-Program E2E Tests (Playwright/Puppeteer)**

```typescript
describe('Order Creation Flow', () => {
  let page: Page;

  beforeAll(async () => {
    page = await browser.newPage();
    await page.goto('http://localhost:10086');
  });

  afterAll(async () => {
    await page.close();
  });

  it('should complete full order creation flow', async () => {
    // Login
    await page.click('[data-testid="login-button"]');
    await page.fill('[data-testid="nickname-input"]', 'TestUser');
    await page.click('[data-testid="authorize-button"]');
    await page.waitForNavigation();

    // Navigate to order creation
    await page.click('[data-testid="create-order-button"]');

    // Select category
    await page.click('[data-testid="category-clothing"]');

    // Upload images
    const fileInput = await page.$('[data-testid="image-upload"]');
    await fileInput.setInputFiles(['test-image.jpg']);

    // Fill description
    await page.fill('[data-testid="description-input"]', '旧衣服一批');

    // Select address
    await page.click('[data-testid="address-selector"]');
    await page.click('[data-testid="address-item-0"]');

    // Select time
    await page.click('[data-testid="time-selector"]');
    await page.click('[data-testid="time-slot-0"]');

    // Submit order
    await page.click('[data-testid="submit-order-button"]');

    // Verify success
    await page.waitForSelector('[data-testid="order-success"]');
    const orderNo = await page.textContent('[data-testid="order-number"]');
    expect(orderNo).toMatch(/^ORD\d{14}$/);
  });
});
```

### Test Coverage Requirements

- **Overall Coverage**: ≥ 80%
- **Critical Paths**: ≥ 90% (authentication, order creation, payment)
- **Business Logic**: ≥ 85%
- **UI Components**: ≥ 70%

### Continuous Integration

```yaml
# .github/workflows/test.yml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      
      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linter
        run: npm run lint
      
      - name: Run unit tests
        run: npm run test:unit
      
      - name: Run integration tests
        run: npm run test:integration
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test
          REDIS_URL: redis://localhost:6379
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
```



## Performance Optimization

### 1. Frontend Performance

#### Image Optimization

```typescript
class ImageOptimizer {
  // Compress image before upload
  async compressImage(filePath: string, options: CompressOptions = {}): Promise<string> {
    const {
      maxWidth = 1200,
      maxHeight = 1200,
      quality = 0.8,
      maxSize = 500 * 1024 // 500KB
    } = options;

    return new Promise((resolve, reject) => {
      Taro.compressImage({
        src: filePath,
        quality: quality * 100,
        success: (res) => {
          // Check if size is acceptable
          Taro.getFileInfo({
            filePath: res.tempFilePath,
            success: (info) => {
              if (info.size <= maxSize) {
                resolve(res.tempFilePath);
              } else {
                // Compress again with lower quality
                this.compressImage(filePath, {
                  ...options,
                  quality: quality * 0.8
                }).then(resolve).catch(reject);
              }
            }
          });
        },
        fail: reject
      });
    });
  }

  // Lazy load images
  useLazyImage(src: string) {
    const [loaded, setLoaded] = useState(false);
    const [inView, setInView] = useState(false);
    const imgRef = useRef<HTMLImageElement>(null);

    useEffect(() => {
      if (!imgRef.current) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setInView(true);
            observer.disconnect();
          }
        },
        { rootMargin: '50px' }
      );

      observer.observe(imgRef.current);

      return () => observer.disconnect();
    }, []);

    return { imgRef, src: inView ? src : '', loaded, setLoaded };
  }
}
```

#### Virtual List for Long Lists

```typescript
// Virtual list component for order list
import { VirtualList } from '@tarojs/components';

function OrderList({ orders }: { orders: Order[] }) {
  const itemHeight = 120; // Fixed item height in px

  return (
    <VirtualList
      height={Taro.getSystemInfoSync().windowHeight}
      width="100%"
      itemData={orders}
      itemCount={orders.length}
      itemSize={itemHeight}
      overscanCount={5}
    >
      {({ index, style, data }) => (
        <View style={style}>
          <OrderItem order={data[index]} />
        </View>
      )}
    </VirtualList>
  );
}
```

#### Request Optimization

```typescript
class RequestOptimizer {
  private cache = new Map<string, CacheEntry>();
  private pendingRequests = new Map<string, Promise<any>>();

  // Request deduplication
  async request<T>(key: string, fn: () => Promise<T>): Promise<T> {
    // Check cache first
    const cached = this.getFromCache(key);
    if (cached) return cached;

    // Check if request is already pending
    const pending = this.pendingRequests.get(key);
    if (pending) return pending;

    // Make new request
    const promise = fn().then(data => {
      this.setCache(key, data);
      this.pendingRequests.delete(key);
      return data;
    });

    this.pendingRequests.set(key, promise);
    return promise;
  }

  // Debounce for search inputs
  debounce<T extends (...args: any[]) => any>(
    fn: T,
    delay: number
  ): (...args: Parameters<T>) => void {
    let timeoutId: NodeJS.Timeout;
    
    return (...args: Parameters<T>) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => fn(...args), delay);
    };
  }

  // Throttle for scroll events
  throttle<T extends (...args: any[]) => any>(
    fn: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        fn(...args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  }

  private getFromCache<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    // Check if cache is expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  private setCache(key: string, data: any, ttl: number = 5 * 60 * 1000) {
    this.cache.set(key, {
      data,
      expiresAt: Date.now() + ttl
    });
  }
}

interface CacheEntry {
  data: any;
  expiresAt: number;
}
```

#### Code Splitting and Lazy Loading

```typescript
// Lazy load pages
const OrderDetail = lazy(() => import('./pages/order/detail'));
const AddressForm = lazy(() => import('./pages/address/form'));

// Preload critical pages
const preloadOrderDetail = () => {
  import('./pages/order/detail');
};

// Use in navigation
function navigateToOrderDetail(orderId: string) {
  preloadOrderDetail();
  Taro.navigateTo({
    url: `/pages/order/detail/index?id=${orderId}`
  });
}
```

### 2. Backend Performance

#### Database Query Optimization

```typescript
// Use indexes for frequent queries
// prisma/schema.prisma
model User {
  id    String @id @default(uuid())
  phone String? @unique
  
  @@index([phone])
}

model Order {
  id        String      @id @default(uuid())
  userId    String
  status    OrderStatus
  createdAt DateTime    @default(now())
  
  @@index([userId, status])
  @@index([createdAt])
}

// Use select to fetch only needed fields
async getUserProfile(userId: string) {
  return this.prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      nickname: true,
      avatarUrl: true,
      phone: true,
      // Don't fetch all relations by default
    }
  });
}

// Use pagination for large datasets
async getOrders(userId: string, page: number = 1, pageSize: number = 20) {
  const skip = (page - 1) * pageSize;
  
  const [orders, total] = await Promise.all([
    this.prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
      include: {
        category: true
      }
    }),
    this.prisma.order.count({ where: { userId } })
  ]);

  return {
    data: orders,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize)
    }
  };
}
```

#### Caching Strategy

```typescript
import { CACHE_MANAGER, Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class CategoryService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private prisma: PrismaService
  ) {}

  // Cache categories (rarely change)
  async getCategories(): Promise<Category[]> {
    const cacheKey = 'categories:all';
    
    // Try cache first
    const cached = await this.cacheManager.get<Category[]>(cacheKey);
    if (cached) return cached;

    // Fetch from database
    const categories = await this.prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' }
    });

    // Cache for 1 hour
    await this.cacheManager.set(cacheKey, categories, 3600);

    return categories;
  }

  // Invalidate cache on update
  async updateCategory(id: string, data: UpdateCategoryDto): Promise<Category> {
    const category = await this.prisma.category.update({
      where: { id },
      data
    });

    // Invalidate cache
    await this.cacheManager.del('categories:all');

    return category;
  }
}
```

#### Connection Pooling

```typescript
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  
  // Connection pool settings
  connection_limit = 20
  pool_timeout     = 10
}

// Database configuration
export const databaseConfig = {
  url: process.env.DATABASE_URL,
  pool: {
    min: 2,
    max: 20,
    acquireTimeoutMillis: 10000,
    idleTimeoutMillis: 30000
  }
};
```

#### API Response Compression

```typescript
// Enable gzip compression
import compression from 'compression';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable compression
  app.use(compression({
    filter: (req, res) => {
      if (req.headers['x-no-compression']) {
        return false;
      }
      return compression.filter(req, res);
    },
    threshold: 1024 // Only compress responses > 1KB
  }));

  await app.listen(3000);
}
```

### 3. Offline Support

#### Service Worker for Caching

```typescript
// Service worker for H5 platform
const CACHE_NAME = 'onerecycle-v1';
const CACHE_URLS = [
  '/',
  '/static/css/main.css',
  '/static/js/main.js',
  '/static/images/logo.png'
];

// Install service worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(CACHE_URLS);
    })
  );
});

// Fetch with cache-first strategy
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return cached response if available
      if (response) {
        return response;
      }

      // Otherwise fetch from network
      return fetch(event.request).then((response) => {
        // Cache successful responses
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      });
    })
  );
});
```

#### Local Storage for Offline Data

```typescript
class OfflineStorage {
  private storage = Taro.getStorageSync('offline_data') || {};

  // Save data for offline access
  async saveForOffline(key: string, data: any): Promise<void> {
    this.storage[key] = {
      data,
      timestamp: Date.now()
    };
    await Taro.setStorage({
      key: 'offline_data',
      data: this.storage
    });
  }

  // Get offline data
  getOfflineData<T>(key: string, maxAge: number = 24 * 60 * 60 * 1000): T | null {
    const entry = this.storage[key];
    if (!entry) return null;

    // Check if data is too old
    if (Date.now() - entry.timestamp > maxAge) {
      delete this.storage[key];
      return null;
    }

    return entry.data;
  }

  // Sync queue for offline operations
  private syncQueue: OfflineOperation[] = [];

  async addToSyncQueue(operation: OfflineOperation): Promise<void> {
    this.syncQueue.push(operation);
    await this.saveSyncQueue();
  }

  async processSyncQueue(): Promise<void> {
    if (!navigator.onLine) return;

    const queue = [...this.syncQueue];
    this.syncQueue = [];

    for (const operation of queue) {
      try {
        await this.executeOperation(operation);
      } catch (error) {
        // Re-add failed operations to queue
        this.syncQueue.push(operation);
      }
    }

    await this.saveSyncQueue();
  }

  private async executeOperation(operation: OfflineOperation): Promise<void> {
    switch (operation.type) {
      case 'CREATE_ORDER':
        await orderService.createOrder(operation.data);
        break;
      case 'UPDATE_PROFILE':
        await accountService.updateProfile(operation.data);
        break;
      // Add more operation types as needed
    }
  }

  private async saveSyncQueue(): Promise<void> {
    await Taro.setStorage({
      key: 'sync_queue',
      data: this.syncQueue
    });
  }
}

interface OfflineOperation {
  type: string;
  data: any;
  timestamp: number;
}
```

### 4. Performance Monitoring

```typescript
class PerformanceMonitor {
  // Track page load time
  trackPageLoad(pageName: string): void {
    const loadTime = Date.now() - performance.timing.navigationStart;
    
    this.sendMetric({
      type: 'page_load',
      page: pageName,
      duration: loadTime,
      timestamp: Date.now()
    });
  }

  // Track API response time
  trackApiCall(endpoint: string, duration: number, status: number): void {
    this.sendMetric({
      type: 'api_call',
      endpoint,
      duration,
      status,
      timestamp: Date.now()
    });
  }

  // Track user interactions
  trackInteraction(action: string, target: string): void {
    this.sendMetric({
      type: 'interaction',
      action,
      target,
      timestamp: Date.now()
    });
  }

  private sendMetric(metric: PerformanceMetric): void {
    // Batch metrics and send periodically
    this.metricQueue.push(metric);
    
    if (this.metricQueue.length >= 10) {
      this.flushMetrics();
    }
  }

  private async flushMetrics(): Promise<void> {
    if (this.metricQueue.length === 0) return;

    const metrics = [...this.metricQueue];
    this.metricQueue = [];

    try {
      await apiClient.post('/analytics/metrics', { metrics });
    } catch (error) {
      // Re-add to queue on failure
      this.metricQueue.unshift(...metrics);
    }
  }

  private metricQueue: PerformanceMetric[] = [];
}

interface PerformanceMetric {
  type: string;
  [key: string]: any;
  timestamp: number;
}
```

### Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| First Contentful Paint (FCP) | < 1.0s | Lighthouse |
| Time to Interactive (TTI) | < 2.0s | Lighthouse |
| API Response Time (P95) | < 500ms | APM |
| Page Load Time | < 1.0s | Custom tracking |
| Image Load Time | < 2.0s | Custom tracking |
| Cache Hit Rate | > 80% | Redis metrics |
| Database Query Time (P95) | < 100ms | APM |



## UI/UX Design System

### Design Tokens

#### Color Palette

```scss
// variables.scss
$colors: (
  // Primary colors
  'primary': #1890ff,
  'primary-light': #40a9ff,
  'primary-dark': #096dd9,
  
  // Secondary colors
  'secondary': #52c41a,
  'secondary-light': #73d13d,
  'secondary-dark': #389e0d,
  
  // Status colors
  'success': #52c41a,
  'warning': #faad14,
  'error': #ff4d4f,
  'info': #1890ff,
  
  // Neutral colors
  'text-primary': #262626,
  'text-secondary': #595959,
  'text-tertiary': #8c8c8c,
  'text-disabled': #bfbfbf,
  
  // Background colors
  'bg-primary': #ffffff,
  'bg-secondary': #fafafa,
  'bg-tertiary': #f5f5f5,
  'bg-disabled': #f0f0f0,
  
  // Border colors
  'border-primary': #d9d9d9,
  'border-secondary': #e8e8e8,
  'border-light': #f0f0f0
);

// Usage
.button-primary {
  background-color: map-get($colors, 'primary');
  color: map-get($colors, 'bg-primary');
}
```

#### Typography

```scss
// Font sizes
$font-sizes: (
  'xs': 20px,      // 10px (Taro uses 2x scale)
  'sm': 24px,      // 12px
  'base': 28px,    // 14px
  'lg': 32px,      // 16px
  'xl': 36px,      // 18px
  '2xl': 40px,     // 20px
  '3xl': 48px,     // 24px
  'display': 56px  // 28px
);

// Font weights
$font-weights: (
  'normal': 400,
  'medium': 500,
  'semibold': 600,
  'bold': 700
);

// Line heights
$line-heights: (
  'tight': 1.2,
  'normal': 1.5,
  'relaxed': 1.75,
  'loose': 2
);

// Usage
.heading-1 {
  font-size: map-get($font-sizes, '3xl');
  font-weight: map-get($font-weights, 'bold');
  line-height: map-get($line-heights, 'tight');
}

.body-text {
  font-size: map-get($font-sizes, 'base');
  font-weight: map-get($font-weights, 'normal');
  line-height: map-get($line-heights, 'normal');
}
```

#### Spacing

```scss
// Spacing scale (8px base unit)
$spacing: (
  'xs': 8px,
  'sm': 16px,
  'md': 24px,
  'lg': 32px,
  'xl': 40px,
  'xxl': 48px
);

// Usage
.card {
  padding: map-get($spacing, 'md');
  margin-bottom: map-get($spacing, 'sm');
}
```

#### Border Radius

```scss
// Border radius
$border-radius: (
  'xs': 4px,
  'sm': 8px,
  'md': 12px,
  'lg': 16px,
  'xl': 20px,
  'pill': 9999px,
  'circle': 50%
);

// Usage
.button {
  border-radius: map-get($border-radius, 'sm');
}

.avatar {
  border-radius: map-get($border-radius, 'circle');
}
```

#### Shadows

```scss
// Shadows
$shadows: (
  'sm': 0 2px 4px rgba(0, 0, 0, 0.08),
  'md': 0 4px 8px rgba(0, 0, 0, 0.12),
  'lg': 0 8px 16px rgba(0, 0, 0, 0.16),
  'xl': 0 12px 24px rgba(0, 0, 0, 0.20)
);

// Usage
.card {
  box-shadow: map-get($shadows, 'sm');
}
```

### Component Library

#### Button Component

```tsx
interface ButtonProps {
  type?: 'primary' | 'secondary' | 'text' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  block?: boolean;
  loading?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
  onClick?: () => void;
  children: ReactNode;
}

export function Button({
  type = 'primary',
  size = 'md',
  block = false,
  loading = false,
  disabled = false,
  icon,
  onClick,
  children
}: ButtonProps) {
  const className = classNames(
    'btn',
    `btn-${type}`,
    `btn-${size}`,
    {
      'btn-block': block,
      'btn-loading': loading,
      'btn-disabled': disabled
    }
  );

  return (
    <View className={className} onClick={disabled ? undefined : onClick}>
      {loading && <Loading size="sm" />}
      {icon && <View className="btn-icon">{icon}</View>}
      <View className="btn-text">{children}</View>
    </View>
  );
}
```

```scss
// Button styles
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 16px 32px;
  border-radius: map-get($border-radius, 'sm');
  font-size: map-get($font-sizes, 'base');
  font-weight: map-get($font-weights, 'medium');
  transition: all 0.3s;
  
  &-primary {
    background-color: map-get($colors, 'primary');
    color: #fff;
    
    &:active {
      background-color: map-get($colors, 'primary-dark');
    }
  }
  
  &-secondary {
    background-color: transparent;
    color: map-get($colors, 'primary');
    border: 1px solid map-get($colors, 'primary');
    
    &:active {
      background-color: rgba(24, 144, 255, 0.1);
    }
  }
  
  &-text {
    background-color: transparent;
    color: map-get($colors, 'primary');
    
    &:active {
      background-color: rgba(24, 144, 255, 0.1);
    }
  }
  
  &-danger {
    background-color: map-get($colors, 'error');
    color: #fff;
    
    &:active {
      background-color: darken(map-get($colors, 'error'), 10%);
    }
  }
  
  &-sm {
    padding: 8px 16px;
    font-size: map-get($font-sizes, 'sm');
  }
  
  &-lg {
    padding: 20px 40px;
    font-size: map-get($font-sizes, 'lg');
  }
  
  &-block {
    width: 100%;
  }
  
  &-disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  &-loading {
    opacity: 0.7;
    pointer-events: none;
  }
}
```

#### Card Component

```tsx
interface CardProps {
  title?: string;
  extra?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  hoverable?: boolean;
  onClick?: () => void;
  children: ReactNode;
}

export function Card({
  title,
  extra,
  size = 'md',
  hoverable = false,
  onClick,
  children
}: CardProps) {
  const className = classNames(
    'card',
    `card-${size}`,
    {
      'card-hoverable': hoverable
    }
  );

  return (
    <View className={className} onClick={onClick}>
      {(title || extra) && (
        <View className="card-header">
          {title && <View className="card-title">{title}</View>}
          {extra && <View className="card-extra">{extra}</View>}
        </View>
      )}
      <View className="card-body">{children}</View>
    </View>
  );
}
```

```scss
.card {
  background-color: map-get($colors, 'bg-primary');
  border-radius: map-get($border-radius, 'md');
  box-shadow: map-get($shadows, 'sm');
  overflow: hidden;
  
  &-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: map-get($spacing, 'md');
    border-bottom: 1px solid map-get($colors, 'border-secondary');
  }
  
  &-title {
    font-size: map-get($font-sizes, 'lg');
    font-weight: map-get($font-weights, 'semibold');
    color: map-get($colors, 'text-primary');
  }
  
  &-body {
    padding: map-get($spacing, 'md');
  }
  
  &-sm &-body {
    padding: map-get($spacing, 'sm');
  }
  
  &-lg &-body {
    padding: map-get($spacing, 'lg');
  }
  
  &-hoverable {
    transition: all 0.3s;
    
    &:active {
      box-shadow: map-get($shadows, 'md');
      transform: translateY(-2px);
    }
  }
}
```

#### Input Component

```tsx
interface InputProps {
  type?: 'text' | 'number' | 'tel' | 'password';
  value: string;
  placeholder?: string;
  maxLength?: number;
  disabled?: boolean;
  error?: string;
  label?: string;
  required?: boolean;
  prefix?: ReactNode;
  suffix?: ReactNode;
  onChange: (value: string) => void;
  onBlur?: () => void;
}

export function Input({
  type = 'text',
  value,
  placeholder,
  maxLength,
  disabled = false,
  error,
  label,
  required = false,
  prefix,
  suffix,
  onChange,
  onBlur
}: InputProps) {
  return (
    <View className="input-wrapper">
      {label && (
        <View className="input-label">
          {label}
          {required && <Text className="input-required">*</Text>}
        </View>
      )}
      <View className={classNames('input-container', { 'input-error': error })}>
        {prefix && <View className="input-prefix">{prefix}</View>}
        <Input
          className="input-field"
          type={type}
          value={value}
          placeholder={placeholder}
          maxLength={maxLength}
          disabled={disabled}
          onInput={(e) => onChange(e.detail.value)}
          onBlur={onBlur}
        />
        {suffix && <View className="input-suffix">{suffix}</View>}
      </View>
      {error && <View className="input-error-text">{error}</View>}
    </View>
  );
}
```

```scss
.input {
  &-wrapper {
    margin-bottom: map-get($spacing, 'md');
  }
  
  &-label {
    font-size: map-get($font-sizes, 'base');
    color: map-get($colors, 'text-primary');
    margin-bottom: map-get($spacing, 'xs');
  }
  
  &-required {
    color: map-get($colors, 'error');
    margin-left: 4px;
  }
  
  &-container {
    display: flex;
    align-items: center;
    padding: 16px;
    background-color: map-get($colors, 'bg-secondary');
    border: 1px solid map-get($colors, 'border-secondary');
    border-radius: map-get($border-radius, 'sm');
    transition: all 0.3s;
    
    &:focus-within {
      border-color: map-get($colors, 'primary');
      background-color: map-get($colors, 'bg-primary');
    }
  }
  
  &-error {
    border-color: map-get($colors, 'error');
  }
  
  &-field {
    flex: 1;
    font-size: map-get($font-sizes, 'base');
    color: map-get($colors, 'text-primary');
    background-color: transparent;
    border: none;
    outline: none;
  }
  
  &-prefix,
  &-suffix {
    display: flex;
    align-items: center;
    color: map-get($colors, 'text-tertiary');
  }
  
  &-prefix {
    margin-right: map-get($spacing, 'xs');
  }
  
  &-suffix {
    margin-left: map-get($spacing, 'xs');
  }
  
  &-error-text {
    font-size: map-get($font-sizes, 'sm');
    color: map-get($colors, 'error');
    margin-top: map-get($spacing, 'xs');
  }
}
```

### Page Layouts

#### Standard Page Layout

```tsx
interface PageLayoutProps {
  title?: string;
  showBack?: boolean;
  showHome?: boolean;
  actions?: ReactNode;
  loading?: boolean;
  error?: Error | null;
  onRetry?: () => void;
  children: ReactNode;
}

export function PageLayout({
  title,
  showBack = true,
  showHome = false,
  actions,
  loading = false,
  error = null,
  onRetry,
  children
}: PageLayoutProps) {
  return (
    <View className="page-layout">
      {/* Navigation Bar */}
      {title && (
        <View className="page-navbar">
          {showBack && (
            <View className="navbar-back" onClick={() => Taro.navigateBack()}>
              <Icon name="arrow-left" />
            </View>
          )}
          <View className="navbar-title">{title}</View>
          {actions && <View className="navbar-actions">{actions}</View>}
        </View>
      )}

      {/* Content */}
      <View className="page-content">
        {loading && <LoadingView />}
        {error && <ErrorView error={error} onRetry={onRetry} />}
        {!loading && !error && children}
      </View>
    </View>
  );
}
```

```scss
.page-layout {
  min-height: 100vh;
  background-color: map-get($colors, 'bg-secondary');
}

.page-navbar {
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  height: 88px;
  padding: 0 map-get($spacing, 'md');
  background-color: map-get($colors, 'bg-primary');
  border-bottom: 1px solid map-get($colors, 'border-secondary');
  
  &-back {
    padding: map-get($spacing, 'xs');
    margin-right: map-get($spacing, 'sm');
  }
  
  &-title {
    flex: 1;
    font-size: map-get($font-sizes, 'xl');
    font-weight: map-get($font-weights, 'semibold');
    color: map-get($colors, 'text-primary');
  }
  
  &-actions {
    display: flex;
    align-items: center;
    gap: map-get($spacing, 'sm');
  }
}

.page-content {
  padding: map-get($spacing, 'md');
}
```

### Responsive Design

```scss
// Breakpoints
$breakpoints: (
  'xs': 320px,
  'sm': 375px,
  'md': 414px,
  'lg': 768px,
  'xl': 1024px
);

// Mixins for responsive design
@mixin respond-to($breakpoint) {
  @media (min-width: map-get($breakpoints, $breakpoint)) {
    @content;
  }
}

// Usage
.container {
  padding: map-get($spacing, 'sm');
  
  @include respond-to('md') {
    padding: map-get($spacing, 'md');
  }
  
  @include respond-to('lg') {
    padding: map-get($spacing, 'lg');
    max-width: 1200px;
    margin: 0 auto;
  }
}
```

### Accessibility

```tsx
// Accessible button with proper ARIA attributes
<Button
  aria-label="提交订单"
  aria-disabled={disabled}
  role="button"
  onClick={handleSubmit}
>
  提交订单
</Button>

// Accessible form with labels
<View role="form" aria-label="登录表单">
  <Input
    label="手机号"
    type="tel"
    value={phone}
    onChange={setPhone}
    aria-required="true"
    aria-invalid={!!phoneError}
    aria-describedby="phone-error"
  />
  {phoneError && (
    <Text id="phone-error" role="alert">
      {phoneError}
    </Text>
  )}
</View>

// Accessible navigation
<View role="navigation" aria-label="主导航">
  <View role="link" aria-label="首页" onClick={() => navigateTo('/pages/index/index')}>
    首页
  </View>
</View>
```



## Security Considerations

### 1. Authentication Security

#### JWT Token Management

```typescript
// Token configuration
export const jwtConfig = {
  secret: process.env.JWT_SECRET,
  accessTokenExpiry: '15m',      // Short-lived access token
  refreshTokenExpiry: '7d',      // Longer-lived refresh token
  algorithm: 'HS256'
};

// Token generation
class TokenService {
  generateAccessToken(userId: string, platform: string): string {
    return jwt.sign(
      {
        sub: userId,
        platform,
        type: 'access'
      },
      jwtConfig.secret,
      {
        expiresIn: jwtConfig.accessTokenExpiry,
        algorithm: jwtConfig.algorithm
      }
    );
  }

  generateRefreshToken(userId: string): string {
    const token = jwt.sign(
      {
        sub: userId,
        type: 'refresh'
      },
      jwtConfig.secret,
      {
        expiresIn: jwtConfig.refreshTokenExpiry,
        algorithm: jwtConfig.algorithm
      }
    );

    // Store hash in database for validation
    const tokenHash = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    this.storeTokenHash(userId, tokenHash);

    return token;
  }

  async validateRefreshToken(token: string): Promise<boolean> {
    try {
      const decoded = jwt.verify(token, jwtConfig.secret);
      
      // Check if token hash exists in database
      const tokenHash = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');

      return await this.tokenHashExists(tokenHash);
    } catch (error) {
      return false;
    }
  }

  async revokeToken(token: string): Promise<void> {
    const tokenHash = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    await this.deleteTokenHash(tokenHash);
  }
}
```

#### Secure Token Storage (Frontend)

```typescript
class SecureStorage {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';

  // Store token securely
  async setToken(token: string): Promise<void> {
    // Encrypt token before storage (optional for mini-programs)
    const encrypted = this.encrypt(token);
    
    await Taro.setStorage({
      key: this.TOKEN_KEY,
      data: encrypted
    });
  }

  // Retrieve token
  async getToken(): Promise<string | null> {
    try {
      const encrypted = await Taro.getStorage({
        key: this.TOKEN_KEY
      });
      
      return this.decrypt(encrypted.data);
    } catch (error) {
      return null;
    }
  }

  // Clear tokens on logout
  async clearTokens(): Promise<void> {
    await Promise.all([
      Taro.removeStorage({ key: this.TOKEN_KEY }),
      Taro.removeStorage({ key: this.REFRESH_TOKEN_KEY })
    ]);
  }

  private encrypt(data: string): string {
    // Simple XOR encryption (for demonstration)
    // In production, use platform-specific secure storage
    return Buffer.from(data).toString('base64');
  }

  private decrypt(data: string): string {
    return Buffer.from(data, 'base64').toString('utf-8');
  }
}
```

### 2. API Security

#### Rate Limiting

```typescript
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

// Global rate limiting configuration
@Module({
  imports: [
    ThrottlerModule.forRoot({
      ttl: 60,        // Time window in seconds
      limit: 100      // Max requests per window
    })
  ]
})
export class AppModule {}

// Custom rate limiting for sensitive endpoints
@Controller('auth')
@UseGuards(ThrottlerGuard)
export class AuthController {
  // SMS sending - stricter limit
  @Post('sms/send')
  @Throttle(5, 60)  // 5 requests per minute
  async sendSms(@Body() dto: SendSmsDto) {
    return this.authService.sendSms(dto);
  }

  // Login - moderate limit
  @Post('login/platform')
  @Throttle(10, 60)  // 10 requests per minute
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }
}
```

#### Input Validation

```typescript
import { IsString, IsPhoneNumber, Length, Matches } from 'class-validator';

// DTO with validation
export class LoginDto {
  @IsString()
  @IsIn(['weapp', 'alipay', 'tt', 'kwai'])
  platform: string;

  @IsString()
  @Length(1, 100)
  code: string;

  @IsString()
  @Length(2, 20)
  @Matches(/^[\u4e00-\u9fa5a-zA-Z0-9_]+$/, {
    message: '昵称只能包含中文、字母、数字和下划线'
  })
  @IsOptional()
  nickname?: string;
}

export class SendSmsDto {
  @IsPhoneNumber('CN', {
    message: '请输入有效的中国大陆手机号'
  })
  phone: string;

  @IsString()
  @IsIn(['login', 'bind'])
  type: string;
}

export class CreateAddressDto {
  @IsString()
  @Length(2, 50)
  name: string;

  @IsPhoneNumber('CN')
  phone: string;

  @IsString()
  @Length(1, 50)
  province: string;

  @IsString()
  @Length(1, 50)
  city: string;

  @IsString()
  @Length(1, 50)
  district: string;

  @IsString()
  @Length(1, 200)
  detail: string;

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}
```

#### SQL Injection Prevention

```typescript
// Prisma automatically prevents SQL injection
// Always use parameterized queries

// SAFE - Using Prisma
async getUserByPhone(phone: string) {
  return this.prisma.user.findUnique({
    where: { phone }  // Automatically parameterized
  });
}

// SAFE - Using Prisma with complex queries
async searchOrders(userId: string, keyword: string) {
  return this.prisma.order.findMany({
    where: {
      userId,
      OR: [
        { orderNo: { contains: keyword } },
        { description: { contains: keyword } }
      ]
    }
  });
}

// UNSAFE - Raw SQL (avoid if possible)
async rawQuery(userId: string) {
  // If raw SQL is necessary, use parameterized queries
  return this.prisma.$queryRaw`
    SELECT * FROM orders 
    WHERE user_id = ${userId}
  `;
}
```

#### XSS Prevention

```typescript
// Sanitize user input
import DOMPurify from 'isomorphic-dompurify';

class InputSanitizer {
  sanitizeHtml(input: string): string {
    return DOMPurify.sanitize(input, {
      ALLOWED_TAGS: [],  // Strip all HTML tags
      ALLOWED_ATTR: []
    });
  }

  sanitizeText(input: string): string {
    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }
}

// Use in service
async updateProfile(userId: string, data: UpdateProfileDto) {
  const sanitized = {
    nickname: this.sanitizer.sanitizeText(data.nickname),
    // avatarUrl is validated as URL, no need to sanitize
  };

  return this.prisma.user.update({
    where: { id: userId },
    data: sanitized
  });
}
```

### 3. Data Privacy

#### Sensitive Data Masking

```typescript
class DataMasker {
  // Mask phone number: 138****8000
  maskPhone(phone: string): string {
    if (!phone || phone.length !== 11) return phone;
    return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
  }

  // Mask ID card: 110101****1234
  maskIdCard(idCard: string): string {
    if (!idCard || idCard.length < 8) return idCard;
    return idCard.replace(/(\d{6})\d+(\d{4})/, '$1****$2');
  }

  // Mask bank card: **** **** **** 1234
  maskBankCard(cardNo: string): string {
    if (!cardNo || cardNo.length < 8) return cardNo;
    return '**** **** **** ' + cardNo.slice(-4);
  }
}

// Use in API responses
async getUserProfile(userId: string) {
  const user = await this.prisma.user.findUnique({
    where: { id: userId }
  });

  return {
    ...user,
    phone: user.phone ? this.masker.maskPhone(user.phone) : null
  };
}
```

#### Data Encryption

```typescript
import * as crypto from 'crypto';

class EncryptionService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');

  encrypt(text: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return JSON.stringify({
      iv: iv.toString('hex'),
      encrypted,
      authTag: authTag.toString('hex')
    });
  }

  decrypt(encryptedData: string): string {
    const { iv, encrypted, authTag } = JSON.parse(encryptedData);
    
    const decipher = crypto.createDecipheriv(
      this.algorithm,
      this.key,
      Buffer.from(iv, 'hex')
    );
    
    decipher.setAuthTag(Buffer.from(authTag, 'hex'));
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
}

// Use for sensitive data
async storeSensitiveData(userId: string, data: string) {
  const encrypted = this.encryption.encrypt(data);
  
  await this.prisma.sensitiveData.create({
    data: {
      userId,
      encryptedData: encrypted
    }
  });
}
```

### 4. HTTPS and Transport Security

```typescript
// Force HTTPS in production
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS with secure settings
  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || [],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
  });

  // Security headers
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      }
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    }
  }));

  await app.listen(3000);
}
```

### 5. Audit Logging

```typescript
interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  changes?: any;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
}

class AuditLogger {
  async log(
    userId: string,
    action: string,
    resource: string,
    context: any
  ): Promise<void> {
    await this.prisma.auditLog.create({
      data: {
        userId,
        action,
        resource,
        resourceId: context.resourceId,
        changes: context.changes,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        timestamp: new Date()
      }
    });
  }
}

// Use in sensitive operations
async updateUserProfile(userId: string, data: UpdateProfileDto, context: RequestContext) {
  const oldProfile = await this.getProfile(userId);
  
  const updated = await this.prisma.user.update({
    where: { id: userId },
    data
  });

  // Log the change
  await this.auditLogger.log(
    userId,
    'UPDATE_PROFILE',
    'user',
    {
      resourceId: userId,
      changes: {
        old: oldProfile,
        new: updated
      },
      ipAddress: context.ip,
      userAgent: context.userAgent
    }
  );

  return updated;
}
```

## Deployment Strategy

### Environment Configuration

```bash
# Development (.env.development)
NODE_ENV=development
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/onerecycle_dev
REDIS_URL=redis://localhost:6379
JWT_SECRET=dev_secret_key_change_in_production
API_GATEWAY_URL=http://localhost:3002

# Production (.env.production)
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@prod-db:5432/onerecycle
REDIS_URL=redis://prod-redis:6379
JWT_SECRET=${SECURE_JWT_SECRET}
API_GATEWAY_URL=https://api.onerecycle.com
```

### Docker Deployment

```dockerfile
# Dockerfile for backend services
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build
RUN npm prune --production

FROM node:18-alpine

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

EXPOSE 3000

CMD ["node", "dist/main.js"]
```

```yaml
# docker-compose.yml for production
version: '3.8'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: onerecycle
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: always

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    restart: always

  auth-service:
    build: ./services/auth-service
    environment:
      DATABASE_URL: ${DATABASE_URL}
      REDIS_URL: ${REDIS_URL}
      JWT_SECRET: ${JWT_SECRET}
    depends_on:
      - postgres
      - redis
    restart: always

  account-service:
    build: ./services/account-service
    environment:
      DATABASE_URL: ${DATABASE_URL}
      REDIS_URL: ${REDIS_URL}
    depends_on:
      - postgres
      - redis
    restart: always

  api-gateway:
    build: ./services/api-gateway
    ports:
      - "3002:3002"
    environment:
      AUTH_SERVICE_URL: http://auth-service:3007
      ACCOUNT_SERVICE_URL: http://account-service:3001
    depends_on:
      - auth-service
      - account-service
    restart: always

volumes:
  postgres_data:
  redis_data:
```

### CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Build
        run: npm run build
      
      - name: Build Docker images
        run: |
          docker build -t onerecycle/auth-service:${{ github.sha }} ./services/auth-service
          docker build -t onerecycle/account-service:${{ github.sha }} ./services/account-service
      
      - name: Push to registry
        run: |
          echo ${{ secrets.DOCKER_PASSWORD }} | docker login -u ${{ secrets.DOCKER_USERNAME }} --password-stdin
          docker push onerecycle/auth-service:${{ github.sha }}
          docker push onerecycle/account-service:${{ github.sha }}
      
      - name: Deploy to production
        run: |
          # Deploy using your preferred method (k8s, docker-compose, etc.)
          kubectl set image deployment/auth-service auth-service=onerecycle/auth-service:${{ github.sha }}
          kubectl set image deployment/account-service account-service=onerecycle/account-service:${{ github.sha }}
```

## Migration Plan

### Phase 1: Service Integration (Week 1)
1. Create new auth-service with consolidated authentication logic
2. Implement gRPC communication between auth-service and account-service
3. Migrate existing authentication endpoints
4. Update API gateway routing
5. Run parallel testing with old and new services

### Phase 2: Frontend Updates (Week 2)
1. Implement new login flow
2. Update API client to use new endpoints
3. Implement offline support
4. Add error handling and retry logic
5. Test across all platforms

### Phase 3: Feature Completion (Week 3)
1. Complete order management features
2. Implement address management
3. Add profile management
4. Integrate notification system
5. Implement analytics tracking

### Phase 4: UI/UX Polish (Week 4)
1. Apply design system across all pages
2. Optimize performance
3. Add loading states and animations
4. Conduct user testing
5. Fix bugs and polish details

### Rollback Plan
- Keep old services running in parallel during migration
- Use feature flags to toggle between old and new implementations
- Monitor error rates and performance metrics
- Automated rollback if error rate exceeds threshold

