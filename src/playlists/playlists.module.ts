import { Module } from '@nestjs/common';
import { PlaylistsService } from './playlists.service';
import { PlaylistsController } from 'src/playlists/playlists.controller';
import { DbPrismaModule } from 'src/db-prisma/db-prisma.module';

@Module({
  imports: [DbPrismaModule],
  controllers: [PlaylistsController],
  providers: [PlaylistsService],
  exports: [PlaylistsService],
})
export class PlaylistsModule {}
