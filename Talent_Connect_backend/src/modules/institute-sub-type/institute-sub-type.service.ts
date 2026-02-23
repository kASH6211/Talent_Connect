import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InstituteSubType } from './institute-sub-type.entity';

@Injectable()
export class InstituteSubTypeService {
  constructor(
    @InjectRepository(InstituteSubType)
    private readonly repo: Repository<InstituteSubType>,
  ) {}

  findAll() { return this.repo.find(); }

  async findOne(id: number) {
    const item = await this.repo.findOne({ where: { institute_sub_type_id: id } as any });
    if (!item) throw new NotFoundException('InstituteSubType #' + id + ' not found');
    return item;
  }

  create(dto: Partial<InstituteSubType>) { return this.repo.save(this.repo.create(dto)); }

  async update(id: number, dto: Partial<InstituteSubType>) {
    await this.findOne(id);
    await this.repo.update({ institute_sub_type_id: id } as any, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.repo.update({ institute_sub_type_id: id } as any, { is_active: 'N' } as any);
    return { message: 'InstituteSubType #' + id + ' deactivated' };
  }
}
