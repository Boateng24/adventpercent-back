import { IsString, IsNotEmpty } from 'class-validator';

export class RecentlyPlayedDto {
  @IsString()
  @IsNotEmpty()
  songId: string;
}
