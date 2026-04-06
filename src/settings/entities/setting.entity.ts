import { Column, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class Setting {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'jsonb', default: {} })
  platformSettings!: {
    workspaceName: string;
    timezone: string;
    defaultTaskPriority: 'high' | 'medium' | 'low';
    reminderCadenceHours: number;
    overdueThresholdDays: number;
    autoArchiveCompletedDays: number;
  };

  @Column({ type: 'jsonb', default: {} })
  notificationSettings!: {
    emailDigest: boolean;
    dueSoonAlerts: boolean;
    overdueEscalation: boolean;
    weeklySummaryDay: string;
  };

  @Column({ type: 'jsonb', default: {} })
  securitySettings!: {
    enforceTwoFactor: boolean;
    sessionTimeoutMinutes: number;
    passwordRotationDays: number;
    loginAttemptLimit: number;
  };

  @UpdateDateColumn()
  updatedAt!: Date;
}
