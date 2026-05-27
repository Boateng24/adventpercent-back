import {
  Controller,
  Post,
  Body,
  Param,
  Get,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { FavoritesService } from 'src/favorites/favorites.service';
import { FavoriteDto } from 'src/Dtos/favorite.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  addFavorite(@Req() req, @Body() favoriteDto: FavoriteDto) {
    const userId = req.user.id;
    return this.favoritesService.addFavorite(userId, favoriteDto.songId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':songId')
  removeFavorite(@Req() req, @Param('songId') songId: string) {
    const userId = req.user.id;
    return this.favoritesService.removeFavorite(userId, songId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get()
  getUserFavorites(@Req() req) {
    const userId = req.user.id;
    return this.favoritesService.getUserFavorites(userId);
  }
}
