import { Controller, Get, Post, Patch, Body, Param, Query, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JobOfferService, BulkOfferDto } from './job-offer.service';

@ApiTags('Job Offers')
@ApiBearerAuth()
@Controller('job-offer')
export class JobOfferController {
    constructor(private readonly svc: JobOfferService) { }

    /** Industry sends offer to multiple institutes */
    @Post('bulk')
    bulkCreate(@Request() req: any, @Body() body: Omit<BulkOfferDto, 'industry_id'>) {
        const industry_id = req.user?.industry_id;
        return this.svc.bulkCreate({ ...body, industry_id });
    }

    /** Offers sent by this industry */
    @Get('sent')
    getSent(@Request() req: any) {
        return this.svc.getSentOffers(req.user?.industry_id);
    }

    /** Offers received by this institute */
    @Get('received')
    getReceived(@Request() req: any) {
        return this.svc.getReceivedOffers(req.user?.institute_id);
    }

    /** Update offer status (Accepted / Rejected / Withdrawn) */
    @Patch(':id/status')
    updateStatus(@Param('id') id: number, @Body('status') status: string) {
        return this.svc.updateStatus(+id, status);
    }

    @Get()
    findAll() { return this.svc.findAll(); }
}
