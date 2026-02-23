import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from './student.entity';

@Injectable()
export class StudentService {
  constructor(
    @InjectRepository(Student)
    private readonly repo: Repository<Student>,
  ) { }

  async findAll(page?: number, limit?: number) {
    if (page && limit) {
      const take = limit || 10;
      const skip = (page - 1) * take;
      const [data, total] = await this.repo.findAndCount({
        take,
        skip,
        order: { student_id: 'DESC' },
        relations: ['institute', 'program', 'streamBranch']
      });
      return { data, total, page, limit: take };
    }
    return this.repo.find({
      order: { student_id: 'DESC' },
      relations: ['institute', 'program', 'streamBranch']
    });
  }

  async findOne(id: number) {
    const item = await this.repo.findOne({ where: { student_id: id } as any });
    if (!item) throw new NotFoundException('Student #' + id + ' not found');
    return item;
  }

  create(dto: Partial<Student>) { return this.repo.save(this.repo.create(dto)); }

  async update(id: number, dto: Partial<Student>) {
    await this.findOne(id);
    await this.repo.update({ student_id: id } as any, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.repo.update({ student_id: id } as any, { is_active: 'N' } as any);
    return { message: 'Student #' + id + ' deactivated' };
  }
}
