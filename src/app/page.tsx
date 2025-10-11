
"use client"

import Navbar from "@/components/landing-page/navbar"
import HeroSection from "@/components/landing-page/hero-section"
import Image from "next/image"
import AboutSection from "@/components/landing-page/AboutSection"
import LessonsSection from "@/components/landing-page/LessonsSection"
// import NavigationTabs from "@/components/landing-page/NavigationTabs"
import Consultation from "@/components/landing-page/Consultation"
import TransformingEducation from "@/components/landing-page/TransformingEducation"
import TestimonialsSection from "@/components/landing-page/TestimonialsSection"
import Footer from "@/components/landing-page/Footer"
import { motion } from "framer-motion"

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <section id="home">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-8 md:py-4"
        >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <HeroSection />
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="hidden md:block relative"
          >
            <Image
              src="/assets/landing-page/hero.png"
              alt="NEET & JEE Dashboard"
              width={700}
              height={600}
              className="w-full h-auto"
            />
          </motion.div>
        </div>
        </motion.div>
      </section>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-12 text-center"
      >
        <p className="text-gray-600 mb-8">Trusted by 25,000+ students and 500+ educational institutions across India</p>
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
          {[
            { name: "CBSE", description: "Central Board of Secondary Education" },
            { name: "NCERT", description: "National Council of Educational Research" },
            { name: "NTA", description: "National Testing Agency" },
            { name: "AICTE", description: "All India Council for Technical Education" },
            { name: "MCI", description: "Medical Council of India" },
          ].map((partner, index) => (
            <motion.div
              key={partner.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05 }}
              className="text-center"
            >
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-green-300 transition-colors">
                <h3 className="font-bold text-lg text-gray-800 mb-1">{partner.name}</h3>
                <p className="text-xs text-gray-600">{partner.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <div className="w-full">
        <section id="about">
          <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-8">
            <AboutSection />
          </div>
        </section>
        <section id="courses">
          <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-8">
            <LessonsSection />
            {/* <NavigationTabs /> */}
          </div>
        </section>
        <section id="consultation">
          <Consultation />
        </section>
        <TransformingEducation />
        <section id="testimonials">
          <TestimonialsSection/>
        </section>
        <section id="contact">
          <Footer/>
        </section>
      </div>
    </main>
  )
}






