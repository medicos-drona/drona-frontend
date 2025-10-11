import Link from "next/link"
import { ArrowLeft, Home, User, BookOpen, Phone, FileText, Shield, Eye, HelpCircle } from "lucide-react"

export default function Sitemap() {
  const siteStructure = [
    {
      category: "Main Pages",
      icon: Home,
      links: [
        { name: "Home", href: "/", description: "Landing page with course overview" },
        { name: "About Us", href: "/#about", description: "Learn about Medicos and our mission" },
        { name: "Courses", href: "/#courses", description: "NEET & JEE preparation courses" },
        { name: "Consultation", href: "/#consultation", description: "Book a consultation session" },
        { name: "Testimonials", href: "/#testimonials", description: "Student success stories" },
      ]
    },
    {
      category: "User Account",
      icon: User,
      links: [
        { name: "Login", href: "/login", description: "Sign in to your account" },
        { name: "Sign Up", href: "/signup", description: "Create a new account" },
        { name: "Dashboard", href: "/dashboard", description: "Student dashboard and progress" },
        { name: "Profile", href: "/profile", description: "Manage your profile settings" },
      ]
    },
    {
      category: "Educational Content",
      icon: BookOpen,
      links: [
        { name: "NEET Preparation", href: "/courses/neet", description: "Medical entrance exam preparation" },
        { name: "JEE Preparation", href: "/courses/jee", description: "Engineering entrance exam preparation" },
        { name: "Mock Tests", href: "/tests", description: "Practice tests and assessments" },
        { name: "Study Materials", href: "/materials", description: "Comprehensive study resources" },
        { name: "Live Classes", href: "/classes", description: "Interactive online classes" },
      ]
    },
    {
      category: "Support & Information",
      icon: HelpCircle,
      links: [
        { name: "Contact Us", href: "/contact", description: "Get in touch with our team" },
        { name: "FAQ", href: "/faq", description: "Frequently asked questions" },
        { name: "Help Center", href: "/help", description: "Support documentation and guides" },
        { name: "Technical Support", href: "/support", description: "Technical assistance" },
        { name: "Pricing", href: "/pricing", description: "Course pricing and plans" },
      ]
    },
    {
      category: "Legal & Policies",
      icon: Shield,
      links: [
        { name: "Privacy Policy", href: "/privacy", description: "How we protect your data" },
        { name: "Terms & Conditions", href: "/terms", description: "Terms of service and usage" },
        { name: "Accessibility Guidelines", href: "/accessibility", description: "Our commitment to accessibility" },
        { name: "Cookie Policy", href: "/cookies", description: "Information about cookies usage" },
        { name: "Refund Policy", href: "/refunds", description: "Refund terms and conditions" },
      ]
    },
    {
      category: "Resources",
      icon: FileText,
      links: [
        { name: "Blog", href: "/blog", description: "Educational articles and tips" },
        { name: "News & Updates", href: "/news", description: "Latest announcements" },
        { name: "Career Guidance", href: "/careers", description: "Career counseling resources" },
        { name: "Exam Calendar", href: "/calendar", description: "Important exam dates" },
        { name: "Downloads", href: "/downloads", description: "Downloadable resources" },
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Back to Home */}
        <Link 
          href="/" 
          className="inline-flex items-center text-green-600 hover:text-green-700 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>

        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Sitemap</h1>
          <p className="text-gray-600 mb-8">
            Navigate through all pages and sections of the Medicos platform. Find everything you need 
            for your NEET & JEE preparation journey.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {siteStructure.map((section, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <div className="bg-green-100 p-2 rounded-lg mr-3">
                    <section.icon className="w-5 h-5 text-green-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">{section.category}</h2>
                </div>
                
                <div className="space-y-3">
                  {section.links.map((link, linkIndex) => (
                    <div key={linkIndex} className="border-l-2 border-gray-100 pl-4">
                      <Link 
                        href={link.href}
                        className="block text-green-600 hover:text-green-700 font-medium transition-colors"
                      >
                        {link.name}
                      </Link>
                      <p className="text-sm text-gray-500 mt-1">{link.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Quick Stats */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">50+</div>
              <div className="text-sm text-gray-600">Total Pages</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">6</div>
              <div className="text-sm text-gray-600">Main Categories</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">24/7</div>
              <div className="text-sm text-gray-600">Platform Access</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">100%</div>
              <div className="text-sm text-gray-600">Mobile Friendly</div>
            </div>
          </div>

          {/* Search Suggestion */}
          <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="font-semibold text-green-900 mb-2">Can't find what you're looking for?</h3>
            <p className="text-green-800 mb-4">
              Use our search feature or contact our support team for assistance.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link 
                href="/contact" 
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Phone className="w-4 h-4 mr-2" />
                Contact Support
              </Link>
              <Link 
                href="/help" 
                className="inline-flex items-center px-4 py-2 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors"
              >
                <HelpCircle className="w-4 h-4 mr-2" />
                Help Center
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
