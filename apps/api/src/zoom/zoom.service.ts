import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ZoomService {
  private readonly zoomApiUrl = 'https://api.zoom.us/v2';

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  private async getAccessToken(): Promise<string> {
    const clientId = this.configService.get<string>('ZOOM_CLIENT_ID');
    const clientSecret = this.configService.get<string>('ZOOM_CLIENT_SECRET');
    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    const response = await firstValueFrom(
      this.httpService.post(
        'https://zoom.us/oauth/token',
        null,
        {
          params: {
            grant_type: 'client_credentials',
          },
          headers: {
            Authorization: `Basic ${auth}`,
          },
        },
      ),
    );

    return response.data.access_token;
  }

  async createMeeting(topic: string, startTime: string, duration: number): Promise<any> {
    const accessToken = await this.getAccessToken();

    const response = await firstValueFrom(
      this.httpService.post(
        `${this.zoomApiUrl}/users/me/meetings`,
        {
          topic,
          type: 2, // Scheduled meeting
          start_time: startTime,
          duration,
          settings: {
            join_before_host: true,
            mute_upon_entry: true,
            waiting_room: false,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      ),
    );

    return response.data;
  }
}