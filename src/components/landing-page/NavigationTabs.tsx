// app/components/NavigationTabs.tsx
import { JSX } from "react";
interface Tab {
  name: string;
  isActive: boolean;
}

export default function NavigationTabs(): JSX.Element {
  const tabs: Tab[] = [
    { name: "NEET", isActive: true },
    { name: "JEE", isActive: false },
    { name: "K-12", isActive: false },
    { name: "CET", isActive: false }
  ];

  return (
    <div className="max-w-lg mx-auto overflow-x-auto">
      <div className="flex min-w-max justify-center space-x-6 border-b">
        {tabs.map((tab) => (
          <button
            key={tab.name}
            className={`px-6 py-3 font-semibold ${
              tab.isActive 
                ? "text-green-600 border-b-2 border-green-600" 
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.name}
          </button>
        ))}
      </div>
    </div>
  );
}
