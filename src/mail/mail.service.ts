import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { User } from '../users/entities/user.entity';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

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
        subject: 'New Login Detected - Property Management System',
        template: 'login-notification-property',
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
    try {
      await this.mailerService.sendMail({
        to: user.email,
        subject: 'Password Reset Request - Property Management System',
        template: 'password-reset-property',
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
      this.logger.error(
        `Failed to send password reset email to ${user.email}: ${error.message}`,
      );
      throw new Error('Failed to send password reset email');
    }
  }

  /**
   * Send password reset success email
   */
  async sendPasswordResetSuccessEmail(user: User): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to: user.email,
        subject: 'Password Successfully Reset - Healthcare Connect',
        template: 'password-reset-success-property',
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
    try {
      await this.mailerService.sendMail({
        to: user.email,
        subject: 'Welcome to Property Management System!',
        template: 'welcome-property',
        context: {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          status: user.status,
        },
      });

      this.logger.log(`Welcome email sent to ${user.email}`);
    } catch (error: any) {
      this.logger.error(
        `Failed to send welcome email to ${user.email}: ${error.message}`,
      );
      // Don't throw error to avoid breaking registration flow
    }
  }

  /**
   * Send welcome email with generated password for new users
   */
  async sendWelcomeEmailWithPassword(user: User, password: string): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to: user.email,
        subject: 'Welcome to Property Management System - Your Login Credentials',
        template: 'welcome-with-password',
        context: {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          status: user.status,
          password: password,
        },
      });

      this.logger.log(`Welcome email with credentials sent to ${user.email}`);
    } catch (error: any) {
      this.logger.error(
        `Failed to send welcome email with credentials to ${user.email}: ${error.message}`,
      );
      // Don't throw error to avoid breaking registration flow
    }
  }

  /**
   * Send rent reminder email
   */
  async sendRentReminder(
    email: string,
    tenantName: string,
    amount: number,
    dueDate: Date,
    unitInfo: string,
    isOverdue: boolean = false,
    daysBefore?: number
  ): Promise<void> {
    const daysBeforeValue = daysBefore || 0;
    const urgencyColor = isOverdue ? '#dc3545' : daysBeforeValue <= 3 ? '#ffc107' : '#28a745';
    const urgencyText = isOverdue 
      ? 'PAYMENT OVERDUE - IMMEDIATE ACTION REQUIRED'
      : daysBeforeValue <= 3 
      ? 'PAYMENT DUE SOON'
      : 'UPCOMING PAYMENT REMINDER';

    const subject = isOverdue 
      ? `URGENT: Overdue Rent Payment - ${unitInfo}`
      : `Rent Payment Reminder - ${unitInfo}`;

    await this.mailerService.sendMail({
      to: email,
      subject,
      template: 'rent-reminder',
      context: {
        tenantName,
        amount: amount.toFixed(2),
        dueDate: dueDate.toLocaleDateString(),
        unitInfo,
        isOverdue,
        daysBefore: daysBeforeValue,
        urgencyColor,
        urgencyText,
      },
    });
  }

  /**
   * Send payment confirmation email
   */
  async sendPaymentConfirmation(payment: any): Promise<void> {
    try {
      const tenant = payment.lease?.tenant || payment.payer;
      const unit = payment.lease?.unit;
      const property = unit?.property;
      
      const confirmationNumber = `PMS-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      
      await this.mailerService.sendMail({
        to: payment.payer.email,
        subject: `Payment Confirmation - ${unit?.unitNumber || 'Property Management System'}`,
        template: 'payment-confirmation',
        context: {
          tenantName: `${payment.payer.firstName} ${payment.payer.lastName}`,
          confirmationNumber,
          paymentDate: new Date(payment.paidDate).toLocaleDateString(),
          propertyInfo: property?.name || 'Property Management System',
          unitInfo: unit?.unitNumber || 'N/A',
          paymentPeriod: new Date(payment.paidDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
          baseAmount: Number(payment.amount).toFixed(2),
          lateFee: payment.lateFee > 0 ? Number(payment.lateFee).toFixed(2) : null,
          processingFee: payment.processingFee > 0 ? Number(payment.processingFee).toFixed(2) : null,
          totalAmount: payment.formattedTotalAmount || Number(payment.totalAmount || payment.amount).toFixed(2),
          paymentMethod: payment.method,
          transactionId: payment.transactionId || payment.referenceNumber,
          nextPaymentDue: null, // Can be calculated if lease information is available
          nextPaymentAmount: null, // Can be calculated if lease information is available
        },
      });

      this.logger.log(`Payment confirmation sent to ${payment.payer.email} for transaction ${payment.transactionId}`);
    } catch (error: any) {
      this.logger.error(
        `Failed to send payment confirmation to ${payment.payer.email}: ${error.message}`,
      );
      throw error;
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
        template: 'security-alert-property',
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
   * Send a custom email (for appointment notifications, etc)
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
}
