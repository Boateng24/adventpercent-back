import { Injectable } from '@nestjs/common';
import { DbconnectionService } from './config/dbconnection/dbconnection.service';

@Injectable()
export class AppService {
  constructor(private readonly dbConnectionService: DbconnectionService) {}

  async onApplicationBootstrap() {
    await this.dbConnectionService.connection();
  }
}
