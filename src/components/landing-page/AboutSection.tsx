"use client"

import Link from "next/link";
import { JSX } from "react";
import { ArrowRight, Target, BookOpen, Users, TrendingUp } from "lucide-react";
import SubjectChart from "./SubjectChart";
import { motion } from "framer-motion";

export default function AboutSection(): JSX.Element {
  const stats = [
    { icon: Users, value: "25,000+", label: "Students Enrolled" },
    { icon: BookOpen, value: "50,000+", label: "Practice Questions" },
    { icon: Target, value: "98%", label: "Success Rate" },
    { icon: TrendingUp, value: "15+", label: "Years Experience" }
  ];

  return (
    <div id="about" className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <h2
          className="text-3xl md:text-5xl font-bold mb-6"
          style={{ fontFamily: "Nunito, sans-serif" }}
        >
          About Medicos
        </h2>
        <p className="text-gray-600 mb-6 text-lg leading-relaxed">
          Medicos Edu Consultant Pvt. Ltd. is India's premier educational consultancy specializing in NEET and JEE exam
          preparation. With over 15 years of excellence, we have guided thousands of students to secure admissions in
          top medical and engineering colleges across India.
        </p>
        <p className="text-gray-600 mb-8 leading-relaxed">
          Our innovative approach combines AI-powered personalized learning, expert mentorship, and comprehensive
          practice materials to ensure every student achieves their dream rank. We believe in quality education
          that's accessible to all aspiring doctors and engineers.
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg"
            >
              <stat.icon className="w-8 h-8 text-green-600" />
              <div>
                <div className="font-bold text-xl text-gray-900">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            </motion.div>
          ))}
        </div>

        <Link href="#consultation" className="inline-flex items-center text-green-600 hover:text-green-700 font-semibold transition-colors">
          Learn More About Our Success <ArrowRight className="ml-2 h-5 w-5" />
        </Link>
      </motion.div>

      {/* Chart - Hidden on Mobile */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        viewport={{ once: true }}
      >
        <SubjectChart />
      </motion.div>
    </div>
  );
}
