const isDev = process.env.NODE_ENV === 'development';

const errorLog: Array<{ timestamp: number; args: any[] }> = []
const MAX_ERROR_LOG = 50

export const logger = {
  log: (...args: any[]) => {
    if (isDev) console.log(...args);
  },
  error: (...args: any[]) => {
    if (isDev) {
      console.error(...args);
    }
    errorLog.push({ timestamp: Date.now(), args })
    if (errorLog.length > MAX_ERROR_LOG) {
      errorLog.shift()
    }
  },
  warn: (...args: any[]) => {
    if (isDev) console.warn(...args);
  },
  info: (...args: any[]) => {
    if (isDev) console.info(...args);
  },
  getErrorLog: () => [...errorLog],
  clearErrorLog: () => {
    errorLog.length = 0
  }
};

export default logger;
