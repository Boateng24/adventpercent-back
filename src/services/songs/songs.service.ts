import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { DbPrismaService } from 'src/db-prisma/db-prisma.service';
import { SongDto } from 'src/Dtos/songs.dto';
import { getStartAndEndOfWeek } from 'src/helpers/weekrange';

@Injectable()
export class SongsService {
  constructor(private readonly prisma: DbPrismaService) {}

  async createSong(song: SongDto) {
    const { startDate, endDate } = getStartAndEndOfWeek();
    const newSong = await this.prisma.song.create({
      data: {
        title: song.title,
        track: song.track,
        trending: {
          create: {
            id: song.trending?.songId,
            viewCount: song.trending?.viewCount,
            startDate: startDate,
            endDate: endDate,
          },
        },
      },
      include: { trending: true },
    });
    return { song: newSong, message: 'Song created successfully' };
  }

  async recommendedSongs(limit: number, skip: number) {
    try {
      const recSongs = await this.prisma.song.findMany({
        take: limit,
        skip: skip,
      });
      console.log(recSongs.length);
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
      const { startDate, endDate } = getStartAndEndOfWeek();

      const findSong = await this.prisma.song.findFirst({
        where: { id: songId },
        include: { trending: true },
      });

      if (!findSong) {
        throw new NotFoundException('Song does not exist');
      }
      const existingTrending = await this.prisma.trending.findFirst({
        where: {
          songId: findSong.id,
        },
      });

      if (existingTrending) {
        await this.prisma.trending.update({
          where: {
            id: existingTrending.id,
          },
          data: {
            viewCount: { increment: 1 },
            startDate: startDate,
            endDate: endDate,
            song: {
              connect: { id: findSong.id },
            },
          },
        });
      } else {
        await this.prisma.trending.create({
          data: {
            viewCount: 1,
            startDate: startDate,
            endDate: endDate,
            song: {
              connect: { id: findSong.id },
            },
          },
        });
      }

      return {
        song: findSong,
        message: 'Song fetched successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'An error occurred fetching for song',
        error.message,
      );
    }
  }

  async getWeeklyTrendingSongs() {
    const { startDate, endDate } = getStartAndEndOfWeek();

    const getTrending = await this.prisma.trending.findMany({
      where: {
        AND: [
          { viewCount: { gt: 0 } },
          { startDate: { equals: startDate } },
          { endDate: { equals: endDate } },
        ],
      },
      include: {
        song: true,
      },
      orderBy: {
        viewCount: 'desc',
      },
    });

    return { trendingSongs: getTrending, message: 'Trending songs fetched' };
  }

  // async updateAllSongs() {
  //   const currentDate = new Date();
  //   const firstDayoftheWeek = currentDate.getDate() - currentDate.getDay();
  //   const lastDayoftheWeek = firstDayoftheWeek + 6;

  //   const startDate = new Date(currentDate.setDate(firstDayoftheWeek));
  //   const endDate = new Date(currentDate.setDate(lastDayoftheWeek));
  //   const getTrending = await this.prisma.song.updateMany({

  //   });
  //   return { trendingSongs: getTrending, message: 'Trending songs fetched' };
  // }
}
