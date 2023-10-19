var winston = require("winston");
const colorize = winston.format.colorize;

//Config logger winston
const levelsWionston = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  verbose: 4,
  debug: 5,
  silly: 6,
};

const loggerWinston = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    colorize(), // Sử dụng winston.format.colorize ở đây
    winston.format.simple()
  ),
  defaultMeta: { service: "user-service" },
  transports: [
    //
    // - Write all logs with importance level of `error` or less to `error.log`
    // - Write all logs with importance level of `info` or less to `combined.log`
    //
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.File({ filename: "combined.log" }),
  ],
});
//don't show the log when it is test or production
if (process.env.NODE_ENV !== "production" && process.env.NODE_ENV !== "test") {
  loggerWinston.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    })
  );
}


// Xuất logger để sử dụng ở các phần khác của ứng dụng
module.exports = loggerWinston;