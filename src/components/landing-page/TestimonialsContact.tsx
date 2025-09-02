"use client"

import type React from "react"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

const testimonials = [
  {
    id: 1,
    name: "Amelia Joseph",
    role: "Chief Manager",
    image: "/placeholder.svg?height=60&width=60",
    text: "My vision came alive effortlessly. Their blend of casual and professional approach made the process a breeze. Creativity flowed, and the results were beyond my expectations.",
  },
  {
    id: 2,
    name: "Jacob Joshua",
    role: "Chief Manager",
    image: "/placeholder.svg?height=60&width=60",
    text: "I found the digital expertise I needed. Their creative-professional balance exceeded expectations. Friendly interactions, exceptional outcomes. For digital enchantment, it's got to be Embrace!",
  },
  {
    id: 3,
    name: "Sarah Wilson",
    role: "Creative Director",
    image: "/placeholder.svg?height=60&width=60",
    text: "Embrace really nailed our brand's authentic style. They're the perfect blend of creativity and strategy. Thrilled with the results and ongoing partnership.",
  },
]

const floatingAvatars = [
  { id: 1, image: "/assets/landing-page/q-1.png", position: "top-4 left-8" },
  { id: 2, image: "/assets/landing-page/q-2.png", position: "top-8 right-12" },
  { id: 3, image: "/assets/landing-page/q-3.png", position: "bottom-12 left-4" },
  { id: 4, image: "/assets/landing-page/q-4.png", position: "bottom-8 right-8" },
  { id: 5, image: "/assets/landing-page/q-5.png", position: "top-1/2 left-12" },
  { id: 6, image: "/assets/landing-page/q-6.png", position: "top-1/3 right-4" },
]

export default function TestimonialsContact() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0)
  const [phoneNumber, setPhoneNumber] = useState("")
  const [isSubscribed, setIsSubscribed] = useState(false)

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
      // Here you would typically send the phone number to your backend
      console.log("Phone number submitted:", phoneNumber)
      setTimeout(() => {
        setIsSubscribed(false)
        setPhoneNumber("")
      }, 2000)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Testimonials Section */}
      <section className="py-16 px-4 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-12">
          <h2
            className="text-3xl md:text-5xl font-bold mb-8 text-center"
            style={{ fontFamily: "Nunito, sans-serif" }}
          >
            What Our Client Said About Us
          </h2>
          <div className="hidden md:flex items-center space-x-2">
            <button
              onClick={prevTestimonial}
              className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={nextTestimonial}
              className="p-3 rounded-full transition-colors"
              style={{ backgroundColor: "#087E3F" }}
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Desktop Testimonials Grid */}
        <div className="hidden md:grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.id}
              className={`p-6 rounded-2xl transition-all duration-300 ${
                index === currentTestimonial ? "text-white shadow-xl" : "bg-white border border-gray-200 text-gray-900"
              }`}
              style={{
                backgroundColor: index === currentTestimonial ? "#087E3F" : "white",
              }}
            >
              <div className="flex items-center space-x-3 mb-4">
                <img
                  src={testimonial.image || "/placeholder.svg"}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <h3 className="font-semibold text-lg">{testimonial.name}</h3>
                  <p className={`text-sm ${index === currentTestimonial ? "text-green-100" : "text-gray-600"}`}>
                    {testimonial.role}
                  </p>
                </div>
              </div>
              <p
                className={`text-sm leading-relaxed ${index === currentTestimonial ? "text-green-50" : "text-gray-700"}`}
              >
                {testimonial.text}
              </p>
            </div>
          ))}
        </div>

        {/* Mobile Testimonials Carousel */}
        <div className="md:hidden">
          <div className="p-6 rounded-2xl text-white shadow-xl mb-6" style={{ backgroundColor: "#087E3F" }}>
            <div className="flex items-center space-x-3 mb-4">
              <img
                src={testimonials[currentTestimonial].image || "/placeholder.svg"}
                alt={testimonials[currentTestimonial].name}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <h3 className="font-semibold text-lg">{testimonials[currentTestimonial].name}</h3>
                <p className="text-sm text-green-100">{testimonials[currentTestimonial].role}</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-green-50">{testimonials[currentTestimonial].text}</p>
          </div>

          {/* Mobile Pagination Dots */}
          <div className="flex justify-center space-x-2 mb-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentTestimonial(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentTestimonial ? "bg-green-600" : "bg-gray-300"
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>

          {/* Mobile Navigation Buttons */}
          <div className="flex justify-center space-x-4">
            <button
              onClick={prevTestimonial}
              className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={nextTestimonial}
              className="p-3 rounded-full transition-colors"
              style={{ backgroundColor: "#087E3F" }}
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </section>

      {/* Questions Section */}
      <section className="py-8 md:py-16 px-4 relative overflow-hidden md:max-w-6xl md:mx-auto md:rounded-2xl md:my-12" style={{ backgroundColor: "#F3F3F3" }}>
        {/* Floating Avatars */}
        {floatingAvatars.map((avatar) => (
          <div key={avatar.id} className={`absolute hidden lg:block ${avatar.position} animate-pulse`}>
            <img
              src={avatar.image || "/placeholder.svg"}
              alt="User avatar"
              className="w-10 h-10 rounded-full object-cover shadow-lg"
            />
          </div>
        ))}

        <div className="max-w-2xl mx-auto text-center relative z-10 ">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Do you still have any questions?</h2>
          <p className="text-gray-600 mb-8 text-sm md:text-base">
            Don't hesitate to leave us your phone number. We will contact you to discuss any questions you may have
          </p>

          <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Enter your phone number"
              className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
            <button
              type="submit"
              disabled={isSubscribed}
              className="px-6 py-3 rounded-lg text-white font-medium transition-all duration-200 hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: "#087E3F80" }}
            >
              {isSubscribed ? "Subscribed!" : "Subscribe"}
            </button>
          </form>

          {isSubscribed && <p className="mt-4 text-green-600 font-medium">Thank you! We'll contact you soon.</p>}
        </div>
      </section>
    </div>
  )
}
