import { Injectable } from '@nestjs/common';
import { DbPrismaService } from 'src/db-prisma/db-prisma.service';
import { UsersDto } from 'src/Dtos/users.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: DbPrismaService) {}

  async getUserProfile(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        firstname: true,
        lastname: true,
        premium: true,
        userType: true,
      },
    });
  }

  async updateUserProfile(userId: string, data: UsersDto) {
    return this.prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        username: true,
        firstname: true,
        lastname: true,
        premium: true,
        userType: true,
      },
    });
  }
}
