import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IdentifierType } from './identifier-type.entity';

@Injectable()
export class IdentifierTypeService {
  constructor(
    @InjectRepository(IdentifierType)
    private readonly repo: Repository<IdentifierType>,
  ) {}

  findAll() { return this.repo.find(); }

  async findOne(id: number) {
    const item = await this.repo.findOne({ where: { identifier_type_id: id } as any });
    if (!item) throw new NotFoundException('IdentifierType #' + id + ' not found');
    return item;
  }

  create(dto: Partial<IdentifierType>) { return this.repo.save(this.repo.create(dto)); }

  async update(id: number, dto: Partial<IdentifierType>) {
    await this.findOne(id);
    await this.repo.update({ identifier_type_id: id } as any, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.repo.update({ identifier_type_id: id } as any, { is_active: 'N' } as any);
    return { message: 'IdentifierType #' + id + ' deactivated' };
  }
}
