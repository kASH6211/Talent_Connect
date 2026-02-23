import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IndustryIdentifier } from './industry-identifier.entity';
import { IndustryIdentifierService } from './industry-identifier.service';
import { IndustryIdentifierController } from './industry-identifier.controller';

@Module({
  imports: [TypeOrmModule.forFeature([IndustryIdentifier])],
  controllers: [IndustryIdentifierController],
  providers: [IndustryIdentifierService],
  exports: [IndustryIdentifierService],
})
export class IndustryIdentifierModule {}
