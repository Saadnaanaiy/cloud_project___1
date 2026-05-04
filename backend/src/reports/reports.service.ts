import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as ExcelJS from 'exceljs';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Repository } from 'typeorm';
import { Attendance } from '../attendance/attendance.entity';
import { Employee } from '../employees/employee.entity';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Employee) private readonly empRepo: Repository<Employee>,
    @InjectRepository(Attendance) private readonly attRepo: Repository<Attendance>,
  ) {}

  // ─────────────────────────────────────── EXCEL ──────────────────────────────
  async generateExcel(): Promise<Buffer> {
    const employees = await this.empRepo.find({ relations: ['department'] });
    const attendance = await this.attRepo.find({
      relations: ['employee', 'employee.department'],
      order: { date: 'DESC' },
      take: 500,
    });

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Employee Management System';
    workbook.created = new Date();

    // ── Sheet 1: Employees ──────────────────────────────────────────────────
    const empSheet = workbook.addWorksheet('Employees', {
      properties: { tabColor: { argb: '111827' } },
    });
    empSheet.columns = [
      { header: '#', key: 'id', width: 6 },
      { header: 'First Name', key: 'firstName', width: 18 },
      { header: 'Last Name', key: 'lastName', width: 18 },
      { header: 'Email', key: 'email', width: 32 },
      { header: 'Phone', key: 'phone', width: 20 },
      { header: 'Position', key: 'position', width: 25 },
      { header: 'Department', key: 'department', width: 20 },
      { header: 'Hire Date', key: 'hireDate', width: 14 },
      { header: 'Salary (MAD)', key: 'salary', width: 15 },
      { header: 'Status', key: 'status', width: 13 },
    ];

    const headerRow = empSheet.getRow(1);
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '111827' },
    };
    headerRow.font = {
      bold: true,
      color: { argb: 'FFFFFF' },
      size: 11,
      name: 'Calibri',
    };
    headerRow.height = 26;
    headerRow.alignment = { vertical: 'middle', horizontal: 'left' };
    headerRow.eachCell((cell) => {
      cell.border = { bottom: { style: 'thin', color: { argb: '374151' } } };
    });

    employees.forEach((e, i) => {
      const row = empSheet.addRow({
        id: i + 1,
        firstName: e.firstName,
        lastName: e.lastName,
        email: e.email,
        phone: e.phone || '—',
        position: e.position || '—',
        department: e.department?.name || '—',
        hireDate: e.hireDate || '—',
        salary: e.salary ? Number(e.salary).toLocaleString() : '—',
        status: e.status.replace('_', ' ').toUpperCase(),
      });
      row.height = 20;
      row.font = { name: 'Calibri', size: 10 };
      row.alignment = { vertical: 'middle' };

      if (i % 2 === 0) {
        row.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'F9FAFB' },
        };
      }

      const statusCell = row.getCell('status');
      if (e.status === 'active')
        statusCell.font = {
          color: { argb: '059669' },
          bold: true,
          size: 10,
          name: 'Calibri',
        };
      else if (e.status === 'blocked')
        statusCell.font = {
          color: { argb: 'DC2626' },
          bold: true,
          size: 10,
          name: 'Calibri',
        };
      else if (e.status === 'on_leave')
        statusCell.font = {
          color: { argb: 'D97706' },
          bold: true,
          size: 10,
          name: 'Calibri',
        };
    });

    // Auto-filter
    empSheet.autoFilter = { from: 'A1', to: 'J1' };

    // ── Sheet 2: Attendance ─────────────────────────────────────────────────
    const attSheet = workbook.addWorksheet('Attendance', {
      properties: { tabColor: { argb: '059669' } },
    });
    attSheet.columns = [
      { header: 'Date', key: 'date', width: 14 },
      { header: 'Employee ID', key: 'empId', width: 13 },
      { header: 'Full Name', key: 'name', width: 26 },
      { header: 'Department', key: 'dept', width: 22 },
      { header: 'Status', key: 'status', width: 14 },
    ];
    const attHeader = attSheet.getRow(1);
    attHeader.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '111827' },
    };
    attHeader.font = {
      bold: true,
      color: { argb: 'FFFFFF' },
      size: 11,
      name: 'Calibri',
    };
    attHeader.height = 26;
    attHeader.alignment = { vertical: 'middle' };

    attendance.forEach((a, i) => {
      const row = attSheet.addRow({
        date: a.date,
        empId: a.employeeId,
        name: `${a.employee?.firstName || ''} ${a.employee?.lastName || ''}`.trim(),
        dept: a.employee?.department?.name || '—',
        status: a.status.toUpperCase(),
      });
      row.height = 20;
      row.font = { name: 'Calibri', size: 10 };
      if (i % 2 === 0)
        row.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'F9FAFB' },
        };
    });
    attSheet.autoFilter = { from: 'A1', to: 'E1' };

    // ── Sheet 3: Statistics ─────────────────────────────────────────────────
    const statsSheet = workbook.addWorksheet('Statistics');
    const stats = await this.getStats();

    statsSheet.getColumn(1).width = 30;
    statsSheet.getColumn(2).width = 18;

    const titleRow = statsSheet.addRow(['EMPLOYEE STATISTICS']);
    titleRow.font = {
      bold: true,
      size: 16,
      name: 'Calibri',
      color: { argb: '111827' },
    };
    titleRow.height = 32;

    const subRow = statsSheet.addRow([
      `Generated: ${new Date().toLocaleString('en-GB')}`,
    ]);
    subRow.font = {
      italic: true,
      color: { argb: '6B7280' },
      size: 10,
      name: 'Calibri',
    };
    statsSheet.addRow([]);

    const hRow = statsSheet.addRow(['Metric', 'Value']);
    hRow.font = { bold: true, size: 11, name: 'Calibri' };
    hRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'F3F4F6' },
    };
    hRow.height = 22;

    const statsData = [
      ['Total Employees', stats.total],
      ['Active', stats.active],
      ['Blocked', stats.blocked],
      ['On Leave', stats.onLeave],
      [
        'Attendance Rate',
        stats.total > 0
          ? `${Math.round((stats.active / stats.total) * 100)}%`
          : '—',
      ],
    ];
    statsData.forEach(([label, value], i) => {
      const r = statsSheet.addRow([label, value]);
      r.font = { size: 10, name: 'Calibri' };
      r.height = 20;
      if (i % 2 === 0)
        r.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FAFAFA' },
        };
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  // ─────────────────────────────────────── PDF ────────────────────────────────
  async generatePDF(): Promise<Buffer> {
    const employees = await this.empRepo.find({
      relations: ['department'],
      order: { firstName: 'ASC' },
    });
    const stats = await this.getStats();

    const doc = this.initPDF();
    const PW = doc.internal.pageSize.getWidth();
    const PH = doc.internal.pageSize.getHeight();

    const colors = this.getPDFColors();
    const genDate = this.getFormattedDate();

    // ══════════════════════════════════ PAGE 1 ════════════════════════════════
    this.drawPDFHeader(doc, PW, colors.PRIMARY, genDate);
    this.drawPDFKPIs(doc, PW, stats, colors, PH);
    const tableTopY = 87; // Adjusted after KPI block

    // ── Employee table ───────────────────────────────────────────────────────
    this.drawPDFTable(doc, employees, colors, tableTopY);

    // ── Footer every page ────────────────────────────────────────────────────
    this.drawPDFFooter(doc, PW, PH, colors.MUTED);

    return Buffer.from(doc.output('arraybuffer'));
  }

  private initPDF(): jsPDF {
    return new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    });
  }

  private getPDFColors() {
    return {
      INK: [15, 23, 42] as [number, number, number],
      MUTED: [100, 116, 139] as [number, number, number],
      LINE: [226, 232, 240] as [number, number, number],
      PRIMARY: [99, 102, 241] as [number, number, number],
      GREEN: [16, 185, 129] as [number, number, number],
      RED: [239, 68, 68] as [number, number, number],
      AMBER: [245, 158, 11] as [number, number, number],
    };
  }

  private getFormattedDate(): string {
    return new Date().toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }

  private drawPDFHeader(doc: jsPDF, PW: number, PRIMARY: [number, number, number], genDate: string) {
    doc.setFillColor(...PRIMARY);
    doc.rect(0, 0, PW, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(26);
    doc.setFont('helvetica', 'bold');
    doc.text('Employee Directory & Statistics', 20, 20);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(226, 232, 240);
    doc.text(`Generated on ${genDate}  |  Strictly Confidential`, 20, 28);
  }

  private drawPDFKPIs(doc: jsPDF, PW: number, stats: any, colors: any, PH: number) {
    const kpis = [
      { label: 'Total Employees', value: String(stats.total) },
      { label: 'Active Personnel', value: String(stats.active) },
      { label: 'Currently On Leave', value: String(stats.onLeave) },
      { label: 'Account Blocked', value: String(stats.blocked) },
    ];

    const kpiW = 55;
    const kpiH = 24;
    const kpiY = 48;
    const gap = (PW - 40 - kpis.length * kpiW) / (kpis.length - 1);

    kpis.forEach((k, i) => {
      const x = 20 + i * (kpiW + gap);
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(x, kpiY, kpiW, kpiH, 3, 3, 'F');
      doc.setDrawColor(...(colors.LINE as [number, number, number]));
      doc.setLineWidth(0.5);
      doc.roundedRect(x, kpiY, kpiW, kpiH, 3, 3, 'S');

      doc.setTextColor(...(colors.INK as [number, number, number]));
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.text(k.value, x + kpiW / 2, kpiY + 12, { align: 'center' });

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...(colors.MUTED as [number, number, number]));
      doc.text(k.label.toUpperCase(), x + kpiW / 2, kpiY + 19, { align: 'center' });
    });
  }

  private drawPDFTable(doc: jsPDF, employees: Employee[], colors: any, startY: number) {
    autoTable(doc, {
      startY,
      margin: { left: 20, right: 20 },
      head: [['ID', 'Full Name', 'Email Address', 'Department', 'Position', 'Hire Date', 'Salary', 'Status']],
      body: employees.map((e) => [
        `EMP-${String(e.id).padStart(4, '0')}`,
        `${e.firstName} ${e.lastName}`,
        e.email || '—',
        e.department?.name || '—',
        e.position || '—',
        e.hireDate || '—',
        e.salary ? Number(e.salary).toLocaleString() + ' MAD' : '—',
        e.status.replace('_', ' ').toUpperCase(),
      ]),
      styles: {
        font: 'helvetica',
        fontSize: 9,
        cellPadding: { top: 6, bottom: 6, left: 5, right: 5 },
        textColor: colors.INK,
        lineColor: colors.LINE,
        lineWidth: { bottom: 0.2, top: 0, left: 0, right: 0 },
      },
      headStyles: {
        fillColor: [241, 245, 249],
        textColor: colors.INK,
        fontStyle: 'bold',
        fontSize: 9,
        halign: 'left',
        lineWidth: { bottom: 0.5, top: 0, left: 0, right: 0 },
        lineColor: [148, 163, 184],
      },
      alternateRowStyles: { fillColor: [255, 255, 255] },
      columnStyles: {
        0: { cellWidth: 20 },
        1: { cellWidth: 40, fontStyle: 'bold' },
        2: { cellWidth: 50 },
        3: { cellWidth: 35 },
        4: { cellWidth: 40 },
        5: { cellWidth: 25 },
        6: { cellWidth: 25, halign: 'right' },
        7: { cellWidth: 22, halign: 'center' },
      },
      didParseCell: (data) => {
        if (data.column.index === 7 && data.section === 'body') {
          const rawValue = data.cell.raw;
          const val = (typeof rawValue === 'string' ? rawValue : String(rawValue ?? '')).toLowerCase();
          if (val === 'active') data.cell.styles.textColor = colors.GREEN;
          else if (val === 'blocked') data.cell.styles.textColor = colors.RED;
          else if (val === 'on leave') data.cell.styles.textColor = colors.AMBER;
          data.cell.styles.fontStyle = 'bold';
        }
      },
    });
  }

  private drawPDFFooter(doc: jsPDF, PW: number, PH: number, MUTED: [number, number, number]) {
    const totalPages = (doc as any).internal.getNumberOfPages();
    for (let p = 1; p <= totalPages; p++) {
      doc.setPage(p);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...MUTED);
      doc.text('Employee Management System - Generated automatically', 20, PH - 10);
      doc.text(`Page ${p} of ${totalPages}`, PW - 20, PH - 10, { align: 'right' });
    }
  }

  // ─────────────────────────────── helpers ────────────────────────────────────
  private async getStats() {
    const total = await this.empRepo.count();
    const active = await this.empRepo.count({
      where: { status: 'active' as any },
    });
    const blocked = await this.empRepo.count({
      where: { status: 'blocked' as any },
    });
    const onLeave = await this.empRepo.count({
      where: { status: 'on_leave' as any },
    });
    return { total, active, blocked, onLeave };
  }
}
