const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');

const generateVoucher = async (transaction, student) => {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 40, size: 'A5' });
      const filename = `voucher_${transaction.transactionId}.pdf`;
      const filePath = path.join(__dirname, '../../uploads/vouchers', filename);

      // Ensure directory exists
      const dir = path.join(__dirname, '../../uploads/vouchers');
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // --- Header Branding ---
      const logoPath = path.join(__dirname, '../../frontend/public/favicon.svg'); // Fallback if logo.png not found
      if (fs.existsSync(logoPath)) {
        // SVG is not natively supported by pdfkit image(), usually needs a converter or PNG
        // We will just use text for now to be safe, or assume a PNG might exist
      }
      
      doc.fontSize(14).font('Helvetica-Bold').text('Pabna University of Science and Engineering', { align: 'center' });
      doc.fontSize(12).text(student.hallName || 'Hall Office', { align: 'center' });
      doc.fontSize(10).font('Helvetica').text('Official Payment Voucher', { align: 'center' });
      doc.moveDown(1);
      doc.moveTo(40, doc.y).lineTo(doc.page.width - 40, doc.y).stroke();
      doc.moveDown(1);

      // --- Student Info ---
      doc.fontSize(9);
      const startY = doc.y;
      doc.font('Helvetica-Bold').text('Student Name: ', 40, startY);
      doc.font('Helvetica').text(student.fullName, 110, startY);
      
      doc.font('Helvetica-Bold').text('Student ID: ', 40, startY + 15);
      doc.font('Helvetica').text(student.studentId, 110, startY + 15);

      doc.font('Helvetica-Bold').text('Department: ', 40, startY + 30);
      doc.font('Helvetica').text(student.department, 110, startY + 30);

      doc.font('Helvetica-Bold').text('Session: ', 240, startY + 15);
      doc.font('Helvetica').text(student.session, 290, startY + 15);

      doc.font('Helvetica-Bold').text('Room No: ', 240, startY + 30);
      doc.font('Helvetica').text(student.roomNumber || 'N/A', 290, startY + 30);

      doc.moveDown(3);

      // --- Payment Details ---
      doc.font('Helvetica-Bold').fontSize(10).text('Payment Details:', 40);
      doc.moveDown(0.5);

      // Fees Table
      let currentY = doc.y;
      doc.rect(40, currentY, doc.page.width - 80, 20).fill('#f3f4f6').stroke('#e5e7eb');
      doc.fill('#374151').font('Helvetica-Bold').text('Description', 50, currentY + 5);
      doc.text('Breakdown', 200, currentY + 5);
      doc.text('Amount (BDT)', 320, currentY + 5, { align: 'right', width: 60 });
      
      doc.font('Helvetica').fill('#000000');
      currentY += 20;

      // Fee Rows (Using English labels as PDFKit needs fonts for Bengali)
      const details = transaction.details || [];
      details.forEach((item, index) => {
        doc.text(`${index + 1}. ${item.type}`, 50, currentY + 7);
        doc.text(`${item.amount} * ${item.count}`, 200, currentY + 7);
        doc.text(`${item.amount * item.count}/-`, 320, currentY + 7, { align: 'right', width: 60 });
        currentY += 20;
      });

      // Total
      doc.moveTo(40, currentY).lineTo(doc.page.width - 40, currentY).stroke('#e5e7eb');
      doc.font('Helvetica-Bold').text('Total Payment:', 200, currentY + 10);
      doc.text(`${transaction.amount} BDT`, 320, currentY + 10, { align: 'right', width: 60 });
      
      doc.moveDown(3);

      // --- Transaction Metadata ---
      const metaY = doc.y + 20;
      doc.fontSize(8);
      doc.font('Helvetica-Bold').text('Transaction ID: ', 40, metaY);
      doc.font('Helvetica').text(transaction.transactionId, 105, metaY);

      doc.font('Helvetica-Bold').text('Payment Method: ', 40, metaY + 12);
      doc.font('Helvetica').text(transaction.paymentMethod || 'Online', 115, metaY + 12);

      doc.font('Helvetica-Bold').text('Month Range: ', 40, metaY + 24);
      doc.font('Helvetica').text(transaction.monthRange || 'N/A', 105, metaY + 24);

      doc.font('Helvetica-Bold').text('Date: ', 240, metaY);
      doc.font('Helvetica').text(new Date(transaction.paymentDate).toLocaleString(), 270, metaY);

      // --- QR Code ---
      const qrData = JSON.stringify({
        txn: transaction.transactionId,
        std: student.studentId,
        amt: transaction.amount,
      });
      const qrImage = await QRCode.toDataURL(qrData);
      doc.image(qrImage, 310, metaY + 10, { width: 70 });

      // --- Footer ---
      doc.fontSize(8).font('Helvetica-Oblique').text('This is a computer-generated voucher. No signature required.', 40, doc.page.height - 50, { align: 'center' });

      doc.end();

      stream.on('finish', () => {
        resolve(`/uploads/vouchers/${filename}`);
      });

      stream.on('error', (err) => {
        reject(err);
      });
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = { generateVoucher };
