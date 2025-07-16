import React, { useState } from 'react';
import { Trophy, Medal, Award } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User } from '@/lib/types';
import { useEmoji } from '@/contexts/EmojiContext';

interface UserRankingProps {
  users: User[];
}

const UserRanking: React.FC<UserRankingProps> = ({ users }) => {
  const { EmojiAnimation } = useEmoji();
  const [hoveredEmoji, setHoveredEmoji] = useState<string | null>(null);

  const sortedUsers = users.sort((a, b) => (b.watch_time || 0) - (a.watch_time || 0));
  
  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="w-6 h-6 text-yellow-400" />;
      case 1:
        return <Medal className="w-6 h-6 text-gray-300" />;
      case 2:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="text-purple-400 font-bold text-lg">#{index + 1}</span>;
    }
  };

  const formatWatchTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${remainingSeconds}s`;
  };

  const getProgressColor = (index: number) => {
    switch (index) {
      case 0:
        return 'from-yellow-400 to-yellow-600';
      case 1:
        return 'from-gray-300 to-gray-500';
      case 2:
        return 'from-amber-400 to-amber-600';
      default:
        return 'from-purple-400 to-blue-500';
    }
  };

  const maxWatchTime = sortedUsers[0]?.watch_time || 1;

  return (
    <Card className="glass-card overflow-hidden">
      <CardHeader className="border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🏆</span>
          <CardTitle className="text-2xl font-bold gradient-text">Ranking de Engajamento</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {sortedUsers.slice(0, 10).map((user, index) => {
            const progressPercentage = ((user.watch_time || 0) / maxWatchTime) * 100;
            const isHovered = hoveredEmoji === user.id;
            
            return (
              <div
                key={user.id}
                className="group relative flex flex-col sm:flex-row items-center gap-4 p-4 rounded-xl hover:bg-white/5 transition-all duration-300 animate-fade-in"
                style={{ 
                  animationDelay: `${index * 0.1}s`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 0 20px rgba(147, 51, 234, 0.2)';
                  setHoveredEmoji(user.id);
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                  setHoveredEmoji(null);
                }}
              >
                <div className="flex items-center justify-center w-12 h-12">
                  {getRankIcon(index)}
                </div>
                
                <div className="relative flex items-center">
                  <Avatar className="h-14 w-14 ring-2 ring-purple-500/30 group-hover:ring-purple-500/50 transition-all duration-300">
                    <AvatarImage src={user.profile_image || user.profileImage} alt={user.name} />
                    <AvatarFallback className="bg-gradient-to-br from-purple-400 to-blue-500 text-white">
                      {user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  {/* Emoji animado */}
                  <div 
                    className={`absolute -top-2 -right-2 w-5 h-5 transition-all duration-500 ease-in-out ${
                      isHovered ? 'scale-110 -translate-y-1 rotate-12' : 'scale-100 translate-y-0 rotate-0'
                    }`}
                  >
                    <EmojiAnimation emojiIndex={user.emoji || ""} />
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-lg truncate group-hover:text-purple-400 transition-colors">
                    {user.name}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <span className="text-lg">⏱️</span>
                      {formatWatchTime(user.watch_time || 0)} de conteúdo
                    </span>
                    <span className="inline-flex items-center px-2 py-1 rounded-full bg-purple-500/20 text-purple-400 text-xs font-medium">
                      {user.completed_videos || 0} {user.completed_videos === 1 ? 'vídeo completo' : 'vídeos completos'}
                    </span>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-2xl font-bold gradient-text">
                    {formatWatchTime(user.watch_time || 0)}
                  </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className={`h-full bg-gradient-to-r ${getProgressColor(index)} transition-all duration-1000 ease-out`}
                    style={{ 
                      width: `${progressPercentage}%`,
                      animationDelay: `${index * 0.2}s`
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default UserRanking;