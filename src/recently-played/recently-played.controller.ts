import {
  Controller,
  Post,
  Body,
  Get,
  // UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { RecentlyPlayedService } from 'src/recently-played/recently-played.service';
import { RecentlyPlayedDto } from 'src/Dtos/recently-played.dto';
// import { AuthGuard } from '@nestjs/passport';

@Controller('recently-played')
export class RecentlyPlayedController {
  constructor(private readonly recentlyPlayedService: RecentlyPlayedService) {}

  // @UseGuards(AuthGuard('jwt')) // TODO: re-enable before production
  @Post()
  addRecentlyPlayed(
    @Req() req: any,
    @Query('userId') userId: string,
    @Body() recentlyPlayedDto: RecentlyPlayedDto,
  ) {
    const id = req.user?.id ?? userId;
    return this.recentlyPlayedService.addRecentlyPlayed(
      id,
      recentlyPlayedDto.songId,
    );
  }

  // @UseGuards(AuthGuard('jwt')) // TODO: re-enable before production
  @Get()
  getRecentlyPlayed(@Req() req: any, @Query('userId') userId: string) {
    const id = req.user?.id ?? userId;
    return this.recentlyPlayedService.getRecentlyPlayed(id);
  }
}
