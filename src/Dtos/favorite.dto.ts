/* eslint-disable prettier/prettier */
import { IsString, IsNotEmpty } from 'class-validator';

export class FavoriteDto {
  @IsString()
  @IsNotEmpty()
  songId: string;
}
