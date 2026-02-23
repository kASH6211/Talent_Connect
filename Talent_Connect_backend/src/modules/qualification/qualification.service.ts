import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Qualification } from './qualification.entity';

@Injectable()
export class QualificationService {
  constructor(
    @InjectRepository(Qualification)
    private readonly repo: Repository<Qualification>,
  ) {}

  findAll() { return this.repo.find(); }

  async findOne(id: number) {
    const item = await this.repo.findOne({ where: { qualificationid: id } as any });
    if (!item) throw new NotFoundException('Qualification #' + id + ' not found');
    return item;
  }

  create(dto: Partial<Qualification>) { return this.repo.save(this.repo.create(dto)); }

  async update(id: number, dto: Partial<Qualification>) {
    await this.findOne(id);
    await this.repo.update({ qualificationid: id } as any, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.repo.update({ qualificationid: id } as any, { is_active: 'N' } as any);
    return { message: 'Qualification #' + id + ' deactivated' };
  }
}
