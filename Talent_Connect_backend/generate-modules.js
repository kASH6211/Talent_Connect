const fs = require('fs');
const path = require('path');

const modules = [
    { name: 'board', entity: 'Board', pk: 'university_board_id' },
    { name: 'institute-type', entity: 'InstituteType', pk: 'institute_type_id' },
    { name: 'institute-sub-type', entity: 'InstituteSubType', pk: 'institute_sub_type_id' },
    { name: 'institute-ownership-type', entity: 'InstituteOwnershipType', pk: 'institute_ownership_type_id' },
    { name: 'affiliation', entity: 'Affiliation', pk: 'affiliating_body_id' },
    { name: 'regulatory', entity: 'Regulatory', pk: 'regulatory_body_id' },
    { name: 'state', entity: 'State', pk: 'stateid' },
    { name: 'district', entity: 'District', pk: 'districtid' },
    { name: 'institute-enrollment', entity: 'InstituteEnrollment', pk: 'institute_enrollment_id' },
    { name: 'training-type', entity: 'TrainingType', pk: 'training_type_id' },
    { name: 'qualification', entity: 'Qualification', pk: 'qualificationid' },
    { name: 'program', entity: 'Program', pk: 'programId' },
    { name: 'stream-branch', entity: 'StreamBranch', pk: 'stream_branch_Id' },
    { name: 'job-role', entity: 'JobRole', pk: 'jobrole_id' },
    { name: 'legal-entity', entity: 'LegalEntity', pk: 'legal_entity_type_id' },
    { name: 'industry-sector', entity: 'IndustrySector', pk: 'industry_sector_id' },
    { name: 'industry-scale', entity: 'IndustryScale', pk: 'industry_scale_id' },
    { name: 'identifier-type', entity: 'IdentifierType', pk: 'identifier_type_id' },
    { name: 'request-type', entity: 'RequestType', pk: 'request_type_id' },
    { name: 'request-status', entity: 'RequestStatus', pk: 'request_status_id' },
    { name: 'institute', entity: 'Institute', pk: 'institute_id' },
    { name: 'industry', entity: 'Industry', pk: 'industry_id' },
    { name: 'industry-identifier', entity: 'IndustryIdentifier', pk: 'identifier_id' },
    { name: 'industry-training-placement', entity: 'IndustryTrainingPlacement', pk: 'preference_id' },
    { name: 'industry-compliance', entity: 'IndustryCompliance', pk: 'compliance_id' },
    { name: 'industry-request', entity: 'IndustryRequest', pk: 'industry_request_id' },
    { name: 'student', entity: 'Student', pk: 'student_id' },
    { name: 'student-placement', entity: 'StudentPlacement', pk: 'placement_id' },
    { name: 'program-qualification-mapping', entity: 'ProgramQualificationMapping', pk: 'program_qualification_mapping_id' },
    { name: 'institute-program-mapping', entity: 'InstituteProgramMapping', pk: 'program_institute_mapping_id' },
    { name: 'job-role-program-mapping', entity: 'JobRoleProgramMapping', pk: 'job_role_program_mapping_id' },
];

const base = path.join(__dirname, 'src', 'modules');

for (const m of modules) {
    const { name, entity, pk } = m;
    const dir = path.join(base, name);

    const serviceSrc = `import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ${entity} } from './${name}.entity';

@Injectable()
export class ${entity}Service {
  constructor(
    @InjectRepository(${entity})
    private readonly repo: Repository<${entity}>,
  ) {}

  findAll() { return this.repo.find(); }

  async findOne(id: number) {
    const item = await this.repo.findOne({ where: { ${pk}: id } as any });
    if (!item) throw new NotFoundException('${entity} #' + id + ' not found');
    return item;
  }

  create(dto: Partial<${entity}>) { return this.repo.save(this.repo.create(dto)); }

  async update(id: number, dto: Partial<${entity}>) {
    await this.findOne(id);
    await this.repo.update({ ${pk}: id } as any, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.repo.update({ ${pk}: id } as any, { is_active: 'N' } as any);
    return { message: '${entity} #' + id + ' deactivated' };
  }
}
`;

    const controllerSrc = `import { Controller, Get, Post, Body, Param, Patch, Delete, ParseIntPipe } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ${entity}Service } from './${name}.service';
import { ${entity} } from './${name}.entity';

@ApiTags('${name}')
@Controller('${name}')
export class ${entity}Controller {
  constructor(private readonly service: ${entity}Service) {}

  @Get() findAll() { return this.service.findAll(); }
  @Get(':id') findOne(@Param('id', ParseIntPipe) id: number) { return this.service.findOne(id); }
  @Post() create(@Body() dto: Partial<${entity}>) { return this.service.create(dto); }
  @Patch(':id') update(@Param('id', ParseIntPipe) id: number, @Body() dto: Partial<${entity}>) { return this.service.update(id, dto); }
  @Delete(':id') remove(@Param('id', ParseIntPipe) id: number) { return this.service.remove(id); }
}
`;

    const moduleSrc = `import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ${entity} } from './${name}.entity';
import { ${entity}Service } from './${name}.service';
import { ${entity}Controller } from './${name}.controller';

@Module({
  imports: [TypeOrmModule.forFeature([${entity}])],
  controllers: [${entity}Controller],
  providers: [${entity}Service],
  exports: [${entity}Service],
})
export class ${entity}Module {}
`;

    fs.writeFileSync(path.join(dir, `${name}.service.ts`), serviceSrc, 'utf8');
    fs.writeFileSync(path.join(dir, `${name}.controller.ts`), controllerSrc, 'utf8');
    fs.writeFileSync(path.join(dir, `${name}.module.ts`), moduleSrc, 'utf8');
    console.log(`Generated: ${name}`);
}

console.log('\nAll modules generated successfully!');
