import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LegalEntity } from './legal-entity.entity';
import { LegalEntityService } from './legal-entity.service';
import { LegalEntityController } from './legal-entity.controller';

@Module({
  imports: [TypeOrmModule.forFeature([LegalEntity])],
  controllers: [LegalEntityController],
  providers: [LegalEntityService],
  exports: [LegalEntityService],
})
export class LegalEntityModule {}
