("use client");

import React from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { Shield, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function UnauthorizedPage() {
  const { userProfile, getAccessibleRoutes } = useAuth();
  const accessibleRoutes = getAccessibleRoutes();

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <Shield className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-xl font-semibold text-gray-900">
            Access Denied
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            You don't have permission to access this page.
          </p>

          {userProfile && (
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm text-gray-700">
                Your current role:{" "}
                <span className="font-medium capitalize">
                  {userProfile.role.replace("_", " ")}
                </span>
              </p>
            </div>
          )}

          <div className="space-y-2">
            {accessibleRoutes.length > 0 ? (
              <>
                <p className="text-sm text-gray-600">Available pages:</p>
                {accessibleRoutes.map((route) => (
                  <Link key={route} href={route}>
                    <Button variant="outline" className="w-full">
                      {route === "/admin"
                        ? "Dashboard"
                        : route
                            .split("/")
                            .pop()
                            ?.replace("-", " ")
                            ?.toUpperCase()}
                    </Button>
                  </Link>
                ))}
              </>
            ) : (
              <p className="text-sm text-gray-600">
                No pages are currently accessible with your role.
              </p>
            )}
          </div>

          <Link href="/">
            <Button variant="outline" className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
