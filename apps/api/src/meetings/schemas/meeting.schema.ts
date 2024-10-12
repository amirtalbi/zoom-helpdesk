import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type MeetingDocument = Meeting & Document;

@Schema()
export class Meeting {
  @Prop({ required: true })
  meetingId: string;

  @Prop({ required: true })
  topic: string;

  @Prop({ required: true })
  startTime: Date;

  @Prop({ required: true })
  duration: number;

  @Prop({ required: true })
  status: string;

  @Prop({ type: [String], required: true })
  invitedUsers: string[];
}

export const MeetingSchema = SchemaFactory.createForClass(Meeting);