const winston = require('winston');

const jsonWithOrderedFields = winston.format.printf(({level, message, timestamp }) => {
  return JSON.stringify({
    timestamp, 
    level,
    message
  });
});

const logger = winston.createLogger({
  level: "info", 
  format: winston.format.combine(     
    winston.format.timestamp(),
    jsonWithOrderedFields
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "logs/error_log.json", level: "error" }),
    new winston.transports.File({ filename: "logs/combined_log.json" })
  ],
});

module.exports = logger;