export interface ServiceConfig {
  name: string;
  baseUrl: string;
  healthCheck: string;
  timeout: number;
  retries: number;
  weight: number;
}

export interface GatewayConfig {
  port: number;
  services: Record<string, ServiceConfig[]>;
  rateLimit: {
    ttl: number;
    limit: number;
  };
  cors: {
    origin: string[];
    credentials: boolean;
  };
  jwt: {
    secret: string;
    expiresIn: string;
  };
}

export const gatewayConfig = (): GatewayConfig => ({
  port: parseInt(process.env.PORT || '3000', 10),
  services: {
    'account-service': [
      {
        name: 'account-service-1',
        baseUrl: process.env.ACCOUNT_SERVICE_URL || 'http://localhost:3001',
        healthCheck: '/health',
        timeout: 5000,
        retries: 3,
        weight: 1,
      },
    ],
    'order-service': [
      {
        name: 'order-service-1',
        baseUrl: process.env.ORDER_SERVICE_URL || 'http://localhost:3002',
        healthCheck: '/health',
        timeout: 5000,
        retries: 3,
        weight: 1,
      },
    ],
    'dispatch-service': [
      {
        name: 'dispatch-service-1',
        baseUrl: process.env.DISPATCH_SERVICE_URL || 'http://localhost:3003',
        healthCheck: '/health',
        timeout: 5000,
        retries: 3,
        weight: 1,
      },
    ],
    'courier-service': [
      {
        name: 'courier-service-1',
        baseUrl: process.env.COURIER_SERVICE_URL || 'http://localhost:3004',
        healthCheck: '/health',
        timeout: 5000,
        retries: 3,
        weight: 1,
      },
    ],
    'notification-service': [
      {
        name: 'notification-service-1',
        baseUrl: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3005',
        healthCheck: '/health',
        timeout: 5000,
        retries: 3,
        weight: 1,
      },
    ],
    'payment-service': [
      {
        name: 'payment-service-1',
        baseUrl: process.env.PAYMENT_SERVICE_URL || 'http://localhost:3006',
        healthCheck: '/health',
        timeout: 5000,
        retries: 3,
        weight: 1,
      },
    ],
    'inventory-service': [
      {
        name: 'inventory-service-1',
        baseUrl: process.env.INVENTORY_SERVICE_URL || 'http://localhost:3007',
        healthCheck: '/health',
        timeout: 5000,
        retries: 3,
        weight: 1,
      },
    ],
    'category-service': [
      {
        name: 'category-service-1',
        baseUrl: process.env.CATEGORY_SERVICE_URL || 'http://localhost:3008',
        healthCheck: '/health',
        timeout: 5000,
        retries: 3,
        weight: 1,
      },
    ],
  },
  rateLimit: {
    ttl: parseInt(process.env.RATE_LIMIT_TTL || '60', 10),
    limit: parseInt(process.env.RATE_LIMIT_COUNT || '100', 10),
  },
  cors: {
    origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true,
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  },
});