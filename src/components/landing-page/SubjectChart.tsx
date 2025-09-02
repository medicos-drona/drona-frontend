import { JSX } from "react";
import Image from "next/image"


export default function SubjectChart(): JSX.Element {
  return (
    <div className="hidden lg:block bg-white shadow-md p-6 border border-gray-100">
                <Image
                  src="/assets/landing-page/chart.png"
                  alt="User"
                  width={600}
                  height={500}
                  className=" border-white"
                />
    </div>
  );
}