"use client"

import * as React from "react"
import { Nunito, Manrope } from "next/font/google"
import Image from "next/image"
import { motion } from "framer-motion"
import { TrendingUp, Users, BookOpen, Award, Target, Zap } from "lucide-react"

const nunito = Nunito({
  subsets: ["latin"],
  weight: "800",
  variable: "--font-nunito",
})

const manrope = Manrope({
  subsets: ["latin"],
  weight: "500",
  variable: "--font-manrope",
})

export default function EducationLanding() {
  const achievements = [
    { icon: Users, value: "25,000+", label: "Students Enrolled" },
    { icon: Award, value: "98%", label: "Success Rate" },
    { icon: BookOpen, value: "50,000+", label: "Questions Bank" },
    { icon: Target, value: "500+", label: "Top Ranks" }
  ];

  const features = [
    { icon: Zap, text: "AI-Powered Learning" },
    { icon: TrendingUp, text: "Performance Analytics" },
    { icon: BookOpen, text: "Comprehensive Study Material" },
    { icon: Users, text: "Expert Mentorship" }
  ];

  return (
    <div className={`${nunito.variable} ${manrope.variable} min-h-screen relative overflow-hidden`} style={{ backgroundColor: "#05603A" }}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-32 h-32 border border-white/20 rounded-full"></div>
        <div className="absolute top-40 right-32 w-24 h-24 border border-white/20 rounded-full"></div>
        <div className="absolute bottom-32 left-40 w-20 h-20 border border-white/20 rounded-full"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-12 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-white space-y-8"
          >
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-3xl md:text-5xl font-nunito text-white leading-tight"
              style={{ fontFamily: "Nunito, sans-serif" }}
            >
              Transforming Medical & Engineering Education for the Next Generation
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
              className="font-manrope text-white/90 text-lg leading-relaxed"
              style={{
                fontFamily: "var(--font-manrope)",
                fontWeight: 500,
              }}
            >
              We're revolutionizing how students prepare for NEET & JEE with cutting-edge technology,
              personalized learning paths, and expert guidance. Join thousands of successful students
              who achieved their dreams with our proven methodology.
            </motion.p>

            {/* Features List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              viewport={{ once: true }}
              className="grid grid-cols-2 gap-4"
            >
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-center space-x-3"
                >
                  <feature.icon className="w-5 h-5 text-green-300" />
                  <span className="text-white/90 text-sm">{feature.text}</span>
                </motion.div>
              ))}
            </motion.div>

            {/* Achievements */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1 }}
              viewport={{ once: true }}
              className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8"
            >
              {achievements.map((achievement, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 1.2 + index * 0.1 }}
                  viewport={{ once: true }}
                  className="text-center"
                >
                  <achievement.icon className="w-8 h-8 text-green-300 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">{achievement.value}</div>
                  <div className="text-white/70 text-sm">{achievement.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right Content - Dashboard Images */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
            className="relative h-full flex flex-col items-center justify-center lg:justify-end"
          >
            {/* Main Dashboard Image - Hidden on mobile */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
              viewport={{ once: true }}
              className="relative w-full max-w-[591px] lg:w-[591px] h-auto hidden lg:block -my-4"
            >
              <Image
                src="/assets/landing-page/trans-merged.png"
                alt="Advanced Learning Dashboard Interface"
                width={591}
                height={597}
                className="object-contain drop-shadow-2xl"
                style={{ marginTop: "-10px", marginBottom: "-10px" }}
              />

              {/* Floating elements around dashboard */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -top-4 -right-4 bg-white/20 backdrop-blur-sm rounded-lg p-3"
              >
                <TrendingUp className="w-6 h-6 text-white" />
              </motion.div>

              <motion.div
                animate={{ x: [0, 10, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute -bottom-4 -left-4 bg-white/20 backdrop-blur-sm rounded-lg p-3"
              >
                <Award className="w-6 h-6 text-white" />
              </motion.div>
            </motion.div>

            {/* Mobile Dashboard Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
              viewport={{ once: true }}
              className="relative w-full max-w-[591px] lg:w-[591px] h-auto block lg:hidden -my-4"
            >
              <Image
                src="/assets/landing-page/trans-1.png"
                alt="Mobile Learning Dashboard Interface"
                width={591}
                height={597}
                className="object-contain drop-shadow-2xl"
              />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
