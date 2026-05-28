import {
  Controller,
  Get,
  Put,
  Body,
  // UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { UsersDto } from 'src/Dtos/users.dto';
// import { AuthGuard } from '@nestjs/passport';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // @UseGuards(AuthGuard('jwt')) // TODO: re-enable before production
  @Get('profile')
  getUserProfile(@Req() req: any, @Query('userId') userId: string) {
    const id = req.user?.id ?? userId;
    return this.usersService.getUserProfile(id);
  }

  // @UseGuards(AuthGuard('jwt')) // TODO: re-enable before production
  @Put('profile')
  updateUserProfile(
    @Req() req: any,
    @Query('userId') userId: string,
    @Body() usersDto: UsersDto,
  ) {
    const id = req.user?.id ?? userId;
    return this.usersService.updateUserProfile(id, usersDto);
  }
}
