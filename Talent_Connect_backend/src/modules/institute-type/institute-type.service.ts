import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InstituteType } from './institute-type.entity';

@Injectable()
export class InstituteTypeService {
  constructor(
    @InjectRepository(InstituteType)
    private readonly repo: Repository<InstituteType>,
  ) {}

  findAll() { return this.repo.find(); }

  async findOne(id: number) {
    const item = await this.repo.findOne({ where: { institute_type_id: id } as any });
    if (!item) throw new NotFoundException('InstituteType #' + id + ' not found');
    return item;
  }

  create(dto: Partial<InstituteType>) { return this.repo.save(this.repo.create(dto)); }

  async update(id: number, dto: Partial<InstituteType>) {
    await this.findOne(id);
    await this.repo.update({ institute_type_id: id } as any, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.repo.update({ institute_type_id: id } as any, { is_active: 'N' } as any);
    return { message: 'InstituteType #' + id + ' deactivated' };
  }
}
