import {
  Controller,
  Post,
  Body,
  Param,
  Get,
  // UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { PlaylistsService } from 'src/playlists/playlists.service';
import { CreatePlaylistDto, AddSongToPlaylistDto } from 'src/Dtos/playlist.dto';
// import { AuthGuard } from '@nestjs/passport';

@Controller('playlists')
export class PlaylistsController {
  constructor(private readonly playlistsService: PlaylistsService) {}

  // @UseGuards(AuthGuard('jwt')) // TODO: re-enable before production
  @Post()
  createPlaylist(
    @Req() req: any,
    @Query('userId') userId: string,
    @Body() createPlaylistDto: CreatePlaylistDto,
  ) {
    const id = req.user?.id ?? userId;
    return this.playlistsService.createPlaylist(id, createPlaylistDto);
  }

  // @UseGuards(AuthGuard('jwt')) // TODO: re-enable before production
  @Post(':playlistId/songs')
  addSongToPlaylist(
    @Req() req: any,
    @Query('userId') userId: string,
    @Param('playlistId') playlistId: string,
    @Body() addSongToPlaylistDto: AddSongToPlaylistDto,
  ) {
    const id = req.user?.id ?? userId;
    return this.playlistsService.addSongToPlaylist(
      id,
      playlistId,
      addSongToPlaylistDto.songId,
    );
  }

  // @UseGuards(AuthGuard('jwt')) // TODO: re-enable before production
  @Get()
  getUserPlaylists(@Req() req: any, @Query('userId') userId: string) {
    const id = req.user?.id ?? userId;
    return this.playlistsService.getUserPlaylists(id);
  }
}
