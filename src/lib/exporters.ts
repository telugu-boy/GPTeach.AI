import { Packer, Document, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, BorderStyle, VerticalAlign, HeadingLevel } from 'docx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { Plan } from './types'

export function planToMarkdown(plan: Plan): string {
  const date = new Date(plan.updatedAt || plan.createdAt).toLocaleString()
  return [
    `# ${plan.title}`,
    ``,
    `**Subject:** ${plan.subject}  `,
    `**Grade:** ${plan.grade}  `,
    `**Duration:** ${plan.duration} minutes  `,
    ``,
    `## Outcomes`,
    plan.outcomes.map(o => `- **${o.code}** — ${o.description}`).join('\n') || '_None_',
    ``,
    `## Objectives`,
    plan.objectives || '_None_',
    ``,
    `## Materials`,
    plan.materials.map(m => `- ${m}`).join('\n') || '_None_',
    ``,
    `## Prior Knowledge`,
    plan.priorKnowledge || '_None_',
    ``,
    `## Activities`,
    plan.activities.map(a => `- **(${a.minutes}m) ${a.title}** — ${a.details}`).join('\n') || '_None_',
    ``,
    `## Assessment`,
    plan.assessment || '_None_',
    ``,
    `## Differentiation`,
    plan.differentiation || '_None_',
    ``,
    `## Extensions`,
    plan.extensions || '_None_',
    ``,
    `## References`,
    plan.references || '_None_',
    ``,
    `---`,
    `_Last updated: ${date}_`
  ].join('\n')
}

export function downloadText(filename: string, content: string, mime = 'text/plain') {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function exportMarkdown(plan: Plan) {
  downloadText(`${sanitize(plan.title)}.md`, planToMarkdown(plan), 'text/markdown')
}

export function exportJSON(plan: Plan) {
  downloadText(`${sanitize(plan.title)}.json`, JSON.stringify(plan, null, 2), 'application/json')
}

function sanitize(name: string) {
  return name.replace(/[^a-z0-9-_]+/gi, '_')
}

export async function exportPDF(plan: Plan) {
    if (!plan) return;
    const printableElement = document.createElement('div');
    printableElement.style.width = '210mm';
    printableElement.style.padding = '15mm';
    printableElement.style.fontFamily = 'sans-serif';
    printableElement.style.color = '#000';
    printableElement.style.backgroundColor = '#fff';
    
    let tableHTML = `<div style="border: 1px solid #ccc;">`;
    plan.tableContent.forEach(row => {
        tableHTML += `<div style="display: flex; border-bottom: 1px solid #ccc;">`;
        row.cells.forEach(cell => {
             const size = cell.size || (100 / row.cells.length);
             tableHTML += `<div style="padding: 8px; border-right: 1px solid #ccc; flex-basis: ${size}%; box-sizing: border-box; vertical-align: top;">${cell.content}</div>`;
        });
        tableHTML += `</div>`;
    });
    tableHTML += `</div>`;

    printableElement.innerHTML = `
        <h1 style="font-size: 24px; font-weight: bold; margin-bottom: 16px;">${plan.title}</h1>
        ${tableHTML}
    `;
    
    printableElement.style.position = 'absolute';
    printableElement.style.left = '-9999px';
    document.body.appendChild(printableElement);

    const canvas = await html2canvas(printableElement, { scale: 2, useCORS: true });
    document.body.removeChild(printableElement);

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
    
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const ratio = canvas.width / canvas.height;
    
    const imgWidth = pdfWidth - 20;
    const imgHeight = imgWidth / ratio;
    
    let heightLeft = imgHeight;
    let position = 10;

    pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
    heightLeft -= (pdfHeight - 20);

    while (heightLeft > 0) {
        position = heightLeft - imgHeight + 10;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= (pdfHeight - 20);
    }
    
    pdf.save(`${sanitize(plan.title)}.pdf`);
}

const parseHtmlToDocx = (html: string): Paragraph[] => {
    if (!html) return [];

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html.trim();

    const buildRuns = (node: Node, options: { bold?: boolean; italic?: boolean; underline?: boolean } = {}): TextRun[] => {
        const runs: TextRun[] = [];
        if (node.nodeType === Node.TEXT_NODE && node.textContent) {
            runs.push(new TextRun({ text: node.textContent, ...options }));
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as HTMLElement;
            const newOptions = { ...options };
            switch (element.tagName.toLowerCase()) {
                case 'strong': case 'b': newOptions.bold = true; break;
                case 'em': case 'i': newOptions.italic = true; break;
                case 'u': newOptions.underline = true; break;
                case 'br': runs.push(new TextRun({ break: 1 })); break;
            }
            element.childNodes.forEach(child => runs.push(...buildRuns(child, newOptions)));
        }
        return runs;
    };

    const paragraphs: Paragraph[] = [];
    tempDiv.childNodes.forEach(node => {
        if (node.nodeType !== Node.ELEMENT_NODE || !node.textContent?.trim()) return;

        const element = node as HTMLElement;
        const tagName = element.tagName.toLowerCase();

        switch (tagName) {
            case 'p': case 'h1': case 'h2': case 'h3': {
                let heading = HeadingLevel.NORMAL;
                if (tagName === 'h1') heading = HeadingLevel.HEADING_1;
                if (tagName === 'h2') heading = HeadingLevel.HEADING_2;
                if (tagName === 'h3') heading = HeadingLevel.HEADING_3;
                paragraphs.push(new Paragraph({ children: buildRuns(element), heading }));
                break;
            }
            case 'ul': case 'ol': {
                Array.from(element.children).forEach(li => {
                    if (li.tagName.toLowerCase() === 'li' && li.textContent?.trim()) {
                        paragraphs.push(new Paragraph({ children: buildRuns(li), bullet: { level: 0 } }));
                    }
                });
                break;
            }
            default:
                paragraphs.push(new Paragraph({ children: buildRuns(element) }));
        }
    });

    if (paragraphs.length === 0 && tempDiv.textContent?.trim()) {
        paragraphs.push(new Paragraph({ children: buildRuns(tempDiv) }));
    }

    return paragraphs;
};

export async function exportDOCX(plan: Plan) {
    if (!plan || !plan.tableContent.length) return;

    const tableRows = plan.tableContent.map(row => {
        const cells = row.cells.map(cell => {
            const content = cell.content || cell.placeholder;
            const children = parseHtmlToDocx(content);
            return new TableCell({
                children: children.length > 0 ? children : [new Paragraph('')],
                columnSpan: cell.colSpan || 1,
                borders: { 
                    top: { style: BorderStyle.SINGLE, size: 1, color: "DDDDDD" },
                    bottom: { style: BorderStyle.SINGLE, size: 1, color: "DDDDDD" },
                    left: { style: BorderStyle.SINGLE, size: 1, color: "DDDDDD" },
                    right: { style: BorderStyle.SINGLE, size: 1, color: "DDDDDD" },
                },
                verticalAlign: VerticalAlign.TOP,
            });
        });
        return new TableRow({ children: cells });
    });

    const table = new Table({
        rows: tableRows,
        width: { size: 100, type: WidthType.PERCENTAGE },
    });

    const doc = new Document({
        sections: [{
            children: [
                new Paragraph({ text: plan.title, heading: HeadingLevel.HEADING_1 }),
                new Paragraph({ text: '' }),
                table,
            ],
        }],
    });

    const blob = await Packer.toBlob(doc);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${sanitize(plan.title)}.docx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}