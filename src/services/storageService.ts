import type { EmergencyContact, UserPreferences, EnvironmentalAlert, AppPermissions } from '../types';

const CONTACTS_KEY = 'aitam_emergency_contacts';
const PREFS_KEY = 'aitam_user_preferences';
const PERMS_KEY = 'aitam_app_permissions';
const ALERTS_HISTORY_KEY = 'aitam_alerts_history';
const USER_PROFILE_KEY = 'aitam_user_profile';

export interface UserProfile {
  name: string;
  phone: string;
}

const DEFAULT_PROFILE: UserProfile = {
  name: 'User',
  phone: '',
};

const DEFAULT_PREFS: UserPreferences = {
  vibrationEnabled: true,
  highContrast: false,
  textScale: 'normal',
  fallDetectionSensitivity: 'medium',
  autoTTSVolume: 1.0,
  listenContinuously: false,
  hasSeenOnboarding: false,
};

const DEFAULT_PERMS: AppPermissions = {
  microphone: 'prompt',
  sensors: 'prompt',
  location: 'prompt',
  notifications: 'prompt',
};

export const storageService = {
  getUserProfile(): UserProfile {
    try {
      const data = localStorage.getItem(USER_PROFILE_KEY);
      return data ? JSON.parse(data) : DEFAULT_PROFILE;
    } catch {
      return DEFAULT_PROFILE;
    }
  },

  saveUserProfile(profile: UserProfile): void {
    try {
      localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profile));
    } catch (e) {
      console.error('Failed to save user profile', e);
    }
  },

  getContacts(): EmergencyContact[] {
    try {
      const data = localStorage.getItem(CONTACTS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveContacts(contacts: EmergencyContact[]): void {
    try {
      localStorage.setItem(CONTACTS_KEY, JSON.stringify(contacts));
    } catch (e) {
      console.error('Failed to save contacts', e);
    }
  },

  getPreferences(): UserPreferences {
    try {
      const data = localStorage.getItem(PREFS_KEY);
      return data ? { ...DEFAULT_PREFS, ...JSON.parse(data) } : DEFAULT_PREFS;
    } catch {
      return DEFAULT_PREFS;
    }
  },

  savePreferences(prefs: UserPreferences): void {
    try {
      localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
    } catch (e) {
      console.error('Failed to save preferences', e);
    }
  },

  getPermissions(): AppPermissions {
    try {
      const data = localStorage.getItem(PERMS_KEY);
      return data ? JSON.parse(data) : DEFAULT_PERMS;
    } catch {
      return DEFAULT_PERMS;
    }
  },

  savePermissions(perms: AppPermissions): void {
    try {
      localStorage.setItem(PERMS_KEY, JSON.stringify(perms));
    } catch (e) {
      console.error('Failed to save permissions', e);
    }
  },

  getAlertHistory(): EnvironmentalAlert[] {
    try {
      const data = localStorage.getItem(ALERTS_HISTORY_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveAlertHistory(alerts: EnvironmentalAlert[]): void {
    try {
      localStorage.setItem(ALERTS_HISTORY_KEY, JSON.stringify(alerts.slice(0, 50)));
    } catch (e) {
      console.error('Failed to save alert history', e);
    }
  }
};
