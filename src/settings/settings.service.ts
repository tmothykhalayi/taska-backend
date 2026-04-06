import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Setting } from './entities/setting.entity';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { TaskPriority } from '../tasks/entities/task.entity';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(Setting)
    private readonly settingsRepository: Repository<Setting>,
  ) {}

  private getAvailableTimezones(): string[] {
    const intlWithSupportedValues = Intl as Intl.DateTimeFormatOptions & {
      supportedValuesOf?: (key: string) => string[];
    };

    if (typeof intlWithSupportedValues.supportedValuesOf === 'function') {
      return intlWithSupportedValues.supportedValuesOf('timeZone');
    }

    const runtimeTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return runtimeTimezone ? [runtimeTimezone] : [];
  }

  private getWeekdays(): string[] {
    const referenceDate = new Date(Date.UTC(2026, 0, 5));
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(referenceDate);
      date.setUTCDate(referenceDate.getUTCDate() + index);
      return new Intl.DateTimeFormat(undefined, { weekday: 'long' }).format(date);
    });
  }

  private getDefaultSettings() {
    const timezones = this.getAvailableTimezones();
    const weeklySummaryDays = this.getWeekdays();
    const priorities = Object.values(TaskPriority);

    return {
      platformSettings: {
        workspaceName: process.env.APP_NAME || process.env.npm_package_name || '',
        timezone: timezones[0] || '',
        defaultTaskPriority: priorities[0] || TaskPriority.MEDIUM,
        reminderCadenceHours: Number(process.env.DEFAULT_REMINDER_CADENCE_HOURS || 24),
        overdueThresholdDays: Number(process.env.DEFAULT_OVERDUE_THRESHOLD_DAYS || 2),
        autoArchiveCompletedDays: Number(process.env.DEFAULT_ARCHIVE_COMPLETED_DAYS || 30),
      },
      notificationSettings: {
        emailDigest: String(process.env.DEFAULT_EMAIL_DIGEST || 'true') === 'true',
        dueSoonAlerts: String(process.env.DEFAULT_DUE_SOON_ALERTS || 'true') === 'true',
        overdueEscalation: String(process.env.DEFAULT_OVERDUE_ESCALATION || 'true') === 'true',
        weeklySummaryDay: weeklySummaryDays[0] || '',
      },
      securitySettings: {
        enforceTwoFactor: String(process.env.DEFAULT_ENFORCE_2FA || 'false') === 'true',
        sessionTimeoutMinutes: Number(process.env.DEFAULT_SESSION_TIMEOUT_MINUTES || 45),
        passwordRotationDays: Number(process.env.DEFAULT_PASSWORD_ROTATION_DAYS || 90),
        loginAttemptLimit: Number(process.env.DEFAULT_LOGIN_ATTEMPT_LIMIT || 5),
      },
    };
  }

  private async ensureSettings(): Promise<Setting> {
    const existing = await this.settingsRepository.findOne({ where: { id: 1 } });
    if (existing) return existing;

    const defaults = this.getDefaultSettings();
    const created = this.settingsRepository.create({
      id: 1,
      platformSettings: defaults.platformSettings,
      notificationSettings: defaults.notificationSettings,
      securitySettings: defaults.securitySettings,
    });
    return this.settingsRepository.save(created);
  }

  async getSettings() {
    const settings = await this.ensureSettings();

    return {
      platformSettings: settings.platformSettings,
      notificationSettings: settings.notificationSettings,
      securitySettings: settings.securitySettings,
      options: {
        timezones: this.getAvailableTimezones(),
        taskPriorities: Object.values(TaskPriority),
        weeklySummaryDays: this.getWeekdays(),
      },
      updatedAt: settings.updatedAt,
    };
  }

  async updateSettings(updateSettingsDto: UpdateSettingsDto) {
    const settings = await this.ensureSettings();

    settings.platformSettings = {
      ...settings.platformSettings,
      ...(updateSettingsDto.platformSettings || {}),
    };
    settings.notificationSettings = {
      ...settings.notificationSettings,
      ...(updateSettingsDto.notificationSettings || {}),
    };
    settings.securitySettings = {
      ...settings.securitySettings,
      ...(updateSettingsDto.securitySettings || {}),
    };

    await this.settingsRepository.save(settings);
    return this.getSettings();
  }
}
