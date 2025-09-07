import { NextRequest, NextResponse } from 'next/server';

// Environment-based Puppeteer imports
let puppeteer: any;
let chromium: any;

if (process.env.NODE_ENV === 'production') {
  // Production: Use @sparticuz/chromium
  chromium = require('@sparticuz/chromium');
  puppeteer = require('puppeteer-core');
} else {
  // Local development: Use regular puppeteer
  puppeteer = require('puppeteer');
}

interface PdfGeneratorPayload {
  title: string;
  description: string;
  duration: number;
  totalMarks: number;
  questions: Array<{
    question: string;
    options: string[];
    answer: string;
    subject?: string;
  }>;
  includeAnswers: boolean;
  filename?: string;
  collegeName?: string;
  collegeLogoUrl?: string;
}

// Complete updated processTextForPDF function with image fixes
function processTextForPDF(text: string): string {
  if (!text) return '';

  let processedText = text;

  // Helper function to create properly styled image tags
  const createImageTag = (src: string, alt: string = 'Image') => {
    const cleanBase64 = src.replace(/\s+/g, '');
    return `<img src="${cleanBase64}" alt="${alt}" style="max-width:90%;width:auto;height:auto;display:block;margin:8px auto;border:1px solid #ddd;padding:3px;break-inside:avoid;page-break-inside:avoid;" onerror="this.style.display='none';" />`;
  };

  // Process standalone base64 image data that appears directly in text
  // This handles cases where base64 data appears without proper img tags

  // First, handle patterns like "! (data:image/...)" or "!\n(data:image/...)"
  processedText = processedText.replace(/!\s*\(\s*(data:image\/[^;]+;base64,[A-Za-z0-9+/=]+)\s*\)/g, (_, base64Data) => {
    return createImageTag(base64Data);
  });

  // Then handle any remaining standalone base64 data
  const base64Pattern = /data:image\/[^;]+;base64,[A-Za-z0-9+/=]+/g;
  const matches = processedText.match(base64Pattern);

  if (matches) {
    matches.forEach((base64Data) => {
      // Only process if it's not already inside an img tag
      const imgTagPattern = new RegExp(`<img[^>]*src=["']${base64Data.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["'][^>]*>`, 'i');
      if (!processedText.match(imgTagPattern)) {
        // Replace standalone base64 string with an img tag
        processedText = processedText.replace(base64Data, createImageTag(base64Data));
      }
    });
  }

  // Process markdown tables - convert to HTML
  processedText = processedText.replace(/(\|[^|\n]*\|[^|\n]*\|[\s\S]*?)(?=\n\n|\n(?!\|)|$)/g, (match) => {
    try {
      // Clean up malformed table syntax
      let cleaned = match.trim();
      cleaned = cleaned.replace(/<br\s*\/?>/gi, ' ');

      const lines = cleaned.split('\n').filter(line => line.trim());
      if (lines.length < 2) return match;

      // Parse table structure
      const tableLines = [];
      let hasHeader = false;

      for (const line of lines) {
        const cells = line.split('|').map(cell => cell.trim()).filter(cell => cell);

        if (cells.length === 0) continue;

        // Check if this is a separator line
        if (cells.every(cell => cell.match(/^:?-+:?$/))) {
          hasHeader = true;
          continue;
        }

        tableLines.push(cells);
      }

      if (tableLines.length === 0) return match;

      // Generate HTML table with proper styling for column layout
      let html = '<table style="break-inside:avoid;page-break-inside:avoid;">';

      if (hasHeader && tableLines.length > 0) {
        html += '<thead><tr>';
        for (const cell of tableLines[0]) {
          html += `<th>${cell}</th>`;
        }
        html += '</tr></thead>';

        if (tableLines.length > 1) {
          html += '<tbody>';
          for (let i = 1; i < tableLines.length; i++) {
            html += '<tr>';
            for (const cell of tableLines[i]) {
              html += `<td>${cell}</td>`;
            }
            html += '</tr>';
          }
          html += '</tbody>';
        }
      } else {
        html += '<tbody>';
        for (const row of tableLines) {
          html += '<tr>';
          for (const cell of row) {
            html += `<td>${cell}</td>`;
          }
          html += '</tr>';
        }
        html += '</tbody>';
      }

      html += '</table>';
      return html;
    } catch (error) {
      console.warn('Error processing table:', error);
      return match;
    }
  });

  // Clean up any broken img tags that don't have proper src attributes
  processedText = processedText.replace(/<img(?![^>]*src=["'][^"']*["'])[^>]*>/gi, '');

  // Clean up broken image references like "img − 1.jpeg (data:...)"
  processedText = processedText.replace(/img\s*[−\-]\s*\d+\.(jpeg|jpg|png)\s*\([^)]*\)/gi, '');

  // Clean up any remaining markdown image syntax that wasn't processed
  processedText = processedText.replace(/!\[([^\]]*)\]\([^)]*\)/g, '');

  // Fix any remaining improperly formatted img tags to use our standard styling
  processedText = processedText.replace(/<img([^>]*)src=["']([^"']*data:image[^"']*)["']([^>]*)>/gi, (match, before, src, after) => {
    // Extract alt text if it exists
    const altMatch = match.match(/alt=["']([^"']*)["']/i);
    const alt = altMatch ? altMatch[1] : 'Image';
    return createImageTag(src, alt);
  });

  return processedText;
}

// Normalize LaTeX inside math delimiters and fix common broken constructs
function sanitizeLatexForPDF(text: string): string {
  if (!text) return '';

  // Helper to clean a math segment
  const cleanMath = (inner: string) => {
    let s = inner;
    // Collapse newlines and excessive spaces inside math
    s = s.replace(/[\r\n]+/g, ' ').replace(/\s{2,}/g, ' ');

    // If \left/\right are not followed by proper delimiters, fix them safely
    // Guard against \leftarrow / \rightarrow sequences: do not alter when followed by 'arrow'
    // Acceptable after \left: ( [ { | \lvert \lVert
    s = s.replace(/\\left(?!arrow)\s*(?![\(\[\{\\|])/g, '');
    // Map sequences like \lefta or \leftx to opening parenthesis + that char (but not \leftarrow)
    s = s.replace(/\\left(?!arrow)\s*([A-Za-z0-9\\])/g, '($1');
    // Acceptable after \right: ) ] } |
    s = s.replace(/\\right(?!arrow)\s*(?![\)\]\}\\|])/g, '');
    // Map sequences like \righta or stray \right to closing parenthesis (but not \rightarrow)
    s = s.replace(/\\right(?!arrow)\s*([A-Za-z0-9\\]|$)/g, ')$1');

    // Common OCR issues: 1eft/1ight within math
    s = s.replace(/(?<!\\)1eft/g, '\\left');
    s = s.replace(/(?<!\\)1ight/g, '\\right');

    // Balance parentheses if needed (append missing ) )
    try {
      const opens = (s.match(/\(/g) || []).length;
      const closes = (s.match(/\)/g) || []).length;
      if (closes < opens) s = s + ')'.repeat(opens - closes);
    } catch {}

    return s;
  };

  // Process $$...$$ blocks first (greedy-safe)
  text = text.replace(/\$\$([\s\S]*?)\$\$/g, (_m, inner) => `$$${cleanMath(inner)}$$`);
  // Then process $...$ blocks
  text = text.replace(/\$([^$\n][\s\S]*?)\$/g, (_m, inner) => `$${cleanMath(inner)}$`);

  return text;
}

export const POST = async (req: NextRequest) => {
  try {
    const payload = (await req.json()) as PdfGeneratorPayload;

    const {
      title,
      description,
      duration,
      totalMarks,
      questions,
      includeAnswers,
      filename = 'question-paper.pdf',
      collegeName = '',
      collegeLogoUrl = '',
    } = payload;

    // Debug logging
    console.log('PDF Generation Request:', {
      title,
      questionsCount: questions?.length || 0,
      firstQuestion: questions?.[0] ? {
        question: questions[0].question?.substring(0, 100) + '...',
        hasImageUrls: !!(questions[0] as any).imageUrls,
        imageUrlsCount: ((questions[0] as any).imageUrls || []).length
      } : null
    });

    // Validate questions data
    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      console.error('PDF Generation Error: No questions provided');
      throw new Error('No questions provided for PDF generation');
    }

    // Validate each question has required fields
    const validQuestions = questions.filter(q => q && q.question);
    if (validQuestions.length === 0) {
      console.error('PDF Generation Error: No valid questions found');
      throw new Error('No valid questions found for PDF generation');
    }

    console.log(`Processing ${validQuestions.length} valid questions out of ${questions.length} total`);

    const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${title}</title>
  <link href="https://cdn.jsdelivr.net/npm/katex@0.16.10/dist/katex.min.css" rel="stylesheet" />
  <script src="https://cdn.jsdelivr.net/npm/katex@0.16.10/dist/katex.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/katex@0.16.10/dist/contrib/auto-render.min.js"></script>
  <script>
    document.addEventListener("DOMContentLoaded", function() {
      if (window.renderMathInElement) {
        window.renderMathInElement(document.body, {
          delimiters: [
            {left: '$$', right: '$$', display: true},
            {left: '$', right: '$', display: false},
            {left: '\\(', right: '\\)', display: false},
            {left: '\\[', right: '\\]', display: true}
          ],
          throwOnError: false,
          errorColor: '#cc0000',
          strict: false
        });
      }
    });
  </script>

<style>
  @page {
    size: A4;
    margin: 25mm 15mm 20mm 15mm;
  }
  body { font-family: 'Times New Roman', serif; font-size: 10pt; line-height: 1.2; position: relative; }
  h1,h2,h3 { margin: 0; padding: 0; }
  hr { margin: 8px 0; border: none; border-top: 1px solid #000; }
  
  /* Watermark */
  body::before {
    content: 'MEDICOS';
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(-30deg);
    font-size: 96pt;
    font-weight: bold;
    color: rgba(0,128,0,0.08);
    z-index: 0;
    pointer-events: none;
  }
  
  /* Header / Footer */
  header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
  .college { display: flex; align-items: center; gap: 6px; }
  .college img { height: 24px; width: auto; }
  .title { text-align: center; flex: 1; font-size: 14pt; font-weight: bold; }
  .meta { text-align: right; font-size: 10pt; }
  .meta div { margin: 0; }

  .questions { position: relative; z-index: 1; padding-bottom: 25mm; }
  .subject-section {
    page-break-before: avoid;
    margin-top: 20px;
    page-break-inside: auto;
    margin-bottom: 20px;
    page-break-after: avoid;
  }
  .subject-section:first-child {
    page-break-before: avoid;
    margin-top: 0;
  }
  .subject-content {
    column-count: 2;
    column-gap: 10mm;
    column-rule: 1px solid #ccc;
    column-rule-style: solid;
  }
  
  /* KEY FIX: Question container styling */
  .question { 
    break-inside: avoid; /* Prevents question from breaking across columns */
    page-break-inside: avoid; /* Prevents question from breaking across pages */
    margin-bottom: 12px; 
    display: block; /* Ensure it's a block container */
    overflow: visible; /* Allow content to flow naturally */
  }
  
  /* Options styling */
  .options { 
    margin-left: 16px; 
    break-inside: avoid; /* Keep options with their question */
  }
  .options p { margin: 2px 0; }
  
  footer { position: fixed; bottom: 3mm; left: 0; right: 0; text-align: center; font-size: 9pt; color: #666; background: #fff; z-index: 2; }
  
  .subject-heading {
    font-weight: bold;
    font-size: 12pt;
    margin: 0 0 12px 0;
    text-align: left;
    padding-bottom: 4px;
    page-break-after: avoid;
    page-break-before: avoid;
    width: 48%;
    display: inline-block;
    vertical-align: top;
  }
  
  /* Table styling for proper rendering */
  table {
    border-collapse: collapse;
    width: 100%;
    margin: 8px 0;
    font-size: 9pt;
    break-inside: avoid;
  }
  th, td {
    border: 1px solid #333;
    padding: 4px 6px;
    text-align: left;
    vertical-align: top;
  }
  th {
    background-color: #f5f5f5;
    font-weight: bold;
  }
  tr:nth-child(even) {
    background-color: #f9f9f9;
  }
  
  /* Math rendering support */
  .katex {
    font-size: 1em;
  }
  .katex-display {
    margin: 0.3em 0;
  }
  
  /* FIXED: Image styling to keep images within question blocks */
  img {
    max-width: 90% !important; /* Reduced from 300px to percentage for better column fit */
    width: auto !important;
    height: auto !important;
    display: block !important;
    margin: 8px auto !important; /* Reduced margin */
    border: 1px solid #ddd !important;
    padding: 3px !important; /* Reduced padding */
    break-inside: avoid; /* Prevent image from breaking across columns */
    page-break-inside: avoid; /* Prevent image from breaking across pages */
  }
  
  /* Ensure question text and images stay together */
  .question p {
    break-inside: avoid;
    page-break-inside: avoid;
  }
  
  /* Additional fix for better column layout with images */
  .question img + * {
    break-before: avoid; /* Prevent elements after images from breaking */
  }
</style>
</head>
<body>
  <header>
    <div class="college">
      ${collegeLogoUrl ? `<img src="${collegeLogoUrl}" alt="logo" />` : ''}
      <span>${collegeName}</span>
    </div>
    <div class="title">${title}</div>
    <div class="meta">
      <div>Total Marks: ${totalMarks}</div>
      <div>Duration: ${duration} mins</div>
    </div>
  </header>
  <hr style="page-break-after: avoid;" />
  <p style="page-break-after: avoid; margin-bottom: 10px;">${description}</p>
  <div class="questions">
    ${(() => {
      // Group questions by subject
      const groupedQuestions = validQuestions.reduce((groups, question) => {
        const subject = question.subject || 'General';
        if (!groups[subject]) {
          groups[subject] = [];
        }
        groups[subject].push(question);
        return groups;
      }, {} as Record<string, typeof questions>);

      console.log('Grouped questions for HTML:', Object.keys(groupedQuestions));

      // Track overall question number across all subjects
      let overallQuestionNumber = 1;

      // Generate HTML for each subject group
      return Object.entries(groupedQuestions).map(([subject, subjectQuestions]) => {
        const subjectHtml = `
          <div class="subject-section">
            <div class="subject-heading">Subject: ${subject}</div>

            <div class="subject-content">
              ${subjectQuestions.map((q, questionIndex) => {
                const currentQuestionNumber = overallQuestionNumber++;
                try {
                // Process question text and handle images from imageUrls array
                let questionText = q.question;

                try {
                  // Check for images in imageUrls array (new database structure)
                  const imageUrls = (q as any).imageUrls || [];
                  console.log(`Question ${questionIndex + 1} imageUrls:`, imageUrls?.length || 0, 'images');

                  if (imageUrls && Array.isArray(imageUrls) && imageUrls.length > 0) {
                    // Validate that the first image is a valid base64 string
                    const firstImage = imageUrls[0];
                    console.log(`Question ${questionIndex + 1} first image:`, firstImage ? firstImage.substring(0, 50) + '...' : 'null');

                    if (firstImage && typeof firstImage === 'string' && firstImage.startsWith('data:image/')) {
                      console.log(`Question ${questionIndex + 1}: Processing valid base64 image`);

                      // Replace markdown image references like ![img-13.jpeg](img-13.jpeg) with actual images
                      const originalText = questionText;
                      let markdownReplacements = 0;
                      questionText = questionText.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt) => {
                        console.log(`Replacing markdown image: ${match}`);
                        markdownReplacements++;
                        return `<img src="${firstImage}" alt="${alt || 'Question Image'}" style="max-width:300px;height:auto;display:block;margin:10px auto;border:1px solid #ddd;padding:5px;" onerror="this.style.display='none';" />`;
                      });

                      // Replace HTML img tags with actual images (but preserve existing valid ones)
                      let htmlReplacements = 0;
                      questionText = questionText.replace(/<img[^>]*>/gi, (match) => {
                        // If it already has a valid src attribute, keep it
                        if (match.includes('src="data:image/')) {
                          return match;
                        }
                        console.log(`Replacing incomplete HTML img tag: ${match.substring(0, 50)}...`);
                        htmlReplacements++;
                        return `<img src="${firstImage}" alt="Question Image" style="max-width:300px;height:auto;display:block;margin:10px auto;border:1px solid #ddd;padding:5px;" onerror="this.style.display='none';" />`;
                      });

                      console.log(`Question ${questionIndex + 1}: Made ${markdownReplacements} markdown replacements, ${htmlReplacements} HTML replacements`);

                      // If content mentions images but no image tags found, append the first image
                      if (!questionText.includes('<img') && imageUrls.length > 0) {
                        const hasImageKeywords = /image|figure|diagram|chart|graph|picture|represents|shown|below|above/i.test(questionText);
                        if (hasImageKeywords) {
                          console.log(`Question ${questionIndex + 1}: Adding image for keywords`);
                          questionText += `\n<img src="${firstImage}" alt="Question Image" style="max-width:300px;height:auto;display:block;margin:10px auto;border:1px solid #ddd;padding:5px;" onerror="this.style.display='none';" />`;
                        }
                      }

                      if (originalText !== questionText) {
                        console.log(`Question ${questionIndex + 1}: Text modified for images`);
                      }
                    } else {
                      console.log(`Question ${questionIndex + 1}: Invalid image format:`, typeof firstImage, firstImage ? firstImage.substring(0, 20) : 'null');
                    }
                  } else {
                    console.log(`Question ${questionIndex + 1}: No imageUrls found`);
                  }
                } catch (error) {
                  console.error(`Error processing images for question ${questionIndex + 1}:`, error);
                  // Continue without images if there's an error
                }

                // Fallback: Check for legacy imageData or chemicalImages fields
                try {
                  const imageData = (q as any).imageData || (q as any).chemicalImages;
                  if (imageData && typeof imageData === 'object' && !questionText.includes('<img')) {
                    // If we have image data but no images in question text, add them
                    const hasImagesInText = questionText.includes('data:image/') || questionText.includes('![');
                    if (!hasImagesInText) {
                      // Add the first available image to the question text
                      const firstImageKey = Object.keys(imageData)[0];
                      if (firstImageKey && imageData[firstImageKey]) {
                        questionText = questionText + '\n' + imageData[firstImageKey];
                      }
                    }
                  }
                } catch (error) {
                  console.error('Error processing legacy image data:', error);
                }

                // Process question text with tables, images, and LaTeX
                let processedQuestion = '';
                try {
                  const sanitizedQuestion = sanitizeLatexForPDF(questionText);
                  processedQuestion = processTextForPDF(sanitizedQuestion);

                  // Final cleanup: Remove any broken img tags that don't have src attributes
                  processedQuestion = processedQuestion.replace(/<img(?![^>]*src=)[^>]*>/gi, '');

                  // Also clean up any remaining broken image references
                  processedQuestion = processedQuestion.replace(/img\s*[−-]\s*\d+\.(jpeg|jpg|png)\s*\([^)]*\)/gi, '');

                } catch (error) {
                  console.error('Error processing question text:', error);
                  processedQuestion = questionText; // Fallback to raw text
                }

                // Apply LaTeX fixes after table processing
                processedQuestion = processedQuestion
                  // Fix the main \ffrac issue - exact patterns from your examples
                  .replace(/\\ffracωLR/g, '\\frac{ω}{LR}')
                  .replace(/\\ffrac1ωCR/g, '\\frac{1}{ωCR}')
                  .replace(/\\ffracLC\\ffrac1R/g, '\\frac{LC}{\\frac{1}{R}}')
                  .replace(/\\ffracRLC/g, '\\frac{R}{LC}')
                  .replace(/\\ffrac100πMHz/g, '\\frac{100}{πMHz}')
                  .replace(/\\ffrac1000πHz/g, '\\frac{1000}{πHz}')
                  .replace(/\\ffrac11000ohm/g, '\\frac{1}{1000ohm}')
                  .replace(/\\ffrac1Cω/g, '\\frac{1}{Cω}')

                  // Fix basic \ffrac patterns
                  .replace(/\\ffrac\{/g, '\\frac{')
                  .replace(/\\ffrac([ωπα-ωΩ])([A-Z]+)/g, '\\frac{$1}{$2}')
                  .replace(/\\ffrac(\d+)([ωπα-ωΩ])([A-Z]+)/g, '\\frac{$1}{$2$3}')
                  .replace(/\\ffrac([A-Z]+)([A-Z]+)/g, '\\frac{$1}{$2}')

                  // Convert Greek letters to Unicode symbols for better PDF display
                  .replace(/\\alpha/g, 'α')
                  .replace(/\\beta/g, 'β')
                  .replace(/\\gamma/g, 'γ')
                  .replace(/\\delta/g, 'δ')
                  .replace(/\\epsilon/g, 'ε')
                  .replace(/\\varepsilon/g, 'ε')
                  .replace(/\\zeta/g, 'ζ')
                  .replace(/\\eta/g, 'η')
                  .replace(/\\theta/g, 'θ')
                  .replace(/\\iota/g, 'ι')
                  .replace(/\\kappa/g, 'κ')
                  .replace(/\\lambda/g, 'λ')
                  .replace(/\\mu/g, 'μ')
                  .replace(/\\nu/g, 'ν')
                  .replace(/\\xi/g, 'ξ')
                  .replace(/\\pi/g, 'π')
                  .replace(/\\rho/g, 'ρ')
                  .replace(/\\sigma/g, 'σ')
                  .replace(/\\tau/g, 'τ')
                  .replace(/\\upsilon/g, 'υ')
                  .replace(/\\phi/g, 'φ')
                  .replace(/\\chi/g, 'χ')
                  .replace(/\\psi/g, 'ψ')
                  .replace(/\\omega/g, 'ω')
                  .replace(/\\Omega/g, 'Ω')
                  .replace(/\\Delta/g, 'Δ')
                  .replace(/\\Gamma/g, 'Γ')
                  .replace(/\\Lambda/g, 'Λ')
                  .replace(/\\Phi/g, 'Φ')
                  .replace(/\\Pi/g, 'Π')
                  .replace(/\\Psi/g, 'Ψ')
                  .replace(/\\Sigma/g, 'Σ')
                  .replace(/\\Theta/g, 'Θ')
                  .replace(/\\Xi/g, 'Ξ')

                  // Remove any remaining broken image references
                  .replace(/img\s*[−-]\s*\d+\.(jpeg|jpg|png)\s*\([^)]*\)/gi, '')
                  // Remove any remaining standalone base64 strings that couldn't be processed

                  // Remove broken image references like "img − 1.jpeg (data:...)"
                  .replace(/img\s*[−-]\s*\d+\.(jpeg|jpg|png)\s*\([^)]*\)/gi, '')
                  // Remove any remaining standalone base64 strings that couldn't be processed
                  ;

                const processedOptions = (q.options || []).map((opt: string) => {
                  try {
                    // Sanitize math and then process option text with tables
                    const sanitizedOpt = sanitizeLatexForPDF(opt);
                    let processedOpt = processTextForPDF(sanitizedOpt);

                    // Clean up any broken img tags in options too
                    processedOpt = processedOpt.replace(/<img(?![^>]*src=)[^>]*>/gi, '');

                  // Apply LaTeX fixes after table processing
                  return processedOpt
                    // Fix the main \ffrac issue - exact patterns
                    .replace(/\\ffracωLR/g, '\\frac{ω}{LR}')
                    .replace(/\\ffrac1ωCR/g, '\\frac{1}{ωCR}')
                    .replace(/\\ffracLC\\ffrac1R/g, '\\frac{LC}{\\frac{1}{R}}')
                    .replace(/\\ffracRLC/g, '\\frac{R}{LC}')
                    .replace(/\\ffrac100πMHz/g, '\\frac{100}{πMHz}')
                    .replace(/\\ffrac1000πHz/g, '\\frac{1000}{πHz}')
                    .replace(/\\ffrac11000ohm/g, '\\frac{1}{1000ohm}')
                    .replace(/\\ffrac1Cω/g, '\\frac{1}{Cω}')

                    // Fix basic \ffrac patterns
                    .replace(/\\ffrac\{/g, '\\frac{')
                    .replace(/\\ffrac([ωπα-ωΩ])([A-Z]+)/g, '\\frac{$1}{$2}')
                    .replace(/\\ffrac(\d+)([ωπα-ωΩ])([A-Z]+)/g, '\\frac{$1}{$2$3}')
                    .replace(/\\ffrac([A-Z]+)([A-Z]+)/g, '\\frac{$1}{$2}')

                    // Convert Greek letters to Unicode symbols for better PDF display
                    .replace(/\\alpha/g, 'α')
                    .replace(/\\beta/g, 'β')
                    .replace(/\\gamma/g, 'γ')
                    .replace(/\\delta/g, 'δ')
                    .replace(/\\epsilon/g, 'ε')
                    .replace(/\\varepsilon/g, 'ε')
                    .replace(/\\zeta/g, 'ζ')
                    .replace(/\\eta/g, 'η')
                    .replace(/\\theta/g, 'θ')
                    .replace(/\\iota/g, 'ι')
                    .replace(/\\kappa/g, 'κ')
                    .replace(/\\lambda/g, 'λ')
                    .replace(/\\mu/g, 'μ')
                    .replace(/\\nu/g, 'ν')
                    .replace(/\\xi/g, 'ξ')
                    .replace(/\\pi/g, 'π')
                    .replace(/\\rho/g, 'ρ')
                    .replace(/\\sigma/g, 'σ')
                    .replace(/\\tau/g, 'τ')
                    .replace(/\\upsilon/g, 'υ')
                    .replace(/\\phi/g, 'φ')
                    .replace(/\\chi/g, 'χ')
                    .replace(/\\psi/g, 'ψ')
                    .replace(/\\omega/g, 'ω')
                    .replace(/\\Omega/g, 'Ω')
                    .replace(/\\Delta/g, 'Δ')
                    .replace(/\\Gamma/g, 'Γ')
                    .replace(/\\Lambda/g, 'Λ')
                    .replace(/\\Phi/g, 'Φ')
                    .replace(/\\Pi/g, 'Π')
                    .replace(/\\Psi/g, 'Ψ')
                    .replace(/\\Sigma/g, 'Σ')
                    .replace(/\\Theta/g, 'Θ')
                    .replace(/\\Xi/g, 'Ξ')

                    // Remove any remaining broken image references
                    .replace(/img\s*[−-]\s*\d+\.(jpeg|jpg|png)\s*\([^)]*\)/gi, '')
                    // Remove any remaining standalone base64 strings that couldn't be processed

                    // Remove broken image references like "img − 1.jpeg (data:...)"
                    .replace(/img\s*[−-]\s*\d+\.(jpeg|jpg|png)\s*\([^)]*\)/gi, '')
                    // Remove any remaining standalone base64 strings that couldn't be processed
                    ;
                  } catch (error) {
                    console.error('Error processing option:', error);
                    return opt; // Fallback to raw option text
                  }
                });

                return `
                  <div class="question">
                    <p><strong>${currentQuestionNumber}.</strong> ${processedQuestion}</p>
                    <div class="options">
                      ${processedOptions.map((opt: string, i: number) => `<p>${String.fromCharCode(97 + i)}) ${opt}</p>`).join('')}
                      ${includeAnswers ? `<p><em>Answer:</em> ${q.answer}</p>` : ''}
                    </div>
                  </div>`;
                } catch (error) {
                  console.error('Error processing question:', error);
                  // Fallback to basic question display
                  return `
                    <div class="question">
                      <p><strong>${currentQuestionNumber}.</strong> ${q.question || 'Error loading question'}</p>
                      <div class="options">
                        ${(q.options || []).map((opt: string, i: number) => `<p>${String.fromCharCode(97 + i)}) ${opt}</p>`).join('')}
                        ${includeAnswers ? `<p><em>Answer:</em> ${q.answer}</p>` : ''}
                      </div>
                    </div>`;
                }
              }).join('')}
            </div>
          </div>`;
        return subjectHtml;
      }).join('');
    })()}
  </div>
  <footer>Medicos | ${new Date().toLocaleDateString()}</footer>
</body>
</html>`;

    const browser = await puppeteer.launch(
      process.env.NODE_ENV === 'production'
        ? {
            args: chromium.args,
            defaultViewport: chromium.defaultViewport,
            executablePath: await chromium.executablePath,
            headless: chromium.headless,
          }
        : {
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
          }
    );
    const page = await browser.newPage();

    await page.setContent(html, { waitUntil: 'domcontentloaded' });

    // Wait for images to load
    await page.evaluate(() => {
      return Promise.all(Array.from(document.images).map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise((resolve) => {
          img.addEventListener('load', resolve);
          img.addEventListener('error', resolve); // Resolve even on error to not block
          setTimeout(resolve, 3000); // Timeout after 3 seconds
        });
      }));
    });

    // Wait for KaTeX to load and render math
    await page.waitForFunction(() => {
      return (window as any).renderMathInElement !== undefined;
    }, { timeout: 5000 }).catch(() => {});

    // Trigger math rendering manually if needed
    await page.evaluate(() => {
      if ((window as any).renderMathInElement) {
        (window as any).renderMathInElement(document.body, {
          delimiters: [
            {left: '$$', right: '$$', display: true},
            {left: '$', right: '$', display: false},
            {left: '\\(', right: '\\)', display: false},
            {left: '\\[', right: '\\]', display: true}
          ],
          throwOnError: false,
          errorColor: '#cc0000',
          strict: false
        });
      }
    });

    // Wait for rendering to complete
    await page.waitForFunction(() => {
      const mathElements = document.querySelectorAll('script[type="math/tex"]');
      const katexElements = document.querySelectorAll('.katex');
      return mathElements.length === 0 || katexElements.length > 0;
    }, { timeout: 5000 }).catch(() => {});

    // Extra delay to ensure layout settles
    await new Promise(resolve => setTimeout(resolve, 500));

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '20mm', right: '15mm', bottom: '20mm', left: '15mm' },
    });

    await browser.close();

    return new NextResponse(Buffer.from(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    console.error('PDF generation failed:', error);
    return new NextResponse(JSON.stringify({ error: 'PDF generation failed' }), { status: 500 });
  }
};
