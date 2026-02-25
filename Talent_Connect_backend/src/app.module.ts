import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { BoardModule } from './modules/board/board.module';
import { InstituteTypeModule } from './modules/institute-type/institute-type.module';
import { InstituteSubTypeModule } from './modules/institute-sub-type/institute-sub-type.module';
import { InstituteOwnershipTypeModule } from './modules/institute-ownership-type/institute-ownership-type.module';
import { AffiliationModule } from './modules/affiliation/affiliation.module';
import { RegulatoryModule } from './modules/regulatory/regulatory.module';
import { StateModule } from './modules/state/state.module';
import { DistrictModule } from './modules/district/district.module';
import { InstituteEnrollmentModule } from './modules/institute-enrollment/institute-enrollment.module';
import { TrainingTypeModule } from './modules/training-type/training-type.module';
import { QualificationModule } from './modules/qualification/qualification.module';
import { ProgramModule } from './modules/program/program.module';
import { StreamBranchModule } from './modules/stream-branch/stream-branch.module';
import { JobRoleModule } from './modules/job-role/job-role.module';
import { LegalEntityModule } from './modules/legal-entity/legal-entity.module';
import { IndustrySectorModule } from './modules/industry-sector/industry-sector.module';
import { IndustryScaleModule } from './modules/industry-scale/industry-scale.module';
import { IdentifierTypeModule } from './modules/identifier-type/identifier-type.module';
import { RequestTypeModule } from './modules/request-type/request-type.module';
import { RequestStatusModule } from './modules/request-status/request-status.module';
import { InstituteModule } from './modules/institute/institute.module';
import { IndustryModule } from './modules/industry/industry.module';
import { IndustryIdentifierModule } from './modules/industry-identifier/industry-identifier.module';
import { IndustryTrainingPlacementModule } from './modules/industry-training-placement/industry-training-placement.module';
import { IndustryComplianceModule } from './modules/industry-compliance/industry-compliance.module';
import { IndustryRequestModule } from './modules/industry-request/industry-request.module';
import { StudentModule } from './modules/student/student.module';
import { StudentPlacementModule } from './modules/student-placement/student-placement.module';
import { ProgramQualificationMappingModule } from './modules/program-qualification-mapping/program-qualification-mapping.module';
import { InstituteProgramMappingModule } from './modules/institute-program-mapping/institute-program-mapping.module';
import { JobRoleProgramMappingModule } from './modules/job-role-program-mapping/job-role-program-mapping.module';
import { JobOfferModule } from './modules/job-offer/job-offer.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 5432),
        username: config.get<string>('DB_USERNAME', 'postgres'),
        password: config.get<string>('DB_PASSWORD', 'postgres'),
        database: config.get<string>('DB_DATABASE', 'talent_connect'),
        autoLoadEntities: true,
        synchronize: true, // Set to false in production; use migrations
        logging: config.get<string>('NODE_ENV') !== 'production',
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    BoardModule,
    InstituteTypeModule,
    InstituteSubTypeModule,
    InstituteOwnershipTypeModule,
    AffiliationModule,
    RegulatoryModule,
    StateModule,
    DistrictModule,
    InstituteEnrollmentModule,
    TrainingTypeModule,
    QualificationModule,
    ProgramModule,
    StreamBranchModule,
    JobRoleModule,
    LegalEntityModule,
    IndustrySectorModule,
    IndustryScaleModule,
    IdentifierTypeModule,
    RequestTypeModule,
    RequestStatusModule,
    InstituteModule,
    IndustryModule,
    IndustryIdentifierModule,
    IndustryTrainingPlacementModule,
    IndustryComplianceModule,
    IndustryRequestModule,
    StudentModule,
    StudentPlacementModule,
    ProgramQualificationMappingModule,
    InstituteProgramMappingModule,
    JobRoleProgramMappingModule,
    JobOfferModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
  ],
})
export class AppModule { }
