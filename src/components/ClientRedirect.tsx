"use client";

import RedirectPreloader from "./RedirectPreloader";

interface ClientRedirectProps {
  url: string;
  delay?: number;
}

export default function ClientRedirect({ url, delay = 0 }: ClientRedirectProps) {
  const handleRedirect = () => {
    console.log(`🔄 Client-side redirecting to: ${url}`);
    window.location.href = url;
  };

  // If delay is 0, redirect instantly without preloader
  if (delay === 0) {
    handleRedirect();
    return null;
  }

  // Show beautiful preloader for delayed redirects
  return (
    <RedirectPreloader
      url={url}
      onRedirect={handleRedirect}
      duration={delay}
    />
  );
}