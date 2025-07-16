import React, { useState, useRef, useEffect } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { toast } from "sonner";

interface VideoPlayerProps {
  videoUrl?: string;
  title: string;
  thumbnail?: string;
  initialTime?: number;
  onProgress?: (currentTime: number, duration: number) => void;
  onComplete?: (currentTime: number, duration: number) => void;
  onPlayPause?: (playing: boolean) => void;
}

const VideoPlayer = ({
  videoUrl = "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
  title,
  thumbnail,
  initialTime = 0,
  onProgress,
  onComplete,
  onPlayPause,
}: VideoPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasTriggeredComplete, setHasTriggeredComplete] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Função para garantir que um valor seja um número válido
  const ensureNumber = (value: number | undefined | null): number => {
    if (typeof value !== "number" || isNaN(value) || !isFinite(value)) {
      return 0;
    }
    return value;
  };

  // Função para calcular o progresso em porcentagem
  const calculateProgress = (current: number, total: number): number => {
    const currentTime = ensureNumber(current);
    const totalDuration = ensureNumber(total);
    if (totalDuration === 0) return 0;
    return Math.min(Math.max((currentTime / totalDuration) * 100, 0), 100);
  };

  useEffect(() => {
    onPlayPause?.(isPlaying);
  }, [isPlaying, onPlayPause]);

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;

    const currentTime = ensureNumber(videoRef.current.currentTime);
    const videoDuration = ensureNumber(videoRef.current.duration);
    const progressPercent = calculateProgress(currentTime, videoDuration);

    setProgress(progressPercent);
    if (onProgress) {
      if (progressPercent >= 90 && currentTime > 0 && !hasTriggeredComplete) {
        setHasTriggeredComplete(true);
        handleEnded(currentTime, videoDuration);
      }
      onProgress(currentTime, videoDuration);
    }
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    const videoDuration = ensureNumber(videoRef.current.duration);
    setDuration(videoDuration);

    // Set initial time if provided
    if (initialTime > 0 && videoRef.current && videoDuration > 0) {
      // Garante que o tempo inicial seja válido
      const validInitialTime = Math.min(initialTime, videoDuration);
      console.log("Definindo tempo inicial do vídeo:", {
        tempoInicial: initialTime,
        tempoValido: validInitialTime,
        duração: videoDuration,
      });

      try {
        videoRef.current.currentTime = validInitialTime;
        const progressPercent = calculateProgress(
          validInitialTime,
          videoDuration
        );
        setProgress(progressPercent);

        // Notifica o componente pai sobre o progresso inicial
        if (onProgress) {
          onProgress(validInitialTime, videoDuration);
        }
      } catch (error) {
        console.error("Erro ao definir tempo inicial:", error);
      }
    }
  };

  // Adiciona um efeito para lidar com mudanças no initialTime
  useEffect(() => {
    if (videoRef.current && initialTime > 0 && videoRef.current.duration > 0) {
      const validInitialTime = Math.min(initialTime, videoRef.current.duration);
      console.log("Atualizando tempo do vídeo:", {
        tempoInicial: initialTime,
        tempoValido: validInitialTime,
        duração: videoRef.current.duration,
      });

      try {
        videoRef.current.currentTime = validInitialTime;
        const progressPercent = calculateProgress(
          validInitialTime,
          videoRef.current.duration
        );
        setProgress(progressPercent);
      } catch (error) {
        console.error("Erro ao atualizar tempo do vídeo:", error);
      }
    }
  }, [initialTime]);

  const handleEnded = (currentTime: number, videoDuration: number) => {
    const progressPercent = calculateProgress(currentTime, videoDuration);

    if (progressPercent >= 90 && !hasTriggeredComplete) {
      setIsPlaying(false);
      if (onComplete) {
        onComplete(currentTime, videoDuration);
      }
    }
  };

  useEffect(() => {
    setHasTriggeredComplete(false);
  }, [videoUrl]);

  const handlePlayPause = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault(); // Previne comportamentos indesejados
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
      console.log("Vídeo pausado em:", {
        tempo: videoRef.current.currentTime,
        duração: videoRef.current.duration,
        progresso: `${calculateProgress(
          videoRef.current.currentTime,
          videoRef.current.duration
        ).toFixed(2)}%`,
      });
    } else {
      if (videoRef.current.currentTime >= videoRef.current.duration - 0.1) {
        videoRef.current.currentTime = 0;
      }

      videoRef.current.play().catch((error) => {
        toast.error("Erro ao reproduzir vídeo");
      });
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const seekPercent = ensureNumber(parseFloat(e.target.value));
    const seekTime = (seekPercent / 100) * ensureNumber(duration);

    if (!videoRef.current) return;
    videoRef.current.currentTime = seekTime;
    setProgress(seekPercent);
  };

  const formatTime = (time: number) => {
    const validTime = ensureNumber(time);
    const minutes = Math.floor(validTime / 60);
    const seconds = Math.floor(validTime % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // Função para alternar tela cheia
  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    try {
      if (!document.fullscreenElement) {
        containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (error) {
      console.error("Erro ao alternar tela cheia:", error);
      toast.error("Erro ao alternar tela cheia");
    }
  };

  // Listener para mudanças no estado de tela cheia
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const togglePlay = () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
      // Log quando o vídeo é pausado
      console.log("Vídeo pausado em:", {
        tempo: videoRef.current.currentTime,
        duração: videoRef.current.duration,
        progresso: `${calculateProgress(
          videoRef.current.currentTime,
          videoRef.current.duration
        ).toFixed(2)}%`,
      });
    } else {
      if (videoRef.current.currentTime >= videoRef.current.duration - 0.1) {
        videoRef.current.currentTime = 0;
      }

      videoRef.current.play().catch((error) => {
        toast.error("Erro ao reproduzir vídeo");
      });
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-black rounded-lg overflow-hidden group"
    >
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() =>
          handleEnded(
            videoRef.current?.currentTime || 0,
            videoRef.current?.duration || 0
          )
        }
        poster={thumbnail || "/placeholder-thumbnail.jpg"}
        playsInline
        preload="metadata"
      >
        <source src={videoUrl} type="video/mp4" />
        Seu navegador não suporta vídeos HTML5.
      </video>

      {/* Overlay Controls */}
      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
        <button
          onClick={handlePlayPause}
          className="bg-white/20 backdrop-blur-sm rounded-full p-4 hover:bg-white/30 transition-colors"
        >
          {isPlaying ? (
            <Pause className="w-8 h-8" />
          ) : (
            <Play className="w-8 h-8 ml-1" />
          )}
        </button>
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="flex items-center gap-4">
          <button
            onClick={handlePlayPause}
            className="text-white hover:text-purple-400 transition-colors"
          >
            {isPlaying ? (
              <Pause className="w-6 h-6" />
            ) : (
              <Play className="w-6 h-6" />
            )}
          </button>

          <button
            onClick={toggleMute}
            className="text-white hover:text-purple-400 transition-colors"
          >
            {isMuted ? (
              <VolumeX className="w-6 h-6" />
            ) : (
              <Volume2 className="w-6 h-6" />
            )}
          </button>

          <div className="flex-1">
            <input
              type="range"
              min="0"
              max="100"
              value={ensureNumber(progress)}
              onChange={handleSeek}
              className="w-full h-1 bg-white/20 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-purple-500"
            />
          </div>

          <span className="text-white text-sm">{formatTime(duration)}</span>

          <button
            onClick={toggleFullscreen}
            className="text-white hover:text-purple-400 transition-colors"
          >
            {isFullscreen ? (
              <Minimize2 className="w-6 h-6" />
            ) : (
              <Maximize2 className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Title Overlay */}
      <div className="absolute top-4 left-4 right-4">
        <h2 className="text-white text-xl font-semibold drop-shadow-lg">
          {title}
        </h2>
      </div>
    </div>
  );
};

export { VideoPlayer as default };
