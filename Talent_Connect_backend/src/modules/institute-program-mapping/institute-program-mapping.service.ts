import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InstituteProgramMapping } from './institute-program-mapping.entity';
import { User } from '../users/user.entity';

@Injectable()
export class InstituteProgramMappingService {
  constructor(
    @InjectRepository(InstituteProgramMapping)
    private readonly repo: Repository<InstituteProgramMapping>,
  ) { }

  findAll(user: User) {
    const query: any = { relations: ['institute', 'program', 'streamBranch'] };
    if (user.role === 'institute' && user.institute_id) {
      query.where = { instituteId: user.institute_id };
    }
    return this.repo.find(query);
  }

  async findOne(id: number, user: User) {
    const query: any = { where: { program_institute_mapping_id: id } };
    if (user.role === 'institute' && user.institute_id) {
      query.where.instituteId = user.institute_id;
    }
    const item = await this.repo.findOne(query);
    if (!item) throw new NotFoundException('InstituteProgramMapping #' + id + ' not found');
    return item;
  }

  create(dto: Partial<InstituteProgramMapping>, user: User) {
    if (user.role === 'institute' && user.institute_id) {
      dto.instituteId = user.institute_id;
    }
    return this.repo.save(this.repo.create(dto));
  }

  async update(id: number, dto: Partial<InstituteProgramMapping>, user: User) {
    await this.findOne(id, user);
    if (user.role === 'institute' && user.institute_id) {
      dto.instituteId = user.institute_id;
    }
    await this.repo.update({ program_institute_mapping_id: id } as any, dto);
    return this.findOne(id, user);
  }

  async remove(id: number, user: User) {
    await this.findOne(id, user);
    await this.repo.update({ program_institute_mapping_id: id } as any, { is_active: 'N' } as any);
    return { message: 'InstituteProgramMapping #' + id + ' deactivated' };
  }
}
