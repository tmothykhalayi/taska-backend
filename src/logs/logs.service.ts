import * as path from 'path';
import { Logger } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { promises as fsPromises, existsSync } from 'fs';

@Injectable()
export class LogsService extends Logger {
  private readonly logsPath = path.join(__dirname, '..', '..', 'logs');
  private readonly logFile = 'myLogFile.log';

  constructor() {
    super();
    this.initializeLogsDirectory();
  }

  private async initializeLogsDirectory() {
    try {
      if (!existsSync(this.logsPath)) {
        await fsPromises.mkdir(this.logsPath);
        // Create a .gitkeep file to track empty directory
        await fsPromises.writeFile(path.join(this.logsPath, '.gitkeep'), '');
      }
    } catch (e) {
      console.error('Failed to initialize logs directory:', e);
    }
  }

  async logToFile(entry: string, ip?: string) {
    const formattedEntry = `${Intl.DateTimeFormat('en-US', {
      dateStyle: 'short',
      timeStyle: 'short',
      timeZone: 'Africa/Nairobi',
    }).format(new Date())} - IP: ${ip || 'unknown'} - ${entry}\n`;

    try {
      await fsPromises.appendFile(
        path.join(this.logsPath, this.logFile),
        formattedEntry,
      );
    } catch (e) {
      if (e instanceof Error) console.error(e.message);
    }
  }
  error(message: string | Error, context?: string, ip?: string) {
    const errorMessage = message instanceof Error ? message.message : message;
    const entry = `${context ? `[${context}]` : ''}${errorMessage}`;
    this.logToFile(entry, ip);
    super.error(errorMessage, context);
  }

  log(message: string, context?: string, ip?: string) {
    const entry = `${context ? `[${context}]` : ''}${message}`;
    this.logToFile(entry, ip);
    super.log(message, context);
  }

  warn(message: string, context?: string, ip?: string) {
    const entry = context ? `${context} \t${message}` : message;
    this.logToFile(entry, ip);
    super.warn(message, context);
  }
}
