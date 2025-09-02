"use client"

import { useState, useEffect } from "react"
import type { FormData, TopicConfig } from "../question-paper-wizard"
import { StepNavigation } from "../ui/step-navigation"
import { InfoMessage } from "../ui/info-message"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Plus, Minus, Info } from "lucide-react"
import { getAllTopics } from "@/lib/api/topics"
import { getSubjectsWithChaptersAndTopics } from "@/lib/api/subjects"

type TopicWithQuestionCount = {
  _id: string
  name: string
  description?: string
  chapterId?: string
  questionCount: number
}

type TopicSelectionStepProps = {
  formData: FormData
  updateFormData: (data: Partial<FormData>) => void
  onNext: () => void
  onSkip: () => void
  onBack: () => void
  backDisabled: boolean
}

export function TopicSelectionStep({ 
  formData, 
  updateFormData, 
  onNext, 
  onSkip, 
  onBack, 
  backDisabled 
}: TopicSelectionStepProps) {
  const [topics, setTopics] = useState<TopicWithQuestionCount[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedTopics, setSelectedTopics] = useState<TopicConfig[]>([])

  // Load topics when component mounts or chapters change
  useEffect(() => {
    if (formData.subject && (formData.chapters || formData.chapterId)) {
      loadTopics()
    }
  }, [formData.subject, formData.chapters, formData.chapterId])

  // Initialize selected topics from formData
  useEffect(() => {
    if (formData.topics) {
      setSelectedTopics(formData.topics)
    }
  }, [formData.topics])

  const loadTopics = async () => {
    if (!formData.subject) return

    setLoading(true)
    try {
      let allTopics: TopicWithQuestionCount[] = []

      if (formData.chapters && formData.chapters.length > 0) {
        // Load topics for multiple selected chapters
        for (const chapter of formData.chapters) {
          const chapterTopics = await getAllTopics(chapter.chapterId)
          const topicsWithCounts = chapterTopics.map(topic => ({
            ...topic,
            questionCount: 0 // TODO: Get actual question counts
          }))
          allTopics = [...allTopics, ...topicsWithCounts]
        }
      } else if (formData.chapterId) {
        // Load topics for single selected chapter
        const chapterTopics = await getAllTopics(formData.chapterId)
        allTopics = chapterTopics.map(topic => ({
          ...topic,
          questionCount: 0 // TODO: Get actual question counts
        }))
      } else {
        // Load all topics for the subject (fallback)
        const subjectsWithHierarchy = await getSubjectsWithChaptersAndTopics()
        const currentSubject = subjectsWithHierarchy.find(s => s.name === formData.subject)
        
        if (currentSubject) {
          allTopics = currentSubject.chapters.flatMap(chapter => 
            chapter.topics.map(topic => ({
              ...topic,
              questionCount: 0 // TODO: Get actual question counts
            }))
          )
        }
      }

      setTopics(allTopics)
    } catch (error) {
      console.error("Error loading topics:", error)
      setTopics([])
    } finally {
      setLoading(false)
    }
  }

  const addTopic = (topic: TopicWithQuestionCount) => {
    const newTopic: TopicConfig = {
      topicId: topic._id,
      topicName: topic.name,
      numberOfQuestions: 1,
      totalMarks: 10
    }
    
    const updatedTopics = [...selectedTopics, newTopic]
    setSelectedTopics(updatedTopics)
    updateFormData({ topics: updatedTopics })
  }

  const removeTopic = (topicId: string) => {
    const updatedTopics = selectedTopics.filter(t => t.topicId !== topicId)
    setSelectedTopics(updatedTopics)
    updateFormData({ topics: updatedTopics })
  }

  const updateTopicConfig = (topicId: string, field: keyof TopicConfig, value: number) => {
    const updatedTopics = selectedTopics.map(topic =>
      topic.topicId === topicId ? { ...topic, [field]: value } : topic
    )
    setSelectedTopics(updatedTopics)
    updateFormData({ topics: updatedTopics })
  }

  const isTopicSelected = (topicId: string) => {
    return selectedTopics.some(t => t.topicId === topicId)
  }

  const canProceed = selectedTopics.length > 0

  const handleNext = () => {
    if (canProceed) {
      onNext()
    }
  }

  const handleSkip = () => {
    // Clear topic selection when skipping
    setSelectedTopics([])
    updateFormData({ topics: undefined, topicId: undefined })
    onSkip()
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Select Topics (Optional)</h2>
        <p className="text-muted-foreground mt-2">
          Choose specific topics for more targeted question selection
        </p>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading topics...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Available Topics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                Available Topics
              </CardTitle>
            </CardHeader>
            <CardContent>
              {topics.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {topics.map((topic) => (
                    <TooltipProvider key={topic._id}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant={isTopicSelected(topic._id) ? "default" : "outline"}
                            className="h-auto p-3 justify-start"
                            onClick={() => 
                              isTopicSelected(topic._id) 
                                ? removeTopic(topic._id)
                                : addTopic(topic)
                            }
                            disabled={isTopicSelected(topic._id)}
                          >
                            <div className="text-left">
                              <div className="font-medium">{topic.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {topic.questionCount} questions available
                              </div>
                            </div>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{topic.description || `${topic.questionCount} questions available in ${topic.name}`}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ))}
                </div>
              ) : (
                <InfoMessage
                  message="No topics available for the selected chapters. You can skip this step to select from all questions in the chosen chapters."
                />
              )}
            </CardContent>
          </Card>

          {/* Selected Topics Configuration */}
          {selectedTopics.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Selected Topics ({selectedTopics.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedTopics.map((topic) => (
                  <div key={topic.topicId} className="flex items-center gap-4 p-3 border rounded-lg">
                    <div className="flex-1">
                      <Badge variant="secondary">{topic.topicName}</Badge>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`questions-${topic.topicId}`} className="text-sm">Questions:</Label>
                      <Input
                        id={`questions-${topic.topicId}`}
                        type="number"
                        min="1"
                        max="100"
                        value={topic.numberOfQuestions}
                        onChange={(e) => updateTopicConfig(topic.topicId, 'numberOfQuestions', parseInt(e.target.value) || 1)}
                        className="w-20"
                      />
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`marks-${topic.topicId}`} className="text-sm">Marks:</Label>
                      <Input
                        id={`marks-${topic.topicId}`}
                        type="number"
                        min="1"
                        max="1000"
                        value={topic.totalMarks}
                        onChange={(e) => updateTopicConfig(topic.topicId, 'totalMarks', parseInt(e.target.value) || 1)}
                        className="w-20"
                      />
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeTopic(topic.topicId)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                
                <div className="pt-2 border-t">
                  <div className="flex justify-between text-sm">
                    <span>Total Questions: {selectedTopics.reduce((sum, t) => sum + t.numberOfQuestions, 0)}</span>
                    <span>Total Marks: {selectedTopics.reduce((sum, t) => sum + t.totalMarks, 0)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <StepNavigation
        onNext={handleNext}
        onSkip={handleSkip}
        onBack={onBack}
        nextDisabled={false} // Allow proceeding even without topics (optional step)
        backDisabled={backDisabled}
        nextLabel={selectedTopics.length > 0 ? "Continue with Selected Topics" : "Skip Topic Selection"}
        skipLabel="Skip Topics"
        showSkip={true}
      />
    </div>
  )
}
