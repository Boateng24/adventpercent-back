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
import { PassportModule } from '@nestjs/passport';
import { MailerModule } from '@nestjs-modules/mailer';
import { JwtStrategy } from './auth/jwt.strategy';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { SongsService } from './songs/songs.service';
import { SongsController } from './songs/songs.controller';
import { SeedService } from './seed/seed.service';
import { CloudinaryService } from './config/cloudinary/cloudinary.service';
import { QuartetSeedCommand } from './seed/seed-script';
import { TasksService } from './tasks/tasks.service';
import { ScheduleModule } from '@nestjs/schedule';
import { UploadsongsService } from './uploadsongs/uploadsongs.service';
import { UploadsongsController } from './uploadsongs/uploadsongs.controller';
import { WhisperService } from './whisper/whisper.service'; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PlaylistsModule } from './playlists/playlists.module';
import { FavoritesModule } from './favorites/favorites.module';
import { UsersModule } from './users/users.module';
import { RecentlyPlayedModule } from './recently-played/recently-played.module';
import { AdminModule } from './admin/admin.module';

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
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        transport: {
          host: configService.get<string>('MAIL_HOST'),
          port: parseInt(configService.get<string>('MAIL_PORT') ?? '587', 10),
          secure: configService.get<string>('MAIL_SECURE') === 'true',
          auth: {
            user: configService.get<string>('MAIL_USER'),
            pass: configService.get<string>('MAIL_PASS'),
          },
        },
        defaults: {
          from: `"AdventPercent" <${
            configService.get<string>('MAIL_FROM') ??
            'noreply@adventpercent.com'
          }>`,
        },
      }),
      inject: [ConfigService],
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),
    ScheduleModule.forRoot(),
    PassportModule,
    PlaylistsModule,
    FavoritesModule,
    UsersModule,
    RecentlyPlayedModule,
    AdminModule,
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
    WhisperService,
    JwtStrategy,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(...globalMiddlewares).forRoutes('*');
  }
}
