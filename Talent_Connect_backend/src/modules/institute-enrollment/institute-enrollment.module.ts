import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InstituteEnrollment } from './institute-enrollment.entity';
import { InstituteEnrollmentService } from './institute-enrollment.service';
import { InstituteEnrollmentController } from './institute-enrollment.controller';

@Module({
  imports: [TypeOrmModule.forFeature([InstituteEnrollment])],
  controllers: [InstituteEnrollmentController],
  providers: [InstituteEnrollmentService],
  exports: [InstituteEnrollmentService],
})
export class InstituteEnrollmentModule {}
