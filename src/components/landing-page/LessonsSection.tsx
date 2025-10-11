"use client"

import { Calculator, Atom, FlaskRoundIcon as Flask, Microscope, LucideIcon } from "lucide-react";
import SubjectCard from "./SubjectCard";
import { JSX } from "react";
import { motion } from "framer-motion";

type ColorTheme = "purple" | "amber" | "red" | "teal";

interface Subject {
  title: string;
  icon: LucideIcon;
  color: ColorTheme;
  description: string;
  topics: number;
}

export default function LessonsSection(): JSX.Element {
  const subjects: Subject[] = [
    {
      title: "Mathematics",
      icon: Calculator,
      color: "purple",
      description: "Algebra, Calculus, Trigonometry, Coordinate Geometry",
      topics: 850
    },
    {
      title: "Physics",
      icon: Atom,
      color: "amber",
      description: "Mechanics, Thermodynamics, Optics, Modern Physics",
      topics: 920
    },
    {
      title: "Chemistry",
      icon: Flask,
      color: "red",
      description: "Organic, Inorganic, Physical Chemistry",
      topics: 780
    },
    {
      title: "Biology",
      icon: Microscope,
      color: "teal",
      description: "Botany, Zoology, Human Physiology, Genetics",
      topics: 650
    }
  ];

  return (
    <div className="text-center mb-20">
      <motion.h2
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="text-3xl md:text-5xl font-bold text-center mb-6"
        style={{ fontFamily: "Nunito, sans-serif" }}
      >
        Master All Core Subjects
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        viewport={{ once: true }}
        className="text-gray-600 mb-12 max-w-3xl mx-auto text-lg"
      >
        Comprehensive study materials covering all NEET & JEE subjects with 3,200+ practice questions,
        detailed solutions, and topic-wise analysis to ensure complete preparation.
      </motion.p>

      {/* Subject Cards - Responsive Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {subjects.map((subject, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            viewport={{ once: true }}
            whileHover={{ y: -10 }}
            className="group"
          >
            <SubjectCard
              title={subject.title}
              icon={subject.icon}
              color={subject.color}
              description={subject.description}
              topics={subject.topics}
            />
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        viewport={{ once: true }}
        className="mt-12"
      >
        <p className="text-gray-500 text-sm mb-4">All subjects aligned with latest NEET & JEE syllabus</p>
        <div className="flex justify-center items-center space-x-8 text-sm text-gray-600">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            <span>Updated Curriculum</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
            <span>Expert Verified</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
            <span>AI-Powered</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
