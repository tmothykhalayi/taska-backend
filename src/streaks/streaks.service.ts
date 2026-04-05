import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Streak } from './entities/streak.entity';
import { CreateStreakDto } from './dto/create-streak.dto';
import { UpdateStreakDto } from './dto/update-streak.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class StreaksService {
  constructor(
    @InjectRepository(Streak)
    private readonly streakRepository: Repository<Streak>,
    private readonly usersService: UsersService,
  ) {}

  async create(createStreakDto: CreateStreakDto): Promise<Streak> {
    const user = await this.usersService.findOne(createStreakDto.userId);
    const streak = this.streakRepository.create({ ...createStreakDto, user });
    streak.currentStreak = 1;
    streak.longestStreak = 1;
    return this.streakRepository.save(streak);
  }

  findAll(): Promise<Streak[]> {
    return this.streakRepository.find({ relations: ['user'] });
  }

  async findOne(id: number): Promise<Streak> {
    const streak = await this.streakRepository.findOne({ where: { id }, relations: ['user'] });
    if (!streak) throw new NotFoundException(`Streak with id ${id} not found`);
    return streak;
  }

  async updateStreak(userId: number, completedToday: boolean): Promise<Streak> {
    const streak = await this.streakRepository.findOne({ where: { user: { id: userId } }, relations: ['user'] });
    if (!streak) throw new NotFoundException(`Streak for user ${userId} not found`);

    const today = new Date().toISOString().split('T')[0]; // yyyy-mm-dd
    if (completedToday) {
      if (streak.lastCompletedDate === today) return streak; // already updated today

      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]; 
      if (streak.lastCompletedDate === yesterday) {
        streak.currentStreak += 1;
      } else {
        streak.currentStreak = 1;
      }

      if (streak.currentStreak > streak.longestStreak) streak.longestStreak = streak.currentStreak;
      streak.lastCompletedDate = today;
      return this.streakRepository.save(streak);
    }
    return streak;
  }

  async remove(id: number): Promise<void> {
    const streak = await this.findOne(id);
    await this.streakRepository.remove(streak);
  }
}