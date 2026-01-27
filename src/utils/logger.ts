/**
 * 简单的日志工具
 * 生产环境可以使用 winston 或 pino 等专业日志库
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  private formatMessage(level: LogLevel, message: string, ...args: unknown[]): string {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
    return `${prefix} ${message}`;
  }

  info(message: string, ...args: unknown[]): void {
    if (this.isDevelopment || process.env.LOG_LEVEL === 'info') {
      if (args.length > 0) {
        console.log(this.formatMessage('info', message), ...args);
      } else {
        console.log(this.formatMessage('info', message));
      }
    }
  }

  warn(message: string, ...args: unknown[]): void {
    console.warn(this.formatMessage('warn', message), ...args);
  }

  error(message: string, error?: Error | unknown, ...args: unknown[]): void {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(this.formatMessage('error', message), errorMessage, ...args);
    
    if (error instanceof Error && this.isDevelopment) {
      console.error('Stack:', error.stack);
    }
  }

  debug(message: string, ...args: unknown[]): void {
    if (this.isDevelopment) {
      console.debug(this.formatMessage('debug', message), ...args);
    }
  }
}

export const logger = new Logger();
