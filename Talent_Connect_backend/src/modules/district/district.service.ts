import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { District } from './district.entity';

@Injectable()
export class DistrictService {
  constructor(
    @InjectRepository(District)
    private readonly repo: Repository<District>,
  ) { }

  findAll(stateId?: number) {
    return this.repo.find({
      where: stateId ? { lgdstateid: stateId, is_active: 'Y' } as any : { is_active: 'Y' } as any
    });
  }

  async findOne(id: number) {
    const item = await this.repo.findOne({ where: { districtid: id } as any });
    if (!item) throw new NotFoundException('District #' + id + ' not found');
    return item;
  }

  create(dto: Partial<District>) { return this.repo.save(this.repo.create(dto)); }

  async update(id: number, dto: Partial<District>) {
    await this.findOne(id);
    await this.repo.update({ districtid: id } as any, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.repo.update({ districtid: id } as any, { is_active: 'N' } as any);
    return { message: 'District #' + id + ' deactivated' };
  }
}
