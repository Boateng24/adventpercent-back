import {
  IsString,
  IsNotEmpty,
  IsEmail,
  MinLength,
  IsOptional,
} from 'class-validator';

export class UserDto {
  @IsString()
  @IsNotEmpty({ message: 'Username is required' })
  username: string;
  @IsString()
  @IsOptional()
  firstname: string;
  @IsString()
  @IsOptional()
  lastname: string;
  @IsString()
  @MinLength(6)
  @IsNotEmpty({ message: 'Password is required' })
  password: string;
  @IsString()
  @IsNotEmpty({ message: 'Please confirm your password' })
  confirmPassword: string;
  @IsEmail()
  @IsNotEmpty({ message: 'Email is required' })
  email: string;
  @IsOptional()
  userType: userType;
}

enum userType {
  artist = 'artist',
  user = 'user',
}

export class LoginDto {
  @IsString()
  @IsEmail()
  @IsNotEmpty({ message: 'Password is required' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Username is required' })
  password: string;
}

export class socialDto {
  @IsString()
  provider: string;

  @IsString()
  providerId: string;

  @IsString()
  @IsEmail()
  email: string;
}
