// src/hooks/useContent.ts
import { useState, useEffect } from 'react';
import { getContentBySection, ContentItem } from '@/lib/firebase/db';

export function useContent(section: string) {
  const [content, setContent] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setIsLoading(true);
        const contentItems = await getContentBySection(section);
        
        // Convert to a key-value object for easier use
        const contentObject: Record<string, string> = {};
        contentItems.forEach(item => {
          contentObject[item.key] = item.value;
        });
        
        setContent(contentObject);
      } catch (err) {
        console.error(`Error fetching ${section} content:`, err);
        setError(`Failed to load ${section} content`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
  }, [section]);

  return { content, isLoading, error };
}