import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { State } from './state.entity';

@Injectable()
export class StateService {
  constructor(
    @InjectRepository(State)
    private readonly repo: Repository<State>,
  ) { }

  findAll() {
    return this.repo.find({
      where: { is_active: 'Y' } as any
    });
  }

  async findOne(id: number) {
    const item = await this.repo.findOne({ where: { stateid: id } as any });
    if (!item) throw new NotFoundException('State #' + id + ' not found');
    return item;
  }

  create(dto: Partial<State>) { return this.repo.save(this.repo.create(dto)); }

  async update(id: number, dto: Partial<State>) {
    await this.findOne(id);
    await this.repo.update({ stateid: id } as any, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.repo.update({ stateid: id } as any, { is_active: 'N' } as any);
    return { message: 'State #' + id + ' deactivated' };
  }
}
