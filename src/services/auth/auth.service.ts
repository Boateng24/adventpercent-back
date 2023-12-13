import {
  Injectable,
  InternalServerErrorException,
  NotAcceptableException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { DbPrismaService } from 'src/db-prisma/db-prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UserDto, LoginDto } from 'src/Dtos/users.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: DbPrismaService,
    private jwtservice: JwtService,
  ) {}

  async createUser(user: UserDto) {
    try {
      const userExists = await this.prisma.user.findFirst({
        where: {
          email: user.email,
        },
      });

      if (userExists) {
        throw new ConflictException('User already exists');
      }

      const hashedPassword = await bcrypt.hash(user.password, 10);

      if (user.password !== user.confirmPassword) {
        throw new NotAcceptableException('Password Mismatch');
      }
      const newUser = await this.prisma.user.create({
        data: {
          username: user.username,
          firstname: user.firstname,
          lastname: user.lastname,
          email: user.email,
          password: hashedPassword,
          userType: user.userType,
        },
      });
      const { password, ...userdata } = newUser;
      return {
        user: userdata,
        message: 'User created successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'An error occured while creating a student',
        error.message,
      );
    }
  }

  async loginUser({ email, password }: LoginDto) {
    try {
      const foundUser = await this.prisma.user.findFirst({
        where: {
          email,
        },
      });
      if (!foundUser) {
        throw new NotFoundException({ message: 'Invalid Credentials' });
      }

      const passwordMatch = await bcrypt.compare(password, foundUser.password);
      if (!passwordMatch) {
        throw new ConflictException({ message: 'Invalid Credentials' });
      }

      const payload = { id: foundUser.id, role: foundUser.userType };
      const userToken = await this.jwtservice.signAsync(payload);
      return {
        userId: foundUser.id,
        loggedInUser: foundUser.username,
        accessToken: userToken,
        userRole: foundUser.userType,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'An error occured while logging in a user',
        error.message,
      );
    }
  }
}
