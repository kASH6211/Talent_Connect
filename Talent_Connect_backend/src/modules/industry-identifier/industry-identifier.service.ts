import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IndustryIdentifier } from './industry-identifier.entity';

@Injectable()
export class IndustryIdentifierService {
  constructor(
    @InjectRepository(IndustryIdentifier)
    private readonly repo: Repository<IndustryIdentifier>,
  ) {}

  findAll() { return this.repo.find(); }

  async findOne(id: number) {
    const item = await this.repo.findOne({ where: { identifier_id: id } as any });
    if (!item) throw new NotFoundException('IndustryIdentifier #' + id + ' not found');
    return item;
  }

  create(dto: Partial<IndustryIdentifier>) { return this.repo.save(this.repo.create(dto)); }

  async update(id: number, dto: Partial<IndustryIdentifier>) {
    await this.findOne(id);
    await this.repo.update({ identifier_id: id } as any, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.repo.update({ identifier_id: id } as any, { is_active: 'N' } as any);
    return { message: 'IndustryIdentifier #' + id + ' deactivated' };
  }
}
