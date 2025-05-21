"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  getWeeklyLeaderboard,
  getAllTimeLeaderboard,
  getWeekSubmissions,
  getAvailableWeeks,
  getCurrentWeekNumber,
  LeaderboardEntry,
  VideoSubmission,
} from "@/lib/firebase/hall-of-fame";

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
import { motion } from "framer-motion";
import Header from "@/components/ui/Header";

const HallOfFamePage = () => {
  const [activeTab, setActiveTab] = useState("weekly");
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [submissions, setSubmissions] = useState<VideoSubmission[]>([]);
  const [availableWeeks, setAvailableWeeks] = useState<number[]>([]);
  const [currentWeek, setCurrentWeek] = useState<number>(
    getCurrentWeekNumber()
  );
  const [selectedWeek, setSelectedWeek] = useState<number>(
    getCurrentWeekNumber()
  );
  const [loading, setLoading] = useState(true);

  // Fetch data based on active tab and selected week
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch available weeks
        const weeks = await getAvailableWeeks();
        setAvailableWeeks(weeks);

        // If no weeks available or selected week is not available, use current week
        if (weeks.length === 0 || !weeks.includes(selectedWeek)) {
          setSelectedWeek(getCurrentWeekNumber());
        }

        // Fetch leaderboard data
        if (activeTab === "weekly") {
          const weeklyLeaderboard = await getWeeklyLeaderboard(selectedWeek);
          setLeaderboard(weeklyLeaderboard);

          // Fetch top submissions for the selected week
          const weekSubmissions = await getWeekSubmissions(selectedWeek);
          setSubmissions(weekSubmissions);
        } else {
          const allTimeLeaderboard = await getAllTimeLeaderboard();
          setLeaderboard(allTimeLeaderboard);

          // For all-time tab, fetch the most recent submissions
          const recentSubmissions = await getWeekSubmissions(
            getCurrentWeekNumber()
          );
          setSubmissions(recentSubmissions);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeTab, selectedWeek]);

  // Function to render video embeds based on platform
  const renderVideoEmbed = (submission: VideoSubmission) => {
    // First try platform-specific embeds
    if (submission.platform === "youtube" && submission.videoId) {
      return (
        <iframe
          width="100%"
          height="100%"
          src={`https://www.youtube.com/embed/${submission.videoId}`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="rounded-md"
        ></iframe>
      );
    } else if (submission.platform === "vimeo" && submission.videoId) {
      return (
        <iframe
          width="100%"
          height="100%"
          src={`https://player.vimeo.com/video/${submission.videoId}`}
          allow="autoplay; fullscreen"
          allowFullScreen
          className="rounded-md"
        ></iframe>
      );
    } else if (submission.platform === "instagram" && submission.videoId) {
      // Just render a link for Instagram - their embed APIs are less reliable
      return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-purple-900/30 rounded-md p-4">
          <div className="text-lg font-medium mb-2 text-white">
            Instagram Reel
          </div>
          <a
            href={`https://www.instagram.com/reel/${submission.videoId}/`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded transition-colors"
          >
            View Video
          </a>
        </div>
      );
    } else if (submission.platform === "facebook" && submission.videoId) {
      // Just render a link for Facebook - their embed APIs are less reliable
      return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-purple-900/30 rounded-md p-4">
          <div className="text-lg font-medium mb-2 text-white">
            Facebook Video
          </div>
          <a
            href={`https://www.facebook.com/watch/?v=${submission.videoId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded transition-colors"
          >
            View Video
          </a>
        </div>
      );
    } else {
      // Fallback for unknown platforms or direct URLs
      return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-purple-900/30 rounded-md p-4">
          <div className="text-lg font-medium mb-2">External Video</div>
          <a
            href={submission.videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded transition-colors"
          >
            View Video
          </a>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <div className="container mx-auto pt-20 px-4 pb-16">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4 purple-text-glow">
            Hall of Fame
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">
            Los top videos hechos por la comunidad de Edicion Persuasiva, unete
            a la comunidad, sube tus videos en #hall-of-fame y gana
            reconocimiento cada semana cada semana!
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Leaderboard Section */}
          <div className="lg:col-span-1">
            <Card className="bg-purple-950/30 border-purple-800/50">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-2xl font-bold text-white">
                    Leaderboard
                  </CardTitle>
                  <Tabs
                    defaultValue="weekly"
                    value={activeTab}
                    onValueChange={setActiveTab}
                  >
                    <TabsList className="bg-purple-900/50">
                      <TabsTrigger value="weekly">Weekly</TabsTrigger>
                      <TabsTrigger value="alltime">All Time</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
                {activeTab === "weekly" && availableWeeks.length > 0 && (
                  <div className="mt-4 flex items-center gap-2">
                    <div className="text-sm text-gray-400">Week:</div>
                    <select
                      value={selectedWeek}
                      onChange={(e) => setSelectedWeek(Number(e.target.value))}
                      className="bg-purple-900/50 border border-purple-700/50 rounded px-2 py-1 text-sm"
                    >
                      {availableWeeks.map((week) => (
                        <option key={week} value={week}>
                          Week {week}
                          {week === currentWeek ? " (Current)" : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
                  </div>
                ) : leaderboard.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <p className="text-lg text-white">No entries yet!</p>
                    <p className="text-sm mt-2 ">
                      Sube el link de tu video en nuestro Discord y gana
                      reconocimiento en la comunidad.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {leaderboard.map((entry) => (
                      <div
                        key={entry.userId}
                        className={`flex items-center gap-3 p-3 rounded-md ${
                          entry.rank === 1
                            ? "bg-yellow-600/20 border border-yellow-600/30"
                            : entry.rank === 2
                            ? "bg-gray-500/20 border border-gray-400/30"
                            : entry.rank === 3
                            ? "bg-amber-800/20 border border-amber-700/30"
                            : "bg-purple-900/20 border border-purple-800/30"
                        }`}
                      >
                        <div
                          className={`w-8 h-8 flex items-center justify-center rounded-full font-bold ${
                            entry.rank === 1
                              ? "bg-yellow-600 text-white"
                              : entry.rank === 2
                              ? "bg-gray-400 text-gray-900"
                              : entry.rank === 3
                              ? "bg-amber-700 text-white"
                              : "bg-purple-700/50 text-gray-200"
                          }`}
                        >
                          {entry.rank}
                        </div>
                        <div className="w-10 h-10 relative rounded-full overflow-hidden bg-purple-800/50">
                          {entry.avatar && (
                            <Image
                              src={entry.avatar}
                              alt={entry.username}
                              fill
                              className="object-cover"
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate text-white">
                            {entry.username}
                          </p>
                          <p className="text-sm text-gray-400">
                            {entry.votes} votes
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            <div className="mt-6">
              <Card className="bg-purple-950/30 border-purple-800/50">
                <CardHeader>
                  <CardDescription className="text-gray-300">
                    Sube el link de tu video en #hall-of-fame y gana
                    reconocimiento en la comunidad.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-4">
                    <p className="text-sm text-gray-300">
                      Comparte tu mejor video y gana reconocimiento en la
                      comunidad.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Video Submissions Grid */}
          <div className="lg:col-span-2">
            <Card className="bg-purple-950/30 border-purple-800/50">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-300">
                  {activeTab === "weekly"
                    ? `Videos de la semana ${selectedWeek} `
                    : "Top Submissions"}
                </CardTitle>
                <CardDescription className="text-gray-300">
                  {activeTab === "weekly"
                    ? "Los mejores videos de la semana"
                    : "Los mejores videos de todos los tiempos"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
                  </div>
                ) : submissions.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <p className="text-lg">No hay videos todavia!</p>
                    <p className="text-sm mt-2">
                      Se el primero en subir un video
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {submissions.map((submission) => (
                      <motion.div
                        key={submission.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                        className="bg-purple-900/20 border border-purple-700/30 rounded-lg overflow-hidden"
                      >
                        <div className="aspect-video relative">
                          {renderVideoEmbed(submission)}
                        </div>
                        <div className="p-4">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 relative rounded-full overflow-hidden bg-purple-800/50">
                              {submission.authorAvatar && (
                                <Image
                                  src={submission.authorAvatar}
                                  alt={submission.authorUsername}
                                  fill
                                  className="object-cover"
                                />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate text-white">
                                {submission.authorUsername}
                              </p>
                              <p className="text-xs text-gray-400">
                                {new Date(
                                  submission.timestamp
                                ).toLocaleDateString()}
                              </p>
                            </div>
                            <Badge className="bg-purple-600">
                              {submission.votes} votes
                            </Badge>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HallOfFamePage;
