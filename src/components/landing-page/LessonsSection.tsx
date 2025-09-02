// app/components/LessonsSection.tsx
import { BookOpen, Atom, FlaskRoundIcon as Flask, Microscope, LucideIcon } from "lucide-react";
import SubjectCard from "./SubjectCard";
import { JSX } from "react";

type ColorTheme = "purple" | "amber" | "red" | "teal";

interface Subject {
  title: string;
  icon: LucideIcon;
  color: ColorTheme;
}

export default function LessonsSection(): JSX.Element {
  const subjects: Subject[] = [
    { title: "Math", icon: BookOpen, color: "purple" },
    { title: "Physics", icon: Atom, color: "amber" },
    { title: "Chemistry", icon: Flask, color: "red" },
    { title: "Biology", icon: Microscope, color: "teal" }
  ];

  return (
    <div className="text-center mb-16">
      <h2
        className="text-3xl md:text-5xl font-bold text-center mb-12"
        style={{ fontFamily: "Nunito, sans-serif" }}
      >
        Lessons revolve around 4 areas
      </h2>
      <p className="text-gray-600 mb-10 max-w-3xl mx-auto">
        Comprehensive Lessons in Math, Physics, Chemistry & Biology
      </p>

      {/* Subject Cards - Responsive Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {subjects.map((subject, index) => (
          <SubjectCard
            key={index}
            title={subject.title}
            icon={subject.icon}
            color={subject.color}
          />
        ))}
      </div>
    </div>
  );
}
