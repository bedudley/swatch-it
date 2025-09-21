"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to admin page by default
    router.push("/admin");
  }, [router]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-primary mb-4">
          Swatch It!
        </h1>
        <p className="text-lg text-foreground/70 mb-8">
          Loading game...
        </p>
      </div>
    </div>
  );
}
