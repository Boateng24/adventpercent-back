import { Type } from 'class-transformer';
import {
  IsString,
  IsOptional,
  ValidateNested,
  IsNumber,
  IsDateString,
} from 'class-validator';

export class songParams {
  id: string;
}

export class TrendingDto {
  @IsString()
  @IsOptional()
  songId?: string;
  @IsString()
  @IsNumber()
  viewCount?: number;
  @IsDateString()
  startDate?: string;
  @IsDateString()
  endDate?: string;
}

export class SongDto {
  @IsString()
  @IsOptional()
  title?: string;
  @IsString()
  @IsOptional()
  artist?: string;
  @IsString()
  @IsOptional()
  album?: string;

  @IsString()
  @IsOptional()
  genre?: string;
  @IsString()
  @IsOptional()
  duration?: number;
  @IsString()
  @IsOptional()
  lyrics?: string;
  @IsString()
  @IsOptional()
  viewCount?: number;
  @IsString()
  track: string;
  @IsString()
  @IsOptional()
  image?: string;
  playlistId: string;
  @ValidateNested()
  @Type(() => TrendingDto)
  trending: TrendingDto;
  trendingId: string;
}
