import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Badge } from './entities/badge.entity';
import { CreateBadgeDto } from './dto/create-badge.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class BadgesService {
  constructor(
    @InjectRepository(Badge)
    private readonly badgeRepository: Repository<Badge>,
    private readonly usersService: UsersService,
  ) {}

  async create(createBadgeDto: CreateBadgeDto): Promise<Badge> {
    const user = await this.usersService.findOne(createBadgeDto.userId);
    const badge = this.badgeRepository.create({ ...createBadgeDto, user });
    return this.badgeRepository.save(badge);
  }

  findAll(): Promise<Badge[]> {
    return this.badgeRepository.find({ relations: ['user'] });
  }

  async findByUser(userId: number): Promise<Badge[]> {
    return this.badgeRepository.find({ where: { user: { id: userId } }, relations: ['user'] });
  }

  async remove(id: number): Promise<void> {
    const badge = await this.badgeRepository.findOne({ where: { id } });
    if (!badge) throw new NotFoundException(`Badge with id ${id} not found`);
    await this.badgeRepository.remove(badge);
  }

  // Assign badge based on streak
  async assignBadge(userId: number, streakDays: number): Promise<Badge | null> {
    const milestones = [3, 7, 14]; // example milestones
    const earnedMilestone = milestones.find(m => m === streakDays);
    if (!earnedMilestone) return null;

    const existing = await this.badgeRepository.findOne({
      where: { user: { id: userId }, milestone: earnedMilestone },
    });
    if (existing) return existing; // badge already assigned

    const user = await this.usersService.findOne(userId);
    const badge = this.badgeRepository.create({
      name: `${earnedMilestone}-Day Streak`,
      description: `Completed a ${earnedMilestone}-day streak!`,
      milestone: earnedMilestone,
      user,
    });
    return this.badgeRepository.save(badge);
  }
}