import winston from 'winston';
import path from 'path';
import chalk from 'chalk';
const { format, transports } = winston;

// 自定義 console output 格式
const normalFormat = format.printf(({ timestamp, level, message }) => {
    const regex = /\(.*?\)/g;
    const formattedMessage = message.replace(regex, (match) => chalk.cyanBright(match));
    return `${timestamp} [${level}]: ${formattedMessage} `;
});

const errorFormat = format.printf(({ timestamp, level, message, error }) => {
    const regex = /\(.*?\)/g;
    const formattedMessage = message.replace(regex, (match) => chalk.cyanBright(match));
    const formattedStack = error?.stack ? `\n${chalk.red(error.stack)}` : '';
    return `${timestamp} [${level}]: ${formattedMessage} ${formattedStack}`;
});

// 自定義 output log file 的格式 (不包含顏色)
const LogFileFormat = format.printf(({ timestamp, level, message }) => {
    return `${timestamp} [${level}]: ${message} `;
});

const ErrorLogFileFormat = format.printf(({ timestamp, level, message, error }) => {
    return `${timestamp} [${level}]: ${message} ${error.stack || ''}`;
});

const infoLogger = winston.createLogger({
    level: 'info',
    transports: [
        // console 輸出 log
        new transports.Console({
            format: format.combine(
                format.colorize(),
                format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
                normalFormat
            ),
        }),

        // output log to file
        new transports.File({
            filename: 'logs/app.log',
            format: format.combine(format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), LogFileFormat),
        }),
    ],
});

const errorLogger = winston.createLogger({
    level: 'error',
    transports: [
        // console 輸出 log
        new transports.Console({
            format: format.combine(
                format.colorize(), // log level 用顏色區隔
                format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
                errorFormat
            ),
        }),

        // output log to file
        new transports.File({
            filename: 'logs/app.log',
            format: format.combine(format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), ErrorLogFileFormat),
        }),
        // error log 再獨立出來一份方便 debug
        new transports.File({
            filename: 'logs/error.log',
            level: 'error',
            format: format.combine(format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), ErrorLogFileFormat),
        }),
    ],
});

function logWithFileInfo(level, message, error = null) {
    const stack = new Error().stack;
    const stackLines = stack.split('\n');

    let relevantLineIndex = stackLines.findIndex(
        (line) => !line.includes('logger.js') && !line.includes('logWithFileInfo')
    );

    relevantLineIndex = Math.max(relevantLineIndex, 2);

    let fileInfo = '';

    if (level === 'error') {
        // error log 包括檔名和行數
        const matchResult = stackLines[relevantLineIndex].match(/at\s+(?:.+?\s+\()?(.+?):(\d+):\d+(?:\))?/);
        if (matchResult) {
            const filePath = matchResult[1];
            const lineNumber = matchResult[2];
            fileInfo = ` (${path.basename(filePath)}:${lineNumber})`;
        } else {
            fileInfo = ' (Unknown file)';
        }
        errorLogger.log(level, `${message}${fileInfo}`, { error });
    } else {
        // 一般 log 只包括檔名
        const matchResult = stackLines[relevantLineIndex].match(/at\s+(?:.+?\s+\()?(.+?):\d+:\d+(?:\))?/);
        if (matchResult) {
            const filePath = matchResult[1];
            fileInfo = ` (${path.basename(filePath)})`;
        } else {
            fileInfo = ' (Unknown file)';
        }
        infoLogger.log(level, `${message}${fileInfo}`);
    }
}

export { logWithFileInfo };
