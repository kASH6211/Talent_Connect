import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
    @ApiProperty()
    @IsString()
    username: string;

    @ApiProperty()
    @IsEmail()
    email: string;

    @ApiProperty({ minLength: 6 })
    @IsString()
    @MinLength(6)
    password: string;

    @ApiPropertyOptional({ default: 'admin' })
    @IsOptional()
    @IsString()
    role?: string;
}

export class LoginDto {
    @ApiProperty({ example: 'admin' })
    @IsString()
    username: string;

    @ApiProperty({ example: 'admin123' })
    @IsString()
    password: string;
}
