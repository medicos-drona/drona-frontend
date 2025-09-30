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
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage','--disable-gpu','--disable-software-rasterizer'],
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
    // Clean up the base64 string and validate it
    const cleanSrc = src.replace(/\s+/g, '');

    // Check if the base64 string is valid and not too long
    if (!cleanSrc.startsWith('data:image/')) {
      console.warn('Invalid image data format:', cleanSrc.substring(0, 50));
      return `<div style="border:1px solid #ccc;padding:5px;margin:4px auto;text-align:center;background:#f9f9f9;font-size:12px;max-width:300px;">Image could not be loaded</div>`;
    }

    // For very large images, add additional error handling
    const base64Part = cleanSrc.split(',')[1];
    if (base64Part && base64Part.length > 100000) {
      console.warn('Very large image detected, length:', base64Part.length);
    }

    // Use smaller max-width to preserve 2-column layout and fix HTML escaping
    return `<img src="${cleanSrc}" alt="${alt}" style="max-width:100%;width:auto;height:auto;display:block;margin:4px auto;border:1px solid #ddd;padding:2px;break-inside:avoid;page-break-inside:avoid;box-sizing:border-box;" onerror="this.style.display='none';" />`;
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
  processedText = processedText.replace(/^(data:image\/[^;]+;base64,[A-Za-z0-9+/=]+)/gm, (match, base64Data) => {
    return createImageTag(base64Data);
  });

  // Handle cases where base64 appears on its own line
  processedText = processedText.replace(/\n\s*(data:image\/[^;]+;base64,[A-Za-z0-9+/=]+)\s*\n/g, (match, base64Data) => {
    return '\n' + createImageTag(base64Data) + '\n';
  });

  // Then handle any remaining standalone base64 data
  // Use the correct pattern that finds individual base64 strings
  // Process from end to beginning to avoid index shifting issues
  const base64Matches = [];
  const base64Pattern = /data:image\/[^;]+;base64,[A-Za-z0-9+/=]+/g;
  let match;

  // Collect all matches first
  while ((match = base64Pattern.exec(processedText)) !== null) {
    base64Matches.push({
      fullMatch: match[0],
      startIndex: match.index,
      endIndex: match.index + match[0].length
    });
  }

  // Process matches from end to beginning to avoid index shifting
  for (let i = base64Matches.length - 1; i >= 0; i--) {
    const matchInfo = base64Matches[i];
    const base64Data = matchInfo.fullMatch;

    // Only process if it's not already inside an img tag
    const beforeMatch = processedText.substring(Math.max(0, matchInfo.startIndex - 100), matchInfo.startIndex);
    const afterMatch = processedText.substring(matchInfo.endIndex, Math.min(processedText.length, matchInfo.endIndex + 100));

    // Check if it's already inside an img tag
    if (!beforeMatch.includes('<img') || afterMatch.includes('</img>') || afterMatch.includes('/>')) {
      // Replace standalone base64 string with an img tag
      const beforeText = processedText.substring(0, matchInfo.startIndex);
      const afterText = processedText.substring(matchInfo.endIndex);
      processedText = beforeText + createImageTag(base64Data) + afterText;
    }
  }

  // Note: If any base64 remains after processing, we log but do not drop content
  const remainingBase64 = processedText.match(/data:image\/[^;]+;base64,[A-Za-z0-9+/=]+/g);
  if (remainingBase64 && remainingBase64.length > 0) {
    console.warn('Remaining base64 found after processing:', remainingBase64.length);
    // Log the first few characters of each remaining base64 for debugging
    remainingBase64.forEach((base64, index) => {
      console.warn(`Remaining base64 ${index + 1}:`, base64.substring(0, 100) + '...');
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
// Convert LaTeX expressions to human-readable text for PDF
function convertLatexToReadableText(text: string): string {
  if (!text) return '';

  // Helper function to convert LaTeX math expressions to readable text
  const convertMathExpression = (mathContent: string): string => {
    let converted = mathContent.trim();

    // Remove common LaTeX commands and convert to readable text
    converted = converted
      // Handle \left and \right delimiters first (remove them but keep the delimiters)
      .replace(/\\left\s*\(/g, '(')
      .replace(/\\right\s*\)/g, ')')
      .replace(/\\left\s*\[/g, '[')
      .replace(/\\right\s*\]/g, ']')
      .replace(/\\left\s*\{/g, '{')
      .replace(/\\right\s*\}/g, '}')
      .replace(/\\left\s*\|/g, '|')
      .replace(/\\right\s*\|/g, '|')
      .replace(/\\left\s*/g, '')  // Remove any remaining \left
      .replace(/\\right\s*/g, '') // Remove any remaining \right

      // Handle vector arrows and overlines FIRST (before removing braces)
      // Use simple arrow notation for vectors (widely supported)
      .replace(/\\overrightarrow\{([^}]+)\}/g, '$1→')
      .replace(/\\vec\{([^}]+)\}/g, '$1→')
      .replace(/\\overline\{([^}]+)\}/g, '$1̄')
      .replace(/\\bar\{([^}]+)\}/g, '$1̄')
      .replace(/overrightarrow\{([^}]+)\}/g, '$1→')  // Handle missing backslash
      .replace(/overrightarrow([a-zA-Z0-9]+)/g, '$1→')  // Handle malformed overrightarrow

      // Handle fractions (including malformed ones) - AFTER vector processing
      .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1)/($2)')
      .replace(/\\ffrac\{([^}]+)\}\{([^}]+)\}/g, '($1)/($2)')
      .replace(/\\ffrac([^{}\s]+)([^{}\s]+)/g, '$1/$2')
      .replace(/\\dfrac\{([^}]+)\}\{([^}]+)\}/g, '($1)/($2)')
      .replace(/\\tfrac\{([^}]+)\}\{([^}]+)\}/g, '($1)/($2)')
      .replace(/frac\{([^}]+)\}\{([^}]+)\}/g, '($1)/($2)')  // Handle missing backslash
      .replace(/frac([^{}\s]+)([^{}\s]+)/g, '$1/$2')        // Handle malformed frac

      // Handle superscripts and subscripts
      .replace(/\^{([^}]+)}/g, (_, content) => {
        // Convert common superscripts to Unicode
        const superscriptMap: Record<string, string> = {
          '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵',
          '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '+': '⁺', '-': '⁻',
          '=': '⁼', '(': '⁽', ')': '⁾', 'n': 'ⁿ'
        };
        return content.split('').map((char: string) => superscriptMap[char] || char).join('');
      })
      .replace(/\^([0-9+-])/g, (_, char) => {
        const superscriptMap: Record<string, string> = {
          '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵',
          '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '+': '⁺', '-': '⁻'
        };
        return superscriptMap[char] || char;
      })

      .replace(/_{([^}]+)}/g, (_, content) => {
        // Convert common subscripts to Unicode
        const subscriptMap: Record<string, string> = {
          '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄', '5': '₅',
          '6': '₆', '7': '₇', '8': '₈', '9': '₉', '+': '₊', '-': '₋',
          '=': '₌', '(': '₍', ')': '₎'
        };
        return content.split('').map((char: string) => subscriptMap[char] || char).join('');
      })
      .replace(/_([0-9+-])/g, (_, char) => {
        const subscriptMap: Record<string, string> = {
          '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄', '5': '₅',
          '6': '₆', '7': '₇', '8': '₈', '9': '₉', '+': '₊', '-': '₋'
        };
        return subscriptMap[char] || char;
      })



      // Handle arrows
      .replace(/\\rightarrow/g, '→')
      .replace(/\\leftarrow/g, '←')
      .replace(/\\leftrightarrow/g, '↔')
      .replace(/\\Rightarrow/g, '⇒')
      .replace(/\\Leftarrow/g, '⇐')
      .replace(/\\Leftrightarrow/g, '⇔')
      .replace(/rightarrow/g, '→')  // Handle missing backslash
      .replace(/leftarrow/g, '←')   // Handle missing backslash

      // Handle common mathematical symbols
      .replace(/\\times/g, '×')
      .replace(/\\cdot/g, '·')
      .replace(/\\div/g, '÷')
      .replace(/\\pm/g, '±')
      .replace(/\\mp/g, '∓')
      .replace(/\\approx/g, '≈')
      .replace(/\\neq/g, '≠')
      .replace(/\\leq/g, '≤')
      .replace(/\\geq/g, '≥')
      .replace(/\\ll/g, '≪')
      .replace(/\\gg/g, '≫')
      .replace(/\\propto/g, '∝')
      .replace(/\\infty/g, '∞')
      .replace(/\\partial/g, '∂')
      .replace(/\\nabla/g, '∇')
      .replace(/\\sum/g, '∑')
      .replace(/\\prod/g, '∏')
      .replace(/\\int/g, '∫')
      .replace(/\\sqrt\{([^}]+)\}/g, '√($1)')
      .replace(/\\sqrt/g, '√')
      .replace(/\\degree/g, '°')
      .replace(/\\celsius/g, '°C')
      .replace(/\\ohm/g, 'Ω')
      .replace(/\\micro/g, 'μ')
      .replace(/\\angstrom/g, 'Å')

      // Handle Greek letters
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

      // Handle text commands
      .replace(/\\mathrm\{([^}]+)\}/g, '$1')
      .replace(/\\text\{([^}]+)\}/g, '$1')
      .replace(/\\textrm\{([^}]+)\}/g, '$1')
      .replace(/\\textbf\{([^}]+)\}/g, '$1')
      .replace(/\\textit\{([^}]+)\}/g, '$1')

      // Handle spacing commands
      .replace(/\\,/g, ' ')
      .replace(/\\;/g, ' ')
      .replace(/\\:/g, ' ')
      .replace(/\\!/g, '')
      .replace(/\\quad/g, '  ')
      .replace(/\\qquad/g, '    ')

      // Handle common chemistry notation
      .replace(/\\ce\{([^}]+)\}/g, '$1')

      // Handle malformed patterns that appear in the examples
      .replace(/Mleft/g, 'M ')
      .replace(/kleft/g, 'k ')
      .replace(/left/g, '')  // Remove remaining 'left' text
      .replace(/right/g, '') // Remove remaining 'right' text
      .replace(/cright/g, 'c')
      .replace(/~dright/g, ' d')

      // Clean up parentheses issues
      .replace(/\(\(/g, '(')
      .replace(/\)\)/g, ')')
      .replace(/\[\[/g, '[')
      .replace(/\]\]/g, ']')

      // Handle spacing around mathematical operators
      .replace(/([a-zA-Z0-9])\(/g, '$1 (')  // Add space before opening parenthesis
      .replace(/\)([a-zA-Z0-9])/g, ') $1')  // Add space after closing parenthesis


      // Handle aligned/align environments and alignment markers
      .replace(/\\begin\{aligned\}|\\begin\{align\*?\}/g, '')
      .replace(/\\end\{aligned\}|\\end\{align\*?\}/g, '')
      .replace(/\bbeginaligned\b|\bbeginalign\*?\b/gi, '')
      .replace(/\bendaligned\b|\bendalign\*?\b/gi, '')
      .replace(/\\\\/g, '; ') // line breaks inside aligned/align
      .replace(/\\&/g, '&')
      .replace(/\s*&\s*/g, ' ')

      // Logical operators (including malformed without backslashes)
      .replace(/\\vee/g, '∨')
      .replace(/\\wedge/g, '∧')
      .replace(/\\lor/g, '∨')
      .replace(/\\land/g, '∧')
      .replace(/\bvee\b/g, '∨')
      .replace(/\bwedge\b/g, '∧')
      .replace(/\blor\b/g, '∨')
      .replace(/\bland\b/g, '∧')

      // Clean up remaining backslashes and braces
      .replace(/\\([a-zA-Z]+)/g, '$1')
      .replace(/[{}]/g, '')

      // Add proper spacing around operators
      .replace(/([^=\s])=/g, '$1 =')  // Add space before = if not already there
      .replace(/=([^=\s])/g, '= $1')  // Add space after = if not already there

      // Clean up multiple spaces but preserve single spaces around operators
      .replace(/\s+/g, ' ')
      .trim();

    return converted;
  };

  // Process $$...$$ blocks first (display math)
  text = text.replace(/\$\$([\s\S]*?)\$\$/g, (_, inner) => {
    return convertMathExpression(inner);
  });

  // Then process $...$ blocks (inline math)
  text = text.replace(/\$([^$\n]*?)\$/g, (_, inner) => {
    return convertMathExpression(inner);
  });

  // Post-process text to handle malformed LaTeX patterns that appear outside of delimiters
  text = text
    // Handle malformed left/right patterns
    .replace(/([a-zA-Z0-9])left\[/g, '$1 [')
    .replace(/([a-zA-Z0-9])left\(/g, '$1 (')
    .replace(/([a-zA-Z0-9])left\{/g, '$1 {')
    .replace(/\]right([a-zA-Z0-9])/g, '] $1')
    .replace(/\)right([a-zA-Z0-9])/g, ') $1')
    .replace(/\}right([a-zA-Z0-9])/g, '} $1')
    .replace(/right\]/g, ']')
    .replace(/right\)/g, ')')
    .replace(/right\}/g, '}')
    .replace(/left\[/g, '[')
    .replace(/left\(/g, '(')
    .replace(/left\{/g, '{')

    // Handle malformed frac patterns outside of math delimiters
    // Common malformed cases: "fracl₂r₂⁴", "frac2 Re", "fracAB" etc.
    // 1) brace form (correct but left outside math)
    .replace(/frac\{([^}]+)\}\{([^}]+)\}/g, '($1)/($2)')
    // 2) with whitespace between numerator and denominator
    .replace(/\bfrac\s*([^\s{}()]+)\s+([^\s{}()]+)/g, '($1)/($2)')
    // 3) two tokens glued together starting with letters (e.g., fracl₂r₂⁴)
    .replace(/\bfrac([A-Za-z]+[₀-₉⁰-⁹]*)([A-Za-z]+[₀-₉⁰-⁹]*)/g, '($1)/($2)')
    // 4) number then symbol (e.g., frac2Re)
    .replace(/\bfrac([0-9⁰-⁹]+)([A-Za-z]+[₀-₉⁰-⁹]*)/g, '($1)/($2)')
    // 5) general fallback (tokens without spaces)
    .replace(/\bfrac([^{}\s]+)([^{}\s]+)/g, '($1)/($2)')

    // Clean specific artifact where superscripts got split by a slash
    .replace(/⁻\/¹/g, '⁻¹')

    // Handle overrightarrow patterns outside of math delimiters
    .replace(/overrightarrow([a-zA-Z0-9_]+)/g, '$1→')
    .replace(/overrightarrow\{([^}]+)\}/g, '$1→')

    // Handle other common malformed patterns
    .replace(/\\neq/g, '≠')
    .replace(/\\approx/g, '≈')
    .replace(/\\times/g, '×')
    .replace(/\\pm/g, '±')
    .replace(/\\leq/g, '≤')
    .replace(/\\geq/g, '≥')
    .replace(/\\rightarrow/g, '→')
    .replace(/\\leftarrow/g, '←')

    // Handle literal "arrow" text (common in converted/processed text)
    .replace(/\s+arrow\s+/g, ' → ')
    .replace(/arrow/g, '→')

    // Handle malformed text commands (tex/t instead of \text{})
    .replace(/tex\/t\s+/g, '')  // Remove "tex/t " completely
    .replace(/tex\/t/g, '')     // Remove "tex/t" completely
    .replace(/text\s+/g, '')    // Remove standalone "text "

    // Handle other malformed LaTeX text patterns
    .replace(/mathrm\s+/g, '')  // Remove "mathrm " without braces

    // Clean up any remaining malformed patterns
    .replace(/([a-zA-Z0-9])left/g, '$1 ')
    .replace(/right([a-zA-Z0-9])/g, ' $1')
    .replace(/left/g, '')
    .replace(/right/g, '')

    // Clean up multiple spaces
    .replace(/\s+/g, ' ')
    .trim();

  // Final cleanup for specific text patterns (after all other processing)
  text = text
    .replace(/\\text\s+([a-zA-Z]+)/g, '$1')  // Convert "\text word" to "word"
    .replace(/\\mathrm\s+([a-zA-Z]+)/g, '$1') // Convert "\mathrm word" to "word"
    .replace(/\\text\s+/g, '')  // Remove "\text " without braces
    .replace(/\\mathrm\s+/g, '') // Remove "\mathrm " without braces
    .replace(/\\([a-zA-Z]+)\s+/g, '')  // Remove other "\command " patterns
    .replace(/\\([a-zA-Z]+)/g, '')     // Remove remaining "\command" patterns

    // Handle malformed Greek letters outside math delimiters
    .replace(/\\alpha/g, 'α')
    .replace(/\\beta/g, 'β')
    .replace(/\\gamma/g, 'γ')
    .replace(/\\delta/g, 'δ')
    .replace(/\\mu/g, 'μ')
    .replace(/\\pi/g, 'π')
    .replace(/\\omega/g, 'ω')
    .replace(/\\Omega/g, 'Ω')
    .replace(/\\theta/g, 'θ')
    .replace(/\\lambda/g, 'λ')
    .replace(/\\sigma/g, 'σ')

    // Clean up any remaining malformed patterns
    .replace(/([a-zA-Z0-9])left/g, '$1 ')
    .replace(/right([a-zA-Z0-9])/g, ' $1')
    .replace(/left/g, '')
    .replace(/right/g, '')

    // Clean up multiple spaces
    .replace(/\s+/g, ' ')
    .trim();

  // Final cleanup for specific text patterns (after all other processing)
  // Handle these patterns before general backslash cleanup
  text = text
    .replace(/\\text\s+([a-zA-Z]+)/g, '$1')  // Convert "\text word" to "word"
    .replace(/\\mathrm\s+([a-zA-Z]+)/g, '$1') // Convert "\mathrm word" to "word"
    .replace(/\\text(?=\s|$)/g, '')  // Remove "\text" when followed by space or end
    .replace(/\\mathrm(?=\s|$)/g, '') // Remove "\mathrm" when followed by space or end

    // Handle remaining backslash patterns (but exclude text and mathrm)
    .replace(/\\(?!text|mathrm)([a-zA-Z]+)\s+/g, '')  // Remove other "\command " patterns
    .replace(/\\(?!text|mathrm)([a-zA-Z]+)/g, '')     // Remove remaining "\command" patterns

    // Final cleanup of any remaining text/mathrm patterns
    .replace(/\\text/g, '')
    .replace(/\\mathrm/g, '')
    .replace(/\s+/g, ' ')  // Clean up multiple spaces again
    .trim();

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


<style>
  @page {
    size: A4;
    margin: 20mm 15mm 15mm 15mm;
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
  header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
  .college { display: flex; align-items: center; gap: 6px; }
  .college img { height: 24px; width: auto; }
  .title { text-align: center; flex: 1; font-size: 14pt; font-weight: bold; }
  .meta { text-align: right; font-size: 10pt; }
  .meta div { margin: 0; }

  .questions { position: relative; z-index: 1; padding-bottom: 10mm; }
  .subject-section {
    page-break-before: avoid;
    margin-top: 8px;
    page-break-inside: auto; /* allow section to start on first page */
    margin-bottom: 8px;
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
    orphans: 3; /* Minimum lines at bottom of column */
    widows: 3; /* Minimum lines at top of column */
  }

  /* KEY FIX: Question container styling */
  .question {
    break-inside: avoid !important; /* Prevents question from breaking across columns */
    break-inside: avoid-column !important; /* Explicit for multi-column */
    -webkit-column-break-inside: avoid !important; /* Vendor prefix for Chromium */
    page-break-inside: avoid !important; /* Prevents question from breaking across pages */
    margin-bottom: 8px;
    display: block; /* Ensure it's a block container */
    overflow: visible; /* Allow content to flow naturally */
    min-height: 40px; /* Ensure minimum space for question + options */
  }

  /* Options styling */
  .options {
    margin-left: 16px;
    break-inside: avoid !important; /* Keep options with their question */
    break-inside: avoid-column !important;
    -webkit-column-break-inside: avoid !important;
    page-break-inside: avoid !important;
    margin-bottom: 3px;
  }
  .options p {
    margin: 0.5px 0;
    break-inside: avoid !important;
    -webkit-column-break-inside: avoid !important;
    page-break-inside: avoid !important;
  }

  footer {
    position: fixed;
    bottom: 1mm;
    left: 0;
    right: 0;
    font-size: 9pt;
    color: #666;
    background: #fff;
    z-index: 2;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 10mm;
  }

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
    break-inside: avoid !important;
    break-inside: avoid-column !important;
    -webkit-column-break-inside: avoid !important;
    page-break-inside: avoid !important;
  }

  /* Prevent questions from being split near page bottom */
  .question {
    margin-bottom: 10px !important;
  }

  /* Ensure adequate space before footer */
  @page {
    margin-bottom: 10mm !important;
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
  <hr style="page-break-after: avoid; margin: 4px 0;" />
  <p style="page-break-after: avoid; margin-bottom: 4px; font-size: 10pt;">${description}</p>
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
        // Process all images in the imageUrls array
        imageUrls.forEach((imageUrl: string, imgIndex: number) => {
          if (imageUrl && typeof imageUrl === 'string' && imageUrl.startsWith('data:image/')) {
            console.log(`Question ${questionIndex + 1} image ${imgIndex + 1}:`, imageUrl.substring(0, 50) + '...');

            // For the first image, try to replace markdown/HTML references
            if (imgIndex === 0) {
              // Replace markdown image references like ![img-13.jpeg](img-13.jpeg) with actual images
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

      // Then apply LaTeX conversion to readable text
      processedQuestion = convertLatexToReadableText(processedQuestion);

      // Final cleanup: Remove any broken img tags that don't have src attributes
      processedQuestion = processedQuestion.replace(/<img(?![^>]*src=)[^>]*>/gi, '');

      // Also clean up any remaining broken image references
      processedQuestion = processedQuestion.replace(/img\s*[âˆ'-]\s*\d+\.(jpeg|jpg|png)\s*\([^)]*\)/gi, '');

    } catch (error) {
      console.error('Error processing question text:', error);
      processedQuestion = questionText; // Fallback to raw text
    }



    const processedOptions = (q.options || []).map((opt: string) => {
      try {
        // Process option text with images first, then apply LaTeX conversion to readable text
        let processedOpt = processTextForPDF(opt);
        processedOpt = convertLatexToReadableText(processedOpt);

        // Clean up any broken img tags in options too
        processedOpt = processedOpt.replace(/<img(?![^>]*src=)[^>]*>/gi, '');

        return processedOpt;
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
  <footer>
    <span>Medicos</span>
    <span>${new Date().toLocaleDateString()}</span>
  </footer>
</body>
</html>`;

    console.log('Setting page content...');
    if (!page) throw new Error('Puppeteer page not initialized');

    await page.setContent(html, { waitUntil: 'networkidle2' });



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