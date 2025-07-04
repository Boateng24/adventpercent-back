// uploads-songs.controller.ts
import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFiles,
  Body,
  Get,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { UploadsongsService } from 'src/services/uploadsongs/uploadsongs.service';

@Controller('uploadsongs')
export class UploadsongsController {
  constructor(private readonly uploadsongsService: UploadsongsService) {}

  @Post('/upload')
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      fileFilter: (req, file, cb) => {
        // Accept only audio and image files
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
        fileSize: 50 * 1024 * 1024, // 50MB
      },
    }),
  )
  async uploadFiles(
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Body('metadata') metadataString: string,
  ) {
    try {
      // 1. Validate and parse metadata
      const metadata = this.parseAndValidateMetadata(metadataString);

      // 2. Basic validation of files
      if (!files || files.length === 0) {
        throw new Error('No files were uploaded');
      }

      // 3. Process upload
      const results = await this.uploadsongsService.uploadMultipleSongs(
        files,
        metadata,
      );

      return {
        success: true,
        results,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
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

      // Validate each metadata entry
      return metadata.map((item) => {
        if (!item.audioFilename) {
          throw new Error('Each song must have an audioFilename');
        }

        return {
          title: item.title || item.audioFilename.replace(/\.[^/.]+$/, ''),
          artist: item.artist || 'Unknown Artist',
          album: item.album,
          genre: item.genre,
          audioFilename: item.audioFilename,
          imageFilename: item.imageFilename,
        };
      });
    } catch (e) {
      throw new Error(`Invalid metadata: ${e.message}`);
    }
  }
}
