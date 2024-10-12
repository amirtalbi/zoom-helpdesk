import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Meeting, MeetingDocument } from './schemas/meeting.schema';
import { NotificationsService } from '../notifications/notifications.service';
import { ZoomService } from '../zoom/zoom.service';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { UpdateMeetingDto } from './dto/update-meeting.dto';

@Injectable()
export class MeetingsService {
  constructor(
    @InjectModel(Meeting.name) private meetingModel: Model<MeetingDocument>,
    private notificationsService: NotificationsService,
    private zoomService: ZoomService,
  ) {}

  async create(createMeetingDto: CreateMeetingDto): Promise<Meeting> {
    const zoomMeeting = await this.zoomService.createMeeting(
      createMeetingDto.topic,
      createMeetingDto.startTime.toISOString(),
      createMeetingDto.duration,
    );

    const meeting = new this.meetingModel({
      ...createMeetingDto,
      meetingId: zoomMeeting.id,
      status: 'scheduled',
    });

    const savedMeeting = await meeting.save();

    await this.notificationsService.sendEmail(
      createMeetingDto.invitedUsers.join(', '),
      'New Meeting Scheduled',
      `A new meeting has been scheduled: ${createMeetingDto.topic}`,
    );

    return savedMeeting;
  }

  async update(id: string, updateMeetingDto: UpdateMeetingDto): Promise<Meeting> {
    const updatedMeeting = await this.meetingModel
      .findByIdAndUpdate(id, updateMeetingDto, { new: true })
      .exec();

    await this.notificationsService.sendEmail(
      updatedMeeting.invitedUsers.join(', '),
      'Meeting Updated',
      `The meeting "${updatedMeeting.topic}" has been updated.`,
    );

    return updatedMeeting;
  }

  async delete(id: string): Promise<Meeting> {
    const deletedMeeting = await this.meetingModel.findByIdAndDelete(id).exec();

    await this.notificationsService.sendEmail(
      deletedMeeting.invitedUsers.join(', '),
      'Meeting Cancelled',
      `The meeting "${deletedMeeting.topic}" has been cancelled.`,
    );

    return deletedMeeting;
  }
}