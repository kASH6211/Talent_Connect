import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JobRoleProgramMapping } from './job-role-program-mapping.entity';

@Injectable()
export class JobRoleProgramMappingService {
  constructor(
    @InjectRepository(JobRoleProgramMapping)
    private readonly repo: Repository<JobRoleProgramMapping>,
  ) { }

  findAll() { return this.repo.find({ relations: ['jobRole', 'program', 'streamBranch'] }); }

  async findOne(id: number) {
    const item = await this.repo.findOne({ where: { job_role_program_mapping_id: id } as any });
    if (!item) throw new NotFoundException('JobRoleProgramMapping #' + id + ' not found');
    return item;
  }

  create(dto: Partial<JobRoleProgramMapping>) { return this.repo.save(this.repo.create(dto)); }

  async update(id: number, dto: Partial<JobRoleProgramMapping>) {
    await this.findOne(id);
    await this.repo.update({ job_role_program_mapping_id: id } as any, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.repo.update({ job_role_program_mapping_id: id } as any, { is_active: 'N' } as any);
    return { message: 'JobRoleProgramMapping #' + id + ' deactivated' };
  }
}
