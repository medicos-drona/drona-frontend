"use client"

import { useState, useEffect } from "react"
import type { FormData, ChapterConfig } from "../question-paper-wizard"
import { StepNavigation } from "../ui/step-navigation"
import { InfoMessage } from "../ui/info-message"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Plus, Minus, Info } from "lucide-react"
import { ChapterWithQuestionCount } from "@/lib/api/chapters"

type ChapterSelectionStepProps = {
  formData: FormData
  updateFormData: (data: Partial<FormData>) => void
  onNext: () => void
  onSkip: () => void
  onBack: () => void
  backDisabled: boolean
}

export function ChapterSelectionStep({ 
  formData, 
  updateFormData, 
  onNext, 
  onSkip, 
  onBack, 
  backDisabled 
}: ChapterSelectionStepProps) {
  const [chapters, setChapters] = useState<ChapterWithQuestionCount[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedChapters, setSelectedChapters] = useState<ChapterConfig[]>([])

  // Load chapters when component mounts or subject changes
  useEffect(() => {
    if (formData.subject) {
      loadChapters()
    }
  }, [formData.subject])

  const loadChapters = async () => {
    if (!formData.subject) return

    setLoading(true)
    try {
      // Use the subjects with topics API directly
      const { getSubjectsWithTopics } = await import("@/lib/api/subjects")
      const subjects = await getSubjectsWithTopics()

      // Find the subject by name
      const subject = subjects.find(s =>
        s.name.toLowerCase() === formData.subject.toLowerCase() ||
        s.name.toLowerCase().includes(formData.subject.toLowerCase()) ||
        formData.subject.toLowerCase().includes(s.name.toLowerCase())
      )

      if (!subject) {
        console.warn(`Could not find subject: ${formData.subject}. Available subjects:`, subjects.map(s => s.name))
        return
      }

      // Convert topics to ChapterWithQuestionCount format for UI and fetch TOTAL question counts
      const { getQuestionCountByTopic } = await import("@/lib/api/chapters")

      const topicsData = await Promise.all(
        subject.topics.map(async (topic) => {
          try {
            const totalQuestionCount = await getQuestionCountByTopic(topic._id, subject._id)
            return {
              _id: topic._id,
              name: topic.name,
              subjectId: subject._id,
              description: topic.description,
              questionCount: totalQuestionCount  // Shows total questions available
            }
          } catch (error) {
            console.error(`Error fetching total count for topic ${topic.name}:`, error)
            return {
              _id: topic._id,
              name: topic.name,
              subjectId: subject._id,
              description: topic.description,
              questionCount: 0 // Fallback to 0 on error
            }
          }
        })
      )

      setChapters(topicsData)
    } catch (error) {
      console.error('Error loading topics:', error)
    } finally {
      setLoading(false)
    }
  }



  // Initialize selected chapters from formData
  useEffect(() => {
    if (formData.chapters && formData.chapters.length > 0) {
      setSelectedChapters(formData.chapters)
    }
  }, [formData.chapters])

  const addChapter = (chapter: ChapterWithQuestionCount) => {
    const newChapter: ChapterConfig = {
      chapterId: chapter._id,
      chapterName: chapter.name,
      numberOfQuestions: 1,
      totalMarks: 4 // 4 marks per question by default
    }

    const updatedChapters = [...selectedChapters, newChapter]
    setSelectedChapters(updatedChapters)

    // Store as topics in formData since we're actually selecting topics
    // but keep the chapters field for backward compatibility
    const topicsConfig = updatedChapters.map(ch => ({
      topicId: ch.chapterId,
      topicName: ch.chapterName,
      numberOfQuestions: ch.numberOfQuestions,
      totalMarks: ch.totalMarks
    }))

    updateFormData({
      chapters: updatedChapters, // Keep for UI consistency
      topics: topicsConfig // Use for API calls
    })
  }

  const removeChapter = (chapterId: string) => {
    const updatedChapters = selectedChapters.filter(c => c.chapterId !== chapterId)
    setSelectedChapters(updatedChapters)

    // Update both chapters and topics in formData
    const topicsConfig = updatedChapters.map(ch => ({
      topicId: ch.chapterId,
      topicName: ch.chapterName,
      numberOfQuestions: ch.numberOfQuestions,
      totalMarks: ch.totalMarks
    }))

    updateFormData({
      chapters: updatedChapters, // Keep for UI consistency
      topics: topicsConfig // Use for API calls
    })
  }

  const updateChapterConfig = (chapterId: string, updates: Partial<ChapterConfig>) => {
    const updatedChapters = selectedChapters.map(chapter =>
      chapter.chapterId === chapterId ? { ...chapter, ...updates } : chapter
    )
    setSelectedChapters(updatedChapters)

    // Update both chapters and topics in formData
    const topicsConfig = updatedChapters.map(ch => ({
      topicId: ch.chapterId,
      topicName: ch.chapterName,
      numberOfQuestions: ch.numberOfQuestions,
      totalMarks: ch.totalMarks
    }))

    updateFormData({
      chapters: updatedChapters, // Keep for UI consistency
      topics: topicsConfig // Use for API calls
    })
  }

  const getTotalQuestions = () => {
    return selectedChapters.reduce((total, chapter) => total + chapter.numberOfQuestions, 0)
  }

  const getTotalMarks = () => {
    return selectedChapters.reduce((total, chapter) => total + chapter.totalMarks, 0)
  }

  const isChapterSelected = (chapterId: string) => {
    return selectedChapters.some(c => c.chapterId === chapterId)
  }

  const canProceed = true // Always allow proceeding since chapter selection is optional

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold">Select Chapters</h2>
        <p className="text-gray-500">
          Choose specific chapters and configure question counts for each chapter.
        </p>
      </div>

      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Selection Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{selectedChapters.length}</div>
              <div className="text-sm text-gray-500">Chapters Selected</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{getTotalQuestions()}</div>
              <div className="text-sm text-gray-500">Total Questions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{getTotalMarks()}</div>
              <div className="text-sm text-gray-500">Total Marks</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Chapters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Available Chapters</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Loading chapters...</div>
          ) : chapters.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              No chapters available for the selected subject.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {chapters.map((chapter) => (
                <TooltipProvider key={chapter._id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={isChapterSelected(chapter._id) ? "default" : "outline"}
                        onClick={() => {
                          if (isChapterSelected(chapter._id)) {
                            removeChapter(chapter._id)
                          } else {
                            addChapter(chapter)
                          }
                        }}
                        className="h-auto p-3 flex flex-col items-start space-y-1"
                        disabled={chapter.questionCount === 0}
                      >
                        <div className="font-medium text-left">{chapter.name}</div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary" className="text-xs">
                            {chapter.questionCount} questions
                          </Badge>
                          <Info className="h-3 w-3" />
                        </div>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{chapter.questionCount} questions available in {chapter.name}</p>
                      <p className="text-xs mt-1 text-gray-400">Total questions in this topic</p>
                      {chapter.description && <p className="text-xs mt-1">{chapter.description}</p>}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Selected Chapters Configuration */}
      {selectedChapters.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Configure Selected Chapters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedChapters.map((chapter) => {
              const chapterData = chapters.find(c => c._id === chapter.chapterId)
              const maxQuestions = chapterData?.questionCount || 0
              
              return (
                <div key={chapter.chapterId} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{chapter.chapterName}</h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeChapter(chapter.chapterId)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Number of Questions (Max: {maxQuestions})</Label>
                    <Input
                      type="number"
                      min="1"
                      max={maxQuestions}
                      value={chapter.numberOfQuestions === 0 ? "" : chapter.numberOfQuestions}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === "") {
                          updateChapterConfig(chapter.chapterId, { numberOfQuestions: 0, totalMarks: 0 });
                        } else {
                          const numValue = parseInt(value);
                          if (!isNaN(numValue) && numValue >= 1 && numValue <= maxQuestions) {
                            updateChapterConfig(chapter.chapterId, {
                              numberOfQuestions: numValue,
                              totalMarks: numValue * 4 // 4 marks per question
                            });
                          }
                        }
                      }}
                      onBlur={(e) => {
                        if (e.target.value === "" || chapter.numberOfQuestions === 0) {
                          updateChapterConfig(chapter.chapterId, {
                            numberOfQuestions: 1,
                            totalMarks: 4 // 1 question * 4 marks
                          });
                        }
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}

      <StepNavigation 
        onNext={onNext} 
        onSkip={onSkip} 
        onBack={onBack}
        backDisabled={backDisabled}
        nextDisabled={!canProceed}
      />

      <InfoMessage
        message={
          selectedChapters.length === 0
            ? "No chapters selected. Questions will be randomly selected from the entire subject. You can skip this step or select specific chapters for more targeted selection."
            : `You have selected ${selectedChapters.length} chapter(s) with ${getTotalQuestions()} total questions. Next, you can optionally select specific topics within these chapters.`
        }
      />
    </div>
  )
}
