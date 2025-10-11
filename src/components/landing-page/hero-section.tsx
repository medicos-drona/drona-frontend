"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Star, Users, Award } from "lucide-react"

export default function HeroSection() {
  return (
    <div className="flex flex-col space-y-6">
      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-3xl md:text-5xl font-extrabold leading-tight md:leading-none"
        style={{ fontFamily: "Nunito, sans-serif" }}
      >
        Master NEET & JEE with India's Most Trusted Platform
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="text-gray-600 text-lg"
      >
        Join 25,000+ successful students who cracked NEET & JEE with our comprehensive question banks,
        AI-powered mock tests, and expert guidance. Start your journey to top medical and engineering colleges today.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <Link
          href="/login"
          className="inline-block px-8 py-4 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          style={{ backgroundColor: "#05603A" }}
        >
          Start Free Trial
        </Link>
        <Link
          href="#about"
          className="inline-block px-8 py-4 text-gray-700 font-semibold border-2 border-gray-300 rounded-lg hover:border-gray-400 transition-all duration-300"
        >
          Learn More
        </Link>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mt-6"
      >
        <div className="flex items-center">
          <div className="flex -space-x-2 mr-3">
            <Image
              src="/assets/landing-page/pro-user-1.png"
              alt="Student"
              width={40}
              height={40}
              className="rounded-full border-2 border-white shadow-sm"
            />
            <Image
              src="/assets/landing-page/pro-user-2.png"
              alt="Student"
              width={40}
              height={40}
              className="rounded-full border-2 border-white shadow-sm"
            />
            <Image
              src="/assets/landing-page/pro-user-3.png"
              alt="Student"
              width={40}
              height={40}
              className="rounded-full border-2 border-white shadow-sm"
            />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center">
              <span className="font-bold text-lg">25,000+</span>
              <Users className="w-4 h-4 ml-1 text-gray-500" />
            </div>
            <span className="text-sm text-gray-600">Active Students</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center">
            <div className="flex text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
            </div>
            <span className="ml-2 font-semibold">4.9/5</span>
          </div>
          <div className="flex items-center text-green-600">
            <Award className="w-5 h-5 mr-1" />
            <span className="font-semibold">98% Success Rate</span>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
