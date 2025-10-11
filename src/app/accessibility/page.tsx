import Link from "next/link"
import { ArrowLeft, Eye, Keyboard, Volume2, MousePointer } from "lucide-react"

export default function AccessibilityGuidelines() {
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
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Accessibility Guidelines</h1>
          <p className="text-gray-600 mb-8">
            Medicos is committed to ensuring digital accessibility for people with disabilities. 
            We continually improve the user experience for everyone.
          </p>

          <div className="space-y-8">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Our Commitment</h2>
              <p className="text-gray-700 mb-4">
                We strive to conform to the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA standards. 
                Our goal is to make our educational platform accessible to all students, regardless of their abilities.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Accessibility Features</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <Eye className="w-6 h-6 text-green-600 mr-3" />
                    <h3 className="text-lg font-semibold text-gray-900">Visual Accessibility</h3>
                  </div>
                  <ul className="text-gray-700 space-y-2">
                    <li>• High contrast color schemes</li>
                    <li>• Scalable fonts and text</li>
                    <li>• Alternative text for images</li>
                    <li>• Screen reader compatibility</li>
                    <li>• Focus indicators</li>
                  </ul>
                </div>

                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <Keyboard className="w-6 h-6 text-green-600 mr-3" />
                    <h3 className="text-lg font-semibold text-gray-900">Keyboard Navigation</h3>
                  </div>
                  <ul className="text-gray-700 space-y-2">
                    <li>• Full keyboard accessibility</li>
                    <li>• Tab order optimization</li>
                    <li>• Keyboard shortcuts</li>
                    <li>• Skip navigation links</li>
                    <li>• Logical focus flow</li>
                  </ul>
                </div>

                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <Volume2 className="w-6 h-6 text-green-600 mr-3" />
                    <h3 className="text-lg font-semibold text-gray-900">Audio & Video</h3>
                  </div>
                  <ul className="text-gray-700 space-y-2">
                    <li>• Closed captions for videos</li>
                    <li>• Audio descriptions</li>
                    <li>• Transcript availability</li>
                    <li>• Volume controls</li>
                    <li>• Auto-play prevention</li>
                  </ul>
                </div>

                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <MousePointer className="w-6 h-6 text-green-600 mr-3" />
                    <h3 className="text-lg font-semibold text-gray-900">Motor Accessibility</h3>
                  </div>
                  <ul className="text-gray-700 space-y-2">
                    <li>• Large click targets</li>
                    <li>• Drag and drop alternatives</li>
                    <li>• Timeout extensions</li>
                    <li>• Error prevention</li>
                    <li>• Voice control support</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Browser and Assistive Technology Support</h2>
              <p className="text-gray-700 mb-4">Our platform is tested and optimized for:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Browsers:</h4>
                  <ul className="text-gray-700 space-y-1">
                    <li>• Chrome (latest 2 versions)</li>
                    <li>• Firefox (latest 2 versions)</li>
                    <li>• Safari (latest 2 versions)</li>
                    <li>• Edge (latest 2 versions)</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Screen Readers:</h4>
                  <ul className="text-gray-700 space-y-1">
                    <li>• NVDA (Windows)</li>
                    <li>• JAWS (Windows)</li>
                    <li>• VoiceOver (macOS/iOS)</li>
                    <li>• TalkBack (Android)</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Keyboard Shortcuts</h2>
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-700"><kbd className="bg-gray-200 px-2 py-1 rounded">Tab</kbd> - Navigate forward</p>
                    <p className="text-gray-700"><kbd className="bg-gray-200 px-2 py-1 rounded">Shift + Tab</kbd> - Navigate backward</p>
                    <p className="text-gray-700"><kbd className="bg-gray-200 px-2 py-1 rounded">Enter</kbd> - Activate buttons/links</p>
                  </div>
                  <div>
                    <p className="text-gray-700"><kbd className="bg-gray-200 px-2 py-1 rounded">Space</kbd> - Activate buttons</p>
                    <p className="text-gray-700"><kbd className="bg-gray-200 px-2 py-1 rounded">Esc</kbd> - Close modals/menus</p>
                    <p className="text-gray-700"><kbd className="bg-gray-200 px-2 py-1 rounded">Arrow Keys</kbd> - Navigate menus</p>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Feedback and Support</h2>
              <p className="text-gray-700 mb-4">
                We welcome your feedback on the accessibility of Medicos. Please let us know if you encounter 
                accessibility barriers or have suggestions for improvement.
              </p>
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h4 className="font-semibold text-green-900 mb-2">Contact our Accessibility Team:</h4>
                <p className="text-green-800">Email: medicosmangaluru@gmail.com</p>
                <p className="text-green-800">Phone: +91 85535 77004</p>
                <p className="text-green-800">Address: 2nd Floor, City Trade Centre, Opposite City Hospital, Mallikatte, Kadri, Mangaluru, Karnataka 570003</p>
                <p className="text-green-800">Response time: Within 2 business days</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Ongoing Improvements</h2>
              <p className="text-gray-700">
                We continuously work to improve accessibility through regular audits, user testing with people 
                with disabilities, and staying updated with the latest accessibility standards and best practices.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
