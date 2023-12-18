import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { songParams } from 'src/Dtos/songs.dto';
import { DbPrismaService } from 'src/db-prisma/db-prisma.service';

@Injectable()
export class SongsService {
  constructor(private readonly prisma: DbPrismaService) {}

  async recommendedSongs() {
    try {
      const recSongs = await this.prisma.song.findMany({});
      return {
        recommended: recSongs,
        message: 'Recommended songs fetched successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'An error occured while fetching recommended songs',
        error.message,
      );
    }
  }

  async getSongById(songId: string) {
    try {
      const findSong = await this.prisma.song.findFirst({
        where: {
          id: songId,
        },
      });
      if (!findSong) {
        throw new NotFoundException('Song does not exist');
      }
      return { song: findSong, message: 'song fetched successfully' };
    } catch (error) {
      throw new InternalServerErrorException(
        'An error occured fetching for song',
        error.message,
      );
    }
  }
}
