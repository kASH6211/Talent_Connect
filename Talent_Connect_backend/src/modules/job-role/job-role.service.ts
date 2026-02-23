import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JobRole } from './job-role.entity';

@Injectable()
export class JobRoleService {
  constructor(
    @InjectRepository(JobRole)
    private readonly repo: Repository<JobRole>,
  ) {}

  findAll() { return this.repo.find(); }

  async findOne(id: number) {
    const item = await this.repo.findOne({ where: { jobrole_id: id } as any });
    if (!item) throw new NotFoundException('JobRole #' + id + ' not found');
    return item;
  }

  create(dto: Partial<JobRole>) { return this.repo.save(this.repo.create(dto)); }

  async update(id: number, dto: Partial<JobRole>) {
    await this.findOne(id);
    await this.repo.update({ jobrole_id: id } as any, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.repo.update({ jobrole_id: id } as any, { is_active: 'N' } as any);
    return { message: 'JobRole #' + id + ' deactivated' };
  }
}
