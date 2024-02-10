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
    const songs = await this.Songservice.recommendedSongs(limit, skip);
    return response.status(HttpStatus.OK).json({ page, limit, data: songs });
  }

  @Get('/song/:id')
  async findSongById(@Param('id') id: string) {
    return await this.Songservice.getSongById(id);
  }

  @Get('/trendings')
  async getTrendingSongs() {
    return await this.Songservice.getWeeklyTrendingSongs();
  }
}
