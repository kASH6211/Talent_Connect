import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InstituteType } from './institute-type.entity';
import { InstituteTypeService } from './institute-type.service';
import { InstituteTypeController } from './institute-type.controller';

@Module({
  imports: [TypeOrmModule.forFeature([InstituteType])],
  controllers: [InstituteTypeController],
  providers: [InstituteTypeService],
  exports: [InstituteTypeService],
})
export class InstituteTypeModule {}
