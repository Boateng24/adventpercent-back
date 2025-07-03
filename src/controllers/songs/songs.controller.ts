import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { SongDto } from 'src/Dtos/songs.dto';
import { SongsService } from 'src/services/songs/songs.service';
import { BadRequestException } from '@nestjs/common';

@Controller('songs')
export class SongsController {
  constructor(private readonly Songservice: SongsService) {}

  @Post('/createSong')
  async newSong(@Body() body: SongDto) {
    return await this.Songservice.createSong(body);
  }

  @Get('/recommended')
  async recommendedSongs(
    @Query('page') page: number,
    @Query('size') size: number,
    @Res() response,
  ) {
    const defaultPage = 1;
    const defaultSize = 20;

    page = page || defaultPage;
    size = size || defaultSize;
    const limit = parseInt(size as any, 20);
    const skip = (page - 1) * limit;
    const songs = await this.Songservice.allSongs(limit, skip);
    return response.status(HttpStatus.OK).json({ page, limit, data: songs });
  }

  @Get('/song/:id')
  async findSongById(@Param('id') id: string) {
    return await this.Songservice.getSongById(id);
  }

  @Post('/interaction')
  async recordInteraction(@Body() body: { songId: string; type: string }) {
    const validTypes = ['play', 'skip', 'share', 'favorite', 'playlistAdd'];
    if (!validTypes.includes(body.type)) {
      throw new BadRequestException('Invalid interaction type');
    }

    await this.Songservice.recordInteraction(body.songId, body.type as any);
    return { success: true };
  }

  @Get('/trending')
  async getTrendingSongs(@Query('limit') limit: number) {
    return await this.Songservice.getWeeklyTrendingSongs(limit);
  }

  @Get('/search')
  async searchSongs(@Query('q') query: string) {
    if (!query || query.length < 2) {
      return [];
    }

    return this.Songservice.searchSongs(query);
  }
}
