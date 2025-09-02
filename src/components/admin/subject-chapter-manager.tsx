"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trash2, Edit2, Plus, Save, X, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { toast } from "sonner"
import { 
  getAllSubjects, 
  createSubject, 
  updateSubject, 
  deleteSubject,
  Subject as ApiSubject
} from "@/lib/api/subjects"
// Removed chapter imports since we're not using chapters anymore
import {
  getAllTopics,
  createTopic,
  updateTopic,
  deleteTopic,
  Topic as ApiTopic
} from "@/lib/api/topics"

interface Topic {
  id: string
  name: string
  subjectId: string  // Changed from chapterId to subjectId
  description?: string
}

interface Subject {
  id: string
  name: string
  description?: string
}

interface SubjectTopicManagerProps {  // Renamed from SubjectChapterTopicManagerProps
  title?: string
  description?: string
  onDataChange?: (subjects: Subject[], topics: Topic[]) => void  // Removed chapters
  initialSubjects?: Subject[]
  initialTopics?: Topic[]
}

export default function SubjectTopicManager({  // Renamed function
  title = "Subject & Topic Manager",  // Updated title
  description = "Manage subjects and topics in a two-level hierarchy",  // Updated description
  onDataChange,
  initialSubjects = [],
  initialTopics = [],
}: SubjectTopicManagerProps) {  // Updated props type
  const [subjects, setSubjects] = useState<Subject[]>(initialSubjects)
  const [topics, setTopics] = useState<Topic[]>(initialTopics)
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("")
  // Removed chapters state and selectedChapterId
  const [newSubjectName, setNewSubjectName] = useState("")
  const [newSubjectDescription, setNewSubjectDescription] = useState("")
  const [newTopicName, setNewTopicName] = useState("")
  const [newTopicDescription, setNewTopicDescription] = useState("")
  const [editingSubject, setEditingSubject] = useState<string | null>(null)
  const [editingTopic, setEditingTopic] = useState<string | null>(null)
  const [editSubjectName, setEditSubjectName] = useState("")
  const [editSubjectDescription, setEditSubjectDescription] = useState("")
  const [editTopicName, setEditTopicName] = useState("")
  const [editTopicDescription, setEditTopicDescription] = useState("")
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Load data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [subjectsData, topicsData] = await Promise.all([
          getAllSubjects(),
          getAllTopics()
        ])

        // Transform API data to component format
        const transformedSubjects: Subject[] = subjectsData.map((subject: ApiSubject) => ({
          id: subject._id,
          name: subject.name,
          description: subject.description
        }))

        const transformedTopics: Topic[] = topicsData.map((topic: ApiTopic) => {
          const subjectId = typeof topic.subjectId === 'string'
            ? topic.subjectId
            : topic.subjectId?._id || '';

          return {
            id: topic._id,
            name: topic.name,
            subjectId: subjectId,  // Handle both string and object formats
            description: topic.description
          };
        })

        setSubjects(transformedSubjects)
        setTopics(transformedTopics)

        // Set first subject as selected if available
        if (transformedSubjects.length > 0 && !selectedSubjectId) {
          setSelectedSubjectId(transformedSubjects[0].id)
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        toast.error("Failed to load subjects and topics")
      } finally {
        setLoading(false)
      }
    }

    // Only fetch from API if no initial data provided
    if (initialSubjects.length === 0 && initialTopics.length === 0) {
      fetchData()
    } else {
      setLoading(false)
    }
  }, [])

  // Notify parent component of data changes
  useEffect(() => {
    if (onDataChange) {
      onDataChange(subjects, topics)
    }
  }, [subjects, topics, onDataChange])

  // Subject CRUD operations
  const addSubject = async () => {
    if (!newSubjectName.trim()) {
      toast.error("Subject name cannot be empty")
      return
    }

    try {
      setSubmitting(true)
      const subjectData = {
        name: newSubjectName.trim(),
        description: newSubjectDescription.trim() || undefined
      }
      
      const createdSubject = await createSubject(subjectData)
      
      const newSubject: Subject = {
        id: createdSubject._id,
        name: createdSubject.name,
        description: createdSubject.description
      }

      setSubjects((prev) => [...prev, newSubject])
      setNewSubjectName("")
      setNewSubjectDescription("")
      
      toast.success("Subject added successfully")
    } catch (error: any) {
      console.error("Error adding subject:", error)
      toast.error(error.message || "Failed to add subject")
    } finally {
      setSubmitting(false)
    }
  }

  const updateSubjectHandler = async (id: string) => {
    if (!editSubjectName.trim()) {
      toast.error("Subject name cannot be empty")
      return
    }

    try {
      setSubmitting(true)
      const subjectData = {
        name: editSubjectName.trim(),
        description: editSubjectDescription.trim() || undefined
      }
      
      await updateSubject(id, subjectData)
      
      setSubjects((prev) => prev.map((subject) => (subject.id === id ? { 
        ...subject, 
        name: editSubjectName.trim(),
        description: editSubjectDescription.trim() || undefined
      } : subject)))
      
      setEditingSubject(null)
      setEditSubjectName("")
      setEditSubjectDescription("")
      
      toast.success("Subject updated successfully")
    } catch (error: any) {
      console.error("Error updating subject:", error)
      toast.error(error.message || "Failed to update subject")
    } finally {
      setSubmitting(false)
    }
  }

  const deleteSubjectHandler = async (id: string) => {
    try {
      setSubmitting(true)
      await deleteSubject(id)
      
      setSubjects((prev) => prev.filter((subject) => subject.id !== id))
      
      // Clear selection if deleted subject was selected
      if (selectedSubjectId === id) {
        setSelectedSubjectId("")
      }
      
      toast.success("Subject deleted successfully")
    } catch (error: any) {
      console.error("Error deleting subject:", error)
      toast.error(error.message || "Failed to delete subject")
    } finally {
      setSubmitting(false)
    }
  }

  const startEditingSubject = (subject: Subject) => {
    setEditingSubject(subject.id)
    setEditSubjectName(subject.name)
    setEditSubjectDescription(subject.description || "")
  }

  const cancelEditingSubject = () => {
    setEditingSubject(null)
    setEditSubjectName("")
    setEditSubjectDescription("")
  }

  // Helper functions
  const getTopicsForSubject = (subjectId: string) => {
    return topics.filter(topic => topic.subjectId === subjectId);
  }

  const selectedSubject = subjects.find(s => s.id === selectedSubjectId)
  const subjectTopics = getTopicsForSubject(selectedSubjectId)

  // Topic CRUD operations
  const addTopic = async () => {
    if (!newTopicName.trim() || !selectedSubjectId) return

    try {
      setSubmitting(true)
      const topicData = {
        name: newTopicName.trim(),
        subjectId: selectedSubjectId,  // Changed from chapterId to subjectId
        description: newTopicDescription.trim() || undefined
      }

      const createdTopic = await createTopic(topicData)

      const newTopic: Topic = {
        id: createdTopic._id,
        name: createdTopic.name,
        subjectId: selectedSubjectId,  // Changed from chapterId to subjectId
        description: createdTopic.description
      }

      setTopics((prev) => [...prev, newTopic])
      setNewTopicName("")
      setNewTopicDescription("")

      toast.success("Topic added successfully")
    } catch (error: any) {
      console.error("Error adding topic:", error)
      toast.error(error.message || "Failed to add topic")
    } finally {
      setSubmitting(false)
    }
  }

  const updateTopicHandler = async (id: string) => {
    if (!editTopicName.trim()) return

    try {
      setSubmitting(true)
      const updateData = {
        name: editTopicName.trim(),
        description: editTopicDescription.trim() || undefined
      }

      const updatedTopic = await updateTopic(id, updateData)

      setTopics((prev) =>
        prev.map((topic) =>
          topic.id === id
            ? {
                ...topic,
                name: updatedTopic.name,
                description: updatedTopic.description
              }
            : topic
        )
      )

      setEditingTopic(null)
      setEditTopicName("")
      setEditTopicDescription("")

      toast.success("Topic updated successfully")
    } catch (error: any) {
      console.error("Error updating topic:", error)
      toast.error(error.message || "Failed to update topic")
    } finally {
      setSubmitting(false)
    }
  }

  const deleteTopicHandler = async (id: string) => {
    try {
      setSubmitting(true)
      await deleteTopic(id)

      setTopics((prev) => prev.filter((topic) => topic.id !== id))

      toast.success("Topic deleted successfully")
    } catch (error: any) {
      console.error("Error deleting topic:", error)
      toast.error(error.message || "Failed to delete topic")
    } finally {
      setSubmitting(false)
    }
  }

  const startEditingTopic = (topic: Topic) => {
    setEditingTopic(topic.id)
    setEditTopicName(topic.name)
    setEditTopicDescription(topic.description || "")
  }

  const cancelEditingTopic = () => {
    setEditingTopic(null)
    setEditTopicName("")
    setEditTopicDescription("")
  }

  // Removed getChaptersForSubject function since we no longer use chapters

  // Removed duplicate and chapter-related code

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading subjects, chapters, and topics...</span>
      </div>
    )
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-muted-foreground mt-2">{description}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Subject Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Subjects
            </CardTitle>
            <CardDescription>
              Add and manage subjects
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add Subject Form */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-subject-name">Subject Name</Label>
                <Input
                  id="new-subject-name"
                  placeholder="Enter subject name"
                  value={newSubjectName}
                  onChange={(e) => setNewSubjectName(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addSubject()}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-subject-description">Description (Optional)</Label>
                <Input
                  id="new-subject-description"
                  placeholder="Enter subject description"
                  value={newSubjectDescription}
                  onChange={(e) => setNewSubjectDescription(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addSubject()}
                />
              </div>
              <Button
                onClick={addSubject}
                className="w-full bg-[#05603A] hover:bg-[#04502F] sm:w-auto"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Subject
                  </>
                )}
              </Button>
            </div>

            {/* Subject List */}
            <div className="space-y-2 mt-6">
              <h3 className="text-sm font-medium">All Subjects ({subjects.length})</h3>
              {subjects.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  No subjects added yet
                </div>
              ) : (
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                  {subjects.map((subject) => (
                    <div
                      key={subject.id}
                      className={`p-3 border rounded-md cursor-pointer transition-colors ${
                        selectedSubjectId === subject.id ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"
                      }`}
                      onClick={() => setSelectedSubjectId(subject.id)}
                    >
                      {editingSubject === subject.id ? (
                        <div className="space-y-2">
                          <Input
                            value={editSubjectName}
                            onChange={(e) => setEditSubjectName(e.target.value)}
                            placeholder="Subject name"
                            className="mb-2"
                          />
                          <Input
                            value={editSubjectDescription}
                            onChange={(e) => setEditSubjectDescription(e.target.value)}
                            placeholder="Description (optional)"
                            className="mb-2"
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => updateSubjectHandler(subject.id)}
                              className="flex-1"
                              disabled={submitting}
                            >
                              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={cancelEditingSubject}
                              className="flex-1"
                              disabled={submitting}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-center justify-between">
                            <div className="font-medium">{subject.name}</div>
                            <div className="flex gap-1">
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  startEditingSubject(subject)
                                }}
                                disabled={submitting}
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  deleteSubjectHandler(subject.id)
                                }}
                                disabled={submitting}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </div>
                          {subject.description && (
                            <p className="text-sm text-muted-foreground mt-1">{subject.description}</p>
                          )}
                          <Badge
                            variant="outline"
                            className="mt-2"
                          >
                            {getTopicsForSubject(subject.id).length} topics
                          </Badge>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>



        {/* Topic Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Topics
            </CardTitle>
            <CardDescription>
              Manage topics under subjects
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Subject Selection */}
            <div className="space-y-2">
              <Label htmlFor="topic-subject-select">Select Subject</Label>
              <Select
                value={selectedSubjectId}
                onValueChange={setSelectedSubjectId}
                disabled={subjects.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder={
                    subjects.length === 0
                      ? "No subjects available"
                      : "Select a subject"
                  } />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Add Topic Form */}
            {selectedSubjectId && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-topic-name">Topic Name</Label>
                  <Input
                    id="new-topic-name"
                    placeholder="Enter topic name"
                    value={newTopicName}
                    onChange={(e) => setNewTopicName(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addTopic()}
                    disabled={!selectedSubjectId}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-topic-description">Description (Optional)</Label>
                  <Input
                    id="new-topic-description"
                    placeholder="Enter topic description"
                    value={newTopicDescription}
                    onChange={(e) => setNewTopicDescription(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addTopic()}
                    disabled={!selectedSubjectId}
                  />
                </div>
                <Button
                  onClick={addTopic}
                  className="w-full bg-[#05603A] hover:bg-[#04502F] sm:w-auto"
                  disabled={!selectedSubjectId || submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Topic
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* Topic List */}
            <div className="space-y-2 mt-6">
              <h3 className="text-sm font-medium">
                {selectedSubject
                  ? `Topics for ${selectedSubject.name} (${subjectTopics.length})`
                  : "Select a subject to view topics"}
              </h3>
              {subjectTopics.length > 0 ? (
                subjectTopics.map((topic) => (
                  <div key={topic.id} className="p-3 border rounded-lg">
                    {editingTopic === topic.id ? (
                      <div className="space-y-2">
                        <Input
                          value={editTopicName}
                          onChange={(e) => setEditTopicName(e.target.value)}
                          placeholder="Topic name"
                          disabled={submitting}
                        />
                        <Input
                          value={editTopicDescription}
                          onChange={(e) => setEditTopicDescription(e.target.value)}
                          placeholder="Topic description (optional)"
                          disabled={submitting}
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => updateTopicHandler(topic.id)}
                            className="flex-1"
                            disabled={submitting}
                          >
                            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={cancelEditingTopic}
                            className="flex-1"
                            disabled={submitting}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-center justify-between">
                          <div className="font-medium">{topic.name}</div>
                          <div className="flex gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => startEditingTopic(topic)}
                              disabled={submitting}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => deleteTopicHandler(topic.id)}
                              disabled={submitting}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                        {topic.description && (
                          <p className="text-sm text-muted-foreground mt-1">{topic.description}</p>
                        )}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  {selectedSubjectId ? "No topics yet" : "Select a subject to manage topics"}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary */}
      {subjects.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {subjects.map((subject) => {
                const subjectTopicsForSummary = getTopicsForSubject(subject.id)
                return (
                  <div key={subject.id} className="p-3 border rounded-lg">
                    <h4 className="font-semibold mb-2">{subject.name}</h4>
                    <div className="space-y-2">
                      {subjectTopicsForSummary.length > 0 ? (
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground mb-2">
                            {subjectTopicsForSummary.length} topics
                          </p>
                          <div className="space-y-1">
                            {subjectTopicsForSummary.map((topic) => (
                              <Badge key={topic.id} variant="secondary" className="mr-1 mb-1 text-xs">
                                {topic.name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No topics yet</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
