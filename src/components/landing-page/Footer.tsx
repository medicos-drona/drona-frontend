import Link from "next/link"
import Image from "next/image"

export default function Footer() {
  return (
    <footer className="bg-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center">
          <Link href="/" className="inline-block mb-6">
            <Image src="/assets/logo/medicos-logo.svg" alt="Medicos Logo" width={180} height={50} className="h-auto" />
          </Link>

          <div className="flex flex-wrap justify-center items-center gap-6 mb-6">
            <Link href="/privacy" className="text-gray-600 hover:text-gray-900 transition-colors">
              Privacy policy
            </Link>
            <Link href="/terms" className="text-gray-600 hover:text-gray-900 transition-colors">
              Terms & conditions
            </Link>
            <Link href="/accessibility" className="text-gray-600 hover:text-gray-900 transition-colors">
              Accessibility guidelines
            </Link>
            <Link href="/contact" className="text-gray-600 hover:text-gray-900 transition-colors">
              Contact us
            </Link>
            <Link href="/sitemap" className="text-gray-600 hover:text-gray-900 transition-colors">
              Sitemap
            </Link>
          </div>

          <p className="text-gray-500 text-sm">
            Copyright © 2025, Medicos. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
