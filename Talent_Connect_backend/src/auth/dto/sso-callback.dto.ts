import { IsOptional, IsString } from 'class-validator';

export class SSOCallbackDto {
    @IsOptional()
    @IsString()
    msg?: string;

    @IsOptional()
    @IsString()
    ssotoken?: string;

    @IsOptional()
    @IsString()
    ssoToken?: string;

    @IsOptional()
    @IsString()
    token?: string;
}
