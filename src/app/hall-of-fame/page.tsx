"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import SafeImage from "@/components/SafeImage";
import {
  getLeaderboard,
  getHallOfFameSubmissions,
  getRecentSubmissions,
  getAvailableMonths,
  getCurrentMonthCycle,
  getMonthName,
  getUserLevel,
  getLevelColor,
  getProgressToNextLevel,
  WIN_CATEGORIES,
  LeaderboardEntry,
  WinSubmission,
  renderSubmissionPreview,
} from "@/lib/firebase/hall-of-fame";
import MediaPreview from "@/components/MediaPreview";
import EnhancedSubmissionCard from "@/components/SubmissionCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import Header from "@/components/ui/Header";
import JsonLd, { createBreadcrumbSchema } from "@/components/JsonLd";

const HallOfFamePage = () => {
  const breadcrumbItems = [
    { name: "Inicio", url: "https://www.edicionpersuasiva.com" },
    {
      name: "Hall of Fame",
      url: "https://www.edicionpersuasiva.com/hall-of-fame",
    },
  ];
  const isDiscordImage = (url: string) => {
    return url.includes("cdn.discordapp.com") || url.includes("discord.com");
  };
  const [activeTab, setActiveTab] = useState("hall_of_fame");
  const [leaderboardType, setLeaderboardType] = useState<"monthly" | "alltime">(
    "monthly"
  );
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [submissions, setSubmissions] = useState<WinSubmission[]>([]);
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);
  const [currentMonth, setCurrentMonth] = useState<string>(
    getCurrentMonthCycle()
  );
  const [selectedMonth, setSelectedMonth] = useState<string>(
    getCurrentMonthCycle()
  );
  const [loading, setLoading] = useState(true);

  // Fetch data based on active tab, leaderboard type, and selected month
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch available months
        const months = await getAvailableMonths();
        setAvailableMonths(months);

        // If selected month is not available, use current month
        if (months.length === 0 || !months.includes(selectedMonth)) {
          setSelectedMonth(getCurrentMonthCycle());
        }

        // Fetch leaderboard data
        const leaderboardData = await getLeaderboard(
          leaderboardType,
          leaderboardType === "monthly" ? selectedMonth : undefined,
          10
        );
        setLeaderboard(leaderboardData);

        // Fetch submissions based on active tab
        let submissionData: WinSubmission[] = [];
        if (activeTab === "hall_of_fame") {
          submissionData = await getHallOfFameSubmissions(20);
        } else {
          submissionData = await getRecentSubmissions(selectedMonth, 20);
        }
        setSubmissions(submissionData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeTab, leaderboardType, selectedMonth]);

  // Function to render submission preview based on evidence type
  const renderSubmissionCard = (submission: WinSubmission) => {
    return (
      <EnhancedSubmissionCard key={submission.id} submission={submission} />
    );
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <JsonLd data={createBreadcrumbSchema(breadcrumbItems)} />
      <Header />
      <div className="container mx-auto pt-20 px-4 pb-16">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4 purple-text-glow">
            🏆 Hall of Fame
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">
            Los mejores editores de la comunidad de Edición Persuasiva. ¡Sube
            tus wins en Discord y gana reconocimiento!
          </p>

          {/* Win Categories Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 max-w-4xl mx-auto">
            {Object.values(WIN_CATEGORIES).map((category) => (
              <div
                key={category.id}
                className="bg-purple-950/30 border border-purple-800/50 rounded-lg p-4"
              >
                <div className="text-2xl mb-2">{category.emoji}</div>
                <div className="text-sm font-medium text-white">
                  {category.name}
                </div>
                <div className="text-xs text-purple-400">
                  +{category.points}pts
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {category.description}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <div className="flex justify-center">
          {/* Submissions Grid - Centered and Smaller */}
          <div className="w-full max-w-4xl">
            {" "}
            {/* Changed: Added max-width container */}
            <Card className="bg-purple-950/30 border-purple-800/50">
              <CardHeader>
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <CardTitle className="text-2xl font-bold text-white">
                      🎯 Submissions
                    </CardTitle>
                    <CardDescription className="text-gray-300">
                      Los mejores wins de la comunidad
                    </CardDescription>
                  </div>
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="bg-purple-900/50">
                      <TabsTrigger value="hall_of_fame">
                        Hall of Fame
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
                  </div>
                ) : submissions.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <p className="text-lg text-white">
                      ¡No hay submissions todavía!
                    </p>
                    <p className="text-sm mt-2">
                      Sé el primero en subir tu win en Discord
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
                    {/* Changed: 3 columns max, smaller gaps, centered */}
                    {submissions.map((submission) =>
                      renderSubmissionCard(submission)
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Statistics Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-12"
        >
          <Card className="bg-purple-950/30 border-purple-800/50">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-white text-center">
                📊 Estadísticas del Mes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {Object.values(WIN_CATEGORIES).map((category) => {
                  const categorySubmissions = submissions.filter(
                    (s) => s.category === category.id
                  );
                  const totalPoints = categorySubmissions.reduce(
                    (sum, s) => sum + s.points,
                    0
                  );

                  return (
                    <div key={category.id} className="text-center">
                      <div className="text-3xl mb-2">{category.emoji}</div>
                      <div className="text-2xl font-bold text-white mb-1">
                        {categorySubmissions.length}
                      </div>
                      <div className="text-sm text-gray-300 mb-1">
                        {category.name}
                      </div>
                      <div className="text-xs text-purple-400">
                        {totalPoints} puntos totales
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* How to Participate Section */}
        {/* <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-12"
        >
          <Card className="bg-purple-950/30 border-purple-800/50">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-white text-center">
                🎯 ¿Cómo Participar?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">
                    📱 Pasos para enviar wins:
                  </h3>
                  <ol className="space-y-3 text-gray-300">
                    <li className="flex items-start gap-3">
                      <span className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                        1
                      </span>
                      <span>Sube tu imagen, video o enlace en Discord</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                        2
                      </span>
                      <span>Selecciona la categoría de tu win</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                        3
                      </span>
                      <span>¡Espera la aprobación y gana puntos!</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                        4
                      </span>
                      <span>Compite por el top 3 mensual</span>
                    </li>
                  </ol>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">
                    🏅 Recompensas:
                  </h3>
                  <ul className="space-y-2 text-gray-300">
                    <li className="flex items-center gap-2">
                      <span className="text-yellow-500">🥇</span>
                      <span>Top 3 mensual: Reconocimiento en redes</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-purple-500">⭐</span>
                      <span>Hall of Fame: Exposición permanente</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-500">💼</span>
                      <span>Recomendaciones a futuros clientes</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-blue-500">🚀</span>
                      <span>Construcción de marca personal</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>*/}
      </div>
    </div>
  );
};

export default HallOfFamePage;
