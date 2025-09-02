# Mathematical Formatting and Image Display Fixes

## Issues Fixed

### 1. Mathematical Expression Rendering
**Problem**: LaTeX expressions like `$X$` and `$\mathrm{C}_{2} \mathrm{H}_{5}-\mathrm{C}-\mathrm{C}\left(\mathrm{CH}_{3}\right)_{3}$` were not being rendered properly.

**Solution**: 
- Added KaTeX support with `katex` and `react-katex` packages
- Created `MathText` component for rendering LaTeX expressions
- Integrated with existing `TextWithImages` component

### 2. Image Display Issues
**Problem**: 
- Markdown-style images `![img-6.jpeg](data:image/jpeg;base64,...)` were not being parsed
- Duplicated data URL prefixes causing display failures

**Solution**:
- Enhanced `extractImagesFromText` function to handle markdown syntax
- Fixed `ensureDataUrl` function to handle duplicated prefixes
- Added support for multiple image formats

## Implementation Details

### Mathematical Rendering
```typescript
// New MathText component
export function MathText({ text, className }: MathTextProps) {
  const parts = text.split(/(\$\$[\s\S]*?\$\$|\$[^$]*?\$)/);
  
  return (
    <div className={cn("math-text", className)}>
      {parts.map((part, index) => {
        // Block math ($$...$$)
        if (part.startsWith('$$') && part.endsWith('$$')) {
          return <BlockMath key={index} math={mathContent} />;
        }
        // Inline math ($...$)
        if (part.startsWith('$') && part.endsWith('$')) {
          return <InlineMath key={index} math={mathContent} />;
        }
        // Regular text
        return <span key={index}>{part}</span>;
      })}
    </div>
  );
}
```

### Enhanced Image Processing
```typescript
// Updated extractImagesFromText function
export function extractImagesFromText(text: string) {
  // 1. Handle markdown-style images: ![alt](data:image/type;base64,...)
  const markdownImagePattern = /!\[([^\]]*)\]\(([^)]+)\)/g;
  
  // 2. Handle complete data URLs
  const dataUrlPattern = /data:image\/[^;]+;base64,[A-Za-z0-9+/]+=*/g;
  
  // 3. Handle raw base64 strings
  const rawBase64Pattern = /\b[A-Za-z0-9+/]{200,}={0,2}\b/g;
  
  // Process in order of priority
}

// Fixed ensureDataUrl function
export function ensureDataUrl(base64String: string): string {
  // Handle duplicated prefixes
  const duplicatedPrefixPattern = /^(data:image\/[^;]+;base64,)(data:image\/[^;]+;base64,)/;
  if (duplicatedPrefixPattern.test(base64String)) {
    base64String = base64String.replace(duplicatedPrefixPattern, '$2');
  }
  
  // Return properly formatted data URL
  return base64String.startsWith('data:image/') 
    ? base64String 
    : `data:image/png;base64,${base64String}`;
}
```

## Test Cases

### Mathematical Expressions
Test these expressions in question content:

1. **Inline Math**: `The derivative of $f(x) = x^2$ is $2x$.`
2. **Block Math**: `$$\int_{0}^{\infty} e^{-x} dx = 1$$`
3. **Complex Chemistry**: `$\mathrm{C}_{2} \mathrm{H}_{5}-\mathrm{C}-\mathrm{C}\left(\mathrm{CH}_{3}\right)_{3}$`
4. **Physics Formula**: `$E = mc^2$ where $c$ is the speed of light.`

### Image Formats
Test these image formats in question content:

1. **Markdown Style**: `![img-6.jpeg](data:image/jpeg;base64,/9j/4AAQSkZJRg...)`
2. **Duplicated Prefix**: `data:image/jpeg;base64,data:image/jpeg;base64,/9j/4AAQ...`
3. **Standard Data URL**: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...`
4. **Raw Base64**: `iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==`

## Dependencies Added
```json
{
  "katex": "^0.16.11",
  "react-katex": "^3.0.1"
}
```

## Files Modified
1. `package.json` - Added KaTeX dependencies
2. `utils/imageUtils.ts` - Enhanced image processing
3. `components/ui/math-text.tsx` - New math rendering component
4. `components/ui/text-with-images.tsx` - Integrated math support

## Usage
The enhanced components automatically handle both mathematical expressions and images:

```typescript
// In question display components
<TextWithImages
  text={question.content}
  maxImageWidth={400}
  maxImageHeight={300}
/>
```

This will now properly render:
- LaTeX mathematical expressions using KaTeX
- Images from markdown syntax, data URLs, and raw base64
- Mixed content with both math and images
- Proper error handling for invalid expressions/images

## Browser Support
- KaTeX works in all modern browsers
- Base64 image support is universal
- Graceful fallback for unsupported math expressions
