import { Module } from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { FavoritesController } from 'src/favorites/favorites.controller';
import { DbPrismaModule } from 'src/db-prisma/db-prisma.module';

@Module({
  imports: [DbPrismaModule],
  controllers: [FavoritesController],
  providers: [FavoritesService],
  exports: [FavoritesService],
})
export class FavoritesModule {}
