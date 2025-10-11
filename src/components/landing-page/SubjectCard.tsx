"use client"

import { LucideIcon } from "lucide-react";
import { JSX } from "react";
import { motion } from "framer-motion";

type ColorTheme = "purple" | "amber" | "red" | "teal";

interface ColorMap {
  [key: string]: {
    border: string;
    bg: string;
    text: string;
    gradient: string;
  };
}

interface SubjectCardProps {
  title: string;
  icon: LucideIcon;
  color: ColorTheme;
  description?: string;
  topics?: number;
}

export default function SubjectCard({ title, icon: Icon, color, description, topics }: SubjectCardProps): JSX.Element {
  const colorMap: ColorMap = {
    purple: {
      border: "border-l-purple-500",
      bg: "bg-purple-50",
      text: "text-purple-600",
      gradient: "from-purple-500 to-purple-600"
    },
    amber: {
      border: "border-l-amber-500",
      bg: "bg-amber-50",
      text: "text-amber-600",
      gradient: "from-amber-500 to-amber-600"
    },
    red: {
      border: "border-l-red-500",
      bg: "bg-red-50",
      text: "text-red-600",
      gradient: "from-red-500 to-red-600"
    },
    teal: {
      border: "border-l-teal-500",
      bg: "bg-teal-50",
      text: "text-teal-600",
      gradient: "from-teal-500 to-teal-600"
    }
  };

  const { border, bg, text, gradient } = colorMap[color];

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`bg-white rounded-xl shadow-lg p-6 border-l-4 ${border} hover:shadow-xl transition-all duration-300 group cursor-pointer h-full`}
    >
      <div className="flex items-center justify-center mb-6">
        <div className={`${bg} p-4 rounded-xl group-hover:scale-110 transition-transform duration-300`}>
          <Icon className={`h-8 w-8 ${text}`} />
        </div>
      </div>

      <h3
        className="text-xl font-bold mb-3 text-gray-800 group-hover:text-gray-900 transition-colors"
        style={{ fontFamily: "Nunito, sans-serif" }}
      >
        {title}
      </h3>

      {description && (
        <p className="text-gray-600 text-sm mb-4 leading-relaxed">
          {description}
        </p>
      )}

      {topics && (
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
          <span className="text-sm text-gray-500">Practice Questions</span>
          <span className={`font-bold ${text}`}>{topics.toLocaleString()}+</span>
        </div>
      )}

      <div className={`mt-4 h-1 bg-gradient-to-r ${gradient} rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
    </motion.div>
  );
}
