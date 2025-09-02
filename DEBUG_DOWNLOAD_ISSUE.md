# Debug Guide for Download Issue

## Problem
Downloaded PDFs only show basic paper info (title, subject, duration, marks) but no questions or options.

## Possible Causes

### 1. **Question Paper Data Missing**
The question papers in the database might not have the actual questions saved properly.

### 2. **API Parameter Issue**
The download endpoint might need specific parameters to include questions and answers.

### 3. **Backend PDF Generation Issue**
The backend PDF generation service might not be fetching or including the questions.

## Debug Steps

### Step 1: Check Question Paper Data
Open browser console and look for these logs when downloading:
```
Fetching complete question paper details for: [paper_id]
Full question paper data: [object with questions array]
Question paper has X questions. Proceeding with download...
```

If you see "This question paper does not contain any questions", the issue is that the question paper was created without questions being saved.

### Step 2: Check API Response
In the browser Network tab, check:
1. **GET /question-papers/{id}** - Should return full question paper with questions array
2. **GET /question-papers/{id}/download?format=pdf&includeAnswers=true** - Should return PDF blob

### Step 3: Verify Backend Logs
Check backend logs for:
- Question paper retrieval
- PDF generation process
- Any errors during download

## Potential Solutions

### Solution 1: Fix Question Paper Creation
If question papers don't have questions, the issue is in the creation process. Check:
- Question paper wizard API call
- Backend question paper creation service
- Database question storage

### Solution 2: Fix Download Parameters
Try different download parameters:
```typescript
// Try without includeAnswers parameter
await downloadQuestionPaper(paper._id, 'pdf');

// Try with different format
await downloadQuestionPaper(paper._id, 'docx', true);
```

### Solution 3: Backend PDF Service
The backend PDF generation might need:
- Proper question fetching from database
- Correct template rendering
- Question formatting in PDF

## Testing Commands

### Test API Directly
```bash
# Get question paper details
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/question-papers/PAPER_ID

# Download question paper
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/question-papers/PAPER_ID/download?format=pdf&includeAnswers=true \
  --output test.pdf
```

### Check Database
```sql
-- Check if questions exist for a paper
SELECT qp.title, qp._id, COUNT(q._id) as question_count
FROM question_papers qp
LEFT JOIN questions q ON q.questionPaperId = qp._id
GROUP BY qp._id, qp.title;
```

## Expected vs Actual

### Expected PDF Content
```
Physics Mock Test
Subject: Physics
Duration: 60 minutes
Total Marks: 100

Questions:

1. What is the derivative of f(x) = x²?
   A) 2x
   B) x
   C) 2
   D) 1
   
   Answer: A) 2x

2. [Next question...]
```

### Actual PDF Content
```
Physics
Subject: Physics
Duration: 60 minutes
Total Marks: 100
Questions:

[Empty - no questions shown]
```

## Quick Fix Implementation

If the issue is confirmed to be missing questions in the database, implement a fallback:

```typescript
const handleDownload = async (paper: QuestionPaperListItem) => {
  try {
    // Check if paper has questions
    const fullPaper = await getQuestionPaper(paper._id);
    
    if (!fullPaper.questions || fullPaper.questions.length === 0) {
      alert(`This question paper "${paper.title}" does not contain any questions. Please regenerate the paper.`);
      return;
    }
    
    // Proceed with download
    const pdfBlob = await downloadQuestionPaper(paper._id, 'pdf', true);
    // ... rest of download logic
  } catch (error) {
    console.error('Download failed:', error);
    alert('Download failed. Please check the console for details.');
  }
};
```

## Next Steps

1. **Test the enhanced download function** with console logging
2. **Check browser network tab** for API responses
3. **Verify question paper creation** process saves questions
4. **Test with a newly created question paper** to see if the issue persists
5. **Check backend logs** for PDF generation errors

The enhanced download function now includes:
- ✅ Complete question paper data fetching
- ✅ Question validation before download
- ✅ Better error messages
- ✅ Console logging for debugging
- ✅ Explicit answer inclusion parameter
