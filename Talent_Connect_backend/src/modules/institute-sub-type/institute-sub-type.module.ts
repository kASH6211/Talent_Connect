import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InstituteSubType } from './institute-sub-type.entity';
import { InstituteSubTypeService } from './institute-sub-type.service';
import { InstituteSubTypeController } from './institute-sub-type.controller';

@Module({
  imports: [TypeOrmModule.forFeature([InstituteSubType])],
  controllers: [InstituteSubTypeController],
  providers: [InstituteSubTypeService],
  exports: [InstituteSubTypeService],
})
export class InstituteSubTypeModule {}
