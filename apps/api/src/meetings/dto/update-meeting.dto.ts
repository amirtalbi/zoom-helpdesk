export class UpdateMeetingDto {
    readonly topic?: string;
    readonly startTime?: Date;
    readonly duration?: number;
    readonly invitedUsers?: string[];
  }