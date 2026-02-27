import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IndustryRequest } from './industry-request.entity';

@Injectable()
export class IndustryRequestService {
  constructor(
    @InjectRepository(IndustryRequest)
    private readonly repo: Repository<IndustryRequest>,
  ) { }

  findAll() {
    return this.repo.find({
      relations: ['institute', 'institute.district', 'requestType', 'requestStatus', 'program', 'streamBranch'],
      order: { industry_request_id: 'DESC' },
    });
  }

  /** Fast COUNT */
  count() { return this.repo.count(); }

  async findOne(id: number) {
    const item = await this.repo.findOne({ where: { industry_request_id: id } as any });
    if (!item) throw new NotFoundException('IndustryRequest #' + id + ' not found');
    return item;
  }

  create(dto: Partial<IndustryRequest>) { return this.repo.save(this.repo.create(dto)); }

  async update(id: number, dto: Partial<IndustryRequest>) {
    await this.findOne(id);
    await this.repo.update({ industry_request_id: id } as any, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.repo.update({ industry_request_id: id } as any, { is_active: 'N' } as any);
    return { message: 'IndustryRequest #' + id + ' deactivated' };
  }
}
