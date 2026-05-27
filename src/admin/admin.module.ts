import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { DbPrismaModule } from 'src/db-prisma/db-prisma.module';

@Module({
  imports: [DbPrismaModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
