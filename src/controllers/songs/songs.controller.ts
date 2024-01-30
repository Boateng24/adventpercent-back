import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SongDto } from 'src/Dtos/songs.dto';
import { SongsService } from 'src/services/songs/songs.service';

@Controller('songs')
export class SongsController {
  constructor(private readonly Songservice: SongsService) {}

  @Post('/createSong')
  async newSong(@Body() body: SongDto) {
    return await this.Songservice.createSong(body);
  }

  @Get('/recommended')
  async recommendedSongs() {
    return await this.Songservice.recommendedSongs();
  }

  @Get('/song/:id')
  async findSongById(@Param('id') id: string) {
    return await this.Songservice.getSongById(id);
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async trendingCron() {
    return await this.Songservice.getWeeklyTrendingSongs();
  }

  @Get('/trendings')
  async getTrendingSongs() {
    return await this.Songservice.getWeeklyTrendingSongs();
  }
}
