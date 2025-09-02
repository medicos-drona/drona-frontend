import jsPDF from 'jspdf';
import { extractImagesFromText, isBase64Image, ensureDataUrl } from '@/utils/imageUtils';
import { MathRenderer } from '@/utils/mathRenderer';
import { SVGMathRenderer } from '@/utils/svgMathRenderer';

interface QuestionPaper {
  _id: string;
  title: string;
  subjectId?: {
    name: string;
  };
  duration: number;
  totalMarks: number;
  instructions?: string;
  questions: Question[];
  withAnswers: boolean;
  withSolutions?: boolean;
  withHints?: boolean;
  isMultiSubject?: boolean;
  sections?: Section[];
}

interface Section {
  name: string;
  description?: string;
  order: number;
  sectionMarks: number;
  subjectId?: string;
  subjectName?: string;
  questions: Array<{
    question: Question;
    order: number;
  }>;
}

interface Question {
  _id: string;
  content: string;
  options?: string[];
  answer?: string;
  marks: number;
  difficulty: string;
  type: string;
  imageUrls?: string[];
  solution?: {
    steps: string[];
    methodology: string;
    key_concepts: string[];
    final_explanation: string;
  };
  hints?: string[];
}

interface CollegeInfo {
  name: string;
  logoUrl?: string;
  address?: string;
}

interface ProcessedText {
  cleanText: string;
  images: Array<{
    id: string;
    src: string;
    alt: string;
  }>;
}

export class PDFGenerator {
  private doc: jsPDF;
  private pageWidth: number;
  private pageHeight: number;
  private margin: number;
  private currentY: number;
  private contentWidth: number;

  // Two-column layout properties
  private columnWidth: number;
  private columnGap: number;
  private leftColumnX: number;
  private rightColumnX: number;
  private currentColumn: 'left' | 'right';
  private leftColumnY: number;
  private rightColumnY: number;
  private pageContentStartY: number;

  // NEET exam standard font sizes for professional appearance
  private readonly FONT_SIZES = {
    TITLE: 14,
    PART_HEADER: 12,
    SECTION_HEADER: 11,
    COLLEGE_NAME: 12,
    COLLEGE_ADDRESS: 9,
    EXAM_DETAILS: 10,
    QUESTION_NUMBER: 10,
    QUESTION_TEXT: 10,
    OPTION_TEXT: 9,
    ANSWER_TEXT: 10,
    SOLUTION_HEADER: 10,
    SOLUTION_TEXT: 9,
    HINT_TEXT: 9,
    MARKING_SCHEME: 9,
    INSTRUCTIONS: 8,
    WATERMARK: 60,
    LOGO: 8,
    FOOTER: 8
  };

  constructor() {
    this.doc = new jsPDF('p', 'mm', 'a4');
    this.pageWidth = this.doc.internal.pageSize.getWidth();
    this.pageHeight = this.doc.internal.pageSize.getHeight();
    this.margin = 20;
    this.currentY = this.margin;

    // Two-column layout setup with NEET exam standards
    this.columnGap = 8; // Smaller gap for more space
    this.columnWidth = (this.pageWidth - this.margin * 2 - this.columnGap) / 2;
    this.leftColumnX = this.margin;
    this.rightColumnX = this.margin + this.columnWidth + this.columnGap;
    this.currentColumn = 'left';
    this.leftColumnY = this.margin;
    this.rightColumnY = this.margin;
    this.pageContentStartY = this.margin;

    // Keep contentWidth for backward compatibility
    this.contentWidth = this.pageWidth - this.margin * 2;

    // Set default font to Times
    try {
      this.doc.setFont('times', 'normal');
    } catch (error) {
      console.warn('Times font not available, using default', error);
      this.doc.setFont('helvetica', 'normal');
    }
  }

  // Two-column layout management methods
  private getCurrentColumnX(): number {
    return this.currentColumn === 'left' ? this.leftColumnX : this.rightColumnX;
  }

  private getCurrentColumnY(): number {
    return this.currentColumn === 'left' ? this.leftColumnY : this.rightColumnY;
  }

  private updateCurrentColumnY(newY: number): void {
    if (this.currentColumn === 'left') {
      this.leftColumnY = newY;
    } else {
      this.rightColumnY = newY;
    }
  }

  private switchToNextColumn(): void {
    if (this.currentColumn === 'left') {
      this.currentColumn = 'right';
    } else {
      // Both columns filled, need new page
      this.currentColumn = 'left';
    }
  }

  private moveToNextAvailablePosition(): boolean {
    if (this.currentColumn === 'left') {
      // Try right column
      this.currentColumn = 'right';
      return false; // No new page needed
    } else {
      // Need new page
      return true;
    }
  }

  private resetColumnsForNewPage(): void {
    this.currentColumn = 'left';
    this.leftColumnY = this.pageContentStartY;
    this.rightColumnY = this.pageContentStartY;
  }

  private async checkColumnPageBreak(estimatedHeight: number, collegeInfo?: CollegeInfo, subjectName?: string): Promise<boolean> {
    const currentY = this.getCurrentColumnY();
    if (currentY + estimatedHeight > this.pageHeight - this.margin) {
      if (this.moveToNextAvailablePosition()) {
        await this.addNewPage(collegeInfo, subjectName);
        return true;
      }
      this.updateCurrentColumnY(this.pageContentStartY);
    }
    return false;
  }

  private addColumnSeparator(): void {
    const startX = this.margin + this.columnWidth + this.columnGap / 2;
    this.doc.setDrawColor(150, 150, 150); // Light grey color
    this.doc.line(startX, this.currentY, startX, this.pageHeight - this.margin);
  }

  private async addWatermark(collegeInfo: CollegeInfo): Promise<void> {
    // Use college logo if available, otherwise use default Medicos logo
    const logoUrl = collegeInfo.logoUrl || '/assets/logo/medicos-logo.svg';

    if (!logoUrl) {
        console.log('No logo URL available for watermark.');
        return;
    }
    try {
        console.log('Attempting to add watermark...');
        const imageUrl = logoUrl;
        console.log('Watermark image URL:', imageUrl);

        // Handle different image URL formats
        let imageDataUrl: string;

        if (imageUrl.startsWith('data:')) {
            // Already a data URL
            imageDataUrl = imageUrl;
        } else {
            // Fetch the image and convert to data URL
            const imageResponse = await fetch(imageUrl, {
                mode: 'cors',
                credentials: 'omit'
            });
            console.log('Fetched watermark image, status:', imageResponse.status);

            if (!imageResponse.ok) {
                throw new Error(`Failed to fetch watermark image from ${imageUrl} with status ${imageResponse.status}`);
            }

            const imageBlob = await imageResponse.blob();
            console.log('Watermark image blob created, type:', imageBlob.type);

            // Convert blob to data URL
            imageDataUrl = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(imageBlob);
            });
        }

        console.log('Watermark image data URL created.');

        const totalPages = (this.doc.internal as any).getNumberOfPages();
        console.log(`Adding watermark to ${totalPages} pages.`);

        // Determine image format from data URL
        const imageFormat = imageDataUrl.includes('data:image/png') ? 'PNG' :
                           imageDataUrl.includes('data:image/jpeg') || imageDataUrl.includes('data:image/jpg') ? 'JPEG' :
                           imageDataUrl.includes('data:image/svg') ? 'SVG' : 'PNG';

        for (let i = 1; i <= totalPages; i++) {
            this.doc.setPage(i);
            this.doc.saveGraphicsState();
            this.doc.setGState(new (this.doc as any).GState({ opacity: 0.1 }));

            // Center the watermark on the page
            const pageWidth = this.doc.internal.pageSize.getWidth();
            const pageHeight = this.doc.internal.pageSize.getHeight();
            const watermarkSize = 110;
            const x = (pageWidth - watermarkSize) / 2;
            const y = (pageHeight - watermarkSize) / 2;

            this.doc.addImage(imageDataUrl, imageFormat, x, y, watermarkSize, watermarkSize);
            this.doc.restoreGraphicsState();
        }
        console.log('Watermark added successfully.');
    } catch (error) {
        console.error('Failed to add watermark image: ', error);
        // Try to add a fallback text watermark
        try {
            const totalPages = (this.doc.internal as any).getNumberOfPages();
            for (let i = 1; i <= totalPages; i++) {
                this.doc.setPage(i);
                this.doc.saveGraphicsState();
                this.doc.setGState(new (this.doc as any).GState({ opacity: 0.1 }));
                this.doc.setFontSize(48);
                this.doc.setTextColor(200, 200, 200);
                const pageWidth = this.doc.internal.pageSize.getWidth();
                const pageHeight = this.doc.internal.pageSize.getHeight();
                this.doc.text('MEDICOS', pageWidth / 2, pageHeight / 2, {
                    align: 'center',
                    angle: 45
                });
                this.doc.restoreGraphicsState();
            }
            console.log('Fallback text watermark added.');
        } catch (fallbackError) {
            console.error('Failed to add fallback watermark:', fallbackError);
        }
    }
  }

  private async addHeader(collegeInfo: CollegeInfo | undefined, questionPaper: QuestionPaper): Promise<void> {
    const headerY = this.margin;
    const leftSectionX = this.margin;
    const rightSectionX = this.pageWidth - this.margin;
    const centerSectionX = this.pageWidth / 2;

    // Define thirds of the page for flexible sections
    const sectionWidth = (this.pageWidth - this.margin * 2) / 3;

    let leftHeight = 0;
    let centerHeight = 0;
    let rightHeight = 0;

    // Left Section: College Info & Logo
    if (collegeInfo) {
      let currentLeftX = leftSectionX;
      if (collegeInfo.logoUrl) {
        try {
          const dataUrl = await ensureDataUrl(collegeInfo.logoUrl);
          const img = new Image();
          img.src = dataUrl;
          await new Promise<void>((resolve, reject) => {
            img.onload = () => resolve();
            img.onerror = reject;
          });

          const logoHeight = 10;
          const logoWidth = (img.width * logoHeight) / img.height;
          if (logoWidth > 0 && logoHeight > 0) {
            this.doc.addImage(dataUrl, 'PNG', currentLeftX, headerY, logoWidth, logoHeight);
            currentLeftX += logoWidth + 2; // 2mm gap
            leftHeight = Math.max(leftHeight, logoHeight);
          }
        } catch (e) {
          console.error("Failed to load college logo", e);
        }
      }

      this.doc.setFont('helvetica', 'bold');
      this.doc.setFontSize(this.FONT_SIZES.COLLEGE_NAME);
      const collegeNameLines = this.doc.splitTextToSize(collegeInfo.name, sectionWidth - (currentLeftX - leftSectionX));
      this.doc.text(collegeNameLines, currentLeftX, headerY + 4); // Vertically align
      leftHeight = Math.max(leftHeight, collegeNameLines.length * 4);
    }

    // Center Section: Title
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(this.FONT_SIZES.TITLE);
    const titleLines = this.doc.splitTextToSize(questionPaper.title, sectionWidth + 10);
    this.doc.text(titleLines, centerSectionX, headerY + 4, { align: 'center' });
    centerHeight = titleLines.length * 5;

    // Right Section: Exam Details
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(this.FONT_SIZES.EXAM_DETAILS);
    const durationText = `Duration: ${questionPaper.duration} mins`;
    const marksText = `Total Marks: ${questionPaper.totalMarks}`;
    this.doc.text(durationText, rightSectionX, headerY + 2, { align: 'right' });
    this.doc.text(marksText, rightSectionX, headerY + 2 + 5, { align: 'right' });
    rightHeight = 12; // Approx height for two lines

    // Set currentY to be below the tallest section
    this.currentY = headerY + Math.max(leftHeight, centerHeight, rightHeight) + 3;

    // Add a professional line separator
    this.doc.setDrawColor(0);
    this.doc.setLineWidth(0.5);
    this.doc.line(this.margin, this.currentY, this.pageWidth - this.margin, this.currentY);
    this.currentY += 5;
    this.doc.setLineWidth(0.2); // Reset line width
    this.pageContentStartY = this.currentY;
  }

  private checkPageBreak(requiredHeight: number): boolean {
    if (this.currentY + requiredHeight > this.pageHeight - this.margin) {
      this.addNewPage();
      return true;
    }
    return false;
  }

  private async addNewPage(collegeInfo?: CollegeInfo, subjectName?: string): Promise<void> {
    this.addInstitutionFooter(); // Add footer to the completed page
    this.doc.addPage();
    this.resetColumnsForNewPage();
    this.currentY = this.margin;

    // Main header is not repeated on subsequent pages.
    // A running header could be added here if needed.
    if (subjectName) {
      this.addSubjectHeader(subjectName);
    }

    this.addColumnSeparator(); // Add separator on new page
  }

  private addSubjectHeader(subjectName: string): void {
    this.doc.setFontSize(this.FONT_SIZES.PART_HEADER);
    this.doc.setFont('helvetica', 'bold');

    // Add subject label on the left side
    const subjectText = `Subject: ${subjectName}`;
    this.doc.text(subjectText, this.margin, this.currentY);
    this.currentY += 12; // More spacing after subject header
  }

  private addPartHeader(partLetter: string, subjectName: string): void {
    this.doc.setFontSize(this.FONT_SIZES.PART_HEADER);
    this.doc.setFont('helvetica', 'bold');
    const headerText = `PART - ${partLetter} (${subjectName.toUpperCase()})`;
    this.doc.text(headerText, this.margin, this.currentY);
    this.currentY += 8;
    this.doc.setDrawColor(0);
    this.doc.line(this.margin, this.currentY, this.pageWidth - this.margin, this.currentY);
    this.currentY += 5;
  }

  private addSectionHeader(sectionName: string, questionCount: number): void {
    this.doc.setFontSize(this.FONT_SIZES.SECTION_HEADER);
    this.doc.setFont('helvetica', 'bold');
    const headerText = `${sectionName} (Questions ${questionCount})`;
    this.doc.text(headerText, this.margin, this.currentY);
    this.currentY += 6;
  }

  private addMarkingScheme(): void {
    this.doc.setFontSize(this.FONT_SIZES.MARKING_SCHEME);
    this.doc.setFont('helvetica', 'italic');
    const schemeText = 'Marking Scheme: +4 for correct, -1 for incorrect, 0 for unattempted.';
    this.doc.text(schemeText, this.pageWidth - this.margin, this.currentY, { align: 'right' });
    this.currentY += 8;
  }

  /**
   * Render LaTeX math expression as SVG image for PDF embedding
   */
  private async renderMathAsImage(
    expression: string,
    isBlock: boolean = false,
    currentX: number,
    currentY: number,
    maxWidth: number
  ): Promise<{ success: boolean; width: number; height: number; newX: number; newY: number }> {
    console.log('Rendering math expression as SVG image:', expression);

    try {
      // Use SVG renderer for lightweight, production-ready math rendering
      const svgResult = await SVGMathRenderer.renderMathToSVG(expression, isBlock, {
        fontSize: isBlock ? 18 : 16,
        backgroundColor: 'transparent',
        padding: 2,
        maxWidth: maxWidth
      });

      if (svgResult.success && svgResult.dataUrl) {
        // Calculate scaling to fit within maxWidth
        let imageWidth = svgResult.width;
        let imageHeight = svgResult.height;

        if (imageWidth > maxWidth) {
          const scale = maxWidth / imageWidth;
          imageWidth = maxWidth;
          imageHeight = imageHeight * scale;
        }

        // Calculate proper Y position for image (align with text baseline)
        const imageY = currentY - (imageHeight * 0.7); // Better baseline alignment

        // Add SVG image to PDF
        this.doc.addImage(
          svgResult.dataUrl,
          'SVG',
          currentX,
          imageY,
          imageWidth,
          imageHeight
        );

        console.log('Successfully added math SVG to PDF');
        return {
          success: true,
          width: imageWidth,
          height: imageHeight,
          newX: currentX + imageWidth + 2, // Add small spacing after math
          newY: currentY // Keep same Y for inline math
        };
      }

      // Fallback to text rendering
      console.log('SVG rendering failed, falling back to text');
      return this.renderMathAsText(expression, isBlock, currentX, currentY, maxWidth);

    } catch (error) {
      console.error('Math SVG rendering error:', error);
      // Fallback to text rendering
      return this.renderMathAsText(expression, isBlock, currentX, currentY, maxWidth);
    }
  }

  /**
   * Fallback method to render math as Unicode text
   */
  private async renderMathAsText(
    expression: string,
    isBlock: boolean,
    currentX: number,
    currentY: number,
    maxWidth: number
  ): Promise<{ success: boolean; width: number; height: number; newX: number; newY: number }> {
    const mathText = this.convertMathToUnicode(expression);
    const textWidth = this.doc.getTextWidth(mathText);

    // Check if text fits
    if (textWidth <= maxWidth) {
      this.doc.text(mathText, currentX, currentY);
      return {
        success: true,
        width: textWidth,
        height: 16, // Approximate text height
        newX: currentX + textWidth,
        newY: currentY
      };
    } else {
      // Text too wide, might need wrapping or scaling
      const scale = maxWidth / textWidth;
      this.doc.setFontSize(this.doc.getFontSize() * scale);
      this.doc.text(mathText, currentX, currentY);
      this.doc.setFontSize(this.doc.getFontSize() / scale); // Reset font size

      return {
        success: true,
        width: maxWidth,
        height: 16 * scale,
        newX: currentX + maxWidth,
        newY: currentY
      };
    }
  }

  /**
   * Legacy Unicode converter as fallback
   */
  private convertMathToUnicode(text: string): string {
    console.log('Using Unicode fallback for:', text);

    let displayText = text
        // Arrows and implications
        .replace(/\\Rightarrow/g, '⇒')
        .replace(/\\Leftarrow/g, '⇐')
        .replace(/\\Leftrightarrow/g, '⇔')
        .replace(/\\rightarrow/g, '→')
        .replace(/\\leftarrow/g, '←')
        .replace(/\\leftrightarrow/g, '↔')
        .replace(/\\uparrow/g, '↑')
        .replace(/\\downarrow/g, '↓')
        .replace(/\\updownarrow/g, '↕')
        .replace(/\\Uparrow/g, '⇑')
        .replace(/\\Downarrow/g, '⇓')
        .replace(/\\Updownarrow/g, '⇕')

        // Comparison operators
        .replace(/\\geq/g, '≥')
        .replace(/\\leq/g, '≤')
        .replace(/\\neq/g, '≠')
        .replace(/\\approx/g, '≈')
        .replace(/\\equiv/g, '≡')
        .replace(/\\sim/g, '∼')
        .replace(/\\simeq/g, '≃')
        .replace(/\\cong/g, '≅')
        .replace(/\\propto/g, '∝')

        // Binary operators
        .replace(/\\pm/g, '±')
        .replace(/\\mp/g, '∓')
        .replace(/\\times/g, '×')
        .replace(/\\div/g, '÷')
        .replace(/\\cdot/g, '⋅')
        .replace(/\\ast/g, '∗')
        .replace(/\\star/g, '⋆')
        .replace(/\\circ/g, '∘')
        .replace(/\\bullet/g, '•')
        .replace(/\\oplus/g, '⊕')
        .replace(/\\ominus/g, '⊖')
        .replace(/\\otimes/g, '⊗')
        .replace(/\\oslash/g, '⊘')

        // Greek letters (lowercase)
        .replace(/\\alpha/g, 'α')
        .replace(/\\beta/g, 'β')
        .replace(/\\gamma/g, 'γ')
        .replace(/\\delta/g, 'δ')
        .replace(/\\epsilon/g, 'ε')
        .replace(/\\varepsilon/g, 'ε')
        .replace(/\\zeta/g, 'ζ')
        .replace(/\\eta/g, 'η')
        .replace(/\\theta/g, 'θ')
        .replace(/\\vartheta/g, 'ϑ')
        .replace(/\\iota/g, 'ι')
        .replace(/\\kappa/g, 'κ')
        .replace(/\\lambda/g, 'λ')
        .replace(/\\mu/g, 'μ')
        .replace(/\\nu/g, 'ν')
        .replace(/\\xi/g, 'ξ')
        .replace(/\\pi/g, 'π')
        .replace(/\\varpi/g, 'ϖ')
        .replace(/\\rho/g, 'ρ')
        .replace(/\\varrho/g, 'ϱ')
        .replace(/\\sigma/g, 'σ')
        .replace(/\\varsigma/g, 'ς')
        .replace(/\\tau/g, 'τ')
        .replace(/\\upsilon/g, 'υ')
        .replace(/\\phi/g, 'φ')
        .replace(/\\varphi/g, 'φ')
        .replace(/\\chi/g, 'χ')
        .replace(/\\psi/g, 'ψ')
        .replace(/\\omega/g, 'ω')

        // Greek letters (uppercase)
        .replace(/\\Gamma/g, 'Γ')
        .replace(/\\Delta/g, 'Δ')
        .replace(/\\Theta/g, 'Θ')
        .replace(/\\Lambda/g, 'Λ')
        .replace(/\\Xi/g, 'Ξ')
        .replace(/\\Pi/g, 'Π')
        .replace(/\\Sigma/g, 'Σ')
        .replace(/\\Upsilon/g, 'Υ')
        .replace(/\\Phi/g, 'Φ')
        .replace(/\\Psi/g, 'Ψ')
        .replace(/\\Omega/g, 'Ω')

        // Large operators
        .replace(/\\sum/g, '∑')
        .replace(/\\prod/g, '∏')
        .replace(/\\coprod/g, '∐')
        .replace(/\\int/g, '∫')
        .replace(/\\iint/g, '∬')
        .replace(/\\iiint/g, '∭')
        .replace(/\\oint/g, '∮')
        .replace(/\\bigcup/g, '⋃')
        .replace(/\\bigcap/g, '⋂')
        .replace(/\\bigoplus/g, '⨁')
        .replace(/\\bigotimes/g, '⨂')

        // Set theory and logic
        .replace(/\\in/g, '∈')
        .replace(/\\notin/g, '∉')
        .replace(/\\ni/g, '∋')
        .replace(/\\subset/g, '⊂')
        .replace(/\\supset/g, '⊃')
        .replace(/\\subseteq/g, '⊆')
        .replace(/\\supseteq/g, '⊇')
        .replace(/\\cup/g, '∪')
        .replace(/\\cap/g, '∩')
        .replace(/\\setminus/g, '∖')
        .replace(/\\forall/g, '∀')
        .replace(/\\exists/g, '∃')
        .replace(/\\nexists/g, '∄')
        .replace(/\\emptyset/g, '∅')
        .replace(/\\varnothing/g, '∅')

        // Special symbols
        .replace(/\\infty/g, '∞')
        .replace(/\\partial/g, '∂')
        .replace(/\\nabla/g, '∇')
        .replace(/\\angle/g, '∠')
        .replace(/\\triangle/g, '△')
        .replace(/\\square/g, '□')
        .replace(/\\diamond/g, '◊')
        .replace(/\\clubsuit/g, '♣')
        .replace(/\\diamondsuit/g, '♦')
        .replace(/\\heartsuit/g, '♥')
        .replace(/\\spadesuit/g, '♠')

        // Number sets
        .replace(/\\mathbb{N}/g, 'ℕ')
        .replace(/\\mathbb{Z}/g, 'ℤ')
        .replace(/\\mathbb{Q}/g, 'ℚ')
        .replace(/\\mathbb{R}/g, 'ℝ')
        .replace(/\\mathbb{C}/g, 'ℂ')
        .replace(/\\mathbb{P}/g, 'ℙ')

        // Functions and operations
        .replace(/\\sqrt{([^}]+)}/g, '√($1)')
        .replace(/\\frac{([^}]+)}{([^}]+)}/g, '($1)/($2)')
        .replace(/\\binom{([^}]+)}{([^}]+)}/g, 'C($1,$2)')
        .replace(/\\choose/g, 'C')

        // Delimiters - remove \left and \right commands
        .replace(/\\left\(/g, '(')
        .replace(/\\right\)/g, ')')
        .replace(/\\left\[/g, '[')
        .replace(/\\right\]/g, ']')
        .replace(/\\left\{/g, '{')
        .replace(/\\right\}/g, '}')
        .replace(/\\left\|/g, '|')
        .replace(/\\right\|/g, '|')
        .replace(/\\left</g, '⟨')
        .replace(/\\right>/g, '⟩')
        .replace(/\\left/g, '') // Remove any remaining \left
        .replace(/\\right/g, '') // Remove any remaining \right

        // Dots and ellipsis
        .replace(/\\ldots/g, '...')
        .replace(/\\cdots/g, '⋯')
        .replace(/\\vdots/g, '⋮')
        .replace(/\\ddots/g, '⋱')

        // Superscripts and subscripts
        .replace(/\^{([^}]+)}/g, '^($1)')
        .replace(/_{([^}]+)}/g, '_($1)')
        .replace(/\^(\w)/g, '^$1')
        .replace(/_(\w)/g, '_$1')

        // Text formatting
        .replace(/\\mathrm{([^}]+)}/g, '$1')
        .replace(/\\mathbf{([^}]+)}/g, '$1')
        .replace(/\\mathit{([^}]+)}/g, '$1')
        .replace(/\\mathcal{([^}]+)}/g, '$1')
        .replace(/\\text{([^}]+)}/g, '$1')
        .replace(/\\textbf{([^}]+)}/g, '$1')
        .replace(/\\textit{([^}]+)}/g, '$1')

        // Clean up any remaining LaTeX commands that might cause issues
        .replace(/\\[a-zA-Z]+\{([^}]*)\}/g, '$1') // Remove unknown commands with braces
        .replace(/\\[a-zA-Z]+/g, '') // Remove unknown commands without braces

        // Fix spacing issues - normalize multiple spaces
        .replace(/\s+/g, ' ')
        .trim()

        // Remove delimiters
        .replace(/\$([^$]+)\$/g, '$1') // Remove $ delimiters
        .replace(/\$\$([^$]+)\$\$/g, '$1'); // Remove $$ delimiters

    console.log('Converted to:', displayText);
    return displayText;
  }

  private addInstitutionFooter(): void {
    const footerY = this.pageHeight - 10;
    this.doc.setFontSize(this.FONT_SIZES.FOOTER);
    this.doc.setFont('helvetica', 'italic');
    this.doc.text(
      `Generated by Medicos - ${new Date().toLocaleDateString()}`,
      this.pageWidth / 2,
      footerY,
      { align: 'center' }
    );
  }

  private detectQuestionType(question: Question): string {
    // Basic detection logic, can be expanded
    if (question.content.toLowerCase().includes('assertion') && question.content.toLowerCase().includes('reason')) {
      return 'assertion-reason';
    }
    if (question.content.toLowerCase().includes('column i') && question.content.toLowerCase().includes('column ii')) {
      return 'match-columns';
    }
    return 'standard';
  }

  private formatAssertionReasonQuestion(content: string): string {
    return content; // Placeholder
  }

  private formatMatchColumnsQuestion(content: string): string {
    return content; // Placeholder
  }

  private processTextWithImages(text: string): ProcessedText {
    const { cleanText, images } = extractImagesFromText(text);
    return { cleanText, images };
  }

  private async addImageToPDF(src: string, x: number, y: number, maxWidth: number): Promise<number> {
    if (!isBase64Image(src)) {
      console.error('Image source is not a base64 string.');
      return 0;
    }
    const dataUrl = ensureDataUrl(src);
    const img = new Image();
    img.src = dataUrl;
    await new Promise(resolve => img.onload = resolve);

    const aspectRatio = img.width / img.height;
    const width = Math.min(maxWidth, img.width);
    const height = width / aspectRatio;

    this.doc.addImage(dataUrl, 'JPEG', x, y, width, height);
    return height;
  }

  private standardizeOptions(options: string[]): string[] {
    return options.map(opt => opt.replace(/\n/g, ''));
  }

  private async addRichContent(
    text: string,
    x: number,
    maxWidth: number,
    collegeInfo?: CollegeInfo,
    subjectName?: string
  ): Promise<void> {
    // Simple approach: render text with inline math handling
    const regex = /(\$\$[^$]+\$\$|\$[^$]+?\$)/g;
    let lastIndex = 0;
    let match;

    let currentX = this.getCurrentColumnX();
    let currentY = this.getCurrentColumnY();
    const startX = this.getCurrentColumnX();
    const lineHeight = 6; // Slightly more space to prevent overlapping

    const advanceLine = async () => {
        this.updateCurrentColumnY(this.getCurrentColumnY() + lineHeight);
        await this.checkColumnPageBreak(lineHeight, collegeInfo, subjectName);
        currentY = this.getCurrentColumnY();
        currentX = this.getCurrentColumnX();
    };

    // Process text with math formulas
    while ((match = regex.exec(text)) !== null) {
        // 1. Render text before the formula
        const beforeText = text.substring(lastIndex, match.index).trim();
        if (beforeText) {
            await this.renderSimpleText(beforeText, currentX, currentY, maxWidth, startX, advanceLine);
            currentX = this.getCurrentColumnX();
            currentY = this.getCurrentColumnY();
        }

        // 2. Render the math formula
        const formulaText = match[0];
        const isBlock = formulaText.startsWith('$$');
        const formula = isBlock ? formulaText.slice(2, -2).trim() : formulaText.slice(1, -1).trim();

        if (formula) {
            await this.renderSimpleMath(formula, isBlock, currentX, currentY, maxWidth, startX, advanceLine);
            currentX = this.getCurrentColumnX();
            currentY = this.getCurrentColumnY();
        }

        lastIndex = regex.lastIndex;
    }

    // 3. Render remaining text
    const remainingText = text.substring(lastIndex).trim();
    if (remainingText) {
        await this.renderSimpleText(remainingText, currentX, currentY, maxWidth, startX, advanceLine);
    }

    // Move to next line
    this.updateCurrentColumnY(this.getCurrentColumnY() + lineHeight);
  }

  /**
   * Render simple text with word wrapping
   */
  private async renderSimpleText(
    text: string,
    currentX: number,
    currentY: number,
    maxWidth: number,
    startX: number,
    advanceLine: () => Promise<void>
  ): Promise<void> {
    const words = text.split(' ').filter(word => word.length > 0);
    let x = currentX;

    for (const word of words) {
      const wordWidth = this.doc.getTextWidth(word);
      const spaceWidth = this.doc.getTextWidth(' ');
      const needsSpace = x > startX;
      const totalWidth = wordWidth + (needsSpace ? spaceWidth : 0);

      // Check if word fits on current line
      if (x + totalWidth > startX + maxWidth - 5) {
        await advanceLine();
        x = this.getCurrentColumnX();
        currentY = this.getCurrentColumnY();
      } else if (needsSpace) {
        this.doc.text(' ', x, currentY);
        x += spaceWidth;
      }

      this.doc.text(word, x, currentY);
      x += wordWidth;
    }

    // Update position
    this.updateCurrentColumnX(x);
  }

  /**
   * Render simple math with fallback
   */
  private async renderSimpleMath(
    formula: string,
    isBlock: boolean,
    currentX: number,
    currentY: number,
    maxWidth: number,
    startX: number,
    advanceLine: () => Promise<void>
  ): Promise<void> {
    try {
      // Try to render as image first
      const mathResult = await this.renderMathAsImage(
        formula,
        isBlock,
        currentX,
        currentY,
        maxWidth - (currentX - startX)
      );

      if (mathResult.success) {
        this.updateCurrentColumnX(mathResult.newX);
        return;
      }
    } catch (error) {
      console.warn('Math image rendering failed:', error);
    }

    // Fallback to Unicode text
    const mathText = this.convertMathToUnicode(formula);
    const textWidth = this.doc.getTextWidth(mathText);

    // Check if math text fits on current line
    if (currentX + textWidth > startX + maxWidth - 5) {
      await advanceLine();
      currentX = this.getCurrentColumnX();
      currentY = this.getCurrentColumnY();
    }

    this.doc.text(mathText, currentX, currentY);
    this.updateCurrentColumnX(currentX + textWidth);
  }



  /**
   * Update current column X position (helper method)
   */
  private updateCurrentColumnX(newX: number): void {
    // This is a simple helper - in a full implementation you'd track column positions
    // For now, we'll just ensure the position is valid
    if (newX >= this.getCurrentColumnX()) {
      // Position moved forward, which is expected
    }
  }

  private async addQuestion(question: Question, questionNumber: number, withAnswers: boolean, collegeInfo?: CollegeInfo, subjectName?: string): Promise<void> {
    const estimatedHeight = this.estimateQuestionHeight(question, withAnswers);
    await this.checkColumnPageBreak(estimatedHeight, collegeInfo, subjectName);

    const columnX = this.getCurrentColumnX();

    // Question
    this.doc.setFontSize(this.FONT_SIZES.QUESTION_TEXT);
    this.doc.setFont('helvetica', 'normal');
    const questionText = `${questionNumber}. ${question.content}`;
    await this.addRichContent(questionText, columnX, this.columnWidth, collegeInfo, subjectName);

    // Options
    if (question.options && question.options.length > 0) {
      this.updateCurrentColumnY(this.getCurrentColumnY() + 2);
      this.doc.setFontSize(this.FONT_SIZES.OPTION_TEXT);
      
      for (let i = 0; i < question.options.length; i++) {
        const optionText = `(${String.fromCharCode(97 + i)}) ${question.options[i]}`;
        await this.addRichContent(optionText, columnX, this.columnWidth, collegeInfo, subjectName);
        this.updateCurrentColumnY(this.getCurrentColumnY() + 1);
      }
    }

    // Answer
    if (withAnswers && question.answer) {
      this.updateCurrentColumnY(this.getCurrentColumnY() + 2);
      this.doc.setFontSize(this.FONT_SIZES.ANSWER_TEXT);
      this.doc.setFont('helvetica', 'bold');
      const answerText = `Ans: ${question.answer}`;
      await this.addRichContent(answerText, columnX, this.columnWidth, collegeInfo, subjectName);
      this.doc.setFont('helvetica', 'normal');
    }
    
    this.updateCurrentColumnY(this.getCurrentColumnY() + 3);
  }

  private async addQuestionWithSolutions(
    question: Question,
    questionNumber: number,
    withAnswers: boolean,
    withSolutions: boolean,
    withHints: boolean,
    collegeInfo?: CollegeInfo,
    subjectName?: string
  ): Promise<void> {
    await this.addQuestion(question, questionNumber, withAnswers, collegeInfo, subjectName);

    const columnX = this.getCurrentColumnX();

    if (withSolutions && question.solution) {
      this.updateCurrentColumnY(this.getCurrentColumnY() + 2);
      this.doc.setFontSize(this.FONT_SIZES.SOLUTION_HEADER);
      this.doc.setFont('helvetica', 'bold');
      await this.addRichContent("Solution:", columnX, this.columnWidth, collegeInfo, subjectName);
      
      this.doc.setFontSize(this.FONT_SIZES.SOLUTION_TEXT);
      this.doc.setFont('helvetica', 'normal');
      const solutionText = question.solution.final_explanation || (question.solution.steps || []).join('\n');
      await this.addRichContent(solutionText, columnX, this.columnWidth, collegeInfo, subjectName);
    }

    if (withHints && question.hints && question.hints.length > 0) {
      this.updateCurrentColumnY(this.getCurrentColumnY() + 2);
      this.doc.setFontSize(this.FONT_SIZES.SOLUTION_HEADER);
      this.doc.setFont('helvetica', 'bold');
      await this.addRichContent("Hints:", columnX, this.columnWidth, collegeInfo, subjectName);
      
      this.doc.setFontSize(this.FONT_SIZES.HINT_TEXT);
      this.doc.setFont('helvetica', 'normal');
      const hintsText = question.hints.map(h => `• ${h}`).join('\n');
      await this.addRichContent(hintsText, columnX, this.columnWidth, collegeInfo, subjectName);
    }
  }

  private estimateQuestionHeight(question: Question, withAnswers: boolean): number {
    let height = 0;
    const tempDoc = new jsPDF(); // Use a temporary doc for text measurement
    tempDoc.setFontSize(this.FONT_SIZES.QUESTION_TEXT);
    
    const questionLines = tempDoc.splitTextToSize(question.content, this.columnWidth);
    height += questionLines.length * 4;

    if (question.options && question.options.length > 0) {
      height += 20; // Approximation for 4 options in 2x2 grid
    }

    if (withAnswers && question.answer) {
      height += 6;
    }
    
    // Add buffer
    height += 10;

    return height;
  }

  private estimateQuestionHeightWithSolutions(question: Question, withAnswers: boolean, withSolutions: boolean, withHints: boolean): number {
    let height = this.estimateQuestionHeight(question, withAnswers);

    if (withSolutions && question.solution) {
      height += 40; // Rough estimate for solution block
    }

    if (withHints && question.hints && question.hints.length > 0) {
      height += 20; // Rough estimate for hints block
    }

    return height;
  }


  public async generatePDF(questionPaper: QuestionPaper, collegeInfo?: CollegeInfo): Promise<Blob> {
    if (questionPaper.isMultiSubject) {
      await this.generateMultiSubjectPDF(questionPaper, collegeInfo);
    } else {
      await this.generateSingleSubjectPDF(questionPaper, collegeInfo);
    }

    // Finalize: Add watermark and return blob
    // Always try to add watermark (will use default Medicos logo if no college logo)
    await this.addWatermark(collegeInfo || {} as CollegeInfo);
    return this.doc.output('blob');
  }

  private async generateSingleSubjectPDF(questionPaper: QuestionPaper, collegeInfo?: CollegeInfo): Promise<void> {
    // First page setup
    await this.addHeader(collegeInfo, questionPaper);
    // ... (rest of the code remains the same)

    // Add subject header for single-subject papers
    if (questionPaper.subjectId?.name) {
        this.addSubjectHeader(questionPaper.subjectId.name);
    }

    // Initialize column layout
    this.resetColumnsForNewPage();
    this.leftColumnY = this.currentY;
    this.rightColumnY = this.currentY;
    this.addColumnSeparator();

    for (let index = 0; index < questionPaper.questions.length; index++) {
      const question = questionPaper.questions[index];
      try {
        if (questionPaper.withSolutions || questionPaper.withHints) {
          await this.addQuestionWithSolutions(
            question,
            index + 1,
            questionPaper.withAnswers,
            questionPaper.withSolutions || false,
            questionPaper.withHints || false,
            collegeInfo
          );
        } else {
          await this.addQuestion(question, index + 1, questionPaper.withAnswers, collegeInfo);
        }
      } catch (error) {
        console.error(`Error processing question ${index + 1}:`, error);
      }
    }
    this.addInstitutionFooter();
  }

  private async generateMultiSubjectPDF(questionPaper: QuestionPaper, collegeInfo?: CollegeInfo): Promise<void> {
    if (!questionPaper.sections) return;

    let overallQuestionNumber = 1;

    // First page setup
    await this.addHeader(collegeInfo, questionPaper);
    this.resetColumnsForNewPage();
    this.leftColumnY = this.currentY;
    this.rightColumnY = this.currentY;

    for (let sectionIndex = 0; sectionIndex < questionPaper.sections.length; sectionIndex++) {
        const section = questionPaper.sections[sectionIndex];
        const subjectName = section.subjectName || section.name || `Subject ${sectionIndex + 1}`;
        const partLetter = String.fromCharCode(65 + sectionIndex);

        if (sectionIndex > 0) {
            await this.addNewPage(collegeInfo, subjectName);
        }

        this.addPartHeader(partLetter, subjectName);
        this.addSectionHeader('Section - I: Single Correct', section.questions?.length || 0);
        this.addColumnSeparator();

        if (section.questions && section.questions.length > 0) {
            for (const questionItem of section.questions) {
                const question = questionItem.question;
                try {
                    if (questionPaper.withSolutions || questionPaper.withHints) {
                        await this.addQuestionWithSolutions(
                            question,
                            overallQuestionNumber,
                            questionPaper.withAnswers,
                            questionPaper.withSolutions || false,
                            questionPaper.withHints || false,
                            collegeInfo,
                            subjectName
                        );
                    } else {
                        await this.addQuestion(question, overallQuestionNumber, questionPaper.withAnswers, collegeInfo, subjectName);
                    }
                    overallQuestionNumber++;
                } catch (error) {
                    console.error(`Error processing question ${overallQuestionNumber}:`, error);
                    overallQuestionNumber++;
                }
            }
        }
    }
    this.addInstitutionFooter();
  }
}

export default PDFGenerator;
