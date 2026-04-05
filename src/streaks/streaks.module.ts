import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StreaksService } from './streaks.service';
import { StreaksController } from './streaks.controller';
import { Streak } from './entities/streak.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Streak]), UsersModule],
  controllers: [StreaksController],
  providers: [StreaksService],
})
export class StreaksModule {}