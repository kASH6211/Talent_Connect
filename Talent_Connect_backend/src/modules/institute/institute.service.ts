import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Institute } from './institute.entity';

export interface InstituteSearchQuery {
  district_ids?: string;    // comma-separated
  type_ids?: string;
  ownership_ids?: string;
  qualification_ids?: string;
  program_ids?: string;
  stream_ids?: string;
  sort?: 'name' | 'student_count';
  order?: 'asc' | 'desc';
}

@Injectable()
export class InstituteService {
  constructor(
    @InjectRepository(Institute)
    private readonly repo: Repository<Institute>,
    private readonly dataSource: DataSource,
  ) { }

  findAll() { return this.repo.find(); }

  async findOne(id: number) {
    const item = await this.repo.findOne({ where: { institute_id: id } as any });
    if (!item) throw new NotFoundException('Institute #' + id + ' not found');
    return item;
  }

  create(dto: Partial<Institute>) { return this.repo.save(this.repo.create(dto)); }

  async update(id: number, dto: Partial<Institute>) {
    await this.findOne(id);
    await this.repo.update({ institute_id: id } as any, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.repo.update({ institute_id: id } as any, { is_active: 'N' } as any);
    return { message: 'Institute #' + id + ' deactivated' };
  }

  /** Filtered institute search with student count */
  async search(q: InstituteSearchQuery) {
    const parse = (s?: string) => s ? s.split(',').map(Number).filter(Boolean) : [];

    const districtIds = parse(q.district_ids);
    const typeIds = parse(q.type_ids);
    const ownershipIds = parse(q.ownership_ids);
    const qualIds = parse(q.qualification_ids);
    const programIds = parse(q.program_ids);
    const streamIds = parse(q.stream_ids);

    // Build base institute query
    const qb = this.dataSource
      .createQueryBuilder()
      .from('master_institute', 'i')
      .select([
        'i.institute_id              AS institute_id',
        'i.institute_name            AS institute_name',
        '"i"."emailId"               AS email',
        'i.mobileno                  AS mobileno',
        'i.address                   AS address',
        '"i"."lgddistrictId"         AS district_id',
        'i.institute_type_id         AS type_id',
        'i.institute_ownership_type_id AS ownership_id',
      ])
      .addSelect(`(
        SELECT COUNT(*)
        FROM student_details s
        WHERE s.institute_id = i.institute_id
          AND s.is_active = 'Y'
          ${qualIds.length ? `AND s.qualificationid   IN (${qualIds.join(',')})` : ''}
          ${programIds.length ? `AND s."programId"       IN (${programIds.join(',')})` : ''}
          ${streamIds.length ? `AND s."stream_branch_Id" IN (${streamIds.join(',')})` : ''}
      )`, 'student_count')
      .where(`i.is_active = 'Y'`);

    // Direct institute filters
    if (districtIds.length) qb.andWhere(`i."lgddistrictId" IN (:...dids)`, { dids: districtIds });
    if (typeIds.length) qb.andWhere(`i.institute_type_id IN (:...tids)`, { tids: typeIds });
    if (ownershipIds.length) qb.andWhere(`i.institute_ownership_type_id IN (:...oids)`, { oids: ownershipIds });

    // Student-based filters — only show institutes that have qualifying students
    if (qualIds.length || programIds.length || streamIds.length) {
      const subQb = this.dataSource.createQueryBuilder()
        .select('DISTINCT s.institute_id')
        .from('student_details', 's')
        .where(`s.is_active = 'Y'`);
      if (qualIds.length) subQb.andWhere(`s.qualificationid IN (:...qids)`, { qids: qualIds });
      if (programIds.length) subQb.andWhere(`s."programId" IN (:...pids)`, { pids: programIds });
      if (streamIds.length) subQb.andWhere(`s."stream_branch_Id" IN (:...sids)`, { sids: streamIds });
      qb.andWhere(`i.institute_id IN (${subQb.getQuery()})`, subQb.getParameters());
    }

    // Sorting
    const sortCol = q.sort === 'name' ? 'i.institute_name' : 'student_count';
    const dir = (q.order ?? 'desc').toUpperCase() as 'ASC' | 'DESC';
    qb.orderBy(sortCol === 'student_count' ? 'student_count' : sortCol, dir);

    const rows = await qb.getRawMany();

    // Fetch related names in one query
    const distRepo = this.dataSource.getRepository('master_district');
    const typeRepo = this.dataSource.getRepository('master_institute_type');
    const ownRepo = this.dataSource.getRepository('master_institute_ownership_type');

    const allDists = await distRepo.find() as any[];
    const allTypes = await typeRepo.find() as any[];
    const allOwns = await ownRepo.find() as any[];

    const distMap = Object.fromEntries(allDists.map((d: any) => [d.districtid, d.districtname]));
    const typeMap = Object.fromEntries(allTypes.map((t: any) => [t.institute_type_id, t.institute_type]));
    const ownMap = Object.fromEntries(allOwns.map((o: any) => [o.institute_ownership_type_id, o.institute_type]));

    return rows.map(r => ({
      institute_id: r.institute_id,
      institute_name: r.institute_name,
      email: r.email,
      mobileno: r.mobileno,
      city: r.city,
      district: distMap[r.district_id] ?? '',
      type: typeMap[r.type_id] ?? '',
      ownership: ownMap[r.ownership_id] ?? '',
      student_count: parseInt(r.student_count ?? '0', 10),
    }));
  }
}
