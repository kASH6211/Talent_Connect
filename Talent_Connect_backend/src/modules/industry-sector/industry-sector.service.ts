import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IndustrySector } from './industry-sector.entity';

@Injectable()
export class IndustrySectorService {
  constructor(
    @InjectRepository(IndustrySector)
    private readonly repo: Repository<IndustrySector>,
  ) {}

  findAll() { return this.repo.find(); }

  async findOne(id: number) {
    const item = await this.repo.findOne({ where: { industry_sector_id: id } as any });
    if (!item) throw new NotFoundException('IndustrySector #' + id + ' not found');
    return item;
  }

  create(dto: Partial<IndustrySector>) { return this.repo.save(this.repo.create(dto)); }

  async update(id: number, dto: Partial<IndustrySector>) {
    await this.findOne(id);
    await this.repo.update({ industry_sector_id: id } as any, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.repo.update({ industry_sector_id: id } as any, { is_active: 'N' } as any);
    return { message: 'IndustrySector #' + id + ' deactivated' };
  }
}
