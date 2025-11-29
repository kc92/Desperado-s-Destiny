/**
 * BotLogger - Logging utility for playtest bots
 */

import * as fs from 'fs';
import * as path from 'path';

export class BotLogger {
  private botName: string;
  private logFile: string;

  constructor(botName: string) {
    this.botName = botName;

    // Create logs directory if it doesn't exist
    const logsDir = path.join(process.cwd(), 'tests', 'playtests', 'logs');
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }

    // Create log file with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    this.logFile = path.join(logsDir, `${botName}-${timestamp}.log`);

    this.info(`=== Bot Logger Initialized: ${botName} ===`);
  }

  private formatMessage(level: string, message: string): string {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${this.botName}] [${level}] ${message}`;
  }

  private writeLog(level: string, message: string): void {
    const formattedMessage = this.formatMessage(level, message);

    // Console output with colors
    const colors = {
      INFO: '\x1b[36m',    // Cyan
      SUCCESS: '\x1b[32m', // Green
      WARN: '\x1b[33m',    // Yellow
      ERROR: '\x1b[31m',   // Red
      DEBUG: '\x1b[90m',   // Gray
    };

    const color = colors[level as keyof typeof colors] || '\x1b[0m';
    const reset = '\x1b[0m';

    console.log(`${color}${formattedMessage}${reset}`);

    // File output
    fs.appendFileSync(this.logFile, formattedMessage + '\n');
  }

  info(message: string): void {
    this.writeLog('INFO', message);
  }

  success(message: string): void {
    this.writeLog('SUCCESS', message);
  }

  warn(message: string): void {
    this.writeLog('WARN', message);
  }

  error(message: string | Error): void {
    const errorMessage = message instanceof Error ? message.message : message;
    this.writeLog('ERROR', errorMessage);

    if (message instanceof Error && message.stack) {
      fs.appendFileSync(this.logFile, message.stack + '\n');
    }
  }

  debug(message: string): void {
    this.writeLog('DEBUG', message);
  }

  action(actionName: string, details?: any): void {
    const message = details
      ? `ACTION: ${actionName} - ${JSON.stringify(details)}`
      : `ACTION: ${actionName}`;
    this.writeLog('INFO', message);
  }
}
