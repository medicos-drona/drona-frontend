/**
 * HTML to Image Converter for PDF Math Rendering
 * 
 * This utility converts rendered KaTeX HTML to images that can be embedded in PDFs.
 * Uses a clean, isolated rendering environment to avoid CSS conflicts.
 */

import { JSDOM } from 'jsdom';
import puppeteer from 'puppeteer';

export interface ImageConversionOptions {
  width?: number;
  height?: number;
  scale?: number;
  backgroundColor?: string;
  fontSize?: number;
  fontFamily?: string;
  padding?: number;
}

export interface ConvertedImage {
  dataUrl: string;
  width: number;
  height: number;
  success: boolean;
  error?: string;
}

export class HTMLToImageConverter {
  private static readonly DEFAULT_OPTIONS: ImageConversionOptions = {
    width: 800,
    height: 200,
    scale: 2,
    backgroundColor: 'transparent',
    fontSize: 16,
    fontFamily: 'KaTeX_Main, Times New Roman, serif',
    padding: 10,
  };

  /**
   * Convert KaTeX HTML to image data URL using Puppeteer
   */
  public static async convertMathToImage(
    html: string,
    options: ImageConversionOptions = {}
  ): Promise<ConvertedImage> {
    const mergedOptions = { ...this.DEFAULT_OPTIONS, ...options };

    try {
      console.log('Converting math HTML to image:', html.substring(0, 100) + '...');

      // Launch Puppeteer browser
      const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });

      const page = await browser.newPage();

      // Set viewport
      await page.setViewport({
        width: mergedOptions.width || 800,
        height: mergedOptions.height || 200,
        deviceScaleFactor: mergedOptions.scale || 2
      });

      // Create HTML content with KaTeX styles
      const fullHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css">
          <style>
            ${this.getIsolationCSS(mergedOptions)}
          </style>
        </head>
        <body>
          <div id="math-container">${html}</div>
        </body>
        </html>
      `;

      // Set content and wait for fonts to load
      await page.setContent(fullHtml, { waitUntil: 'networkidle0' });

      // Get the math container element
      const container = await page.$('#math-container');
      if (!container) {
        throw new Error('Math container not found');
      }

      // Get bounding box
      const boundingBox = await container.boundingBox();
      if (!boundingBox) {
        throw new Error('Could not get bounding box');
      }

      // Take screenshot of the math content
      const screenshot = await container.screenshot({
        type: 'png',
        omitBackground: mergedOptions.backgroundColor === 'transparent'
      });

      // Close browser
      await browser.close();

      // Convert to data URL
      const dataUrl = `data:image/png;base64,${Buffer.from(screenshot).toString('base64')}`;

      console.log('Successfully converted math to image');

      return {
        dataUrl,
        width: Math.ceil(boundingBox.width),
        height: Math.ceil(boundingBox.height),
        success: true
      };

    } catch (error) {
      console.error('HTML to image conversion failed:', error);

      // Fallback to placeholder
      const { width, height } = this.estimateDimensions(html, mergedOptions);
      const dataUrl = this.createPlaceholderImage(html, width, height);

      return {
        dataUrl,
        width,
        height,
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Get KaTeX CSS styles
   */
  private static getKaTeXCSS(): string {
    // In a real implementation, you would load the actual KaTeX CSS
    // For now, return basic math styling
    return `
      .katex {
        font: normal 1.21em KaTeX_Main, Times New Roman, serif;
        line-height: 1.2;
        text-indent: 0;
        text-rendering: auto;
      }
      
      .katex * {
        -ms-high-contrast-adjust: none !important;
        border-color: currentColor;
      }
      
      .katex .katex-mathml {
        position: absolute;
        clip: rect(1px, 1px, 1px, 1px);
        padding: 0;
        border: 0;
        height: 1px;
        width: 1px;
        overflow: hidden;
      }
      
      .katex .katex-html {
        display: inline-block;
      }
      
      .katex .base {
        position: relative;
        white-space: nowrap;
        width: min-content;
      }
      
      .katex .strut {
        display: inline-block;
      }
      
      .katex .textbf {
        font-weight: bold;
      }
      
      .katex .textit {
        font-style: italic;
      }
      
      .katex .textrm {
        font-family: KaTeX_Main, Times New Roman, serif;
      }
      
      .katex .textsf {
        font-family: KaTeX_SansSerif, sans-serif;
      }
      
      .katex .texttt {
        font-family: KaTeX_Typewriter, monospace;
      }
    `;
  }

  /**
   * Get isolation CSS to prevent conflicts
   */
  private static getIsolationCSS(options: ImageConversionOptions): string {
    return `
      body {
        margin: 0;
        padding: ${options.padding}px;
        background-color: ${options.backgroundColor};
        font-family: ${options.fontFamily};
        font-size: ${options.fontSize}px;
        line-height: 1.2;
        color: #000000;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }
      
      #math-container {
        display: inline-block;
        vertical-align: baseline;
        max-width: 100%;
        overflow: visible;
      }
      
      /* Reset all potentially conflicting styles */
      * {
        box-sizing: content-box;
        margin: 0;
        padding: 0;
        border: none;
        outline: none;
        background: transparent;
        text-decoration: none;
        list-style: none;
      }
      
      /* Ensure proper text rendering */
      * {
        text-rendering: optimizeLegibility;
        -webkit-font-feature-settings: "kern" 1;
        font-feature-settings: "kern" 1;
      }
    `;
  }

  /**
   * Calculate optimal dimensions for the math content
   */
  private static calculateDimensions(
    container: Element,
    options: ImageConversionOptions
  ): { width: number; height: number } {
    // In a real implementation, you would measure the actual rendered content
    // For now, return reasonable defaults based on content length
    const textLength = container.textContent?.length || 0;
    
    const estimatedWidth = Math.max(100, Math.min(options.width || 800, textLength * 12));
    const estimatedHeight = Math.max(30, Math.min(options.height || 200, 60));
    
    return {
      width: estimatedWidth + (options.padding || 0) * 2,
      height: estimatedHeight + (options.padding || 0) * 2
    };
  }

  /**
   * Create a placeholder image (for development/fallback)
   */
  private static createPlaceholderImage(html: string, width: number, height: number): string {
    // Create a simple SVG placeholder
    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="white" stroke="#ddd" stroke-width="1"/>
        <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" 
              font-family="serif" font-size="14" fill="#333">
          Math Formula
        </text>
      </svg>
    `;
    
    return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
  }

  /**
   * Batch convert multiple math expressions
   */
  public static async convertMultipleMath(
    expressions: Array<{ html: string; id: string }>,
    options: ImageConversionOptions = {}
  ): Promise<Map<string, ConvertedImage>> {
    const results = new Map<string, ConvertedImage>();
    
    for (const expr of expressions) {
      try {
        const result = await this.convertMathToImage(expr.html, options);
        results.set(expr.id, result);
      } catch (error) {
        console.error(`Failed to convert math expression ${expr.id}:`, error);
        results.set(expr.id, {
          dataUrl: '',
          width: 0,
          height: 0,
          success: false,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }
    
    return results;
  }

  /**
   * Estimate image dimensions without full conversion
   */
  public static estimateDimensions(
    html: string,
    options: ImageConversionOptions = {}
  ): { width: number; height: number } {
    const mergedOptions = { ...this.DEFAULT_OPTIONS, ...options };
    
    // Simple estimation based on content
    const textLength = html.replace(/<[^>]*>/g, '').length;
    const hasComplexMath = /frac|sqrt|sum|int|matrix/i.test(html);
    
    let width = Math.max(50, textLength * 8);
    let height = hasComplexMath ? 40 : 25;
    
    // Add padding
    width += (mergedOptions.padding || 0) * 2;
    height += (mergedOptions.padding || 0) * 2;
    
    return { width, height };
  }
}

export default HTMLToImageConverter;
