import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Eye, Clock, Play, ArrowRight } from 'lucide-react';

interface Category {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  color: string;
  stats: {
    views: number;
    watchTime: number;
  };
}

interface CategoryCardsProps {
  categories: Category[];
}

const CategoryCards: React.FC<CategoryCardsProps> = ({ categories }) => {
  return (
    <section className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold gradient-text mb-4">
            Explore Nossos Conteúdos
          </h2>
          <p className="text-muted-foreground text-lg">
            Descubra diferentes áreas da nossa empresa através de vídeos exclusivos
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category, index) => (
            <Link 
              key={category.id} 
              to={`/video/${category.id}`}
              className="group glass-card rounded-xl overflow-hidden hover-glow cursor-pointer transform hover:scale-105 transition-all duration-300 animate-fade-in"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={category.thumbnail}
                  alt={category.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${category.color} opacity-60`} />
                
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="bg-white/20 backdrop-blur-sm rounded-full p-4 animate-pulse-glow">
                    <Play className="w-8 h-8 text-white ml-1" />
                  </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="flex gap-4 text-white">
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      <span>{category.stats.views}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{category.stats.watchTime}s</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-semibold text-white mb-2 group-hover:gradient-text transition-all duration-300">
                  {category.title}
                </h3>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  {category.description}
                </p>
                
                <div className="flex items-center text-purple-400 group-hover:text-purple-300 transition-colors">
                  <span className="font-medium">Assistir agora</span>
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryCards;
