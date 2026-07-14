import React from 'react';
import { 
  Scale, Globe, Home, MapPin, Search, Send, 
  ExternalLink, ChevronDown, Info, PanelRight, 
  PanelRightClose, Share2, Check, Download,
  Filter, Calendar, FileText, Layout, Plus, 
  Save, Trash2, Edit3, Cloud, FileDown,
  PenTool, CreditCard, Sun, Moon, Github,
  SortAsc, SortDesc, Type, Zap, GitCompare,
  Languages, MessageCircle, FileStack, Book, Newspaper
} from 'lucide-react';
import { LegalResource, LegalLevel, Language, LanguageCode, RegulatoryAlert, LegalTemplate, DictionaryTerm, NewsArticle } from './types';

export const LANGUAGES: Language[] = [
  { code: 'en', name: 'English', flag: '🇺🇸', locale: 'en-US', countryCode: 'us' },
  { code: 'mn', name: 'Монгол', flag: '🇲🇳', locale: 'mn-MN', countryCode: 'mn' },
  { code: 'zh', name: '中文', flag: '🇨🇳', locale: 'zh-CN', countryCode: 'cn' },
  { code: 'ja', name: '日本語', flag: '🇯🇵', locale: 'ja-JP', countryCode: 'jp' },
  { code: 'ko', name: '한국어', flag: '🇰🇷', locale: 'ko-KR', countryCode: 'kr' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪', locale: 'de-DE', countryCode: 'de' },
  { code: 'es', name: 'Español', flag: '🇪🇸', locale: 'es-ES', countryCode: 'es' },
  { code: 'fr', name: 'Français', flag: '🇫🇷', locale: 'fr-FR', countryCode: 'fr' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺', locale: 'ru-RU', countryCode: 'ru' },
];

export const REGULATORY_ALERTS: RegulatoryAlert[] = [
  { id: '1', region: 'European Union', title: 'AI Act Implementation Phase 1', timestamp: '2h ago', severity: 'high' },
  { id: '2', region: 'USA', title: 'New SEC Climate Disclosure Rules', timestamp: '5h ago', severity: 'medium' },
  { id: '3', region: 'Brazil', title: 'LGPD Privacy Law Amendment', timestamp: '1d ago', severity: 'medium' },
  { id: '4', region: 'Global', title: 'UN Plastic Treaty Negotiations', timestamp: '2d ago', severity: 'low' },
];

export const LEGAL_DICTIONARY_TERMS: DictionaryTerm[] = [
  { id: '1', term: 'Ab Initio', definition: 'From the beginning. Often used to describe a contract that is void from the moment it was supposedly created.', category: 'Latin Terminology', relatedTerms: ['Void', 'Voidable'] },
  { id: '2', term: 'Amicus Curiae', definition: '"Friend of the court." A person or group who is not a party to a lawsuit but who has a strong interest in the matter and will petition the court for permission to submit a brief.', category: 'Litigation', relatedTerms: ['Brief', 'Appellant'] },
  { id: '3', term: 'Certiorari', definition: 'A type of writ, meant for rare use, by which an appellate court decides to review a case at its discretion.', category: 'Appellate Procedure' },
  { id: '4', term: 'Force Majeure', definition: 'Greater or superior force. An event or effect that cannot be reasonably anticipated or controlled (e.g., natural disasters).', category: 'Contract Law', relatedTerms: ['Frustration', 'Act of God'] },
  { id: '5', term: 'Mens Rea', definition: 'The "guilty mind" or intention/knowledge of wrongdoing that constitutes part of a crime, as opposed to the action or conduct itself.', category: 'Criminal Law', relatedTerms: ['Actus Reus'] },
  { id: '6', term: 'Void', definition: 'Having no legal force or binding effect; null; ineffectual.', category: 'Contract Law', relatedTerms: ['Ab Initio', 'Voidable'] },
  { id: '7', term: 'Voidable', definition: 'Valid and enforceable unless and until a party with the right to do so elects to avoid it.', category: 'Contract Law', relatedTerms: ['Void', 'Ab Initio'] },
  { id: '8', term: 'Brief', definition: 'A written legal argument, structure, or statement of facts submitted to a court.', category: 'Litigation', relatedTerms: ['Amicus Curiae'] },
  { id: '9', term: 'Appellant', definition: 'The party who appeals a lower court\'s decision to a higher court.', category: 'Appellate Procedure', relatedTerms: ['Certiorari'] },
  { id: '10', term: 'Actus Reus', definition: 'The "guilty act" or physical element of a crime, as opposed to the mental intent.', category: 'Criminal Law', relatedTerms: ['Mens Rea'] },
  { id: '11', term: 'Frustration', definition: 'A doctrine in contract law that allows for the termination of a contract if an unforeseen event makes it impossible to fulfill.', category: 'Contract Law', relatedTerms: ['Force Majeure', 'Act of God'] },
  { id: '12', term: 'Act of God', definition: 'A legal term for events outside of human control, such as sudden floods or other natural disasters.', category: 'Contract Law', relatedTerms: ['Force Majeure', 'Frustration'] },
];

export const LEGAL_NEWS_ARTICLES: NewsArticle[] = [
  {
    id: 'news-1',
    title: 'The Impact of the EU AI Act on Global Tech Firms',
    category: 'Technology Law',
    summary: 'As the EU AI Act enters its first phase of enforcement, companies worldwide are scrambling to ensure compliance with the new tiered risk levels.',
    content: 'The European Union AI Act represents the first comprehensive regulatory framework for artificial intelligence...',
    author: 'Elena Rodriguez',
    date: 'Oct 24, 2024',
    readTime: '6 min read'
  },
  {
    id: 'news-2',
    title: 'Supreme Court Revisits Chevron Deference',
    category: 'Constitutional',
    summary: 'A recent ruling suggests a significant shift in how administrative agencies interpret ambiguous statutes, potentially altering decades of precedent.',
    content: 'In a landmark decision, the court has narrowed the scope of agency discretion...',
    author: 'Sarah Chen',
    date: 'Oct 22, 2024',
    readTime: '8 min read'
  },
  {
    id: 'news-3',
    title: 'Cross-Border M&A Trends in the APAC Region',
    category: 'Corporate',
    summary: 'Mergers and acquisitions in Asia-Pacific are seeing a surge in tech-heavy deals despite regulatory headwinds in several jurisdictions.',
    content: 'Economic shifts are driving new strategic alliances across the Singapore-Tokyo corridor...',
    author: 'Marcus Thorne',
    date: 'Oct 20, 2024',
    readTime: '5 min read'
  }
];

export const LEGAL_TEMPLATES: LegalTemplate[] = [
  {
    id: 'nda-standard',
    title: 'Standard Non-Disclosure Agreement',
    category: 'Corporate',
    description: 'Mutual non-disclosure agreement for protection of confidential information during business discussions.',
    content: 'NON-DISCLOSURE AGREEMENT\n\nThis Non-Disclosure Agreement (the "Agreement") is entered into as of [Date] between [Party A] and [Party B]...'
  },
  {
    id: 'employment-agreement',
    title: 'Executive Employment Contract',
    category: 'Employment',
    description: 'Comprehensive employment agreement for senior leadership, including non-compete and IP clauses.',
    content: 'EMPLOYMENT AGREEMENT\n\nTHIS AGREEMENT is made this [Date], by and between [Company Name] and [Employee Name]...'
  },
  {
    id: 'privacy-policy',
    title: 'Website Privacy Policy (GDPR compliant)',
    category: 'Digital',
    description: 'A website privacy policy designed to meet standard GDPR and CCPA disclosure requirements.',
    content: 'PRIVACY POLICY\n\nLast updated: [Date]\n\nAt [Company Name], accessible from [URL], one of our main priorities is the privacy of our visitors...'
  },
  {
    id: 'saas-agreement',
    title: 'SaaS Master Subscription Agreement',
    category: 'Technology',
    description: 'Enterprise-grade Software-as-a-Service terms including SLA and support clauses.',
    content: 'MASTER SUBSCRIPTION AGREEMENT\n\nThis Master Subscription Agreement (this "Agreement") is between [Vendor] and [Customer]...'
  }
];

const EN_UI_STRINGS = {
  international: 'International',
  national: 'National',
  local: 'Local',
  comparison: 'Compare',
  pulse: 'Pulse',
  team: 'Team',
  translate: 'Translate',
  advisor: 'Advisor',
  templates: 'Templates',
  dictionary: 'Dictionary',
  news: 'News',
  network: 'Network',
  all_refs: 'Search All',
  search_library: 'Search global legal library...',
  global: 'Global Framework',
  all_national: 'All Nations',
  all_local: 'All Municipalities'
};

export const TRANSLATIONS: Record<LanguageCode, Record<string, string>> = {
  en: EN_UI_STRINGS,
  mn: { ...EN_UI_STRINGS, international: 'Олон улсын', national: 'Үндэсний', local: 'Орон нутгийн', team: 'Баг' },
  zh: { ...EN_UI_STRINGS },
  ja: { ...EN_UI_STRINGS },
  ko: { ...EN_UI_STRINGS },
  fr: { ...EN_UI_STRINGS },
  de: { ...EN_UI_STRINGS },
  es: { ...EN_UI_STRINGS },
  ru: { ...EN_UI_STRINGS }
};

export const FEATURED_RESOURCES: LegalResource[] = [
  { id: 'un-charter', title: 'UN Charter', level: LegalLevel.INTERNATIONAL, jurisdiction: 'Global', category: 'Constitutional', description: 'The foundational treaty of the United Nations.', link: 'https://www.un.org/en/about-us/un-charter', year: 1945, docType: 'Treaty' },
  { id: 'us-constitution', title: 'U.S. Constitution', level: LegalLevel.NATIONAL, jurisdiction: 'United States', category: 'Constitutional', description: 'The supreme law of the United States of America.', link: 'https://www.archives.gov/founding-docs/constitution-transcript', year: 1787, docType: 'Constitution' },
  { id: 'uk-hrc', title: 'Human Rights Act 1998', level: LegalLevel.NATIONAL, jurisdiction: 'United Kingdom', category: 'Human Rights', description: 'Freedom rights guaranteed under the ECHR.', link: 'https://www.legislation.gov.uk/ukpga/1998/42/contents', year: 1998, docType: 'Statute' },
  { id: 'gdpr', title: 'GDPR Regulation', level: LegalLevel.INTERNATIONAL, jurisdiction: 'European Union', category: 'Privacy', description: 'EU law on data protection and privacy.', link: 'https://gdpr-info.eu/', year: 2016, docType: 'Regulation' },
  { id: 'ny-opinion-2023', title: 'Biometric Privacy Opinion 2023-F1', level: LegalLevel.LOCAL, jurisdiction: 'New York', category: 'Administrative', description: 'Formal legal opinion regarding the use of biometric data in public spaces and municipal law compliance.', link: 'https://ag.ny.gov/legal-opinions', year: 2023, docType: 'Legal Opinion' },
];

export const COUNTRY_LIST = [
  { name: 'United States', code: 'us' },
  { name: 'United Kingdom', code: 'gb' },
  { name: 'Germany', code: 'de' },
  { name: 'France', code: 'fr' },
  { name: 'China', code: 'cn' },
  { name: 'Japan', code: 'jp' },
  { name: 'Brazil', code: 'br' },
  { name: 'India', code: 'in' },
];

export const REGIONS = ['New York City', 'California', 'London', 'Paris', 'Berlin', 'Tokyo', 'Sao Paulo'];

export const ICONS = {
  Scale: (props: any) => <Scale strokeWidth={2} {...props} />,
  Globe: (props: any) => <Globe strokeWidth={2} {...props} />,
  GitCompare: (props: any) => <GitCompare strokeWidth={2} {...props} />,
  Zap: (props: any) => <Zap strokeWidth={2} {...props} />,
  Languages: (props: any) => <Languages strokeWidth={2} {...props} />,
  MessageCircle: (props: any) => <MessageCircle strokeWidth={2} {...props} />,
  FileStack: (props: any) => <FileStack strokeWidth={2} {...props} />,
  Book: (props: any) => <Book strokeWidth={2} {...props} />,
  Newspaper: (props: any) => <Newspaper strokeWidth={2} {...props} />,
};