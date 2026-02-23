import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LegalEntity } from './legal-entity.entity';

@Injectable()
export class LegalEntityService {
  constructor(
    @InjectRepository(LegalEntity)
    private readonly repo: Repository<LegalEntity>,
  ) {}

  findAll() { return this.repo.find(); }

  async findOne(id: number) {
    const item = await this.repo.findOne({ where: { legal_entity_type_id: id } as any });
    if (!item) throw new NotFoundException('LegalEntity #' + id + ' not found');
    return item;
  }

  create(dto: Partial<LegalEntity>) { return this.repo.save(this.repo.create(dto)); }

  async update(id: number, dto: Partial<LegalEntity>) {
    await this.findOne(id);
    await this.repo.update({ legal_entity_type_id: id } as any, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.repo.update({ legal_entity_type_id: id } as any, { is_active: 'N' } as any);
    return { message: 'LegalEntity #' + id + ' deactivated' };
  }
}
