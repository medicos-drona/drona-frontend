# Multi-Subject Question Paper Generation Enhancement

## Overview
Enhanced the existing quiz paper generation flow to support both single and multiple subject selection with independent configuration for each subject.

## Key Features Implemented

### 1. **Dual Mode Support**
- **Single Subject Mode**: Traditional flow with one subject
- **Multi-Subject Mode**: Select multiple subjects with individual configurations

### 2. **Enhanced FormData Structure**
```typescript
export type FormData = {
  // New fields for multi-subject support
  paperMode: "single" | "multi"
  subjects: string[]                    // Selected subject names
  subjectConfigs: Record<string, SubjectConfig>  // Per-subject configurations
  
  // Existing fields (used for single subject mode)
  subject: string
  difficultyMode: "auto" | "custom"
  difficultyLevels: CustomDifficultyConfig
  numberOfQuestions: number
  totalMarks: number
  // ... other existing fields
}

export type SubjectConfig = {
  subject: string
  difficultyMode: "auto" | "custom"
  difficultyLevels: CustomDifficultyConfig
  numberOfQuestions: number
  totalMarks: number
  topicId?: string
}
```

### 3. **Updated API Integration**
- **Single Subject**: Uses existing `subject` + `customise` structure
- **Multi-Subject**: Uses new `subjects[]` array structure
- Automatic API payload generation based on selected mode

### 4. **Enhanced UI Components**

#### **Course & Subject Selection Step**
- Toggle between Single/Multi-Subject modes
- Single mode: Traditional subject selection
- Multi mode: Multi-select with visual feedback
- Selected subjects display with remove functionality

#### **Multi-Subject Configuration Step** (New)
- Tabbed interface for each selected subject
- Individual configuration per subject:
  - Number of questions
  - Total marks
  - Difficulty distribution (Easy/Medium/Hard percentages)
- Real-time validation and summary
- Visual indicators for configuration status

#### **Dynamic Step Flow**
- Single Subject: Traditional 8-step flow
- Multi-Subject: Streamlined flow with subject configuration step

## Step Flow Comparison

### Single Subject Flow (8 steps)
1. Question Type Selection
2. Paper Details Entry
3. Course & Subject Selection
4. Select Difficulty Level
5. Question Selection Criteria
6. Paper Customization
7. Include Answers?
8. Generate Paper

### Multi-Subject Flow (5 steps)
1. Question Type Selection
2. Paper Details Entry
3. Course & Subject Selection
4. **Configure Subjects** (New)
5. Include Answers?
6. Generate Paper

## Technical Implementation

### 1. **API Payload Generation**
```typescript
// Single Subject
const apiPayload = {
  title, description, subject, examType,
  customise: {
    customDifficulty: { easyPercentage, mediumPercentage, hardPercentage },
    numberOfQuestions, totalMarks, duration, includeAnswers
  }
}

// Multi-Subject
const apiPayload = {
  title, description, examType, duration, instructions,
  subjects: [
    {
      subject: "Physics",
      numberOfQuestions: 45,
      totalMarks: 180,
      customDifficulty: { easyPercentage: 30, mediumPercentage: 50, hardPercentage: 20 }
    },
    // ... other subjects
  ],
  includeAnswers: true
}
```

### 2. **Dynamic Step Building**
- Steps are built dynamically based on `paperMode`
- Multi-subject mode skips individual difficulty/question/customization steps
- All configuration happens in the dedicated multi-subject step

### 3. **Validation Logic**
- Single mode: Validates individual fields
- Multi mode: Validates all subject configurations
- Ensures difficulty percentages sum to 100% for each subject
- Validates minimum questions and marks per subject

## User Experience Improvements

### 1. **Intuitive Mode Selection**
- Clear toggle between single and multi-subject modes
- Visual feedback for selected mode
- Automatic form reset when switching modes

### 2. **Multi-Subject Management**
- Easy subject selection with checkboxes
- Visual indicators for selected subjects
- Quick removal of subjects
- Real-time count of selected subjects

### 3. **Per-Subject Configuration**
- Tabbed interface for easy navigation
- Visual validation status for each subject
- Summary view showing totals across all subjects
- Consistent UI patterns with existing components

### 4. **Enhanced Feedback**
- Real-time validation messages
- Progress indicators
- Clear error states
- Success confirmations

## Backward Compatibility
- Existing single-subject functionality remains unchanged
- All existing API endpoints work as before
- No breaking changes to existing components
- Gradual migration path for users

## Future Enhancements
1. **Topic Selection**: Add per-subject topic filtering
2. **Question Preview**: Show sample questions before generation
3. **Templates**: Save and reuse multi-subject configurations
4. **Advanced Validation**: Cross-subject validation rules
5. **Bulk Operations**: Import/export subject configurations

## Files Modified
- `question-paper-wizard.tsx` - Main wizard logic and step management
- `course-subject-step.tsx` - Enhanced subject selection
- `multi-subject-config-step.tsx` - New configuration step
- `difficulty-level-step.tsx` - Updated for new data structure
- `questionPapers.ts` - Enhanced API types and interfaces

## Testing Recommendations
1. Test single-subject flow (existing functionality)
2. Test multi-subject flow with 2-4 subjects
3. Validate difficulty percentage calculations
4. Test form reset when switching modes
5. Verify API payload generation for both modes
6. Test error handling and validation
7. Verify PDF generation with multi-subject structure
