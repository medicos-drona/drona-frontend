/**
 * Production-ready KaTeX Math Renderer for PDF Generation
 * 
 * This utility provides server-side KaTeX rendering for mathematical expressions
 * in PDF documents, with proper fallback mechanisms and error handling.
 */

import katex from 'katex';

export interface MathRenderOptions {
  displayMode?: boolean;
  throwOnError?: boolean;
  errorColor?: string;
  strict?: boolean | 'ignore' | 'warn' | 'error';
  trust?: boolean;
  macros?: Record<string, string>;
  colorIsTextColor?: boolean;
  maxSize?: number;
  maxExpand?: number;
}

export interface RenderedMath {
  html: string;
  success: boolean;
  error?: string;
  fallbackText?: string;
}

export class MathRenderer {
  private static readonly DEFAULT_OPTIONS: MathRenderOptions = {
    displayMode: false,
    throwOnError: false,
    errorColor: '#cc0000',
    strict: false,
    trust: false,
    macros: {},
    colorIsTextColor: true,
    maxSize: 500,
    maxExpand: 1000,
  };

  /**
   * Render LaTeX expression to HTML using KaTeX
   */
  public static renderToHTML(expression: string, options: MathRenderOptions = {}): RenderedMath {
    const mergedOptions = { ...this.DEFAULT_OPTIONS, ...options };
    
    try {
      console.log(`Rendering LaTeX expression: ${expression}`);
      
      // Clean the expression
      const cleanExpression = this.cleanExpression(expression);
      
      if (!cleanExpression.trim()) {
        return {
          html: '',
          success: false,
          error: 'Empty expression',
          fallbackText: ''
        };
      }

      // Render using KaTeX
      const html = katex.renderToString(cleanExpression, mergedOptions);
      
      console.log(`Successfully rendered: ${cleanExpression}`);
      return {
        html,
        success: true
      };
      
    } catch (error) {
      console.warn(`KaTeX rendering failed for "${expression}":`, error);
      
      // Generate fallback text
      const fallbackText = this.generateFallbackText(expression);
      
      return {
        html: `<span style="color: ${mergedOptions.errorColor};">${fallbackText}</span>`,
        success: false,
        error: error instanceof Error ? error.message : String(error),
        fallbackText
      };
    }
  }

  /**
   * Clean and prepare LaTeX expression for rendering
   */
  private static cleanExpression(expression: string): string {
    return expression
      .trim()
      // Remove outer $ delimiters if present
      .replace(/^\$+/, '')
      .replace(/\$+$/, '')
      // Normalize whitespace
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Generate fallback text when KaTeX rendering fails
   */
  private static generateFallbackText(expression: string): string {
    // Use comprehensive LaTeX to Unicode converter as fallback
    let fallbackText = expression
      // Remove delimiters
      .replace(/^\$+/, '')
      .replace(/\$+$/, '')
      
      // Arrows and implications
      .replace(/\\Rightarrow/g, '⇒')
      .replace(/\\Leftarrow/g, '⇐')
      .replace(/\\Leftrightarrow/g, '⇔')
      .replace(/\\rightarrow/g, '→')
      .replace(/\\leftarrow/g, '←')
      .replace(/\\leftrightarrow/g, '↔')
      
      // Comparison operators
      .replace(/\\geq/g, '≥')
      .replace(/\\leq/g, '≤')
      .replace(/\\neq/g, '≠')
      .replace(/\\approx/g, '≈')
      .replace(/\\equiv/g, '≡')
      .replace(/\\sim/g, '∼')
      
      // Binary operators
      .replace(/\\pm/g, '±')
      .replace(/\\mp/g, '∓')
      .replace(/\\times/g, '×')
      .replace(/\\div/g, '÷')
      .replace(/\\cdot/g, '⋅')
      
      // Greek letters (common ones)
      .replace(/\\alpha/g, 'α')
      .replace(/\\beta/g, 'β')
      .replace(/\\gamma/g, 'γ')
      .replace(/\\delta/g, 'δ')
      .replace(/\\epsilon/g, 'ε')
      .replace(/\\theta/g, 'θ')
      .replace(/\\lambda/g, 'λ')
      .replace(/\\mu/g, 'μ')
      .replace(/\\pi/g, 'π')
      .replace(/\\sigma/g, 'σ')
      .replace(/\\phi/g, 'φ')
      .replace(/\\omega/g, 'ω')
      
      // Large operators
      .replace(/\\sum/g, '∑')
      .replace(/\\prod/g, '∏')
      .replace(/\\int/g, '∫')
      
      // Set theory
      .replace(/\\in/g, '∈')
      .replace(/\\notin/g, '∉')
      .replace(/\\subset/g, '⊂')
      .replace(/\\supset/g, '⊃')
      .replace(/\\cup/g, '∪')
      .replace(/\\cap/g, '∩')
      .replace(/\\forall/g, '∀')
      .replace(/\\exists/g, '∃')
      .replace(/\\emptyset/g, '∅')
      
      // Special symbols
      .replace(/\\infty/g, '∞')
      .replace(/\\partial/g, '∂')
      .replace(/\\nabla/g, '∇')
      
      // Number sets
      .replace(/\\mathbb{N}/g, 'ℕ')
      .replace(/\\mathbb{Z}/g, 'ℤ')
      .replace(/\\mathbb{Q}/g, 'ℚ')
      .replace(/\\mathbb{R}/g, 'ℝ')
      .replace(/\\mathbb{C}/g, 'ℂ')
      
      // Functions and operations
      .replace(/\\sqrt{([^}]+)}/g, '√($1)')
      .replace(/\\frac{([^}]+)}{([^}]+)}/g, '($1)/($2)')
      
      // Delimiters
      .replace(/\\left\(/g, '(')
      .replace(/\\right\)/g, ')')
      .replace(/\\left\[/g, '[')
      .replace(/\\right\]/g, ']')
      .replace(/\\left\{/g, '{')
      .replace(/\\right\}/g, '}')
      .replace(/\\left\|/g, '|')
      .replace(/\\right\|/g, '|')
      .replace(/\\left/g, '')
      .replace(/\\right/g, '')
      
      // Dots
      .replace(/\\ldots/g, '...')
      .replace(/\\cdots/g, '⋯')
      
      // Superscripts and subscripts
      .replace(/\^{([^}]+)}/g, '^($1)')
      .replace(/_{([^}]+)}/g, '_($1)')
      .replace(/\^(\w)/g, '^$1')
      .replace(/_(\w)/g, '_$1')
      
      // Text formatting
      .replace(/\\mathrm{([^}]+)}/g, '$1')
      .replace(/\\mathbf{([^}]+)}/g, '$1')
      .replace(/\\text{([^}]+)}/g, '$1')
      
      // Clean up remaining LaTeX commands
      .replace(/\\[a-zA-Z]+\{([^}]*)\}/g, '$1')
      .replace(/\\[a-zA-Z]+/g, '')
      
      // Normalize spaces
      .replace(/\s+/g, ' ')
      .trim();

    return fallbackText || expression;
  }

  /**
   * Extract math expressions from text
   */
  public static extractMathExpressions(text: string): Array<{
    expression: string;
    startIndex: number;
    endIndex: number;
    isBlock: boolean;
  }> {
    const expressions: Array<{
      expression: string;
      startIndex: number;
      endIndex: number;
      isBlock: boolean;
    }> = [];

    // Match both inline ($...$) and block ($$...$$) math
    const regex = /(\$\$[\s\S]*?\$\$|\$[^$]*?\$)/g;
    let match;

    while ((match = regex.exec(text)) !== null) {
      const fullMatch = match[0];
      const isBlock = fullMatch.startsWith('$$') && fullMatch.endsWith('$$');
      
      let expression: string;
      if (isBlock) {
        expression = fullMatch.slice(2, -2).trim();
      } else {
        expression = fullMatch.slice(1, -1).trim();
      }

      expressions.push({
        expression,
        startIndex: match.index,
        endIndex: match.index + fullMatch.length,
        isBlock
      });
    }

    return expressions;
  }

  /**
   * Process text with math expressions and return rendered HTML
   */
  public static processTextWithMath(text: string, options: MathRenderOptions = {}): string {
    const expressions = this.extractMathExpressions(text);
    
    if (expressions.length === 0) {
      return text;
    }

    let result = '';
    let lastIndex = 0;

    for (const expr of expressions) {
      // Add text before the math expression
      result += text.substring(lastIndex, expr.startIndex);
      
      // Render the math expression
      const rendered = this.renderToHTML(expr.expression, {
        ...options,
        displayMode: expr.isBlock
      });
      
      if (rendered.success) {
        result += rendered.html;
      } else {
        // Use fallback text
        result += rendered.fallbackText || expr.expression;
      }
      
      lastIndex = expr.endIndex;
    }

    // Add remaining text
    result += text.substring(lastIndex);
    
    return result;
  }
}

export default MathRenderer;
