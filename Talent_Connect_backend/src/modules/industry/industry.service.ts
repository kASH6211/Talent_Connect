import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Industry } from './industry.entity';

@Injectable()
export class IndustryService {
  constructor(
    @InjectRepository(Industry)
    private readonly repo: Repository<Industry>,
  ) {}

  findAll() { return this.repo.find(); }

  async findOne(id: number) {
    const item = await this.repo.findOne({ where: { industry_id: id } as any });
    if (!item) throw new NotFoundException('Industry #' + id + ' not found');
    return item;
  }

  create(dto: Partial<Industry>) { return this.repo.save(this.repo.create(dto)); }

  async update(id: number, dto: Partial<Industry>) {
    await this.findOne(id);
    await this.repo.update({ industry_id: id } as any, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.repo.update({ industry_id: id } as any, { is_active: 'N' } as any);
    return { message: 'Industry #' + id + ' deactivated' };
  }
}
