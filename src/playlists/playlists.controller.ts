import {
  Controller,
  Post,
  Body,
  Param,
  Get,
  UseGuards,
  Req,
} from '@nestjs/common';
import { PlaylistsService } from 'src/playlists/playlists.service';
import { CreatePlaylistDto, AddSongToPlaylistDto } from 'src/Dtos/playlist.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('playlists')
export class PlaylistsController {
  constructor(private readonly playlistsService: PlaylistsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  createPlaylist(@Req() req, @Body() createPlaylistDto: CreatePlaylistDto) {
    const userId = req.user.id;
    return this.playlistsService.createPlaylist(userId, createPlaylistDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post(':playlistId/songs')
  addSongToPlaylist(
    @Req() req,
    @Param('playlistId') playlistId: string,
    @Body() addSongToPlaylistDto: AddSongToPlaylistDto,
  ) {
    const userId = req.user.id;
    return this.playlistsService.addSongToPlaylist(
      userId,
      playlistId,
      addSongToPlaylistDto.songId,
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @Get()
  getUserPlaylists(@Req() req) {
    const userId = req.user.id;
    return this.playlistsService.getUserPlaylists(userId);
  }
}
