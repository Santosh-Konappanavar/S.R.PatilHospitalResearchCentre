// Renders a Purchase Order as a styled PDF using pdfkit.
// Layout: navy + gold letterhead, PO number, vendor block, items table, totals, signatures.

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const NAVY = '#0a1f38';
const NAVY_700 = '#122c47';
const NAVY_300 = '#94abc7';
const GOLD = '#d49a2c';
const GOLD_LIGHT = '#fef3d0';
const GRAY_BORDER = '#d8dee8';
const GRAY_TEXT = '#4a6080';
const TEXT = '#0a1f38';

const fmtINR = (n) => `Rs. ${(Number(n) || 0).toLocaleString('en-IN')}`;
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const fmtDateTime = (d) => d ? new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

function tryLogo(doc) {
  try {
    const logoPath = path.join(__dirname, '..', 'public', 'logo.png');
    if (fs.existsSync(logoPath)) doc.image(logoPath, 40, 38, { width: 44 });
  } catch { /* ignore */ }
}

function drawHeader(doc) {
  // Navy header band
  doc.rect(0, 0, doc.page.width, 90).fill(NAVY);
  // Gold underline
  doc.rect(0, 90, doc.page.width, 3).fill(GOLD);

  tryLogo(doc);

  doc.fillColor('#ffffff')
     .fontSize(18).font('Helvetica-Bold')
     .text('S.R. PATIL HOSPITAL', 95, 36, { characterSpacing: 0.5 });
  doc.fontSize(8).font('Helvetica').fillColor('#cbd9e8')
     .text('Research Centre  ·  Est. 1985  ·  Badgandi', 95, 58);

  doc.fontSize(8).fillColor('#cbd9e8')
     .text(`Generated: ${fmtDateTime(new Date())}`, doc.page.width - 220, 58, { width: 180, align: 'right' });

  // Reset to body
  doc.fillColor(TEXT).font('Helvetica');
  doc.y = 110;
}

function drawTitle(doc, po) {
  // PO title row
  doc.fillColor(NAVY).fontSize(22).font('Helvetica-Bold')
     .text('PURCHASE ORDER', 40, doc.y);
  doc.fontSize(11).font('Helvetica').fillColor(GRAY_TEXT)
     .text(`PO Number: ${po.poNumber || 'PO-PENDING'}`, 40, doc.y + 4);
  doc.fillColor(GOLD).fontSize(11).font('Helvetica-Bold')
     .text(`Status: ${po.status || 'Pending'}`,
       doc.page.width - 200, doc.y - 16, { width: 160, align: 'right' });

  doc.y = doc.y + 24;
}

function drawPartyBlocks(doc, po) {
  const top = doc.y;
  // Vendor block
  doc.rect(40, top, 250, 100).fillAndStroke('#f8fafc', GRAY_BORDER);
  doc.fillColor(GRAY_TEXT).fontSize(8).font('Helvetica-Bold')
     .text('VENDOR', 52, top + 12, { characterSpacing: 0.8 });
  doc.fillColor(TEXT).fontSize(12).font('Helvetica-Bold').text(po.vendor || '—', 52, top + 28);
  doc.fontSize(9).font('Helvetica').fillColor(GRAY_TEXT);
  if (po.vendorContact) doc.text(po.vendorContact, 52, top + 46);
  if (po.remarks) doc.text(`Notes: ${po.remarks}`, 52, top + 60, { width: 226 });

  // Department block
  const x2 = 310;
  doc.rect(x2, top, 250, 100).fillAndStroke('#f8fafc', GRAY_BORDER);
  doc.fillColor(GRAY_TEXT).fontSize(8).font('Helvetica-Bold')
     .text('DEPARTMENT', x2 + 12, top + 12, { characterSpacing: 0.8 });
  doc.fillColor(TEXT).fontSize(12).font('Helvetica-Bold').text(po.departmentName || '—', x2 + 12, top + 28);
  doc.fontSize(9).font('Helvetica').fillColor(GRAY_TEXT);
  doc.text(`Priority: ${po.priority || 'Normal'}`, x2 + 12, top + 50);
  doc.text(`Expected delivery: ${fmtDate(po.expectedDelivery)}`, x2 + 12, top + 66);
  doc.text(`Created: ${fmtDate(po.createdAt)}`, x2 + 12, top + 82);

  doc.y = top + 116;
}

function drawItemsTable(doc, po) {
  const startY = doc.y;

  // Items label
  doc.fillColor(NAVY).fontSize(10).font('Helvetica-Bold')
     .text('ITEMS / LINE ITEMS', 40, startY, { characterSpacing: 0.8 });
  doc.y = startY + 14;

  // Body block (preserve line breaks)
  const itemsHeight = doc.heightOfString(po.items || '—', { width: doc.page.width - 80 });
  doc.rect(40, doc.y, doc.page.width - 80, Math.max(80, itemsHeight + 24))
     .fillAndStroke('#ffffff', GRAY_BORDER);
  doc.fillColor(TEXT).fontSize(10).font('Helvetica')
     .text(po.items || '—', 52, doc.y + 12, { width: doc.page.width - 104 });
  doc.y = doc.y + Math.max(80, itemsHeight + 24) + 16;
}

function drawTotals(doc, po) {
  const x = doc.page.width - 240;
  const top = doc.y;

  // Total box
  doc.rect(x, top, 200, 64).fillAndStroke(GOLD_LIGHT, GOLD);
  doc.fillColor(GRAY_TEXT).fontSize(9).font('Helvetica-Bold')
     .text('TOTAL AMOUNT', x + 16, top + 14, { characterSpacing: 0.8 });
  doc.fillColor(NAVY).fontSize(20).font('Helvetica-Bold')
     .text(fmtINR(po.totalAmount), x + 16, top + 30);

  doc.y = top + 80;
}

function drawApproval(doc, po) {
  const top = Math.max(doc.y, doc.page.height - 170);
  const colW = (doc.page.width - 80) / 2;

  // Requested by
  doc.rect(40, top, colW - 10, 70).stroke(GRAY_BORDER);
  doc.fillColor(GRAY_TEXT).fontSize(8).font('Helvetica-Bold')
     .text('REQUESTED BY', 52, top + 12, { characterSpacing: 0.8 });
  doc.fillColor(TEXT).fontSize(11).font('Helvetica-Bold').text(po.requestedByName || '—', 52, top + 30);
  doc.fillColor(GRAY_TEXT).fontSize(9).font('Helvetica')
     .text(fmtDateTime(po.createdAt), 52, top + 48);

  // Approved by
  const x2 = 40 + colW + 10;
  doc.rect(x2, top, colW - 10, 70).stroke(GRAY_BORDER);
  doc.fillColor(GRAY_TEXT).fontSize(8).font('Helvetica-Bold')
     .text('APPROVED BY', x2 + 12, top + 12, { characterSpacing: 0.8 });
  doc.fillColor(TEXT).fontSize(11).font('Helvetica-Bold')
     .text(po.approvedByName || (po.status === 'Approved' ? '—' : 'Pending approval'),
       x2 + 12, top + 30);
  doc.fillColor(GRAY_TEXT).fontSize(9).font('Helvetica')
     .text(po.approvedAt ? fmtDateTime(po.approvedAt) : '', x2 + 12, top + 48);
}

function drawFooter(doc) {
  doc.fillColor(NAVY_300).fontSize(8).font('Helvetica')
     .text(
       'S.R. Patil Hospital & Research Centre  ·  Badgandi  ·  This is a system-generated document and is valid without signature.',
       40, doc.page.height - 40, { width: doc.page.width - 80, align: 'center' }
     );
}

function renderPOPDF(po, res) {
  const doc = new PDFDocument({ size: 'A4', margin: 40, info: {
    Title: `Purchase Order ${po.poNumber || ''}`,
    Author: 'S.R. Patil Hospital',
    Subject: 'Purchase Order',
  }});

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition',
    `attachment; filename="${po.poNumber || 'PO'}.pdf"`);

  doc.pipe(res);
  drawHeader(doc);
  drawTitle(doc, po);
  drawPartyBlocks(doc, po);
  drawItemsTable(doc, po);
  drawTotals(doc, po);
  drawApproval(doc, po);
  drawFooter(doc);
  doc.end();
}

module.exports = { renderPOPDF };