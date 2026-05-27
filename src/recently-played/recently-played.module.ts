import { Module } from '@nestjs/common';
import { RecentlyPlayedService } from './recently-played.service';
import { RecentlyPlayedController } from 'src/recently-played/recently-played.controller';
import { DbPrismaModule } from 'src/db-prisma/db-prisma.module';

@Module({
  imports: [DbPrismaModule],
  controllers: [RecentlyPlayedController],
  providers: [RecentlyPlayedService],
  exports: [RecentlyPlayedService],
})
export class RecentlyPlayedModule {}
