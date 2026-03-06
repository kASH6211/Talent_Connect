import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JobRoleQualificationMapping } from './job-role-qualification-mapping.entity';

@Injectable()
export class JobRoleQualificationMappingService {
  constructor(
    @InjectRepository(JobRoleQualificationMapping)
    private readonly repo: Repository<JobRoleQualificationMapping>,
  ) { }

  async findAll(page?: number, limit?: number) {
    const relations = ['jobRole', 'qualification', 'streamBranch'];
    if (page && limit) {
      const take = limit || 10;
      const skip = (page - 1) * take;
      const [data, total] = await this.repo.findAndCount({
        take,
        skip,
        relations,
        order: { job_role_qualification_mapping_id: 'DESC' } as any,
      });
      return { data, total, page, limit: take };
    }
    return this.repo.find({
      relations,
      order: { job_role_qualification_mapping_id: 'DESC' } as any,
    });
  }

  async findOne(id: number) {
    const item = await this.repo.findOne({ where: { job_role_qualification_mapping_id: id } as any });
    if (!item) throw new NotFoundException('JobRoleQualificationMapping #' + id + ' not found');
    return item;
  }

  create(dto: Partial<JobRoleQualificationMapping>) { return this.repo.save(this.repo.create(dto)); }

  async update(id: number, dto: Partial<JobRoleQualificationMapping>) {
    await this.findOne(id);
    await this.repo.update({ job_role_qualification_mapping_id: id } as any, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.repo.update({ job_role_qualification_mapping_id: id } as any, { is_active: 'N' } as any);
    return { message: 'JobRoleQualificationMapping #' + id + ' deactivated' };
  }
}
