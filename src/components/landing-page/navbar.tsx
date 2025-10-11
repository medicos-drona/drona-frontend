"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Menu } from "lucide-react"

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <header className="">
      <div className="container mx-auto">
<div className="flex items-center justify-between h-22 md:h-26">
          <Link href="/" className="flex items-center">
            <Image src="/assets/logo/medicos-logo.svg" alt="Medicos Logo" width={224} height={40} className="h-auto" />
          </Link>

          {/* Mobile menu button */}
          <button className="md:hidden focus:outline-none" onClick={toggleMenu} aria-label="Toggle menu">
            <Menu className="h-6 w-6" />
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="#home"
              className="text-base font-normal text-gray-900 hover:text-gray-600"
              style={{ fontFamily: "Proxima Nova, sans-serif", letterSpacing: "-0.15px" }}
            >
              Home
            </Link>
            <Link
              href="#about"
              className="text-base font-normal text-gray-900 hover:text-gray-600"
              style={{ fontFamily: "Proxima Nova, sans-serif", letterSpacing: "-0.15px" }}
            >
              About
            </Link>
            <Link
              href="#courses"
              className="text-base font-normal text-gray-900 hover:text-gray-600"
              style={{ fontFamily: "Proxima Nova, sans-serif", letterSpacing: "-0.15px" }}
            >
              Courses
            </Link>
            <Link
              href="#consultation"
              className="text-base font-normal text-gray-900 hover:text-gray-600"
              style={{ fontFamily: "Proxima Nova, sans-serif", letterSpacing: "-0.15px" }}
            >
              Consultation
            </Link>
            <Link
              href="#testimonials"
              className="text-base font-normal text-gray-900 hover:text-gray-600"
              style={{ fontFamily: "Proxima Nova, sans-serif", letterSpacing: "-0.15px" }}
            >
              Testimonials
            </Link>
            <Link
              href="#contact"
              className="text-base font-normal text-gray-900 border border-gray-300 rounded-full px-6 py-2 hover:bg-gray-50"
              style={{ fontFamily: "Proxima Nova, sans-serif", letterSpacing: "-0.15px" }}
            >
              Contact Us
            </Link>
          </nav>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <nav className="flex flex-col space-y-4 pb-4">
              <Link
                href="#home"
                className="text-base font-normal text-gray-900 hover:text-gray-600"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="#about"
                className="text-base font-normal text-gray-900 hover:text-gray-600"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
              <Link
                href="#courses"
                className="text-base font-normal text-gray-900 hover:text-gray-600"
                onClick={() => setIsMenuOpen(false)}
              >
                Courses
              </Link>
              <Link
                href="#consultation"
                className="text-base font-normal text-gray-900 hover:text-gray-600"
                onClick={() => setIsMenuOpen(false)}
              >
                Consultation
              </Link>
              <Link
                href="#testimonials"
                className="text-base font-normal text-gray-900 hover:text-gray-600"
                onClick={() => setIsMenuOpen(false)}
              >
                Testimonials
              </Link>
              <Link
                href="#contact"
                className="text-base font-normal text-gray-900 border border-gray-300 rounded-full px-6 py-2 hover:bg-gray-50 inline-block w-fit"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact Us
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
