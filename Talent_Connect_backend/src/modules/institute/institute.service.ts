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
    const streamIds = parse(q.stream_ids);

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
        'i.contactperson             AS contactperson',
        'i.placement_officer_email_id AS po_email',
        'i.placement_officer_contact_number AS po_mobile',
      ])
      .addSelect(`(
        SELECT COUNT(*)
        FROM student_details s
        WHERE s.institute_id = i.institute_id
          AND s.is_active = 'Y'
          ${qualIds.length ? `AND s.qualificationid IN (${qualIds.join(',')})` : ''}
          ${streamIds.length ? `AND s."stream_branch_Id" IN (${streamIds.join(',')})` : ''}
      )`, 'student_count')
      .where(`i.is_active = 'Y'`);

    if (districtIds.length) qb.andWhere(`i."lgddistrictId" IN (:...dids)`, { dids: districtIds });
    if (typeIds.length) qb.andWhere(`i.institute_type_id IN (:...tids)`, { tids: typeIds });
    if (ownershipIds.length) qb.andWhere(`i.institute_ownership_type_id IN (:...oids)`, { oids: ownershipIds });

    // Qualification filter: institutes with matching qualifications in mapping_institute_qualification
    if (qualIds.length) {
      qb.andWhere(
        `i.institute_id IN (SELECT DISTINCT "instituteId" FROM mapping_institute_qualification WHERE is_active = 'Y' AND qualificationid = ANY(:qids))`,
        { qids: qualIds },
      );
    }

    // Stream filter: directly match stream_branch_Id in mapping_institute_qualification
    if (streamIds.length) {
      qb.andWhere(
        `i.institute_id IN (SELECT DISTINCT "instituteId" FROM mapping_institute_qualification WHERE is_active = 'Y' AND "stream_branch_Id" = ANY(:sids))`,
        { sids: streamIds },
      );
    }

    const sortCol = q.sort === 'name' ? 'i.institute_name' : 'student_count';
    const dir = (q.order ?? 'desc').toUpperCase() as 'ASC' | 'DESC';
    qb.orderBy(sortCol === 'student_count' ? 'student_count' : sortCol, dir);

    const rows = await qb.getRawMany();

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
      contactperson: r.contactperson ?? '',
      po_email: r.po_email ?? r.email ?? '',
      po_mobile: r.po_mobile ?? r.mobileno ?? '',
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
        const stateVal = normalizeText(row['lgdstateId']);
        if (stateVal) {
          const stateRows = await this.dataSource.query(`SELECT stateid FROM "master_state" WHERE LOWER(statename) = LOWER($1) LIMIT 1`, [stateVal]);
          if (stateRows && stateRows.length > 0) {
            stateId = Number(stateRows[0]['stateid']);
          } else {
            const maxR = await this.dataSource.query(`SELECT COALESCE(MAX(lgdstateid), 0) + 1 AS next FROM "master_state"`);
            const inserted = await this.dataSource.query(
              `INSERT INTO "master_state" (statename, lgdstateid, is_active, created_date, createdby) VALUES ($1, $2, 'Y', $3, 'import') RETURNING stateid`,
              [stateVal, Number(maxR[0]['next']), now]
            );
            stateId = Number(inserted[0]['stateid']);
          }
        }

        // District — case-insensitive match
        let districtId: number | null = null;
        const districtVal = normalizeText(row['lgddistrictId']);
        if (districtVal && stateId) {
          const distRows = await this.dataSource.query(`SELECT districtid FROM "master_district" WHERE LOWER(districtname) = LOWER($1) LIMIT 1`, [districtVal]);
          if (distRows && distRows.length > 0) {
            districtId = Number(distRows[0]['districtid']);
          } else {
            const maxD = await this.dataSource.query(`SELECT COALESCE(MAX("lgddistrictId"), 0) + 1 AS next FROM "master_district"`);
            const inserted = await this.dataSource.query(
              `INSERT INTO "master_district" (districtname, "lgddistrictId", lgdstateid, is_active, created_date, createdby) VALUES ($1, $2, $3, 'Y', $4, 'import') RETURNING districtid`,
              [districtVal, Number(maxD[0]['next']), stateId, now]
            );
            districtId = Number(inserted[0]['districtid']);
          }
        }

        // Enrollment
        const enrollmentId = await findOrCreate('master_institute_enrollment', 'institute_enrollment_id', 'instituteenrollmenttype', String(row['institute_enrollment_id'] || ''));

        // Check for duplicate registration_id
        const regId = row['institute_registration_id'] ? String(row['institute_registration_id']).trim() : null;
        if (regId) {
          const dup = await this.dataSource.query(
            `SELECT institute_id FROM "master_institute" WHERE institute_registration_id = $1 LIMIT 1`,
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
            latitude, longitude, is_active, created_date, createdby
          ) VALUES (
            $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,'Y',$29,'import'
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
            stateId,
            districtId,
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

        await this.dataSource.query(
          `INSERT INTO "users" (
            username, email, password_hash, role, institute_id, is_active, created_date
          ) VALUES (
            $1, $2, $3, 'institute', $4, 'Y', $5
          )`,
          [newUsername, contactEmail, passwordHash, insertedInstituteId, now]
        );

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
