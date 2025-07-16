import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit2, Trash2, Play, Eye, Clock, Link as LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Video } from '@/lib/types';

interface VideoCardProps {
  video: Video;
  showActions?: boolean;
  onEdit?: (video: Video) => void;
  onDelete?: (id: number) => void;
}

const VideoCard: React.FC<VideoCardProps> = ({ video, showActions, onEdit, onDelete }) => {
  const navigate = useNavigate();

  const handleClick = (e: React.MouseEvent) => {
    // Se o clique foi em um botão de ação, não navega
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    navigate(`/video/${video.id}`);
  };

  return (
    <div 
      className="group relative bg-card rounded-xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl cursor-pointer border border-border/50"
      onClick={handleClick}
    >
      {/* Thumbnail Container */}
      <div className="relative aspect-video overflow-hidden bg-black/5">
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
            <div className="flex items-center gap-4 text-white/90 text-sm">
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                <span>{video.total_watches}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{Math.round(video.avg_watch_time || 0)}s</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-purple-400 transition-colors">
          {video.title}
        </h3>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {video.description}
        </p>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div>
            <p>Publicado em: {new Date(video.created_at).toLocaleDateString('pt-BR')}</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {showActions && (
        <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Button
            variant="secondary"
            size="icon"
            className="h-8 w-8 bg-purple-500/90 hover:bg-purple-500 text-white shadow-lg hover:scale-105 transition-transform"
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.(video);
            }}
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button
            variant="destructive"
            size="icon"
            className="h-8 w-8 bg-red-500/90 hover:bg-red-500 text-white shadow-lg hover:scale-105 transition-transform"
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.(video.id);
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default VideoCard; 