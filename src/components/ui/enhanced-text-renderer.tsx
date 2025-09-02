'use client';

import React from 'react';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import { cn } from '@/lib/utils';

interface EnhancedTextRendererProps {
  text: string;
  className?: string;
}

interface TableData {
  headers: string[];
  rows: string[][];
  alignments: ('left' | 'center' | 'right')[];
}

/**
 * Enhanced text renderer that handles:
 * - LaTeX mathematical expressions
 * - Markdown tables
 * - HTML tables
 * - Regular text formatting
 */
export function EnhancedTextRenderer({ text, className }: EnhancedTextRendererProps) {
  if (!text) return null;

  // First, extract and render tables
  const processedContent = processTablesAndMath(text);

  return (
    <div className={cn("enhanced-text-renderer", className)}>
      {processedContent}
    </div>
  );
}

function processTablesAndMath(text: string): React.ReactNode[] {
  const elements: React.ReactNode[] = [];
  let currentIndex = 0;
  let elementKey = 0;

  // First, try to fix malformed tables
  const cleanedText = fixMalformedTables(text);

  // Find all tables (both markdown and HTML-like)
  const tableRegex = /(\|[^|\n]*\|[^|\n]*\|[\s\S]*?)(?=\n\n|\n(?!\|)|$)/g;
  const htmlTableRegex = /<table[\s\S]*?<\/table>/gi;
  
  let match;
  const tableMatches: { start: number; end: number; content: string; type: 'markdown' | 'html' }[] = [];

  // Find markdown tables
  while ((match = tableRegex.exec(cleanedText)) !== null) {
    tableMatches.push({
      start: match.index,
      end: match.index + match[0].length,
      content: match[0],
      type: 'markdown'
    });
  }

  // Find HTML tables
  while ((match = htmlTableRegex.exec(text)) !== null) {
    tableMatches.push({
      start: match.index,
      end: match.index + match[0].length,
      content: match[0],
      type: 'html'
    });
  }

  // Sort matches by position
  tableMatches.sort((a, b) => a.start - b.start);

  // Process text with tables
  for (const tableMatch of tableMatches) {
    // Add text before table
    if (currentIndex < tableMatch.start) {
      const beforeText = text.slice(currentIndex, tableMatch.start);
      const mathProcessed = processMathInText(beforeText, elementKey);
      elements.push(...mathProcessed.elements);
      elementKey = mathProcessed.nextKey;
    }

    // Add table
    if (tableMatch.type === 'markdown') {
      const tableElement = renderMarkdownTable(tableMatch.content, elementKey++);
      if (tableElement) {
        elements.push(tableElement);
      }
    } else {
      const tableElement = renderHtmlTable(tableMatch.content, elementKey++);
      if (tableElement) {
        elements.push(tableElement);
      }
    }

    currentIndex = tableMatch.end;
  }

  // Add remaining text
  if (currentIndex < text.length) {
    const remainingText = text.slice(currentIndex);
    const mathProcessed = processMathInText(remainingText, elementKey);
    elements.push(...mathProcessed.elements);
  }

  return elements;
}

function processMathInText(text: string, startKey: number): { elements: React.ReactNode[]; nextKey: number } {
  const elements: React.ReactNode[] = [];
  let key = startKey;

  // Split text by math expressions while preserving the delimiters
  const parts = text.split(/(\$\$[\s\S]*?\$\$|\$[^$]*?\$)/);
  
  for (const part of parts) {
    // Block math ($$...$$)
    if (part.startsWith('$$') && part.endsWith('$$')) {
      const mathContent = part.slice(2, -2).trim();
      try {
        elements.push(
          <div key={key++} className="my-2 katex-isolated">
            <BlockMath
              math={mathContent}
              errorColor="#dc2626"
              renderError={(error) => (
                <div className="p-2 bg-red-50 border border-red-200 rounded text-red-700">
                  Error rendering math: {error.message}
                </div>
              )}
            />
          </div>
        );
      } catch (error) {
        console.warn('Error rendering block math:', error);
        elements.push(
          <div key={key++} className="my-2 p-2 bg-red-50 border border-red-200 rounded text-red-700">
            Error rendering math: {mathContent}
          </div>
        );
      }
    }
    // Inline math ($...$)
    else if (part.startsWith('$') && part.endsWith('$') && part.length > 2) {
      const mathContent = part.slice(1, -1).trim();
      try {
        elements.push(
          <InlineMath
            key={key++}
            math={mathContent}
            errorColor="#dc2626"
            renderError={(error) => (
              <span className="px-1 bg-red-50 border border-red-200 rounded text-red-700">
                Error: {error.message}
              </span>
            )}
          />
        );
      } catch (error) {
        console.warn('Error rendering inline math:', error);
        elements.push(
          <span key={key++} className="px-1 bg-red-50 border border-red-200 rounded text-red-700">
            Error: {mathContent}
          </span>
        );
      }
    }
    // Regular text
    else if (part.trim()) {
      // Process line breaks and basic formatting
      const formattedText = part.split('\n').map((line, index, array) => (
        <React.Fragment key={`${key}-line-${index}`}>
          {line}
          {index < array.length - 1 && <br />}
        </React.Fragment>
      ));
      elements.push(<span key={key++}>{formattedText}</span>);
    }
  }

  return { elements, nextKey: key };
}

function fixMalformedTables(text: string): string {
  // Fix malformed table syntax like the example:
  // "| Age Group | Relative Proportion in <br> Population | | :-- | :-- | | 12−17 | 0.17 | |"

  // Pattern to detect malformed tables
  const malformedTablePattern = /(\|[^|\n]*\|[^|\n]*\|[\s\S]*?)(?=\n\n|\n(?!\|)|$)/g;

  return text.replace(malformedTablePattern, (match) => {
    try {
      // Clean up the match by removing extra spaces and fixing structure
      let cleaned = match.trim();

      // Replace <br> tags with spaces
      cleaned = cleaned.replace(/<br\s*\/?>/gi, ' ');

      // Split by | and clean up
      const parts = cleaned.split('|').map(part => part.trim()).filter(part => part);

      if (parts.length < 4) return match; // Not enough parts for a table

      // Try to reconstruct as a proper table
      const lines: string[] = [];
      let currentLine: string[] = [];

      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];

        // Check if this looks like a header separator (contains :-- or similar)
        if (part.match(/^:?-+:?$/)) {
          if (currentLine.length > 0) {
            lines.push('| ' + currentLine.join(' | ') + ' |');
            currentLine = [];
          }
          // Add separator line
          const separators = Array(Math.max(2, currentLine.length || 2)).fill(':--');
          lines.push('| ' + separators.join(' | ') + ' |');
          continue;
        }

        // Check if this looks like a new row (contains numbers or specific patterns)
        if (part.match(/^\d+/) && currentLine.length >= 2) {
          // Start new row
          if (currentLine.length > 0) {
            lines.push('| ' + currentLine.join(' | ') + ' |');
          }
          currentLine = [part];
        } else {
          currentLine.push(part);
        }
      }

      // Add final line
      if (currentLine.length > 0) {
        lines.push('| ' + currentLine.join(' | ') + ' |');
      }

      // If we have at least 3 lines (header, separator, data), return the table
      if (lines.length >= 3) {
        return '\n\n' + lines.join('\n') + '\n\n';
      }

      return match; // Return original if we can't fix it
    } catch (error) {
      console.warn('Error fixing malformed table:', error);
      return match;
    }
  });
}

function parseMarkdownTable(tableText: string): TableData | null {
  try {
    const lines = tableText.trim().split('\n').filter(line => line.trim());
    if (lines.length < 2) return null;

    // Parse header
    const headerLine = lines[0];
    const headers = headerLine.split('|').map(cell => cell.trim()).filter(cell => cell);

    // Parse alignment line
    const alignmentLine = lines[1];
    const alignments = alignmentLine.split('|').map(cell => {
      const trimmed = cell.trim();
      if (trimmed.startsWith(':') && trimmed.endsWith(':')) return 'center';
      if (trimmed.endsWith(':')) return 'right';
      return 'left';
    }).filter((_, index) => index < headers.length) as ('left' | 'center' | 'right')[];

    // Parse data rows
    const rows: string[][] = [];
    for (let i = 2; i < lines.length; i++) {
      const line = lines[i];
      const cells = line.split('|').map(cell => cell.trim()).filter(cell => cell);
      if (cells.length > 0) {
        // Pad cells to match header count
        while (cells.length < headers.length) {
          cells.push('');
        }
        rows.push(cells.slice(0, headers.length));
      }
    }

    return { headers, rows, alignments };
  } catch (error) {
    console.warn('Error parsing markdown table:', error);
    return null;
  }
}

function renderMarkdownTable(tableText: string, key: number): React.ReactNode | null {
  const tableData = parseMarkdownTable(tableText);
  if (!tableData) return null;

  const { headers, rows, alignments } = tableData;

  return (
    <div key={key} className="my-4 overflow-x-auto">
      <table className="min-w-full border-collapse border border-gray-300 bg-white shadow-sm rounded-lg">
        <thead className="bg-gray-50">
          <tr>
            {headers.map((header, index) => (
              <th
                key={index}
                className={cn(
                  "border border-gray-300 px-4 py-2 font-semibold text-gray-900",
                  alignments[index] === 'center' && "text-center",
                  alignments[index] === 'right' && "text-right",
                  alignments[index] === 'left' && "text-left"
                )}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className={rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50"}>
              {row.map((cell, cellIndex) => (
                <td
                  key={cellIndex}
                  className={cn(
                    "border border-gray-300 px-4 py-2 text-gray-700",
                    alignments[cellIndex] === 'center' && "text-center",
                    alignments[cellIndex] === 'right' && "text-right",
                    alignments[cellIndex] === 'left' && "text-left"
                  )}
                >
                  {/* Process math in cell content */}
                  <EnhancedTextRenderer text={cell} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function renderHtmlTable(tableHtml: string, key: number): React.ReactNode | null {
  // For HTML tables, we'll render them as-is but with better styling
  return (
    <div 
      key={key} 
      className="my-4 overflow-x-auto"
      dangerouslySetInnerHTML={{ 
        __html: tableHtml.replace(
          /<table/g, 
          '<table class="min-w-full border-collapse border border-gray-300 bg-white shadow-sm rounded-lg"'
        ).replace(
          /<th/g,
          '<th class="border border-gray-300 px-4 py-2 font-semibold text-gray-900 bg-gray-50"'
        ).replace(
          /<td/g,
          '<td class="border border-gray-300 px-4 py-2 text-gray-700"'
        )
      }}
    />
  );
}
