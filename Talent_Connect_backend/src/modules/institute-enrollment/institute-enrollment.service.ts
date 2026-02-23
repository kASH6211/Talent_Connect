import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InstituteEnrollment } from './institute-enrollment.entity';

@Injectable()
export class InstituteEnrollmentService {
  constructor(
    @InjectRepository(InstituteEnrollment)
    private readonly repo: Repository<InstituteEnrollment>,
  ) {}

  findAll() { return this.repo.find(); }

  async findOne(id: number) {
    const item = await this.repo.findOne({ where: { institute_enrollment_id: id } as any });
    if (!item) throw new NotFoundException('InstituteEnrollment #' + id + ' not found');
    return item;
  }

  create(dto: Partial<InstituteEnrollment>) { return this.repo.save(this.repo.create(dto)); }

  async update(id: number, dto: Partial<InstituteEnrollment>) {
    await this.findOne(id);
    await this.repo.update({ institute_enrollment_id: id } as any, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.repo.update({ institute_enrollment_id: id } as any, { is_active: 'N' } as any);
    return { message: 'InstituteEnrollment #' + id + ' deactivated' };
  }
}
