import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from 'src/users/users.controller';
import { DbPrismaModule } from 'src/db-prisma/db-prisma.module';

@Module({
  imports: [DbPrismaModule],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
