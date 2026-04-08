import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { User } from '../users/entities/user.entity';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private smtpCooldownUntil = 0;
  private readonly inFlightPasswordResetEmails = new Set<string>();
  private readonly inFlightWelcomeEmails = new Set<string>();

  private getSmtpCooldownMs(): number {
    return Number(process.env.MAIL_COOLDOWN_MS || 300000);
  }

  private isTransientSmtpError(error: any): boolean {
    const message = String(error?.message || '').toLowerCase();
    const code = String(error?.code || '').toUpperCase();

    return (
      message.includes('connection timeout') ||
      message.includes('enetunreach') ||
      message.includes('ehostunreach') ||
      message.includes('etimedout') ||
      code === 'ENETUNREACH' ||
      code === 'EHOSTUNREACH' ||
      code === 'ETIMEDOUT'
    );
  }

  constructor(private readonly mailerService: MailerService) {}

  /**
   * Send login notification email
   */
  async sendLoginNotification(
    user: User,
    loginTime: Date,
    ipAddress?: string,
  ): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to: user.email,
        subject: 'New Login to Your Taska Account',
        template: 'login-notification',
        context: {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          loginTime: loginTime.toLocaleString(),
          ipAddress: ipAddress || 'Unknown',
          role: user.role,
        },
      });

      this.logger.log(`Login notification sent to ${user.email}`);
    } catch (error: any) {
      this.logger.error(
        `Failed to send login notification to ${user.email}: ${error.message}`,
      );
    }
  }

  /**
   * Send password reset OTP email
   */
  async sendPasswordResetEmail(user: User, otp: string): Promise<void> {
    if (Date.now() < this.smtpCooldownUntil) {
      const resumeAt = new Date(this.smtpCooldownUntil).toISOString();
      this.logger.warn(
        `Skipping password reset email for ${user.email}; SMTP cooldown active until ${resumeAt}`,
      );
      return;
    }

    if (this.inFlightPasswordResetEmails.has(user.email)) {
      this.logger.warn(
        `Skipping password reset email for ${user.email}; a previous send is still in progress`,
      );
      return;
    }

    this.inFlightPasswordResetEmails.add(user.email);

    try {
      this.logger.debug(
        `Attempting to send password reset email to ${user.email}`,
      );
      await this.mailerService.sendMail({
        to: user.email,
        subject: 'Password Reset Request - Taska',
        template: 'password-reset',
        context: {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          otp: otp,
          expiryMinutes: 4, // OTP expires in 4 minutes
        },
      });

      this.logger.log(`Password reset email sent to ${user.email}`);
    } catch (error: any) {
      if (this.isTransientSmtpError(error)) {
        this.smtpCooldownUntil = Date.now() + this.getSmtpCooldownMs();
        const resumeAt = new Date(this.smtpCooldownUntil).toISOString();
        this.logger.warn(
          `Transient SMTP failure while sending password reset email to ${user.email}. Cooling down until ${resumeAt}. Error: ${error.message}`,
        );
        return;
      }

      this.logger.error(
        `Failed to send password reset email to ${user.email}: ${error.message}`,
        error.stack,
      );
      throw new Error(
        `Failed to send password reset email: ${error.message}`,
      );
    } finally {
      this.inFlightPasswordResetEmails.delete(user.email);
    }
  }

  /**
   * Send password reset success email
   */
  async sendPasswordResetSuccessEmail(user: User): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to: user.email,
        subject: 'Password Successfully Reset - Taska',
        template: 'password-reset-success',
        context: {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          resetTime: new Date().toLocaleString(),
        },
      });

      this.logger.log(`Password reset success email sent to ${user.email}`);
    } catch (error: any) {
      this.logger.error(
        `Failed to send password reset success email to ${user.email}: ${error.message}`,
      );
      // Don't throw error to avoid breaking password reset flow
    }
  }

  /**
   * Send welcome email for new users
   */
  async sendWelcomeEmail(user: User): Promise<void> {
    if (Date.now() < this.smtpCooldownUntil) {
      const resumeAt = new Date(this.smtpCooldownUntil).toISOString();
      this.logger.warn(
        `Skipping welcome email for ${user.email}; SMTP cooldown active until ${resumeAt}`,
      );
      return;
    }

    if (this.inFlightWelcomeEmails.has(user.email)) {
      this.logger.warn(
        `Skipping welcome email for ${user.email}; a previous send is still in progress`,
      );
      return;
    }

    this.inFlightWelcomeEmails.add(user.email);

    try {
      await this.mailerService.sendMail({
        to: user.email,
        subject: 'Welcome to Taska!',
        template: 'welcome',
        context: {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
        },
      });

      this.logger.log(`Welcome email sent to ${user.email}`);
    } catch (error: any) {
      if (this.isTransientSmtpError(error)) {
        this.smtpCooldownUntil = Date.now() + this.getSmtpCooldownMs();
        const resumeAt = new Date(this.smtpCooldownUntil).toISOString();
        this.logger.warn(
          `Transient SMTP failure while sending welcome email to ${user.email}. Cooling down until ${resumeAt}. Error: ${error.message}`,
        );
        return;
      }

      this.logger.error(
        `Failed to send welcome email to ${user.email}: ${error.message}`,
      );
      // Don't throw error to avoid breaking registration flow
    } finally {
      this.inFlightWelcomeEmails.delete(user.email);
    }
  }

  /**
   * Send account security alert
   */
  async sendSecurityAlert(
    user: User,
    alertType: string,
    details: any,
  ): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to: user.email,
        subject: `Security Alert - ${alertType}`,
        template: 'security-alert',
        context: {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          alertType: alertType,
          details: details,
          alertTime: new Date().toLocaleString(),
        },
      });

      this.logger.log(`Security alert sent to ${user.email}`);
    } catch (error: any) {
      this.logger.error(
        `Failed to send security alert to ${user.email}: ${error.message}`,
      );
    }
  }

  /**
   * Send task reminder email
   */
  async sendTaskReminder(taskData: {
    userEmail: string;
    userFirstName: string;
    taskTitle: string;
    dueDate: string;
    priority?: string;
  }): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to: taskData.userEmail,
        subject: 'Task Reminder - Taska',
        template: 'task-reminder',
        context: {
          userFirstName: taskData.userFirstName,
          taskTitle: taskData.taskTitle,
          dueDate: taskData.dueDate,
          priority: taskData.priority || 'Normal',
          portalUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
        },
      });

      this.logger.log(`Task reminder sent to ${taskData.userEmail}`);
    } catch (error: any) {
      this.logger.error(
        `Failed to send task reminder to ${taskData.userEmail}: ${error.message}`,
      );
      // Don't throw to avoid breaking the reminder job
    }
  }

  /**
   * Send task assigned notification email
   */
  async sendTaskAssignedEmail(taskData: {
    assigneeEmail: string;
    assigneeFirstName: string;
    taskTitle: string;
    taskDescription?: string;
    dueDate?: string;
    priority?: string;
    assignedBy?: string;
  }): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to: taskData.assigneeEmail,
        subject: `New Task Assigned: ${taskData.taskTitle}`,
        template: 'task-assigned',
        context: {
          assigneeFirstName: taskData.assigneeFirstName,
          taskTitle: taskData.taskTitle,
          taskDescription: taskData.taskDescription || 'No description provided',
          dueDate: taskData.dueDate || 'No due date',
          priority: taskData.priority || 'Normal',
          assignedBy: taskData.assignedBy || 'Taska Admin',
          portalUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
        },
      });

      this.logger.log(`Task assigned email sent to ${taskData.assigneeEmail}`);
    } catch (error: any) {
      this.logger.error(
        `Failed to send task assigned email to ${taskData.assigneeEmail}: ${error.message}`,
      );
      // Don't throw to avoid breaking task creation
    }
  }

  /**
   * Send task completion notification email
   */
  async sendTaskCompletedEmail(taskData: {
    userEmail: string;
    userFirstName: string;
    taskTitle: string;
    completedDate?: string;
  }): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to: taskData.userEmail,
        subject: `Task Completed: ${taskData.taskTitle}`,
        template: 'task-completed',
        context: {
          userFirstName: taskData.userFirstName,
          taskTitle: taskData.taskTitle,
          completedDate: taskData.completedDate || new Date().toLocaleString(),
          portalUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
        },
      });

      this.logger.log(`Task completion email sent to ${taskData.userEmail}`);
    } catch (error: any) {
      this.logger.error(
        `Failed to send task completion email to ${taskData.userEmail}: ${error.message}`,
      );
      // Don't throw to avoid breaking task update
    }
  }

  /**
   * Send a custom email (for streaks, badges, etc)
   */
  async sendCustomMail(options: {
    to: string;
    subject: string;
    template: string;
    context: any;
  }): Promise<void> {
    try {
      await this.mailerService.sendMail(options);
      this.logger.log(`Custom mail sent to ${options.to}`);
    } catch (error: any) {
      this.logger.error(
        `Failed to send custom mail to ${options.to}: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Diagnostic method to verify SMTP configuration and connectivity
   */
  async testSmtpConnection(): Promise<{
    success: boolean;
    message: string;
    error?: string;
  }> {
    try {
      this.logger.log('Testing SMTP connection...');

      // Test with a simple verification email
      const testResult = await this.mailerService.sendMail({
        to: process.env.MAIL_USER || 'test@example.com',
        subject: 'SMTP Connection Test - Taska',
        text: 'If you receive this email, the SMTP connection is working correctly.',
        html: '<p>If you receive this email, the SMTP connection is working correctly.</p>',
      });

      this.logger.log('SMTP connection test successful');
      return {
        success: true,
        message: 'SMTP connection is working correctly',
      };
    } catch (error: any) {
      this.logger.error(`SMTP connection test failed: ${error.message}`, error.stack);
      return {
        success: false,
        message: 'SMTP connection test failed',
        error: error.message,
      };
    }
  }
}
