/// <reference types="multer" />
import { Injectable } from '@nestjs/common';
import { DbPrismaService } from 'src/db-prisma/db-prisma.service';
import { WhisperService } from 'src/whisper/whisper.service';
import { UploadSongDto } from 'src/Dtos/uploadsongs.dto';
import { v2 as cloudinary } from 'cloudinary';
import * as streamifier from 'streamifier';
import { validate } from 'class-validator';

@Injectable()
export class UploadsongsService {
  constructor(
    private readonly prisma: DbPrismaService,
    private readonly whisperService: WhisperService,
  ) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  async uploadFileToCloudinary(file: Express.Multer.File): Promise<string> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: file.mimetype.startsWith('audio/') ? 'video' : 'image',
          folder: 'adventpercent files',
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result.secure_url);
          }
        },
      );

      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }

  async uploadMultipleSongs(
    files: Express.Multer.File[],
    metadata: Array<{
      title: string;
      artist: string;
      album?: string;
      genre?: string;
      lyrics?: string;
      audioFilename: string;
      imageFilename?: string;
    }>,
  ) {
    // 1. Validate metadata structure
    this.validateMetadata(metadata);

    // 2. Create file maps
    const { audioFiles, imageFiles } = this.createFileMaps(files);

    // 3. Process uploads
    const uploadPromises = metadata.map(async (meta) => {
      try {
        // 4. Convert upload metadata to DTO format
        const songDto = await this.createSongDto(meta, audioFiles, imageFiles);

        // 5. Validate against DTO
        await this.validateDto(songDto);

        // 6. Save to database
        const createdSong = await this.prisma.song.create({
          data: songDto,
        });

        // 7. Auto-generate LRC lyrics if none were provided (runs in background)
        if (!songDto.lyrics) {
          this.whisperService.scheduleTranscription(
            createdSong.id,
            createdSong.track,
            createdSong.title,
            (lrc) =>
              (this.prisma.song as any).update({
                where: { id: createdSong.id },
                data: { lyrics: lrc },
              }),
          );
        }

        return { success: true, data: createdSong };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Upload error';
        return { success: false, error: message };
      }
    });

    return Promise.all(uploadPromises);
  }

  // New Helper Methods

  private validateMetadata(metadata: Array<{ audioFilename: string }>) {
    if (!metadata || !Array.isArray(metadata)) {
      throw new Error('Metadata must be an array');
    }

    metadata.forEach((item, index) => {
      if (!item.audioFilename) {
        throw new Error(`Item ${index} missing audioFilename`);
      }
    });
  }

  private async createSongDto(
    meta: {
      title: string;
      artist: string;
      album?: string;
      genre?: string;
      lyrics?: string;
      audioFilename: string;
      imageFilename?: string;
    },
    audioFiles: Map<string, Express.Multer.File>,
    imageFiles: Map<string, Express.Multer.File>,
  ): Promise<UploadSongDto> {
    const audioFile = this.findAudioFile(meta.audioFilename, audioFiles);
    const trackUrl = await this.uploadWithRetry(audioFile, 'audio');

    let imageUrl: string | undefined;
    if (meta.imageFilename) {
      const imageFile = this.findImageFile(meta.imageFilename, imageFiles);
      if (imageFile) {
        imageUrl = await this.uploadWithRetry(imageFile, 'image');
      }
    }

    return {
      title: meta.title,
      artist: meta.artist,
      album: meta.album,
      genre: meta.genre,
      lyrics: meta.lyrics,
      track: trackUrl,
      image: imageUrl,
    };
  }

  private async validateDto(dto: UploadSongDto) {
    // This will throw if validation fails
    const validationErrors = await validate(dto);
    if (validationErrors.length > 0) {
      const messages = validationErrors.map((err) =>
        Object.values(err.constraints).join(', '),
      );
      throw new Error(`Validation failed: ${messages.join('; ')}`);
    }
  }

  // Helper Methods

  private createFileMaps(files: Express.Multer.File[]) {
    const audioFiles = new Map<string, Express.Multer.File>();
    const imageFiles = new Map<string, Express.Multer.File>();

    files.forEach((file) => {
      const key = file.originalname.toLowerCase();
      if (file.mimetype.startsWith('audio/')) {
        audioFiles.set(key, file);
        // Handle cases where name differs from originalname
        if ((file as any).name) {
          audioFiles.set((file as any).name.toLowerCase(), file);
        }
      } else if (file.mimetype.startsWith('image/')) {
        imageFiles.set(key, file);
        if ((file as any).name) {
          imageFiles.set((file as any).name.toLowerCase(), file);
        }
      }
    });

    return { audioFiles, imageFiles };
  }

  private findAudioFile(
    filename: string,
    audioFiles: Map<string, Express.Multer.File>,
  ): Express.Multer.File {
    if (!filename) throw new Error('Audio filename is required');

    const file = audioFiles.get(filename.toLowerCase());
    if (!file) {
      throw new Error(
        `Audio file not found: ${filename}. Available: ${[
          ...audioFiles.keys(),
        ]}`,
      );
    }
    return file;
  }

  private findImageFile(
    filename: string,
    imageFiles: Map<string, Express.Multer.File>,
  ): Express.Multer.File | undefined {
    return imageFiles.get(filename.toLowerCase());
  }

  private async uploadWithRetry(
    file: Express.Multer.File,
    type: 'audio' | 'image',
    retries = 3,
  ): Promise<string> {
    try {
      return await this.uploadFileToCloudinary(file);
    } catch (error) {
      if (retries > 0) {
        console.warn(
          `Retrying ${type} upload for ${file.originalname}. Attempts left: ${retries}`,
        );
        await new Promise((resolve) =>
          setTimeout(resolve, 1000 * (4 - retries)),
        ); // Exponential backoff
        return this.uploadWithRetry(file, type, retries - 1);
      }
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to upload ${type} after 3 attempts: ${message}`);
    }
  }

  async getAllSongs() {
    return this.prisma.song.findMany();
  }
}
