import { Controller, Get, Param } from '@nestjs/common';
import { SongsService } from 'src/services/songs/songs.service';

@Controller('songs')
export class SongsController {
  constructor(private readonly Songservice: SongsService) {}

  @Get('/recommended')
  async recommendedSongs() {
    return await this.Songservice.recommendedSongs();
  }

  @Get('/song/:id')
  async findSongById(@Param('id') id: string) {
    return this.Songservice.getSongById(id);
  }
}
