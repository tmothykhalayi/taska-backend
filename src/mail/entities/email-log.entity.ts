import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum EmailStatus {
  PENDING = 'pending',
  SENT = 'sent',
  FAILED = 'failed',
  BOUNCED = 'bounced',
}

export enum EmailType {
  APPOINTMENT_CONFIRMATION = 'appointment_confirmation',
  APPOINTMENT_REMINDER = 'appointment_reminder',
  APPOINTMENT_CANCELLED = 'appointment_cancelled',
  PASSWORD_RESET = 'password_reset',
  WELCOME = 'welcome',
  PAYMENT_RECEIPT = 'payment_receipt',
  SESSION_REMINDER = 'session_reminder',
  ASSESSMENT_RESULT = 'assessment_result',
  SECURITY_ALERT = 'security_alert',
  LOGIN_NOTIFICATION = 'login_notification',
}

/**
 * EmailLog Entity
 * Event-driven email tracking system
 * Logs all emails sent through the platform
 */
@Entity('email_logs')
export class EmailLog {
  @PrimaryGeneratedColumn()
  id: number;

  // ========================================
  // USER RELATIONSHIP
  // ========================================

  @Column({ name: 'user_id', nullable: true })
  userId?: number;

  /**
   * Many EmailLogs → One User
   * Track which user received the email
   */
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user?: User;

  // ========================================
  // EMAIL DETAILS
  // ========================================

  @Column({ name: 'recipient_email' })
  recipientEmail: string;

  @Column({ name: 'recipient_name', nullable: true })
  recipientName?: string;

  @Column()
  subject: string;

  @Column({ type: 'enum', enum: EmailType })
  emailType: EmailType;

  @Column({ type: 'text', nullable: true })
  body?: string;

  @Column({ type: 'text', nullable: true })
  htmlBody?: string;

  // ========================================
  // STATUS TRACKING
  // ========================================

  @Column({ type: 'enum', enum: EmailStatus, default: EmailStatus.PENDING })
  status: EmailStatus;

  @Column({ name: 'sent_at', type: 'timestamp', nullable: true })
  sentAt?: Date;

  @Column({ name: 'delivered_at', type: 'timestamp', nullable: true })
  deliveredAt?: Date;

  @Column({ name: 'opened_at', type: 'timestamp', nullable: true })
  openedAt?: Date;

  @Column({ name: 'clicked_at', type: 'timestamp', nullable: true })
  clickedAt?: Date;

  // ========================================
  // ERROR HANDLING
  // ========================================

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage?: string;

  @Column({ name: 'retry_count', type: 'int', default: 0 })
  retryCount: number;

  @Column({ name: 'max_retries', type: 'int', default: 3 })
  maxRetries: number;

  // ========================================
  // METADATA
  // ========================================

  @Column({ type: 'jsonb', nullable: true })
  metadata?: {
    appointmentId?: number;
    billingId?: number;
    assessmentId?: number;
    templateName?: string;
    variables?: Record<string, any>;
  };

  @Column({ name: 'provider', nullable: true })
  provider?: string; // e.g., 'smtp', 'sendgrid', 'ses'

  @Column({ name: 'message_id', nullable: true })
  messageId?: string; // Provider's message ID

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
