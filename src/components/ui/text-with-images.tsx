import React from 'react';
import { extractImagesFromText } from '@/utils/imageUtils';
import { Base64Image } from './base64-image';
import { MathText } from './math-text';
import { EnhancedTextRenderer } from './enhanced-text-renderer';
import { cn } from '@/lib/utils';

interface TextWithImagesProps {
  text: string;
  className?: string;
  imageClassName?: string;
  maxImageWidth?: number;
  maxImageHeight?: number;
  questionImages?: Record<string, string>;
}

export function TextWithImages({
  text,
  className,
  imageClassName,
  maxImageWidth = 300,
  maxImageHeight = 200,
  questionImages
}: TextWithImagesProps) {
  const { cleanText, images } = extractImagesFromText(text, questionImages, { maxImages: 4 });

  return (
    <div className={cn("space-y-3", className)}>
      {/* Render the cleaned text with enhanced support for math and tables */}
      {cleanText && (
        <div className="text-base">
          <EnhancedTextRenderer text={cleanText} />
        </div>
      )}

      {/* Render extracted images */}
      {images.length > 0 && (
        <div className="space-y-2">
          {images.map((image) => (
            <div key={image.id} className="flex flex-col space-y-1">
              <Base64Image
                src={image.src}
                alt={image.alt}
                className={imageClassName}
                maxWidth={maxImageWidth}
                maxHeight={maxImageHeight}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
