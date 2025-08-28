"use client";

import { useEffect } from "react";

interface ClientRedirectProps {
  url: string;
  delay?: number;
}

export default function ClientRedirect({ url, delay = 0 }: ClientRedirectProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      console.log(`🔄 Client-side redirecting to: ${url}`);
      window.location.href = url;
    }, delay);

    return () => clearTimeout(timer);
  }, [url, delay]);

  // If delay is 0, show nothing (instant redirect)
  if (delay === 0) {
    return null;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
        <p className="text-gray-600 mb-2">Redirecting...</p>
        <p className="text-sm text-gray-500">{url}</p>
        <p className="text-xs text-gray-400 mt-2">
          If you're not redirected automatically, 
          <a href={url} className="text-purple-600 hover:underline ml-1">
            click here
          </a>
        </p>
      </div>
    </div>
  );
}