import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Student } from './student.entity';

@Injectable()
export class StudentService {
  constructor(
    @InjectRepository(Student)
    private readonly repo: Repository<Student>,
  ) { }

  /** Fast COUNT — no data transfer */
  count() { return this.repo.count(); }

  async findAll(page?: number, limit?: number, available?: boolean) {
    const queryOptions: any = {
      order: { student_id: 'DESC' },
      relations: ['institute', 'qualification', 'streamBranch', 'session'],
      where: {}
    };

    if (available) {
      const currentYear = new Date().getFullYear().toString();
      // Assuming session contains the year, e.g., "2023-2024" or "2024"
      // Using Raw for complex LIKE query if needed, or just typeorm relations
      // But let's keep it simple: filter by session ending with current year
      queryOptions.where.session = { session: Like(`%${currentYear}%`) };
    }

    if (page && limit) {
      const take = limit || 10;
      const skip = (page - 1) * take;
      queryOptions.take = take;
      queryOptions.skip = skip;
      const [data, total] = await this.repo.findAndCount(queryOptions);
      return { data, total, page, limit: take };
    }
    return this.repo.find(queryOptions);
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
