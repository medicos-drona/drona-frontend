import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

interface AnswersExcelPayload {
  title: string;
  questions: Array<{
    question: string;
    options: string[];
    answer: string;
    subject?: string;
  }>;
  filename?: string;
}

export const POST = async (req: NextRequest) => {
  try {
    const payload = (await req.json()) as AnswersExcelPayload;

    const {
      title,
      questions,
      filename = 'question-paper-answers.xlsx',
    } = payload;

    const worksheetData = [];

    // Add title row
    worksheetData.push([title || 'Question Paper - Answer Key']);
    worksheetData.push([]); // Empty row for spacing

    // Add header row
    worksheetData.push(['Subject', 'Question No.', 'Correct Answer']);

    // Process questions with continuous numbering
    questions.forEach((q, idx) => {
      // Use continuous question numbering across all subjects
      const questionNumber = idx + 1;

      // Find the correct option letter for the answer
      const answerIndex = q.options.findIndex(opt => opt === q.answer);
      const answerLetter = answerIndex !== -1 ? String.fromCharCode(97 + answerIndex) : q.answer;

      // Add row to worksheet
      worksheetData.push([
        q.subject || 'General',
        questionNumber,
        `${answerLetter})`
      ]);
    });

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    // Set column widths
    worksheet['!cols'] = [
      { width: 20 }, // Subject
      { width: 15 }, // Question No.
      { width: 20 }  // Answer
    ];

    // Style the title row
    if (worksheet['A1']) {
      worksheet['A1'].s = {
        font: { bold: true, sz: 14 },
        alignment: { horizontal: 'center' }
      };
    }

    // Style the header row
    const headerRowIndex = 3; // Row 3 (0-indexed: row 2)
    ['A', 'B', 'C'].forEach((col) => {
      const cellRef = `${col}${headerRowIndex}`;
      if (worksheet[cellRef]) {
        worksheet[cellRef].s = {
          font: { bold: true },
          fill: { fgColor: { rgb: 'E3F2FD' } },
          alignment: { horizontal: 'center' }
        };
      }
    });

    // Merge title cell across columns
    worksheet['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 2 } }];

    // Add borders to data rows
    const dataStartRow = 4; // Row 4 (0-indexed: row 3)
    for (let row = dataStartRow; row <= worksheetData.length; row++) {
      ['A', 'B', 'C'].forEach(col => {
        const cellRef = `${col}${row}`;
        if (worksheet[cellRef]) {
          worksheet[cellRef].s = {
            ...worksheet[cellRef].s,
            border: {
              top: { style: 'thin' },
              bottom: { style: 'thin' },
              left: { style: 'thin' },
              right: { style: 'thin' }
            },
            alignment: { horizontal: 'center' }
          };
        }
      });
    }

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Answer Key');

    // Generate Excel buffer
    const excelBuffer = XLSX.write(workbook, { 
      type: 'buffer', 
      bookType: 'xlsx',
      compression: true 
    });

    return new NextResponse(excelBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    console.error('Answers Excel generation failed:', error);
    return new NextResponse(JSON.stringify({ error: 'Answers Excel generation failed' }), { status: 500 });
  }
};
