import { readFileSync } from 'node:fs';
import path from 'node:path';

import { createBrowser, createPage } from '../../lib/puppeteer';
import { InterfacePolicyRepository } from '../../repositories/@interface/interface-policy-repository';
import { formatDate } from '../../utils/formatDate';
import { BadRequestError } from '../@errors/bad-request-error';
import { ResourceNotFoundError } from '../@errors/resource-not-found-error';

interface ExportPolicyPdfUseCaseRequest {
  slug: string;
}

interface ExportPolicyPdfUseCaseResponse {
  pdfBuffer: Buffer;
}

export class ExportPolicyPdfUseCase {
  constructor(private policyRepository: InterfacePolicyRepository) {}

  async execute({
    slug,
  }: ExportPolicyPdfUseCaseRequest): Promise<ExportPolicyPdfUseCaseResponse> {
    const policy = await this.policyRepository.findBySlug(slug);
    if (!policy) throw new ResourceNotFoundError('Política não encontrada.');

    const templatePath = path.resolve(process.cwd(), 'template', 'policy.html');

    let html = readFileSync(templatePath, 'utf-8');

    const newDate = formatDate(policy.createdAt);
    const descriptionWithBreaks = policy.description.replace(/\n/g, '<br>');

    const logoPath = path.resolve(__dirname, '../../assets/logotipo.png');
    const logoBase64 = readFileSync(logoPath, 'base64');
    const logoSrc = `data:image/png;base64,${logoBase64}`;

    html = html.replace(/{{policyTitle}}/g, policy.title);
    html = html.replace(/{{logotipo}}/g, logoSrc);
    html = html.replace(/{{policyCategory}}/g, policy.category.name);
    html = html.replace(/{{policyName}}/g, policy.title);
    html = html.replace(/{{policySource}}/g, policy.source);
    html = html.replace(/{{policyDescription}}/g, descriptionWithBreaks);
    html = html.replace(/{{policyDate}}/g, newDate);

    const footerTemplate = `
      <div style='
        display: flex; 
        align-items: end;
        justify-content: space-between; 
        width: 100%; 
        color: #fff;
        margin-top: -30px; 
        padding: 0 40px;
      '>
        <img src='${logoSrc}' alt='Logotipo' style='width: 200px;' />
        <span style='font-size: 14px;'>© 2023 LogoTipo. Todos os direitos reservados.</span>
      </div>
    `;

    const browser = await createBrowser();
    const page = await createPage(browser);

    try {
      await page.setContent(html, { waitUntil: 'networkidle0' });

      const pdfUint8 = await page.pdf({
        format: 'A4',
        printBackground: true,
        displayHeaderFooter: true,
        headerTemplate: '<div></div>',
        footerTemplate,
        margin: { top: '60px', bottom: '100px', left: '40px', right: '40px' },
      });

      const pdfBuffer = Buffer.from(pdfUint8);

      return { pdfBuffer };
    } catch (error) {
      throw new BadRequestError('Não foi possível gerar o PDF.');
    } finally {
      await browser.close();
    }
  }
}
