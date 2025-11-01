"use client"

import { useState } from "react"
import { createQuestionPaper, CreateQuestionPaperDto, SubjectConfiguration, CustomDifficultyConfig, getQuestionPaperForPDF } from "@/lib/api/questionPapers"
import { QuestionTypeStep } from "./steps/question-type-step"
import { CourseSubjectStep } from "./steps/course-subject-step"
import { DifficultyLevelStep } from "./steps/difficulty-level-step"
import { QuestionSelectionStep } from "./steps/question-selection-step"
import { PaperCustomizationStep } from "./steps/paper-customization-step"
import { IncludeAnswersStep } from "./steps/include-answers-step"
import { ActionsStep } from "./steps/actions-step"
import { StepIndicator } from "./ui/step-indicator"
import { QuestionTitleAndDescriptionStep } from "./steps/question-title-description-step"
import { MultiSubjectConfigStep } from "./steps/multi-subject-config-step"
import { ChapterSelectionStep } from "./steps/chapter-selection-step"
import { TopicSelectionStep } from "./steps/topic-selection-step"

export type TopicConfig = {
  topicId: string
  topicName: string
  numberOfQuestions: number
  totalMarks: number
}

export type ChapterConfig = {
  chapterId: string
  chapterName: string
  numberOfQuestions: number
  totalMarks: number
  topics?: TopicConfig[] // For topic-level selection within chapter
}

export type SubjectConfig = {
  subject: string
  difficultyMode: "auto" | "custom"
  difficultyLevels: CustomDifficultyConfig
  numberOfQuestions: number
  totalMarks: number
  chapterId?: string // For single chapter selection
  topicId?: string // For single topic selection (most specific)
  chapters?: ChapterConfig[] // For multiple chapter selection
  topics?: TopicConfig[] // For multiple topic selection
}

export type FormData = {
  // QuestionTypeStep - maps to examType
  questionType: string
  // QuestionTitleAndDescriptionStep - maps to title, description
  title: string
  description: string
  // CourseSubjectStep - maps to subject or subjects
  paperMode: "single" | "multi" // New field to determine single vs multi-subject
  course: string
  subject: string // For single subject mode
  subjects: string[] // For multi-subject mode - selected subject names
  subjectConfigs: Record<string, SubjectConfig> // Per-subject configurations
  // DifficultyLevelStep - maps to customise.customDifficulty or auto (for single subject)
  difficultyMode: "auto" | "custom"
  difficultyLevels: CustomDifficultyConfig
  // QuestionSelectionStep - maps to customise.numberOfQuestions (for single subject)
  numberOfQuestions: number
  // PaperCustomizationStep - maps to totalMarks and customise.totalMarks (for single subject)
  totalMarks: number
  // IncludeAnswersStep - maps to customise.includeAnswers or includeAnswers
  includeAnswers: boolean
  // Additional fields for API
  duration: number // Default 60 minutes (1 hour)
  instructions: string
  chapterId?: string // For single chapter selection
  topicId?: string // For single topic selection (most specific)
  chapters?: ChapterConfig[] // For multi-chapter selection in single subject mode
  topics?: TopicConfig[] // For multi-topic selection in single subject mode
}

const initialFormData: FormData = {
  questionType: "",
  title: "",
  description: "",
  paperMode: "single",
  course: "",
  subject: "",
  subjects: [],
  subjectConfigs: {},
  difficultyMode: "auto",
  difficultyLevels: {
    easyPercentage: 30,
    mediumPercentage: 50,
    hardPercentage: 20,
  },
  numberOfQuestions: 1,
  totalMarks: 100,
  includeAnswers: false, // Default to false as per requirements
  duration: 60, // Default 1 hour in minutes
  instructions: "",
  topicId: undefined,
}

export function QuestionPaperWizard() {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [isGenerating, setIsGenerating] = useState(false)

  const updateFormData = (data: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...data }))
  }

  const nextStep = () => {
    let nextStepIndex = currentStep + 1

    // Smart navigation: Skip steps based on form state
    if (formData.paperMode === "single") {
      // Always skip "Select Topics (Optional)" step - it's redundant since we have chapter selection
      if (steps[nextStepIndex]?.title === "Select Topics (Optional)") {
        nextStepIndex++
      }

      // If chapters/topics are selected, also skip "Question Selection Criteria"
      const hasChapterSelection = formData.chapters && formData.chapters.length > 0
      const hasTopicSelection = formData.topics && formData.topics.length > 0

      if (hasChapterSelection || hasTopicSelection) {
        // Skip "Question Selection Criteria" step
        if (steps[nextStepIndex]?.title === "Question Selection Criteria") {
          nextStepIndex++
        }
      }
    }

    setCurrentStep(Math.min(nextStepIndex, steps.length - 1))
  }

  const prevStep = () => {
    let prevStepIndex = currentStep - 1

    // Smart navigation: Skip steps when going back
    if (formData.paperMode === "single") {
      // Always skip "Select Topics (Optional)" step when going back
      if (steps[prevStepIndex]?.title === "Select Topics (Optional)") {
        prevStepIndex--
      }

      const hasChapterSelection = formData.chapters && formData.chapters.length > 0
      const hasTopicSelection = formData.topics && formData.topics.length > 0

      if (hasChapterSelection || hasTopicSelection) {
        // Skip "Question Selection Criteria" step when going back
        if (steps[prevStepIndex]?.title === "Question Selection Criteria") {
          prevStepIndex--
        }
      }
    }

    setCurrentStep(Math.max(prevStepIndex, 0))
  }

  const skipStep = () => {
    nextStep()
  }

  const goToFirstStep = () => {
    setCurrentStep(0)
  }

  const handleSubmit = async () => {
    if (isGenerating) return; // Prevent multiple submissions

    try {
      setIsGenerating(true);
      console.log("Submitting data:", formData)

      // Debug: Check available tokens
      const backendToken = localStorage.getItem("backendToken");
      const firebaseToken = localStorage.getItem("firebaseToken");
      const token = localStorage.getItem("token");

      console.log("Available tokens:", {
        backendToken: backendToken ? `${backendToken.substring(0, 20)}...` : 'None',
        firebaseToken: firebaseToken ? `${firebaseToken.substring(0, 20)}...` : 'None',
        token: token ? `${token.substring(0, 20)}...` : 'None'
      });

      // Validate required fields
      if (!formData.title?.trim()) {
        setIsGenerating(false);
        alert("Please enter a title for the question paper");
        return;
      }

      if (!formData.questionType) {
        setIsGenerating(false);
        alert("Please select an exam type");
        return;
      }

      // Validate based on paper mode
      if (formData.paperMode === "single") {
        if (!formData.subject) {
          setIsGenerating(false);
          alert("Please select a subject");
          return;
        }
      } else {
        if (formData.subjects.length === 0) {
          setIsGenerating(false);
          alert("Please select at least one subject");
          return;
        }
      }

      // Prepare the API payload
      let apiPayload: CreateQuestionPaperDto;

      if (formData.paperMode === "single") {
        // Single subject mode
        apiPayload = {
          title: formData.title,
          description: formData.description,
          subject: formData.subject,
          totalMarks: formData.totalMarks,
          duration: formData.duration,
          examType: formData.questionType,
          instructions: formData.instructions,
          chapterId: formData.chapterId, // For single chapter selection
          topicId: formData.topicId, // For single topic selection (most specific)
        }

        // Track computed totals when using topic/chapter selection
        let computedTotalQuestions: number | undefined = undefined
        let computedTotalMarks: number | undefined = undefined

        // If topics are selected from chapter selection, add them to single-subject payload
        if (formData.topics && formData.topics.length > 0) {
          // Use single-subject format with topics array
          apiPayload.topics = formData.topics

          // Calculate total questions and marks from selected topics
          const totalQuestions = formData.topics.reduce((sum, topic) => sum + topic.numberOfQuestions, 0)
          const totalMarks = formData.topics.reduce((sum, topic) => sum + topic.totalMarks, 0)

          // Store for later customise assignment
          computedTotalQuestions = totalQuestions
          computedTotalMarks = totalMarks
        }
        // If chapters are selected (but no topics), add them to single-subject payload
        else if (formData.chapters && formData.chapters.length > 0) {
          // Use single-subject format with chapters array
          apiPayload.chapters = formData.chapters

          // Calculate total questions and marks from selected chapters
          const totalQuestions = formData.chapters.reduce((sum, chapter) => sum + chapter.numberOfQuestions, 0)
          const totalMarks = formData.chapters.reduce((sum, chapter) => sum + chapter.totalMarks, 0)

          // Store for later customise assignment
          computedTotalQuestions = totalQuestions
          computedTotalMarks = totalMarks
        }

        // Add customization if not auto mode
        if (formData.difficultyMode === "custom") {
          apiPayload.customise = {
            customDifficulty: formData.difficultyLevels,
            numberOfQuestions: computedTotalQuestions ?? formData.numberOfQuestions,
            totalMarks: computedTotalMarks ?? formData.totalMarks,
            duration: formData.duration,
            includeAnswers: formData.includeAnswers,
          }
        } else {
          // For auto mode, still include customization with default values
          apiPayload.customise = {
            customDifficulty: {
              easyPercentage: 30,
              mediumPercentage: 50,
              hardPercentage: 20,
            },
            numberOfQuestions: computedTotalQuestions ?? formData.numberOfQuestions,
            totalMarks: computedTotalMarks ?? formData.totalMarks,
            duration: formData.duration,
            includeAnswers: formData.includeAnswers,
          }
        }

        // If we computed totals from topics/chapters, mirror at top-level for consistency
        if (computedTotalMarks !== undefined) {
          apiPayload.totalMarks = computedTotalMarks
        }
      } else {
        // Multi-subject mode
        const subjects: SubjectConfiguration[] = formData.subjects.map(subjectName => {
          const config = formData.subjectConfigs[subjectName];
          return {
            subject: subjectName,
            numberOfQuestions: config.numberOfQuestions,
            totalMarks: config.totalMarks,
            customDifficulty: config.difficultyLevels,
            chapterId: config.chapterId, // For single chapter selection
            topicId: config.topicId, // For single topic selection (most specific)
            chapters: config.chapters, // For multi-chapter selection
            topics: config.topics, // For multi-topic selection
          };
        });

        apiPayload = {
          title: formData.title,
          description: formData.description,
          duration: formData.duration,
          examType: formData.questionType,
          instructions: formData.instructions,
          subjects: subjects,
          includeAnswers: formData.includeAnswers,
        }
      }

      // Create the question paper
      console.log("Calling createQuestionPaper API...");
      const result = await createQuestionPaper(apiPayload)
      console.log("API result:", result);

      // Check if the request was successful
      if (!result.success) {
        console.log("API returned error:", result.error);
        setIsGenerating(false);

        let errorMessage = result.error;

        // Handle specific error types with better messages
        if (errorMessage.includes("Authentication required") || errorMessage.includes("Unauthorized")) {
          errorMessage = "Please log in again to continue. Your session may have expired.";
        } else if (errorMessage.includes("Network") || errorMessage.includes("fetch")) {
          errorMessage = "Please check your internet connection and try again.";
        } else if (errorMessage.includes("unused questions available")) {
          // Extract numbers from the error message for a clearer explanation
          const match = errorMessage.match(/Only (\d+) unused questions available\. Requested: (\d+)/);
          if (match) {
            const available = match[1];
            const requested = match[2];
            errorMessage = `Only ${available} questions are available for this subject/topic, but you requested ${requested} questions. Please reduce the number of questions or add more questions to the database.`;
          }
        }

        // Show error message in alert
        alert(`Error: ${errorMessage}`);
        console.log("Staying on current step due to error");
        return; // Exit early on error
      }

      // Success - proceed with download
      console.log("API success! Proceeding with download...");
      console.log("Full API response:", result);

      // After the API fix, result.data should contain the question paper directly
      const questionPaper = result.data;
      console.log("Question paper data:", questionPaper);

      // Validate that we have a question paper ID
      if (!questionPaper || !questionPaper._id) {
        console.error("No question paper ID found in response. Full response:", result);
        throw new Error("Question paper was created but no ID was returned. Please check the console for details and try again.");
      }

      // Fetch complete paper with college/subject info for PDF payload
      const fullData = await getQuestionPaperForPDF(questionPaper._id);
      const qp = fullData.questionPaper;
      const college = fullData.college || { name: "", logoUrl: "", address: "" };

      // Flatten questions with robust mapping (handles IDs, {questionId}, or full objects)
      const flattenQuestions = () => {
        const allQ: any[] = Array.isArray(qp.questions) ? qp.questions : [];

        const resolveQuestion = (wrap: any): any | null => {
          if (!wrap) return null;
          // Direct full object
          if (wrap.question && typeof wrap.question === 'object') return wrap.question;
          // Sometimes wrap itself is the full question object
          if (wrap.content || wrap.options || wrap.answer) return wrap;
          // Lookup by questionId
          const id = wrap.questionId || wrap._id || (typeof wrap === 'string' ? wrap : undefined);
          if (id && allQ && allQ.length) {
            const found = allQ.find((qq: any) => {
              const qid = qq && (qq._id || qq.id);
              return qid && qid.toString() === id.toString();
            });
            if (found) return found;
          }
          // If wrap.question is a string (rare), treat as content
          if (typeof wrap.question === 'string') {
            return { content: wrap.question };
          }
          return null;
        };

        if (qp.isMultiSubject && qp.sections) {
          const arr: any[] = [];
          qp.sections.forEach((sec: any) => {
            const subjectName = sec.subjectName || sec.name || '';
            const secQuestions = Array.isArray(sec.questions) ? sec.questions : [];
            secQuestions.forEach((qwrap: any) => {
              const q = resolveQuestion(qwrap);
              const text = q?.content || q?.question || '';
              if (!text || !String(text).trim()) return; // skip empties
              arr.push({
                question: String(text),
                options: Array.isArray(q?.options) ? q.options : [],
                answer: typeof q?.answer === 'string' ? q.answer : '',
                subject: subjectName,
                imageUrls: Array.isArray(q?.imageUrls) ? q.imageUrls : [],
                solution: q?.solution || null,
                hints: Array.isArray(q?.hints) ? q.hints : [],
              });
            });
          });
          return arr;
        }

        // Single-subject: qp.questions may be full objects or ids
        return allQ
          .map((item: any) => resolveQuestion(item) || item)
          .map((q: any) => {
            const text = q?.content || q?.question || '';
            if (!text || !String(text).trim()) return null;
            return {
              question: String(text),
              options: Array.isArray(q?.options) ? q.options : [],
              answer: typeof q?.answer === 'string' ? q.answer : '',
              subject: qp.subjectId?.name || '',
              imageUrls: Array.isArray(q?.imageUrls) ? q.imageUrls : [],
              solution: q?.solution || null,
              hints: Array.isArray(q?.hints) ? q.hints : [],
            };
          })
          .filter(Boolean) as any[];
      };

      const pdfPayload = {
        title: qp.title,
        description: qp.description || "",
        duration: qp.duration,
        totalMarks: qp.totalMarks,
        instructions: qp.instructions || "",
        includeAnswers: formData.includeAnswers,
        questions: flattenQuestions(),
        filename: `${qp.title.replace(/\s+/g, '_')}_${Date.now()}.pdf`,
        collegeName: college?.name || "",
        collegeLogoUrl: college?.logoUrl || "",
      };

      // Call internal API route to generate PDF via Puppeteer
      const pdfRes = await fetch("/api/generate-paper-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pdfPayload),
      });

      if (!pdfRes.ok) {
        throw new Error("Server-side PDF generation failed");
      }

      const pdfBlob = await pdfRes.blob();

      // Create download link
      const url = window.URL.createObjectURL(pdfBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = pdfPayload.filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      alert("Question paper generated and downloaded successfully!");

      console.log("Success! About to redirect to first step in 1 second...");

      // Reset to first step and clear form data after a short delay (only on success)
      setTimeout(() => {
        console.log("Redirecting to first step now...");
        setCurrentStep(0)
        setFormData(initialFormData)
        setIsGenerating(false)
        console.log("Redirect completed. Current step should be 0");
      }, 1000) // 1 second delay to ensure alert is visible
    } catch (error) {
      setIsGenerating(false)

      // Handle any unexpected errors (like network issues)
      alert("Error: An unexpected error occurred. Please try again.");
    }
  }

  // Build steps array dynamically based on paper mode
  const buildSteps = () => {
    const baseSteps = [
      {
        title: "Question Type",
        icon: "HelpCircle",
        component: (
          <QuestionTypeStep
            formData={formData}
            updateFormData={updateFormData}
            onNext={nextStep}
            onSkip={skipStep}
            onBack={prevStep}
            backDisabled={currentStep === 0}
          />
        ),
      },
      {
        title: "Paper Details",
        icon: "FileText",
        component: (
          <QuestionTitleAndDescriptionStep
            formData={formData}
            updateFormData={updateFormData}
            onNext={nextStep}
            onSkip={skipStep}
            onBack={prevStep}
            backDisabled={currentStep === 0}
          />
        ),
      },
      {
        title: "Course & Subject Selection",
        icon: "BookOpen",
        component: (
          <CourseSubjectStep
            formData={formData}
            updateFormData={updateFormData}
            onNext={nextStep}
            onSkip={skipStep}
            onBack={prevStep}
            backDisabled={currentStep === 0}
          />
        ),
      },
    ]

    // Add multi-subject configuration steps if in multi-subject mode
    if (formData.paperMode === "multi") {
      baseSteps.push(
        {
          title: "Configure Subjects",
          icon: "Settings",
          component: (
            <MultiSubjectConfigStep
              formData={formData}
              updateFormData={updateFormData}
              onNext={nextStep}
              onSkip={skipStep}
              onBack={prevStep}
              backDisabled={currentStep === 0}
            />
          ),
        },
        {
          title: "Paper Customization",
          icon: "FileEdit",
          component: (
            <PaperCustomizationStep
              formData={formData}
              updateFormData={updateFormData}
              onNext={nextStep}
              onSkip={skipStep}
              onBack={prevStep}
              backDisabled={currentStep === 0}
            />
          ),
        }
      )
    }

    // Add remaining steps only for single subject mode
    if (formData.paperMode === "single") {
      baseSteps.push(
        {
          title: "Select Chapters (Optional)",
          icon: "BookOpen",
          component: (
            <ChapterSelectionStep
              formData={formData}
              updateFormData={updateFormData}
              onNext={nextStep}
              onSkip={skipStep}
              onBack={prevStep}
              backDisabled={currentStep === 0}
            />
          ),
        },
        {
          title: "Select Topics (Optional)",
          icon: "Tag",
          component: (
            <TopicSelectionStep
              formData={formData}
              updateFormData={updateFormData}
              onNext={nextStep}
              onSkip={skipStep}
              onBack={prevStep}
              backDisabled={currentStep === 0}
            />
          ),
        },
        {
          title: "Select Difficulty Level",
          icon: "BarChart2",
          component: (
            <DifficultyLevelStep
              formData={formData}
              updateFormData={updateFormData}
              onNext={nextStep}
              onSkip={skipStep}
              onBack={prevStep}
              backDisabled={currentStep === 0}
            />
          ),
        },
        {
          title: "Question Selection Criteria",
          icon: "FileText",
          component: (
            <QuestionSelectionStep
              formData={formData}
              updateFormData={updateFormData}
              onNext={nextStep}
              onSkip={skipStep}
              onBack={prevStep}
              backDisabled={currentStep === 0}
            />
          ),
        },
        {
          title: "Paper Customization",
          icon: "FileEdit",
          component: (
            <PaperCustomizationStep
              formData={formData}
              updateFormData={updateFormData}
              onNext={nextStep}
              onSkip={skipStep}
              onBack={prevStep}
              backDisabled={currentStep === 0}
            />
          ),
        }
      )
    }

    // Add final steps for both modes
    baseSteps.push(
      {
        title: "Include Answers?",
        icon: "CheckSquare",
        component: (
          <IncludeAnswersStep
            formData={formData}
            updateFormData={updateFormData}
            onNext={nextStep}
            onSkip={skipStep}
            onBack={prevStep}
            backDisabled={currentStep === 0}
          />
        ),
      },
      {
        title: "Generate Paper",
        icon: "FileOutput",
        component: <ActionsStep formData={formData} onSubmit={handleSubmit} isLoading={isGenerating} onBack={goToFirstStep} />,
      }
    )

    return baseSteps
  }

  const steps = buildSteps()



  return (
    <div className="space-y-6">
      <StepIndicator currentStep={currentStep} steps={steps.map((step: any) => ({ title: step.title, icon: step.icon }))} />
      {steps[currentStep].component}
    </div>
  )
}
