import Link from "next/link"
import Image from "next/image"

export default function Footer() {
  const footerLinks = [
    { name: "Privacy policy", href: "/privacy" },
    { name: "Terms & conditions", href: "/terms" },
    { name: "Accessibility guidelines", href: "/accessibility" },
    { name: "Contact us", href: "/contact" },
    { name: "Sitemap", href: "/sitemap" },
  ]

  return (
    <footer className="py-12 px-4" style={{ backgroundColor: "#087E3F14" }}>
      <div className="max-w-6xl mx-auto">
        {/* Logo Section */}
          <div className="flex justify-center mb-8">
            <Link href="/" className="flex items-center">
              <Image src="/assets/logo/medicos-logo.svg" alt="Medicos Logo" width={120} height={40} className="h-auto" />
            </Link>
          </div>

        {/* Navigation Links */}
        <nav className="flex flex-wrap justify-center items-center gap-6 md:gap-8 mb-8">
          {footerLinks.map((link, index) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-gray-600 hover:text-gray-800 transition-colors duration-200 text-sm md:text-base"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Copyright */}
        <div className="text-center">
          <p className="text-gray-500 text-sm">Copyright © 2025, Medicos. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
