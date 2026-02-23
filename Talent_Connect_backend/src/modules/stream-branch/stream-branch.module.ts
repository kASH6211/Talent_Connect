import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StreamBranch } from './stream-branch.entity';
import { StreamBranchService } from './stream-branch.service';
import { StreamBranchController } from './stream-branch.controller';

@Module({
  imports: [TypeOrmModule.forFeature([StreamBranch])],
  controllers: [StreamBranchController],
  providers: [StreamBranchService],
  exports: [StreamBranchService],
})
export class StreamBranchModule {}
