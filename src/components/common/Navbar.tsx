import React from 'react';
import { Home, Shield, Ear, MessageSquare, GraduationCap, Settings } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { ActiveTab } from '../../types';

export const Navbar: React.FC = () => {
  const { activeTab, setActiveTab } = useApp();

  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Home', icon: <Home size={20} /> },
    { id: 'safety', label: 'Safety', icon: <Shield size={20} /> },
    { id: 'awareness', label: 'Awareness', icon: <Ear size={20} /> },
    { id: 'communication', label: 'Comm.', icon: <MessageSquare size={20} /> },
    { id: 'learn', label: 'Learn', icon: <GraduationCap size={20} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={20} /> },
  ];

  return (
    <nav className="app-navbar">
      {navItems.map((item) => (
        <button
          key={item.id}
          className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
          onClick={() => setActiveTab(item.id)}
          aria-label={item.label}
        >
          <div className="nav-icon-wrapper">{item.icon}</div>
          <span className="nav-label">{item.label}</span>
        </button>
      ))}
    </nav>
  );
};
