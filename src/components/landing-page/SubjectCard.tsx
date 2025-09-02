// app/components/SubjectCard.tsx
import { LucideIcon } from "lucide-react";
import { JSX } from "react";

type ColorTheme = "purple" | "amber" | "red" | "teal";

interface ColorMap {
  [key: string]: {
    border: string;
    bg: string;
    text: string;
  };
}

interface SubjectCardProps {
  title: string;
  icon: LucideIcon;
  color: ColorTheme;
}

export default function SubjectCard({ title, icon: Icon, color }: SubjectCardProps): JSX.Element {
  const colorMap: ColorMap = {
    purple: {
      border: "border-l-purple-200",
      bg: "bg-purple-100",
      text: "text-purple-500"
    },
    amber: {
      border: "border-l-amber-200",
      bg: "bg-amber-100",
      text: "text-amber-500"
    },
    red: {
      border: "border-l-red-200",
      bg: "bg-red-100",
      text: "text-red-500"
    },
    teal: {
      border: "border-l-teal-200",
      bg: "bg-teal-100",
      text: "text-teal-500"
    }
  };

  const { border, bg, text } = colorMap[color];

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${border} hover:shadow-lg transition-shadow`}>
      <div className="flex items-center justify-center mb-4">
        <div className={`${bg} p-3 rounded-lg`}>
          <Icon className={`h-6 w-6 ${text}`} />
        </div>
      </div>
      <h3
        className="text-3xl md:text-5xl font-semibold mb-2"
        style={{ fontFamily: "Nunito, sans-serif" }}
      >
        {title}
      </h3>
    </div>
  );
}
