import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InstituteQualificationMapping } from './institute-qualification-mapping.entity';
import { InstituteQualificationMappingService } from './institute-qualification-mapping.service';
import { InstituteQualificationMappingController } from './institute-qualification-mapping.controller';

@Module({
    imports: [TypeOrmModule.forFeature([InstituteQualificationMapping])],
    controllers: [InstituteQualificationMappingController],
    providers: [InstituteQualificationMappingService],
    exports: [InstituteQualificationMappingService],
})
export class InstituteQualificationMappingModule { }
