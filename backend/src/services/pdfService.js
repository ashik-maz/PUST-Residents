const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');

const generateVoucher = async (transaction, student) => {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const filename = `voucher_${transaction.transactionId}.pdf`;
      const filePath = path.join(__dirname, '../../uploads/vouchers', filename);

      // Ensure directory exists
      const dir = path.join(__dirname, '../../uploads/vouchers');
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // Header
      doc.fontSize(20).text('Pabna University of Science and Technology', { align: 'center' });
      doc.fontSize(16).text('Hall Payment Voucher', { align: 'center' });
      doc.moveDown();

      // Student Info
      doc.fontSize(12).text(`Name: ${student.fullName}`);
      doc.text(`Student ID: ${student.studentId}`);
      doc.text(`Department: ${student.department}`);
      doc.text(`Session: ${student.session}`);
      doc.text(`Hall Name: ${student.hallName}`);
      doc.text(`Room Number: ${student.roomNumber}`);
      doc.text(`Allotted Date: ${new Date(student.allottedDate).toLocaleDateString()}`);
      doc.moveDown();

      // Transaction Info
      doc.text(`Transaction ID: ${transaction.transactionId}`);
      doc.text(`Payment Date: ${new Date(transaction.paymentDate).toLocaleString()}`);
      doc.moveDown();

      // Fee Breakdown (Simplified for now, can be expanded)
      doc.fontSize(14).text('Payment Details:', { underline: true });
      doc.fontSize(12).text(`Previous Due: ${transaction.previousDue} BDT`);
      doc.text(`Amount Paid: ${transaction.amount} BDT`);
      doc.text(`Remaining Due: ${transaction.remainingDue} BDT`);
      doc.moveDown();

      // QR Code
      const qrData = JSON.stringify({
        txnId: transaction.transactionId,
        studentId: student.studentId,
        amount: transaction.amount,
        date: transaction.paymentDate,
      });
      const qrImage = await QRCode.toDataURL(qrData);
      doc.image(qrImage, 400, 200, { width: 100 });

      // Signature Area
      doc.moveDown(4);
      doc.text('__________________________', 50, doc.y);
      doc.text('Provost Signature', 70, doc.y + 15);

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
