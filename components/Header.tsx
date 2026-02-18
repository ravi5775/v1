import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useNotifications } from '../contexts/NotificationContext';
import { useLogo } from '../contexts/LogoContext';
import { Language } from '../types';
import { Bell, LogOut, Globe, Settings, HandCoins, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import SettingsModal from './SettingsModal';
import OnlineStatusIndicator from './OnlineStatusIndicator';
import { sanitize } from '../utils/sanitizer';

const Header: React.FC = () => {
  const { admin, signOut } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const { logo } = useLogo();
  const [showNotifications, setShowNotifications] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <header className="bg-header-bg text-secondary shadow-lg sticky top-0 z-40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-3">
              <img 
                src={logo}
                alt="Sri Vinayaka Loans Logo" 
                className="h-8 w-8"
              />
              <span className="text-xl font-bold text-secondary">{t('Sri Vinayaka Tenders')}</span>
            </Link>

            <div className="flex items-center gap-4">
              <OnlineStatusIndicator />

              {/* Language Switcher */}
              <div className="flex items-center">
                <Globe size={16} className="text-gray-300 mr-2" />
                <button onClick={() => handleLanguageChange('en')} className={`px-2 py-1 text-sm rounded-l-md ${language === 'en' ? 'bg-primary text-white' : 'bg-gray-700 hover:bg-gray-600'}`}>EN</button>
                <button onClick={() => handleLanguageChange('te')} className={`px-2 py-1 text-sm rounded-r-md ${language === 'te' ? 'bg-primary text-white' : 'bg-gray-700 hover:bg-gray-600'}`}>TE</button>
              </div>

              {/* Investors Link */}
              <Link to="/investors" className="p-2 rounded-full hover:bg-gray-700" title={t('Investors')}>
                  <Users className="text-gray-300" />
              </Link>

              {/* Repayments Link */}
              <Link to="/repayments" className="p-2 rounded-full hover:bg-gray-700" title={t('Log Repayments')}>
                  <HandCoins className="text-gray-300" />
              </Link>
            
              {/* Notifications */}
              <div className="relative" ref={notificationRef}>
                <button onClick={() => setShowNotifications(!showNotifications)} className="relative p-2 rounded-full hover:bg-gray-700">
                  <Bell className="text-gray-300" />
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 block h-4 w-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">{unreadCount}</span>
                  )}
                </button>
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border overflow-hidden text-text-dark">
                    <div className="p-3 font-semibold text-sm border-b flex justify-between items-center">
                        <span>{t('Notifications')}</span>
                        {unreadCount > 0 && (
                          <button onClick={markAllAsRead} className="text-xs text-primary hover:underline font-normal">
                            Mark all as read
                          </button>
                        )}
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map(n => (
                          <div key={n.id} onClick={() => markAsRead(n.id)} className={`p-3 text-sm border-b hover:bg-gray-50 cursor-pointer ${!n.is_read ? 'bg-blue-50' : ''}`}>
                             <p className="font-semibold">{sanitize(n.title)}</p>
                             <p className="text-gray-600">{sanitize(n.message)}</p>
                             <p className="text-xs text-gray-400 mt-1">{new Date(n.created_at).toLocaleString()}</p>
                          </div>
                        ))
                      ) : (
                        <p className="p-4 text-center text-sm text-gray-500">{t('No new notifications')}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Settings Button */}
              <button onClick={() => setIsSettingsModalOpen(true)} className="p-2 rounded-full hover:bg-gray-700" title={t('Settings')}>
                <Settings className="text-gray-300" />
              </button>

              <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-300 hidden md:block">
                    {t('Welcome back')}, {sanitize(admin?.username) || 'User'}
                  </span>
                  <button onClick={signOut} className="p-2 rounded-full hover:bg-gray-700" title={t('Logout')}>
                    <LogOut className="text-gray-300" />
                  </button>
              </div>
            </div>
          </div>
        </div>
      </header>
      <SettingsModal 
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />
    </>
  );
};

export default Header;