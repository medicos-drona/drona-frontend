import Image from "next/image"
import { Phone, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Consultation() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 overflow-hidden bg-gray-50">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div className="flex flex-col gap-4">
            <h2
              className="text-3xl md:text-5xl font-bold mb-4"
              style={{ fontFamily: "Nunito, sans-serif" }}
            >
              Providing best <span className="text-green-600">growth</span> solutions
            </h2>
            <p className="text-gray-500 md:text-lg max-w-md">
              You can read this text, but it&apos;t matter. It&apos;s concept, not important for your life or life
              your friends.
            </p>
            <div className="mt-4">
              <Button className="rounded-full bg-white text-black hover:bg-gray-100 border border-gray-200 px-6">
                Get FREE Consultation
              </Button>
            </div>
          </div>

          <div className="relative h-[400px] md:h-[500px]">
            <div className="relative h-full w-full">
              {/* Main circular background */}
              <div className="absolute right-0 top-0 w-[90%] h-[90%] bg-gray-100 rounded-full"></div>

              {/* Person image */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-full w-full z-10">
                <Image
                  src="/assets/landing-page/right-guy.png"
                  alt="Person pointing to growth solutions"
                  width={700}
                  height={700}
                  className="object-contain h-full w-full"
                />
              </div>

              {/* Floating elements */}
              <div className="absolute top-[20%] right-[30%] bg-green-600 text-white p-3 rounded-full shadow-lg hidden md:block">
                <Phone className="w-6 h-6" />
              </div>

              <div className="absolute top-[50%] left-[10%] bg-white p-3 rounded-lg shadow-lg hidden md:block">
                <BarChart3 className="w-6 h-6 text-green-600" />
              </div>

              <div className="absolute bottom-[30%] right-[10%] bg-white py-2 px-4 rounded-lg shadow-lg hidden md:block">
                <p className="text-sm font-medium">
                  <span className="text-green-600">50k</span> Monthly Users
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
