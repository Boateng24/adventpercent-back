import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { DbPrismaService } from 'src/db-prisma/db-prisma.service';
import { CreatePlaylistDto } from 'src/Dtos/playlist.dto';

@Injectable()
export class PlaylistsService {
  constructor(private readonly prisma: DbPrismaService) {}

  async createPlaylist(userId: string, data: CreatePlaylistDto) {
    return this.prisma.playlist.create({
      data: { ...data, userId },
    });
  }

  async addSongToPlaylist(userId: string, playlistId: string, songId: string) {
    const playlist = await this.prisma.playlist.findUnique({
      where: { id: playlistId },
    });

    if (!playlist) {
      throw new NotFoundException('Playlist not found');
    }

    if (playlist.userId !== userId) {
      throw new ForbiddenException('You do not own this playlist');
    }

    return this.prisma.playlist.update({
      where: { id: playlistId },
      data: { songs: { connect: { id: songId } } },
    });
  }

  async getUserPlaylists(userId: string) {
    return this.prisma.playlist.findMany({
      where: { userId },
      include: { songs: true },
    });
  }
}
