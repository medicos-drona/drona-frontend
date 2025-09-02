import * as React from "react"
import { Nunito, Manrope } from "next/font/google"
import Image from "next/image"

const nunito = Nunito({
  subsets: ["latin"],
  weight: "800",
  variable: "--font-nunito",
})

const manrope = Manrope({
  subsets: ["latin"],
  weight: "500",
  variable: "--font-manrope",
})

export default function EducationLanding() {
  return (
    <div className={`${nunito.variable} ${manrope.variable} min-h-screen`} style={{ backgroundColor: "#087E3F" }}>
      <div className="container mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
          {/* Left Content */}
          <div className="text-white space-y-6">
            <h1
              className="text-3xl md:text-5xl font-nunito text-white leading-none"
              style={{ fontFamily: "Nunito, sans-serif" }}
            >
              Transforming education for generation
            </h1>
            <p
              className="font-manrope text-white/90"
              style={{
                fontFamily: "var(--font-manrope)",
                fontWeight: 500,
                fontSize: "16px",
                lineHeight: "100%",
                letterSpacing: "0%",
              }}
            >
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Elementum felis, sed ullamcorper tempus faucibus
              in imperdiet. Semper justo mauris sed fusce erat aenean tristique.
            </p>
          </div>


          {/* Right Content - Overlapping Images */}
          <div className="relative h-full flex flex-col items-center justify-center lg:justify-end">
            {/* Main Dashboard Image - Hidden on mobile */}
            <div className="relative w-full max-w-[591px] lg:w-[591px] h-auto hidden lg:block -my-4">
              <Image
                src="/assets/landing-page/trans-merged.png"
                alt="Dashboard Interface"
                width={591}
                height={597}
                className="object-contain"
                style={{ marginTop: "-10px", marginBottom: "-10px" }}
              />
            </div>

            {/*sub*/}
             <div className="relative w-full max-w-[591px] lg:w-[591px] h-auto block lg:hidden -my-4">
              <Image
                src="/assets/landing-page/trans-1.png"
                alt="Dashboard Interface"
                width={591}
                height={597}
                className="object-contain"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
