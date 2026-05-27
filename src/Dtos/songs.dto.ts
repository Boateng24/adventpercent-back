import {
  IsString,
  IsOptional,
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
  @IsNumber()
  @IsOptional()
  viewCount?: number;
  @IsDateString()
  @IsOptional()
  startDate?: string;
  @IsDateString()
  @IsOptional()
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
  @IsNumber()
  @IsOptional()
  duration?: number;
  @IsString()
  @IsOptional()
  lyrics?: string;
  @IsNumber()
  @IsOptional()
  viewCount?: number;
  @IsString()
  track: string;
  @IsString()
  @IsOptional()
  image?: string;
}
