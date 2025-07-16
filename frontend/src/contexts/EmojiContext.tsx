import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Lottie from 'lottie-react';

// URLs dos emojis animados
export const EMOJI_ANIMATIONS = [
  "https://fonts.gstatic.com/s/e/notoemoji/latest/1f600/lottie.json",
  "https://fonts.gstatic.com/s/e/notoemoji/latest/1f601/lottie.json",
  "https://fonts.gstatic.com/s/e/notoemoji/latest/1f602/lottie.json",
  "https://fonts.gstatic.com/s/e/notoemoji/latest/1f603/lottie.json",
  "https://fonts.gstatic.com/s/e/notoemoji/latest/1f62d/lottie.json",
  "https://fonts.gstatic.com/s/e/notoemoji/latest/1fae0/lottie.json",
  "https://fonts.gstatic.com/s/e/notoemoji/latest/1f636_200d_1f32b_fe0f/lottie.json",
  "https://fonts.gstatic.com/s/e/notoemoji/latest/1f621/lottie.json",
  "https://fonts.gstatic.com/s/e/notoemoji/latest/1f976/lottie.json",
  "https://fonts.gstatic.com/s/e/notoemoji/latest/1f975/lottie.json",
  "https://fonts.gstatic.com/s/e/notoemoji/latest/1f911/lottie.json",
  "https://fonts.gstatic.com/s/e/notoemoji/latest/1f389/lottie.json",
  "https://fonts.gstatic.com/s/e/notoemoji/latest/1f970/lottie.json",
  "https://fonts.gstatic.com/s/e/notoemoji/latest/1f602/lottie.json",
  "https://fonts.gstatic.com/s/e/notoemoji/latest/1f923/lottie.json"
];

interface LottieAnimationData {
  v: string;
  fr: number;
  ip: number;
  op: number;
  w: number;
  h: number;
  nm: string;
  ddd: number;
  assets: {
    id: string;
    nm: string;
    u?: string;
    p?: string;
    e?: number;
    w?: number;
    h?: number;
    layers?: unknown[];
  }[];
  layers: {
    ddd: number;
    ind: number;
    ty: number;
    nm: string;
    sr: number;
    ks: {
      o: { a: number; k: number };
      r: { a: number; k: number };
      p: { a: number; k: number[] };
      a: { a: number; k: number[] };
      s: { a: number; k: number[] };
    };
    ao: number;
    shapes?: unknown[];
    ip: number;
    op: number;
    st: number;
    bm: number;
  }[];
}

interface EmojiContextType {
  animations: LottieAnimationData[];
  loading: boolean;
  getAnimation: (emojiIndex: string | number) => LottieAnimationData | null;
  EmojiAnimation: React.FC<{ emojiIndex: string | number; className?: string }>;
}

const EmojiContext = createContext<EmojiContextType | undefined>(undefined);

export const EmojiProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [animations, setAnimations] = useState<LottieAnimationData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnimations = async () => {
      try {
        const animationPromises = EMOJI_ANIMATIONS.map(url => 
          fetch(url)
            .then(response => response.json())
            .catch(error => {
              console.error('Erro ao carregar animação:', error);
              return null;
            })
        );

        const loadedAnimations = await Promise.all(animationPromises);
        setAnimations(loadedAnimations.filter(Boolean));
        setLoading(false);
      } catch (error) {
        console.error('Erro ao carregar animações:', error);
        setLoading(false);
      }
    };

    loadAnimations();
  }, []);

  const getAnimation = (emojiIndex: string | number) => {
    if (!animations.length) return null;
    const index = typeof emojiIndex === 'string' ? parseInt(emojiIndex) : emojiIndex;
    return animations[index % animations.length];
  };

  const EmojiAnimation: React.FC<{ emojiIndex: string | number; className?: string }> = ({ emojiIndex, className }) => {
    const animation = getAnimation(emojiIndex);
    if (!animation) return null;

    return (
      <div className={className}>
        <Lottie
          animationData={animation}
          loop={true}
          autoplay={true}
          style={{ width: '100%', height: '100%' }}
        />
      </div>
    );
  };

  return (
    <EmojiContext.Provider value={{ animations, loading, getAnimation, EmojiAnimation }}>
      {children}
    </EmojiContext.Provider>
  );
};

export const useEmoji = () => {
  const context = useContext(EmojiContext);
  if (context === undefined) {
    throw new Error('useEmoji must be used within an EmojiProvider');
  }
  return context;
}; 