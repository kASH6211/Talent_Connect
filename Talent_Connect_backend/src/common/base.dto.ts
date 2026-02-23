import { IsOptional, IsString, IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class BaseDto {
    @ApiPropertyOptional({ description: 'Active status Y/N', default: 'Y' })
    @IsOptional()
    @IsString()
    @IsIn(['Y', 'N'])
    is_active?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    created_date?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    createdby?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    updated_date?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    updatedby?: string;
}
