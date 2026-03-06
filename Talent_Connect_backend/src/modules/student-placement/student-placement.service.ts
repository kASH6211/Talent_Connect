import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StudentPlacement } from './student-placement.entity';

@Injectable()
export class StudentPlacementService {
  constructor(
    @InjectRepository(StudentPlacement)
    private readonly repo: Repository<StudentPlacement>,
  ) { }

  /** Fast COUNT */
  count() { return this.repo.count(); }

  async findAll(page?: number, limit?: number) {
    if (page && limit) {
      const take = limit || 10;
      const skip = (page - 1) * take;
      const [data, total] = await this.repo.findAndCount({
        take,
        skip,
        order: { placement_id: 'DESC' } as any,
        relations: ['student', 'industry']
      });
      return { data, total, page, limit: take };
    }
    return this.repo.find({
      order: { placement_id: 'DESC' } as any,
      relations: ['student', 'industry']
    });
  }

  async findOne(id: number) {
    const item = await this.repo.findOne({ where: { placement_id: id } as any });
    if (!item) throw new NotFoundException('StudentPlacement #' + id + ' not found');
    return item;
  }

  create(dto: Partial<StudentPlacement>) { return this.repo.save(this.repo.create(dto)); }

  async update(id: number, dto: Partial<StudentPlacement>) {
    await this.findOne(id);
    await this.repo.update({ placement_id: id } as any, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.repo.update({ placement_id: id } as any, { is_active: 'N' } as any);
    return { message: 'StudentPlacement #' + id + ' deactivated' };
  }
}
