import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { StreaksService } from './streaks.service';
import { CreateStreakDto } from './dto/create-streak.dto';
import { UpdateStreakDto } from './dto/update-streak.dto';

@Controller('streaks')
export class StreaksController {
  constructor(private readonly streaksService: StreaksService) {}

  @Post()
  create(@Body() createStreakDto: CreateStreakDto) {
    return this.streaksService.create(createStreakDto);
  }

  @Get()
  findAll() {
    return this.streaksService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.streaksService.findOne(+id);
  }

  @Patch('update/:userId')
  updateStreak(@Param('userId') userId: string, @Body('completedToday') completedToday: boolean) {
    return this.streaksService.updateStreak(+userId, completedToday);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.streaksService.remove(+id);
  }
}