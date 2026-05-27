import {
  Injectable,
  InternalServerErrorException,
  BadRequestException,
  ConflictException,
  UnauthorizedException,
  HttpException,
} from '@nestjs/common';
import { DbPrismaService } from 'src/db-prisma/db-prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '@nestjs-modules/mailer';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { UserDto, LoginDto, socialDto } from 'src/Dtos/users.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: DbPrismaService,
    private jwtservice: JwtService,
    private readonly configService: ConfigService,
    private readonly mailerService: MailerService,
  ) {}

  async createUser(user: UserDto) {
    try {
      if (user.password !== user.confirmPassword) {
        throw new BadRequestException('Passwords do not match');
      }

      const userExists = await this.prisma.user.findFirst({
        where: { email: user.email },
      });

      if (userExists) {
        throw new ConflictException('User already exists');
      }

      const hashedPassword = await bcrypt.hash(user.password, 10);

      const adminEmail = this.configService.get<string>('ADMIN_EMAIL');
      let role: string;
      if (user.email === adminEmail) {
        role = 'ADMIN';
      } else if (user.userType === 'artist') {
        role = 'ARTIST';
      } else {
        role = 'USER';
      }

      const newUser = await (this.prisma.user as any).create({
        data: {
          username: user.username,
          firstname: user.firstname,
          lastname: user.lastname,
          email: user.email,
          password: hashedPassword,
          userType: user.userType,
          role,
        },
      });
      const { password, ...userdata } = newUser;
      return {
        user: userdata,
        message: 'User created successfully',
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('An error occurred while creating a user');
    }
  }

  async loginUser({ email, password }: LoginDto) {
    try {
      const foundUser = await this.prisma.user.findFirst({ where: { email } });

      if (!foundUser) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const passwordMatch = await bcrypt.compare(password, foundUser.password);
      if (!passwordMatch) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const payload = { id: foundUser.id, role: (foundUser as any).role };
      const userToken = await this.jwtservice.signAsync(payload);
      return {
        userId: foundUser.id,
        loggedInUser: foundUser.username,
        accessToken: userToken,
        userType: foundUser.userType,
        role: (foundUser as any).role,
        isAdmin: (foundUser as any).role === 'ADMIN',
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('An error occurred while logging in');
    }
  }

  async loginWithSocial({ email, provider, providerId }: socialDto) {
    try {
      let user = await this.prisma.user.findFirst({ where: { email } });

      if (!user) {
        user = await (this.prisma.user as any).create({
          data: {
            email,
            username: email.split('@')[0],
            provider,
            providerId,
            password: '',
            role: 'USER',
          },
        });
      }

      const payload = { id: user.id, role: (user as any).role };
      const userToken = await this.jwtservice.signAsync(payload);

      return {
        userId: user.id,
        loggedInUser: user.username,
        accessToken: userToken,
        userType: user.userType,
        role: (user as any).role,
        isAdmin: (user as any).role === 'ADMIN',
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('An error occurred during social login');
    }
  }

  async forgotPassword(email: string) {
    try {
      const user = await this.prisma.user.findFirst({ where: { email } });

      if (!user) {
        return { message: 'If that email is registered, you will receive a reset link' };
      }

      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpiry = new Date(Date.now() + 30 * 60 * 1000);

      await (this.prisma.user as any).update({
        where: { id: user.id },
        data: { resetToken, resetTokenExpiry },
      });

      const frontendUrl = this.configService.get<string>('FRONTEND_URL');
      const resetUrl = `${frontendUrl}/reset?token=${resetToken}`;

      await this.mailerService.sendMail({
        to: email,
        subject: 'AdventPercent — Password Reset',
        html: `
          <p>Hi ${user.username},</p>
          <p>You requested a password reset. Click the link below to reset your password:</p>
          <p><a href="${resetUrl}" style="color:#2563eb">Reset my password</a></p>
          <p>This link expires in 30 minutes.</p>
          <p>If you did not request this, you can safely ignore this email.</p>
        `,
      });

      return { message: 'If that email is registered, you will receive a reset link' };
    } catch (error) {
      console.log('forgotPassword error:', error);
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Failed to send reset email');
    }
  }

  async resetPassword(token: string, newPassword: string, confirmPassword: string) {
    try {
      if (newPassword !== confirmPassword) {
        throw new BadRequestException('Passwords do not match');
      }

      const user = await (this.prisma.user as any).findFirst({
        where: { resetToken: token },
      });

      if (!user) {
        throw new BadRequestException('Invalid or expired reset token');
      }

      if (new Date() > new Date(user.resetTokenExpiry)) {
        throw new BadRequestException('Reset token has expired');
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      await (this.prisma.user as any).update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          resetToken: null,
          resetTokenExpiry: null,
        },
      });

      return { message: 'Password reset successfully' };
    } catch (error) {
      console.log('forgotPassword error:', error);
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Failed to reset password');
    }
  }
}
