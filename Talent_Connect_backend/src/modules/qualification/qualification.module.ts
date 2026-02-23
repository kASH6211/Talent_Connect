import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Qualification } from './qualification.entity';
import { QualificationService } from './qualification.service';
import { QualificationController } from './qualification.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Qualification])],
  controllers: [QualificationController],
  providers: [QualificationService],
  exports: [QualificationService],
})
export class QualificationModule {}
