import { Controller, Post, Body } from '@nestjs/common';
import { ZoomService } from './zoom.service';

@Controller('zoom')
export class ZoomController {
  constructor(private readonly zoomService: ZoomService) {}

  @Post('create-meeting')
  async createMeeting(
    @Body('topic') topic: string,
    @Body('startTime') startTime: string,
    @Body('duration') duration: number,
  ) {
    return this.zoomService.createMeeting(topic, startTime, duration);
  }
}