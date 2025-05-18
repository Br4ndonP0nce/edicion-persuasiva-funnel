// src/app/admin/content/[section]/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  getContentBySection,
  updateContent,
  ContentItem,
} from "@/lib/firebase/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save, CheckCircle } from "lucide-react";

export default function SectionContentPage() {
  const params = useParams();
  const router = useRouter();
  const [content, setContent] = useState<ContentItem[]>([]);
  const [editedContent, setEditedContent] = useState<Record<string, string>>(
    {}
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const section = params.section as string;
  const sectionTitle =
    section.charAt(0).toUpperCase() + section.slice(1).replace("-", " ");

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setIsLoading(true);
        const contentItems = await getContentBySection(section);
        setContent(contentItems);

        // Initialize edited content with current values
        const initialValues: Record<string, string> = {};
        contentItems.forEach((item) => {
          initialValues[item.id!] = item.value;
        });
        setEditedContent(initialValues);
      } catch (err) {
        console.error("Error fetching content:", err);
        setError("Failed to load content data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
  }, [section]);

  const handleInputChange = (id: string, value: string) => {
    setEditedContent((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);

      // Save each changed content item
      for (const contentId of Object.keys(editedContent)) {
        const item = content.find((c) => c.id === contentId);
        if (item && item.value !== editedContent[contentId]) {
          await updateContent(contentId, editedContent[contentId]);
        }
      }

      // Show success message
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Error saving content:", err);
      setError("Failed to save content changes");
    } finally {
      setIsSaving(false);
    }
  };

  const renderContentEditor = (item: ContentItem) => {
    switch (item.type) {
      case "text":
        return (
          <Input
            value={editedContent[item.id!] || ""}
            onChange={(e) => handleInputChange(item.id!, e.target.value)}
            className="w-full"
          />
        );
      case "image":
      case "video":
        return (
          <div className="space-y-2">
            <Input
              value={editedContent[item.id!] || ""}
              onChange={(e) => handleInputChange(item.id!, e.target.value)}
              className="w-full"
              placeholder="Enter URL"
            />
            {item.type === "image" && editedContent[item.id!] && (
              <div className="mt-2 rounded border overflow-hidden h-20 w-20">
                <img
                  src={editedContent[item.id!]}
                  alt="Preview"
                  className="object-cover h-full w-full"
                  onError={(e) =>
                    ((e.target as HTMLImageElement).src =
                      "/placeholder-image.jpg")
                  }
                />
              </div>
            )}
          </div>
        );
      default:
        return (
          <Input
            value={editedContent[item.id!] || ""}
            onChange={(e) => handleInputChange(item.id!, e.target.value)}
            className="w-full"
          />
        );
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <Button variant="outline" onClick={() => router.push("/admin/content")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Content
        </Button>

        <Button
          onClick={handleSave}
          disabled={isSaving}
          className={saveSuccess ? "bg-green-500 hover:bg-green-600" : ""}
        >
          {isSaving ? (
            <>Saving...</>
          ) : saveSuccess ? (
            <>
              <CheckCircle className="mr-2 h-4 w-4" /> Saved
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" /> Save Changes
            </>
          )}
        </Button>
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-md mb-6">
          {error}
        </div>
      )}

      <h1 className="text-2xl font-bold mb-6">{sectionTitle} Content</h1>

      {content.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-gray-500">
              No editable content found for this section.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {content.map((item) => (
            <Card key={item.id}>
              <CardHeader>
                <CardTitle>{item.label || item.key}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-2">
                    <Label htmlFor={item.id!}>Content</Label>
                    {renderContentEditor(item)}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
