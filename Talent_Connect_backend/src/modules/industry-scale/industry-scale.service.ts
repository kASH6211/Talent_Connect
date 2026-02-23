import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IndustryScale } from './industry-scale.entity';

@Injectable()
export class IndustryScaleService {
  constructor(
    @InjectRepository(IndustryScale)
    private readonly repo: Repository<IndustryScale>,
  ) {}

  findAll() { return this.repo.find(); }

  async findOne(id: number) {
    const item = await this.repo.findOne({ where: { industry_scale_id: id } as any });
    if (!item) throw new NotFoundException('IndustryScale #' + id + ' not found');
    return item;
  }

  create(dto: Partial<IndustryScale>) { return this.repo.save(this.repo.create(dto)); }

  async update(id: number, dto: Partial<IndustryScale>) {
    await this.findOne(id);
    await this.repo.update({ industry_scale_id: id } as any, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.repo.update({ industry_scale_id: id } as any, { is_active: 'N' } as any);
    return { message: 'IndustryScale #' + id + ' deactivated' };
  }
}
