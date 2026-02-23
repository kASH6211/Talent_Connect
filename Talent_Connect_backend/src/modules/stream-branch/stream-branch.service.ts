import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StreamBranch } from './stream-branch.entity';

@Injectable()
export class StreamBranchService {
  constructor(
    @InjectRepository(StreamBranch)
    private readonly repo: Repository<StreamBranch>,
  ) { }

  findAll(programId?: number) { return this.repo.find({ where: programId ? { programId } as any : {} }); }

  async findOne(id: number) {
    const item = await this.repo.findOne({ where: { stream_branch_Id: id } as any });
    if (!item) throw new NotFoundException('StreamBranch #' + id + ' not found');
    return item;
  }

  create(dto: Partial<StreamBranch>) { return this.repo.save(this.repo.create(dto)); }

  async update(id: number, dto: Partial<StreamBranch>) {
    await this.findOne(id);
    await this.repo.update({ stream_branch_Id: id } as any, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.repo.update({ stream_branch_Id: id } as any, { is_active: 'N' } as any);
    return { message: 'StreamBranch #' + id + ' deactivated' };
  }
}
