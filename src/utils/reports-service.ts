import * as fs from 'fs';
import * as path from 'path';
import * as ejs from 'ejs';
import { Request, Response } from 'express';
import { JSDOM } from 'jsdom';
import puppeteer, { PDFOptions } from 'puppeteer';
import * as XLSX from 'xlsx';
import { PDFDocument } from 'pdf-lib';

export class ReportsService {
  constructor() {
    this.checkFolderSaveFile();
  }

  private getPathFile(fileName: string) {
    return path.join(process.cwd(), 'public', `${fileName}`);
  }

  private handleResponse(fileName: string) {
    const baseUrl = process.env.BASE_URL || 'http://localhost';
    const port = process.env.PORT || '3000';

    return baseUrl.includes('localhost') ? `${baseUrl}:${port}/public/${fileName}` : `${baseUrl}/public/${fileName}`;
  }

  private checkFolderSaveFile() {
    if (!fs.existsSync(path.join(process.cwd(), 'public'))) {
      fs.mkdirSync(path.join(process.cwd(), 'public'));
    }
  }

  async handleLoadEjs(ejsFileName: string, reportData: Record<string, unknown>) {
    const templatePath = path.join(process.cwd(), 'src/controllers/reports/views', ejsFileName);

    return await ejs.renderFile(templatePath, reportData);
  }

  async generateHtml(fileName: string, htmlContent: string) {
    const fileNameHtml = `${fileName}.html`;
    const htmlPath = this.getPathFile(fileNameHtml);
    await fs.promises.writeFile(htmlPath, htmlContent);

    return this.handleResponse(fileNameHtml);
  }

  async generatePDF(fileName: string, htmlContent: string, PDFOptions?: PDFOptions) {
    const browser = await puppeteer.launch({
      executablePath: process.env.CHROME_PATH || '/usr/bin/google-chrome',
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--font-render-hinting=medium'],
      timeout: 60000,
    });
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    const fileNamePdf = `${fileName}.pdf`;
    const pdfPath = this.getPathFile(fileNamePdf);

    await page.pdf({
      path: pdfPath,
      format: 'A4',
      printBackground: true,
      margin: {
        top: '10mm',
        right: '5mm',
        bottom: '10mm',
        left: '5mm',
      },
      ...PDFOptions,
    });
    await browser.close();

    return this.handleResponse(fileNamePdf);
  }

  async generatePDFStream(htmlContent: string, PDFOptions?: PDFOptions) {
    const browser = await puppeteer.launch({
      executablePath: process.env.CHROME_PATH || '/usr/bin/google-chrome',
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--font-render-hinting=medium'],
      timeout: 10 * 60 * 1000,
      protocolTimeout: 10 * 60 * 1000,
    });

    const page = await browser.newPage();
    try {
      await page.setContent(htmlContent);

      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '10mm',
          right: '5mm',
          bottom: '10mm',
          left: '5mm',
        },
        displayHeaderFooter: true,
        headerTemplate: `<div style="font-size: 10px; width: 100%; text-align: right; padding-right: 10mm;">
            Page <span class="pageNumber"></span> / <span class="totalPages"></span>
          </div>`,
        footerTemplate: '<span></span>',
        preferCSSPageSize: true,
        omitBackground: false,
        timeout: 0,
        ...PDFOptions,
      });

      return pdfBuffer;
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new Error('Failed to generate PDF');
    } finally {
      await browser.close();
    }
  }

  async generateExcelFromHtml(fileName: string, htmlContent: string) {
    const dom = new JSDOM(htmlContent);
    const document = dom.window.document;
    const table = document.querySelector('#tbody');
    if (!table) {
      throw new Error('No table found in the provided HTML content.');
    }
    const worksheet = XLSX.utils.table_to_book(table);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Report Data');

    const fileNameExcel = `${fileName}.xlsx`;
    const excelPath = this.getPathFile(fileNameExcel);
    XLSX.writeFile(workbook, excelPath);

    return this.handleResponse(fileNameExcel);
  }

  async generateStreamExcelFromHtml(htmlContent: string) {
    const dom = new JSDOM(htmlContent);
    const document = dom.window.document;

    const table = document.querySelector('#tbody');
    if (!table) {
      throw new Error('No table found in the provided HTML content.');
    }

    const worksheet = XLSX.utils.table_to_sheet(table);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Report Data');

    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    return excelBuffer;
  }

  async generatePdfOrXcel(reportType: 'pdf' | 'excel' | 'html', fileName: string, htmlContent: string, PDFOptions?: PDFOptions) {
    switch (reportType) {
      case 'pdf':
        return await this.generatePDF(fileName, htmlContent, PDFOptions);
      case 'excel':
        return await this.generateExcelFromHtml(fileName, htmlContent);
      case 'html':
        return this.generateHtml(fileName, htmlContent);
      default:
        return htmlContent;
    }
  }

  async generateStreamPdfOrXcel(
    reportType: 'pdf' | 'excel' | 'html',
    fileName: string,
    htmlContent: string | [],
    res: Response,
    PDFOptions?: PDFOptions & Record<string, string | boolean | number>,
  ) {
    switch (reportType) {
      // case 'pdf':
      //   const pdfBuffer = await this.generatePDFStream(htmlContent, PDFOptions);
      //   if (!pdfBuffer) return res.status(500).send('Failed to Generate PDF');
      //   res.set({
      //     'Content-Type': 'application/pdf',
      //     'Content-Disposition': `inline; filename="${fileName}.pdf"`,
      //   });
      //   return res.end(pdfBuffer);
      case 'pdf':
        let pdfBuffer = await this.generatePDFStream(htmlContent as string, PDFOptions);
        if (!pdfBuffer) {
          return res.status(500).send('Failed to generate PDF');
        }
        const pdfDoc = await PDFDocument.load(pdfBuffer);
        const totalPages = pdfDoc.getPageCount();
        let pageNumber = +(PDFOptions?.pageNumber || 1);
        if (PDFOptions?.displayHeaderFooter || PDFOptions?.displayHeaderFooter === false) {
          const pages = pdfDoc.getPages();

          pages.forEach((page, _index) => {
            const { width, height } = page.getSize();
            page.drawText(`Page ${pageNumber}`, {
              x: width - 50,
              y: height - 20,
              size: 8,
            });
            pageNumber++;
          });
          pdfBuffer = await pdfDoc.save();
        }

        res.set({
          'Content-Type': 'application/pdf',
          'Content-Disposition': `inline; filename="${fileName}.pdf"`,
          'X-Total-Pages': totalPages.toString(),
          'X-Page-Number': pageNumber.toString(),
          'Access-Control-Expose-Headers': 'X-Total-Pages, X-Page-Number',
        });

        return res.end(pdfBuffer);
      case 'excel':
        const excelBuffer = await this.generateStreamExcelFromHtml(htmlContent as string);
        // const excelBuffer = await this.htmlToXlsxService.convertHtmlToXlsx(htmlContent as string);
        if (!excelBuffer) {
          return res.status(500).send('Failed to generate Excel');
        }

        res.set({
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename=${fileName}.xlsx`,
        });
        return res.end(excelBuffer);

      case 'html':
        res.set({
          'Content-Type': 'text/html',
          'Content-Disposition': `attachment; filename=${fileName}.html`,
        });
        return res.end(htmlContent);
      default:
        return res.end(htmlContent);
    }
  }
}
