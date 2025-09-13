"use client"

import { useState, useEffect } from "react"
import type { FormData, SubjectConfig, ChapterConfig } from "../question-paper-wizard"
import { CustomDifficultyConfig } from "@/lib/api/questionPapers"
import { StepNavigation } from "../ui/step-navigation"
import { InfoMessage } from "../ui/info-message"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Minus, Plus, Info } from "lucide-react"
import { ChapterWithQuestionCount } from "@/lib/api/chapters"
import { getAllSubjects, Subject } from "@/lib/api/subjects"

// Subject mapping for display names
const subjectDisplayMap: Record<string, string> = {
  "physics": "Physics",
  "chemistry": "Chemistry",
  "biology": "Biology",
  "mathematics": "Mathematics"
}

type MultiSubjectConfigStepProps = {
  formData: FormData
  updateFormData: (data: Partial<FormData>) => void
  onNext: () => void
  onSkip: () => void
  onBack: () => void
  backDisabled: boolean
}

export function MultiSubjectConfigStep({
  formData,
  updateFormData,
  onNext,
  onSkip,
  onBack,
  backDisabled
}: MultiSubjectConfigStepProps) {
  const [activeTab, setActiveTab] = useState(formData.subjects[0] || "")
  const [subjectChapters, setSubjectChapters] = useState<Record<string, ChapterWithQuestionCount[]>>({})
  const [loadingChapters, setLoadingChapters] = useState<Record<string, boolean>>({})
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loadingSubjects, setLoadingSubjects] = useState(false)

  const [showChaptersForSubject, setShowChaptersForSubject] = useState<Record<string, boolean>>({})

  // Helper function to get display name
  const getDisplayName = (subjectValue: string) => {
    return subjectDisplayMap[subjectValue] || subjectValue
  }



  // Load subjects on component mount
  useEffect(() => {
    loadSubjects()
  }, [])

  const loadSubjects = async () => {
    setLoadingSubjects(true)
    try {
      const subjectsData = await getAllSubjects()
      setSubjects(subjectsData)
    } catch (error) {
      console.error('Error loading subjects:', error)
    } finally {
      setLoadingSubjects(false)
    }
  }

  // Load topics (displayed as chapters) for a subject
  const loadChaptersForSubject = async (subject: string) => {
    if (!showChaptersForSubject[subject]) return
    if (subjectChapters[subject] || loadingChapters[subject]) return

    setLoadingChapters(prev => ({ ...prev, [subject]: true }))
    try {
      // Use the subjects with topics API directly
      const { getSubjectsWithTopics } = await import("@/lib/api/subjects")
      const allSubjects = await getSubjectsWithTopics()

      // Find the subject by name
      const subjectObj = allSubjects.find(s =>
        s.name.toLowerCase() === subject.toLowerCase() ||
        s.name.toLowerCase().includes(subject.toLowerCase()) ||
        subject.toLowerCase().includes(s.name.toLowerCase())
      )

      if (!subjectObj) {
        console.warn(`Could not find subject: ${subject}`)
        return
      }

      // Convert topics to ChapterWithQuestionCount format for UI and fetch UNUSED counts for this college
      const { getQuestionCountByTopic } = await import("@/lib/api/chapters")
      const topicsData = await Promise.all(
        subjectObj.topics.map(async (topic) => {
                    const questionCount = await getQuestionCountByTopic(topic._id, subjectObj._id)
          return {
            _id: topic._id,
            name: topic.name,
            subjectId: subjectObj._id,
            description: topic.description,
            questionCount: questionCount
          }
        })
      )

      setSubjectChapters(prev => ({ ...prev, [subject]: topicsData }))
    } catch (error) {
      console.error(`Error loading topics for ${subject}:`, error)
    } finally {
      setLoadingChapters(prev => ({ ...prev, [subject]: false }))
    }
  }

  // Load chapters when tab changes and subjects are loaded
  useEffect(() => {
    if (activeTab && subjects.length > 0 && showChaptersForSubject[activeTab]) {
      loadChaptersForSubject(activeTab)
    }
  }, [activeTab, subjects, showChaptersForSubject])

  // Initialize subject configs if they don't exist
  const initializeSubjectConfig = (subject: string): SubjectConfig => {
    if (formData.subjectConfigs[subject]) {
      return formData.subjectConfigs[subject]
    }

    return {
      subject,
      difficultyMode: "auto",
      difficultyLevels: {
        easyPercentage: 30,
        mediumPercentage: 50,
        hardPercentage: 20,
      },
      numberOfQuestions: 10,
      totalMarks: 40,
      topicId: undefined,
      chapters: [],
    }
  }

  // Update a specific subject's configuration
  const updateSubjectConfig = (subject: string, updates: Partial<SubjectConfig>) => {
    const currentConfig = formData.subjectConfigs[subject] || initializeSubjectConfig(subject)
    const updatedConfig = { ...currentConfig, ...updates }

    updateFormData({
      subjectConfigs: {
        ...formData.subjectConfigs,
        [subject]: updatedConfig
      }
    })
  }

  // Chapter management functions
  const addChapterToSubject = (subject: string, chapter: ChapterWithQuestionCount) => {
    const config = formData.subjectConfigs[subject] || initializeSubjectConfig(subject)
    const newChapter: ChapterConfig = {
      chapterId: chapter._id,
      chapterName: chapter.name,
      numberOfQuestions: 1,
      totalMarks: 4
    }

    const updatedChapters = [...(config.chapters || []), newChapter]
    updateSubjectConfig(subject, { chapters: updatedChapters })
  }

  const removeChapterFromSubject = (subject: string, chapterId: string) => {
    const config = formData.subjectConfigs[subject] || initializeSubjectConfig(subject)
    const updatedChapters = (config.chapters || []).filter(c => c.chapterId !== chapterId)
    updateSubjectConfig(subject, { chapters: updatedChapters })
  }

  const updateChapterConfig = (subject: string, chapterId: string, updates: Partial<ChapterConfig>) => {
    const config = formData.subjectConfigs[subject] || initializeSubjectConfig(subject)
    const updatedChapters = (config.chapters || []).map(chapter =>
      chapter.chapterId === chapterId ? { ...chapter, ...updates } : chapter
    )
    updateSubjectConfig(subject, { chapters: updatedChapters })
  }

  const isChapterSelected = (subject: string, chapterId: string) => {
    const config = formData.subjectConfigs[subject]
    return config?.chapters?.some(c => c.chapterId === chapterId) || false
  }

  // Adjust difficulty percentage for a subject
  const adjustDifficulty = (subject: string, level: keyof CustomDifficultyConfig, amount: number) => {
    const config = formData.subjectConfigs[subject] || initializeSubjectConfig(subject)
    const newValue = Math.max(0, Math.min(100, config.difficultyLevels[level] + amount))

    updateSubjectConfig(subject, {
      difficultyLevels: {
        ...config.difficultyLevels,
        [level]: newValue,
      }
    })
  }

  // Calculate totals across all subjects
  const calculateTotals = () => {
    let totalQuestions = 0
    let totalMarks = 0

    formData.subjects.forEach(subject => {
      const config = formData.subjectConfigs[subject] || initializeSubjectConfig(subject)
      totalQuestions += config.numberOfQuestions
      totalMarks += config.totalMarks
    })

    return { totalQuestions, totalMarks }
  }

  const { totalQuestions, totalMarks } = calculateTotals()

  // Validation
  const isValid = formData.subjects.every(subject => {
    const config = formData.subjectConfigs[subject] || initializeSubjectConfig(subject)
    const difficultySum = config.difficultyLevels.easyPercentage +
                         config.difficultyLevels.mediumPercentage +
                         config.difficultyLevels.hardPercentage
    return difficultySum === 100 && config.numberOfQuestions > 0 && config.totalMarks > 0
  })

  // Initialize configs for all subjects if not already done
  useEffect(() => {
    if (formData.subjects.length > 0 && Object.keys(formData.subjectConfigs).length === 0) {
      const initialConfigs: Record<string, SubjectConfig> = {}
      formData.subjects.forEach(subject => {
        initialConfigs[subject] = initializeSubjectConfig(subject)
      })
      updateFormData({ subjectConfigs: initialConfigs })
    }
  }, [formData.subjects, formData.subjectConfigs, updateFormData])

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold">Configure Each Subject</h2>
        <p className="text-gray-500">
          Set difficulty levels, number of questions, and marks for each selected subject
        </p>
      </div>

      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Paper Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{formData.subjects.length}</div>
              <div className="text-sm text-gray-500">Subjects</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{totalQuestions}</div>
              <div className="text-sm text-gray-500">Total Questions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{totalMarks}</div>
              <div className="text-sm text-gray-500">Total Marks</div>
            </div>

          </div>
        </CardContent>
      </Card>



      {/* Subject Configuration Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
          {formData.subjects.map((subject) => (
            <TabsTrigger key={subject} value={subject} className="text-sm">
              {getDisplayName(subject)}
              {formData.subjectConfigs[subject] && (
                <Badge variant="secondary" className="ml-1 text-xs">
                  {formData.subjectConfigs[subject].numberOfQuestions}Q
                </Badge>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        {formData.subjects.map((subject) => {
          const config = formData.subjectConfigs[subject] || initializeSubjectConfig(subject)
          const difficultySum = config.difficultyLevels.easyPercentage +
                               config.difficultyLevels.mediumPercentage +
                               config.difficultyLevels.hardPercentage

          return (
            <TabsContent key={subject} value={subject} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{getDisplayName(subject)} Configuration</span>
                    <Badge variant={difficultySum === 100 ? "default" : "destructive"}>
                      {difficultySum === 100 ? "Valid" : `${difficultySum}% (Need 100%)`}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Basic Configuration */}
                  <div className="space-y-2">
                    <Label htmlFor={`questions-${subject}`}>Number of Questions</Label>
                    <Input
                      id={`questions-${subject}`}
                      type="number"
                      min="1"
                      max="200"
                      value={config.numberOfQuestions === 0 ? "" : config.numberOfQuestions}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === "") {
                          updateSubjectConfig(subject, { numberOfQuestions: 0, totalMarks: 0 });
                        } else {
                          const numValue = parseInt(value);
                          if (!isNaN(numValue) && numValue >= 1) {
                            updateSubjectConfig(subject, {
                              numberOfQuestions: numValue,
                              totalMarks: numValue * 4 // 4 marks per question
                            });
                          }
                        }
                      }}
                      onBlur={(e) => {
                        // If field is empty on blur, set to minimum value
                        if (e.target.value === "" || config.numberOfQuestions === 0) {
                          updateSubjectConfig(subject, {
                            numberOfQuestions: 1,
                            totalMarks: 4 // 1 question * 4 marks
                          });
                        }
                      }}
                    />
                  </div>

                  {/* Difficulty Configuration */}
                  <div className="space-y-4">
                    <Label>Difficulty Distribution</Label>
                    <div className="grid grid-cols-3 gap-4">
                      {/* Easy */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Easy</Label>
                        <div className="flex items-center rounded-sm border border-gray-200 p-1">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => adjustDifficulty(subject, "easyPercentage", -5)}
                            className="h-8 w-8 rounded-sm border-gray-200"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="flex-1 text-center font-medium">
                            {config.difficultyLevels.easyPercentage}%
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => adjustDifficulty(subject, "easyPercentage", 5)}
                            className="h-8 w-8 rounded-sm border-gray-200"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Medium */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Medium</Label>
                        <div className="flex items-center rounded-sm border border-gray-200 p-1">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => adjustDifficulty(subject, "mediumPercentage", -5)}
                            className="h-8 w-8 rounded-sm border-gray-200"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="flex-1 text-center font-medium">
                            {config.difficultyLevels.mediumPercentage}%
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => adjustDifficulty(subject, "mediumPercentage", 5)}
                            className="h-8 w-8 rounded-sm border-gray-200"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Hard */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Hard</Label>
                        <div className="flex items-center rounded-sm border border-gray-200 p-1">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => adjustDifficulty(subject, "hardPercentage", -5)}
                            className="h-8 w-8 rounded-sm border-gray-200"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="flex-1 text-center font-medium">
                            {config.difficultyLevels.hardPercentage}%
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => adjustDifficulty(subject, "hardPercentage", 5)}
                            className="h-8 w-8 rounded-sm border-gray-200"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Chapter Selection */}
                  <div className="space-y-4">
                    <Label>Chapter Selection (Optional)</Label>
                    <p className="text-sm text-gray-500">
                      Select specific chapters to generate questions from. If no chapters are selected, questions will be randomly selected from the entire subject.
                    </p>

                    {/* Available Chapters */}
                        {/* Lazy-load trigger per subject */}
                        {!showChaptersForSubject[subject] && (
                          <div className="flex justify-start">
                            <Button
                              variant="outline"
                              onClick={() => setShowChaptersForSubject(prev => ({ ...prev, [subject]: true }))}
                            >
                              Select Chapter (Optional)
                            </Button>
                          </div>
                        )}

                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Available Chapters</Label>
                      {(!showChaptersForSubject[subject]) ? (
                        <div className="text-muted-foreground text-sm">Click "Select Chapter (Optional)" to load topics.</div>
                      ) : loadingChapters[subject] ? (
                        <div className="text-center py-4 text-sm text-gray-500">Loading chapters...</div>
                      ) : subjectChapters[subject]?.length === 0 ? (
                        <div className="text-center py-4 text-sm text-gray-500">
                          No chapters available for this subject.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {subjectChapters[subject]?.map((chapter) => (
                            <TooltipProvider key={chapter._id}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant={isChapterSelected(subject, chapter._id) ? "default" : "outline"}
                                    onClick={() => {
                                      if (isChapterSelected(subject, chapter._id)) {
                                        removeChapterFromSubject(subject, chapter._id)
                                      } else {
                                        addChapterToSubject(subject, chapter)
                                      }
                                    }}
                                    className="h-auto p-3 flex flex-col items-start space-y-1 text-left break-words whitespace-normal max-w-full"
                                    disabled={chapter.questionCount === 0}
                                  >
                                    <div className="font-medium line-clamp-2 w-full break-words">{chapter.name}</div>
                                    <div className="flex items-center space-x-2">
                                      <Badge variant="secondary" className="text-xs">
                                        {chapter.questionCount} unused
                                      </Badge>
                                      <Info className="h-3 w-3" />
                                    </div>
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{chapter.questionCount} unused questions available in {chapter.name}</p>
                                  <p className="text-xs mt-1 text-gray-400">Questions not used in previous papers</p>
                                  {chapter.description && <p className="text-xs mt-1">{chapter.description}</p>}
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Selected Chapters Configuration */}
                    {config.chapters && config.chapters.length > 0 && (
                      <div className="space-y-3">
                        <Label className="text-sm font-medium">Selected Chapters Configuration</Label>
                        {config.chapters.map((chapter) => {
                          const chapterData = subjectChapters[subject]?.find(c => c._id === chapter.chapterId)
                          const maxQuestions = chapterData?.questionCount || 0

                          return (
                            <div key={chapter.chapterId} className="border rounded-lg p-3 space-y-2">
                              <div className="flex items-center justify-between">
                                <h5 className="font-medium text-sm">{chapter.chapterName}</h5>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => removeChapterFromSubject(subject, chapter.chapterId)}
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                  <Label className="text-xs">Questions (Max: {maxQuestions})</Label>
                                  <Input
                                    type="number"
                                    min="1"
                                    max={maxQuestions}
                                    value={chapter.numberOfQuestions === 0 ? "" : chapter.numberOfQuestions}
                                    onChange={(e) => {
                                      const value = e.target.value;
                                      if (value === "") {
                                        updateChapterConfig(subject, chapter.chapterId, { numberOfQuestions: 0, totalMarks: 0 });
                                      } else {
                                        const numValue = parseInt(value);
                                        if (!isNaN(numValue) && numValue >= 1 && numValue <= maxQuestions) {
                                          updateChapterConfig(subject, chapter.chapterId, {
                                            numberOfQuestions: numValue,
                                            totalMarks: numValue * 4 // 4 marks per question
                                          });
                                        }
                                      }
                                    }}
                                    onBlur={(e) => {
                                      if (e.target.value === "" || chapter.numberOfQuestions === 0) {
                                        updateChapterConfig(subject, chapter.chapterId, {
                                          numberOfQuestions: 1,
                                          totalMarks: 4 // 1 question * 4 marks
                                        });
                                      }
                                    }}
                                    className="h-8 text-sm"
                                  />
                                </div>


                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )
        })}
      </Tabs>

      <StepNavigation
        onNext={onNext}
        onSkip={onSkip}
        onBack={onBack}
        backDisabled={backDisabled}
        nextDisabled={!isValid}
      />

      {!isValid && (
        <InfoMessage
          message="Please ensure all subjects have valid configurations (difficulty percentages must sum to 100% and questions/marks must be greater than 0)."
        />
      )}
    </div>
  )
}
