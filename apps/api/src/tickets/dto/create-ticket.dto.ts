export class CreateTicketDto {
  readonly title: string;
  readonly description: string;
  readonly status: string;
  readonly assignedTo: string;
}
