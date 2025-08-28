"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/hooks/useAuth";
import { getAdLink, getClickEvents } from "@/lib/firebase/db";
import { AdLink, ClickEvent } from "@/types/ad-links";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  BarChart3, 
  MousePointer, 
  Globe, 
  Clock,
  TrendingUp,
  Users,
  Eye
} from "lucide-react";

interface AnalyticsData {
  totalClicks: number;
  uniqueClicks: number;
  clicksByDay: { date: string; clicks: number }[];
  clicksByCountry: { country: string; clicks: number }[];
  clicksByReferrer: { referrer: string; clicks: number }[];
  topUTMSources: { source: string; clicks: number }[];
}

export default function AdLinkAnalyticsPage() {
  const router = useRouter();
  const params = useParams();
  const [adLink, setAdLink] = useState<AdLink | null>(null);
  const [clickEvents, setClickEvents] = useState<ClickEvent[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!params.id) return;
      
      try {
        const [linkData, clicks] = await Promise.all([
          getAdLink(params.id as string),
          getClickEvents(params.id as string)
        ]);

        if (linkData) {
          setAdLink(linkData);
          setClickEvents(clicks);
          
          // Process analytics data
          const analyticsData = processAnalytics(clicks);
          setAnalytics(analyticsData);
        } else {
          router.push("/admin/ad-links");
        }
      } catch (error) {
        console.error("Error fetching analytics data:", error);
        router.push("/admin/ad-links");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [params.id, router]);

  const processAnalytics = (clicks: ClickEvent[]): AnalyticsData => {
    const totalClicks = clicks.length;
    const uniqueClicks = clicks.filter(click => click.isUnique).length;

    // Clicks by day
    const clicksByDay = clicks.reduce((acc: { [key: string]: number }, click) => {
      const date = click.timestamp.toDate ? 
        click.timestamp.toDate().toISOString().split('T')[0] : 
        new Date(click.timestamp).toISOString().split('T')[0];
      
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    // Clicks by country
    const clicksByCountry = clicks.reduce((acc: { [key: string]: number }, click) => {
      const country = click.location?.country || 'Unknown';
      acc[country] = (acc[country] || 0) + 1;
      return acc;
    }, {});

    // Clicks by referrer
    const clicksByReferrer = clicks.reduce((acc: { [key: string]: number }, click) => {
      const referrer = click.referrer || 'Direct';
      const domain = referrer === 'Direct' ? 'Direct' : 
        (referrer.startsWith('http') ? new URL(referrer).hostname : referrer);
      
      acc[domain] = (acc[domain] || 0) + 1;
      return acc;
    }, {});

    // UTM Sources
    const topUTMSources = clicks.reduce((acc: { [key: string]: number }, click) => {
      const source = click.utmParams?.source || 'Unknown';
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {});

    return {
      totalClicks,
      uniqueClicks,
      clicksByDay: Object.entries(clicksByDay)
        .map(([date, clicks]) => ({ date, clicks }))
        .sort((a, b) => a.date.localeCompare(b.date)),
      clicksByCountry: Object.entries(clicksByCountry)
        .map(([country, clicks]) => ({ country, clicks }))
        .sort((a, b) => b.clicks - a.clicks)
        .slice(0, 10),
      clicksByReferrer: Object.entries(clicksByReferrer)
        .map(([referrer, clicks]) => ({ referrer, clicks }))
        .sort((a, b) => b.clicks - a.clicks)
        .slice(0, 10),
      topUTMSources: Object.entries(topUTMSources)
        .map(([source, clicks]) => ({ source, clicks }))
        .sort((a, b) => b.clicks - a.clicks)
        .slice(0, 5),
    };
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!adLink || !analytics) {
    return null;
  }

  return (
    <ProtectedRoute requiredPermissions={["ad_links_analytics:read"]}>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Link href={`/admin/ad-links/${adLink.id}`}>
              <Button variant="outline" size="sm" className="mr-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Analytics - {adLink.title}</h1>
              <p className="text-gray-600">
                Análisis detallado del rendimiento del enlace
              </p>
            </div>
          </div>
          
          <Badge variant={adLink.isActive ? "default" : "secondary"}>
            {adLink.isActive ? "Activo" : "Inactivo"}
          </Badge>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="flex items-center p-6">
              <MousePointer className="h-8 w-8 text-blue-500 mr-4" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Clicks</p>
                <p className="text-2xl font-bold">{analytics.totalClicks}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center p-6">
              <Users className="h-8 w-8 text-green-500 mr-4" />
              <div>
                <p className="text-sm font-medium text-gray-600">Clicks Únicos</p>
                <p className="text-2xl font-bold">{analytics.uniqueClicks}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center p-6">
              <TrendingUp className="h-8 w-8 text-purple-500 mr-4" />
              <div>
                <p className="text-sm font-medium text-gray-600">Tasa de Uniqueness</p>
                <p className="text-2xl font-bold">
                  {analytics.totalClicks > 0 
                    ? Math.round((analytics.uniqueClicks / analytics.totalClicks) * 100)
                    : 0}%
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center p-6">
              <Globe className="h-8 w-8 text-amber-500 mr-4" />
              <div>
                <p className="text-sm font-medium text-gray-600">Países</p>
                <p className="text-2xl font-bold">{analytics.clicksByCountry.length}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Clicks by Country */}
          <Card>
            <CardHeader>
              <CardTitle>Clicks por País</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.clicksByCountry.map((item, index) => (
                  <div key={item.country} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-6 h-6 rounded bg-blue-100 flex items-center justify-center mr-3">
                        <span className="text-xs font-medium text-blue-600">
                          {index + 1}
                        </span>
                      </div>
                      <span className="font-medium">{item.country}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{
                            width: `${(item.clicks / analytics.totalClicks) * 100}%`,
                          }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium w-8 text-right">
                        {item.clicks}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Clicks by Referrer */}
          <Card>
            <CardHeader>
              <CardTitle>Fuentes de Tráfico</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.clicksByReferrer.map((item, index) => (
                  <div key={item.referrer} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-6 h-6 rounded bg-green-100 flex items-center justify-center mr-3">
                        <span className="text-xs font-medium text-green-600">
                          {index + 1}
                        </span>
                      </div>
                      <span className="font-medium truncate max-w-40">
                        {item.referrer}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{
                            width: `${(item.clicks / analytics.totalClicks) * 100}%`,
                          }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium w-8 text-right">
                        {item.clicks}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* UTM Sources */}
          <Card>
            <CardHeader>
              <CardTitle>Fuentes UTM</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.topUTMSources.map((item, index) => (
                  <div key={item.source} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-6 h-6 rounded bg-purple-100 flex items-center justify-center mr-3">
                        <span className="text-xs font-medium text-purple-600">
                          {index + 1}
                        </span>
                      </div>
                      <span className="font-medium">{item.source}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-purple-500 h-2 rounded-full"
                          style={{
                            width: `${(item.clicks / analytics.totalClicks) * 100}%`,
                          }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium w-8 text-right">
                        {item.clicks}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Daily Clicks */}
          <Card>
            <CardHeader>
              <CardTitle>Clicks por Día</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {analytics.clicksByDay.map((item) => (
                  <div key={item.date} className="flex items-center justify-between py-1">
                    <span className="text-sm font-medium">
                      {new Date(item.date).toLocaleDateString()}
                    </span>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-amber-500 h-2 rounded-full"
                          style={{
                            width: `${(item.clicks / Math.max(...analytics.clicksByDay.map(d => d.clicks))) * 100}%`,
                          }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium w-6 text-right">
                        {item.clicks}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Link Information */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Información del Enlace</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">Detalles Básicos</h4>
                <div className="space-y-2 text-sm">
                  <p><strong>Slug:</strong> /{adLink.slug}</p>
                  <p><strong>Tipo:</strong> {adLink.linkType}</p>
                  <p><strong>Creado:</strong> {formatDate(adLink.createdAt)}</p>
                  <p><strong>Actualizado:</strong> {formatDate(adLink.updatedAt)}</p>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Tracking UTM</h4>
                <div className="space-y-2 text-sm">
                  <p><strong>Campaña:</strong> {adLink.campaignName}</p>
                  <p><strong>Source:</strong> {adLink.utmSource}</p>
                  <p><strong>Medium:</strong> {adLink.utmMedium}</p>
                  <p><strong>Campaign:</strong> {adLink.utmCampaign}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}