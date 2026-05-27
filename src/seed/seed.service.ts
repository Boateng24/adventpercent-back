import { Injectable } from '@nestjs/common';
import * as path from 'path';
import { CloudinaryService } from 'src/config/cloudinary/cloudinary.service';
import { DbPrismaService } from 'src/db-prisma/db-prisma.service';
import * as fs from 'fs';
import * as mm from 'music-metadata';

@Injectable()
export class SeedService {
  constructor(
    private readonly prisma: DbPrismaService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  async seedQuartet() {
    try {
      const songsData = [];
      const quartetSongPath = 'D:\\Music\\old sda';
      const quartetSongs = fs.readdirSync(quartetSongPath);

      const songImgPath = path.join(__dirname, '../../image');
      const defaultImageFiles = fs.readdirSync(songImgPath);
      // Assuming the first file in the directory is the default image
      const defaultImagePath = path.join(songImgPath, defaultImageFiles[0]);

      for (const file of quartetSongs) {
        try {
          let imageUrl: string;
          const filePath = path.join(quartetSongPath, file);
          const metadata = await mm.parseFile(filePath);
          const title = metadata.common.title || 'Unknown Title';
          const artist = metadata.common.artist || 'Unknown Artist';
          const album = metadata.common.album || 'Unknown Album';
          const genre = 'adadamu';
          const duration = metadata.format.duration
            ? Math.round(metadata.format.duration)
            : null;
          // uploading song to cloudinary to obtain the url
          const songUrl = await this.cloudinary.uploadMusic(filePath);
          if (metadata.common.picture && metadata.common.picture[0]) {
            const picture = metadata.common.picture[0];
            const imageBuffer = Buffer.from(picture.data);
            imageUrl = await this.cloudinary.uploadImage(imageBuffer);
          } else {
            imageUrl = await this.cloudinary.uploadImage(defaultImagePath);
          }

          songsData.push({
            title,
            artist,
            album,
            genre,
            duration,
            track: songUrl,
            image: imageUrl,
          });
        } catch (fileError) {
          console.error(`Error processing file ${file}:`, fileError);
          continue;
        }
      }
      await this.prisma.song.createMany({
        data: songsData,
      });
      console.log('Quartet songs seeded successfully');
    } catch (error) {
      console.log(error);
    }
  }
}
