'use client';

import React from 'react';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import { cn } from '@/lib/utils';

interface MathTextProps {
  text: string;
  className?: string;
}

/**
 * Component that renders text with LaTeX mathematical expressions
 * Supports both inline math ($...$) and block math ($$...$$)
 */
export function MathText({ text, className }: MathTextProps) {
  if (!text) return null;

  // Split text by math expressions while preserving the delimiters
  const parts = text.split(/(\$\$[\s\S]*?\$\$|\$[^$]*?\$)/);
  
  return (
    <div className={cn("math-text katex-isolated", className)}>
      {parts.map((part, index) => {
        // Block math ($$...$$)
        if (part.startsWith('$$') && part.endsWith('$$')) {
          const mathContent = part.slice(2, -2).trim();
          try {
            return (
              <div key={index} className="my-2 katex-isolated">
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
            return (
              <div key={index} className="my-2 p-2 bg-red-50 border border-red-200 rounded text-red-700">
                Error rendering math: {mathContent}
              </div>
            );
          }
        }

        // Inline math ($...$)
        if (part.startsWith('$') && part.endsWith('$') && part.length > 2) {
          const mathContent = part.slice(1, -1).trim();
          try {
            return (
              <InlineMath
                key={index}
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
            return (
              <span key={index} className="px-1 bg-red-50 border border-red-200 rounded text-red-700">
                Error: {mathContent}
              </span>
            );
          }
        }

        // Regular text
        return <span key={index}>{part}</span>;
      })}
    </div>
  );
}
