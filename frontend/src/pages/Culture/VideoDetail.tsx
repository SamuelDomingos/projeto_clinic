import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import VideoPlayer from '@/components/culture/VideoPlayer';
import { authService } from '@/lib/api';
import { toast } from 'sonner';
import { Video } from '@/lib/types';

const VideoDetail: React.FC = () => {
  const { videoId } = useParams();
  const navigate = useNavigate();
  const [video, setVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasCompleted, setHasCompleted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [savedTime, setSavedTime] = useState(0);
  const lastUpdateTime = useRef(Date.now());
  const currentWatchTime = useRef(0);
  const videoDuration = useRef<number>(0);
  const updateInterval = useRef<NodeJS.Timeout>();
  const [isUpdating, setIsUpdating] = useState(false);

  // Limpa o intervalo quando o componente é desmontado
  useEffect(() => {
    return () => {
      if (updateInterval.current) {
        clearInterval(updateInterval.current);
      }
    };
  }, []);

  // Limpa o intervalo quando o vídeo é pausado
  useEffect(() => {
    if (!isPlaying && updateInterval.current) {
      clearInterval(updateInterval.current);
      updateInterval.current = undefined;
    }
  }, [isPlaying]);

  // Busca o status de visualização do vídeo
  const fetchWatchStatus = async () => {
    if (!videoId) return;
    
    try {
      const response = await authService.getVideoWatchStatus(parseInt(videoId));
      console.log('Status de visualização recebido:', response);
      
      if (response.completed) {
        setHasCompleted(true);
      }
      
      // Usa o tempo em segundos diretamente
      if (response.watchTime) {
        console.log('Tempo de visualização em segundos:', response.watchTime);
        setSavedTime(response.watchTime);
      }
    } catch (error) {
      console.error('Erro ao buscar status:', error);
    }
  };

  // Busca o vídeo e seu status de visualização
  useEffect(() => {
    if (!videoId) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        // Primeiro busca o status para garantir que temos o tempo salvo
        await fetchWatchStatus();
        
        // Depois busca os dados do vídeo
        const videoData = await authService.getVideo(parseInt(videoId));
        console.log('Vídeo carregado:', videoData);
        setVideo(videoData);
      } catch (error) {
        console.error('Erro ao carregar vídeo:', error);
        toast.error('Erro ao carregar vídeo');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [videoId]);

  const handleVideoProgress = (currentTime: number, duration: number) => {
    if (!videoId || hasCompleted || !isPlaying) return;

    if (duration > 0 && videoDuration.current !== duration) {
      videoDuration.current = duration;
    }

    // Atualiza o tempo atual em segundos
    currentWatchTime.current = Math.floor(currentTime);

    // Atualiza o status a cada 5 segundos de reprodução
    if (!updateInterval.current && isPlaying) {
      updateInterval.current = setInterval(() => {
        const now = Date.now();
        const timeSinceLastUpdate = now - lastUpdateTime.current;

        if (timeSinceLastUpdate >= 5000 && isPlaying) {
          // Calcula a porcentagem do vídeo assistido
          const progressPercent = (currentWatchTime.current / videoDuration.current) * 100;
          
          // Envia o tempo em segundos
          if (currentWatchTime.current > savedTime) {
            sendWatchTimeUpdate(currentWatchTime.current, false);
          }
        }
      }, 5000);
    }
  };

  const handlePlayPause = (playing: boolean) => {
    setIsPlaying(playing);
    
    if (!playing && currentWatchTime.current > 0 && video) {
      // Envia o tempo em segundos
      if (currentWatchTime.current > savedTime) {
        sendWatchTimeUpdate(currentWatchTime.current, false);
      }
    }
  };

  const handleVideoComplete = async (currentTime: number, duration: number) => {
    if (!videoId || !video || isUpdating) return;
    
    // Calcula a porcentagem do vídeo assistido
    const progressPercent = (currentTime / duration) * 100;
    
    // Só marca como completo se realmente assistiu 100% do vídeo
    const isReallyComplete = progressPercent >= 100 && currentTime >= duration;

    if (!isReallyComplete) return;

    try {
      setIsUpdating(true);
      const status = await authService.getVideoWatchStatus(parseInt(videoId));
      
      if (status.completed) {
        setHasCompleted(true);
        if (updateInterval.current) {
          clearInterval(updateInterval.current);
          updateInterval.current = undefined;
        }
        return;
      }
      
      // Envia o tempo em segundos e marca como completo
      if (isReallyComplete) {
        await sendWatchTimeUpdate(Math.floor(currentTime), true);
        
        if (updateInterval.current) {
          clearInterval(updateInterval.current);
          updateInterval.current = undefined;
        }

        setHasCompleted(true);
        toast.success('Vídeo completado!');
      }
    } catch (error) {
      // Silenciosamente ignora o erro
    } finally {
      setIsUpdating(false);
    }
  };

  const sendWatchTimeUpdate = async (watchTimeInSeconds: number, isCompleted: boolean) => {
    if (!videoId || !isPlaying || isUpdating) return;

    try {
      setIsUpdating(true);

      const response = await authService.updateWatchTime(parseInt(videoId), {
        watchTime: watchTimeInSeconds,
        completed: isCompleted
      });

      if (response.watchData?.completed) {
        setHasCompleted(true);
        if (updateInterval.current) {
          clearInterval(updateInterval.current);
          updateInterval.current = undefined;
        }
        if (isCompleted) {
          toast.success('Vídeo completado!');
        }
      }

      // Update saved time
      setSavedTime(watchTimeInSeconds);

      if (video) {
        setVideo(prev => {
          if (!prev) return null;
          const totalWatches = prev.total_watches || 0;
          const avgWatchTime = prev.avg_watch_time || 0;
          
          return {
            ...prev,
            total_watches: totalWatches + (isCompleted ? 1 : 0),
            avg_watch_time: isCompleted ? 
              ((avgWatchTime * totalWatches) + Math.floor(watchTimeInSeconds / 60)) / (totalWatches + 1) :
              Math.floor(watchTimeInSeconds / 60)
          };
        });
      }

      lastUpdateTime.current = Date.now();
    } catch (error) {
      console.error('Erro ao atualizar status do vídeo:', error);
      toast.error('Erro ao atualizar status do vídeo');
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Vídeo não encontrado</h1>
          <button
            onClick={() => navigate('/')}
            className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Voltar ao início
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-purple-400 hover:text-purple-300 mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Voltar
        </button>

        <div className="max-w-4xl mx-auto">
          <div className="aspect-video mb-8 glass-card rounded-xl overflow-hidden">
            {video && (
              <VideoPlayer
                key={video.id}
                videoUrl={video.url}
                title={video.title}
                thumbnail={video.thumbnail}
                initialTime={savedTime}
                onProgress={handleVideoProgress}
                onComplete={handleVideoComplete}
                onPlayPause={handlePlayPause}
              />
            )}
          </div>

          <div className="glass-card rounded-xl p-8">
            <h1 className="text-3xl font-bold gradient-text mb-6">
              {video.title}
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed mb-6">
              {video.description}
            </p>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div>
                <p>Publicado em: {new Date(video.created_at).toLocaleDateString('pt-BR')}</p>
              </div>
              <div className="flex gap-4">
                <div>
                  <p className="font-medium">Visualizações</p>
                  <p>{video.total_watches || 0}</p>
                </div>
                <div>
                  <p className="font-medium">Tempo médio</p>
                  <p>{Math.round(video.avg_watch_time || 0)} min</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoDetail;
