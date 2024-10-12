import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TicketsService } from './ticket.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@Controller('tickets')
export class TicketsController {
  constructor(private ticketsService: TicketsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'user')
  @Get()
  findAll(@Query() query: any) {
    return this.ticketsService.findAll(query);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'user')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ticketsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'user')
  @Post()
  create(@Body() createTicketDto: CreateTicketDto) {
    return this.ticketsService.create(createTicketDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'user')
  @Put(':id')
  update(@Param('id') id: string, @Body() updateTicketDto: UpdateTicketDto) {
    return this.ticketsService.update(id, updateTicketDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.ticketsService.delete(id);
  }
}
