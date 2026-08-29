export type ActiveTab = 'dashboard' | 'safety' | 'awareness' | 'communication' | 'learn' | 'settings';

export type AlertSeverity = 'critical' | 'high' | 'medium' | 'info';

export type SoundPriority = 'high' | 'medium' | 'low';

// Validated Sound Categories from Phase 4A Feasibility Report
export type SoundCategory = 
  | 'siren' 
  | 'horn' 
  | 'doorbell' 
  | 'alarm' 
  | 'knock' 
  | 'general';

export type SoundDirection = 'left' | 'right' | 'front' | 'behind' | 'unknown';

export type SOSState = 
  | 'normal' 
  | 'monitoring' 
  | 'possible_emergency' 
  | 'countdown' 
  | 'sending' 
  | 'sent' 
  | 'cancelled' 
  | 'failed' 
  | 'no_contacts' 
  | 'permission_required';

export interface LocationData {
  latitude: number | null;
  longitude: number | null;
  altitude: number | null;
  accuracy: number | null;
  mapsUrl: string;
  isAvailable: boolean;
}

export interface SOSHistoryEvent {
  id: string;
  timestamp: number;
  type: 'manual' | 'automatic';
  status: 'sent' | 'cancelled' | 'failed';
  contactsNotifiedCount: number;
  locationString: string;
  notes?: string;
}

// Application Sound Event Abstraction
export interface SoundEvent {
  id: string;
  category: SoundCategory;
  displayName: string;
  description: string;
  confidence: number;
  timestamp: number;
  priority: SoundPriority;
  iconName: string;
  hapticPattern: number[];
  direction?: SoundDirection;
}

export interface EnvironmentalAlert {
  id: string;
  category: SoundCategory;
  title: string;
  description: string;
  severity: AlertSeverity;
  timestamp: number;
  direction?: SoundDirection;
  iconName?: string;
  acknowledged?: boolean;
}

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
  isPrimary: boolean;
}

export type SignResourceType = 'sign_video' | 'edu_video' | 'article' | 'pdf' | 'presentation';
export type SignLanguageSystem = 'ASL' | 'ISL' | 'Universal';

export interface SignResource {
  id: string;
  title: string;
  description: string;
  type: SignResourceType;
  category: 'emergency' | 'basics' | 'everyday' | 'medical' | 'social';
  signLanguage: SignLanguageSystem;
  thumbnailUrl: string;
  embedUrl?: string;
  externalUrl?: string;
  authorOrChannel: string;
  duration?: string;
  tags: string[];
  signNotation?: string;
  gestureSteps?: string[];
  tips?: string[];
  relevanceScore?: number;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: number;
}

export interface Flashcard {
  id: string;
  frontTopic: string;
  frontQuestion: string;
  backAnswer: string;
  explanation: string;
  imageUrl?: string;
  relatedResourceId?: string;
}

export interface QuizQuestion {
  id: string;
  questionText: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
  imageUrl?: string;
}

export interface TranscriptEntry {
  id: string;
  speaker: 'other' | 'you';
  text: string;
  timestamp: string;
  isFinal: boolean;
}

export interface AppPermissions {
  microphone: 'granted' | 'denied' | 'prompt' | 'unsupported';
  sensors: 'granted' | 'denied' | 'prompt' | 'unsupported';
  location: 'granted' | 'denied' | 'prompt' | 'unsupported';
  notifications: 'granted' | 'denied' | 'prompt' | 'unsupported';
}

export interface UserPreferences {
  vibrationEnabled: boolean;
  highContrast: boolean;
  textScale: 'normal' | 'large' | 'xlarge';
  fallDetectionSensitivity: 'low' | 'medium' | 'high';
  autoTTSVolume: number;
  listenContinuously: boolean;
  hasSeenOnboarding: boolean;
}
