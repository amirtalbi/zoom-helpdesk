import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TicketDocument = Ticket & Document;

@Schema({ timestamps: true })
export class Ticket {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({
    required: true,
    enum: ['open', 'in-progress', 'resolved', 'closed'],
    default: 'open',
  })
  status: string;

  @Prop({ required: true })
  assignedTo: string; // User ID
}

export const TicketSchema = SchemaFactory.createForClass(Ticket);
