import React from 'react';
import { Bell } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Header: React.FC = () => {
  const { setActiveTab, alertsHistory } = useApp();

  const hasUnread = alertsHistory.some((a) => !a.acknowledged);

  return (
    <header className="app-header">
      <div className="header-user" onClick={() => setActiveTab('dashboard')} style={{ cursor: 'pointer' }}>
        <div className="header-user-name">
          Hello, User 👋
        </div>
        <div className="header-user-status">
          Stay safe, stay connected.
        </div>
      </div>

      <button
        className="header-bell-btn"
        onClick={() => setActiveTab('awareness')}
        aria-label="Notifications"
      >
        <Bell size={20} />
        {hasUnread && <div className="header-bell-dot" />}
      </button>
    </header>
  );
};
