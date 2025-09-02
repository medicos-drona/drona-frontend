"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { X, Upload, Info, Loader2, FileText, Edit, Code } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { toast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getSubjectsWithChapters } from "@/lib/api/subjects"
import { createQuestion, QuestionData, bulkUploadQuestionsPDF, bulkUploadChemicalQuestionsPDF, bulkUploadQuestionsJSON } from "@/lib/api/questions"
import { isApiSuccess } from '@/lib/utils/errorHandler';

// Define interfaces for API data
interface Chapter {
  _id: string;
  name: string;
  description?: string;
}

// Local interface that matches the actual API response
interface SubjectWithTopics {
  _id: string;
  name: string;
  description?: string;
  topics: Chapter[];
}

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/svg+xml"]
const ACCEPTED_PDF_TYPES = ["application/pdf"]

// Manual form schema with custom validation for options
const manualFormSchema = z.object({
  subject: z.string().min(1, { message: "Please select a subject" }),
  chapter: z.string().min(1, { message: "Please select a chapter" }),
  questionText: z.string().min(5, { message: "Question must be at least 5 characters" }),
  optionA: z.string().optional(),
  optionB: z.string().optional(),
  optionC: z.string().optional(),
  optionD: z.string().optional(),
  correctAnswer: z.enum(["A", "B", "C", "D"], {
    required_error: "Please select the correct answer",
  }),
  explanation: z.string().optional(),
  difficulty: z.enum(["Easy", "Medium", "Hard"], {
    required_error: "Please select a difficulty level",
  }),
})

// PDF upload form schema
const pdfUploadSchema = z.object({
  subject: z.string().min(1, { message: "Please select a subject" }),
  chapter: z.string().optional(),
  aiProvider: z.enum(['mistral', 'gemini']),
})


  // JSON upload form schema
  const jsonUploadSchema = z.object({
    subject: z.string().min(1, { message: "Please select a subject" }),
    chapter: z.string().optional()
  })
  type JSONUploadFormValues = z.infer<typeof jsonUploadSchema>


type ManualFormValues = z.infer<typeof manualFormSchema>
type PDFUploadFormValues = z.infer<typeof pdfUploadSchema>

export default function AddQuestionForm() {
  const [activeTab, setActiveTab] = useState("manual")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [subjects, setSubjects] = useState<SubjectWithTopics[]>([])
  const [loading, setLoading] = useState(true)

  // Manual form states
  const [questionImage, setQuestionImage] = useState<string | null>(null)
  const [optionImages, setOptionImages] = useState<{ [key: string]: string | null }>({
    A: null,
    B: null,
    C: null,
    D: null,
  })
  const [manualChapters, setManualChapters] = useState<Chapter[]>([])
  const [optionValidationErrors, setOptionValidationErrors] = useState<{[key: string]: boolean}>({
    A: false,
    B: false,
    C: false,
    D: false
  })

  // PDF upload states
  const [pdfChapters, setPdfChapters] = useState<Chapter[]>([])
  const [selectedPdfFile, setSelectedPdfFile] = useState<File | null>(null)
  const [useChemicalExtraction, setUseChemicalExtraction] = useState<boolean>(false)

  // JSON upload states
  const [jsonChapters, setJsonChapters] = useState<Chapter[]>([])
  const [selectedJsonFile, setSelectedJsonFile] = useState<File | null>(null)

  // Fetch subjects and chapters from API
  useEffect(() => {
    const fetchSubjectsAndChapters = async () => {
      try {
        setLoading(true)
        const data = await getSubjectsWithChapters()
        // Cast to our local interface since the API returns topics, not chapters
        setSubjects(data as unknown as SubjectWithTopics[])
      } catch (error: any) {
        console.error("Error fetching subjects and chapters:", error)
        toast({
          title: "Error",
          description: error.message || "Failed to load subjects and chapters",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchSubjectsAndChapters()
  }, [])

  // Refs for file inputs
  const questionImageRef = useRef<HTMLInputElement>(null)
  const optionImageRefs = {
    A: useRef<HTMLInputElement>(null),
    B: useRef<HTMLInputElement>(null),
    C: useRef<HTMLInputElement>(null),
    D: useRef<HTMLInputElement>(null),
  }

  // Initialize manual form
  const manualForm = useForm<ManualFormValues>({
    resolver: zodResolver(manualFormSchema),
    defaultValues: {
      subject: "",
      chapter: "",
      questionText: "",
      optionA: "",
      optionB: "",
      optionC: "",
      optionD: "",
      correctAnswer: "" as any,
      explanation: "",
      difficulty: "" as any,
    },
  })

  // Initialize JSON upload form
  const jsonForm = useForm<JSONUploadFormValues>({
    resolver: zodResolver(jsonUploadSchema),
    defaultValues: {
      subject: "",
      chapter: "",
    },
  })

  // Initialize PDF upload form
  const pdfForm = useForm<PDFUploadFormValues>({
    resolver: zodResolver(pdfUploadSchema),
    defaultValues: {
      subject: "",
      chapter: "",
      aiProvider: "gemini" as const,
    },
  })

  // Handle subject change for manual form
  const handleManualSubjectChange = (value: string) => {
    manualForm.setValue("subject", value)
    manualForm.setValue("chapter", "")
  }
  // Handle subject change for JSON form
  const handleJsonSubjectChange = (value: string) => {
    jsonForm.setValue("subject", value)
    jsonForm.setValue("chapter", "")

    const selectedSubject = subjects.find(subject => subject._id === value)
    if (selectedSubject) {
      setJsonChapters(selectedSubject.topics || [])
    } else {
      setJsonChapters([])
    }
  }

  // Handle JSON file selection
  const handleJsonFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "application/json") {
        toast({
          title: "Invalid File Type",
          description: "Please select a JSON file.",
          variant: "destructive",
        });
        return;
      }
      setSelectedJsonFile(file);
    }
  }

  // Handle subject change for PDF form
  const handlePdfSubjectChange = (value: string) => {
    pdfForm.setValue("subject", value)
    pdfForm.setValue("chapter", "")

    const selectedSubject = subjects.find(subject => subject._id === value)
    if (selectedSubject) {
      setPdfChapters(selectedSubject.topics || [])
    } else {
      setPdfChapters([])
    }
  }

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      if (type === "question") {
        setQuestionImage(event.target?.result as string)
      } else {
        setOptionImages((prev) => ({
          ...prev,
          [type]: event.target?.result as string,
        }))
        // Clear validation error for this option
        setOptionValidationErrors(prev => ({
          ...prev,
          [type]: false
        }))
      }
    }
    reader.readAsDataURL(file)
  }

  // Remove image
  const removeImage = (type: string) => {
    if (type === "question") {
      setQuestionImage(null)
      if (questionImageRef.current) {
        questionImageRef.current.value = ""
      }
    } else {
      setOptionImages((prev) => ({
        ...prev,
        [type]: null,
      }))
      if (optionImageRefs[type as keyof typeof optionImageRefs]?.current) {
        optionImageRefs[type as keyof typeof optionImageRefs].current!.value = ""
      }
      // Clear form validation error for this option if it exists
      manualForm.clearErrors(`option${type}` as keyof ManualFormValues);
      // Update validation state
      setOptionValidationErrors(prev => ({
        ...prev,
        [type]: false
      }));
    }
  }

  // Custom validation function for manual form
  const validateOptions = (formData: ManualFormValues) => {
    const errors: string[] = [];
    const validationState: {[key: string]: boolean} = {};
    const options = ['A', 'B', 'C', 'D'];

    for (const option of options) {
      const hasText = formData[`option${option}` as keyof ManualFormValues] &&
                     (formData[`option${option}` as keyof ManualFormValues] as string).trim() !== '';
      const hasImage = optionImages[option] !== null;

      if (!hasText && !hasImage) {
        errors.push(`Option ${option} must have either text or an image`);
        validationState[option] = true;
      } else {
        validationState[option] = false;
      }
    }

    // Update validation state
    setOptionValidationErrors(validationState);

    return errors;
  };

  // Handle manual form submission
  const onManualSubmit = async (data: ManualFormValues) => {
    setIsSubmitting(true);

    try {
      console.log("Manual form data:", data);

      // Validate that each option has either text or image
      const validationErrors = validateOptions(data);
      if (validationErrors.length > 0) {
        toast({
          title: "Validation Error",
          description: validationErrors.join(', '),
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Convert option data to array format expected by API
      const options = [
        data.optionA?.trim() || optionImages.A || '',
        data.optionB?.trim() || optionImages.B || '',
        data.optionC?.trim() || optionImages.C || '',
        data.optionD?.trim() || optionImages.D || ''
      ];

      // Map correctAnswer (A, B, C, D) to the actual option value
      const answerMap: { [key: string]: number } = { A: 0, B: 1, C: 2, D: 3 };
      const answerIndex = answerMap[data.correctAnswer];
      const answer = options[answerIndex];

      // Convert difficulty to lowercase to match API expectations
      const difficulty = data.difficulty.toLowerCase() as 'easy' | 'medium' | 'hard';

      // Get user ID from localStorage if available
      const userData = localStorage.getItem("userData");
      let userId;
      try {
        if (userData) {
          const parsed = JSON.parse(userData);
          userId = parsed._id || parsed.id;
        }
      } catch (e) {
        console.error("Error parsing user data:", e);
      }

      // Create base question data
      const baseQuestionData: QuestionData = {
        content: data.questionText,
        options,
        answer,
        subjectId: data.subject,
        topicId: data.chapter, // Changed from chapterId to topicId
        difficulty,
        type: "multiple-choice"
      };

      // Only add createdBy if we have a valid user ID
      if (userId) {
        baseQuestionData.createdBy = userId;
      }

      // Only add explanation if it has a value
      const questionData = data.explanation && data.explanation.trim() !== ''
        ? { ...baseQuestionData, explanation: data.explanation }
        : baseQuestionData;

      // If question has an image, embed it in the question text as base64
      let finalQuestionData = { ...questionData };
      if (questionImage) {
        finalQuestionData.content = `${questionData.content}\n${questionImage}`;
      }

      // Submit to API
      const response = await createQuestion(finalQuestionData);

      if (isApiSuccess(response)) {
        // Success toast is already shown by the API function

        // Reset manual form
        resetManualForm();
      }
      // Error case is already handled by the API function (toast shown)

    } catch (error: any) {
      // Fallback error handling for unexpected errors
      console.error("Unexpected error adding question:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  // Handle PDF form submission
  // Handle JSON submit
  const onJsonSubmit = async (data: JSONUploadFormValues) => {
    if (!selectedJsonFile) {
      toast({
        title: "Error",
        description: "Please select a JSON file to upload.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await bulkUploadQuestionsJSON(
        selectedJsonFile,
        data.subject,
        data.chapter || undefined
      );

      const questionsCount = result.questionsAdded || result.questionsCreated || 'questions';
      toast({
        title: "JSON Upload Successful",
        description: `Successfully uploaded ${questionsCount} from JSON file.`,
      });

      // Reset JSON form
      resetJsonForm();
    } catch (error: any) {
      console.error("Error uploading JSON:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to upload JSON. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  // Reset JSON form
  const resetJsonForm = () => {
    jsonForm.reset({
      subject: "",
      chapter: "",
    });
    setSelectedJsonFile(null);
    setJsonChapters([]);
  }

  const onPdfSubmit = async (data: PDFUploadFormValues) => {
    if (!selectedPdfFile) {
      toast({
        title: "Error",
        description: "Please select a PDF file to upload.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      console.log("PDF form data:", data, "Chemical extraction:", useChemicalExtraction);

      // Submit to appropriate bulk upload API based on extraction type
      const result = useChemicalExtraction
        ? await bulkUploadChemicalQuestionsPDF(
            selectedPdfFile,
            data.subject,
            data.chapter || undefined,
            data.aiProvider
          )
        : await bulkUploadQuestionsPDF(
            selectedPdfFile,
            data.subject,
            data.chapter || undefined,
            data.aiProvider
          );

      // Display success toast with extraction type info
      const extractionType = useChemicalExtraction ? "chemical questions with molecular structures" : "questions";
      const questionsCount = result.questionsAdded || result.questionsCreated || 'questions';

      toast({
        title: "PDF Upload Successful",
        description: `Successfully uploaded ${questionsCount} ${extractionType} from PDF.`,
      });

      // Reset PDF form
      resetPdfForm();

    } catch (error: any) {
      console.error("Error uploading PDF:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to upload PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  // Reset manual form
  const resetManualForm = () => {
    manualForm.reset({
      subject: "",
      chapter: "",
      questionText: "",
      optionA: "",
      optionB: "",
      optionC: "",
      optionD: "",
      correctAnswer: "" as any,
      explanation: "",
      difficulty: "" as any,
    });
    setQuestionImage(null);
    setOptionImages({
      A: null,
      B: null,
      C: null,
      D: null,
    });
    setManualChapters([]);
    setOptionValidationErrors({
      A: false,
      B: false,
      C: false,
      D: false
    });
  }

  // Reset PDF form
  const resetPdfForm = () => {
    pdfForm.reset({
      subject: "",
      chapter: "",
      aiProvider: "gemini" as const,
    });
    setSelectedPdfFile(null);
    setPdfChapters([]);
  }

  // Handle PDF file selection
  const handlePdfFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        toast({
          title: "Invalid File Type",
          description: "Please select a PDF file.",
          variant: "destructive",
        });
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        toast({
          title: "File Too Large",
          description: "File size must be less than 50MB.",
          variant: "destructive",
        });
        return;
      }
      setSelectedPdfFile(file);
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Add Questions</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="manual" className="flex items-center gap-2">
              <Edit className="h-4 w-4" />
              Manual Entry
            </TabsTrigger>
            <TabsTrigger value="pdf" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Upload PDF
            </TabsTrigger>
            <TabsTrigger value="json" className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              Upload JSON
            </TabsTrigger>
          </TabsList>

          {/* Manual Entry Tab */}
          <TabsContent value="manual" className="space-y-6">
            <Form {...manualForm}>
              <form onSubmit={manualForm.handleSubmit(onManualSubmit)} className="space-y-8">
                {/* Subject and Topic Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={manualForm.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subject *</FormLabel>
                        <Select onValueChange={handleManualSubjectChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={loading ? "Loading subjects..." : "Select a subject"} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {loading ? (
                              <SelectItem value="loading" disabled>
                                Loading subjects...
                              </SelectItem>
                            ) : (
                              subjects.map((subject) => (
                                <SelectItem key={subject._id} value={subject._id}>
                                  {subject.name}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={manualForm.control}
                    name="chapter"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Chapter *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} disabled={manualChapters.length === 0}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue
                                placeholder={
                                  loading
                                    ? "Loading chapters..."
                                    : manualChapters.length > 0
                                      ? "Select a chapter"
                                      : "Select a subject first"
                                }
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {manualChapters.map((chapter) => (
                              <SelectItem key={chapter._id} value={chapter._id}>
                                {chapter.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Question Input */}
                <div className="space-y-4">
                  <FormField
                    control={manualForm.control}
                    name="questionText"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Question Text *</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Enter your question here..." className="min-h-[100px]" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Question Image Upload */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">Question Image (Optional)</label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Upload an image to accompany your question</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>

                    <div className="flex items-center gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-9"
                        onClick={() => questionImageRef.current?.click()}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Image
                      </Button>
                      <input
                        type="file"
                        ref={questionImageRef}
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, "question")}
                      />

                      {questionImage && (
                        <div className="relative">
                          <Image
                            src={questionImage || "/placeholder.svg"}
                            alt="Question image"
                            width={100}
                            height={100}
                            className="object-cover rounded-md border h-[100px] w-[100px]"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="h-6 w-6 absolute -top-2 -right-2 rounded-full"
                            onClick={() => removeImage("question")}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Answer Options */}
                <div className="space-y-6">
                  <h3 className="text-lg font-medium">Answer Options</h3>

                  {["A", "B", "C", "D"].map((option) => (
                    <div
                      key={option}
                      className="grid grid-cols-1 md:grid-cols-[1fr,auto] gap-4 items-start border-b pb-4 last:border-0"
                    >
                      <FormField
                        control={manualForm.control}
                        name={`option${option}` as "optionA" | "optionB" | "optionC" | "optionD"}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Option {option}
                              {optionImages[option] && (
                                <span className="text-sm text-green-600 ml-2">(Image uploaded)</span>
                              )}
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder={
                                  optionImages[option]
                                    ? `Option ${option} text (optional - image uploaded)`
                                    : `Enter option ${option} text or upload an image...`
                                }
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                            {optionValidationErrors[option] && (
                              <p className="text-sm text-red-600">
                                Option {option} requires either text or an image
                              </p>
                            )}
                          </FormItem>
                        )}
                      />

                      {/* Option Image Upload */}
                      <div className="space-y-2 mt-8 md:mt-0">
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-9 text-xs"
                            onClick={() => optionImageRefs[option as keyof typeof optionImageRefs].current?.click()}
                          >
                            <Upload className="h-3 w-3 mr-1" />
                            Image
                          </Button>
                          <input
                            type="file"
                            ref={optionImageRefs[option as keyof typeof optionImageRefs]}
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, option)}
                          />

                          {optionImages[option] && (
                            <div className="relative">
                              <Image
                                src={optionImages[option]! || "/placeholder.svg"}
                                alt={`Option ${option} image`}
                                width={60}
                                height={60}
                                className="object-cover rounded-md border h-[60px] w-[60px]"
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="h-5 w-5 absolute -top-2 -right-2 rounded-full"
                                onClick={() => removeImage(option)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Correct Answer */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={manualForm.control}
                    name="correctAnswer"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>Correct Answer *</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            value={field.value || ""}
                            className="flex space-x-4"
                          >
                            {["A", "B", "C", "D"].map((option) => (
                              <FormItem key={option} className="flex items-center space-x-1">
                                <FormControl>
                                  <RadioGroupItem value={option} id={`manual-option-${option}`} />
                                </FormControl>
                                <FormLabel className="font-normal" htmlFor={`manual-option-${option}`}>
                                  {option}
                                </FormLabel>
                              </FormItem>
                            ))}
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={manualForm.control}
                    name="difficulty"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>Difficulty Level *</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            value={field.value || ""}
                            className="flex space-x-4"
                          >
                            {["Easy", "Medium", "Hard"].map((level) => (
                              <FormItem key={level} className="flex items-center space-x-1">
                                <FormControl>
                                  <RadioGroupItem value={level} id={`manual-level-${level}`} />
                                </FormControl>
                                <FormLabel className="font-normal" htmlFor={`manual-level-${level}`}>
                                  {level}
                                </FormLabel>
                              </FormItem>
                            ))}
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Explanation */}
                <FormField
                  control={manualForm.control}
                  name="explanation"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center gap-2">
                        <FormLabel>Explanation (Optional)</FormLabel>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-4 w-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Provide an explanation for the correct answer</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <FormControl>
                        <Textarea
                          placeholder="Explain why the correct answer is right..."
                          className="min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>This will be shown to students after they answer the question.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Submit and Reset Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Button type="submit" className="w-full bg-[#05603A] hover:bg-[#04502F] sm:w-auto" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Adding Question...
                      </>
                    ) : (
                      "Add Question"
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full sm:w-auto"
                    onClick={resetManualForm}
                    disabled={isSubmitting}
                  >
                    Reset Form
                  </Button>
                </div>
              </form>
            </Form>
          </TabsContent>

          {/* PDF Upload Tab */}
          <TabsContent value="pdf" className="space-y-6">
            <Form {...pdfForm}>
              <form onSubmit={pdfForm.handleSubmit(onPdfSubmit)} className="space-y-8">
                {/* Subject and Chapter Selection for PDF */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={pdfForm.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subject *</FormLabel>
                        <Select onValueChange={handlePdfSubjectChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={loading ? "Loading subjects..." : "Select a subject"} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {loading ? (
                              <SelectItem value="loading" disabled>
                                Loading subjects...
                              </SelectItem>
                            ) : (
                              subjects.map((subject) => (
                                <SelectItem key={subject._id} value={subject._id}>
                                  {subject.name}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={pdfForm.control}
                    name="chapter"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Chapter (Optional)</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} disabled={pdfChapters.length === 0}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue
                                placeholder={
                                  loading
                                    ? "Loading chapters..."
                                    : pdfChapters.length > 0
                                      ? "Select a chapter (optional)"
                                      : "Select a subject first"
                                }
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {pdfChapters.map((chapter) => (
                              <SelectItem key={chapter._id} value={chapter._id}>
                                {chapter.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* AI Provider Selection */}
                  <FormField
                    control={pdfForm.control}
                    name="aiProvider"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>AI Provider</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select AI provider" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="gemini">
                              <div className="flex items-center gap-2">
                                <span>🤖</span>
                                <span>Gemini (Recommended)</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="mistral">
                              <div className="flex items-center gap-2">
                                <span>⚡</span>
                                <span>Mistral</span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Choose the AI provider for question extraction. Gemini is recommended for better accuracy.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* PDF File Upload */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <FormLabel>PDF File *</FormLabel>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Upload a PDF file containing questions to be extracted and added to the question bank</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>

                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                    <div className="text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="mt-4">
                        <label htmlFor="pdf-upload" className="cursor-pointer">
                          <span className="mt-2 block text-sm font-medium text-gray-900">
                            {selectedPdfFile ? selectedPdfFile.name : "Choose PDF file or drag and drop"}
                          </span>
                          <span className="mt-1 block text-xs text-gray-500">
                            PDF up to 50MB
                          </span>
                        </label>
                        <input
                          id="pdf-upload"
                          type="file"
                          className="sr-only"
                          accept=".pdf"
                          onChange={handlePdfFileChange}
                        />

          {/* JSON Upload Tab */}
          <TabsContent value="json" className="space-y-6">
            <Form {...jsonForm}>
              <form onSubmit={jsonForm.handleSubmit(onJsonSubmit)} className="space-y-8">
                {/* Subject and Chapter Selection for JSON */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={jsonForm.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subject *</FormLabel>
                        <Select onValueChange={handleJsonSubjectChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={loading ? "Loading subjects..." : "Select a subject"} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {loading ? (
                              <SelectItem value="loading" disabled>
                                Loading subjects...
                              </SelectItem>
                            ) : (
                              subjects.map((subject) => (
                                <SelectItem key={subject._id} value={subject._id}>
                                  {subject.name}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={jsonForm.control}
                    name="chapter"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Chapter (Optional)</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} disabled={jsonChapters.length === 0}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue
                                placeholder={
                                  loading
                                    ? "Loading chapters..."
                                    : jsonChapters.length > 0
                                      ? "Select a chapter (optional)"
                                      : "Select a subject first"
                                }
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {jsonChapters.map((chapter) => (
                              <SelectItem key={chapter._id} value={chapter._id}>
                                {chapter.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* JSON File Upload */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <FormLabel>JSON File *</FormLabel>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Upload a JSON file with an array of questions or an object with data/questions array</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>

                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                    <div className="text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="mt-4">
                        <label htmlFor="json-upload" className="cursor-pointer">
                          <span className="mt-2 block text-sm font-medium text-gray-900">
                            {selectedJsonFile ? selectedJsonFile.name : "Choose JSON file or drag and drop"}
                          </span>
                          <span className="mt-1 block text-xs text-gray-500">
                            JSON format
                          </span>
                        </label>
                        <input
                          id="json-upload"
                          type="file"
                          className="sr-only"
                          accept=".json,application/json"
                          onChange={handleJsonFileChange}
                        />
                      </div>
                      <div className="mt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => document.getElementById('json-upload')?.click()}
                        >
                          Select JSON File
                        </Button>
                      </div>
                    </div>
                  </div>

                  {selectedJsonFile && (
                    <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-md">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-green-800">{selectedJsonFile.name}</span>
                        <span className="text-xs text-green-600">
                          ({(selectedJsonFile.size / 1024).toFixed(2)} KB)
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedJsonFile(null)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>

                {/* Submit and Reset Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Button
                    type="submit"
                    className="w-full bg-[#05603A] hover:bg-[#04502F] sm:w-auto"
                    disabled={isSubmitting || !selectedJsonFile}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading JSON...
                      </>
                    ) : (
                      "Upload JSON"
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full sm:w-auto"
                    onClick={resetJsonForm}
                    disabled={isSubmitting}
                  >
                    Reset Form
                  </Button>
                </div>
              </form>
            </Form>
          </TabsContent>


                      </div>
                      <div className="mt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => document.getElementById('pdf-upload')?.click()}
                        >
                          Select PDF File
                        </Button>
                      </div>
                    </div>
                  </div>

                  {selectedPdfFile && (
                    <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-md">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-green-800">{selectedPdfFile.name}</span>
                        <span className="text-xs text-green-600">
                          ({(selectedPdfFile.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedPdfFile(null)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>

                {/* Chemical Extraction Toggle */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="chemical-extraction"
                      checked={useChemicalExtraction}
                      onChange={(e) => setUseChemicalExtraction(e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="chemical-extraction" className="text-sm font-medium text-gray-700">
                      Use Chemical Extraction (for Chemistry PDFs with molecular structures)
                    </label>
                  </div>

                  {useChemicalExtraction && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                      <div className="flex items-start gap-2">
                        <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div className="text-xs text-blue-800">
                          <p className="font-medium mb-1">Chemical Extraction Mode</p>
                          <p>This mode is optimized for chemistry PDFs containing:</p>
                          <ul className="list-disc list-inside mt-1 space-y-0.5">
                            <li>Molecular structures and chemical diagrams</li>
                            <li>Chemical equations and formulas</li>
                            <li>Reaction mechanisms</li>
                            <li>Complex chemical images</li>
                          </ul>
                          <p className="mt-2 text-blue-700">Processing may take longer but provides better accuracy for chemical content.</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Submit and Reset Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Button
                    type="submit"
                    className="w-full bg-[#05603A] hover:bg-[#04502F] sm:w-auto"
                    disabled={isSubmitting || !selectedPdfFile}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading PDF...
                      </>
                    ) : (
                      "Upload PDF"
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full sm:w-auto"
                    onClick={resetPdfForm}
                    disabled={isSubmitting}
                  >
                    Reset Form
                  </Button>
                </div>
              </form>
            </Form>
          </TabsContent>

          {/* JSON Upload Tab (sibling of Manual/PDF) */}
          <TabsContent value="json" className="space-y-6">
            <Form {...jsonForm}>
              <form onSubmit={jsonForm.handleSubmit(onJsonSubmit)} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={jsonForm.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subject *</FormLabel>
                        <Select onValueChange={handleJsonSubjectChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={loading ? "Loading subjects..." : "Select a subject"} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {loading ? (
                              <SelectItem value="loading" disabled>
                                Loading subjects...
                              </SelectItem>
                            ) : (
                              subjects.map((subject) => (
                                <SelectItem key={subject._id} value={subject._id}>
                                  {subject.name}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={jsonForm.control}
                    name="chapter"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Chapter (Optional)</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} disabled={jsonChapters.length === 0}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue
                                placeholder={
                                  loading
                                    ? "Loading chapters..."
                                    : jsonChapters.length > 0
                                      ? "Select a chapter (optional)"
                                      : "Select a subject first"
                                }
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {jsonChapters.map((chapter) => (
                              <SelectItem key={chapter._id} value={chapter._id}>
                                {chapter.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <FormLabel>JSON File *</FormLabel>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Upload a JSON file with an array of questions or an object with data/questions array</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>

                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                    <div className="text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="mt-4">
                        <label htmlFor="json-upload-main" className="cursor-pointer">
                          <span className="mt-2 block text-sm font-medium text-gray-900">
                            {selectedJsonFile ? selectedJsonFile.name : "Choose JSON file or drag and drop"}
                          </span>
                          <span className="mt-1 block text-xs text-gray-500">JSON format</span>
                        </label>
                        <input
                          id="json-upload-main"
                          type="file"
                          className="sr-only"
                          accept=".json,application/json"
                          onChange={handleJsonFileChange}
                        />
                      </div>
                      <div className="mt-4">
                        <Button type="button" variant="outline" onClick={() => document.getElementById('json-upload-main')?.click()}>
                          Select JSON File
                        </Button>
                      </div>
                    </div>
                  </div>

                  {selectedJsonFile && (
                    <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-md">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-green-800">{selectedJsonFile.name}</span>
                        <span className="text-xs text-green-600">({(selectedJsonFile.size / 1024).toFixed(2)} KB)</span>
                      </div>
                      <Button type="button" variant="ghost" size="sm" onClick={() => setSelectedJsonFile(null)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Button type="submit" className="w-full bg-[#05603A] hover:bg-[#04502F] sm:w-auto" disabled={isSubmitting || !selectedJsonFile}>
                    {isSubmitting ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Uploading JSON...</>) : ("Upload JSON")}
                  </Button>
                  <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={resetJsonForm} disabled={isSubmitting}>
                    Reset Form
                  </Button>
                </div>
              </form>
            </Form>
          </TabsContent>

        </Tabs>
      </CardContent>
    </Card>
  )
}
