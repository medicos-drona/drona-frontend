import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function TermsAndConditions() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Back to Home */}
        <Link 
          href="/" 
          className="inline-flex items-center text-green-600 hover:text-green-700 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>

        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Terms & Conditions</h1>
          <p className="text-gray-600 mb-8">Last updated: January 2025</p>

          <div className="space-y-8">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-700">
                By accessing and using Medicos platform, you accept and agree to be bound by the terms and 
                provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Use License</h2>
              <p className="text-gray-700 mb-4">
                Permission is granted to temporarily access Medicos platform for personal, non-commercial use only. This includes:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Accessing study materials and practice tests</li>
                <li>Participating in online classes and discussions</li>
                <li>Using performance analytics and progress tracking</li>
                <li>Downloading permitted educational content</li>
              </ul>
              <p className="text-gray-700 mt-4">
                This license shall automatically terminate if you violate any of these restrictions.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">3. User Accounts</h2>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>You must provide accurate and complete information when creating an account</li>
                <li>You are responsible for maintaining the confidentiality of your account credentials</li>
                <li>You must notify us immediately of any unauthorized use of your account</li>
                <li>One account per user; sharing accounts is prohibited</li>
                <li>We reserve the right to suspend or terminate accounts that violate our terms</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Payment and Subscriptions</h2>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Subscription fees are charged in advance and are non-refundable</li>
                <li>Prices may change with 30 days notice to existing subscribers</li>
                <li>Free trial periods may be offered at our discretion</li>
                <li>Automatic renewal can be cancelled anytime before the next billing cycle</li>
                <li>Refunds are provided only in exceptional circumstances</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Prohibited Uses</h2>
              <p className="text-gray-700 mb-4">You may not use our platform to:</p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Share or distribute copyrighted content without permission</li>
                <li>Attempt to hack, reverse engineer, or compromise our systems</li>
                <li>Create multiple accounts to circumvent restrictions</li>
                <li>Use automated tools to access or scrape our content</li>
                <li>Engage in any illegal or harmful activities</li>
                <li>Harass or abuse other users or our staff</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Content and Intellectual Property</h2>
              <p className="text-gray-700 mb-4">
                All content on Medicos platform, including but not limited to text, graphics, logos, images, 
                audio clips, and software, is the property of Medicos or its content suppliers and is protected 
                by copyright laws.
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>You may not reproduce, distribute, or create derivative works</li>
                <li>Screenshots and recordings of content are prohibited</li>
                <li>User-generated content remains your property but grants us usage rights</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Disclaimer</h2>
              <p className="text-gray-700">
                The information on this platform is provided on an "as is" basis. To the fullest extent 
                permitted by law, Medicos excludes all representations, warranties, and conditions relating 
                to our platform and the use of this platform.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Limitation of Liability</h2>
              <p className="text-gray-700">
                Medicos shall not be liable for any indirect, incidental, special, consequential, or punitive 
                damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">9. Contact Information</h2>
              <p className="text-gray-700">
                Questions about the Terms & Conditions should be sent to us at:
              </p>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-700">Email: medicosmangaluru@gmail.com</p>
                <p className="text-gray-700">Phone: +91 85535 77004</p>
                <p className="text-gray-700">Address: Medicos Education Pvt. Ltd., 2nd Floor, City Trade Centre, Opposite City Hospital, Mallikatte, Kadri, Mangaluru, Karnataka 570003, India</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
