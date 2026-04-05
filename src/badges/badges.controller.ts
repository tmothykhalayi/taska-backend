import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { BadgesService } from './badges.service';
import { CreateBadgeDto } from './dto/create-badge.dto';

@Controller('badges')
export class BadgesController {
  constructor(private readonly badgesService: BadgesService) {}

  @Post()
  create(@Body() createBadgeDto: CreateBadgeDto) {
    return this.badgesService.create(createBadgeDto);
  }

  @Get()
  findAll() {
    return this.badgesService.findAll();
  }

  @Get('user/:userId')
  findByUser(@Param('userId') userId: string) {
    return this.badgesService.findByUser(+userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.badgesService.remove(+id);
  }
}