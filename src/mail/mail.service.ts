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
        subject: 'New Login to Your Healthcare Connect Account',
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
    } catch (error) {
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
        subject: 'Password Reset Request - Healthcare Connect',
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
    } catch (error) {
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
        template: 'password-reset-success',
        context: {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          resetTime: new Date().toLocaleString(),
        },
      });

      this.logger.log(`Password reset success email sent to ${user.email}`);
    } catch (error) {
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
        subject: 'Welcome to Healthcare Connect!',
        template: 'welcome',
        context: {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
        },
      });

      this.logger.log(`Welcome email sent to ${user.email}`);
    } catch (error) {
      this.logger.error(
        `Failed to send welcome email to ${user.email}: ${error.message}`,
      );
      // Don't throw error to avoid breaking registration flow
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
    } catch (error) {
      this.logger.error(
        `Failed to send security alert to ${user.email}: ${error.message}`,
      );
    }
  }

  /**
   * Send appointment confirmation email
   */
  async sendAppointmentConfirmation(appointmentData: {
    patientEmail: string;
    patientFirstName: string;
    patientLastName: string;
    therapistName: string;
    appointmentDate: string;
    startTime: string;
    endTime: string;
    duration: number;
    status: string;
    isOnline: boolean;
    meetingLink?: string;
    notes?: string;
  }): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to: appointmentData.patientEmail,
        subject: 'Appointment Confirmed - Healthcare Connect',
        template: 'appointment-confirmation',
        context: {
          patientFirstName: appointmentData.patientFirstName,
          patientLastName: appointmentData.patientLastName,
          therapistName: appointmentData.therapistName,
          appointmentDate: appointmentData.appointmentDate,
          startTime: appointmentData.startTime,
          endTime: appointmentData.endTime,
          duration: appointmentData.duration,
          status: appointmentData.status,
          isOnline: appointmentData.isOnline,
          meetingLink: appointmentData.meetingLink,
          notes: appointmentData.notes,
          portalUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
        },
      });

      this.logger.log(
        `Appointment confirmation sent to ${appointmentData.patientEmail}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send appointment confirmation to ${appointmentData.patientEmail}: ${error.message}`,
      );
      // Don't throw to avoid breaking appointment creation
    }
  }

  /**
   * Send appointment cancellation email
   */
  async sendAppointmentCancellation(appointmentData: {
    patientEmail: string;
    patientFirstName: string;
    patientLastName: string;
    therapistName: string;
    appointmentDate: string;
    startTime: string;
    endTime: string;
    cancelReason?: string;
  }): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to: appointmentData.patientEmail,
        subject: 'Appointment Cancelled - Healthcare Connect',
        template: 'appointment-cancelled',
        context: {
          patientFirstName: appointmentData.patientFirstName,
          patientLastName: appointmentData.patientLastName,
          therapistName: appointmentData.therapistName,
          appointmentDate: appointmentData.appointmentDate,
          startTime: appointmentData.startTime,
          endTime: appointmentData.endTime,
          cancelReason: appointmentData.cancelReason,
          portalUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
        },
      });

      this.logger.log(
        `Appointment cancellation sent to ${appointmentData.patientEmail}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send appointment cancellation to ${appointmentData.patientEmail}: ${error.message}`,
      );
      // Don't throw to avoid breaking appointment cancellation
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
    } catch (error) {
      this.logger.error(
        `Failed to send custom mail to ${options.to}: ${error.message}`,
      );
      throw error;
    }
  }
}
