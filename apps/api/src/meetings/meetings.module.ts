import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Meeting, MeetingSchema } from './schemas/meeting.schema';
import { NotificationsModule } from '../notifications/notifications.module';
import { ZoomModule } from '../zoom/zoom.module';
import { MeetingsService } from './meetings.service';
import { MeetingsController } from './meetings.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Meeting.name, schema: MeetingSchema }]),
    NotificationsModule,
    ZoomModule,
  ],
  providers: [MeetingsService],
  controllers: [MeetingsController],
})
export class MeetingsModule {}