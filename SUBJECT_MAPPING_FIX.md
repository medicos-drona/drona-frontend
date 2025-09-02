# Subject Mapping Fix

## Issue
The backend API was rejecting multi-subject requests with the error:
```
Error: subjects.0.subject must be one of the following values: physics, chemistry, biology, mathematics, math, phy, chem, bio
```

## Root Cause
The frontend was sending display names (e.g., "Physics", "Chemistry") instead of the API-expected values (e.g., "physics", "chemistry").

## Solution
Updated the frontend to properly map between display names and API values.

### Changes Made

#### 1. Updated Subject Structure
```typescript
// Before
const availableSubjects = ["Physics", "Chemistry", "Biology", "Mathematics"]

// After  
const availableSubjects = [
  { display: "Physics", value: "physics" },
  { display: "Chemistry", value: "chemistry" },
  { display: "Biology", value: "biology" },
  { display: "Mathematics", value: "mathematics" }
]
```

#### 2. Updated Selection Logic
- `handleSelectSubject()` now uses `subject.value` instead of display name
- `handleToggleSubject()` now uses `subject.value` for multi-subject selection
- Form data stores API values, not display names

#### 3. Updated UI Components
- Buttons show `subject.display` but store `subject.value`
- Selected subjects display shows proper display names
- Multi-subject configuration tabs show display names

#### 4. Added Display Mapping
```typescript
const subjectDisplayMap: Record<string, string> = {
  "physics": "Physics",
  "chemistry": "Chemistry", 
  "biology": "Biology",
  "mathematics": "Mathematics"
}

const getDisplayName = (subjectValue: string) => {
  return subjectDisplayMap[subjectValue] || subjectValue
}
```

### API Payload Structure
Now correctly sends:
```typescript
// Single Subject
{
  subject: "physics",  // API value
  // ... other fields
}

// Multi-Subject
{
  subjects: [
    {
      subject: "physics",     // API value
      numberOfQuestions: 45,
      totalMarks: 180,
      customDifficulty: { ... }
    },
    {
      subject: "chemistry",   // API value
      numberOfQuestions: 45,
      totalMarks: 180,
      customDifficulty: { ... }
    }
  ],
  // ... other fields
}
```

### Files Modified
1. `steps/course-subject-step.tsx` - Subject selection with proper mapping
2. `steps/multi-subject-config-step.tsx` - Display name handling

### Testing
Test with these subject combinations:
- Single: physics, chemistry, biology, mathematics
- Multi: physics + chemistry, all subjects, etc.

The API should now accept the requests without validation errors.
