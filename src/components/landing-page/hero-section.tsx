import Link from "next/link"
import Image from "next/image"

export default function HeroSection() {
  return (
    <div className="flex flex-col space-y-6">
      <h1
        className="text-3xl md:text-5xl font-extrabold leading-tight md:leading-none"
        style={{ fontFamily: "Nunito, sans-serif" }}
      >
        NEET & JEE Papers – Practice Smarter, Rank Higher!&quot;
      </h1>

      <p className="text-gray-600">
        Download free NEET and JEE question papers, mock tests, and practice sets to boost your preparation. Study
        smart, practice more, and get exam-ready today.
      </p>

      <div>
        <Link
          href="/login"
          className="inline-block px-6 py-3 text-white font-medium rounded-md shadow-sm"
          style={{ backgroundColor: "#84BF9F" }}
        >
          Login / Create Account
        </Link>
      </div>

      <div className="flex items-center mt-4">
        <div className="flex -space-x-2 mr-3">
          <Image
            src="/assets/landing-page/pro-user-1.png"
            alt="User"
            width={32}
            height={32}
            className="rounded-full border-2 border-white"
          />
          <Image
            src="/assets/landing-page/pro-user-2.png"
            alt="User"
            width={32}
            height={32}
            className="rounded-full border-2 border-white"
          />
          <Image
            src="/assets/landing-page/pro-user-3.png"
            alt="User"
            width={32}
            height={32}
            className="rounded-full border-2 border-white"
          />
        </div>
        <span className="font-medium">3,500+ Pro Users</span>
      </div>
    </div>
  )
}
