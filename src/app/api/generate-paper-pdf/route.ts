//route.ts

import { NextRequest, NextResponse } from 'next/server';

import fs from 'node:fs';
import path from 'node:path';


// Ensure Node.js runtime on Vercel, disable caching, and allow longer execution
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60; // seconds

// Dynamic imports (per Vercel guidance)
let chromium: any;
// Remote Chromium pack URL for @sparticuz/chromium-min (can override via env)
const REMOTE_CHROMIUM_PACK = process.env.CHROMIUM_REMOTE_PACK_URL || 'https://github.com/Sparticuz/chromium/releases/download/v121.0.0/chromium-v121.0.0-pack.tar';

let puppeteer: any;



function findLocalChromeExecutable(): string | undefined {
  const isWin = process.platform === 'win32';
  const isMac = process.platform === 'darwin';
  const pf = process.env['PROGRAMFILES'] || 'C:\\\u005c\u005cProgram Files';
  const pfx86 = process.env['PROGRAMFILES(X86)'] || 'C:\\\u005c\u005cProgram Files (x86)';
  const localAppData = process.env['LOCALAPPDATA'];

  const candidates = isWin
    ? [
        `${pf}\\Google\\Chrome\\Application\\chrome.exe`,
        `${pfx86}\\Google\\Chrome\\Application\\chrome.exe`,
        `${pf}\\Microsoft\\Edge\\Application\\msedge.exe`,
        `${pfx86}\\Microsoft\\Edge\\Application\\msedge.exe`,
        ...(localAppData ? [
          `${localAppData}\\Google\\Chrome\\Application\\chrome.exe`,
          `${localAppData}\\Microsoft\\Edge\\Application\\msedge.exe`,
        ] : []),
      ]
    : isMac
    ? ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome']
    : ['/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/usr/bin/chromium-browser', '/usr/bin/chromium'];

  for (const p of candidates) {
    try { if (fs.existsSync(p)) return p; } catch {}
  }
  return undefined;
}

async function getLaunchOptions() {
  const isVercel = !!process.env.VERCEL || !!process.env.VERCEL_ENV;
  let launchOptions: any = { headless: true };

  if (isVercel) {
    // Serverless (Vercel): puppeteer-core + @sparticuz/chromium(-min) with remote pack fallback
    try {
      chromium = (await import('@sparticuz/chromium-min')).default;
    } catch {
      chromium = (await import('@sparticuz/chromium')).default;
    }
    const core = await import('puppeteer-core');
    puppeteer = (core as any).default || (core as any);

    try { chromium.setHeadlessMode?.(true); } catch {}
    try { chromium.setGraphicsMode?.(false); } catch {}

    let executablePath: string | undefined;
    try { executablePath = await chromium.executablePath(REMOTE_CHROMIUM_PACK); }
    catch { executablePath = await chromium.executablePath(); }

    launchOptions = {
      args: chromium.args,
      defaultViewport: chromium.defaultViewport ?? { width: 1280, height: 800 },
      executablePath,
      headless: true,
    };
  } else {
    // Local dev: prefer full puppeteer, fallback to puppeteer-core
    try {
      const modName = 'puppeteer' as any;
      const full = await (import(modName));
      puppeteer = (full as any).default || (full as any);
    } catch {
      const core = await import('puppeteer-core');
      puppeteer = (core as any).default || (core as any);
    }

    const envExec = process.env.CHROME_EXECUTABLE_PATH || process.env.GOOGLE_CHROME_SHIM || process.env.CHROMIUM_PATH;
    const localExec = (envExec && fs.existsSync(envExec)) ? envExec : findLocalChromeExecutable();

    launchOptions = {
      headless: true,
      executablePath: localExec,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
      defaultViewport: { width: 1280, height: 800 },
    };
  }

  console.log('[PDF] getLaunchOptions resolved', {
    isVercel,
    executablePath: launchOptions.executablePath,
    args: launchOptions.args,
  });

  return launchOptions;
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

  // Handle cases where base64 data appears on a new line after text
  processedText = processedText.replace(/([^\n])\s*\n\s*(data:image\/[^;]+;base64,[A-Za-z0-9+/=]+)/g, (match, character, base64Data) => {
    return character + ' ' + createImageTag(base64Data);
  });

  // Handle cases where base64 data appears immediately after text without parentheses
  processedText = processedText.replace(/(\?|\.|\s)\s*(data:image\/[^;]+;base64,[A-Za-z0-9+/=]+)/g, (match, punctuation, base64Data) => {
    return punctuation + createImageTag(base64Data);
  });

  // Handle cases where base64 appears at the end of a line without any punctuation
  processedText = processedText.replace(/([a-zA-Z0-9])\s*(data:image\/[^;]+;base64,[A-Za-z0-9+/=]+)/g, (match, character, base64Data) => {
    return character + ' ' + createImageTag(base64Data);
  });

  // Handle cases where base64 appears at the very beginning of text
  processedText = processedText.replace(/^(data:image\/[^;]+;base64,[A-Za-z0-9+/=]+)/g, (match, base64Data) => {
    return createImageTag(base64Data);
  });

  // Handle cases where base64 appears on its own line
  processedText = processedText.replace(/\n\s*(data:image\/[^;]+;base64,[A-Za-z0-9+/=]+)\s*\n/g, (match, base64Data) => {
    return '\n' + createImageTag(base64Data) + '\n';
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

  // Note: If any base64 remains after processing, we log but do not drop content
  const remainingBase64 = processedText.match(/data:image\/[^;]+;base64,[A-Za-z0-9+/=]+/g);
  if (remainingBase64 && remainingBase64.length > 0) {
    console.warn('Remaining base64 found after processing:', remainingBase64.length);
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
    console.log('PDF generation started');
    const payload = (await req.json()) as PdfGeneratorPayload;

    // Add more detailed logging
    console.log('Payload received:', {
      title: payload.title,
      questionsCount: payload.questions?.length || 0,
      environment: process.env.NODE_ENV
    });

    // Validate payload
    if (!payload.questions || !Array.isArray(payload.questions) || payload.questions.length === 0) {
      console.error('No questions provided');
      return new NextResponse(JSON.stringify({ error: 'No questions provided' }), { status: 400 });
    }

    // Destructure payload variables
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

    // Validate questions
    const validQuestions = questions.filter(q => q && q.question && q.options);
    if (validQuestions.length === 0) {
      console.error('No valid questions found');
      return new NextResponse(JSON.stringify({ error: 'No valid questions found' }), { status: 400 });
    }

    // FIX: Ensure chromium libs are resolvable at runtime (fixes libnss3.so errors)
    const libPath = `${process.cwd()}/node_modules/@sparticuz/chromium/lib`;
    process.env.LD_LIBRARY_PATH = [process.env.LD_LIBRARY_PATH, libPath].filter(Boolean).join(':');

    console.log('[PDF] environment', { NODE_ENV: process.env.NODE_ENV, VERCEL: !!process.env.VERCEL });

    let browser: any = null;
    let page: any = null;

    try {
      const launchOptions = await getLaunchOptions();
      console.log('[PDF] Launching Puppeteer with options:', {
        executablePath: launchOptions.executablePath,
        args: launchOptions.args,
        headless: launchOptions.headless,
      });
      browser = await puppeteer.launch(launchOptions);
      page = await browser.newPage();
      console.log('[PDF] Browser launched successfully');

    // Generate HTML (your existing HTML generation code continues here...)
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
          errorColor: '#000000',
          strict: 'ignore'
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
    break-inside: avoid-column; /* Explicit for multi-column */
    -webkit-column-break-inside: avoid; /* Vendor prefix for Chromium */
    page-break-inside: avoid; /* Prevents question from breaking across pages */
    margin-bottom: 12px;
    display: block; /* Ensure it's a block container */
    overflow: visible; /* Allow content to flow naturally */
  }

  /* Options styling */
  .options {
    margin-left: 16px;
    break-inside: avoid; /* Keep options with their question */
    break-inside: avoid-column;
    -webkit-column-break-inside: avoid;
  }
  .options p { margin: 2px 0; break-inside: avoid; -webkit-column-break-inside: avoid; }

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

  /* Global image styling */
  img {
    max-width: 85% !important; /* Better fit within column */
    max-height: 140px !important; /* Cap height to keep options with question */
    width: auto !important;
    height: auto !important;
    object-fit: contain !important;
    display: block !important;
    margin: 6px auto !important;
    border: 1px solid #ddd !important;
    padding: 3px !important;
    break-inside: avoid;
    -webkit-column-break-inside: avoid;
    page-break-inside: avoid;
  }

  /* More specific control for question text images */
  .question-content img {
    max-width: 80% !important;
    max-height: 120px !important;
  }

  /* Options images slightly smaller */
  .options img {
    max-width: 70% !important;
    max-height: 100px !important;
    display: inline-block !important;
    vertical-align: middle;
    margin: 4px 6px !important;
  }

  /* Ensure question text and images stay together */
  .question p, .question img, .options, .options p {
    break-inside: avoid;
    break-inside: avoid-column;
    -webkit-column-break-inside: avoid;
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
            // Updated question processing section within the HTML generation
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
        // Process all images in the imageUrls array
        imageUrls.forEach((imageUrl: string, imgIndex: number) => {
          if (imageUrl && typeof imageUrl === 'string' && imageUrl.startsWith('data:image/')) {
            console.log(`Question ${questionIndex + 1} image ${imgIndex + 1}:`, imageUrl.substring(0, 50) + '...');

            // For the first image, try to replace markdown/HTML references
            if (imgIndex === 0) {
              // Replace markdown image references like ![img-13.jpeg](img-13.jpeg) with actual images
              const originalText = questionText;
              let markdownReplacements = 0;
              questionText = questionText.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt) => {
                console.log(`Replacing markdown image: ${match}`);
                markdownReplacements++;
                return `<img src="${imageUrl}" alt="${alt || 'Question Image'}" style="max-width:75%;max-height:120px;width:auto;height:auto;display:block;margin:6px auto;border:1px solid #ddd;padding:3px;break-inside:avoid;page-break-inside:avoid;object-fit:contain;" onerror="this.style.display='none';" />`;
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
                return `<img src="${imageUrl}" alt="Question Image" style="max-width:75%;max-height:120px;width:auto;height:auto;display:block;margin:6px auto;border:1px solid #ddd;padding:3px;break-inside:avoid;page-break-inside:avoid;object-fit:contain;" onerror="this.style.display='none';" />`;
              });

              console.log(`Question ${questionIndex + 1}: Made ${markdownReplacements} markdown replacements, ${htmlReplacements} HTML replacements`);

              // If content mentions images but no image tags found, append the image
              if (!questionText.includes('<img') && imageUrls.length > 0) {
                const hasImageKeywords = /image|figure|diagram|chart|graph|picture|represents|shown|below|above|given/i.test(questionText);
                if (hasImageKeywords) {
                  console.log(`Question ${questionIndex + 1}: Adding image for keywords`);
                  questionText += `\n<img src="${imageUrl}" alt="Question Image" style="max-width:75%;max-height:120px;width:auto;height:auto;display:block;margin:6px auto;border:1px solid #ddd;padding:3px;break-inside:avoid;page-break-inside:avoid;object-fit:contain;" onerror="this.style.display='none';" />`;
                }
              }
            } else {
              // For additional images, append them to the question text
              questionText += `\n<img src="${imageUrl}" alt="Additional Image ${imgIndex + 1}" style="max-width:75%;max-height:120px;width:auto;height:auto;display:block;margin:6px auto;border:1px solid #ddd;padding:3px;break-inside:avoid;page-break-inside:avoid;object-fit:contain;" onerror="this.style.display='none';" />`;
            }
          } else {
            console.log(`Question ${questionIndex + 1} image ${imgIndex + 1}: Invalid format:`, typeof imageUrl, imageUrl ? imageUrl.substring(0, 20) : 'null');
          }
        });
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
      // IMPORTANT: Apply processTextForPDF BEFORE LaTeX sanitization
      // This ensures base64 images are converted to img tags first
      processedQuestion = processTextForPDF(questionText);

      // Then apply LaTeX sanitization
      processedQuestion = sanitizeLatexForPDF(processedQuestion);

      // Final cleanup: Remove any broken img tags that don't have src attributes
      processedQuestion = processedQuestion.replace(/<img(?![^>]*src=)[^>]*>/gi, '');

      // Also clean up any remaining broken image references
      processedQuestion = processedQuestion.replace(/img\s*[âˆ'-]\s*\d+\.(jpeg|jpg|png)\s*\([^)]*\)/gi, '');

    } catch (error) {
      console.error('Error processing question text:', error);
      processedQuestion = questionText; // Fallback to raw text
    }

    // Apply LaTeX fixes after table processing
    processedQuestion = processedQuestion
      // Fix the main \ffrac issue - exact patterns from your examples
      .replace(/\\ffracÏ‰LR/g, '\\frac{Ï‰}{LR}')
      .replace(/\\ffrac1Ï‰CR/g, '\\frac{1}{Ï‰CR}')
      .replace(/\\ffracLC\\ffrac1R/g, '\\frac{LC}{\\frac{1}{R}}')
      .replace(/\\ffracRLC/g, '\\frac{R}{LC}')
      .replace(/\\ffrac100Ï€MHz/g, '\\frac{100}{Ï€MHz}')
      .replace(/\\ffrac1000Ï€Hz/g, '\\frac{1000}{Ï€Hz}')
      .replace(/\\ffrac11000ohm/g, '\\frac{1}{1000ohm}')
      .replace(/\\ffrac1CÏ‰/g, '\\frac{1}{CÏ‰}')
      // Fix basic \ffrac patterns
      .replace(/\\ffrac\{/g, '\\frac{')
      .replace(/\\ffrac([Ï‰Ï€Î±-Ï‰Î©])([A-Z]+)/g, '\\frac{$1}{$2}')
      .replace(/\\ffrac(\d+)([Ï‰Ï€Î±-Ï‰Î©])([A-Z]+)/g, '\\frac{$1}{$2$3}')
      .replace(/\\ffrac([A-Z]+)([A-Z]+)/g, '\\frac{$1}{$2}')
      // Convert Greek letters to Unicode symbols
      .replace(/\\alpha/g, 'Î±')
      .replace(/\\beta/g, 'Î²')
      .replace(/\\gamma/g, 'Î³')
      .replace(/\\delta/g, 'Î´')
      .replace(/\\epsilon/g, 'Îµ')
      .replace(/\\varepsilon/g, 'Îµ')
      .replace(/\\zeta/g, 'Î¶')
      .replace(/\\eta/g, 'Î·')
      .replace(/\\theta/g, 'Î¸')
      .replace(/\\iota/g, 'Î¹')
      .replace(/\\kappa/g, 'Îº')
      .replace(/\\lambda/g, 'Î»')
      .replace(/\\mu/g, 'Î¼')
      .replace(/\\nu/g, 'Î½')
      .replace(/\\xi/g, 'Î¾')
      .replace(/\\pi/g, 'Ï€')
      .replace(/\\rho/g, 'Ï')
      .replace(/\\sigma/g, 'Ïƒ')
      .replace(/\\tau/g, 'Ï„')
      .replace(/\\upsilon/g, 'Ï…')
      .replace(/\\phi/g, 'Ï†')
      .replace(/\\chi/g, 'Ï‡')
      .replace(/\\psi/g, 'Ïˆ')
      .replace(/\\omega/g, 'Ï‰')
      .replace(/\\Omega/g, 'Î©')
      .replace(/\\Delta/g, 'Î"')
      .replace(/\\Gamma/g, 'Î"')
      .replace(/\\Lambda/g, 'Î›')
      .replace(/\\Phi/g, 'Î¦')
      .replace(/\\Pi/g, 'Î ')
      .replace(/\\Psi/g, 'Î¨')
      .replace(/\\Sigma/g, 'Î£')
      .replace(/\\Theta/g, 'Î˜')
      .replace(/\\Xi/g, 'Îž')
      // Remove any remaining broken image references
      .replace(/img\s*[âˆ'-]\s*\d+\.(jpeg|jpg|png)\s*\([^)]*\)/gi, '')
      ;

    const processedOptions = (q.options || []).map((opt: string) => {
      try {
        // Process option text with images first, then apply LaTeX sanitization
        let processedOpt = processTextForPDF(opt);
        processedOpt = sanitizeLatexForPDF(processedOpt);

        // Clean up any broken img tags in options too
        processedOpt = processedOpt.replace(/<img(?![^>]*src=)[^>]*>/gi, '');

        // Apply LaTeX fixes after table processing
        return processedOpt
          // Fix the main \ffrac issue - exact patterns
          .replace(/\\ffracÏ‰LR/g, '\\frac{Ï‰}{LR}')
          .replace(/\\ffrac1Ï‰CR/g, '\\frac{1}{Ï‰CR}')
          .replace(/\\ffracLC\\ffrac1R/g, '\\frac{LC}{\\frac{1}{R}}')
          .replace(/\\ffracRLC/g, '\\frac{R}{LC}')
          .replace(/\\ffrac100Ï€MHz/g, '\\frac{100}{Ï€MHz}')
          .replace(/\\ffrac1000Ï€Hz/g, '\\frac{1000}{Ï€Hz}')
          .replace(/\\ffrac11000ohm/g, '\\frac{1}{1000ohm}')
          .replace(/\\ffrac1CÏ‰/g, '\\frac{1}{CÏ‰}')
          // Fix basic \ffrac patterns
          .replace(/\\ffrac\{/g, '\\frac{')
          .replace(/\\ffrac([Ï‰Ï€Î±-Ï‰Î©])([A-Z]+)/g, '\\frac{$1}{$2}')
          .replace(/\\ffrac(\d+)([Ï‰Ï€Î±-Ï‰Î©])([A-Z]+)/g, '\\frac{$1}{$2$3}')
          .replace(/\\ffrac([A-Z]+)([A-Z]+)/g, '\\frac{$1}{$2}')
          // Convert Greek letters to Unicode symbols
          .replace(/\\alpha/g, 'Î±')
          .replace(/\\beta/g, 'Î²')
          .replace(/\\gamma/g, 'Î³')
          .replace(/\\delta/g, 'Î´')
          .replace(/\\epsilon/g, 'Îµ')
          .replace(/\\varepsilon/g, 'Îµ')
          .replace(/\\zeta/g, 'Î¶')
          .replace(/\\eta/g, 'Î·')
          .replace(/\\theta/g, 'Î¸')
          .replace(/\\iota/g, 'Î¹')
          .replace(/\\kappa/g, 'Îº')
          .replace(/\\lambda/g, 'Î»')
          .replace(/\\mu/g, 'Î¼')
          .replace(/\\nu/g, 'Î½')
          .replace(/\\xi/g, 'Î¾')
          .replace(/\\pi/g, 'Ï€')
          .replace(/\\rho/g, 'Ï')
          .replace(/\\sigma/g, 'Ïƒ')
          .replace(/\\tau/g, 'Ï„')
          .replace(/\\upsilon/g, 'Ï…')
          .replace(/\\phi/g, 'Ï†')
          .replace(/\\chi/g, 'Ï‡')
          .replace(/\\psi/g, 'Ïˆ')
          .replace(/\\omega/g, 'Ï‰')
          .replace(/\\Omega/g, 'Î©')
          .replace(/\\Delta/g, 'Î"')
          .replace(/\\Gamma/g, 'Î"')
          .replace(/\\Lambda/g, 'Î›')
          .replace(/\\Phi/g, 'Î¦')
          .replace(/\\Pi/g, 'Î ')
          .replace(/\\Psi/g, 'Î¨')
          .replace(/\\Sigma/g, 'Î£')
          .replace(/\\Theta/g, 'Î˜')
          .replace(/\\Xi/g, 'Îž')
          // Remove any remaining broken image references
          .replace(/img\s*[âˆ'-]\s*\d+\.(jpeg|jpg|png)\s*\([^)]*\)/gi, '')
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

    console.log('Setting page content...');
    if (!page) throw new Error('Puppeteer page not initialized');

    await page.setContent(html, { waitUntil: 'networkidle2' });

    // Wait until KaTeX has rendered math (best-effort)
    try {
      await page.waitForFunction(() => {
        return Array.from(document.querySelectorAll('.katex')).length > 0;
      }, { timeout: 3000 });
    } catch {}

    // Small extra delay to allow layout to settle in multi-column flow
    await new Promise(resolve => setTimeout(resolve, 200));

    console.log('Generating PDF...');
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '20mm', right: '15mm', bottom: '20mm', left: '15mm' },
    } as any);

    await browser.close();
    console.log('PDF generated successfully, size:', pdfBuffer.length);

    return new NextResponse(Buffer.from(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${payload.filename || 'question-paper.pdf'}"`,
      },
    });
  } catch (browserError) {
    console.error('PDF generation failed (browser):', {
      message: (browserError as any)?.message,
      stack: (browserError as any)?.stack,
      name: (browserError as any)?.name
    });
    throw browserError;
  } finally {
    try { await browser?.close(); } catch {}
  }

  } catch (error: any) {
    console.error('PDF generation failed:', error);
    return new NextResponse(JSON.stringify({ error: 'PDF generation failed' }), { status: 500 });
  }
};