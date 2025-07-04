import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { DbPrismaService } from 'src/db-prisma/db-prisma.service';
import { SongDto } from 'src/Dtos/songs.dto';
import { getCurrentWeek } from 'src/helpers/weekrange';

@Injectable()
export class SongsService {
  constructor(private readonly prisma: DbPrismaService) {}

  async createSong(song: SongDto) {
    const { weekNumber, year } = getCurrentWeek();
    const newSong = await this.prisma.song.create({
      data: {
        title: song.title,
        artist: song.artist,
        track: song.track,
        image: song.image,
        duration: song.duration,
        trending: {
          create: {
            weekNumber,
            year,
          },
        },
      },
      include: { trending: true },
    });
    return { song: newSong, message: 'Song created successfully' };
  }

  async allSongs(limit: number, skip: number) {
    try {
      const getSongs = await this.prisma.song.findMany({
        take: limit,
        skip: skip,
        orderBy: {
          createdAt: 'desc',
        },
      });
      return {
        recommended: getSongs,
        message: 'Recommended songs fetched successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'An error occured while fetching recommended songs',
        error.message,
      );
    }
  }

  async recordInteraction(
    songId: string,
    type: 'play' | 'skip' | 'share' | 'favorite' | 'playlistAdd',
  ) {
    const { weekNumber, year } = getCurrentWeek();

    // Update song metrics
    await this.prisma.song.update({
      where: { id: songId },
      data: {
        playCount: type === 'play' ? { increment: 1 } : undefined,
        skipCount: type === 'skip' ? { increment: 1 } : undefined,
        shares: type === 'share' ? { increment: 1 } : undefined,
        favorites: type === 'favorite' ? { increment: 1 } : undefined,
        playlistAdds: type === 'playlistAdd' ? { increment: 1 } : undefined,
      },
    });

    // Update trending metrics
    await this.prisma.trending.upsert({
      where: {
        songId_weekNumber_year: {
          songId,
          weekNumber,
          year,
        },
      },
      create: {
        songId,
        weekNumber,
        year,
        dailyPlays: type === 'play' ? 1 : 0,
        shares: type === 'share' ? 1 : 0,
      },
      update: {
        dailyPlays: type === 'play' ? { increment: 1 } : undefined,
        shares: type === 'share' ? { increment: 1 } : undefined,
        lastUpdated: new Date(),
      },
    });
  }

  async getSongById(songId: string) {
    try {
      const song = await this.prisma.song.findUnique({
        where: { id: songId },
        include: { trending: true },
      });

      if (!song) {
        throw new NotFoundException('Song not found');
      }

      await this.recordInteraction(songId, 'play');
      return { song, message: 'Song fetched successfully' };
    } catch (error) {
      throw new InternalServerErrorException(
        'Error fetching song',
        error.message,
      );
    }
  }

  async calculateTrendingScores() {
    const { weekNumber, year } = getCurrentWeek();

    const activeSongs = await this.prisma.trending.findMany({
      where: { weekNumber, year },
      include: { song: true },
    });

    const scoredSongs = await Promise.all(
      activeSongs.map(async (trending) => {
        const previousPeriod = await this.prisma.trending.findFirst({
          where: {
            songId: trending.songId,
            OR: [
              { weekNumber: weekNumber - 1, year },
              { weekNumber: 52, year: year - 1 },
            ],
          },
        });

        const previousPlays = previousPeriod?.dailyPlays || 0;
        const playVelocity =
          previousPlays > 0
            ? (trending.dailyPlays - previousPlays) / previousPlays
            : 1;

        const skipRate =
          trending.song.skipCount > 0
            ? trending.song.skipCount / (trending.song.playCount || 1)
            : 0;

        const score =
          trending.dailyPlays * 0.4 +
          playVelocity * 0.3 +
          (1 - skipRate) * 0.2 +
          trending.shares * 0.1;

        return { ...trending, score, playVelocity, skipRate };
      }),
    );

    const sortedSongs = scoredSongs.sort((a, b) => b.score - a.score);

    await Promise.all(
      sortedSongs.map((song, index) =>
        this.prisma.trending.update({
          where: { id: song.id },
          data: {
            playVelocity: song.playVelocity,
            skipRate: song.skipRate,
            rank: index + 1,
          },
        }),
      ),
    );

    return sortedSongs;
  }

  async getWeeklyTrendingSongs(limit: number) {
    const { weekNumber, year } = getCurrentWeek();
    const trending = await this.prisma.trending.findMany({
      where: {
        weekNumber,
        year,
        rank: { lte: limit },
      },
      orderBy: { rank: 'asc' },
      include: { song: true },
      take: limit,
    });
    return { trendingSongs: trending, message: 'Trending songs fetched' };
  }

  async searchSongs(query: string) {
    return this.prisma.song.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { artist: { contains: query, mode: 'insensitive' } },
          { genre: { contains: query, mode: 'insensitive' } },
          { album: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: 10,
      orderBy: {
        playCount: 'desc', // Prioritize popular songs
      },
    });
  }
}
