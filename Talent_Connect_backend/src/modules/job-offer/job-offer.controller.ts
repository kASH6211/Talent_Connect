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
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    getSent(@Request() req: any, @Query('page') page?: number, @Query('limit') limit?: number) {
        return this.svc.getSentOffers(req.user?.industry_id, page, limit);
    }

    /** Offers received by this institute */
    @Get('received')
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    getReceived(@Request() req: any, @Query('page') page?: number, @Query('limit') limit?: number) {
        return this.svc.getReceivedOffers(req.user?.institute_id, page, limit);
    }

    /** Update offer status (Accepted / Rejected / Withdrawn) */
    @Patch(':id/status')
    updateStatus(@Param('id') id: number, @Body('status') status: string) {
        return this.svc.updateStatus(+id, status);
    }

    /** Bulk update status for multiple offers */
    @Patch('bulk-status')
    bulkUpdateStatus(@Body() body: { ids: number[], status: string }) {
        return this.svc.bulkUpdateStatus(body.ids, body.status);
    }

    @Get()
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    findAll(@Query('page') page?: number, @Query('limit') limit?: number) {
        return this.svc.findAll(page, limit);
    }
}
