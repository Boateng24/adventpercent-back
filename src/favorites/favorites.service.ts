import { Injectable } from '@nestjs/common';
import { DbPrismaService } from 'src/db-prisma/db-prisma.service';

@Injectable()
export class FavoritesService {
  constructor(private readonly prisma: DbPrismaService) {}

  async addFavorite(userId: string, songId: string) {
    return this.prisma.favorite.create({
      data: {
        userId,
        songId,
      },
    });
  }

  async removeFavorite(userId: string, songId: string) {
    return this.prisma.favorite.delete({
      where: {
        userId_songId: {
          userId,
          songId,
        },
      },
    });
  }

  async getUserFavorites(userId: string) {
    return this.prisma.favorite.findMany({
      where: { userId },
      include: {
        song: true,
      },
    });
  }
}
