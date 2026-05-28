/// <reference types="multer" />
import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFiles,
  Body,
  Get,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { UploadsongsService } from 'src/uploadsongs/uploadsongs.service';

@Controller('uploadsongs')
export class UploadsongsController {
  constructor(private readonly uploadsongsService: UploadsongsService) {}

  @Post('/upload')
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      fileFilter: (_req, file, cb) => {
        if (
          file.mimetype.startsWith('audio/') ||
          file.mimetype.startsWith('image/')
        ) {
          cb(null, true);
        } else {
          cb(new Error('Unsupported file type'), false);
        }
      },
      limits: {
        fileSize: 50 * 1024 * 1024,
      },
    }),
  )
  async uploadFiles(
    @UploadedFiles() files: Express.Multer.File[],
    @Body('metadata') metadataString: string,
  ) {
    try {
      const metadata = this.parseAndValidateMetadata(metadataString);

      if (!files || files.length === 0) {
        throw new Error('No files were uploaded');
      }

      const results = await this.uploadsongsService.uploadMultipleSongs(
        files,
        metadata,
      );

      return { success: true, results };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Upload failed';
      return { success: false, message };
    }
  }

  @Get()
  async getAllSongs() {
    return this.uploadsongsService.getAllSongs();
  }

  private parseAndValidateMetadata(metadataString: string) {
    try {
      const metadata = JSON.parse(metadataString);

      if (!Array.isArray(metadata)) {
        throw new Error('Metadata must be an array');
      }

      return metadata.map((item) => {
        if (!item.audioFilename) {
          throw new Error('Each song must have an audioFilename');
        }

        return {
          title: item.title || item.audioFilename.replace(/\.[^/.]+$/, ''),
          artist: item.artist || 'Unknown Artist',
          album: item.album as string | undefined,
          genre: item.genre as string | undefined,
          lyrics: item.lyrics as string | undefined,
          audioFilename: item.audioFilename as string,
          imageFilename: item.imageFilename as string | undefined,
        };
      });
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Parse error';
      throw new Error(`Invalid metadata: ${message}`);
    }
  }
}
