import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StreamBranchQualificationMapping } from './stream-branch-qualification-mapping.entity';
import { StreamBranchQualificationMappingService } from './stream-branch-qualification-mapping.service';
import { StreamBranchQualificationMappingController } from './stream-branch-qualification-mapping.controller';

@Module({
    imports: [TypeOrmModule.forFeature([StreamBranchQualificationMapping])],
    controllers: [StreamBranchQualificationMappingController],
    providers: [StreamBranchQualificationMappingService],
    exports: [StreamBranchQualificationMappingService],
})
export class StreamBranchQualificationMappingModule { }
