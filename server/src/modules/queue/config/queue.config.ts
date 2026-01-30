export default () => ({
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_DB || '0', 10),
  },
  queue: {
    removeOnComplete: parseInt(
      process.env.QUEUE_REMOVE_ON_COMPLETE || '100',
      10,
    ),
    removeOnFail: parseInt(process.env.QUEUE_REMOVE_ON_FAIL || '1000', 10),
  },
  bullBoard: {
    enabled: process.env.BULL_BOARD_ENABLED === 'true',
    path: process.env.BULL_BOARD_PATH || '/admin/queues',
    username: process.env.BULL_BOARD_USERNAME || 'admin',
    password: process.env.BULL_BOARD_PASSWORD || 'admin',
  },
  port: parseInt(process.env.PORT || '3010', 10),
});
