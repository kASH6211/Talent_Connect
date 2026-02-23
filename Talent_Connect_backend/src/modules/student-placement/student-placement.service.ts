import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StudentPlacement } from './student-placement.entity';

@Injectable()
export class StudentPlacementService {
  constructor(
    @InjectRepository(StudentPlacement)
    private readonly repo: Repository<StudentPlacement>,
  ) {}

  findAll() { return this.repo.find(); }

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
