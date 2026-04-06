import { Module, Global } from '@nestjs/common';
import { LogsService } from './logs.service';

@Global() // Make it available globally
@Module({
  providers: [LogsService],
  exports: [LogsService],
})
export class LogsModule {}
