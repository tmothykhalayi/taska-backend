import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BadgesService } from './badges.service';
import { BadgesController } from './badges.controller';
import { Badge } from './entities/badge.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Badge]), UsersModule],
  controllers: [BadgesController],
  providers: [BadgesService],
})
export class BadgesModule {}