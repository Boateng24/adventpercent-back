import { Controller, Get, Put, Body, UseGuards, Req } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { UsersDto } from 'src/Dtos/users.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  getUserProfile(@Req() req) {
    const userId = req.user.id;
    return this.usersService.getUserProfile(userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Put('profile')
  updateUserProfile(@Req() req, @Body() usersDto: UsersDto) {
    const userId = req.user.id;
    return this.usersService.updateUserProfile(userId, usersDto);
  }
}
