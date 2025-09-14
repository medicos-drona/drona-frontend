"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PageLoading } from "@/components/ui/page-loading";
import { AuthProvider } from "@/lib/AuthContext";

export function NavigationLoadingWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);
  const [prevPathname, setPrevPathname] = useState("");

  useEffect(() => {
    if (prevPathname && prevPathname !== (pathname ?? "")) {
      // Route change completed
      setIsNavigating(false);
    }
    setPrevPathname(pathname ?? "");
  }, [pathname, prevPathname]);

  useEffect(() => {
    const handleRouteChangeStart = () => {
      setIsNavigating(true);
    };

    const handleRouteChangeComplete = () => {
      setIsNavigating(false);
    };

    window.addEventListener("beforeunload", handleRouteChangeStart);
    
    return () => {
      window.removeEventListener("beforeunload", handleRouteChangeStart);
    };
  }, [router]);

  return (
    <AuthProvider>
      {isNavigating && <PageLoading message="Changing page..." />}
      {children}
    </AuthProvider>
  );
}