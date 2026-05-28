import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Delete,
  Query,
  Req,
  Res,
  HttpStatus,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SongDto } from 'src/Dtos/songs.dto';
import { SongsService } from 'src/songs/songs.service';
import { FavoritesService } from 'src/favorites/favorites.service';
import { PlaylistsService } from 'src/playlists/playlists.service';
import { RecentlyPlayedService } from 'src/recently-played/recently-played.service';

@Controller('songs')
export class SongsController {
  constructor(
    private readonly Songservice: SongsService,
    private readonly favoritesService: FavoritesService,
    private readonly playlistsService: PlaylistsService,
    private readonly recentlyPlayedService: RecentlyPlayedService,
  ) {}

  @Post('/createSong')
  async newSong(@Body() body: SongDto) {
    return await this.Songservice.createSong(body);
  }

  @Get('/recommended')
  async recommendedSongs(
    @Query('page') page: number,
    @Query('size') size: number,
    @Res() response,
  ) {
    const defaultPage = 1;
    const defaultSize = 20;

    page = page || defaultPage;
    size = size || defaultSize;
    const limit = parseInt(size as any, 10);
    const skip = (page - 1) * limit;
    const songs = await this.Songservice.allSongs(limit, skip);
    return response.status(HttpStatus.OK).json({ page, limit, data: songs });
  }

  @Get('/song/:id')
  async findSongById(@Param('id') id: string) {
    return await this.Songservice.getSongById(id);
  }

  @Post('/interaction')
  async recordInteraction(@Body() body: { songId: string; type: string }) {
    const validTypes = ['play', 'skip', 'share', 'favorite', 'playlistAdd'];
    if (!validTypes.includes(body.type)) {
      throw new BadRequestException('Invalid interaction type');
    }

    await this.Songservice.recordInteraction(body.songId, body.type as any);
    return { success: true };
  }

  @Get('/trending')
  async getTrendingSongs(@Query('limit') limit: number) {
    return await this.Songservice.getWeeklyTrendingSongs(limit);
  }

  @Get('/search')
  async searchSongs(@Query('q') query: string) {
    if (!query || query.length < 2) {
      return [];
    }
    return this.Songservice.searchSongs(query);
  }

  @Get('/genre/:genre')
  async getSongsByGenre(@Param('genre') genre: string) {
    const songs = await this.Songservice.getSongsByGenre(genre);
    return { songs };
  }

  // @UseGuards(AuthGuard('jwt')) // TODO: re-enable before production
  @Get('/favorites')
  async getFavorites(@Req() req: any, @Query('userId') userId: string) {
    const id = req.user?.id ?? userId;
    const favorites = await this.favoritesService.getUserFavorites(id);
    return { favorites: favorites.map((f) => f.song) };
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/favorites/:id')
  async addToFavorites(@Req() req: any, @Param('id') songId: string) {
    const userId = req.user.id;
    await this.favoritesService.addFavorite(userId, songId);
    return { message: 'Song added to favorites' };
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete('/favorites/:id')
  async removeFromFavorites(@Req() req: any, @Param('id') songId: string) {
    const userId = req.user.id;
    await this.favoritesService.removeFavorite(userId, songId);
    return { message: 'Song removed from favorites' };
  }

  // @UseGuards(AuthGuard('jwt')) // TODO: re-enable before production
  @Get('/playlists')
  async getPlaylists(@Req() req: any, @Query('userId') userId: string) {
    const id = req.user?.id ?? userId;
    const playlists = await this.playlistsService.getUserPlaylists(id);
    return { playlists };
  }

  // @UseGuards(AuthGuard('jwt')) // TODO: re-enable before production
  @Get('/recently-played')
  async getRecentlyPlayed(@Req() req: any, @Query('userId') userId: string) {
    const id = req.user?.id ?? userId;
    const history = await this.recentlyPlayedService.getRecentlyPlayed(id);
    return { songs: history.map((r) => r.song) };
  }
}
