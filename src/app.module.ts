import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DbPrismaModule } from './db-prisma/db-prisma.module';
import { DbconnectionService } from './config/dbconnection/dbconnection.service';
import { globalMiddlewares } from './middlewares/globals';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_INTERCEPTOR, APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { CacheModule, CacheInterceptor } from '@nestjs/cache-manager';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './controllers/auth/auth.controller';
import { AuthService } from './services/auth/auth.service';
import { SongsService } from './services/songs/songs.service';
import { SongsController } from './controllers/songs/songs.controller';
import { SeedService } from './services/seed/seed.service';
import { CloudinaryService } from './config/cloudinary/cloudinary.service';
import { QuartetSeedCommand } from './seed/seed-script';
import { TasksService } from './services/tasks/tasks.service';
import { ScheduleModule } from '@nestjs/schedule';
import { UploadsongsService } from './services/uploadsongs/uploadsongs.service';
import { UploadsongsController } from './controllers/uploadsongs/uploadsongs.controller';

@Module({
  imports: [
    DbPrismaModule,
    ConfigModule.forRoot(),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1h' },
      }),
      inject: [ConfigService],
    }),
    CacheModule.register({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),
    ScheduleModule.forRoot(),
  ],
  controllers: [
    AppController,
    AuthController,
    SongsController,
    UploadsongsController,
  ],
  providers: [
    AppService,
    DbconnectionService,
    { provide: APP_INTERCEPTOR, useClass: CacheInterceptor },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    AuthService,
    SongsService,
    SeedService,
    CloudinaryService,
    QuartetSeedCommand,
    TasksService,
    UploadsongsService,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(...globalMiddlewares).forRoutes('*');
  }
}
