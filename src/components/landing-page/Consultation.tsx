"use client"

import Image from "next/image"
import { Phone, BarChart3, Users, Award, Clock, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

export default function Consultation() {
  const features = [
    { icon: Users, text: "25,000+ Students" },
    { icon: Award, text: "98% Success Rate" },
    { icon: Clock, text: "24/7 Support" },
    { icon: CheckCircle, text: "Expert Guidance" }
  ];

  return (
    <section id="consultation" className="w-full py-12 md:py-24 lg:py-32 overflow-hidden bg-gradient-to-br from-gray-50 to-green-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="flex flex-col gap-6"
          >
            <h2
              className="text-3xl md:text-5xl font-bold mb-4"
              style={{ fontFamily: "Nunito, sans-serif" }}
            >
              Get Personalized <span className="text-green-600">Study Plans</span> & Expert Guidance
            </h2>
            <p className="text-gray-600 md:text-lg max-w-md leading-relaxed">
              Our experienced mentors provide one-on-one guidance to help you create a winning strategy for NEET & JEE.
              Get personalized study plans, doubt clearing sessions, and performance analysis.
            </p>

            {/* Features Grid */}
            <div className="grid grid-cols-2 gap-4 my-6">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-center space-x-3 p-3 bg-white rounded-lg shadow-sm"
                >
                  <feature.icon className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-gray-700">{feature.text}</span>
                </motion.div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mt-6">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button className="rounded-lg bg-green-600 text-white hover:bg-green-700 px-8 py-3 font-semibold">
                  Get FREE Consultation
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="outline" className="rounded-lg border-green-600 text-green-600 hover:bg-green-50 px-8 py-3 font-semibold">
                  Call Now: +91 98765 43210
                </Button>
              </motion.div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="relative h-[400px] md:h-[500px]"
          >
            <div className="relative h-full w-full">
              {/* Main circular background */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1 }}
                viewport={{ once: true }}
                className="absolute right-0 top-0 w-[90%] h-[90%] bg-gradient-to-br from-green-100 to-blue-100 rounded-full"
              ></motion.div>

              {/* Person image */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                viewport={{ once: true }}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-full w-full z-10"
              >
                <Image
                  src="/assets/landing-page/right-guy.png"
                  alt="Expert mentor providing guidance"
                  width={700}
                  height={700}
                  className="object-contain h-full w-full"
                />
              </motion.div>

              {/* Floating elements with animations */}
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                animate={{ y: [0, -10, 0] }}
                transition={{
                  opacity: { duration: 0.5, delay: 0.5 },
                  scale: { duration: 0.5, delay: 0.5 },
                  y: { duration: 2, repeat: Infinity }
                }}
                className="absolute top-[20%] right-[30%] bg-green-600 text-white p-3 rounded-full shadow-lg hidden md:block"
              >
                <Phone className="w-6 h-6" />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                animate={{ x: [0, 10, 0] }}
                transition={{
                  opacity: { duration: 0.5, delay: 0.7 },
                  scale: { duration: 0.5, delay: 0.7 },
                  x: { duration: 3, repeat: Infinity }
                }}
                className="absolute top-[50%] left-[10%] bg-white p-3 rounded-lg shadow-lg hidden md:block"
              >
                <BarChart3 className="w-6 h-6 text-green-600" />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                animate={{ y: [0, 10, 0] }}
                transition={{
                  opacity: { duration: 0.5, delay: 0.9 },
                  scale: { duration: 0.5, delay: 0.9 },
                  y: { duration: 2.5, repeat: Infinity }
                }}
                className="absolute bottom-[30%] right-[10%] bg-white py-2 px-4 rounded-lg shadow-lg hidden md:block"
              >
                <p className="text-sm font-medium">
                  <span className="text-green-600">25k+</span> Success Stories
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{
                  opacity: { duration: 0.5, delay: 1.1 },
                  scale: { duration: 0.5, delay: 1.1 },
                  rotate: { duration: 4, repeat: Infinity }
                }}
                className="absolute top-[70%] left-[20%] bg-blue-500 text-white p-2 rounded-lg shadow-lg hidden md:block"
              >
                <Award className="w-5 h-5" />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
