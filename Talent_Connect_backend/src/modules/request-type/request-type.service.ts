import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RequestType } from './request-type.entity';

@Injectable()
export class RequestTypeService {
  constructor(
    @InjectRepository(RequestType)
    private readonly repo: Repository<RequestType>,
  ) {}

  findAll() { return this.repo.find(); }

  async findOne(id: number) {
    const item = await this.repo.findOne({ where: { request_type_id: id } as any });
    if (!item) throw new NotFoundException('RequestType #' + id + ' not found');
    return item;
  }

  create(dto: Partial<RequestType>) { return this.repo.save(this.repo.create(dto)); }

  async update(id: number, dto: Partial<RequestType>) {
    await this.findOne(id);
    await this.repo.update({ request_type_id: id } as any, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.repo.update({ request_type_id: id } as any, { is_active: 'N' } as any);
    return { message: 'RequestType #' + id + ' deactivated' };
  }
}
