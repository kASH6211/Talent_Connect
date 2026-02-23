import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IndustryTrainingPlacement } from './industry-training-placement.entity';

@Injectable()
export class IndustryTrainingPlacementService {
  constructor(
    @InjectRepository(IndustryTrainingPlacement)
    private readonly repo: Repository<IndustryTrainingPlacement>,
  ) {}

  findAll() { return this.repo.find(); }

  async findOne(id: number) {
    const item = await this.repo.findOne({ where: { preference_id: id } as any });
    if (!item) throw new NotFoundException('IndustryTrainingPlacement #' + id + ' not found');
    return item;
  }

  create(dto: Partial<IndustryTrainingPlacement>) { return this.repo.save(this.repo.create(dto)); }

  async update(id: number, dto: Partial<IndustryTrainingPlacement>) {
    await this.findOne(id);
    await this.repo.update({ preference_id: id } as any, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.repo.update({ preference_id: id } as any, { is_active: 'N' } as any);
    return { message: 'IndustryTrainingPlacement #' + id + ' deactivated' };
  }
}
