export type PlatformSettingsDto = {
  workspaceName?: string;
  timezone?: string;
  defaultTaskPriority?: 'high' | 'medium' | 'low';
  reminderCadenceHours?: number;
  overdueThresholdDays?: number;
  autoArchiveCompletedDays?: number;
};

export type NotificationSettingsDto = {
  emailDigest?: boolean;
  dueSoonAlerts?: boolean;
  overdueEscalation?: boolean;
  weeklySummaryDay?: string;
};

export type SecuritySettingsDto = {
  enforceTwoFactor?: boolean;
  sessionTimeoutMinutes?: number;
  passwordRotationDays?: number;
  loginAttemptLimit?: number;
};

export class UpdateSettingsDto {
  platformSettings?: PlatformSettingsDto;
  notificationSettings?: NotificationSettingsDto;
  securitySettings?: SecuritySettingsDto;
}
