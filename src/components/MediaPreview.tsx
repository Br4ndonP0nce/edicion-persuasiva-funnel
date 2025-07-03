// components/MediaPreview.tsx
import React, { useState } from "react";
import Image from "next/image";
import { YouTubeEmbed } from "@next/third-parties/google";
import { WinSubmission } from "@/lib/firebase/hall-of-fame";
interface MediaPreviewProps {
  submission: WinSubmission;
  preview: any;
}

const MediaPreview: React.FC<MediaPreviewProps> = ({ submission, preview }) => {
  const [imageError, setImageError] = useState(false);
  const [showEmbed, setShowEmbed] = useState(false);

  // Helper functions to extract IDs from URLs
  const extractYouTubeId = (url: string): string | null => {
    const regExp =
      /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[7].length === 11 ? match[7] : null;
  };

  const extractInstagramId = (url: string): string | null => {
    const regExp =
      /(?:https?:\/\/)?(?:www\.)?instagram\.com\/(?:p|reel)\/([A-Za-z0-9_-]+)/;
    const match = url.match(regExp);
    return match ? match[1] : null;
  };

  const extractTikTokId = (url: string): string | null => {
    const regExp =
      /(?:https?:\/\/)?(?:www\.)?tiktok\.com\/@[\w.-]+\/video\/(\d+)/;
    const match = url.match(regExp);
    return match ? match[1] : null;
  };

  const extractVimeoId = (url: string): string | null => {
    const regExp = /(?:https?:\/\/)?(?:www\.)?vimeo\.com\/(\d+)/;
    const match = url.match(regExp);
    return match ? match[1] : null;
  };

  const isDiscordImage = (url: string) => {
    return url.includes("cdn.discordapp.com") || url.includes("discord.com");
  };

  // Enhanced preview rendering based on platform
  const renderEnhancedPreview = () => {
    const evidenceUrl = submission.evidenceUrl;

    // YouTube handling
    if (
      preview.component === "youtube" ||
      evidenceUrl.includes("youtube.com") ||
      evidenceUrl.includes("youtu.be")
    ) {
      const videoId = extractYouTubeId(evidenceUrl);
      if (videoId) {
        return (
          <div className="w-full h-full">
            <YouTubeEmbed
              videoid={videoId}
              style="width: 100%; height: 100%;"
              params="controls=1&modestbranding=1&rel=0"
            />
          </div>
        );
      }
    }

    // Instagram handling
    if (evidenceUrl.includes("instagram.com")) {
      const postId = extractInstagramId(evidenceUrl);
      if (postId && showEmbed) {
        return (
          <div className="w-full h-full flex items-center justify-center">
            <iframe
              src={`https://www.instagram.com/p/${postId}/embed`}
              width="100%"
              height="100%"
              frameBorder="0"
              scrolling="no"
              allowTransparency={true}
              className="instagram-embed"
            />
          </div>
        );
      } else {
        return (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-purple-600 to-pink-600 p-4">
            <div className="text-4xl mb-3">📸</div>
            <div className="text-lg font-medium mb-2 text-white">
              Instagram Post
            </div>
            <div className="text-sm text-gray-200 mb-4 text-center">
              Haz clic para ver el contenido
            </div>
            <div className="flex gap-2">
              <a
                href={evidenceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white hover:bg-gray-100 text-gray-900 font-medium py-2 px-4 rounded transition-colors"
              >
                Abrir en IG
              </a>
            </div>
          </div>
        );
      }
    }

    // TikTok handling
    if (evidenceUrl.includes("tiktok.com")) {
      const videoId = extractTikTokId(evidenceUrl);
      return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-black p-4">
          <div className="text-4xl mb-3">🎵</div>
          <div className="text-lg font-medium mb-2 text-white">
            TikTok Video
          </div>
          <div className="text-sm text-gray-300 mb-4 text-center">
            Ver en la plataforma original
          </div>
          <a
            href={evidenceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-pink-600 hover:bg-pink-700 text-white font-medium py-2 px-4 rounded transition-colors"
          >
            Ver en TikTok
          </a>
        </div>
      );
    }

    // Vimeo handling
    if (evidenceUrl.includes("vimeo.com")) {
      const videoId = extractVimeoId(evidenceUrl);
      if (videoId) {
        return (
          <div className="w-full h-full">
            <iframe
              src={`https://player.vimeo.com/video/${videoId}?title=0&byline=0&portrait=0`}
              width="100%"
              height="100%"
              frameBorder="0"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              className="rounded-t-md"
            />
          </div>
        );
      }
    }

    // Facebook handling
    if (evidenceUrl.includes("facebook.com")) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-blue-600 p-4">
          <div className="text-4xl mb-3">👥</div>
          <div className="text-lg font-medium mb-2 text-white">
            Facebook Post
          </div>
          <div className="text-sm text-blue-100 mb-4 text-center">
            Ver en Facebook para mejor experiencia
          </div>
          <a
            href={evidenceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white hover:bg-gray-100 text-blue-600 font-medium py-2 px-4 rounded transition-colors"
          >
            Ver en Facebook
          </a>
        </div>
      );
    }

    // Image handling with fallback
    if (preview.component === "image") {
      if (imageError) {
        const isDiscord = isDiscordImage(preview.props.src);
        return (
          <div className="absolute inset-0 bg-purple-950/80 flex flex-col items-center justify-center text-white">
            <div className="text-4xl mb-3">{isDiscord ? "📷" : "🖼️"}</div>
            <div className="text-lg font-medium mb-2">
              {isDiscord ? "Imagen de Discord" : "Imagen no disponible"}
            </div>
            <div className="text-sm text-gray-300 text-center px-4">
              {isDiscord
                ? "Esta imagen ya no está disponible en Discord"
                : "No se pudo cargar la imagen"}
            </div>
          </div>
        );
      }

      return (
        <Image
          src={preview.props.src}
          alt={preview.props.alt}
          fill
          className="object-cover"
          onError={() => setImageError(true)}
        />
      );
    }

    // Google Drive handling
    if (preview.component === "drive") {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center p-4">
          {preview.props.src && !imageError && (
            <Image
              src={preview.props.src}
              alt={preview.props.title}
              fill
              className="object-cover"
              onError={() => setImageError(true)}
            />
          )}
          <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white">
            <div className="text-lg font-medium mb-2">📁 Google Drive</div>
            <div className="text-sm text-gray-300 mb-3 text-center">
              {preview.props.fileName || "Archivo"}
            </div>
            <a
              href={preview.props.href}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded transition-colors"
            >
              Ver Archivo
            </a>
          </div>
        </div>
      );
    }

    // Generic link fallback
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-purple-950/50 p-4">
        <div className="text-lg font-medium mb-2 text-white capitalize">
          🔗 Enlace Externo
        </div>
        <a
          href={evidenceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded transition-colors"
        >
          Ver Contenido
        </a>
      </div>
    );
  };

  return (
    <div className="aspect-video relative bg-purple-950/30">
      {renderEnhancedPreview()}
    </div>
  );
};

export default MediaPreview;
