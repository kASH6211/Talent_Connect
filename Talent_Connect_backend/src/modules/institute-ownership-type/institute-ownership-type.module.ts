import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InstituteOwnershipType } from './institute-ownership-type.entity';
import { InstituteOwnershipTypeService } from './institute-ownership-type.service';
import { InstituteOwnershipTypeController } from './institute-ownership-type.controller';

@Module({
  imports: [TypeOrmModule.forFeature([InstituteOwnershipType])],
  controllers: [InstituteOwnershipTypeController],
  providers: [InstituteOwnershipTypeService],
  exports: [InstituteOwnershipTypeService],
})
export class InstituteOwnershipTypeModule {}
