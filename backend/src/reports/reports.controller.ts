import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiForbiddenResponse,
    ApiOkResponse,
    ApiOperation,
    ApiProduces,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { UserRole } from '../auth/user.entity';
import { ReportsService } from './reports.service';

@ApiTags('Reports')
@ApiBearerAuth('access-token')
@ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
@ApiForbiddenResponse({ description: 'Requires admin or hr role' })
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly service: ReportsService) {}

  @Get('excel')
  @Roles(UserRole.ADMIN, UserRole.HR)
  @ApiOperation({
    summary: 'Export employees as Excel (.xlsx)',
    description:
      'Generates and downloads a full employee report in Excel format. ' +
      'Requires **admin** or **hr** role.',
  })
  @ApiProduces('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  @ApiOkResponse({
    description: 'Excel file download (application/vnd.openxmlformats-officedocument.spreadsheetml.sheet)',
    schema: { type: 'string', format: 'binary' },
  })
  async downloadExcel(@Res() res: Response) {
    const buffer = await this.service.generateExcel();
    const filename = `rapport_employes_${new Date().toISOString().split('T')[0]}.xlsx`;
    res.set({
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': buffer.length,
    });
    res.send(buffer);
  }

  @Get('pdf')
  @Roles(UserRole.ADMIN, UserRole.HR)
  @ApiOperation({
    summary: 'Export employees as PDF',
    description:
      'Generates and downloads a full employee report in PDF format. ' +
      'Requires **admin** or **hr** role.',
  })
  @ApiProduces('application/pdf')
  @ApiOkResponse({
    description: 'PDF file download (application/pdf)',
    schema: { type: 'string', format: 'binary' },
  })
  async downloadPDF(@Res() res: Response) {
    const buffer = await this.service.generatePDF();
    const filename = `rapport_employes_${new Date().toISOString().split('T')[0]}.pdf`;
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': buffer.length,
    });
    res.send(buffer);
  }
}
