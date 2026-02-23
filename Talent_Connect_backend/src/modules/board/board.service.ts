import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Board } from './board.entity';

@Injectable()
export class BoardService {
  constructor(
    @InjectRepository(Board)
    private readonly repo: Repository<Board>,
  ) {}

  findAll() { return this.repo.find(); }

  async findOne(id: number) {
    const item = await this.repo.findOne({ where: { university_board_id: id } as any });
    if (!item) throw new NotFoundException('Board #' + id + ' not found');
    return item;
  }

  create(dto: Partial<Board>) { return this.repo.save(this.repo.create(dto)); }

  async update(id: number, dto: Partial<Board>) {
    await this.findOne(id);
    await this.repo.update({ university_board_id: id } as any, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.repo.update({ university_board_id: id } as any, { is_active: 'N' } as any);
    return { message: 'Board #' + id + ' deactivated' };
  }
}
