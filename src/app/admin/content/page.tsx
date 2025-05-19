// src/app/admin/content/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { seedContent } from "@/lib/firebase/seed";
import { getContentBySection } from "@/lib/firebase/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Image,
  Video,
  ChevronRight,
  Database,
  RefreshCw,
} from "lucide-react";

const sections = [
  {
    id: "hero",
    name: "Hero Section",
    icon: FileText,
    description: "Main landing section with video",
  },
  {
    id: "testimonials",
    name: "Testimonials Section",
    icon: FileText,
    description: "Success stories and testimonials",
  },
  {
    id: "benefits",
    name: "Benefits Section",
    icon: FileText,
    description: "Program benefits list",
  },
  {
    id: "success",
    name: "Success Gallery",
    icon: Image,
    description: "Success story images gallery",
  },
  {
    id: "mentor",
    name: "Mentor Section",
    icon: Video,
    description: "Diego's mentor section with videos",
  },
  {
    id: "youtube",
    name: "YouTube Section",
    icon: Video,
    description: "Main YouTube embed section",
  },
  {
    id: "free_classes",
    name: "Free Classes",
    icon: Video,
    description: "Free masterclass section",
  },
  {
    id: "masterclass",
    name: "MasterClass Section",
    icon: Video,
    description: "Monthly masterclass promotion",
  },
  {
    id: "classes_cta",
    name: "Classes CTA",
    icon: FileText,
    description: "Call to action section",
  },
];

export default function ContentManagementPage() {
  const [isSeedingContent, setIsSeedingContent] = useState(false);
  const [seedResult, setSeedResult] = useState<{
    added: number;
    existing: number;
  } | null>(null);
  const [sectionStats, setSectionStats] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Load section statistics on page load
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const stats: Record<string, number> = {};

        // Get count of items for each section
        for (const section of sections) {
          const contentItems = await getContentBySection(section.id);
          stats[section.id] = contentItems.length;
        }

        setSectionStats(stats);
      } catch (error) {
        console.error("Error fetching section stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Handle seed content function
  const handleSeedContent = async () => {
    if (confirm("This will add initial content to the database. Continue?")) {
      try {
        setIsSeedingContent(true);
        const result = await seedContent();
        setSeedResult(result);

        // Refresh section stats
        const stats: Record<string, number> = {};
        for (const section of sections) {
          const contentItems = await getContentBySection(section.id);
          stats[section.id] = contentItems.length;
        }
        setSectionStats(stats);
      } catch (error) {
        console.error("Error seeding content:", error);
        alert("Error seeding content: " + (error as Error).message);
      } finally {
        setIsSeedingContent(false);
      }
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Content Management</h1>

      {/* Seed Database Button */}
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
              <>
                <Database className="h-4 w-4" />
                Initialize Content Database
              </>
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
            Tip: Run initialization once when setting up the CMS
          </span>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sections.map((section) => (
            <Card
              key={section.id}
              className={`hover:shadow-md transition-shadow ${
                sectionStats[section.id]
                  ? ""
                  : "border-dashed border-gray-300 bg-gray-50"
              }`}
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xl font-medium">
                  {section.name}
                </CardTitle>
                <section.icon className="h-5 w-5 text-gray-400" />
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500 mb-4">
                  {section.description}
                </p>

                {/* Content status badge */}
                <div className="mb-4">
                  {sectionStats[section.id] ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {sectionStats[section.id]} content items
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      No content yet
                    </span>
                  )}
                </div>

                <Link href={`/admin/content/${section.id}`}>
                  <Button className="w-full mt-2">
                    {sectionStats[section.id] ? (
                      <>
                        Edit Content <ChevronRight className="ml-2 h-4 w-4" />
                      </>
                    ) : (
                      <>
                        Set Up Content <ChevronRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
