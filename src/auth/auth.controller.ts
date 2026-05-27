import { Body, Controller, HttpCode, Post, HttpStatus } from '@nestjs/common';
import { LoginDto, socialDto, UserDto, ForgotPasswordDto, ResetPasswordDto } from 'src/Dtos/users.dto';
import { AuthService } from 'src/auth/auth.service';

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

  @Post('social-login')
  async socialLogin(@Body() user: socialDto) {
    return this.authservice.loginWithSocial(user);
  }

  @HttpCode(HttpStatus.OK)
  @Post('/forgot-password')
  async forgotPassword(@Body() body: ForgotPasswordDto) {
    return this.authservice.forgotPassword(body.email);
  }

  @HttpCode(HttpStatus.OK)
  @Post('/reset-password')
  async resetPassword(@Body() body: ResetPasswordDto) {
    return this.authservice.resetPassword(body.token, body.newPassword, body.confirmPassword);
  }
}
