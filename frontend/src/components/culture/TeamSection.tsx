import React, { useState } from 'react';
import { Linkedin, Mail, User } from 'lucide-react';
import { useEmoji } from '@/contexts/EmojiContext';

interface TeamMember {
  id: string;
  name: string;
  position: string;
  description: string;
  photo: string;
  email: string;
  emoji?: string;
}

interface TeamSectionProps {
  team: TeamMember[];
}

const TeamSection: React.FC<TeamSectionProps> = ({ team }) => {
  const { EmojiAnimation } = useEmoji();
  const [hoveredEmoji, setHoveredEmoji] = useState<string | null>(null);

  return (
    <section className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold gradient-text mb-4">
            Nossa Equipe
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Conheça os profissionais talentosos que fazem a diferença na nossa empresa
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {team.map((member, index) => {
            const isHovered = hoveredEmoji === member.id;
            
            return (
              <div
                key={member.id}
                className="glass-card rounded-xl p-6 hover-glow text-center group animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
                onMouseEnter={() => setHoveredEmoji(member.id)}
                onMouseLeave={() => setHoveredEmoji(null)}
              >
                <div className="relative mb-6">
                  {/* Emoji animado com Lottie */}
                  <div 
                    className={`absolute -top-8 left-1/2 transform -translate-x-1/2 z-10 w-8 h-8 transition-all duration-500 ease-in-out ${
                      isHovered ? 'scale-110 -translate-y-2 rotate-12' : 'scale-100 translate-y-0 rotate-0'
                    }`}
                  >
                    <EmojiAnimation emojiIndex={member.emoji || ""} />
                  </div>
                  
                  <div className="w-24 h-24 mx-auto rounded-full overflow-hidden ring-4 ring-purple-500/30 group-hover:ring-purple-400/50 transition-all duration-300">
                    <img
                      src={member.photo}
                      alt={member.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-full px-3 py-1">
                      <span className="text-white text-xs font-medium">{member.position}</span>
                    </div>
                  </div>
                </div>

                <h3 className="text-xl font-semibold text-white mb-2 group-hover:gradient-text transition-all duration-300">
                  {member.name}
                </h3>
                
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  {member.description}
                </p>

                <div className="flex justify-center gap-3">
                  {member.email && (
                    <a
                      href={`mailto:${member.email}`}
                      className="w-10 h-10 bg-white/10 hover:bg-purple-500/20 rounded-full flex items-center justify-center transition-colors group"
                    >
                      <Mail className="w-5 h-5 text-purple-400 group-hover:text-purple-300" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

// Adicione isso no seu arquivo de estilos globais (ex: globals.css)
const styles = `
@keyframes float {
  0% {
    transform: translate(-50%, 0px);
  }
  50% {
    transform: translate(-50%, -10px);
  }
  100% {
    transform: translate(-50%, 0px);
  }
}

.animate-float {
  animation: float 3s ease-in-out infinite;
}
`;

export default TeamSection;
