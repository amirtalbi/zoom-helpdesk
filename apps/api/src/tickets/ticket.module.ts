import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TicketsService } from './ticket.service';
import { TicketsController } from './ticket.controller';
import { Ticket, TicketSchema } from './schemas/ticket.schema';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Ticket.name, schema: TicketSchema }]),
    NotificationsModule,
  ],
  providers: [TicketsService],
  controllers: [TicketsController],
})
export class TicketsModule {}
