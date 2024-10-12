export class CreateMeetingDto {
    readonly topic: string;
    readonly startTime: Date;
    readonly duration: number;
    readonly invitedUsers: string[];
  }