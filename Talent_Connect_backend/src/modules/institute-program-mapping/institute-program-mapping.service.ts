import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InstituteProgramMapping } from './institute-program-mapping.entity';

@Injectable()
export class InstituteProgramMappingService {
  constructor(
    @InjectRepository(InstituteProgramMapping)
    private readonly repo: Repository<InstituteProgramMapping>,
  ) { }

  findAll() { return this.repo.find({ relations: ['institute', 'program', 'streamBranch'] }); }

  async findOne(id: number) {
    const item = await this.repo.findOne({ where: { program_institute_mapping_id: id } as any });
    if (!item) throw new NotFoundException('InstituteProgramMapping #' + id + ' not found');
    return item;
  }

  create(dto: Partial<InstituteProgramMapping>) { return this.repo.save(this.repo.create(dto)); }

  async update(id: number, dto: Partial<InstituteProgramMapping>) {
    await this.findOne(id);
    await this.repo.update({ program_institute_mapping_id: id } as any, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.repo.update({ program_institute_mapping_id: id } as any, { is_active: 'N' } as any);
    return { message: 'InstituteProgramMapping #' + id + ' deactivated' };
  }
}
