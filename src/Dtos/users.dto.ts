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
  @IsString()
  userType?: string;
}

export class LoginDto {
  @IsEmail()
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  password: string;
}

export class UsersDto {
  @IsString()
  @IsOptional()
  username?: string;
  @IsString()
  @IsOptional()
  firstname?: string;
  @IsString()
  @IsOptional()
  lastname?: string;
}

export class socialDto {
  @IsString()
  provider: string;

  @IsString()
  providerId: string;

  @IsEmail()
  email: string;
}

export class ForgotPasswordDto {
  @IsEmail()
  @IsNotEmpty({ message: 'Email is required' })
  email: string;
}

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty({ message: 'Reset token is required' })
  token: string;

  @IsString()
  @MinLength(6)
  @IsNotEmpty({ message: 'New password is required' })
  newPassword: string;

  @IsString()
  @IsNotEmpty({ message: 'Please confirm your new password' })
  confirmPassword: string;
}
