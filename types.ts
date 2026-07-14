
import React from 'react';

export enum LegalLevel {
  INTERNATIONAL = 'International',
  NATIONAL = 'National',
  LOCAL = 'Local'
}

export type LanguageCode = 'en' | 'mn' | 'zh' | 'ja' | 'ko' | 'de' | 'es' | 'fr' | 'ru';

export interface Language {
  code: LanguageCode;
  name: string;
  flag: string;
  locale: string;
  countryCode: string;
}

export interface LegalResource {
  id: string;
  title: string;
  level: LegalLevel;
  jurisdiction: string;
  category: string;
  description: string;
  link: string;
  year: number;
  docType: string;
}

export interface LegalTemplate {
  id: string;
  title: string;
  category: string;
  description: string;
  content: string;
}

export interface DictionaryTerm {
  id: string;
  term: string;
  definition: string;
  category: string;
  relatedTerms?: string[];
}

export interface NewsArticle {
  id: string;
  title: string;
  category: string;
  summary: string;
  content: string;
  author: string;
  date: string;
  readTime: string;
  imageUrl?: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  sources?: Array<{ title: string; uri: string }>;
}

export interface JurisdictionContext {
  level: LegalLevel | 'Global' | 'Comparison' | 'Advisor' | 'Translate' | 'Dictionary' | 'News';
  specificJurisdiction?: string;
  comparisonJurisdiction?: string;
  language?: string;
  strictRelevance?: boolean; // New flag for anti-redundancy
  filters?: {
    minYear?: number;
    maxYear?: number;
    docType?: string;
    keywords?: string;
  };
}

export interface RegulatoryAlert {
  id: string;
  region: string;
  title: string;
  timestamp: string;
  severity: 'high' | 'medium' | 'low';
}

export interface Presence {
  userId: string;
  name: string;
  cursorPos: number;
  color: string;
  avatar: string;
}

export interface EditorAction {
  userId: string;
  type: 'insert' | 'delete' | 'move';
  text?: string;
  position: number;
  timestamp: number;
}

export interface DocumentVersion {
  id: string;
  timestamp: number;
  author: string;
  content: string;
  label?: string;
}

export interface CollaborativeDocument {
  id: string;
  title: string;
  content: string;
  lastModified: number;
  activeUsers: Presence[];
  versions?: DocumentVersion[];
}

export interface HistoricalComparison {
  id: string;
  timestamp: number;
  clause: string;
  baseJurisdiction: string;
  targetJurisdiction: string;
  result: string;
}
