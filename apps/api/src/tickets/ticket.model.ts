export class Ticket {
    ticketId: number;
    title: string;
    description: string;
    status: 'open' | 'in-progress' | 'resolved' | 'closed';
    assignedTo: number;
  }