import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobRole } from './job-role.entity';
import { JobRoleService } from './job-role.service';
import { JobRoleController } from './job-role.controller';

@Module({
  imports: [TypeOrmModule.forFeature([JobRole])],
  controllers: [JobRoleController],
  providers: [JobRoleService],
  exports: [JobRoleService],
})
export class JobRoleModule {}
