import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TrainingType } from './training-type.entity';

@Injectable()
export class TrainingTypeService {
  constructor(
    @InjectRepository(TrainingType)
    private readonly repo: Repository<TrainingType>,
  ) {}

  findAll() { return this.repo.find(); }

  async findOne(id: number) {
    const item = await this.repo.findOne({ where: { training_type_id: id } as any });
    if (!item) throw new NotFoundException('TrainingType #' + id + ' not found');
    return item;
  }

  create(dto: Partial<TrainingType>) { return this.repo.save(this.repo.create(dto)); }

  async update(id: number, dto: Partial<TrainingType>) {
    await this.findOne(id);
    await this.repo.update({ training_type_id: id } as any, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.repo.update({ training_type_id: id } as any, { is_active: 'N' } as any);
    return { message: 'TrainingType #' + id + ' deactivated' };
  }
}
