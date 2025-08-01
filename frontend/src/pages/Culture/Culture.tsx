import React, { useEffect, useState } from "react";
import { authService, videoService } from "@/lib/api";
import { User, Video } from "@/lib/types";
import VideoPlayer from "@/components/culture/VideoPlayer";
import UserRanking from "@/components/culture/UserRanking";
import CategoryCards from "@/components/culture/CategoryCards";
import TeamSection from "@/components/culture/TeamSection";
import BackgroundAnimation from "@/components/culture/BackgroundAnimation";
import BirthdayCard from "@/components/culture/BirthdayCard";

const Culture: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<string>("all");
  
  useEffect(() => {
    Promise.all([authService.listUsers(), videoService.listVideos()])
      .then(([usersData, videosData]) => {
        const mappedUsers = usersData.map((user) => ({
          ...user,
          profile_image: user.profile_image,
          birth_date: user.birth_date,
          created_at: user.created_at || new Date().toISOString(),
          watch_time: user.watch_time || 0,
          completed_videos: user.completed_videos || 0,
        }));
        setUsers(mappedUsers);
        setVideos(videosData);
      })
      .catch((error) => {
        console.error("Erro ao carregar dados:", error);
        setUsers([]);
        setVideos([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Função para mapear setor para descrição
  const getRoleDescription = (sector: string) => {
    const roles: { [key: string]: string } = {
      TI: "Desenvolvimento e Infraestrutura de Sistemas",
      "Recursos Humanos": "Gestão de Pessoas e Cultura Organizacional",
      Marketing: "Estratégias de Marketing e Comunicação",
      Vendas: "Gestão Comercial e Relacionamento com Clientes",
      Financeiro: "Gestão Financeira e Contábil",
      Administrativo: "Gestão de Processos e Operações Internas",
      Comercial: "Gestão de Vendas e Relacionamento com Clientes",
      Front: "Atendimento e Recepção de Clientes",
      Soro: "Atendimento e Aplicação de Soroterapia",
    };
    return roles[sector] || "Colaborador da Empresa";
  };

  // Equipe: todos os usuários com setor
  const teamUsers = users
    .filter((user) => user.sector)
    .map((user) => ({
      id: String(user.id),
      name: user.name,
      position: user.sector || "Colaborador",
      description: getRoleDescription(user.sector || ""),
      photo: user.profile_image || "",
      email: user.email,
      emoji: user.emoji,
    }));

  const categories = videos.map((video) => ({
    id: String(video.id),
    title: video.title,
    description: video.description,
    thumbnail: video.thumbnail,
    color: "from-purple-600/70 to-blue-600/70",
    stats: {
      views: video.total_watches || 0,
      watchTime: Math.round(video.avg_watch_time || 0),
    },
  }));

  return (
    <div className="min-h-screen bg-background relative">
      <BackgroundAnimation />
      {/* <Header /> - Removido pois não existe o componente */}

      <main className="pt-16 min-h-screen">
        {/* Header */}
        <header className="relative py-12 px-4 z-10">
          <div className="max-w-6xl mx-auto text-center space-y-6">
            <div className="flex justify-center items-center mb-8 animate-fade-in">
              <img
                src="/lovable-uploads/infinity-way-logo.png"
                alt="Infinity Way - Saúde Avançada"
                className="h-24 md:h-32 object-contain"
              />
            </div>
            <div className="space-y-4">
              <p className="text-2xl md:text-3xl font-light tracking-wide color-shift-text glow-effect">
                Setor de Cultura Organizacional e Bem-estar Infinity Way
              </p>
              <p className="text-lg md:text-xl text-muted-foreground animate-slide-up max-w-2xl mx-auto font-light tracking-wide">
                Transformando o futuro através da inovação
              </p>
            </div>
          </div>
        </header>

        {/* Resto do conteúdo */}
        <div className="px-4 pb-12">
          {/* Featured Video Section */}
          <section className="mb-16 relative z-10">
            <div className="max-w-4xl mx-auto">
              <div className="aspect-video glass-card rounded-xl overflow-hidden animate-fade-in">
                {videos.length > 0 && (
                  <VideoPlayer
                    videoUrl={videos[0].url}
                    title={videos[0].title}
                    thumbnail={videos[0].thumbnail}
                    onProgress={(currentTime, duration) => {
                      console.log("Progresso:", { currentTime, duration });
                    }}
                    onComplete={(currentTime, duration) => {
                      console.log("Vídeo completo:", { currentTime, duration });
                    }}
                    onPlayPause={(playing) => {
                      console.log("Estado de reprodução:", playing);
                    }}
                  />
                )}
              </div>
            </div>
          </section>

          {/* User Ranking and Birthdays Section */}
          <div className="relative z-10 mb-16">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12 animate-fade-in">
                <h2 className="text-4xl font-bold gradient-text mb-4">
                  Venha conhecer um pouco mais
                </h2>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  Descubra quem são os membros mais engajados da nossa
                  comunidade e celebre os aniversariantes do mês
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Ranking */}
                <div>
                  <UserRanking users={users} />
                </div>

                {/* Aniversariantes */}
                <BirthdayCard
                  users={users}
                  selectedMonth={selectedMonth}
                  setSelectedMonth={setSelectedMonth}
                />
              </div>
            </div>
          </div>

          {/* Category Cards */}
          <div className="relative z-10">
            <CategoryCards categories={categories} />
          </div>

          {/* Team Section */}
          <div className="relative z-10">
            <TeamSection team={teamUsers} />
          </div>

          {/* Footer */}
          <footer className="py-12 border-t border-white/10 relative z-10">
            <div className="max-w-6xl mx-auto text-center">
              <div className="mb-8">
                <div className="flex justify-center items-center mb-4">
                  <img
                    src="/lovable-uploads/infinity-way-logo.png"
                    alt="Infinity Way"
                    className="h-12 object-contain"
                  />
                </div>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Somos uma empresa comprometida com a excelência, inovação e
                  crescimento sustentável. Junte-se a nós nesta jornada de
                  transformação digital.
                </p>
              </div>

              <div className="text-sm text-muted-foreground">
                © 2024 Infinity Way. Todos os direitos reservados.
              </div>
            </div>
          </footer>
        </div>
      </main>

      {/* Estilos */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500&display=swap');

        @keyframes colorShift {
          0% {
            background-position: 0% 50%;
            filter: drop-shadow(0 0 20px rgba(147, 51, 234, 0.4))
                   drop-shadow(0 0 30px rgba(59, 130, 246, 0.4));
          }
          50% {
            background-position: 100% 50%;
            filter: drop-shadow(0 0 25px rgba(139, 92, 246, 0.5))
                   drop-shadow(0 0 35px rgba(99, 102, 241, 0.5));
          }
          100% {
            background-position: 0% 50%;
            filter: drop-shadow(0 0 20px rgba(147, 51, 234, 0.4))
                   drop-shadow(0 0 30px rgba(59, 130, 246, 0.4));
          }
        }

        .gradient-text {
          font-family: 'Outfit', sans-serif;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          background: linear-gradient(
            270deg,
            #9333ea,
            #3b82f6,
            #8b5cf6,
            #6366f1,
            #9333ea
          );
          background-size: 300% 300%;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: colorShift 8s ease infinite;
        }

        .glow-effect {
          text-shadow: 
            0 0 10px rgba(147, 51, 234, 0.5),
            0 0 20px rgba(147, 51, 234, 0.3),
            0 0 30px rgba(59, 130, 246, 0.3);
        }

        .color-shift-text:hover {
          filter: drop-shadow(0 0 30px rgba(147, 51, 234, 0.6))
                 drop-shadow(0 0 40px rgba(59, 130, 246, 0.6));
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
};

export default Culture;
