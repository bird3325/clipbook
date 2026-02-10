
export enum SummaryMode {
  REPORT = 'REPORT',
  EMAIL = 'EMAIL',
  NOTION = 'NOTION',
  CARD = 'CARD'
}

export interface Clipping {
  id: string;
  text: string;
  sourceUrl: string;
  timestamp: number;
}

export interface SavedItem {
  id: string;
  title: string;
  summary: string;
  clippings: Clipping[];
  mode: SummaryMode;
  target: 'NOTION' | 'PDF';
  timestamp: number;
  collection: string;
}

export interface Collection {
  id: string;
  name: string;
}
