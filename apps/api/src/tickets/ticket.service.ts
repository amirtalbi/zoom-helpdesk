import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Ticket, TicketDocument } from './schemas/ticket.schema';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { NotificationsService } from 'src/notifications/notifications.service';
import { NotificationsGateway } from 'src/notifications/notifications.gateway';

@Injectable()
export class TicketsService {
  constructor(
    @InjectModel(Ticket.name) private ticketModel: Model<TicketDocument>,
    private notificationsService: NotificationsService,
    private notificationsGateway: NotificationsGateway,
  ) {}

  async findAll(query: any): Promise<Ticket[]> {
    const {
      page = 1,
      limit = 10,
      status,
      assignedTo,
      search,
      startDate,
      endDate,
    } = query;
    const filters: any = {};

    if (status) {
      filters.status = status;
    }

    if (assignedTo) {
      filters.assignedTo = assignedTo;
    }

    if (search) {
      filters.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (startDate || endDate) {
      filters.createdAt = {};
      if (startDate) {
        filters.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        filters.createdAt.$lte = new Date(endDate);
      }
    }

    return this.ticketModel
      .find(filters)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .exec();
  }

  async findOne(id: string): Promise<Ticket> {
    return this.ticketModel.findById(id).exec();
  }

  async create(createTicketDto: CreateTicketDto): Promise<Ticket> {
    const ticket = new this.ticketModel(createTicketDto);
    const savedTicket = await ticket.save();
    await this.notificationsService.sendEmail(
      savedTicket.assignedTo,
      'New Ticket Assigned',
      `A new ticket has been assigned to you: ${savedTicket.title}`,
    );
    this.notificationsGateway.sendNotification('ticketAssigned', savedTicket);
    return savedTicket;
  }

  async update(id: string, updateTicketDto: UpdateTicketDto): Promise<Ticket> {
    const updatedTicket = await this.ticketModel
      .findByIdAndUpdate(id, updateTicketDto, { new: true })
      .exec();
    await this.notificationsService.sendEmail(
      updatedTicket.assignedTo,
      'Ticket Updated',
      `The ticket "${updatedTicket.title}" has been updated.`,
    );
    this.notificationsGateway.sendNotification('ticketUpdated', updatedTicket);
    return updatedTicket;
  }

  async delete(id: string): Promise<Ticket> {
    const deletedTicket = await this.ticketModel.findByIdAndDelete(id).exec();
    this.notificationsGateway.sendNotification('ticketDeleted', deletedTicket);
    return deletedTicket;
  }
}
