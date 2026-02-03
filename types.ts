
export interface ImageState {
  originalUrl: string | null;
  processedUrl: string | null;
  base64: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface ProcessingHistory {
  prompt: string;
  imageUrl: string;
  timestamp: number;
}
