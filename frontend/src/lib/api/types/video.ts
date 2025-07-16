export interface Video {
  id: number;
  title: string;
  description: string;
  url: string;
  thumbnail: string;
  createdAt: string;
  updatedAt: string;
}

export interface VideoCreateData {
  title: string;
  description: string;
  url: string;
  thumbnail: string;
}

export interface VideoUpdateData {
  title?: string;
  description?: string;
  url?: string;
  thumbnail?: string;
}

export interface WatchTimeData {
  watchTime: number;
  completed: boolean;
}

export interface WatchTimeResponse {
  message: string;
  watchData: {
    id: number;
    userId: number;
    videoId: number;
    watchTime: number;
    completed: boolean;
    createdAt: string;
    updatedAt: string;
  };
} 