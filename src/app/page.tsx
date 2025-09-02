
import Navbar from "@/components/landing-page/navbar"
import HeroSection from "@/components/landing-page/hero-section"
import Image from "next/image"
import AboutSection from "@/components/landing-page/AboutSection"
import LessonsSection from "@/components/landing-page/LessonsSection"
import NavigationTabs from "@/components/landing-page/NavigationTabs"
import Consultation from "@/components/landing-page/Consultation"
import TransformingEducation from "@/components/landing-page/TransformingEducation"
import TestimonialsContact from "@/components/landing-page/TestimonialsContact"
import Footer from "@/components/landing-page/Footer"

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-8 md:py-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <HeroSection />
          <div className="hidden md:block relative">
            {/* <div className="absolute top-4 right-4 bg-white rounded-full px-4 py-2 shadow-md z-10">
              <span className="font-bold text-xl">56%</span>
            </div> */}
            <Image
              src="/assets/landing-page/hero.png"
              alt="NEET & JEE Dashboard"
              width={700}
              height={600}
              className="w-full h-auto"
            />
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-gray-600 mb-8">Trusted by 50,000+ businesses for innovative design and growth.</p>
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
          <Image
            src="/assets/landing-page/google-logo.png"
            alt="Google"
            width={120}
            height={40}
            className="h-8 w-auto opacity-50"
          />
          <Image
            src="/assets/landing-page/fb-logo.png"
            alt="Facebook"
            width={120}
            height={40}
            className="h-8 w-auto opacity-50"
          />
          <Image
            src="/assets/landing-page/yt-logo.png"
            alt="YouTube"
            width={120}
            height={40}
            className="h-8 w-auto opacity-50"
          />
          <Image
            src="/assets/landing-page/pin-logo.png"
            alt="Pinterest"
            width={120}
            height={40}
            className="h-8 w-auto opacity-50"
          />
          <Image
            src="/assets/landing-page/twitch-logo.png"
            alt="Twitch"
            width={120}
            height={40}
            className="h-8 w-auto opacity-50"
          />
        </div>
      </div>
      <div className="container mx-auto px-4 py-8">
        <AboutSection />
        <LessonsSection />
        <NavigationTabs />
      </div>
      <div className="container mx-auto">
      <Consultation />
      <TransformingEducation />
      <TestimonialsContact/>
      <Footer/>
      </div>
    </main>
  )
}






