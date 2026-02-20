// Production-safe logging utility
export const logger = {
  log: (...args: any[]) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(...args)
    }
  },
  error: (...args: any[]) => {
    // Always log errors, but use structured logging in production
    if (process.env.NODE_ENV === 'production') {
      // In production, you might want to send to a logging service
      console.error(...args)
    } else {
      console.error(...args)
    }
  },
  warn: (...args: any[]) => {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(...args)
    }
  },
  debug: (...args: any[]) => {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(...args)
    }
  }
}

