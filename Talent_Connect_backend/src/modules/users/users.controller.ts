import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { Roles } from '../../auth/roles.decorator';
import { RolesGuard } from '../../auth/roles.guard';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get()
    @Roles('admin', 'superadmin')
    @ApiOperation({ summary: 'Find all users (Admin only)' })
    findAll() {
        return this.usersService.findAll();
    }
}
