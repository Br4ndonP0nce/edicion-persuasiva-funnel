"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { useAuth } from "@/hooks/useAuth";
import { getAdLink, updateAdLink, isSlugAvailable, getClickEvents } from "@/lib/firebase/db";
import { AdLink, AdLinkFormData, ClickEvent } from "@/types/ad-links";
import { generateShortUrl } from "@/lib/config";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  ArrowLeft, 
  Save, 
  Eye, 
  AlertCircle, 
  BarChart3, 
  Copy,
  ExternalLink,
  Calendar,
  MapPin,
  MousePointer
} from "lucide-react";

export default function EditAdLinkPage() {
  const router = useRouter();
  const params = useParams();
  const { userProfile } = useAuth();
  const [adLink, setAdLink] = useState<AdLink | null>(null);
  const [clickEvents, setClickEvents] = useState<ClickEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [slugError, setSlugError] = useState<string>("");
  const [formData, setFormData] = useState<AdLinkFormData>({
    title: "",
    slug: "",
    description: "",
    targetUrl: "",
    linkType: "landing_page",
    campaignName: "",
    utmSource: "",
    utmMedium: "",
    utmCampaign: "",
    utmTerm: "",
    utmContent: "",
    requireApproval: false,
    isActive: true,
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!params.id) return;
      
      try {
        const [linkData, clicks] = await Promise.all([
          getAdLink(params.id as string),
          getClickEvents(params.id as string, 20)
        ]);

        if (linkData) {
          setAdLink(linkData);
          setFormData({
            title: linkData.title,
            slug: linkData.slug,
            description: linkData.description || "",
            targetUrl: linkData.targetUrl,
            linkType: linkData.linkType,
            campaignName: linkData.campaignName,
            utmSource: linkData.utmSource,
            utmMedium: linkData.utmMedium,
            utmCampaign: linkData.utmCampaign,
            utmTerm: linkData.utmTerm || "",
            utmContent: linkData.utmContent || "",
            requireApproval: linkData.requireApproval,
            isActive: linkData.isActive,
          });
          setClickEvents(clicks);
        } else {
          router.push("/admin/ad-links");
        }
      } catch (error) {
        console.error("Error fetching ad link:", error);
        router.push("/admin/ad-links");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [params.id, router]);

  const validateSlug = (slug: string): boolean => {
    const slugRegex = /^[a-z0-9-]+$/;
    return slugRegex.test(slug) && slug.length >= 3 && slug.length <= 50;
  };

  const handleSlugChange = async (value: string) => {
    const cleanSlug = value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setFormData(prev => ({ ...prev, slug: cleanSlug }));
    
    if (cleanSlug.length === 0) {
      setSlugError("");
      return;
    }
    
    if (!validateSlug(cleanSlug)) {
      setSlugError("El slug debe contener solo letras, números y guiones (3-50 caracteres)");
      return;
    }

    // If it's the same as the current slug, no need to check
    if (cleanSlug === adLink?.slug) {
      setSlugError("");
      return;
    }

    try {
      const available = await isSlugAvailable(cleanSlug, adLink?.id);
      if (!available) {
        setSlugError("Este slug ya está en uso");
      } else {
        setSlugError("");
      }
    } catch (error) {
      console.error("Error checking slug:", error);
      setSlugError("Error al verificar disponibilidad");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.slug || !formData.targetUrl || !formData.campaignName) {
      alert("Por favor completa todos los campos requeridos");
      return;
    }

    if (slugError) {
      alert("Por favor corrige el error del slug antes de continuar");
      return;
    }

    if (!adLink?.id) return;

    setIsSaving(true);

    try {
      await updateAdLink(adLink.id, formData);
      router.push("/admin/ad-links");
    } catch (error) {
      console.error("Error updating ad link:", error);
      alert("Error al actualizar el enlace publicitario");
    } finally {
      setIsSaving(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert("Copiado al portapapeles");
    } catch (error) {
      console.error("Error copying to clipboard:", error);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!adLink) {
    return null;
  }

  const shortUrl = generateShortUrl(adLink.slug);

  return (
    <ProtectedRoute requiredPermissions={["ad_links:read"]}>
      <div className="p-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Link href="/admin/ad-links">
              <Button variant="outline" size="sm" className="mr-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">{adLink.title}</h1>
              <p className="text-gray-600">Gestiona y analiza este enlace publicitario</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge variant={adLink.isActive ? "default" : "secondary"}>
              {adLink.isActive ? "Activo" : "Inactivo"}
            </Badge>
            <PermissionGate permissions={["ad_links_analytics:read"]}>
              <Link href={`/admin/ad-links/${adLink.id}/analytics`}>
                <Button variant="outline" size="sm">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Analytics
                </Button>
              </Link>
            </PermissionGate>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <PermissionGate 
              permissions={["ad_links:write"]}
              fallback={
                <Card>
                  <CardContent className="p-6">
                    <p className="text-gray-500">No tienes permisos para editar este enlace.</p>
                  </CardContent>
                </Card>
              }
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Información Básica</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="title">Título *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="slug">Slug (URL corta) *</Label>
                      <div className="space-y-2">
                        <Input
                          id="slug"
                          value={formData.slug}
                          onChange={(e) => handleSlugChange(e.target.value)}
                          required
                        />
                        {slugError && (
                          <div className="flex items-center text-red-500 text-sm">
                            <AlertCircle className="h-4 w-4 mr-1" />
                            {slugError}
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="description">Descripción</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label htmlFor="targetUrl">URL de Destino *</Label>
                      <div className="flex space-x-2">
                        <Input
                          id="targetUrl"
                          type="url"
                          value={formData.targetUrl}
                          onChange={(e) => setFormData(prev => ({ ...prev, targetUrl: e.target.value }))}
                          required
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(formData.targetUrl, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Tracking de Campaña</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="campaignName">Nombre de Campaña *</Label>
                      <Input
                        id="campaignName"
                        value={formData.campaignName}
                        onChange={(e) => setFormData(prev => ({ ...prev, campaignName: e.target.value }))}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="utmSource">UTM Source *</Label>
                        <Input
                          id="utmSource"
                          value={formData.utmSource}
                          onChange={(e) => setFormData(prev => ({ ...prev, utmSource: e.target.value }))}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="utmMedium">UTM Medium *</Label>
                        <Input
                          id="utmMedium"
                          value={formData.utmMedium}
                          onChange={(e) => setFormData(prev => ({ ...prev, utmMedium: e.target.value }))}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="utmCampaign">UTM Campaign *</Label>
                      <Input
                        id="utmCampaign"
                        value={formData.utmCampaign}
                        onChange={(e) => setFormData(prev => ({ ...prev, utmCampaign: e.target.value }))}
                        required
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Configuración</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="isActive">Activo</Label>
                        <p className="text-sm text-gray-600">
                          El enlace estará disponible para clicks
                        </p>
                      </div>
                      <Switch
                        id="isActive"
                        checked={formData.isActive}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                      />
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-end space-x-4">
                  <Link href="/admin/ad-links">
                    <Button type="button" variant="outline" disabled={isSaving}>
                      Cancelar
                    </Button>
                  </Link>
                  <Button type="submit" disabled={isSaving || !!slugError}>
                    {isSaving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Guardar Cambios
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </PermissionGate>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Short URL & Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Enlace y Estadísticas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Enlace Corto</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <code className="flex-1 px-3 py-2 bg-gray-100 rounded text-sm">
                      {shortUrl}
                    </code>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(shortUrl)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-3 bg-blue-50 rounded">
                    <p className="text-2xl font-bold text-blue-600">{adLink.totalClicks}</p>
                    <p className="text-sm text-gray-600">Total Clicks</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded">
                    <p className="text-2xl font-bold text-green-600">{adLink.uniqueClicks}</p>
                    <p className="text-sm text-gray-600">Clicks Únicos</p>
                  </div>
                </div>

                <div className="text-sm text-gray-600">
                  <p>Creado: {formatDate(adLink.createdAt)}</p>
                  <p>Actualizado: {formatDate(adLink.updatedAt)}</p>
                </div>
              </CardContent>
            </Card>

            {/* Recent Clicks */}
            <Card>
              <CardHeader>
                <CardTitle>Clicks Recientes</CardTitle>
              </CardHeader>
              <CardContent>
                {clickEvents.length > 0 ? (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {clickEvents.map((click) => (
                      <div key={click.id} className="p-3 bg-gray-50 rounded text-sm">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <MousePointer className="h-3 w-3 text-purple-500" />
                            {click.isUnique && (
                              <Badge variant="outline" className="text-xs">
                                Único
                              </Badge>
                            )}
                          </div>
                          <span className="text-xs text-gray-500">
                            {formatDate(click.timestamp)}
                          </span>
                        </div>
                        {click.location?.country && (
                          <div className="flex items-center mt-1 text-xs text-gray-600">
                            <MapPin className="h-3 w-3 mr-1" />
                            {click.location.country}
                            {click.location.city && `, ${click.location.city}`}
                          </div>
                        )}
                        {click.utmParams?.source && (
                          <div className="mt-1 text-xs text-gray-600">
                            Source: {click.utmParams.source}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    No hay clicks registrados aún
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}