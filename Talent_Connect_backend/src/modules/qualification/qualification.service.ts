import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Qualification } from './qualification.entity';

@Injectable()
export class QualificationService {
  constructor(
    @InjectRepository(Qualification)
    private readonly repo: Repository<Qualification>,
  ) { }

  async findAll(page?: number, limit?: number | string, search?: string) {
    const isFetchingAll = limit === 0 || limit === '0' || limit === 'all';
    const take = isFetchingAll ? undefined : (Number(limit) || 10);
    const skip = isFetchingAll ? undefined : ((Number(page) || 1) - 1) * take!;

    const where: any = { is_active: 'Y' };
    if (search) {
      where.qualification = ILike(`%${search}%`);
    }

    const [data, total] = await this.repo.findAndCount({
      where,
      ...(take && { take }),
      ...(skip !== undefined && { skip }),
      order: { qualificationid: 'DESC' } as any,
    });
    return { data, total, page: isFetchingAll ? 1 : (Number(page) || 1), limit: isFetchingAll ? total : take };
  }

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
