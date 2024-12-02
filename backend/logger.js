import winston from 'winston';
import path from 'path';
const { format, transports } = winston;

// 自定義格式
const customFormat = format.printf(({ level, message, timestamp, stack }) => {
    return `${timestamp} [${level}]: ${message} ${stack || ''}`;
});

const logger = winston.createLogger({
    level: 'info',
    transports: [
        // console 輸出 log
        new transports.Console({
            format: format.combine(
                format.colorize(),
                format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
                customFormat
            ),
        }),
        // error log 獨立出來方便 debug
        new transports.File({
            filename: 'logs/error.log',
            level: 'error',
            format: format.combine(format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), customFormat),
        }),
        new transports.File({
            filename: 'logs/app.log',
            format: format.combine(format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), customFormat),
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
        // 如果 log level 是 error，log 包括檔名和行數
        const matchResult = stackLines[relevantLineIndex].match(/at\s+(?:.+?\s+\()?(.+?):(\d+):\d+(?:\))?/);
        if (matchResult) {
            const filePath = matchResult[1];
            const lineNumber = matchResult[2];
            fileInfo = ` (${path.basename(filePath)}:${lineNumber})`;
        } else {
            fileInfo = ' (Unknown file)';
        }
    } else {
        // 如果 log level 不是 error，只包括檔名
        const matchResult = stackLines[relevantLineIndex].match(/at\s+(?:.+?\s+\()?(.+?):\d+:\d+(?:\))?/);
        if (matchResult) {
            const filePath = matchResult[1];
            fileInfo = ` (${path.basename(filePath)})`;
        } else {
            fileInfo = ' (Unknown file)';
        }
    }

    logger.log(level, `${message}${fileInfo}`, { error });
}

export { logWithFileInfo };
