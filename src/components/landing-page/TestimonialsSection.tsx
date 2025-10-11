"use client"

import React, { useState } from "react"
import { ChevronLeft, ChevronRight, User } from "lucide-react"
import { motion } from "framer-motion"

const testimonials = [
  {
    id: 1,
    name: "Priya Sharma",
    role: "NEET 2024 - AIR 247",
    college: "AIIMS Delhi",
    text: "Medicos transformed my NEET preparation completely. The personalized study plan and mock tests helped me identify my weak areas. The doubt clearing sessions were incredibly helpful. I secured AIR 247 and got admission to AIIMS Delhi!",
    score: "720/720"
  },
  {
    id: 2,
    name: "Arjun Patel",
    role: "JEE Main 2024 - 99.8 Percentile",
    college: "IIT Bombay",
    text: "The quality of questions and detailed solutions at Medicos is unmatched. Their AI-powered analysis helped me focus on the right topics. I scored 99.8 percentile in JEE Main and cleared JEE Advanced for IIT Bombay CSE!",
    score: "300/300"
  },
  {
    id: 3,
    name: "Sneha Reddy",
    role: "NEET 2024 - AIR 156",
    college: "JIPMER Puducherry",
    text: "The mentorship program at Medicos was a game-changer. My mentor guided me through every step, from time management to exam strategy. The regular assessments kept me motivated throughout my preparation journey.",
    score: "715/720"
  },
  {
    id: 4,
    name: "Rahul Kumar",
    role: "JEE Advanced 2024 - AIR 89",
    college: "IIT Delhi",
    text: "Medicos made JEE preparation enjoyable and systematic. The live classes were interactive, and the faculty was always available for doubts. Their test series closely matched the actual exam pattern. Highly recommended!",
    score: "334/360"
  },
  {
    id: 5,
    name: "Kavya Iyer",
    role: "NEET 2024 - AIR 98",
    college: "AFMC Pune",
    text: "The comprehensive study material and regular revision sessions at Medicos helped me stay consistent. The faculty's guidance and motivation were crucial in my success. Thank you for making my dream come true!",
    score: "718/720"
  },
  {
    id: 6,
    name: "Aditya Singh",
    role: "JEE Main 2024 - 99.9 Percentile",
    college: "IIT Kanpur",
    text: "Medicos provided the perfect blend of conceptual clarity and problem-solving techniques. The doubt resolution was quick and effective. The mock tests helped me improve my speed and accuracy significantly.",
    score: "299/300"
  }
]

const decorativeElements = [
  { id: 1, icon: "📚", position: "top-4 left-8" },
  { id: 2, icon: "🎯", position: "top-8 right-12" },
  { id: 3, icon: "💡", position: "bottom-12 left-4" },
  { id: 4, icon: "🏆", position: "bottom-8 right-8" },
  { id: 5, icon: "📖", position: "top-1/2 left-12" },
  { id: 6, icon: "✨", position: "top-1/3 right-4" },
]

export default function TestimonialsSection() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0)
  const [phoneNumber, setPhoneNumber] = useState("")
  const [isSubscribed, setIsSubscribed] = useState(false)

  // Show 3 testimonials at a time, starting from currentTestimonial
  const getVisibleTestimonials = () => {
    const visible = []
    for (let i = 0; i < 3; i++) {
      const index = (currentTestimonial + i) % testimonials.length
      visible.push(testimonials[index])
    }
    return visible
  }

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
  }

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    if (phoneNumber.trim()) {
      setIsSubscribed(true)
      console.log("Phone number submitted:", phoneNumber)
      setTimeout(() => {
        setIsSubscribed(false)
        setPhoneNumber("")
      }, 2000)
    }
  }

  return (
    <div className="w-full">
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              What Our Students Say About Us
            </h2>
            <p className="text-gray-600 text-lg max-w-3xl mx-auto">
              Hear from our successful NEET & JEE toppers who achieved their dreams with Medicos
            </p>
          </motion.div>

          {/* Navigation Arrows and Indicators */}
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center space-x-2">
              {/* Pagination Dots */}
              <div className="flex space-x-2">
                {Array.from({ length: testimonials.length }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentTestimonial(i)}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      i === currentTestimonial ? 'bg-green-600' : 'bg-gray-300'
                    }`}
                    aria-label={`Go to testimonial ${i + 1}`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-500 ml-4">
                {currentTestimonial + 1} of {testimonials.length}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={prevTestimonial}
                className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                aria-label="Previous testimonials"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={nextTestimonial}
                className="p-3 rounded-full bg-green-600 hover:bg-green-700 transition-colors"
                aria-label="Next testimonials"
              >
                <ChevronRight className="w-5 h-5 text-white" />
              </motion.button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {getVisibleTestimonials().map((testimonial, index) => (
              <motion.div
                key={`${testimonial.id}-${currentTestimonial}`}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`p-6 rounded-2xl ${
                  index === 0 ? 'bg-green-600 text-white' : 'bg-gray-50 text-gray-900'
                }`}
              >
                <div className="flex items-center mb-4">
                  <div className={`w-12 h-12 rounded-full mr-4 flex items-center justify-center ${
                    index === 0 ? 'bg-white bg-opacity-20' : 'bg-green-100'
                  }`}>
                    <User className={`w-6 h-6 ${
                      index === 0 ? 'text-white' : 'text-green-600'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg">{testimonial.name}</h4>
                    <p className={`text-sm font-medium ${index === 0 ? 'text-green-100' : 'text-green-600'}`}>
                      {testimonial.role}
                    </p>
                    <p className={`text-xs ${index === 0 ? 'text-green-200' : 'text-gray-500'}`}>
                      {testimonial.college}
                    </p>
                  </div>
                  <div className={`text-right ${index === 0 ? 'text-white' : 'text-green-600'}`}>
                    <p className="text-sm font-bold">Score</p>
                    <p className="text-lg font-bold">{testimonial.score}</p>
                  </div>
                </div>
                <p className={`text-sm leading-relaxed ${index === 0 ? 'text-white' : 'text-gray-700'}`}>
                  {testimonial.text}
                </p>

                {/* Achievement Badge */}
                <div className={`mt-4 inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                  index === 0
                    ? 'bg-white bg-opacity-20 text-white'
                    : 'bg-green-100 text-green-800'
                }`}>
                  🏆 Top Ranker
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50 relative overflow-hidden">
        {decorativeElements.map((element) => (
          <motion.div
            key={element.id}
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: element.id * 0.1 }}
            viewport={{ once: true }}
            className={`absolute ${element.position} hidden lg:block`}
          >
            <div className="w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center text-2xl">
              {element.icon}
            </div>
          </motion.div>
        ))}

        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Do you still have any questions?
            </h2>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              Don't hesitate to leave us your phone number. We will contact you to discuss any questions you may have.
            </p>

            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Enter your phone number"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={isSubscribed}
                className="px-8 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubscribed ? "Subscribed!" : "Subscribe"}
              </motion.button>
            </form>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
