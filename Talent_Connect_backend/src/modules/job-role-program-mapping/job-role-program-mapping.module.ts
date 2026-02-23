import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobRoleProgramMapping } from './job-role-program-mapping.entity';
import { JobRoleProgramMappingService } from './job-role-program-mapping.service';
import { JobRoleProgramMappingController } from './job-role-program-mapping.controller';

@Module({
  imports: [TypeOrmModule.forFeature([JobRoleProgramMapping])],
  controllers: [JobRoleProgramMappingController],
  providers: [JobRoleProgramMappingService],
  exports: [JobRoleProgramMappingService],
})
export class JobRoleProgramMappingModule {}
