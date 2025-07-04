// upload-song.dto.ts
import { IsString, IsOptional } from 'class-validator';
export class UploadSongDto {
  @IsString()
  title: string;
  @IsString()
  artist: string;
  @IsString()
  @IsOptional()
  album?: string;
  @IsString()
  @IsOptional()
  genre?: string;
  @IsString()
  track: string; // Cloudinary URL for audio file
  @IsString()
  @IsOptional()
  image?: string; // Cloudinary URL for cover image
}
