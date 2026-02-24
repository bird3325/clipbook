
export enum SummaryMode {
  REPORT = 'REPORT',
  EMAIL = 'EMAIL',
  NOTION = 'NOTION',
  CARD = 'CARD'
}

export type AIModel =
  | 'gemini-3-flash-preview'
  | 'gemini-3-pro-preview'
  | 'gpt-4o'
  | 'gpt-4-turbo'
  | 'claude-3-5-sonnet';

export interface Clipping {
  id: string;
  type: 'text' | 'image';
  text: string;
  imageData?: string; // base64 data URL
  sourceUrl: string;
  timestamp: number;
}

export interface SavedItem {
  id: string;
  title: string;
  summary: string;
  clippings: Clipping[];
  mode: SummaryMode;
  target: 'NOTION' | 'PDF' | 'HISTORY';
  timestamp: number;
  collection: string;
}

export interface Collection {
  id: string;
  name: string;
}
