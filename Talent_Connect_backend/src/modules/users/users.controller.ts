import { Controller, Get, UseGuards, Patch, Delete, Body, Param, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { Roles } from '../../auth/roles.decorator';
import { RolesGuard } from '../../auth/roles.guard';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { User } from './user.entity';

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

    @Patch(':id')
    @Roles('admin', 'superadmin')
    @ApiOperation({ summary: 'Update user details (Admin only)' })
    update(@Param('id', ParseIntPipe) id: number, @Body() dto: Partial<User>) {
        return this.usersService.update(id, dto);
    }

    @Delete(':id')
    @Roles('admin', 'superadmin')
    @ApiOperation({ summary: 'Deactivate user (Admin only)' })
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.usersService.remove(id);
    }
}
