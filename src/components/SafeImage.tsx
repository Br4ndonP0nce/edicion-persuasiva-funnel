// components/SafeImage.tsx
import React, { useState } from "react";
import Image from "next/image";

interface SafeImageProps {
  src: string;
  alt: string;
  fill?: boolean;
  className?: string;
  fallbackType?: "discord" | "drive" | "generic";
  fallbackMessage?: string;
}

const SafeImage: React.FC<SafeImageProps> = ({
  src,
  alt,
  fill,
  className,
  fallbackType = "generic",
  fallbackMessage,
}) => {
  const [imageError, setImageError] = useState(false);

  const isDiscordImage = (url: string) => {
    return url.includes("cdn.discordapp.com") || url.includes("discord.com");
  };

  const getFallbackContent = () => {
    if (fallbackMessage) {
      return {
        icon: "🖼️",
        title: "Imagen no disponible",
        message: fallbackMessage,
      };
    }

    if (fallbackType === "discord" || isDiscordImage(src)) {
      return {
        icon: "📷",
        title: "Imagen de Discord",
        message: "Esta Imagen solo esta disponible en Discord",
      };
    }

    if (fallbackType === "drive") {
      return {
        icon: "📁",
        title: "Vista previa no disponible",
        message: 'Haz clic en "Ver Archivo" para acceder',
      };
    }

    return {
      icon: "🖼️",
      title: "Imagen no disponible",
      message: "No se pudo cargar la imagen",
    };
  };

  if (imageError) {
    const fallback = getFallbackContent();
    return (
      <div className="absolute inset-0 bg-purple-950/80 flex flex-col items-center justify-center text-white">
        <div className="text-4xl mb-3">{fallback.icon}</div>
        <div className="text-lg font-medium mb-2">{fallback.title}</div>
        <div className="text-sm text-gray-300 text-center px-4">
          {fallback.message}
        </div>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      className={className}
      onError={() => setImageError(true)}
    />
  );
};

export default SafeImage;
