import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface Video {
  id: string;
  title: string;
  description: string;
  url: string;
  duration: number;
}

const VideoPlayer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [video, setVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/videos/${id}`);
        if (!response.ok) {
          throw new Error('Video não encontrado');
        }
        const data = await response.json();
        setVideo(data);
      } catch (error) {
        toast({
          title: "Erro",
          description: "Não foi possível carregar o vídeo",
          variant: "destructive"
        });
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchVideo();
  }, [id, navigate, toast]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!video) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>

        <div className="aspect-video w-full bg-black rounded-lg overflow-hidden mb-6">
          <video
            src={video.url}
            controls
            className="w-full h-full"
            poster={`${video.url}?thumb=true`}
          />
        </div>

        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-white">{video.title}</h1>
          <p className="text-muted-foreground">{video.description}</p>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer; 