import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { DbPrismaService } from 'src/db-prisma/db-prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: DbPrismaService) {}

  async getPendingSongs() {
    const songs = await (this.prisma.song as any).findMany({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'asc' },
    });
    return { songs, total: songs.length };
  }

  async approveSong(id: string) {
    const song = await (this.prisma.song as any).findUnique({ where: { id } });

    if (!song) {
      throw new NotFoundException('Song not found');
    }
    if (song.status !== 'PENDING') {
      throw new BadRequestException(`Song is already ${song.status.toLowerCase()}`);
    }

    await (this.prisma.song as any).update({
      where: { id },
      data: { status: 'APPROVED', rejectionReason: null },
    });

    return { message: 'Song approved successfully' };
  }

  async rejectSong(id: string, reason?: string) {
    const song = await (this.prisma.song as any).findUnique({ where: { id } });

    if (!song) {
      throw new NotFoundException('Song not found');
    }
    if (song.status !== 'PENDING') {
      throw new BadRequestException(`Song is already ${song.status.toLowerCase()}`);
    }

    await (this.prisma.song as any).update({
      where: { id },
      data: {
        status: 'REJECTED',
        rejectionReason: reason ?? null,
      },
    });

    return { message: 'Song rejected' };
  }
}
