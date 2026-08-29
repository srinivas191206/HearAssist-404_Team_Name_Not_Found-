import React, { createContext, useContext, useState, useEffect } from 'react';
import type {
  ActiveTab,
  EnvironmentalAlert,
  EmergencyContact,
  UserPreferences,
  AppPermissions,
  SoundCategory,
  SOSState,
  LocationData,
  SOSHistoryEvent,
} from '../types';
import { storageService, type UserProfile } from '../services/storageService';
import { sensorService } from '../services/sensorService';
import { soundClassifier } from '../services/soundClassifier';
import { locationService } from '../services/locationService';
import { hapticService } from '../services/hapticService';
import { twilioSmsService } from '../services/twilioSmsService';

interface AppContextType {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  
  // User Profile
  userProfile: UserProfile;
  updateUserProfile: (profile: UserProfile) => void;

  // Emergency SOS State Machine
  sosState: SOSState;
  sosCountdownSeconds: number;
  sosTriggerType: 'manual' | 'automatic';
  locationData: LocationData | null;
  lastRelayoStatus: string;

  triggerSosCountdown: (source?: 'manual' | 'automatic') => void;
  cancelSosCountdown: () => void;
  retrySosDispatch: () => void;
  resetSosState: () => void;

  // Alerts & Event History
  alertsHistory: EnvironmentalAlert[];
  sosHistory: SOSHistoryEvent[];
  activeAlert: EnvironmentalAlert | null;
  dismissActiveAlert: () => void;
  triggerSimulatedAlert: (category?: SoundCategory) => void;

  // Sound Monitoring
  isSoundMonitoringActive: boolean;
  toggleSoundMonitoring: (enable?: boolean) => Promise<boolean>;

  // Contacts & Preferences
  contacts: EmergencyContact[];
  updateContacts: (contacts: EmergencyContact[]) => void;
  preferences: UserPreferences;
  updatePreferences: (prefs: UserPreferences) => void;
  permissions: AppPermissions;
  updatePermissions: (perms: Partial<AppPermissions>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  
  // User Profile & Contacts & Preferences
  const [userProfile, setUserProfile] = useState<UserProfile>(() => storageService.getUserProfile());
  const [contacts, setContacts] = useState<EmergencyContact[]>(() => storageService.getContacts());
  const [preferences, setPreferences] = useState<UserPreferences>(() => storageService.getPreferences());
  const [permissions, setPermissions] = useState<AppPermissions>(() => storageService.getPermissions());

  const updateUserProfile = (profile: UserProfile) => {
    setUserProfile(profile);
    storageService.saveUserProfile(profile);
  };

  // Alerts & History state
  const [alertsHistory, setAlertsHistory] = useState<EnvironmentalAlert[]>(() => storageService.getAlertHistory());
  const [sosHistory, setSosHistory] = useState<SOSHistoryEvent[]>([]);
  const [activeAlert, setActiveAlert] = useState<EnvironmentalAlert | null>(null);
  const [isSoundMonitoringActive, setIsSoundMonitoringActive] = useState(true);

  // SOS State Machine
  const [sosState, setSosState] = useState<SOSState>('normal');
  const [sosCountdownSeconds, setSosCountdownSeconds] = useState(5);
  const [sosTriggerType, setSosTriggerType] = useState<'manual' | 'automatic'>('manual');
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [lastRelayoStatus, setLastRelayoStatus] = useState<string>('');

  // Fetch Live GPS Location on Startup
  useEffect(() => {
    locationService.getCurrentLocation().then((loc) => {
      setLocationData(loc);
    });
  }, []);

  // Sync preferences with sensor sensitivity
  useEffect(() => {
    sensorService.setSensitivity(preferences.fallDetectionSensitivity);
  }, [preferences.fallDetectionSensitivity]);

  // Handle sensor impact trigger
  useEffect(() => {
    const handleImpact = (_magnitude: number, _confidence: number) => {
      triggerSosCountdown('automatic');
    };

    sensorService.startListening(handleImpact);
    return () => {
      sensorService.stopListening(handleImpact);
    };
  }, []);

  // MICROPHONE OWNERSHIP & TAB ISOLATION MANAGER
  useEffect(() => {
    // 1. COMMUNICATE TAB: Speech-to-Text has 100% exclusive priority. Stop soundClassifier.
    if (activeTab === 'communication') {
      if (soundClassifier.isMonitoring()) {
        soundClassifier.stop();
      }
      return;
    }

    // 2. AWARENESS TAB: Run environmental sound detection ONLY when on Awareness tab or when explicitly armed.
    if (activeTab === 'awareness') {
      const tryStartAwarenessMic = () => {
        if (isSoundMonitoringActive && !soundClassifier.isMonitoring()) {
          soundClassifier.start(
            (newAlert) => {
              setActiveAlert(newAlert);
              setAlertsHistory((prev) => [newAlert, ...prev]);
            },
            (_keyword) => {
              triggerSosCountdown('automatic');
            }
          );
        }
      };

      tryStartAwarenessMic();

      const handleUserTouch = () => {
        tryStartAwarenessMic();
      };

      window.addEventListener('click', handleUserTouch);
      window.addEventListener('touchstart', handleUserTouch);

      return () => {
        window.removeEventListener('click', handleUserTouch);
        window.removeEventListener('touchstart', handleUserTouch);
        if (soundClassifier.isMonitoring()) {
          soundClassifier.stop();
        }
      };
    }

    // 3. OTHER TABS (Learn, Settings, Dashboard): Ensure soundClassifier is stopped so mic is idle.
    if (soundClassifier.isMonitoring()) {
      soundClassifier.stop();
    }
  }, [activeTab, isSoundMonitoringActive]);

  // SOS 5-Second Countdown Effect
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    if (sosState === 'countdown' && sosCountdownSeconds > 0) {
      if (preferences.vibrationEnabled) {
        hapticService.startEmergencyCountdownHaptics(sosCountdownSeconds);
      }

      timer = setTimeout(() => {
        setSosCountdownSeconds((prev) => prev - 1);
      }, 1000);
    } else if (sosState === 'countdown' && sosCountdownSeconds === 0) {
      hapticService.stopVibration();
      dispatchEmergencyAlert();
    }

    return () => clearTimeout(timer);
  }, [sosState, sosCountdownSeconds]);

  const triggerSosCountdown = (source: 'manual' | 'automatic' = 'manual') => {
    if (contacts.length === 0) {
      setSosState('no_contacts');
      return;
    }

    setSosTriggerType(source);
    setSosCountdownSeconds(5);
    setSosState(source === 'automatic' ? 'possible_emergency' : 'countdown');

    locationService.getCurrentLocation().then((loc) => {
      setLocationData(loc);
    });

    if (source === 'automatic') {
      setTimeout(() => setSosState('countdown'), 800);
    }
  };

  const cancelSosCountdown = () => {
    hapticService.notifyCancelled();
    setSosState('cancelled');
    setSosCountdownSeconds(5);

    const cancelledEvent: SOSHistoryEvent = {
      id: `sos-cancel-${Date.now()}`,
      timestamp: Date.now(),
      type: sosTriggerType,
      status: 'cancelled',
      contactsNotifiedCount: 0,
      locationString: locationData?.mapsUrl || 'Location unavailable',
      notes: 'SOS cancelled by user during 5s countdown.',
    };
    setSosHistory((prev) => [cancelledEvent, ...prev]);

    setTimeout(() => {
      setSosState('normal');
    }, 2000);
  };

  // AUTOMATED EMERGENCY SMS DISPATCH VIA TWILIO & NATIVE SMS BRIDGE
  const dispatchEmergencyAlert = async () => {
    setSosState('sending');

    const loc = locationData || await locationService.getCurrentLocation();
    setLocationData(loc);

    const smsPayload = {
      triggerType: sosTriggerType,
      senderName: 'HearAssist User',
      emergencyMessage: twilioSmsService.constructEmergencySmsBody(sosTriggerType, loc),
      location: loc,
      contacts,
      timestamp: Date.now(),
    };

    const result = await twilioSmsService.dispatchEmergencySms(smsPayload);

    if (result.success) {
      setLastRelayoStatus(result.statusMessage);
      setSosState('sent');
      if (preferences.vibrationEnabled) {
        hapticService.notifyDispatched();
      }

      const sentEvent: SOSHistoryEvent = {
        id: `sos-sent-${Date.now()}`,
        timestamp: Date.now(),
        type: sosTriggerType,
        status: 'sent',
        contactsNotifiedCount: result.contactsNotifiedCount,
        locationString: loc.mapsUrl || 'Location unavailable',
        notes: result.statusMessage,
      };
      setSosHistory((prev) => [sentEvent, ...prev]);
    } else {
      setLastRelayoStatus(result.statusMessage);
      setSosState('failed');
    }
  };

  const retrySosDispatch = () => {
    dispatchEmergencyAlert();
  };

  const resetSosState = () => {
    setSosState('normal');
    setSosCountdownSeconds(5);
  };

  const toggleSoundMonitoring = async (enable?: boolean): Promise<boolean> => {
    const targetState = enable !== undefined ? enable : !isSoundMonitoringActive;
    if (targetState) {
      const success = await soundClassifier.start((newAlert) => {
        setActiveAlert(newAlert);
        setAlertsHistory((prev) => [newAlert, ...prev]);
        storageService.saveAlertHistory([newAlert, ...alertsHistory]);
      });

      if (success) {
        setIsSoundMonitoringActive(true);
        updatePermissions({ microphone: 'granted' });
        return true;
      } else {
        setIsSoundMonitoringActive(false);
        updatePermissions({ microphone: 'denied' });
        return false;
      }
    } else {
      soundClassifier.stop();
      setIsSoundMonitoringActive(false);
      return true;
    }
  };

  const triggerSimulatedAlert = (category: SoundCategory = 'siren') => {
    soundClassifier.simulateAlert(category);
  };

  const dismissActiveAlert = () => {
    setActiveAlert(null);
  };

  const updateContacts = (newContacts: EmergencyContact[]) => {
    setContacts(newContacts);
    storageService.saveContacts(newContacts);
    if (sosState === 'no_contacts' && newContacts.length > 0) {
      setSosState('normal');
    }
  };

  const updatePreferences = (newPrefs: UserPreferences) => {
    setPreferences(newPrefs);
    storageService.savePreferences(newPrefs);
  };

  const updatePermissions = (newPerms: Partial<AppPermissions>) => {
    setPermissions((prev) => {
      const updated = { ...prev, ...newPerms };
      storageService.savePermissions(updated);
      return updated;
    });
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        userProfile,
        updateUserProfile,
        sosState,
        sosCountdownSeconds,
        sosTriggerType,
        locationData,
        lastRelayoStatus,
        triggerSosCountdown,
        cancelSosCountdown,
        retrySosDispatch,
        resetSosState,
        alertsHistory,
        sosHistory,
        activeAlert,
        dismissActiveAlert,
        triggerSimulatedAlert,
        isSoundMonitoringActive,
        toggleSoundMonitoring,
        contacts,
        updateContacts,
        preferences,
        updatePreferences,
        permissions,
        updatePermissions,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
