import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { TasksModule } from './tasks/tasks.module';
import { StreaksModule } from './streaks/streaks.module';
import { BadgesModule } from './badges/badges.module';
import { QuotesModule } from './quotes/quotes.module';

@Module({
  imports: [UsersModule, TasksModule, StreaksModule, BadgesModule, QuotesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
