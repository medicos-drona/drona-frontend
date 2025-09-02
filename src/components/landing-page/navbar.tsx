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
      <div className="container mx-auto px-4">
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
              href="/"
              className="text-base font-normal text-gray-900 hover:text-gray-600"
              style={{ fontFamily: "Proxima Nova, sans-serif", letterSpacing: "-0.15px" }}
            >
              Home
            </Link>
            <Link
              href="/about"
              className="text-base font-normal text-gray-900 hover:text-gray-600"
              style={{ fontFamily: "Proxima Nova, sans-serif", letterSpacing: "-0.15px" }}
            >
              About
            </Link>
            <Link
              href="/services"
              className="text-base font-normal text-gray-900 hover:text-gray-600"
              style={{ fontFamily: "Proxima Nova, sans-serif", letterSpacing: "-0.15px" }}
            >
              Services
            </Link>
            <Link
              href="/pricing"
              className="text-base font-normal text-gray-900 hover:text-gray-600"
              style={{ fontFamily: "Proxima Nova, sans-serif", letterSpacing: "-0.15px" }}
            >
              Pricing
            </Link>
            <Link
              href="/contact"
              className="text-base font-normal text-gray-900 hover:text-gray-600"
              style={{ fontFamily: "Proxima Nova, sans-serif", letterSpacing: "-0.15px" }}
            >
              Contact
            </Link>
            <Link
              href="/try-free"
              className="text-base font-normal text-gray-900 border border-gray-300 rounded-full px-6 py-2 hover:bg-gray-50"
              style={{ fontFamily: "Proxima Nova, sans-serif", letterSpacing: "-0.15px" }}
            >
              Try for Free
            </Link>
          </nav>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <nav className="flex flex-col space-y-4 pb-4">
              <Link
                href="/"
                className="text-base font-normal text-gray-900 hover:text-gray-600"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/about"
                className="text-base font-normal text-gray-900 hover:text-gray-600"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
              <Link
                href="/services"
                className="text-base font-normal text-gray-900 hover:text-gray-600"
                onClick={() => setIsMenuOpen(false)}
              >
                Services
              </Link>
              <Link
                href="/pricing"
                className="text-base font-normal text-gray-900 hover:text-gray-600"
                onClick={() => setIsMenuOpen(false)}
              >
                Pricing
              </Link>
              <Link
                href="/contact"
                className="text-base font-normal text-gray-900 hover:text-gray-600"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>
              <Link
                href="/try-free"
                className="text-base font-normal text-gray-900 border border-gray-300 rounded-full px-6 py-2 hover:bg-gray-50 inline-block w-fit"
                onClick={() => setIsMenuOpen(false)}
              >
                Try for Free
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
