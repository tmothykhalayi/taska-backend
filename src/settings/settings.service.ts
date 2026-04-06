import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Setting } from './entities/setting.entity';
import { UpdateSettingsDto } from './dto/update-settings.dto';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(Setting)
    private readonly settingsRepository: Repository<Setting>,
  ) {}

  private async ensureSettings(): Promise<Setting> {
    const existing = await this.settingsRepository.findOne({ where: { id: 1 } });
    if (existing) return existing;

    const created = this.settingsRepository.create({ id: 1 });
    return this.settingsRepository.save(created);
  }

  async getSettings() {
    const settings = await this.ensureSettings();

    return {
      platformSettings: settings.platformSettings,
      notificationSettings: settings.notificationSettings,
      securitySettings: settings.securitySettings,
      options: {
        timezones: ['UTC', 'Africa/Accra', 'Europe/London', 'America/New_York'],
        taskPriorities: ['high', 'medium', 'low'],
        weeklySummaryDays: ['Monday', 'Wednesday', 'Friday', 'Sunday'],
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
