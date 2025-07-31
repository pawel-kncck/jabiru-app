import api from './api';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

export interface ChatRequest {
  message: string;
  conversation_history?: ChatMessage[];
}

export interface ChatResponse {
  message: string;
  usage?: {
    input_tokens: number;
    output_tokens: number;
    total_tokens: number;
  };
  cost?: number;
}

export const chatService = {
  async sendMessage(
    projectId: number,
    request: ChatRequest
  ): Promise<ChatResponse> {
    const response = await api.post<ChatResponse>(
      `/projects/${projectId}/chat`,
      request
    );
    return response.data;
  },

  async checkHealth(projectId: number): Promise<{
    status: 'healthy' | 'error';
    message: string;
  }> {
    const response = await api.get(`/projects/${projectId}/chat/health`);
    return response.data;
  },
};