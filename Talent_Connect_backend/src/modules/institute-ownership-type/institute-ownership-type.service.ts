import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InstituteOwnershipType } from './institute-ownership-type.entity';

@Injectable()
export class InstituteOwnershipTypeService {
  constructor(
    @InjectRepository(InstituteOwnershipType)
    private readonly repo: Repository<InstituteOwnershipType>,
  ) {}

  findAll() { return this.repo.find(); }

  async findOne(id: number) {
    const item = await this.repo.findOne({ where: { institute_ownership_type_id: id } as any });
    if (!item) throw new NotFoundException('InstituteOwnershipType #' + id + ' not found');
    return item;
  }

  create(dto: Partial<InstituteOwnershipType>) { return this.repo.save(this.repo.create(dto)); }

  async update(id: number, dto: Partial<InstituteOwnershipType>) {
    await this.findOne(id);
    await this.repo.update({ institute_ownership_type_id: id } as any, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.repo.update({ institute_ownership_type_id: id } as any, { is_active: 'N' } as any);
    return { message: 'InstituteOwnershipType #' + id + ' deactivated' };
  }
}
