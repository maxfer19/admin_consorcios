import { Module } from '@nestjs/common';
import { TimeslotsService } from './timeslots.service';
import { TimeslotsController } from './timeslots.controller';

@Module({
  controllers: [TimeslotsController],
  providers: [TimeslotsService],
  exports: [TimeslotsService],
})
export class TimeslotsModule {}
