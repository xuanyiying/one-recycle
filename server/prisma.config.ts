export default {
  datasource: {
    url: process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/one_recycle?schema=public&sslmode=disable&connection_limit=20&pool_timeout=30"
  },
  migrations: {
    seed: 'npx ts-node scripts/main.ts'
  }
}