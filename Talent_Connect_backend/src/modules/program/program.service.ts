import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Program } from './program.entity';

@Injectable()
export class ProgramService {
  constructor(
    @InjectRepository(Program)
    private readonly repo: Repository<Program>,
  ) {}

  findAll() { return this.repo.find(); }

  async findOne(id: number) {
    const item = await this.repo.findOne({ where: { programId: id } as any });
    if (!item) throw new NotFoundException('Program #' + id + ' not found');
    return item;
  }

  create(dto: Partial<Program>) { return this.repo.save(this.repo.create(dto)); }

  async update(id: number, dto: Partial<Program>) {
    await this.findOne(id);
    await this.repo.update({ programId: id } as any, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.repo.update({ programId: id } as any, { is_active: 'N' } as any);
    return { message: 'Program #' + id + ' deactivated' };
  }
}
