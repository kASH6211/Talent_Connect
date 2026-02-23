import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Affiliation } from './affiliation.entity';

@Injectable()
export class AffiliationService {
  constructor(
    @InjectRepository(Affiliation)
    private readonly repo: Repository<Affiliation>,
  ) {}

  findAll() { return this.repo.find(); }

  async findOne(id: number) {
    const item = await this.repo.findOne({ where: { affiliating_body_id: id } as any });
    if (!item) throw new NotFoundException('Affiliation #' + id + ' not found');
    return item;
  }

  create(dto: Partial<Affiliation>) { return this.repo.save(this.repo.create(dto)); }

  async update(id: number, dto: Partial<Affiliation>) {
    await this.findOne(id);
    await this.repo.update({ affiliating_body_id: id } as any, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.repo.update({ affiliating_body_id: id } as any, { is_active: 'N' } as any);
    return { message: 'Affiliation #' + id + ' deactivated' };
  }
}
