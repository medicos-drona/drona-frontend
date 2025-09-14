import { NextRequest, NextResponse } from 'next/server';

import fs from 'node:fs';

// Removed Playwright import; using puppeteer-core with serverless Chromium providers

// Puppeteer fallback for serverless (Vercel) with @sparticuz/chromium
let puppeteer: any = null;
let awsChromium: any = null;
let awsLambdaChromium: any = null;
try { puppeteer = require('puppeteer-core'); } catch {}
try { awsChromium = require('@sparticuz/chromium'); } catch {}
try { awsLambdaChromium = require('chrome-aws-lambda'); } catch {}

function resolveBundledChromiumPath(): string | undefined {
  try {
    const base = require('node:path').join(process.cwd(), 'node_modules', 'playwright-core', '.local-browsers');
    console.log('[SOL-PDF] resolveBundledChromiumPath base', { base });
    if (!fs.existsSync(base)) {
      console.warn('[SOL-PDF] bundled browsers base does not exist');
      return undefined;
    }
    const dirs = fs.readdirSync(base, { withFileTypes: true }).filter((d: any) => d.isDirectory()).map((d: any) => d.name);
    console.log('[SOL-PDF] bundled browsers found', { dirs });
    const preferred = dirs.find((d: string) => d.startsWith('chromium_headless_shell')) || dirs.find((d: string) => d.startsWith('chromium'));
    if (!preferred) {
      console.warn('[SOL-PDF] no chromium directory found under .local-browsers');
      return undefined;
    }
    const headlessPath = require('node:path').join(base, preferred, 'chrome-linux', 'headless_shell');
    const chromePath = require('node:path').join(base, preferred, 'chrome-linux', 'chrome');
    if (fs.existsSync(headlessPath)) return headlessPath;
    if (fs.existsSync(chromePath)) return chromePath;
    console.warn('[SOL-PDF] neither headless_shell nor chrome exists in chromium dir');
    return undefined;
  } catch (e) {
    console.warn('[SOL-PDF] resolveBundledChromiumPath error', e);
    return undefined;
  }
}

function findLocalChromeExecutable(): string | undefined {
  const candidates = process.platform === 'win32'
    ? [
        'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
        'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
        'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
      ]
    : process.platform === 'darwin'
    ? ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome']
    : ['/usr/bin/google-chrome', '/usr/bin/chromium-browser', '/usr/bin/chromium'];

  for (const p of candidates) {
    try { if (fs.existsSync(p)) return p; } catch {}
  }
  return undefined;
}

async function getLaunchOptions() {
  const envPath = process.env.CHROMIUM_PATH || process.env.CHROME_EXECUTABLE_PATH || process.env.GOOGLE_CHROME_SHIM;
  const isServerless = !!process.env.VERCEL || !!process.env.AWS_REGION || !!process.env.LAMBDA_TASK_ROOT;

  // In serverless, trust env var; locally, verify exists
  let executablePath: string | undefined = isServerless ? envPath : (envPath && fs.existsSync(envPath) ? envPath : undefined);

  if (!executablePath) {
    executablePath = findLocalChromeExecutable();
  }

  const defaultViewport = { width: 1280, height: 800 };
  return { executablePath, defaultViewport } as any;
}

interface SolutionsPdfPayload {
  title: string;
  description: string;
  duration: number;
  totalMarks: number;
  questions: Array<{
    question: string;
    options: string[];
    answer: string;
    subject?: string;
    solution?: {
      final_explanation?: string;
      methodology?: string;
      steps?: string[];
    };
    hints?: string[];
  }>;
  filename?: string;
  collegeName?: string;
  collegeLogoUrl?: string;
}

// Fixed processTextForPDF function that handles large base64 strings
function processTextForPDF(text: string): string {
  if (!text) return '';

  let processedText = text;

  // Normalize common OCR/typo cases before image handling
  // Convert ':image/jpeg;base64,...' -> 'data:image/jpeg;base64,...'
  processedText = processedText.replace(/(^|[\s(])\:image\/([A-Za-z0-9.+-]+);base64,([A-Za-z0-9+/=\r\n\-\u2212]+)/gi, '$1data:image/$2;base64,$3');
  // Remove stray 'Image' labels before base64 blocks
  processedText = processedText.replace(/(?:^|\n)\s*Image\s*\)?\s*(?=(data:image|:image))/gi, '');
  // Remove a leading quote just before a data:image URI
  processedText = processedText.replace(/(^|[\s(])\"(?=data:image\/[A-Za-z0-9.+-]+;base64,)/g, '$1');

  // Helper function to create properly styled image tags
  const createImageTag = (src: string, alt: string = 'Image') => {
    const cleanBase64 = src.replace(/[\s\u00AD\u2010\u2011\u2012\u2013\u2014\u2212\-]+/g, '');
    return `<img src="${cleanBase64}" alt="${alt}" style="max-width:75%;max-height:120px;width:auto;height:auto;display:block;margin:6px auto;border:1px solid #ddd;padding:3px;break-inside:avoid;page-break-inside:avoid;object-fit:contain;" onerror="this.style.display='none';" />`;
  };

  // Process standalone base64 image data that appears directly in text
  // First, handle patterns like "! (data:image/...)" or "!\n(data:image/...)"
  processedText = processedText.replace(/!\s*\(\s*(data:image\/[A-Za-z0-9.+-]+;base64,[A-Za-z0-9+/=\r\n\s\-]+)\s*\)/g, (_, base64Data) => {
    return createImageTag(base64Data.replace(/[\s\-]+/g, ''));
  });

  // Then handle any remaining standalone base64 data
  const base64Pattern = /data:image\/[A-Za-z0-9.+-]+;base64,[A-Za-z0-9+/=\r\n\s\-]+/g;
  const matches = processedText.match(base64Pattern);

  if (matches) {
    matches.forEach((base64Data) => {
      // FIXED: Instead of using regex with the full base64 string, use indexOf to check
      // if the base64 data is already inside an img tag
      const imgTagStart = processedText.indexOf(`<img`);
      let alreadyInImgTag = false;

      if (imgTagStart !== -1) {
        // Look for img tags that contain this base64 data
        const imgTagRegex = /<img[^>]*>/gi;
        let match;
        while ((match = imgTagRegex.exec(processedText)) !== null) {
          if (match[0].includes(base64Data.substring(0, 50))) { // Check first 50 chars
            alreadyInImgTag = true;
            break;
          }
        }
      }

      if (!alreadyInImgTag) {
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
  // FIXED: Use a safer approach that doesn't put large base64 strings in regex
  const imgTagRegex = /<img([^>]*)src=["']([^"']*)["']([^>]*)>/gi;
  processedText = processedText.replace(imgTagRegex, (match, _before, src, _after) => {
    // Only process data:image sources
    if (src.startsWith('data:image')) {
      // Extract alt text if it exists
      const altMatch = match.match(/alt=["']([^"']*)["']/i);
      const alt = altMatch ? altMatch[1] : 'Image';
      return createImageTag(src, alt);
    }
    return match; // Return unchanged if not a data:image
  });

  return processedText;
}

export const POST = async (req: NextRequest) => {
  try {
    const payload = (await req.json()) as SolutionsPdfPayload;
    console.log('Solutions PDF API called with payload:', payload);

    const {
      title,
      description,
      duration,
      totalMarks,
      questions,
      filename = 'question-paper-solutions.pdf',
      collegeName = '',
      collegeLogoUrl = '',
    } = payload;

    const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${title} - Solutions</title>
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
          errorColor: '#000000',
          strict: 'ignore'
        });
      }
    });
  </script>
  <style>
    @page { size: A4; margin: 20mm 15mm; }
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
      color: rgba(0,128,0,0.08); /* greenish */
      z-index: 0;
      pointer-events: none;
    }
    /* Header / Footer */
    header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
    .college { display: flex; align-items: center; gap: 6px; }
    .college img { height: 32px; width: auto; }
    .title { text-align: center; flex: 1; font-size: 14pt; font-weight: bold; }
    .meta { text-align: right; font-size: 10pt; }
    .meta div { margin: 0; }

    .questions { position: relative; z-index: 1; padding-bottom: 25mm; }
    .question { break-inside: avoid; break-inside: avoid-column; -webkit-column-break-inside: avoid; margin-bottom: 16px; page-break-inside: avoid; }
    .question-content { margin-bottom: 8px; }
    .options { margin-left: 12px; margin-bottom: 8px; break-inside: avoid; break-inside: avoid-column; -webkit-column-break-inside: avoid; }
    .options p { margin: 2px 0; break-inside: avoid; }
    .answer { margin-top: 8px; padding: 6px 10px; background-color: #f0f8ff; border-left: 4px solid #2563eb; border-radius: 3px; }
    .answer-text { font-weight: bold; color: #000; font-size: 10pt; }
    .solution { margin-top: 10px; padding: 8px 12px; background-color: #f9f9f9; border-left: 4px solid #10b981; border-radius: 3px; }
    .solution-title { font-weight: bold; color: #059669; margin-bottom: 6px; font-size: 10pt; }
    .solution-content { font-size: 9pt; line-height: 1.4; }
    .solution-content p { margin: 4px 0; }
    .solution-content ol { margin: 4px 0; padding-left: 16px; }
    .solution-content li { margin: 2px 0; }
    .hints { margin-top: 10px; padding: 8px 12px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 3px; }
    .hints-title { font-weight: bold; color: #d97706; margin-bottom: 6px; font-size: 10pt; }
    .hint-item { margin: 3px 0; font-size: 9pt; line-height: 1.3; }
    footer { position: fixed; bottom: 3mm; left: 0; right: 0; text-align: center; font-size: 9pt; color: #666; background: #fff; z-index: 2; }
    .subject-heading { font-weight: bold; margin: 12px 0 8px; font-size: 12pt; color: #333; border-bottom: 1px solid #ddd; padding-bottom: 4px; }
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
  </style>
</head>
<body>
  <header>
    <div class="college">
      ${collegeLogoUrl ? `<img src="${collegeLogoUrl}" alt="logo" />` : ''}
      <span>${collegeName}</span>
    </div>
    <div class="title">${title} - Solutions</div>
    <div class="meta">
      <div>Total Marks: ${totalMarks}</div>
      <div>Duration: ${duration} mins</div>
    </div>
  </header>
  <hr />
  <p>${description}</p>
  <div class="questions">
    ${questions.reduce((acc, q, idx) => {
      // Check if this is a new subject
      const isNewSubject = q.subject && (idx === 0 || questions[idx-1].subject !== q.subject);

      // Use continuous question numbering across all subjects
      const questionNumber = idx + 1;

      const heading = isNewSubject
        ? `<div class="subject-heading">Subject: ${q.subject}</div>`
        : '';

      // Find the correct option letter for the answer
      const answerIndex = q.options.findIndex(opt => opt === q.answer);
      const answerLetter = answerIndex !== -1 ? String.fromCharCode(97 + answerIndex) : q.answer;

      // Build solution section (supports string or structured object)
      let solutionHtml = '';
      if (q.solution) {
        const solutionParts: string[] = [];
        try {
          if (typeof q.solution === 'string') {
            const processed = processTextForPDF(q.solution);
            if (processed && processed.trim().length > 0) {
              solutionParts.push(`<p><strong>Explanation:</strong> ${processed}</p>`);
            }
          } else if (typeof q.solution === 'object') {
            const sol: any = q.solution;
            const explanation = sol.final_explanation || sol.finalExplanation || sol.explanation || sol.text;
            if (explanation) {
              const processed = processTextForPDF(explanation);
              solutionParts.push(`<p><strong>Explanation:</strong> ${processed}</p>`);
            }
            if (sol.methodology) {
              const processedMethodology = processTextForPDF(sol.methodology);
              solutionParts.push(`<p><strong>Method:</strong> ${processedMethodology}</p>`);
            }
            if (Array.isArray(sol.steps) && sol.steps.length > 0) {
              const processedSteps = sol.steps.map((step: string) => processTextForPDF(step));
              solutionParts.push(`<p><strong>Steps:</strong></p><ol>${processedSteps.map((step: string) => `<li>${step}</li>`).join('')}</ol>`);
            }
            if (Array.isArray(sol.key_concepts) && sol.key_concepts.length > 0) {
              const processedConcepts = sol.key_concepts.map((c: string) => processTextForPDF(c));
              solutionParts.push(`<p><strong>Key Concepts:</strong> ${processedConcepts.join(', ')}</p>`);
            }
          }
        } catch (e) {
          // If anything goes wrong, skip rendering the solution block for this question
          console.warn('Skipping solution rendering due to error', e);
        }

        if (solutionParts.length > 0) {
          solutionHtml = `
            <div class="solution">
              <div class="solution-title">Solution:</div>
              <div class="solution-content">
                ${solutionParts.join('')}
              </div>
            </div>`;
        }
      }

      // Build hints section
      let hintsHtml = '';
      if (q.hints && q.hints.length > 0) {
        const processedHints = q.hints.map(hint => processTextForPDF(hint));
        hintsHtml = `
          <div class="hints">
            <div class="hints-title">Hints:</div>
            ${processedHints.map((hint, i) => `<div class="hint-item">${i + 1}. ${hint}</div>`).join('')}
          </div>`;
      }

      // Process question text and handle images from imageUrls array
      let questionText = q.question;

      // Check for images in imageUrls array (new database structure)
      const imageUrls = (q as any).imageUrls || [];
      if (imageUrls && imageUrls.length > 0) {
        // Replace markdown image references like ![img-13.jpeg](img-13.jpeg) with actual images
        questionText = questionText.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_, alt) => {
          // Use the first available image since backend extracts images in order
          return `<img src="${imageUrls[0]}" alt="${alt || 'Question Image'}" style="max-width:300px;height:auto;display:block;margin:10px auto;border:1px solid #ddd;padding:5px;" />`;
        });

        // Replace HTML img tags with actual images
        questionText = questionText.replace(/<img[^>]*src=["']([^"']*)["'][^>]*>/gi, () => {
          // Use the first available image
          return `<img src="${imageUrls[0]}" alt="Question Image" style="max-width:300px;height:auto;display:block;margin:10px auto;border:1px solid #ddd;padding:5px;" />`;
        });

        // If content mentions images but no image tags found, append the first image
        if (!questionText.includes('<img') && imageUrls.length > 0) {
          const hasImageKeywords = /image|figure|diagram|chart|graph|picture|represents|shown|below|above/i.test(questionText);
          if (hasImageKeywords) {
            questionText += `\n<img src="${imageUrls[0]}" alt="Question Image" style="max-width:300px;height:auto;display:block;margin:10px auto;border:1px solid #ddd;padding:5px;" />`;
          }
        }
      }

      // Fallback: Check for legacy imageData or chemicalImages fields
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

      // Process question text with tables, images, and LaTeX
      let processedQuestion = processTextForPDF(questionText);

      // Apply image processing after table processing
      processedQuestion = processedQuestion
        // Handle markdown images only (base64 images already processed by processTextForPDF)
        .replace(/!\[([^\]]*)\]\(data:image\/([^;]+);base64,([^)]+)\)/g,
          '<img src="data:image/$2;base64,$3" alt="$1" style="max-width:300px;height:auto;display:block;margin:10px auto;border:1px solid #ddd;padding:5px;" />')
        // Handle image references from imageData field
        .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_, alt, src) => {
          // Try to find matching image in question's imageData
          const imageData = (q as any).imageData || (q as any).chemicalImages;
          if (imageData && typeof imageData === 'object') {
            // Debug: Looking for image match

            // Try multiple matching strategies
            let imageKey = null;

            // Strategy 1: Exact match
            if (imageData[src]) {
              imageKey = src;
            }
            // Strategy 2: Try without extension
            else {
              const srcWithoutExt = src.replace(/\.(jpeg|jpg|png)$/i, '');
              imageKey = Object.keys(imageData).find(key =>
                key.includes(srcWithoutExt) ||
                key.replace(/\.(jpeg|jpg|png)$/i, '') === srcWithoutExt
              );
            }
            // Strategy 3: Try partial matches
            if (!imageKey) {
              imageKey = Object.keys(imageData).find(key =>
                key.includes(src) || src.includes(key)
              );
            }
            // Strategy 4: Extract numbers and match
            if (!imageKey) {
              const srcNumbers = src.match(/\d+/g);
              if (srcNumbers) {
                imageKey = Object.keys(imageData).find(key =>
                  srcNumbers.some((num: string) => key.includes(num))
                );
              }
            }

            if (imageKey && imageData[imageKey]) {
              return `<img src="${imageData[imageKey]}" alt="${alt}" style="max-width:300px;height:auto;display:block;margin:10px auto;border:1px solid #ddd;padding:5px;" />`;
            } else {
              // No matching image found
            }
          }
          return `[Missing Image: ${src}]`;
        })
        // Remove broken image references
        .replace(/img\s*[−-]\s*\d+\.(jpeg|jpg|png)\s*\([^)]*\)/gi, '')
        // Remove standalone base64 strings
        .replace(/[A-Za-z0-9+/]{100,}={0,2}/g, '');

      const processedOptions = q.options.map(opt => {
        // Process option text with tables first
        let processedOpt = processTextForPDF(opt);

        // Apply image processing after table processing
        return processedOpt
          // Handle markdown images only (base64 images already processed by processTextForPDF)
          .replace(/!\[([^\]]*)\]\(data:image\/([^;]+);base64,([^)]+)\)/g,
            '<img src="data:image/$2;base64,$3" alt="$1" style="max-width:200px;height:auto;display:inline-block;margin:5px;border:1px solid #ddd;padding:3px;" />')
          // Handle image references from imageData field
          .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_, alt, src) => {
            // Try to find matching image in question's imageData
            const imageData = (q as any).imageData || (q as any).chemicalImages;
            if (imageData && typeof imageData === 'object') {
              // Try multiple matching strategies
              let imageKey = null;

              // Strategy 1: Exact match
              if (imageData[src]) {
                imageKey = src;
              }
              // Strategy 2: Try without extension
              else {
                const srcWithoutExt = src.replace(/\.(jpeg|jpg|png)$/i, '');
                imageKey = Object.keys(imageData).find(key =>
                  key.includes(srcWithoutExt) ||
                  key.replace(/\.(jpeg|jpg|png)$/i, '') === srcWithoutExt
                );
              }
              // Strategy 3: Try partial matches
              if (!imageKey) {
                imageKey = Object.keys(imageData).find(key =>
                  key.includes(src) || src.includes(key)
                );
              }
              // Strategy 4: Extract numbers and match
              if (!imageKey) {
                const srcNumbers = src.match(/\d+/g);
                if (srcNumbers) {
                  imageKey = Object.keys(imageData).find(key =>
                    srcNumbers.some((num: string) => key.includes(num))
                  );
                }
              }

              if (imageKey && imageData[imageKey]) {
                return `<img src="${imageData[imageKey]}" alt="${alt}" style="max-width:200px;height:auto;display:inline-block;margin:5px;border:1px solid #ddd;padding:3px;" />`;
              }
            }
            return `[Missing Image: ${src}]`;
          })
          // Remove broken image references
          .replace(/img\s*[−-]\s*\d+\.(jpeg|jpg|png)\s*\([^)]*\)/gi, '')
          // Remove standalone base64 strings
          .replace(/[A-Za-z0-9+/]{100,}={0,2}/g, '');
      });

      const qHtml = `
        <div class="question">
          <div class="question-content">
            <p><strong>${questionNumber}.</strong> ${processedQuestion}</p>
          </div>
          <div class="options">
            ${processedOptions.map((opt, i) => `<p>${String.fromCharCode(97 + i)}) ${opt}</p>`).join('')}
          </div>
          <div class="answer">
            <p class="answer-text">Answer: ${answerLetter})</p>
          </div>
          ${solutionHtml}
          ${hintsHtml}
        </div>`;
      return acc + heading + qHtml;
    }, '')}
  </div>
  <footer>Medicos | ${new Date().toLocaleDateString()}</footer>
</body>
</html>`;

    console.log('[SOL-PDF] environment', { NODE_ENV: process.env.NODE_ENV, VERCEL: !!process.env.VERCEL });
    console.log('Launching Playwright for solutions PDF generation...');
    const launchOpts = await getLaunchOptions();
    console.log('[SOL-PDF] Resolved executablePath:', launchOpts.executablePath || '(default from Playwright)');

    const usePuppeteerOnVercel = !!process.env.VERCEL && !!puppeteer && (!!awsLambdaChromium || !!awsChromium);
    console.log('[SOL-PDF] runtime choice', { usePuppeteerOnVercel, haveAwsLambda: !!awsLambdaChromium, haveAwsChromium: !!awsChromium });
    let browser: any = null;
    let context: any = null;
    let page: any = null;

    try {
      if (usePuppeteerOnVercel) {
        console.log('[SOL-PDF] Using puppeteer-core + @sparticuz/chromium fallback');
        const chromiumExec = typeof awsChromium.executablePath === 'function'
          ? await awsChromium.executablePath()
          : awsChromium.executablePath;
        const chromiumArgs = Array.isArray(awsChromium.args) ? awsChromium.args : [];
        console.log('[SOL-PDF] awsChromium resolved', { chromiumExec, hasArgs: chromiumArgs.length > 0, headless: awsChromium.headless });
        if (!chromiumExec) throw new Error('awsChromium.executablePath not resolved');

        browser = await puppeteer.launch({
          headless: typeof awsChromium.headless !== 'undefined' ? awsChromium.headless : true,
          args: [...chromiumArgs, '--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
          defaultViewport: awsChromium.defaultViewport || { width: 1280, height: 800 },
          executablePath: chromiumExec,
        } as any);
        page = await browser.newPage();
      } else {
        // Pure Puppeteer path on non-serverless (or when Playwright not desired)
        const localExec = process.env.CHROME_EXECUTABLE_PATH || process.env.GOOGLE_CHROME_SHIM || process.env.CHROMIUM_PATH || findLocalChromeExecutable();
        console.log('[SOL-PDF] Using local Puppeteer executable', { localExec });
        if (!localExec) throw new Error('No local Chrome/Chromium executable found');

        browser = await puppeteer.launch({
          headless: true,
          args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
          defaultViewport: { width: 1280, height: 800 },
          executablePath: localExec,
        } as any);
        page = await browser.newPage();
      }

      console.log('Setting HTML content for solutions PDF...');
      await page.setContent(html, { waitUntil: 'networkidle' });

      // Wait until KaTeX has rendered math. Small delay to be safe.
      await page.waitForFunction(() => {
        return Array.from(document.querySelectorAll('.katex')).length > 0;
      }, { timeout: 3000 }).catch(() => {});

      // Extra small delay to ensure layout settles
      await new Promise(resolve => setTimeout(resolve, 200));

      console.log('Generating solutions PDF...');
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '20mm', right: '15mm', bottom: '20mm', left: '15mm' },
      } as any);

      await browser.close();
      console.log('Solutions PDF generated successfully, size:', pdfBuffer.length, 'bytes');

      return new NextResponse(Buffer.from(pdfBuffer), {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      });
    } catch (browserError) {
      console.error('Playwright solutions PDF generation failed:', {
        message: (browserError as any)?.message,
        stack: (browserError as any)?.stack,
        name: (browserError as any)?.name
      });
      throw browserError;
    } finally {
      try { await context?.close(); } catch {}
      try { await browser?.close(); } catch {}
    }

  } catch (error: any) {
    console.error('Solutions PDF generation failed:', error);
    return new NextResponse(JSON.stringify({ error: 'Solutions PDF generation failed' }), { status: 500 });
  }
};
