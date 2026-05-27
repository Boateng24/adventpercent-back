import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  // UseGuards,
} from '@nestjs/common';
// import { AuthGuard } from '@nestjs/passport';
import { IsOptional, IsString } from 'class-validator';
// import { AdminGuard } from './admin.guard';
import { AdminService } from './admin.service';

class RejectSongDto {
  @IsString()
  @IsOptional()
  reason?: string;
}

@Controller('admin')
// @UseGuards(AuthGuard('jwt'), AdminGuard) // TODO: re-enable before production
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('songs/pending')
  getPendingSongs() {
    return this.adminService.getPendingSongs();
  }

  @Patch('songs/:id/approve')
  approveSong(@Param('id') id: string) {
    return this.adminService.approveSong(id);
  }

  @Patch('songs/:id/reject')
  rejectSong(@Param('id') id: string, @Body() body: RejectSongDto) {
    return this.adminService.rejectSong(id, body.reason);
  }
}
