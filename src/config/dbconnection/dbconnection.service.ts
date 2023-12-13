import { Injectable, Logger } from '@nestjs/common';
import { DbPrismaService } from 'src/db-prisma/db-prisma.service';

@Injectable()
export class DbconnectionService {
  constructor(private readonly prisma: DbPrismaService) {}
  private readonly logger = new Logger(DbconnectionService.name);

  async connection() {
    try {
      await this.prisma.$connect().then(() => {
        this.logger.log('Database connected successfully');
        this.logger.log(`Server listening on port:${process.env.PORT}`);
      });
    } catch (error) {
      this.logger.log(error);
    }
  }
}
