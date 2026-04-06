import { Column, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class Setting {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'jsonb', default: { workspaceName: 'Taska Workspace', timezone: 'UTC', defaultTaskPriority: 'medium', reminderCadenceHours: 24, overdueThresholdDays: 2, autoArchiveCompletedDays: 30 } })
  platformSettings!: {
    workspaceName: string;
    timezone: string;
    defaultTaskPriority: 'high' | 'medium' | 'low';
    reminderCadenceHours: number;
    overdueThresholdDays: number;
    autoArchiveCompletedDays: number;
  };

  @Column({ type: 'jsonb', default: { emailDigest: true, dueSoonAlerts: true, overdueEscalation: true, weeklySummaryDay: 'Friday' } })
  notificationSettings!: {
    emailDigest: boolean;
    dueSoonAlerts: boolean;
    overdueEscalation: boolean;
    weeklySummaryDay: string;
  };

  @Column({ type: 'jsonb', default: { enforceTwoFactor: false, sessionTimeoutMinutes: 45, passwordRotationDays: 90, loginAttemptLimit: 5 } })
  securitySettings!: {
    enforceTwoFactor: boolean;
    sessionTimeoutMinutes: number;
    passwordRotationDays: number;
    loginAttemptLimit: number;
  };

  @UpdateDateColumn()
  updatedAt!: Date;
}
