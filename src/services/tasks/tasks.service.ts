import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SongsService } from '../songs/songs.service';

@Injectable()
export class TasksService {
  constructor(private readonly songService: SongsService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, {
    name: 'daily-trending-update',
    disabled: process.env.NODE_ENV == 'development', // Disable in dev
  })
  async handleDailyTrendingUpdate() {
    try {
      const results = await this.songService.calculateTrendingScores();
      console.log(`Updated ${results.length} trending songs at ${new Date()}`);
    } catch (error) {
      console.error('Error updating trending scores:', error);
    }
  }

  // Development job (runs every 10 minutes)
  @Cron('*/20 * * * *', {
    name: 'dev-trending-update',
    disabled: process.env.NODE_ENV !== 'development', // Only in dev
  })
  async handleDevTrendingUpdate() {
    console.log('[DEV] Running trending update...');
    await this.songService.calculateTrendingScores();
  }
}
