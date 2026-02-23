import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProgramQualificationMapping } from './program-qualification-mapping.entity';

@Injectable()
export class ProgramQualificationMappingService {
  constructor(
    @InjectRepository(ProgramQualificationMapping)
    private readonly repo: Repository<ProgramQualificationMapping>,
  ) { }

  findAll(qualificationId?: number) { return this.repo.find({ where: qualificationId ? { qualificationid: qualificationId } as any : {}, relations: ['program', 'qualification'] }); }

  async findOne(id: number) {
    const item = await this.repo.findOne({ where: { program_qualification_mapping_id: id } as any });
    if (!item) throw new NotFoundException('ProgramQualificationMapping #' + id + ' not found');
    return item;
  }

  create(dto: Partial<ProgramQualificationMapping>) { return this.repo.save(this.repo.create(dto)); }

  async update(id: number, dto: Partial<ProgramQualificationMapping>) {
    await this.findOne(id);
    await this.repo.update({ program_qualification_mapping_id: id } as any, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.repo.update({ program_qualification_mapping_id: id } as any, { is_active: 'N' } as any);
    return { message: 'ProgramQualificationMapping #' + id + ' deactivated' };
  }
}
