import { redirect } from "next/navigation";
import { getAdLinkBySlug, recordClickEvent } from "@/lib/firebase/db";
import { ClickEvent } from "@/types/ad-links";
import { headers } from "next/headers";
import ClientRedirect from "@/components/ClientRedirect";

// Helper function to get client IP from headers
async function getClientIP(): Promise<string> {
  const headersList = await headers();
  const forwarded = headersList.get('x-forwarded-for');
  const real = headersList.get('x-real-ip');
  const clientIP = headersList.get('x-client-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  if (real) {
    return real;
  }
  if (clientIP) {
    return clientIP;
  }
  
  return '127.0.0.1'; // fallback
}

// Helper function to generate session ID
function generateSessionId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// Helper function to get location from Vercel headers
async function getLocationFromHeaders(): Promise<{ country?: string; region?: string; city?: string }> {
  try {
    const headersList = await headers();
    
    // Get geolocation from Vercel headers
    const country = headersList.get('x-vercel-ip-country') || headersList.get('cf-ipcountry');
    const region = headersList.get('x-vercel-ip-country-region');
    const city = headersList.get('x-vercel-ip-city');
    
    console.log(`🌍 Vercel geo data - Country: ${country}, Region: ${region}, City: ${city}`);
    
    // Check for development/localhost
    if (!country) {
      console.log(`🏠 No geo headers detected (likely localhost), using fallback location`);
      return {
        country: 'Development',
        region: 'Local', 
        city: 'Localhost'
      };
    }
    
    const location = {
      country: country || 'Unknown',
      region: region || undefined,
      city: city || undefined
    };
    
    console.log(`✅ Using Vercel geo location:`, location);
    return location;
    
  } catch (error) {
    console.error('❌ Error getting location from headers:', error);
    return { country: 'Unknown' };
  }
}

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function GoPage({ params, searchParams }: PageProps) {
  try {
    const { slug } = await params;
    
    console.log(`🔍 Processing slug: "${slug}"`);
    
    if (!slug) {
      console.log('❌ No slug provided, redirecting to /');
      redirect('/');
      return null;
    }

    // Get the ad link
    console.log(`📡 Looking up ad link for slug: "${slug}"`);
    const adLink = await getAdLinkBySlug(slug);
    
    if (!adLink) {
      console.log(`❌ Ad link not found for slug: "${slug}", redirecting to /`);
      redirect('/');
      return null;
    }

    console.log(`✅ Found ad link: "${adLink.title}" -> "${adLink.targetUrl}"`);
    console.log(`🔄 Link is active: ${adLink.isActive}`);

    // Check if link is active
    if (!adLink.isActive) {
      console.log('❌ Ad link is inactive, redirecting to /');
      redirect('/');
      return null;
    }

    // Check if link has expired
    if (adLink.expirationDate) {
      const now = new Date();
      let expirationDate: Date;
      
      // Handle Firebase Timestamp properly
      if (typeof adLink.expirationDate === 'object' && 'toDate' in adLink.expirationDate) {
        // Firebase Timestamp
        expirationDate = adLink.expirationDate.toDate();
      } else {
        // JavaScript Date or timestamp
        expirationDate = new Date(adLink.expirationDate as any);
      }
      
      if (now > expirationDate) {
        console.log(`🚫 Link expired: ${expirationDate.toISOString()}`);
        redirect('/');
        return null;
      }
    }

    // Collect click data
    const headersList = await headers();
    const userAgent = headersList.get('user-agent') || '';
    const referrer = headersList.get('referer') || '';
    const clientIP = await getClientIP();
    
    console.log(`🔍 Click data collected:`);
    console.log(`  - IP: ${clientIP}`);
    console.log(`  - User Agent: ${userAgent.substring(0, 50)}...`);
    console.log(`  - Referrer: ${referrer}`);
    
    
    // Generate session ID
    const sessionId = generateSessionId();
    
    // Extract UTM parameters from search params
    const awaitedSearchParams = await searchParams;
    const utmParams = {
      source: (awaitedSearchParams.utm_source as string) || adLink.utmSource,
      medium: (awaitedSearchParams.utm_medium as string) || adLink.utmMedium,
      campaign: (awaitedSearchParams.utm_campaign as string) || adLink.utmCampaign,
      term: (awaitedSearchParams.utm_term as string) || adLink.utmTerm,
      content: (awaitedSearchParams.utm_content as string) || adLink.utmContent,
    };

    // Record click event - MUST await to ensure it's saved before redirect
    const recordClick = async () => {
      try {
        console.log('📝 Recording click event...');
        const location = await getLocationFromHeaders();
        
        const clickEventData: Omit<ClickEvent, 'id' | 'timestamp'> = {
          linkId: adLink.id!,
          ip: clientIP,
          userAgent,
          referrer,
          location,
          utmParams,
          sessionId,
          isUnique: true, // For now, consider all clicks as unique
        };

        await recordClickEvent(clickEventData);
        console.log(`✅ Click recorded for ad link: ${adLink.slug}`);
      } catch (error) {
        console.error('❌ Error recording click event:', error);
        // Don't fail the redirect if click recording fails, but log it
      }
    };

    // AWAIT click recording to ensure it's saved before redirect
    await recordClick();

    // Build target URL with UTM parameters
    let finalUrl: string;
    
    try {
      const targetUrl = new URL(adLink.targetUrl);
      
      // Add UTM parameters to target URL
      if (utmParams.source) targetUrl.searchParams.set('utm_source', utmParams.source);
      if (utmParams.medium) targetUrl.searchParams.set('utm_medium', utmParams.medium);
      if (utmParams.campaign) targetUrl.searchParams.set('utm_campaign', utmParams.campaign);
      if (utmParams.term) targetUrl.searchParams.set('utm_term', utmParams.term);
      if (utmParams.content) targetUrl.searchParams.set('utm_content', utmParams.content);
      
      // Add any additional query parameters from the original request
      Object.entries(awaitedSearchParams).forEach(([key, value]) => {
        if (!key.startsWith('utm_') && typeof value === 'string') {
          targetUrl.searchParams.set(key, value);
        }
      });
      
      finalUrl = targetUrl.toString();
    } catch (urlError) {
      console.log(`⚠️ Invalid URL format: ${adLink.targetUrl}, redirecting without UTM parameters`);
      finalUrl = adLink.targetUrl;
    }

    console.log(`🚀 Using client-side redirect to: ${finalUrl}`);
    
    // Check if it's an external URL (different domain)
    const isExternal = !finalUrl.startsWith(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000');
    
    if (isExternal) {
      // Use client-side redirect with beautiful preloader for external URLs
      return <ClientRedirect url={finalUrl} delay={800} />;
    } else {
      // Use server-side redirect for internal URLs
      redirect(finalUrl);
    }
    
  } catch (error) {
    // Only catch non-redirect errors
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
      // This is expected, re-throw it
      throw error;
    }
    console.error('❌ Actual error in go page:', error);
    redirect('/');
  }

  return null;
}