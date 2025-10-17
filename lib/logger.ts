import winston from "winston";
import path from "path";

// Create logs directory if it doesn't exist
const logDir = path.join(process.cwd(), "logs");

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp({
      format: "YYYY-MM-DD HH:mm:ss",
    }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: "waterpolo-stats" },
  transports: [
    // Write all logs to `logs/app.log`
    new winston.transports.File({
      filename: path.join(logDir, "app.log"),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Write error logs to `logs/error.log`
    new winston.transports.File({
      filename: path.join(logDir, "error.log"),
      level: "error",
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

// If we're not in production, also log to the console
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          return `${timestamp} [${level}]: ${message} ${
            Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ""
          }`;
        })
      ),
    })
  );
}

export default logger;
