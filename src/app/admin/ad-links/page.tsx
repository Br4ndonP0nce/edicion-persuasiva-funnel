"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { useAuth } from "@/hooks/useAuth";
import { getAdLinksStats } from "@/lib/firebase/db";
import { AdLinkStats } from "@/types/ad-links";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Link as LinkIcon,
  BarChart3,
  MousePointer,
  Eye,
  ExternalLink,
  Calendar,
  TrendingUp,
} from "lucide-react";

export default function AdLinksPage() {
  const { userProfile, hasPermission } = useAuth();
  const [stats, setStats] = useState<AdLinkStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      if (!hasPermission("ad_links:read")) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const statsData = await getAdLinksStats();
        setStats(statsData);
      } catch (err) {
        console.error("Error fetching ad links stats:", err);
        setError("Failed to load ad links data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [hasPermission]);

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString();
  };

  return (
    <ProtectedRoute requiredPermissions={["ad_links:read"]}>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Enlaces Publicitarios</h1>
            <p className="text-muted-foreground">
              Gestiona y analiza tus enlaces de campañas publicitarias
            </p>
          </div>

          <div className="flex items-center gap-4">
            <PermissionGate permissions={["ad_links_analytics:read"]}>
              <Link href="/admin/ad-links/analytics">
                <Button
                  variant="outline"
                  className="flex items-center space-x-2"
                >
                  <BarChart3 className="h-4 w-4" />
                  <span>Analytics</span>
                </Button>
              </Link>
            </PermissionGate>

            <PermissionGate permissions={["ad_links:write"]}>
              <Link href="/admin/ad-links/create">
                <Button className="flex items-center space-x-2">
                  <Plus className="h-4 w-4" />
                  <span>Crear Enlace</span>
                </Button>
              </Link>
            </PermissionGate>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 text-red-700 p-4 rounded-md mb-6">
            {error}
          </div>
        ) : (
          <>
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="flex items-center p-6">
                  <LinkIcon className="h-8 w-8 text-blue-500 mr-4" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Total Enlaces
                    </p>
                    <p className="text-2xl font-bold">
                      {stats?.totalLinks || 0}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="flex items-center p-6">
                  <Eye className="h-8 w-8 text-green-500 mr-4" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Enlaces Activos
                    </p>
                    <p className="text-2xl font-bold">
                      {stats?.activeLinks || 0}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="flex items-center p-6">
                  <MousePointer className="h-8 w-8 text-purple-500 mr-4" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Total Clicks
                    </p>
                    <p className="text-2xl font-bold">
                      {stats?.totalClicks || 0}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="flex items-center p-6">
                  <TrendingUp className="h-8 w-8 text-amber-500 mr-4" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Clicks Únicos
                    </p>
                    <p className="text-2xl font-bold">
                      {stats?.uniqueClicks || 0}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Top Performing Links */}
              <Card>
                <CardHeader>
                  <CardTitle>Enlaces con Mejor Rendimiento</CardTitle>
                </CardHeader>
                <CardContent>
                  {stats?.topPerforming?.length ? (
                    <div className="space-y-4">
                      {stats.topPerforming.map((link) => (
                        <div
                          key={link.id}
                          className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                        >
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">
                              {link.title}
                            </h4>
                            <p className="text-xs text-muted-foreground">
                              /{link.slug}
                            </p>
                            <div className="flex items-center mt-1 space-x-2">
                              <Badge
                                variant={
                                  link.isActive ? "default" : "secondary"
                                }
                              >
                                {link.isActive ? "Activo" : "Inactivo"}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {link.campaignName}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-lg">
                              {link.totalClicks}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {link.uniqueClicks} únicos
                            </p>
                          </div>
                          <div className="ml-4">
                            <PermissionGate permissions={["ad_links:write"]}>
                              <Link href={`/admin/ad-links/${link.id}`}>
                                <Button variant="outline" size="sm">
                                  <ExternalLink className="h-3 w-3" />
                                </Button>
                              </Link>
                            </PermissionGate>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <LinkIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                      <p>No hay enlaces creados aún</p>
                      <PermissionGate permissions={["ad_links:write"]}>
                        <Link href="/admin/ad-links/create">
                          <Button className="mt-4" size="sm">
                            Crear tu primer enlace
                          </Button>
                        </Link>
                      </PermissionGate>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Click Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Actividad Reciente</CardTitle>
                </CardHeader>
                <CardContent>
                  {stats?.recentClicks?.length ? (
                    <div className="space-y-3">
                      {stats.recentClicks.map((click) => (
                        <div
                          key={click.id}
                          className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                        >
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <MousePointer className="h-4 w-4 text-purple-500" />
                              <span className="text-sm font-medium">
                                Click registrado
                              </span>
                              {click.isUnique && (
                                <Badge variant="outline" className="text-xs">
                                  Único
                                </Badge>
                              )}
                            </div>
                            <div className="mt-1 text-xs text-muted-foreground">
                              {click.location?.country && (
                                <span>{click.location.country}</span>
                              )}
                              {click.utmParams?.source && (
                                <span> • {click.utmParams.source}</span>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3 inline mr-1" />
                              {formatDate(click.timestamp)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <MousePointer className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                      <p>No hay actividad de clicks reciente</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </ProtectedRoute>
  );
}
