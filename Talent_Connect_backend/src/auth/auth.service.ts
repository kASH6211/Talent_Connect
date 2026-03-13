import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../modules/users/user.entity';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import * as crypto from 'crypto';
import { Industry } from '../modules/industry/industry.entity';
import { IndustryIdentifier } from '../modules/industry-identifier/industry-identifier.entity';
import { IdentifierType } from '../modules/identifier-type/identifier-type.entity';
import { LegalEntity } from '../modules/legal-entity/legal-entity.entity';
import { Institute } from '../modules/institute/institute.entity';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
        @InjectRepository(Industry)
        private readonly industryRepo: Repository<Industry>,
        @InjectRepository(IndustryIdentifier)
        private readonly industryIdentifierRepo: Repository<IndustryIdentifier>,
        @InjectRepository(IdentifierType)
        private readonly identifierTypeRepo: Repository<IdentifierType>,
        @InjectRepository(LegalEntity)
        private readonly legalEntityRepo: Repository<LegalEntity>,
        @InjectRepository(Institute)
        private readonly instituteRepo: Repository<Institute>,
        private readonly jwtService: JwtService,
    ) { }

    async register(dto: RegisterDto) {
        const existing = await this.userRepo.findOne({
            where: [{ username: dto.username }, { email: dto.email }],
        });
        if (existing) throw new UnauthorizedException('Username or email already taken');

        const password_hash = await bcrypt.hash(dto.password, 10);
        const user = this.userRepo.create({
            username: dto.username,
            email: dto.email,
            password_hash,
            role: dto.role || 'admin',
            created_date: new Date().toISOString(),
        });
        const saved = await this.userRepo.save(user);
        return this.signToken(saved);
    }

    async login(dto: LoginDto) {
        const user = await this.userRepo.findOne({ where: { username: dto.username } });
        if (!user || user.is_active !== 'Y')
            throw new UnauthorizedException('Invalid credentials');

        const valid = await bcrypt.compare(dto.password, user.password_hash);
        if (!valid) throw new UnauthorizedException('Invalid credentials');

        return this.signToken(user);
    }

    async handleSSOCallback(msg: string) {
        // Step 1: Decrypt the message
        const password = "N989I0998C--S123";
        const decipher = crypto.createDecipheriv('aes-128-ecb', Buffer.from(password), null);
        let decrypted = decipher.update(Buffer.from(msg, 'base64'));
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        const decryptedString = decrypted.toString('utf-8');

        // Step 2: Extract Checksum and Data
        // Format: <uuid> | <name> | <portal> | <email> | <mobile> | <json_payload> | <PAN> | <Company> | <HMAC_CHECKSUM>
        const parts = decryptedString.split('|');
        if (parts.length < 9) {
            throw new UnauthorizedException('Invalid SSO Payload Format');
        }

        const providedChecksum = parts.pop(); // Remove the checksum from the array
        const dataString = parts.join('|'); // The data string is the rest of it

        // Step 3: Verify Checksum
        const hmac = crypto.createHmac('sha256', 'BF9EFK9tEbJF');
        hmac.update(dataString);
        const calculatedChecksum = hmac.digest('hex');

        if (providedChecksum !== calculatedChecksum) {
            throw new UnauthorizedException('SSO Checksum Validation Failed');
        }

        // Step 4: Parse internal JSON Data payload
        const jsonPayloadString = parts[5];
        let ssoData;
        try {
            ssoData = JSON.parse(jsonPayloadString);
        } catch (e) {
            throw new UnauthorizedException('Failed to parse SSO JSON payload');
        }

        const { firstname, lastname, email, mobileno, PAN, CompanyName } = ssoData;
        const ssoUsername = `sso_${PAN}_${Date.now()}`;

        if (!PAN) {
            throw new UnauthorizedException('PAN number is missing from SSO payload');
        }

        // Step 5: Master Industry Identifier Mapping
        // Find identifier type for PAN
        let panIdentifierType = await this.identifierTypeRepo.findOne({
            where: { identifier_type_abbreviation: 'PAN' }
        });

        if (!panIdentifierType) {
            // Need a fallback if seeding wasn't done correctly
            panIdentifierType = await this.identifierTypeRepo.save({
                identifier_type: 'PAN (Permanent Account Number)',
                identifier_type_abbreviation: 'PAN',
                is_active: 'Y',
            });
        }

        // Search for existing Industry Identifier matching this PAN
        const existingMapping = await this.industryIdentifierRepo.findOne({
            where: {
                identifier_type_id: panIdentifierType.identifier_type_id,
                identifier_value: PAN
            },
            relations: ['industry']
        });

        let targetIndustryId: number;

        if (existingMapping && existingMapping.industry) {
            // Update the existing Industry profile with new data
            targetIndustryId = existingMapping.industry.industry_id;

            await this.industryRepo.update(targetIndustryId, {
                industry_name: CompanyName || existingMapping.industry.industry_name,
                emailId: email || existingMapping.industry.emailId,
                mobileno: mobileno || existingMapping.industry.mobileno,
                contactperson: `${firstname || ''} ${lastname || ''}`.trim() || existingMapping.industry.contactperson
            });

        } else {
            // Create a brand new Industry

            // Assign a default Legal Entity Type if none specified by SSO
            let defaultLegalEntity = await this.legalEntityRepo.findOne({ where: {} });
            if (!defaultLegalEntity) {
                // Create a default legal entity type for SSO imports
                defaultLegalEntity = await this.legalEntityRepo.save({
                    legal_entity_type: 'Default Legal Entity',
                    legal_entity_type_abbreviation: 'DEFAULT',
                });
            }
            let legalEntityTypeId = defaultLegalEntity.legal_entity_type_id;

            const newIndustry = this.industryRepo.create({
                industry_name: CompanyName || 'Unknown SSO Company',
                legal_entity_type_id: legalEntityTypeId,
                emailId: email,
                mobileno: mobileno,
                contactperson: `${firstname || ''} ${lastname || ''}`.trim(),
                is_active: 'Y',
                created_date: new Date().toISOString(),
                createdby: 'sso_import'
            });
            const savedIndustry = await this.industryRepo.save(newIndustry);
            targetIndustryId = savedIndustry.industry_id;

            // Map it to the identifier table
            await this.industryIdentifierRepo.save({
                industry_id: targetIndustryId,
                identifier_type_id: panIdentifierType.identifier_type_id,
                identifier_value: PAN,
                is_active: 'Y',
                created_date: new Date().toISOString(),
                createdby: 'sso_import'
            });
        }

        // Step 6: Create or Lookup User based on PAN mapping
        // Find a user linked to the industry identified by the PAN; if none, create a new SSO user
        let user = await this.userRepo.findOne({ where: { industry_id: targetIndustryId } });

        if (!user) {
            // No existing user for this industry; create a new SSO user with a random password
            const randomPass = crypto.randomBytes(32).toString('hex');
            const password_hash = await bcrypt.hash(randomPass, 10);

            const newUser = this.userRepo.create({
                username: ssoUsername,
                email: email,
                password_hash: password_hash,
                role: 'industry',
                industry_id: targetIndustryId,
                created_date: new Date().toISOString(),
            });
            user = await this.userRepo.save(newUser);
        }

        // Generate and return JWT
        return this.signToken(user);
    }

    async validateUser(payload: { sub: number; username: string }) {
        return this.userRepo.findOne({ where: { id: payload.sub, is_active: 'Y' } });
    }

    async changePassword(userId: number, oldPass: string, newPass: string) {
        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (!user) throw new UnauthorizedException('User not found');

        const valid = await bcrypt.compare(oldPass, user.password_hash);
        if (!valid) throw new UnauthorizedException('Invalid current password');

        const password_hash = await bcrypt.hash(newPass, 10);
        await this.userRepo.update(userId, { password_hash });
        return { message: 'Password changed successfully' };
    }

    async resetInstitutePassword(instituteId: number, newPass: string) {
        let user = await this.userRepo.findOne({ where: { institute_id: instituteId } });
        const password_hash = await bcrypt.hash(newPass, 10);

        if (user) {
            await this.userRepo.update(user.id, { password_hash });
            return { message: `Password for user '${user.username}' updated successfully` };
        } else {
            // Create user if it doesn't exist
            const institute = await this.instituteRepo.findOne({ where: { institute_id: instituteId } });
            if (!institute) throw new UnauthorizedException('Institute not found');

            const paddedId = instituteId.toString().padStart(5, '0');
            const newUser = this.userRepo.create({
                username: `inst_${paddedId}`,
                email: institute.emailId || `inst_${paddedId}@talentconnect.com`,
                password_hash,
                role: 'institute',
                institute_id: instituteId,
                created_date: new Date().toISOString(),
            });
            await this.userRepo.save(newUser);
            return { message: `User account '${newUser.username}' created and password set successfully` };
        }
    }

    private signToken(user: User) {
        const payload = {
            sub: user.id,
            username: user.username,
            role: user.role,
            industry_id: user.industry_id ?? null,
            institute_id: user.institute_id ?? null,
        };
        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                industry_id: user.industry_id ?? null,
                institute_id: user.institute_id ?? null,
            },
        };
    }
}
