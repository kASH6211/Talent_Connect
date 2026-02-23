import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Institute } from './institute.entity';
import { InstituteService } from './institute.service';
import { InstituteController } from './institute.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Institute])],
  controllers: [InstituteController],
  providers: [InstituteService],
  exports: [InstituteService],
})
export class InstituteModule {}
