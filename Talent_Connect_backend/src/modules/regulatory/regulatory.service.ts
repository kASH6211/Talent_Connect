import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Regulatory } from './regulatory.entity';

@Injectable()
export class RegulatoryService {
  constructor(
    @InjectRepository(Regulatory)
    private readonly repo: Repository<Regulatory>,
  ) {}

  findAll() { return this.repo.find(); }

  async findOne(id: number) {
    const item = await this.repo.findOne({ where: { regulatory_body_id: id } as any });
    if (!item) throw new NotFoundException('Regulatory #' + id + ' not found');
    return item;
  }

  create(dto: Partial<Regulatory>) { return this.repo.save(this.repo.create(dto)); }

  async update(id: number, dto: Partial<Regulatory>) {
    await this.findOne(id);
    await this.repo.update({ regulatory_body_id: id } as any, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.repo.update({ regulatory_body_id: id } as any, { is_active: 'N' } as any);
    return { message: 'Regulatory #' + id + ' deactivated' };
  }
}
