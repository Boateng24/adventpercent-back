import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SongsService } from '../songs/songs.service';

@Injectable()
export class TasksService {
  constructor(private readonly songService: SongsService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCron() {
    // Logic to update trending songs
    const trendingSongs = await this.songService.getWeeklyTrendingSongs();
    // Potentially update a cache or a database with the trending songs
    console.log('Trending songs updated at midnight:', trendingSongs);
  }
}
