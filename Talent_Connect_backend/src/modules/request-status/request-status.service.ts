import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RequestStatus } from './request-status.entity';

@Injectable()
export class RequestStatusService {
  constructor(
    @InjectRepository(RequestStatus)
    private readonly repo: Repository<RequestStatus>,
  ) {}

  findAll() { return this.repo.find(); }

  async findOne(id: number) {
    const item = await this.repo.findOne({ where: { request_status_id: id } as any });
    if (!item) throw new NotFoundException('RequestStatus #' + id + ' not found');
    return item;
  }

  create(dto: Partial<RequestStatus>) { return this.repo.save(this.repo.create(dto)); }

  async update(id: number, dto: Partial<RequestStatus>) {
    await this.findOne(id);
    await this.repo.update({ request_status_id: id } as any, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.repo.update({ request_status_id: id } as any, { is_active: 'N' } as any);
    return { message: 'RequestStatus #' + id + ' deactivated' };
  }
}
