"use client";

import React, { useState } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { motion } from "framer-motion";
import { createUser, resetPassword } from "@/lib/firebase/auth";

export default function SettingsPage() {
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newUserEmail || !newUserPassword) {
      setError("Por favor completa todos los campos");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      await createUser(newUserEmail, newUserPassword);

      setSuccess("Usuario creado exitosamente");
      setNewUserEmail("");
      setNewUserPassword("");
    } catch (err: any) {
      console.error("Error creating user:", err);
      setError(err.message || "Error al crear usuario");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newUserEmail) {
      setError("Por favor ingresa un email");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      await resetPassword(newUserEmail);

      setSuccess("Se ha enviado un correo para restablecer la contraseña");
    } catch (err: any) {
      console.error("Error resetting password:", err);
      setError(err.message || "Error al restablecer contraseña");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Configuración</h1>

      <Tabs defaultValue="account">
        <TabsList className="mb-6">
          <TabsTrigger value="account">Cuenta</TabsTrigger>
          <TabsTrigger value="admin">Administración</TabsTrigger>
          <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
        </TabsList>

        <TabsContent value="account">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Información de la Cuenta</CardTitle>
                <CardDescription>
                  Actualiza tu información y preferencias de cuenta
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre</Label>
                  <Input id="name" defaultValue="Admin" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    defaultValue="admin@edicionpersuasiva.com"
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button>Guardar Cambios</Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cambiar Contraseña</CardTitle>
                <CardDescription>
                  Actualiza tu contraseña para mantener tu cuenta segura
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Contraseña Actual</Label>
                  <Input id="current-password" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">Nueva Contraseña</Label>
                  <Input id="new-password" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirmar Contraseña</Label>
                  <Input id="confirm-password" type="password" />
                </div>
              </CardContent>
              <CardFooter>
                <Button>Actualizar Contraseña</Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="admin">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Administrar Usuarios</CardTitle>
                <CardDescription>
                  Crear nuevos usuarios administradores
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {success && (
                  <div className="bg-green-100 text-green-800 p-3 rounded-md mb-4">
                    {success}
                  </div>
                )}

                {error && (
                  <div className="bg-red-100 text-red-800 p-3 rounded-md mb-4">
                    {error}
                  </div>
                )}

                <form onSubmit={handleCreateUser} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-user-email">
                      Email del Nuevo Usuario
                    </Label>
                    <Input
                      id="new-user-email"
                      type="email"
                      value={newUserEmail}
                      onChange={(e) => setNewUserEmail(e.target.value)}
                      placeholder="nuevo.usuario@edicionpersuasiva.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-user-password">
                      Contraseña Temporal
                    </Label>
                    <Input
                      id="new-user-password"
                      type="password"
                      value={newUserPassword}
                      onChange={(e) => setNewUserPassword(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button type="submit" disabled={loading}>
                      {loading ? "Creando..." : "Crear Usuario"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleResetPassword}
                      disabled={loading}
                    >
                      Restablecer Contraseña
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Configuración del Sistema</CardTitle>
                <CardDescription>
                  Configura las opciones generales del sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">
                      Automatización de Seguimiento
                    </Label>
                    <p className="text-sm text-gray-500">
                      Enviar correos automáticos de seguimiento a los leads
                    </p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">
                      Notificaciones por Email
                    </Label>
                    <p className="text-sm text-gray-500">
                      Recibir notificaciones por email al recibir un nuevo lead
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Modo Mantenimiento</Label>
                    <p className="text-sm text-gray-500">
                      Poner el sitio en modo mantenimiento
                    </p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
              <CardFooter>
                <Button>Guardar Configuración</Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Preferencias de Notificaciones</CardTitle>
              <CardDescription>
                Configura cómo y cuándo quieres recibir notificaciones
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Nuevo Lead</Label>
                  <p className="text-sm text-gray-500">
                    Notificar cuando ingrese un nuevo lead
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Cambio de Estado</Label>
                  <p className="text-sm text-gray-500">
                    Notificar cuando cambie el estado de un lead
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Resumen Diario</Label>
                  <p className="text-sm text-gray-500">
                    Recibir un resumen diario de actividad
                  </p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Notificaciones Push</Label>
                  <p className="text-sm text-gray-500">
                    Recibir notificaciones en el navegador
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
            <CardFooter>
              <Button>Guardar Preferencias</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
