import { registerAs } from '@nestjs/config';

export interface DatabaseConfig {
  url: string;
  maxConnections: number;
  connectionTimeout: number;
  logQueries: boolean;
}

export default registerAs('database', (): DatabaseConfig => ({
  url: process.env.DATABASE_URL || 'postgresql://localhost:5432/account_db',
  maxConnections: parseInt(process.env.DB_MAX_CONNECTIONS || '10', 10),
  connectionTimeout: parseInt(process.env.DB_CONNECTION_TIMEOUT || '30000', 10),
  logQueries: process.env.DB_LOG_QUERIES === 'true',
}));