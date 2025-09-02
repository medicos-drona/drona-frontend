import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Base64Image } from './base64-image';
import { MathText } from './math-text';
import { EnhancedTextRenderer } from './enhanced-text-renderer';
import { ChevronDown, ChevronUp, Beaker } from 'lucide-react';
import { Button } from './button';

interface ChemicalImageDisplayProps {
  text: string;
  images?: Record<string, string>;
  className?: string;
  imageClassName?: string;
  maxImageWidth?: number;
  maxImageHeight?: number;
  showImageToggle?: boolean;
}

export function ChemicalImageDisplay({
  text,
  images = {},
  className,
  imageClassName,
  maxImageWidth = 400,
  maxImageHeight = 300,
  showImageToggle = true
}: ChemicalImageDisplayProps) {
  const [showImages, setShowImages] = useState(true);
  const [expandedImages, setExpandedImages] = useState<Set<string>>(new Set());

  // Process text to handle chemical image placeholders
  const processChemicalText = (inputText: string) => {
    if (!inputText) return { cleanText: '', imageRefs: [] };

    let cleanText = inputText;
    const imageRefs: string[] = [];

    // Find chemical image placeholders like [CHEMICAL_IMAGE_1_question]
    const chemicalImagePattern = /\[CHEMICAL_IMAGE_(\d+)_([^\]]+)\]/g;
    let match;

    while ((match = chemicalImagePattern.exec(inputText)) !== null) {
      const [fullMatch, questionNum, context] = match;
      const imageKey = `chemical_img_${questionNum}_${context}`;
      
      if (images[imageKey]) {
        imageRefs.push(imageKey);
        // Replace placeholder with a marker for rendering
        cleanText = cleanText.replace(fullMatch, `[IMAGE_PLACEHOLDER_${imageKey}]`);
      } else {
        // Remove placeholder if no image found
        cleanText = cleanText.replace(fullMatch, '');
      }
    }

    // Also handle markdown image references that weren't converted
    const markdownPattern = /!\[([^\]]*)\]\(([^)]+)\)/g;
    cleanText = cleanText.replace(markdownPattern, (match, alt, src) => {
      // Try to find matching image
      const matchingKey = Object.keys(images).find(key => 
        key.includes(src) || src.includes(key.replace('chemical_img_', ''))
      );
      
      if (matchingKey) {
        imageRefs.push(matchingKey);
        return `[IMAGE_PLACEHOLDER_${matchingKey}]`;
      }
      
      return `[Missing Image: ${src}]`;
    });

    return { cleanText, imageRefs: [...new Set(imageRefs)] };
  };

  const { cleanText, imageRefs } = processChemicalText(text);
  const hasImages = imageRefs.length > 0;

  const toggleImageExpansion = (imageKey: string) => {
    setExpandedImages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(imageKey)) {
        newSet.delete(imageKey);
      } else {
        newSet.add(imageKey);
      }
      return newSet;
    });
  };

  const renderTextWithImagePlaceholders = (text: string) => {
    if (!text) return null;

    const parts = text.split(/(\[IMAGE_PLACEHOLDER_[^\]]+\])/);
    
    return parts.map((part, index) => {
      const placeholderMatch = part.match(/\[IMAGE_PLACEHOLDER_([^\]]+)\]/);
      
      if (placeholderMatch) {
        const imageKey = placeholderMatch[1];
        const imageData = images[imageKey];
        
        if (imageData && showImages) {
          const isExpanded = expandedImages.has(imageKey);
          
          return (
            <div key={index} className="my-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-sm font-medium text-blue-700">
                  <Beaker className="h-4 w-4" />
                  Chemical Structure
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleImageExpansion(imageKey)}
                  className="h-6 px-2 text-blue-600 hover:text-blue-700"
                >
                  {isExpanded ? (
                    <>
                      <ChevronUp className="h-3 w-3 mr-1" />
                      Collapse
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-3 w-3 mr-1" />
                      Expand
                    </>
                  )}
                </Button>
              </div>
              
              <Base64Image
                src={imageData}
                alt={`Chemical structure ${imageKey}`}
                className={cn(
                  "border border-blue-300 rounded-md transition-all duration-200",
                  imageClassName,
                  isExpanded ? "cursor-zoom-out" : "cursor-zoom-in"
                )}
                maxWidth={isExpanded ? maxImageWidth * 1.5 : maxImageWidth}
                maxHeight={isExpanded ? maxImageHeight * 1.5 : maxImageHeight}
                onClick={() => toggleImageExpansion(imageKey)}
              />
            </div>
          );
        }
        
        return (
          <div key={index} className="my-2 p-2 bg-gray-100 border border-gray-200 rounded text-sm text-gray-600">
            [Chemical Structure - {imageKey}]
          </div>
        );
      }
      
      return part ? (
        <span key={index}>
          <EnhancedTextRenderer text={part} />
        </span>
      ) : null;
    });
  };

  return (
    <div className={cn("space-y-3", className)}>
      {/* Image toggle button */}
      {hasImages && showImageToggle && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Beaker className="h-4 w-4" />
            {imageRefs.length} Chemical Structure{imageRefs.length !== 1 ? 's' : ''}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowImages(!showImages)}
            className="h-7 px-3 text-xs"
          >
            {showImages ? 'Hide Images' : 'Show Images'}
          </Button>
        </div>
      )}

      {/* Render text with embedded images */}
      <div className="text-base leading-relaxed">
        {renderTextWithImagePlaceholders(cleanText)}
      </div>

      {/* Standalone images (not embedded in text) */}
      {showImages && imageRefs.length > 0 && (
        <div className="space-y-3">
          {imageRefs.map((imageKey) => {
            // Skip if this image was already rendered inline
            if (cleanText.includes(`[IMAGE_PLACEHOLDER_${imageKey}]`)) {
              return null;
            }
            
            const imageData = images[imageKey];
            if (!imageData) return null;
            
            const isExpanded = expandedImages.has(imageKey);
            
            return (
              <div key={imageKey} className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-green-700">
                    <Beaker className="h-4 w-4" />
                    Chemical Structure - {imageKey.replace('chemical_img_', '').replace(/_/g, ' ')}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleImageExpansion(imageKey)}
                    className="h-6 px-2 text-green-600 hover:text-green-700"
                  >
                    {isExpanded ? (
                      <>
                        <ChevronUp className="h-3 w-3 mr-1" />
                        Collapse
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-3 w-3 mr-1" />
                        Expand
                      </>
                    )}
                  </Button>
                </div>
                
                <Base64Image
                  src={imageData}
                  alt={`Chemical structure ${imageKey}`}
                  className={cn(
                    "border border-green-300 rounded-md transition-all duration-200",
                    imageClassName,
                    isExpanded ? "cursor-zoom-out" : "cursor-zoom-in"
                  )}
                  maxWidth={isExpanded ? maxImageWidth * 1.5 : maxImageWidth}
                  maxHeight={isExpanded ? maxImageHeight * 1.5 : maxImageHeight}
                  onClick={() => toggleImageExpansion(imageKey)}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Helper component for chemical question options
interface ChemicalOptionDisplayProps {
  option: {
    text?: string;
    imageUrl?: string;
    label: string;
    isImageOption?: boolean;
  };
  images?: Record<string, string>;
  isCorrect?: boolean;
  className?: string;
}

export function ChemicalOptionDisplay({
  option,
  images = {},
  isCorrect = false,
  className
}: ChemicalOptionDisplayProps) {
  // If option has imageUrl as string, it might be a key to the images object
  const imageData = option.imageUrl && typeof option.imageUrl === 'string' 
    ? (images[option.imageUrl] || option.imageUrl)
    : option.imageUrl;

  return (
    <div
      className={cn(
        "flex items-start p-3 rounded-md border transition-colors",
        isCorrect
          ? "border-green-500 bg-green-50"
          : "border-gray-200 hover:border-green-300",
        className
      )}
    >
      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center mr-3">
        <span className="text-sm font-medium">{option.label}</span>
      </div>
      
      <div className="flex-1">
        {/* Text content */}
        {option.text && !option.isImageOption && (
          <div className="mb-2">
            <ChemicalImageDisplay
              text={option.text}
              images={images}
              maxImageWidth={200}
              maxImageHeight={150}
              showImageToggle={false}
            />
          </div>
        )}
        
        {/* Image content */}
        {imageData && (
          <div className={option.isImageOption ? "" : "mt-2"}>
            <div className="p-2 bg-green-50 border border-green-200 rounded-md">
              <div className="flex items-center gap-2 mb-2 text-xs text-green-700">
                <Beaker className="h-3 w-3" />
                Chemical Structure Option
              </div>
              <Base64Image
                src={imageData}
                alt={`Option ${option.label} - Chemical Structure`}
                maxWidth={200}
                maxHeight={150}
                className="border border-green-300 rounded"
              />
            </div>
          </div>
        )}
        
        {/* Fallback for image options without data */}
        {option.isImageOption && !imageData && (
          <div className="text-gray-500 italic text-sm">
            Chemical structure option (image not available)
          </div>
        )}
      </div>
    </div>
  );
}
