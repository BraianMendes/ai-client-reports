const PDFDocument = require('pdfkit');
const fs = require('fs');

function generatePDF(text, path) {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument();
        const stream = fs.createWriteStream(path);

        doc.pipe(stream);
        doc.fontSize(14).text(text, { align: 'left' });
        doc.end();

        stream.on('finish', () => resolve(path));
        stream.on('error', reject);
    });
}

module.exports = { generatePDF };
