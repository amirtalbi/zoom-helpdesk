import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    MessageBody,
  } from '@nestjs/websockets';
  import { Server } from 'socket.io';
  
  @WebSocketGateway()
  export class NotificationsGateway {
    @WebSocketServer()
    server: Server;
  
    sendNotification(event: string, data: any) {
      this.server.emit(event, data);
    }
  }