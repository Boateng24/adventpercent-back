import { Controller, Post, Body, Get, UseGuards, Req } from '@nestjs/common';
import { RecentlyPlayedService } from 'src/recently-played/recently-played.service';
import { RecentlyPlayedDto } from 'src/Dtos/recently-played.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('recently-played')
export class RecentlyPlayedController {
  constructor(private readonly recentlyPlayedService: RecentlyPlayedService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  addRecentlyPlayed(@Req() req, @Body() recentlyPlayedDto: RecentlyPlayedDto) {
    const userId = req.user.id;
    return this.recentlyPlayedService.addRecentlyPlayed(
      userId,
      recentlyPlayedDto.songId,
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @Get()
  getRecentlyPlayed(@Req() req) {
    const userId = req.user.id;
    return this.recentlyPlayedService.getRecentlyPlayed(userId);
  }
}
