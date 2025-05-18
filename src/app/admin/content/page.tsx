"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getContentBySection } from "@/lib/firebase/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Image, Video, ChevronRight } from "lucide-react";
import { seedContent } from "@/lib/firebase/seed";

const sections = [
  { id: "hero", name: "Hero Section", icon: FileText },
  { id: "testimonials", name: "Testimonials Section", icon: FileText },
  { id: "benefits", name: "Benefits Section", icon: FileText },
  { id: "videos", name: "Video Content", icon: Video },
  { id: "images", name: "Image Content", icon: Image },
];

export default function ContentManagementPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const [isSeedingContent, setIsSeedingContent] = useState(false);
  const [seedResult, setSeedResult] = useState<{
    added: number;
    existing: number;
  } | null>(null);

  const handleSeedContent = async () => {
    if (confirm("This will add initial content to the database. Continue?")) {
      try {
        setIsSeedingContent(true);
        const result = await seedContent();
        setSeedResult(result);
      } catch (error) {
        console.error("Error seeding content:", error);
        alert("Error seeding content");
      } finally {
        setIsSeedingContent(false);
      }
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Content Management</h1>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <Button
            onClick={handleSeedContent}
            disabled={isSeedingContent}
            variant="outline"
            className="flex items-center gap-2"
          >
            {isSeedingContent ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-500"></div>
                Seeding...
              </>
            ) : (
              <>Initialize Content Database</>
            )}
          </Button>
          {seedResult && (
            <div className="mt-2 text-sm text-gray-500">
              Added {seedResult.added} new items, {seedResult.existing} items
              already existed
            </div>
          )}
        </div>

        <div className="text-sm text-gray-500">
          <span className="inline-flex items-center bg-green-100 text-green-800 py-1 px-2 rounded text-xs">
            Tip: Run initialization only once when setting up the CMS
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sections.map((section) => (
          <Card key={section.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xl font-medium">
                {section.name}
              </CardTitle>
              <section.icon className="h-5 w-5 text-gray-400" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 mb-4">
                Manage the content for the {section.name.toLowerCase()}
              </p>
              <Link href={`/admin/content/${section.id}`}>
                <Button className="w-full mt-2">
                  Edit Content <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
