import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, ILike } from 'typeorm';
import { Institute } from './institute.entity';

export interface InstituteSearchQuery {
  district_ids?: string;    // comma-separated
  type_ids?: string;
  ownership_ids?: string;
  qualification_ids?: string;
  stream_ids?: string;
  sort?: 'name' | 'student_count';
  order?: 'asc' | 'desc';
  page?: string | number;
  limit?: string | number;
  search?: string;
  min_enrollment?: string | number;
  min_placement?: string | number;
}

@Injectable()
export class InstituteService {
  constructor(
    @InjectRepository(Institute)
    private readonly repo: Repository<Institute>,
    private readonly dataSource: DataSource,
  ) { }

  async findAll(page?: number, limit?: number, search?: string) {
    const take = Number(limit) || 10;
    const skip = ((Number(page) || 1) - 1) * take;

    const where: any = { is_active: 'Y' };
    if (search) {
      where.institute_name = ILike(`%${search}%`);
    }

    const [data, total] = await this.repo.findAndCount({
      where,
      take,
      skip,
      order: { institute_id: 'DESC' } as any,
    });
    return { data, total, page: Number(page) || 1, limit: take };
  }

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

  /** Filtered institute search with student count and server-side pagination */
  async search(q: InstituteSearchQuery) {
    const parse = (s?: string) => s ? s.split(',').map(Number).filter(Boolean) : [];

    const districtIds = parse(q.district_ids);
    const typeIds = parse(q.type_ids);
    const ownershipIds = parse(q.ownership_ids);
    const qualIds = parse(q.qualification_ids);
    const streamIds = parse(q.stream_ids);

    const page = Number(q.page) || 1;
    const limit = Number(q.limit) || 10;
    const offset = (page - 1) * limit;

    const baseQuery = (alias: string) => {
      const qb = this.dataSource
        .createQueryBuilder()
        .from('master_institute', alias)
        .where(`${alias}.is_active = 'Y'`);

      if (districtIds.length) qb.andWhere(`${alias}."lgddistrictId" IN (:...dids)`, { dids: districtIds });
      if (typeIds.length) qb.andWhere(`${alias}.institute_type_id IN (:...tids)`, { tids: typeIds });
      if (ownershipIds.length) qb.andWhere(`${alias}.institute_ownership_type_id IN (:...oids)`, { oids: ownershipIds });

      if (qualIds.length) {
        qb.andWhere(
          `${alias}.institute_id IN (SELECT DISTINCT "instituteId" FROM mapping_institute_qualification WHERE is_active = 'Y' AND qualificationid = ANY(:qids))`,
          { qids: qualIds },
        );
      }

      if (streamIds.length) {
        qb.andWhere(
          `${alias}.institute_id IN (SELECT DISTINCT "instituteId" FROM mapping_institute_qualification WHERE is_active = 'Y' AND "stream_branch_Id" = ANY(:sids))`,
          { sids: streamIds },
        );
      }

      if (q.search) {
        qb.andWhere(`(${alias}.institute_name ILIKE :s OR ${alias}.address ILIKE :s)`, { s: `%${q.search}%` });
      }

      if (q.min_enrollment) {
        qb.andWhere(
          `(SELECT COUNT(*) FROM student_details s WHERE s.institute_id = ${alias}.institute_id AND s.is_active = 'Y') >= :minE`,
          { minE: Number(q.min_enrollment) }
        );
      }

      if (q.min_placement) {
        qb.andWhere(
          `(SELECT COUNT(*) FROM student_details s WHERE s.institute_id = ${alias}.institute_id AND s.is_active = 'Y' AND s.passing_year = extract(year from current_date)::text) >= :minP`,
          { minP: Number(q.min_placement) }
        );
      }

      return qb;
    };

    // 1. Get total count
    const countQb = baseQuery('i');
    const { count } = await countQb.select('COUNT(*)', 'count').getRawOne();
    const total = parseInt(count, 10);

    // 2. Get paginated results
    const qb = baseQuery('i');
    qb.select([
      'i.institute_id              AS institute_id',
      'i.institute_name            AS institute_name',
      '"i"."emailId"               AS email',
      'i.mobileno                  AS mobileno',
      'i.address                   AS address',
      '"i"."lgdstateId"            AS state_id',
      '"i"."lgddistrictId"         AS district_id',
      'i.institute_type_id         AS type_id',
      'i.institute_ownership_type_id AS ownership_id',
      'i.contactperson             AS contactperson',
      'i.placement_officer_email_id AS po_email',
      'i.placement_officer_contact_number AS po_mobile',
      'i.placement_officer_name    AS placement_officer_name',
      'i.google_map_link           AS google_map_link',
      'i.latitude                  AS latitude',
      'i.longitude                 AS longitude',
    ])
      .addSelect(`(
      SELECT COUNT(*)
      FROM student_details s
      WHERE s.institute_id = i.institute_id
        AND s.is_active = 'Y'
        ${qualIds.length ? `AND s.qualificationid IN (${qualIds.join(',')})` : ''}
        ${streamIds.length ? `AND s."stream_branch_Id" IN (${streamIds.join(',')})` : ''}
    )`, 'student_count')
      .addSelect(`(
      SELECT COUNT(*)
      FROM student_details s
      WHERE s.institute_id = i.institute_id
        AND s.is_active = 'Y'
        AND s.passing_year = extract(year from current_date)::text
        ${qualIds.length ? `AND s.qualificationid IN (${qualIds.join(',')})` : ''}
        ${streamIds.length ? `AND s."stream_branch_Id" IN (${streamIds.join(',')})` : ''}
    )`, 'final_year_student_count');

    const sortCol = q.sort === 'name' ? 'i.institute_name' : 'student_count';
    const dir = (q.order ?? 'desc').toUpperCase() as 'ASC' | 'DESC';
    qb.orderBy(sortCol === 'student_count' ? 'student_count' : sortCol, dir);

    qb.limit(limit).offset(offset);

    const rows = await qb.getRawMany();

    // Mapping logic (reused from previous implementation)
    const distRepo = this.dataSource.getRepository('master_district');
    const typeRepo = this.dataSource.getRepository('master_institute_type');
    const ownRepo = this.dataSource.getRepository('master_institute_ownership_type');

    // ... (rest of the mapping logic is identical, so I'll keep it concise)
    const allDists = await distRepo.find() as any[];
    const allTypes = await typeRepo.find() as any[];
    const allOwns = await ownRepo.find() as any[];

    const distMap = Object.fromEntries(allDists.map((d: any) => [d.lgddistrictId, d.districtname]));
    const typeMap = Object.fromEntries(allTypes.map((t: any) => [t.institute_type_id, t.institute_type]));
    const ownMap = Object.fromEntries(allOwns.map((o: any) => [o.institute_ownership_type_id, o.institute_type]));

    const data = rows.map(r => ({
      institute_id: r.institute_id,
      institute_name: r.institute_name,
      email: r.email,
      mobileno: r.mobileno,
      district: distMap[r.district_id] ?? '',
      type: typeMap[r.type_id] ?? '',
      ownership: ownMap[r.ownership_id] ?? '',
      student_count: parseInt(r.student_count ?? '0', 10),
      final_year_student_count: parseInt(r.final_year_student_count ?? '0', 10),
      contactperson: r.contactperson ?? '',
      po_email: r.po_email ?? r.email ?? '',
      po_mobile: r.po_mobile ?? r.mobileno ?? '',
      placement_officer_name: r.placement_officer_name ?? '',
      google_map_link: r.google_map_link ?? '',
      latitude: r.latitude ?? null,
      longitude: r.longitude ?? null,
    }));

    return { data, total, page, limit };
  }

  /** Fetch course breakdown for a specific institute considering active filters */
  async getFilteredCourses(id: number, q: InstituteSearchQuery) {
    const parse = (s?: string) => s ? s.split(',').map(Number).filter(Boolean) : [];
    const qualIds = parse(q.qualification_ids);
    const streamIds = parse(q.stream_ids);

    const qb = this.dataSource.createQueryBuilder()
      .select([
        'q.qualification_name AS qualification_name',
        'str.stream_branch_name AS stream_name',
        'COUNT(s.student_id) AS student_count',
        `COUNT(CASE WHEN s.passing_year = extract(year from current_date)::text THEN 1 END) AS final_year_student_count`
      ])
      .from('student_details', 's')
      .innerJoin('master_qualification', 'q', 's.qualificationid = q.qualificationid')
      .innerJoin('master_stream_branch', 'str', 's."stream_branch_Id" = str."stream_branch_Id"')
      .where('s.institute_id = :id', { id })
      .andWhere(`s.is_active = 'Y'`);

    if (qualIds.length) {
      qb.andWhere(`s.qualificationid IN (:...qids)`, { qids: qualIds });
    }
    if (streamIds.length) {
      qb.andWhere(`s."stream_branch_Id" IN (:...sids)`, { sids: streamIds });
    }

    qb.groupBy('q.qualification_name');
    qb.addGroupBy('str.stream_branch_name');
    qb.orderBy('q.qualification_name', 'ASC');
    qb.addOrderBy('str.stream_branch_name', 'ASC');

    const rows = await qb.getRawMany();
    return rows.map(r => ({
      qualification: r.qualification_name,
      course: r.stream_name,
      student_count: parseInt(r.student_count ?? '0', 10),
      final_year_student_count: parseInt(r.final_year_student_count ?? '0', 10),
    }));
  }

  /** Import Institutes from uploaded Excel file */
  async importInstitutes(fileBuffer: Buffer): Promise<{ success: boolean; message: string; errorFile?: Buffer }> {
    const xlsx = await import('xlsx');
    const bcrypt = await import('bcrypt');
    const workbook = xlsx.read(fileBuffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = xlsx.utils.sheet_to_json<any>(sheet, { defval: '' });

    if (!rows || rows.length === 0) {
      throw new NotFoundException('Uploaded Excel file is empty.');
    }

    const failedRows: any[] = [];
    let successCount = 0;
    const now = new Date().toISOString().substring(0, 10);

    /** Normalize text: removes extra spaces, standardizes 'Govt' to 'Government', etc */
    const normalizeText = (text: string): string => {
      if (!text) return '';
      let s = String(text).trim();
      // Replace common abbreviations case-insensitively
      s = s.replace(/\bgovt\.?\b/gi, 'Government');
      // Normalize spaces
      s = s.replace(/\s+/g, ' ');
      return s;
    };

    /** Find an existing row by case-insensitive name, or insert a new one and return its PK */
    const findOrCreate = async (
      table: string,
      idCol: string,
      nameCol: string,
      nameVal: string,
      extra: Record<string, any> = {}
    ): Promise<number | null> => {
      const val = nameVal ? normalizeText(nameVal) : '';
      if (!val) return null;

      // Case-insensitive lookup using LOWER()
      const found = await this.dataSource.query(
        `SELECT "${idCol}" FROM "${table}" WHERE LOWER("${nameCol}") = LOWER($1) LIMIT 1`,
        [val]
      );
      if (found && found.length > 0) return Number(found[0][idCol]);

      const extraKeys = Object.keys(extra);
      const extraVals = Object.values(extra);
      const allKeys = [nameCol, ...extraKeys, 'is_active', 'created_date', 'createdby'];
      const allVals = [val, ...extraVals, 'Y', now, 'import'];
      const placeholders = allKeys.map((_, i) => `$${i + 1}`).join(', ');
      const quotedKeys = allKeys.map(k => `"${k}"`).join(', ');

      const inserted = await this.dataSource.query(
        `INSERT INTO "${table}" (${quotedKeys}) VALUES (${placeholders}) RETURNING "${idCol}"`,
        allVals
      );
      return Number(inserted[0][idCol]);
    };

    for (const row of rows) {
      try {
        const instituteName = normalizeText(row['institute_name']);
        if (!instituteName) throw new Error('Column "institute_name" is empty — required.');

        // Board
        const boardId = await findOrCreate('master_board', 'university_board_id', 'university_board_name', String(row['university_board_id'] || ''));

        // Institute Type
        const typeId = await findOrCreate('master_institute_type', 'institute_type_id', 'institute_type', String(row['institute_type_id'] || ''));

        // Sub-Type depends on type
        let subTypeId: number | null = null;
        const subTypeVal = String(row['institute_sub_type_id'] || '').trim();
        if (subTypeVal && typeId) {
          subTypeId = await findOrCreate('master_institute_sub_type', 'institute_sub_type_id', 'institute_sub_type', subTypeVal, { institute_type_id: typeId });
        }

        // Ownership
        const ownershipId = await findOrCreate('master_institute_ownership_type', 'institute_ownership_type_id', 'institute_type', String(row['institute_ownership_type_id'] || ''));

        // Affiliation (table name = master_affiliation_body)
        const affiliationId = await findOrCreate('master_affiliation_body', 'affiliating_body_id', 'affiliating_body', String(row['affiliating_body_id'] || ''));

        // Regulatory (table name = master_regulatory_body)
        const regulatoryId = await findOrCreate('master_regulatory_body', 'regulatory_body_id', 'regulatory_body', String(row['regulatory_body_id'] || ''));

        // State — case-insensitive match
        let stateId: number | null = null;
        let lgdStateIdVal: number | null = null;
        const stateVal = normalizeText(row['lgdstateId']);
        if (stateVal) {
          const stateRows = await this.dataSource.query(`SELECT stateid, lgdstateid FROM "master_state" WHERE LOWER(statename) = LOWER($1) LIMIT 1`, [stateVal]);
          if (stateRows && stateRows.length > 0) {
            stateId = Number(stateRows[0]['stateid']);
            lgdStateIdVal = Number(stateRows[0]['lgdstateid']);
          } else {
            const maxR = await this.dataSource.query(`SELECT COALESCE(MAX(lgdstateid), 0) + 1 AS next FROM "master_state"`);
            const nextLgd = Number(maxR[0]['next']);
            const inserted = await this.dataSource.query(
              `INSERT INTO "master_state" (statename, lgdstateid, is_active, created_date, createdby) VALUES ($1, $2, 'Y', $3, 'import') RETURNING stateid`,
              [stateVal, nextLgd, now]
            );
            stateId = Number(inserted[0]['stateid']);
            lgdStateIdVal = nextLgd;
          }
        }

        // District — case-insensitive match
        let districtLgdVal: number | null = null;
        const districtVal = normalizeText(row['lgddistrictId']);
        if (districtVal && stateId) {
          const distRows = await this.dataSource.query(`SELECT "lgddistrictId" FROM "master_district" WHERE LOWER(districtname) = LOWER($1) LIMIT 1`, [districtVal]);
          if (distRows && distRows.length > 0) {
            districtLgdVal = Number(distRows[0]['lgddistrictId']);
          } else {
            const maxD = await this.dataSource.query(`SELECT COALESCE(MAX("lgddistrictId"), 0) + 1 AS next FROM "master_district"`);
            const nextDistLgd = Number(maxD[0]['next']);
            await this.dataSource.query(
              `INSERT INTO "master_district" (districtname, "lgddistrictId", lgdstateid, is_active, created_date, createdby) VALUES ($1, $2, $3, 'Y', $4, 'import')`,
              [districtVal, nextDistLgd, stateId, now]
            );
            districtLgdVal = nextDistLgd;
          }
        }

        // Enrollment
        const enrollmentId = await findOrCreate('master_institute_enrollment', 'institute_enrollment_id', 'instituteenrollmenttype', String(row['institute_enrollment_id'] || ''));

        // Check for duplicate registration_id (case-insensitive)
        const regId = row['institute_registration_id'] ? String(row['institute_registration_id']).trim() : null;
        if (regId) {
          const dup = await this.dataSource.query(
            `SELECT institute_id FROM "master_institute" WHERE LOWER(institute_registration_id) = LOWER($1) LIMIT 1`,
            [regId]
          );
          if (dup && dup.length > 0) {
            throw new Error(`Duplicate institute_registration_id "${regId}" already exists (institute_id=${dup[0].institute_id}).`);
          }
        }

        // Insert institute row and return its generated ID
        const insertedInstitute = await this.dataSource.query(
          `INSERT INTO "master_institute" (
            institute_name, university_board_id, institute_registration_id,
            institute_abbreviation, institute_type_id, institute_sub_type_id,
            institute_ownership_type_id, year_of_establishment,
            affiliating_body_id, regulatory_body_id, institute_rural_urban_status,
            "lgdstateId", "lgddistrictId", address, pincode, phone, url,
            "emailId", "altemailId", contactperson, mobileno,
            institute_enrollment_id, "totalseatIntake", is_placement_cell_available,
            placement_officer_contact_number, placement_officer_email_id,
            placement_officer_name, google_map_link,
            latitude, longitude, is_active, created_date, createdby
          ) VALUES (
            $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,'Y',$31,'import'
          ) RETURNING institute_id`,
          [
            instituteName,
            boardId,
            regId,
            row['institute_abbreviation'] ? String(row['institute_abbreviation']).trim() : null,
            typeId,
            subTypeId,
            ownershipId,
            (() => { const v = parseInt(String(row['year_of_establishment'] || ''), 10); return isNaN(v) ? null : v; })(),
            affiliationId,
            regulatoryId,
            row['institute_rural_urban_status'] ? String(row['institute_rural_urban_status']).trim().charAt(0).toUpperCase() : null,
            lgdStateIdVal,
            districtLgdVal,
            row['address'] ? String(row['address']).substring(0, 500) : null,
            row['pincode'] ? String(row['pincode']).substring(0, 6) : null,
            row['phone'] ? String(row['phone']).substring(0, 50) : null,
            row['url'] ? String(row['url']).substring(0, 500) : null,
            row['emailId'] ? String(row['emailId']).substring(0, 500) : null,
            row['altemailId'] ? String(row['altemailId']).substring(0, 500) : null,
            row['contactperson'] ? String(row['contactperson']).substring(0, 500) : null,
            row['mobileno'] ? String(row['mobileno']).substring(0, 50) : null,
            enrollmentId,
            (() => { const v = parseInt(String(row['totalseatIntake'] || ''), 10); return isNaN(v) ? null : v; })(),
            String(row['is_placement_cell_available'] || '').trim().toLowerCase() === 'yes' ? 'Y' : 'N',
            row['placement_officer_contact_number'] ? String(row['placement_officer_contact_number']).substring(0, 50) : null,
            row['placement_officer_email_id'] ? String(row['placement_officer_email_id']).substring(0, 500) : null,
            row['placement_officer_name'] ? String(row['placement_officer_name']).substring(0, 500) : null,
            row['google_map_link'] ? String(row['google_map_link']).substring(0, 1000) : null,
            row['latitude'] ? String(row['latitude']) : null,
            row['longitude'] ? String(row['longitude']) : null,
            now,
          ]
        );

        // Auto-generate User account for this institute
        const insertedInstituteId = insertedInstitute[0].institute_id;
        // Pad the ID to 5 digits (e.g., 5 -> "00005")
        const paddedId = String(insertedInstituteId).padStart(5, '0');
        const newUsername = `inst_${paddedId}`;
        const defaultPassword = `inst_${paddedId}`; // Using username as default password
        const passwordHash = await bcrypt.hash(defaultPassword, 10);
        const contactEmail = row['emailId'] ? String(row['emailId']).substring(0, 200).trim() : `${newUsername}@example.com`;

        // Safety Check: Avoid duplicate user insertion (email or username)
        const existingUser = await this.dataSource.query(
          `SELECT id FROM "users" WHERE LOWER(username) = LOWER($1) OR LOWER(email) = LOWER($2) LIMIT 1`,
          [newUsername, contactEmail]
        );

        if (existingUser && existingUser.length > 0) {
          // Skip user creation if it already exists, but log it as a partial success for the institute
          // (or we could choose to throw an error, but usually skipping is safer for batch imports)
        } else {
          await this.dataSource.query(
            `INSERT INTO "users" (
              username, email, password_hash, role, institute_id, is_active, created_date
            ) VALUES (
              $1, $2, $3, 'institute', $4, 'Y', $5
            )`,
            [newUsername, contactEmail, passwordHash, insertedInstituteId, now]
          );
        }

        successCount++;
      } catch (err: any) {
        failedRows.push({ ...row, ErrorReason: String(err?.message || 'Unknown error') });
      }
    }

    if (failedRows.length > 0) {
      const errorWs = xlsx.utils.json_to_sheet(failedRows);
      const errorWb = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(errorWb, errorWs, 'FailedRows');
      const buffer: Buffer = xlsx.write(errorWb, { type: 'buffer', bookType: 'xlsx' });
      return {
        success: false,
        message: `Imported ${successCount} institutes. ${failedRows.length} rows failed — downloading error file.`,
        errorFile: buffer,
      };
    }

    return {
      success: true,
      message: `All ${successCount} institutes imported successfully!`,
    };
  }
}
