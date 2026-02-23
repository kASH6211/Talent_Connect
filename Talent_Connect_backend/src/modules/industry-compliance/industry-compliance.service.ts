import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IndustryCompliance } from './industry-compliance.entity';

@Injectable()
export class IndustryComplianceService {
  constructor(
    @InjectRepository(IndustryCompliance)
    private readonly repo: Repository<IndustryCompliance>,
  ) {}

  findAll() { return this.repo.find(); }

  async findOne(id: number) {
    const item = await this.repo.findOne({ where: { compliance_id: id } as any });
    if (!item) throw new NotFoundException('IndustryCompliance #' + id + ' not found');
    return item;
  }

  create(dto: Partial<IndustryCompliance>) { return this.repo.save(this.repo.create(dto)); }

  async update(id: number, dto: Partial<IndustryCompliance>) {
    await this.findOne(id);
    await this.repo.update({ compliance_id: id } as any, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.repo.update({ compliance_id: id } as any, { is_active: 'N' } as any);
    return { message: 'IndustryCompliance #' + id + ' deactivated' };
  }
}
