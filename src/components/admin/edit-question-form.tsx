"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { X, Upload, Info, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { toast } from "@/components/ui/use-toast"
import { getSubjectsWithChaptersAndTopics } from "@/lib/api/subjects"
import { updateQuestion, QuestionData } from "@/lib/api/questions"
import { ApiQuestion } from "@/types/question"
import { isBase64Image, ensureDataUrl } from "@/utils/imageUtils"

// Define interfaces for API data
interface Topic { _id: string; name: string }
interface ChapterExt { _id: string; name: string; topics?: Topic[] }
interface SubjectFull { _id: string; name: string; chapters: ChapterExt[] }
interface ChapterOrTopic { _id: string; name: string }

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB
const ACCEPTED_FILE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/svg+xml"]

// Form schema with custom validation for options
const formSchema = z.object({
  subject: z.string().min(1, { message: "Please select a subject" }),
  topic: z.string().min(1, { message: "Please select a chapter" }),
  questionText: z.string().min(5, { message: "Question must be at least 5 characters" }),
  optionA: z.string().optional(),
  optionB: z.string().optional(),
  optionC: z.string().optional(),
  optionD: z.string().optional(),
  correctAnswer: z.enum(["A", "B", "C", "D"], {
    required_error: "Please select the correct answer",
  }),
  difficulty: z.enum(["Easy", "Medium", "Hard"], {
    required_error: "Please select a difficulty level",
  }),
  // Single solution text (optional)
  solutionText: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface EditQuestionFormProps {
  questionData: ApiQuestion;
  questionId: string;
}

export default function EditQuestionForm({ questionData, questionId }: EditQuestionFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [questionImage, setQuestionImage] = useState<string | null>(null)
  const [optionImages, setOptionImages] = useState<{ [key: string]: string | null }>({
    A: null,
    B: null,
    C: null,
    D: null,
  })
  const [subjects, setSubjects] = useState<SubjectFull[]>([])
  const [chapters, setChapters] = useState<ChapterOrTopic[]>([])
  const [idKindMap, setIdKindMap] = useState<Record<string, 'chapter' | 'topic'>>({})
  const [loading, setLoading] = useState(true)
  const [optionValidationErrors, setOptionValidationErrors] = useState<{[key: string]: boolean}>({
    A: false,
    B: false,
    C: false,
    D: false
  })
  const searchParams = new URLSearchParams(window.location.search);
const returnPage = searchParams.get("page") || "1";
const returnPageSize = searchParams.get("pageSize") || "10";

  // Refs for file inputs
  const questionImageRef = useRef<HTMLInputElement>(null)
  const optionImageRefs = {
    A: useRef<HTMLInputElement>(null),
    B: useRef<HTMLInputElement>(null),
    C: useRef<HTMLInputElement>(null),
    D: useRef<HTMLInputElement>(null),
  }

  // Initialize form with question data
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      subject: "",
      topic: "",
      questionText: "",
      optionA: "",
      optionB: "",
      optionC: "",
      optionD: "",
      correctAnswer: "" as any,
      difficulty: "" as any,
      solutionText: "",
    },
  })

  // Parse existing question data and populate form
  useEffect(() => {
    if (questionData && subjects.length > 0) {
      // Parse options from the question data
      const parseOptions = () => {
        if (!questionData.options || questionData.options.length === 0) return ["", "", "", ""];
        
        if (typeof questionData.options[0] === 'string') {
          if (questionData.options.length === 1 && questionData.options[0].includes(',')) {
            // Single comma-separated string
            const optionTexts = questionData.options[0].split(',');
            return optionTexts.map(text => text.trim()).concat(Array(4 - optionTexts.length).fill("")).slice(0, 4);
          } else {
            // Array of individual strings
            return questionData.options.concat(Array(4 - questionData.options.length).fill("")).slice(0, 4);
          }
        }
        return ["", "", "", ""];
      };

      const parsedOptions = parseOptions();
      const newOptionImages: { A: string | null, B: string | null, C: string | null, D: string | null } = { A: null, B: null, C: null, D: null };
      
      // Check for base64 images in options and extract them
      parsedOptions.forEach((option, index) => {
        const optionKey = String.fromCharCode(65 + index); // A, B, C, D
        if (typeof option === 'string' && isBase64Image(option)) {
          newOptionImages[optionKey as keyof typeof newOptionImages] = ensureDataUrl(option);
          parsedOptions[index] = ""; // Clear text since it's an image
        }
      });

      setOptionImages(newOptionImages);

      // Find correct answer letter
      const answerIndex = questionData.options?.findIndex(opt => opt === questionData.answer) ?? -1;
      const correctAnswerLetter = answerIndex >= 0 ? String.fromCharCode(65 + answerIndex) : "A";

      // Prefer topicId; if missing, fall back to chapterId (for backward compatibility)
      let preselectId = "";
      if (questionData.topicId) {
        preselectId = typeof questionData.topicId === 'string' ? (questionData.topicId as any) : (questionData.topicId as any)._id;
      } else if ((questionData as any).chapterId) {
        preselectId = typeof (questionData as any).chapterId === 'string' ? (questionData as any).chapterId : (questionData as any).chapterId._id;
      }

      console.log("Question data:", questionData);
      console.log("Topic/Chapter preselect:", preselectId);
      console.log("Available subjects:", subjects);

      // Set chapters/topics for the selected subject FIRST
      const selectedSubject = subjects.find(s => s._id === questionData.subjectId._id);
      console.log("Selected subject:", selectedSubject);

      if (selectedSubject) {
        const combined: ChapterOrTopic[] = [];
        const map: Record<string, 'chapter' | 'topic'> = {};
        const seen = new Set<string>();
        (selectedSubject.chapters || []).forEach((ch) => {
          if (ch && ch._id && !seen.has(ch._id)) {
            combined.push({ _id: ch._id, name: ch.name || 'Chapter' });
            map[ch._id] = 'chapter';
            seen.add(ch._id);
          }
          (ch?.topics || []).forEach((t) => {
            if (t && t._id && !seen.has(t._id)) {
              const prefix = ch?.name ? ch.name + ' - ' : '';
              combined.push({ _id: t._id, name: `${prefix}${t.name || 'Topic'}` });
              map[t._id] = 'topic';
              seen.add(t._id);
            }
          });
        });
        setChapters(combined);
        setIdKindMap(map);
        console.log("Set chapter/topic options:", combined.length);

        // If preselect is a chapter without topic, try defaulting to first topic under that chapter
        if (!preselectId && (questionData as any).chapterId) {
          const chapId = typeof (questionData as any).chapterId === 'string' ? (questionData as any).chapterId : (questionData as any).chapterId._id;
          const chapter = (selectedSubject.chapters || []).find((c) => c._id === chapId);
          const firstTopic = chapter && (chapter.topics || [])[0];
          if (firstTopic) {
            preselectId = firstTopic._id;
          } else {
            // No topics under this chapter; preselect the chapter itself
            preselectId = chapId;
          }
        }

        // If we have a preselect, ensure it exists in the current map (topics or chapters); otherwise clear
        if (preselectId && !map[preselectId]) {
          preselectId = "";
        }
      }

      // Ensure the preselect exists in current chapters; otherwise clear it
      if (selectedSubject && preselectId) {
        const exists = (selectedSubject.chapters || []).some((c: any) => c._id === preselectId);
        if (!exists) preselectId = "";
      }

      // Prepare single solution text from existing data
      const sol: any = (questionData as any).solution || null;
      let solutionText = "";
      if (typeof sol === 'string') {
        solutionText = sol;
      } else if (sol) {
        const parts: string[] = [];
        if (sol.methodology) parts.push(String(sol.methodology));
        if (Array.isArray(sol.steps) && sol.steps.length) parts.push((sol.steps as string[]).join("\n"));
        if (sol.final_explanation) parts.push(String(sol.final_explanation));
        if (Array.isArray(sol.key_concepts) && sol.key_concepts.length) parts.push(`Key concepts: ${sol.key_concepts.join(', ')}`);
        solutionText = parts.join("\n\n");
      }

      // Set form values AFTER chapters are set
      form.reset({
        subject: questionData.subjectId._id,
        topic: preselectId,
        questionText: questionData.content,
        optionA: parsedOptions[0] || "",
        optionB: parsedOptions[1] || "",
        optionC: parsedOptions[2] || "",
        optionD: parsedOptions[3] || "",
        correctAnswer: correctAnswerLetter as "A" | "B" | "C" | "D",
        // explanation removed; using solutionText instead
        difficulty: (questionData.difficulty.charAt(0).toUpperCase() + questionData.difficulty.slice(1)) as "Easy" | "Medium" | "Hard",
        solutionText,
      });

      console.log("Form reset with topic/chapter:", preselectId);
    }
  }, [questionData, subjects, form]);

  // Ensure topic is set after chapters are populated
  useEffect(() => {
    if (!questionData) return;
    const currentTopic = form.getValues("topic");
    const hasCurrent = currentTopic && chapters.some(c => c._id === currentTopic);
    if (hasCurrent) return;

    // Recompute preferred id
    let preferred = "";
    if (questionData.topicId) {
      preferred = typeof (questionData as any).topicId === 'string' ? (questionData as any).topicId : (questionData as any).topicId._id;
    } else if ((questionData as any).chapterId) {
      const chapId = typeof (questionData as any).chapterId === 'string' ? (questionData as any).chapterId : (questionData as any).chapterId._id;
      // If chapter exists in chapters list, try to find a topic under it using subjects data
      const subj = subjects.find(s => s._id === (questionData as any).subjectId._id);
      const chapter = subj?.chapters?.find(ch => ch._id === chapId);
      const firstTopic = chapter?.topics && chapter.topics[0];
      preferred = firstTopic ? firstTopic._id : chapId;
    }

    if (preferred && chapters.some(c => c._id === preferred)) {
      form.setValue("topic", preferred, { shouldDirty: false, shouldTouch: false });
    }
  }, [chapters, questionData, subjects, form]);

  // Fetch subjects (with chapters and topics) from API
  useEffect(() => {
    const fetchSubjectsAndChapters = async () => {
      try {
        setLoading(true)
        const data = await getSubjectsWithChaptersAndTopics()
        setSubjects(data)
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

  // Handle subject change to update chapters/topics
  const handleSubjectChange = (value: string) => {
    form.setValue("subject", value)
    form.setValue("topic", "")

    // Find the selected subject and set its combined chapter/topic list
    const selectedSubject = subjects.find(subject => subject._id === value)
    if (selectedSubject) {
      const combined: ChapterOrTopic[] = []
      const map: Record<string, 'chapter' | 'topic'> = {}
      const seen = new Set<string>()
      ;(selectedSubject.chapters || []).forEach((ch) => {
        if (ch && ch._id && !seen.has(ch._id)) {
          combined.push({ _id: ch._id, name: ch.name || 'Chapter' })
          map[ch._id] = 'chapter'
          seen.add(ch._id)
        }
        ;(ch?.topics || []).forEach((t) => {
          if (t && t._id && !seen.has(t._id)) {
            const prefix = ch?.name ? ch.name + ' - ' : ''
            combined.push({ _id: t._id, name: `${prefix}${t.name || 'Topic'}` })
            map[t._id] = 'topic'
            seen.add(t._id)
          }
        })
      })
      setChapters(combined)
      setIdKindMap(map)
    } else {
      setChapters([])
      setIdKindMap({})
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
      form.clearErrors(`option${type}` as keyof FormValues);
      // Update validation state
      setOptionValidationErrors(prev => ({
        ...prev,
        [type]: false
      }));
    }
  }

  // Custom validation function
  const validateOptions = (formData: FormValues) => {
    const errors: string[] = [];
    const validationState: {[key: string]: boolean} = {};
    const options = ['A', 'B', 'C', 'D'];
    
    for (const option of options) {
      const hasText = formData[`option${option}` as keyof FormValues] && 
                     (formData[`option${option}` as keyof FormValues] as string).trim() !== '';
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

  // Handle form submission
  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    
    try {
      console.log("Form data:", data);
      
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
      // Use image base64 if no text, otherwise use text
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
      
      // Create base question data
      const baseQuestionData: QuestionData = {
        content: data.questionText,
        options,
        answer,
        subjectId: data.subject,
        difficulty,
        type: "multiple-choice"
      };

      // Set specific target based on selected id kind
      const selectedKind = idKindMap[data.topic]
      if (selectedKind === 'topic') {
        (baseQuestionData as any).topicId = data.topic
      } else if (selectedKind === 'chapter') {
        // Map to the first topic under this chapter when submitting
        const subj = subjects.find(s => s._id === data.subject)
        const chapter = subj?.chapters?.find(ch => ch._id === data.topic)
        const firstTopic = chapter?.topics && chapter.topics[0]
        if (firstTopic) {
          (baseQuestionData as any).topicId = firstTopic._id
        } else {
          // No topics under the chapter; omit topicId (backend allows optional)
        }
      } else {
        // Fallback assume topic
        (baseQuestionData as any).topicId = data.topic
      }
      // Backend compatibility: map Solution text to 'explanation' field (omit 'solution' to avoid 400)
      if ((data as any).solutionText && (data as any).solutionText.trim() !== "") {
        (baseQuestionData as any).explanation = (data as any).solutionText.trim();
      }
      
      const questionData = baseQuestionData;
      
      console.log("Prepared question data:", questionData);
      
      // The backend expects images embedded as base64 in options, not as separate files
      console.log("Updating question with embedded base64 images");

      let finalQuestionData = { ...questionData };

      // If question has an image, embed it in the question text as base64
      if (questionImage) {
        finalQuestionData.content = `${questionData.content}\n${questionImage}`;
      }

      // Submit to API using JSON (the options already contain base64 images where needed)
      await updateQuestion(questionId, finalQuestionData);
      
      // Display success toast
      toast({
        title: "Question Updated",
        description: "Your question has been successfully updated.",
      });
      
      // Redirect back to question bank
      router.push(`/admin/question-bank?page=${returnPage}&pageSize=${returnPageSize}#${questionId}`);
      
    } catch (error: any) {
      console.error("Error updating question:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update question. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  // Cancel and go back
  const handleCancel = () => {
    router.push(`/admin/question-bank?page=${returnPage}&pageSize=${returnPageSize}#${questionId}`);
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Subject and Chapter Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subject *</FormLabel>
                      <Select onValueChange={handleSubjectChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a subject" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {subjects.map((subject) => (
                            <SelectItem key={subject._id} value={subject._id}>
                              {subject.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="topic"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Chapter *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} disabled={chapters.length === 0}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={chapters.length === 0 ? "Select a subject first" : "Select a chapter"} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {chapters.map((chapter, idx) => (
                            <SelectItem key={`${chapter._id || 'item'}-${idx}`} value={chapter._id}>
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

              {/* Question Text */}
              <FormField
                control={form.control}
                name="questionText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Question Text *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter your question here..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Question Image Upload */}
              <div className="space-y-2">
                <FormLabel>Question Image (Optional)</FormLabel>
                <div className="flex items-center gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => questionImageRef.current?.click()}
                    className="flex items-center gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    Upload Image
                  </Button>
                  <input
                    ref={questionImageRef}
                    type="file"
                    accept={ACCEPTED_FILE_TYPES.join(",")}
                    onChange={(e) => handleImageUpload(e, "question")}
                    className="hidden"
                  />
                  {questionImage && (
                    <div className="relative">
                      <Image
                        src={questionImage}
                        alt="Question"
                        width={100}
                        height={100}
                        className="rounded-md object-cover"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6"
                        onClick={() => removeImage("question")}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Options */}
              <div className="space-y-4">
                <FormLabel>Answer Options *</FormLabel>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {["A", "B", "C", "D"].map((option) => (
                    <div key={option} className="space-y-2">
                      <FormField
                        control={form.control}
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
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => optionImageRefs[option as keyof typeof optionImageRefs]?.current?.click()}
                          className="flex items-center gap-1"
                        >
                          <Upload className="h-3 w-3" />
                          Image
                        </Button>
                        <input
                          ref={optionImageRefs[option as keyof typeof optionImageRefs]}
                          type="file"
                          accept={ACCEPTED_FILE_TYPES.join(",")}
                          onChange={(e) => handleImageUpload(e, option)}
                          className="hidden"
                        />
                        {optionImages[option] && (
                          <div className="relative">
                            <Image
                              src={optionImages[option]!}
                              alt={`Option ${option}`}
                              width={60}
                              height={60}
                              className="rounded-md object-cover"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute -top-1 -right-1 h-4 w-4"
                              onClick={() => removeImage(option)}
                            >
                              <X className="h-2 w-2" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Correct Answer */}
              <FormField
                control={form.control}
                name="correctAnswer"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Correct Answer *</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="flex flex-row space-x-6"
                      >
                        {["A", "B", "C", "D"].map((option) => (
                          <div key={option} className="flex items-center space-x-2">
                            <RadioGroupItem value={option} id={option} />
                            <FormLabel htmlFor={option}>Option {option}</FormLabel>
                          </div>
                        ))}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Difficulty */}
              <FormField
                control={form.control}
                name="difficulty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Difficulty Level *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select difficulty level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Easy">Easy</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Solution (Optional) */}
              <FormField
                control={form.control}
                name="solutionText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Solution (Optional)
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="inline h-4 w-4 ml-1 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Enter the full solution text to show in Question Bank</p>
                        </TooltipContent>
                      </Tooltip>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter the solution text..."
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Submit Buttons */}
              <div className="flex justify-end space-x-4 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Question"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </TooltipProvider>
  )
}
