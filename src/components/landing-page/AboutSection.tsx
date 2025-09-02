import Link from "next/link";
import { JSX } from "react";
import { ArrowRight } from "lucide-react";
import SubjectChart from "./SubjectChart";

export default function AboutSection(): JSX.Element {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center mb-16">
      <div>
        <h2
          className="text-3xl md:text-5xl font-bold mb-6"
          style={{ fontFamily: "Nunito, sans-serif" }}
        >
          About Medicos
        </h2>
        <p className="text-gray-600 mb-6">
          Medicos Edu Consultant Pvt. Ltd. is an educational consultancy specializing in NEET and JEE exam
          preparation. Their approach emphasizes personalized mentorship and strategic practice to help students
          achieve high rankings.
        </p>
        <Link href="#" className="inline-flex items-center text-gray-700 hover:text-gray-900">
          Readmore <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </div>

      {/* Chart - Hidden on Mobile */}
      <SubjectChart />
    </div>
  );
}
