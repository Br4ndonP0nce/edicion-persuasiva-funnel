"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/hooks/useAuth";
import { createAdLink, isSlugAvailable } from "@/lib/firebase/db";
import { AdLinkFormData } from "@/types/ad-links";
import { generateShortUrl } from "@/lib/config";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Save, Eye, AlertCircle } from "lucide-react";

export default function CreateAdLinkPage() {
  const router = useRouter();
  const { userProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
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

    try {
      const available = await isSlugAvailable(cleanSlug);
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

    setIsLoading(true);

    try {
      const adLinkData = {
        ...formData,
        createdBy: userProfile?.uid,
      };

      const linkId = await createAdLink(adLinkData);
      router.push(`/admin/ad-links/${linkId}`);
    } catch (error) {
      console.error("Error creating ad link:", error);
      alert("Error al crear el enlace publicitario");
    } finally {
      setIsLoading(false);
    }
  };

  const generateSlugFromTitle = (title: string) => {
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    handleSlugChange(slug);
  };

  const previewUrl = generateShortUrl(formData.slug);

  return (
    <ProtectedRoute requiredPermissions={["ad_links:write"]}>
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <Link href="/admin/ad-links">
            <Button variant="outline" size="sm" className="mr-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Crear Enlace Publicitario</h1>
            <p className="text-gray-600">
              Crea un nuevo enlace trackeable para tus campañas
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
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
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, title: e.target.value }));
                    if (!formData.slug) {
                      generateSlugFromTitle(e.target.value);
                    }
                  }}
                  placeholder="Ej. Campaña Facebook Enero 2024"
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
                    placeholder="ej-campana-enero"
                    required
                  />
                  {slugError && (
                    <div className="flex items-center text-red-500 text-sm">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {slugError}
                    </div>
                  )}
                  {formData.slug && !slugError && (
                    <div className="flex items-center text-green-600 text-sm">
                      <Eye className="h-4 w-4 mr-2" />
                      Vista previa: <code className="ml-1 px-2 py-1 bg-gray-100 rounded">{previewUrl}</code>
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
                  placeholder="Breve descripción de la campaña o enlace"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="targetUrl">URL de Destino *</Label>
                <Input
                  id="targetUrl"
                  type="url"
                  value={formData.targetUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, targetUrl: e.target.value }))}
                  placeholder="https://ejemplo.com/destino"
                  required
                />
              </div>

              <div>
                <Label htmlFor="linkType">Tipo de Enlace</Label>
                <Select
                  value={formData.linkType}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, linkType: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="course">Curso</SelectItem>
                    <SelectItem value="landing_page">Landing Page</SelectItem>
                    <SelectItem value="external">Enlace Externo</SelectItem>
                    <SelectItem value="resource">Recurso</SelectItem>
                  </SelectContent>
                </Select>
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
                  placeholder="Ej. Promo Enero 2024"
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
                    placeholder="facebook, instagram, email"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="utmMedium">UTM Medium *</Label>
                  <Input
                    id="utmMedium"
                    value={formData.utmMedium}
                    onChange={(e) => setFormData(prev => ({ ...prev, utmMedium: e.target.value }))}
                    placeholder="cpc, social, email"
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
                  placeholder="promo-enero-2024"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="utmTerm">UTM Term</Label>
                  <Input
                    id="utmTerm"
                    value={formData.utmTerm}
                    onChange={(e) => setFormData(prev => ({ ...prev, utmTerm: e.target.value }))}
                    placeholder="palabra-clave"
                  />
                </div>

                <div>
                  <Label htmlFor="utmContent">UTM Content</Label>
                  <Input
                    id="utmContent"
                    value={formData.utmContent}
                    onChange={(e) => setFormData(prev => ({ ...prev, utmContent: e.target.value }))}
                    placeholder="banner-azul"
                  />
                </div>
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
                  <Label htmlFor="requireApproval">Requiere Aprobación</Label>
                  <p className="text-sm text-gray-600">
                    El enlace necesitará ser aprobado antes de activarse
                  </p>
                </div>
                <Switch
                  id="requireApproval"
                  checked={formData.requireApproval}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, requireApproval: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="isActive">Activo</Label>
                  <p className="text-sm text-gray-600">
                    El enlace estará disponible inmediatamente
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
              <Button type="button" variant="outline" disabled={isLoading}>
                Cancelar
              </Button>
            </Link>
            <Button type="submit" disabled={isLoading || !!slugError}>
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  Creando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Crear Enlace
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </ProtectedRoute>
  );
}