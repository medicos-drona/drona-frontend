import React, { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit, Trash2, ChevronDown, ChevronUp, BookOpen } from "lucide-react"
import { FormattedQuestion } from "@/types/question"
import { TextWithImages } from "@/components/ui/text-with-images"
import { Base64Image } from "@/components/ui/base64-image"
import { ChemicalImageDisplay, ChemicalOptionDisplay } from "@/components/ui/chemical-image-display"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { deleteQuestion } from "@/lib/api/questions"
import { isApiSuccess } from '@/lib/utils/errorHandler';
import { toast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

interface QuestionListProps {
  questions: FormattedQuestion[];
  onDifficultyChange: (questionId: string, difficulty: string) => void;
  onReviewStatusChange: (questionId: string, reviewStatus: string) => void;
  onQuestionDeleted?: (questionId: string) => void; // Callback to refresh the list after deletion
}

export default function QuestionList({ questions, onDifficultyChange, onReviewStatusChange, onQuestionDeleted }: QuestionListProps) {
  const router = useRouter()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [questionToDelete, setQuestionToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [expandedSolutions, setExpandedSolutions] = useState<Set<string>>(new Set())

  // Toggle solution expansion
  const toggleSolution = (questionId: string) => {
    setExpandedSolutions(prev => {
      const newSet = new Set(prev)
      if (newSet.has(questionId)) {
        newSet.delete(questionId)
      } else {
        newSet.add(questionId)
      }
      return newSet
    })
  }



  // Handle delete button click
  const handleDelete = (questionId: string) => {
    setQuestionToDelete(questionId)
    setIsDeleteDialogOpen(true)
  }

  // Handle edit button click
  // const handleEdit = (questionId: string) => {
  //   router.push(`/admin/edit-question/${questionId}`)
  // }
const handleEdit = (questionId: string) => {
  // Get current page and pageSize from the URL of the CURRENT page (question-bank)
  const currentUrlParams = new URLSearchParams(window.location.search);
  const currentPage = currentUrlParams.get("page") || "1";
  const currentPageSize = currentUrlParams.get("pageSize") || "10"; // Default to 10 if not found

  // Navigate to edit page, including both page and pageSize in the URL
  router.push(`/admin/edit-question/${questionId}?page=${currentPage}&pageSize=${currentPageSize}`);
};

  // Confirm delete action
  const confirmDelete = async () => {
    if (!questionToDelete) return

    try {
      setIsDeleting(true)
      const response = await deleteQuestion(questionToDelete)

      if (isApiSuccess(response)) {
        // Success toast is already shown by the API function
        if (onQuestionDeleted) {
          onQuestionDeleted(questionToDelete) // Refresh the list with the deleted question ID
        }
      }
      // Error case is already handled by the API function (toast shown)
    } catch (error: any) {
      // Fallback error handling for unexpected errors
      console.error("Unexpected error deleting question:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsDeleting(false)
      setIsDeleteDialogOpen(false)
      setQuestionToDelete(null)
    }
  }

  // Normalize and check if an option is the correct answer
  const isOptionCorrect = (option: { label: string; text: string }, q: FormattedQuestion) => {
    const ans = (q.correctAnswer || '').trim()
    const optText = (option.text || '').trim()
    if (!ans) return false
    // Match by text
    if (optText && optText === ans) return true
    // Match by letter (A/B/C/D vs a/b/c/d)
    const label = (option.label || '').trim().toLowerCase()
    const ansLower = ans.trim().toLowerCase()
    return ansLower === label || ansLower === `option ${label}`
  }

  // Extract a friendly solution view supporting both string/object shapes, with fallback to explanation
  const getSolutionData = (q: any) => {
    const sol: any = q.solution
    const explanation: string | undefined = q.explanation
    if (!sol && !explanation) return { has: false } as const
    if (typeof sol === 'string') {
      return { has: true, text: sol } as const
    }
    if (!sol && explanation) {
      return { has: true, text: explanation } as const
    }
    const text = (sol && (sol.final_explanation || '')) || explanation || ''
    const methodology = sol?.methodology || ''
    const steps: string[] = Array.isArray(sol?.steps) ? sol.steps : []
    const keyConcepts: string[] = Array.isArray(sol?.key_concepts) ? sol.key_concepts : []
    const has = Boolean(text || methodology || steps.length || keyConcepts.length)
    return { has, text, methodology, steps, keyConcepts } as const
  }

  return (
    <div className="space-y-4">
      {questions.map((question) => (
        <Card key={question.id} id={question.id} className="overflow-hidden">
          <CardContent className="p-6">
            <div className="flex flex-col space-y-4">
              {/* Question header with metadata */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="font-normal">
                    {question.subject}
                  </Badge>
                  <Badge variant="outline" className="font-normal">
                    {question.chapter}
                  </Badge>
                  
                  {question.reviewStatus && (
                    <Badge 
                      className={
                        question.reviewStatus === "approved" 
                          ? "bg-green-100 text-green-800 hover:bg-green-100" 
                          : question.reviewStatus === "rejected"
                          ? "bg-red-100 text-red-800 hover:bg-red-100"
                          : "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                      }
                    >
                      {question.reviewStatus.charAt(0).toUpperCase() + question.reviewStatus.slice(1)}
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <Select
                    defaultValue={question.difficulty.toLowerCase()}
                    onValueChange={(value) => onDifficultyChange(question.id, value)}
                  >
                    <SelectTrigger className="w-[110px]">
                      <SelectValue placeholder="Difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    defaultValue={question.reviewStatus.toLowerCase()}
                    onValueChange={(value) => onReviewStatusChange(question.id, value)}
                  >
                    <SelectTrigger className="w-[110px]">
                      <SelectValue placeholder="Review Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(question.id)}
                    title="Edit question"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(question.id)}
                    title="Delete question"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {/* Question text with image support */}
              <div className="font-medium">
                {(question as any).isChemical && ((question as any).chemicalImages || (question as any).imageData) ? (
                  <ChemicalImageDisplay
                    text={question.text}
                    images={(question as any).imageData || (question as any).chemicalImages}
                    maxImageWidth={400}
                    maxImageHeight={300}
                  />
                ) : (
                  <TextWithImages
                    text={question.text}
                    maxImageWidth={400}
                    maxImageHeight={300}
                    questionImages={
                      // Convert imageUrls array to object mapping for compatibility
                      (question as any).imageUrls && Array.isArray((question as any).imageUrls)
                        ? { 'image-1': (question as any).imageUrls[0] }
                        : ((question as any).imageData || (question as any).chemicalImages)
                    }
                  />
                )}
              </div>
              
              {/* Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {question.options.map((option, index) => (
                  (question as any).isChemical && ((question as any).chemicalImages || (question as any).imageData) ? (
                    <ChemicalOptionDisplay
                      key={index}
                      option={option}
                      images={(question as any).imageData || (question as any).chemicalImages}
                      isCorrect={option.text === question.correctAnswer}
                    />
                  ) : (
                    <div
                      key={index}
                      className={`flex items-start p-3 rounded-md border ${
                        isOptionCorrect(option, question) ? "border-green-500 bg-green-50" : "border-gray-200"
                      }`}
                    >
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                        <span className="text-sm">{option.label}</span>
                      </div>
                      <div className="flex-1">
                        {option.text && !option.isImageOption && (
                          <div className="mb-2">
                            <TextWithImages
                              text={option.text}
                              maxImageWidth={200}
                              maxImageHeight={150}
                              questionImages={
                                // Convert imageUrls array to object mapping for compatibility
                                (question as any).imageUrls && Array.isArray((question as any).imageUrls)
                                  ? { 'image-1': (question as any).imageUrls[0] }
                                  : ((question as any).imageData || (question as any).chemicalImages)
                              }
                            />
                          </div>
                        )}
                        {option.imageUrl && (
                          <div className={option.isImageOption ? "" : "mt-2"}>
                            <Base64Image
                              src={option.imageUrl}
                              alt={`Option ${option.label}`}
                              maxWidth={200}
                              maxHeight={150}
                              className="border-0"
                            />
                          </div>
                        )}
                        {option.isImageOption && !option.imageUrl && (
                          <div className="text-gray-500 italic">Image option</div>
                        )}
                      </div>
                    </div>
                  )
                ))}
              </div>

              {/* Solution Section */}
              {!!question.solution && (
                <div className="border-t pt-4">
                  <Button
                    variant="ghost"
                    onClick={() => toggleSolution(question.id)}
                    className="flex items-center gap-2 p-0 h-auto font-medium text-blue-600 hover:text-blue-700"
                  >
                    <BookOpen className="h-4 w-4" />
                    Solution
                    {expandedSolutions.has(question.id) ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>

                  {expandedSolutions.has(question.id) && (() => {
                    const sol = (question as any).solution
                    // Support both string and object solution shapes
                    if (typeof sol === 'string') {
                      return (
                        <div className="mt-3 bg-blue-50 p-4 rounded-lg text-sm text-gray-700">
                          <TextWithImages text={sol} maxImageWidth={300} maxImageHeight={200} />
                        </div>
                      )
                    }
                    const methodology = sol?.methodology
                    const keyConcepts = Array.isArray(sol?.key_concepts) ? sol.key_concepts : []
                    const steps = Array.isArray(sol?.steps) ? sol.steps : []
                    const finalText = sol?.final_explanation || ''
                    return (
                      <div className="mt-3 space-y-3 bg-blue-50 p-4 rounded-lg">
                        {methodology && (
                          <div>
                            <h4 className="font-medium text-sm text-blue-800 mb-1">Methodology:</h4>
                            <p className="text-sm text-gray-700">{methodology}</p>
                          </div>
                        )}

                        {keyConcepts.length > 0 && (
                          <div>
                            <h4 className="font-medium text-sm text-blue-800 mb-1">Key Concepts:</h4>
                            <div className="flex flex-wrap gap-1">
                              {keyConcepts.map((concept: string, index: number) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {concept}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {steps.length > 0 && (
                          <div>
                            <h4 className="font-medium text-sm text-blue-800 mb-2">Solution Steps:</h4>
                            <div className="space-y-2">
                              {steps.map((step: string, index: number) => (
                                <div key={index} className="text-sm text-gray-700">
                                  <TextWithImages
                                    text={step}
                                    maxImageWidth={300}
                                    maxImageHeight={200}
                                    questionImages={(question as any).imageUrls && Array.isArray((question as any).imageUrls)
                                      ? { 'image-1': (question as any).imageUrls[0] }
                                      : ((question as any).imageData || (question as any).chemicalImages)}
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {finalText && (
                          <div>
                            <h4 className="font-medium text-sm text-blue-800 mb-1">Final Explanation:</h4>
                            <div className="text-sm text-gray-700">
                              <TextWithImages
                                text={finalText}
                                maxImageWidth={300}
                                maxImageHeight={200}
                                questionImages={(question as any).imageUrls && Array.isArray((question as any).imageUrls)
                                  ? { 'image-1': (question as any).imageUrls[0] }
                                  : ((question as any).imageData || (question as any).chemicalImages)}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })()}
                </div>
              )}


            </div>
          </CardContent>
        </Card>
      ))}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this question?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the question
              and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
