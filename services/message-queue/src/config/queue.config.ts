export default () => ({
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_DB, 10) || 0,
  },
  queue: {
    removeOnComplete: parseInt(process.env.QUEUE_REMOVE_ON_COMPLETE, 10) || 100,
    removeOnFail: parseInt(process.env.QUEUE_REMOVE_ON_FAIL, 10) || 1000,
  },
  bullBoard: {
    enabled: process.env.BULL_BOARD_ENABLED === 'true',
    path: process.env.BULL_BOARD_PATH || '/admin/queues',
    username: process.env.BULL_BOARD_USERNAME || 'admin',
    password: process.env.BULL_BOARD_PASSWORD || 'admin',
  },
  port: parseInt(process.env.PORT, 10) || 3010,
});