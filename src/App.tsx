import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/common/Navbar';
import { AlertBanner } from './components/common/AlertBanner';
import { CountdownModal } from './modules/safety/CountdownModal';
import { DashboardView } from './modules/dashboard/DashboardView';
import { SafetyView } from './modules/safety/SafetyView';
import { ICantHearYouView } from './modules/communication/ICantHearYouView';
import { AwarenessView } from './modules/awareness/AwarenessView';
import { LearnView } from './modules/learn/LearnView';
import { SettingsView } from './modules/settings/SettingsView';
import { OnboardingView } from './modules/onboarding/OnboardingView';

import './styles/base.css';
import './styles/components.css';

const MainContentRouter: React.FC = () => {
  const { activeTab } = useApp();

  switch (activeTab) {
    case 'safety':
      return <SafetyView />;
    case 'awareness':
      return <AwarenessView />;
    case 'communication':
      return <ICantHearYouView />;
    case 'learn':
      return <LearnView />;
    case 'settings':
      return <SettingsView />;
    case 'dashboard':
    default:
      return <DashboardView />;
  }
};

const MainLayout: React.FC = () => {
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(() => {
    return localStorage.getItem('hearassist_onboarding_completed') === 'true';
  });

  const handleFinishOnboarding = () => {
    localStorage.setItem('hearassist_onboarding_completed', 'true');
    setHasCompletedOnboarding(true);
  };

  if (!hasCompletedOnboarding) {
    return <OnboardingView onComplete={handleFinishOnboarding} />;
  }

  return (
    <div className="app-container">
      {/* SOFT AMBIENT BACKGROUND GRADIENT BUBBLES (REFERENCE IMAGE 2 MATCHING PALETTE) */}
      <div className="ambient-bubbles-container">
        <div className="ambient-bubble-1" />
        <div className="ambient-bubble-2" />
        <div className="ambient-bubble-3" />
      </div>

      <AlertBanner />
      <CountdownModal />

      <main className="main-content" style={{ position: 'relative', zIndex: 1 }}>
        <MainContentRouter />
      </main>

      <Navbar />
    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}

export default App;
