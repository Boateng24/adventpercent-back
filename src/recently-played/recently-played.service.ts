import { Injectable } from '@nestjs/common';
import { DbPrismaService } from 'src/db-prisma/db-prisma.service';

@Injectable()
export class RecentlyPlayedService {
  constructor(private readonly prisma: DbPrismaService) {}

  async addRecentlyPlayed(userId: string, songId: string) {
    return this.prisma.recentlyPlayed.create({
      data: {
        userId,
        songId,
      },
    });
  }

  async getRecentlyPlayed(userId: string, limit = 50) {
    return this.prisma.recentlyPlayed.findMany({
      where: { userId },
      orderBy: { playedAt: 'desc' },
      take: limit,
      include: { song: true },
    });
  }
}
