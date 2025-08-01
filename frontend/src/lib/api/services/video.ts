import { api } from '../config';
import type { Video, VideoCreateData, VideoUpdateData, WatchTimeData, WatchTimeResponse } from '../types/video';

export const videoService = {
  listVideos: async (): Promise<Video[]> => {
    const response = await api.get<Video[]>('/videos');
    return response.data;
  },
  getVideo: async (id: number): Promise<Video> => {
    const response = await api.get<Video>(`/videos/${id}`);
    return response.data;
  },
  createVideo: async (data: VideoCreateData): Promise<Video> => {
    const response = await api.post<Video>('/videos', data);
    return response.data;
  },
  updateVideo: async (id: number, data: VideoUpdateData): Promise<Video> => {
    const response = await api.put<Video>(`/videos/${id}`, data);
    return response.data;
  },
  deleteVideo: async (id: number): Promise<void> => {
    await api.delete(`/videos/${id}`);
  },
  getVideoWatchStatus: async (videoId: number) => {
    const response = await api.get(`/videos/${videoId}/watch-status`);
    return response.data;
  },
  updateWatchTime: async (videoId: number, data: WatchTimeData): Promise<WatchTimeResponse> => {
    const response = await api.post<WatchTimeResponse>(`/videos/${videoId}/watch`, {
      watchTime: data.watchTime,
      completed: data.completed
    });
    return response.data;
  },
}; 