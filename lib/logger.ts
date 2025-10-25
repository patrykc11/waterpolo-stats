// Simple console logger with timestamps
const logger = {
  info: (message: string, meta?: any) => {
    const timestamp = new Date().toISOString();
    console.log(
      `[${timestamp}] [INFO] ${message}`,
      meta ? JSON.stringify(meta, null, 2) : ""
    );
  },
  error: (message: string, meta?: any) => {
    const timestamp = new Date().toISOString();
    console.error(
      `[${timestamp}] [ERROR] ${message}`,
      meta ? JSON.stringify(meta, null, 2) : ""
    );
  },
  warn: (message: string, meta?: any) => {
    const timestamp = new Date().toISOString();
    console.warn(
      `[${timestamp}] [WARN] ${message}`,
      meta ? JSON.stringify(meta, null, 2) : ""
    );
  },
};

export default logger;
