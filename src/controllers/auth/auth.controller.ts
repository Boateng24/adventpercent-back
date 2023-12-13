import { Body, Controller, HttpCode, Post, HttpStatus } from '@nestjs/common';
import { LoginDto, UserDto } from 'src/Dtos/users.dto';
import { AuthService } from 'src/services/auth/auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authservice: AuthService) {}
  @Post('/registerUser')
  async registerUser(@Body() user: UserDto) {
    return this.authservice.createUser(user);
  }

  @HttpCode(HttpStatus.OK)
  @Post('/loginUser')
  async loginUser(@Body() user: LoginDto) {
    return this.authservice.loginUser(user);
  }
}
