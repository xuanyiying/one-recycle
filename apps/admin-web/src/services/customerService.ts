import { apiClient } from './apiClient';

const API_BASE = '/customer';

export const customerService = {
  getSession: async (sessionId: string) => {
    return apiClient.get(`${API_BASE}/sessions/${sessionId}`);
  },

  getSessionMessages: async (sessionId: string) => {
    return apiClient.get(`${API_BASE}/sessions/${sessionId}/messages`);
  },

  getQuickReplies: async () => {
    return apiClient.get(`${API_BASE}/quick-replies`);
  },

  closeSession: async (sessionId: string) => {
    return apiClient.put(`${API_BASE}/sessions/${sessionId}/close`);
  },

  uploadFile: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileType', 'IMAGE');
    formData.append('category', 'CUSTOMER_SERVICE');

    return apiClient.upload('/storage/upload', formData);
  },
};
