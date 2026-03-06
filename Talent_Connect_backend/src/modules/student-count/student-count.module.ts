import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentCount } from './student-count.entity';
import { StudentCountService } from './student-count.service';
import { StudentCountController } from './student-count.controller';

@Module({
    imports: [TypeOrmModule.forFeature([StudentCount])],
    providers: [StudentCountService],
    controllers: [StudentCountController],
    exports: [StudentCountService]
})
export class StudentCountModule { }
