import {
  Controller,
  Post,
  Body,
  Param,
  Get,
  Delete,
  // UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { FavoritesService } from 'src/favorites/favorites.service';
import { FavoriteDto } from 'src/Dtos/favorite.dto';
// import { AuthGuard } from '@nestjs/passport';

@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  // @UseGuards(AuthGuard('jwt')) // TODO: re-enable before production
  @Post()
  addFavorite(
    @Req() req: any,
    @Query('userId') userId: string,
    @Body() favoriteDto: FavoriteDto,
  ) {
    const id = req.user?.id ?? userId;
    return this.favoritesService.addFavorite(id, favoriteDto.songId);
  }

  // @UseGuards(AuthGuard('jwt')) // TODO: re-enable before production
  @Delete(':songId')
  removeFavorite(
    @Req() req: any,
    @Query('userId') userId: string,
    @Param('songId') songId: string,
  ) {
    const id = req.user?.id ?? userId;
    return this.favoritesService.removeFavorite(id, songId);
  }

  // @UseGuards(AuthGuard('jwt')) // TODO: re-enable before production
  @Get()
  getUserFavorites(@Req() req: any, @Query('userId') userId: string) {
    const id = req.user?.id ?? userId;
    return this.favoritesService.getUserFavorites(id);
  }
}
