// Shared types for questions
export interface QuestionOption {
  label: string;
  text: string;
  imageUrl?: string;
  isImageOption?: boolean; // Flag to indicate if this option is primarily an image
}

export interface QuestionSolution {
  final_explanation: string;
  key_concepts: string[];
  methodology: string;
  steps: string[];
}

export interface FormattedQuestion {
  id: string;
  subject: string;
  chapter: string; // Changed from topic to chapter
  text: string;
  options: QuestionOption[];
  difficulty: string;
  correctAnswer: string;
  reviewStatus: string;
  solution?: QuestionSolution;
  hints?: string[];
}

export interface ApiQuestion {
  _id: string;
  content: string;
  options: string[] | any[];
  answer: string;
  imageUrls?: string[];
  subjectId: {
    _id: string;
    name: string;
  };
  topicId?: {
    _id: string;
    name: string;
  };
  chapterId?: {
    _id: string;
    name: string;
  };
  difficulty: string;
  type: string;
  status: string;
  reviewStatus: string;
  createdAt: string;
  explanation?: string;
  solution?: QuestionSolution;
  hints?: string[];
}

export interface Subject {
  _id: string;
  name: string;
  topics?: Topic[]; // Keep for backward compatibility
  chapters?: Chapter[]; // Chapter support with nested topics
}

export interface Chapter {
  _id: string;
  name: string;
  subjectId?: string;
  topics?: Topic[]; // Topics under this chapter
}

export interface Topic {
  _id: string;
  name: string;
  chapterId?: string; // Topic belongs to chapter
  subjectId?: string; // Keep for backward compatibility
}

// Extended interfaces for the full hierarchy
export interface SubjectWithChaptersAndTopics {
  _id: string;
  name: string;
  description?: string;
  chapters: ChapterWithTopics[];
}

export interface ChapterWithTopics {
  _id: string;
  name: string;
  description?: string;
  subjectId?: string;
  topics: Topic[];
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}