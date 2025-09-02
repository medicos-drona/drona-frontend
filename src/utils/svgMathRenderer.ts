/**
 * Lightweight SVG-based Math Renderer for PDF Generation
 * 
 * This utility provides a production-ready solution for rendering mathematical
 * expressions as SVG images that can be embedded in PDFs without heavy dependencies.
 */

import { MathRenderer } from './mathRenderer';

export interface SVGMathOptions {
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  backgroundColor?: string;
  padding?: number;
  maxWidth?: number;
}

export interface SVGMathResult {
  svg: string;
  dataUrl: string;
  width: number;
  height: number;
  success: boolean;
  error?: string;
}

export class SVGMathRenderer {
  private static readonly DEFAULT_OPTIONS: SVGMathOptions = {
    fontSize: 16,
    fontFamily: 'Times New Roman, serif',
    color: '#000000',
    backgroundColor: 'transparent',
    padding: 4,
    maxWidth: 400
  };

  /**
   * Render LaTeX expression as SVG
   */
  public static async renderMathToSVG(
    expression: string,
    isBlock: boolean = false,
    options: SVGMathOptions = {}
  ): Promise<SVGMathResult> {
    const mergedOptions = { ...this.DEFAULT_OPTIONS, ...options };
    
    try {
      console.log('Rendering math to SVG:', expression);
      
      // First try KaTeX rendering to get proper fallback text
      const katexResult = MathRenderer.renderToHTML(expression, {
        displayMode: isBlock,
        throwOnError: false,
        strict: false
      });
      
      // Use fallback text for SVG rendering
      const mathText = katexResult.fallbackText || expression;
      
      // Calculate dimensions more accurately
      const fontSize = isBlock ? mergedOptions.fontSize! * 1.3 : mergedOptions.fontSize!;
      const textLength = mathText.length;
      const charWidth = fontSize * 0.55; // More accurate character width
      const textWidth = Math.min(textLength * charWidth, mergedOptions.maxWidth!);
      const textHeight = fontSize * 1.1; // Tighter height to prevent overlapping
      
      const totalWidth = textWidth + (mergedOptions.padding! * 2);
      const totalHeight = textHeight + (mergedOptions.padding! * 2);
      
      // Create SVG
      const svg = this.createMathSVG(
        mathText,
        totalWidth,
        totalHeight,
        fontSize,
        mergedOptions
      );
      
      // Convert to data URL
      const dataUrl = `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
      
      console.log('Successfully rendered math to SVG');
      
      return {
        svg,
        dataUrl,
        width: totalWidth,
        height: totalHeight,
        success: true
      };
      
    } catch (error) {
      console.error('SVG math rendering failed:', error);
      
      // Create error placeholder
      const errorSvg = this.createErrorSVG(expression, mergedOptions);
      const errorDataUrl = `data:image/svg+xml;base64,${Buffer.from(errorSvg).toString('base64')}`;
      
      return {
        svg: errorSvg,
        dataUrl: errorDataUrl,
        width: 100,
        height: 30,
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Create SVG for mathematical expression
   */
  private static createMathSVG(
    mathText: string,
    width: number,
    height: number,
    fontSize: number,
    options: SVGMathOptions
  ): string {
    const centerX = width / 2;
    const baselineY = height * 0.75; // Better baseline positioning to prevent overlap

    return `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <style>
            .math-text {
              font-family: ${options.fontFamily};
              font-size: ${fontSize}px;
              fill: ${options.color};
              text-anchor: middle;
              dominant-baseline: alphabetic;
            }
          </style>
        </defs>
        ${options.backgroundColor !== 'transparent' ?
          `<rect width="100%" height="100%" fill="${options.backgroundColor}"/>` : ''
        }
        <text x="${centerX}" y="${baselineY}" class="math-text">${this.escapeXML(mathText)}</text>
      </svg>
    `.trim();
  }

  /**
   * Create error placeholder SVG
   */
  private static createErrorSVG(expression: string, options: SVGMathOptions): string {
    return `
      <svg width="100" height="30" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f8f8f8" stroke="#ddd" stroke-width="1"/>
        <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" 
              font-family="monospace" font-size="10" fill="#666">
          Math Error
        </text>
      </svg>
    `.trim();
  }

  /**
   * Escape XML special characters
   */
  private static escapeXML(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /**
   * Batch render multiple expressions
   */
  public static async renderMultipleMath(
    expressions: Array<{ expression: string; isBlock: boolean; id: string }>,
    options: SVGMathOptions = {}
  ): Promise<Map<string, SVGMathResult>> {
    const results = new Map<string, SVGMathResult>();
    
    for (const expr of expressions) {
      try {
        const result = await this.renderMathToSVG(expr.expression, expr.isBlock, options);
        results.set(expr.id, result);
      } catch (error) {
        console.error(`Failed to render math expression ${expr.id}:`, error);
        
        const errorResult: SVGMathResult = {
          svg: this.createErrorSVG(expr.expression, options),
          dataUrl: '',
          width: 100,
          height: 30,
          success: false,
          error: error instanceof Error ? error.message : String(error)
        };
        
        results.set(expr.id, errorResult);
      }
    }
    
    return results;
  }

  /**
   * Estimate SVG dimensions without full rendering
   */
  public static estimateDimensions(
    expression: string,
    isBlock: boolean = false,
    options: SVGMathOptions = {}
  ): { width: number; height: number } {
    const mergedOptions = { ...this.DEFAULT_OPTIONS, ...options };
    
    // Get fallback text for estimation
    const katexResult = MathRenderer.renderToHTML(expression, {
      displayMode: isBlock,
      throwOnError: false
    });
    
    const mathText = katexResult.fallbackText || expression;
    const fontSize = isBlock ? mergedOptions.fontSize! * 1.2 : mergedOptions.fontSize!;
    const charWidth = fontSize * 0.6;
    const textWidth = Math.min(mathText.length * charWidth, mergedOptions.maxWidth!);
    const textHeight = fontSize * 1.2;
    
    return {
      width: textWidth + (mergedOptions.padding! * 2),
      height: textHeight + (mergedOptions.padding! * 2)
    };
  }

  /**
   * Check if expression is complex (needs special handling)
   */
  public static isComplexExpression(expression: string): boolean {
    const complexPatterns = [
      /\\frac/,
      /\\sqrt/,
      /\\sum/,
      /\\int/,
      /\\prod/,
      /\\matrix/,
      /\\begin/,
      /\^{[^}]{2,}}/,
      /_{[^}]{2,}}/
    ];
    
    return complexPatterns.some(pattern => pattern.test(expression));
  }
}

export default SVGMathRenderer;
