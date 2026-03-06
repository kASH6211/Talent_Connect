import { Injectable, Logger, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StreamBranch } from './stream-branch.entity';

const RELATIONS = ['qualification', 'affiliation', 'nsqf', 'courseDuration'];

@Injectable()
export class StreamBranchService {
  private readonly logger = new Logger(StreamBranchService.name);

  constructor(
    @InjectRepository(StreamBranch)
    private readonly repo: Repository<StreamBranch>,
  ) { }

  /** Cleans DTO: converts string number FKs to integers, empty strings to null */
  private clean(dto: any): Partial<StreamBranch> {
    const intFields = ['affiliating_body_id', 'qualificationid', 'nsqfid', 'coursedurationid'];
    const result: any = { ...dto };
    for (const key of intFields) {
      if (key in result) {
        const v = result[key];
        result[key] = (v === '' || v === null || v === undefined) ? null : Number(v) || null;
      }
    }
    // Remove nested relation objects to avoid TypeORM cascade issues
    delete result.qualification;
    delete result.affiliation;
    delete result.nsqf;
    delete result.courseDuration;
    return result;
  }

  async findAll(qualificationId?: number, page?: number, limit?: number, search?: string) {
    const qb = this.repo.createQueryBuilder('sb')
      .leftJoinAndSelect('sb.qualification', 'qualification')
      .leftJoinAndSelect('sb.affiliation', 'affiliation')
      .leftJoinAndSelect('sb.nsqf', 'nsqf')
      .leftJoinAndSelect('sb.courseDuration', 'courseDuration')
      .where('1=1');

    if (qualificationId) {
      qb.andWhere('sb.qualificationid = :qualificationId', { qualificationId });
    }

    if (search) {
      qb.andWhere(
        '(LOWER(sb.stream_branch_name) LIKE LOWER(:search) OR LOWER(sb.stream_branch_abbreviation) LIKE LOWER(:search))',
        { search: `%${search}%` }
      );
    }

    qb.orderBy('sb.stream_branch_Id', 'ASC');

    if (page && limit) {
      const take = limit;
      const skip = (page - 1) * take;
      const [data, total] = await qb.skip(skip).take(take).getManyAndCount();
      return { data, total, page, limit: take };
    }

    return qb.getMany();
  }

  async findOne(id: number) {
    const item = await this.repo.findOne({
      where: { stream_branch_Id: id } as any,
      relations: RELATIONS,
    });
    if (!item) throw new NotFoundException('StreamBranch #' + id + ' not found');
    return item;
  }

  /** Check for an existing record with the same name + qualification + affiliation body */
  private async checkDuplicate(dto: Partial<StreamBranch>, excludeId?: number) {
    const qb = this.repo.createQueryBuilder('sb')
      .where('LOWER(sb.stream_branch_name) = LOWER(:name)', { name: dto.stream_branch_name })
      .andWhere('sb.is_active != :inactive', { inactive: 'N' });

    // Match qualification (both null or same value)
    if (dto.qualificationid != null) {
      qb.andWhere('sb.qualificationid = :qid', { qid: dto.qualificationid });
    } else {
      qb.andWhere('sb.qualificationid IS NULL');
    }

    // Match affiliation body (both null or same value)
    if (dto.affiliating_body_id != null) {
      qb.andWhere('sb.affiliating_body_id = :affId', { affId: dto.affiliating_body_id });
    } else {
      qb.andWhere('sb.affiliating_body_id IS NULL');
    }

    // On update, exclude the current record from the check
    if (excludeId) {
      qb.andWhere('sb.stream_branch_Id != :excludeId', { excludeId });
    }

    const existing = await qb.getOne();
    if (existing) {
      throw new ConflictException(
        `A course with the same name, qualification, and affiliation body already exists (ID: ${existing.stream_branch_Id}).`
      );
    }
  }

  async create(dto: any) {
    try {
      const cleaned = this.clean(dto);
      await this.checkDuplicate(cleaned);
      this.logger.log('Creating StreamBranch with cleaned data: ' + JSON.stringify(cleaned));
      return await this.repo.save(this.repo.create(cleaned));
    } catch (err) {
      this.logger.error('Create failed: ' + err.message, err.stack);
      throw err;
    }
  }

  async update(id: number, dto: any) {
    try {
      const cleaned = this.clean(dto);
      await this.checkDuplicate(cleaned, id);
      this.logger.log('Updating StreamBranch #' + id + ' with cleaned data: ' + JSON.stringify(cleaned));
      await this.repo.update({ stream_branch_Id: id } as any, cleaned);
      return await this.findOne(id);
    } catch (err) {
      this.logger.error('Update failed: ' + err.message, err.stack);
      throw err;
    }
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.repo.update({ stream_branch_Id: id } as any, { is_active: 'N' } as any);
    return { message: 'StreamBranch #' + id + ' deactivated' };
  }
}
