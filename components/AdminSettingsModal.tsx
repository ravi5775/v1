import React, { useState, useEffect } from 'react';
import { X, UserPlus, KeyRound, Loader2, History, ShieldAlert, Monitor, Globe, Calendar } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../contexts/ToastContext';
import apiService from '../utils/apiService';
import { LoginHistory } from '../types';
import { sanitize } from '../utils/sanitizer';

interface AdminSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AdminSettingsModal: React.FC<AdminSettingsModalProps> = ({ isOpen, onClose }) => {
  const { t } = useLanguage();
  const { showToast } = useToast();

  // State for creating a new admin
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);

  // State for changing password
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  // State for login history
  const [history, setHistory] = useState<LoginHistory[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  useEffect(() => {
    if (isOpen) {
        const fetchHistory = async () => {
            setIsLoadingHistory(true);
            try {
                const data = await apiService.getLoginHistory();
                setHistory(data);
            } catch (error: any) {
                console.error("Login history fetch error:", error);
                showToast(`${t('Failed to fetch login history')}: ${error.message}`, 'error');
            } finally {
                setIsLoadingHistory(false);
            }
        };
        fetchHistory();
    }
  }, [isOpen, showToast, t]);

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingAdmin(true);
    try {
      await apiService.createAdmin(newAdminEmail, newAdminPassword);
      showToast(t('Admin created successfully!'), 'success');
      setNewAdminEmail('');
      setNewAdminPassword('');
    } catch (error: any) {
      showToast(`${t('Failed to create admin.')} ${error.message}`, 'error');
    } finally {
      setIsCreatingAdmin(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      showToast(t('Passwords do not match.'), 'error');
      return;
    }
    setIsChangingPassword(true);
    try {
      await apiService.changePassword(currentPassword, newPassword);
      showToast(t('Password changed successfully!'), 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (error: any) {
      showToast(`${t('Failed to change password.')} ${error.message}`, 'error');
    } finally {
      setIsChangingPassword(false);
    }
  };

  /**
   * Helper to parse User Agent strings into human-friendly device descriptions
   */
  const parseUserAgent = (ua: string): string => {
    if (!ua) return 'Unknown Device';
    
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
    const browserMatch = ua.match(/(Edg|Chrome|Firefox|Safari|Opera)\/([\d.]+)/);
    const osMatch = ua.match(/\(([^)]+)\)/);
    
    let browser = browserMatch ? browserMatch[1] : 'Browser';
    if (browser === 'Edg') browser = 'Edge';
    
    let os = 'Unknown OS';
    if (osMatch) {
        const osInfo = osMatch[1];
        if (osInfo.includes('Windows')) os = 'Windows';
        else if (osInfo.includes('Macintosh')) os = 'macOS';
        else if (osInfo.includes('Linux')) os = 'Linux';
        else if (osInfo.includes('Android')) os = 'Android';
        else if (osInfo.includes('iPhone') || osInfo.includes('iPad')) os = 'iOS';
    }

    return `${browser}${isMobile ? ' Mobile' : ''} on ${os}`;
  };
  
  const inputFieldClass = "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm transition-all";

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[60] animate-fade-in-fast backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-4xl m-4 transform transition-all animate-fade-in-up border border-gray-200 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b bg-gray-50 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <ShieldAlert className="text-primary" size={24} />
            <h2 className="text-xl font-bold text-gray-800">{t('Admin Management')}</h2>
          </div>
          <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="p-2 rounded-full hover:bg-gray-200 text-gray-500 transition-colors"><X size={20} /></button>
        </div>
        
        <div className="p-6 max-h-[85vh] overflow-y-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Left side: Forms (40%) */}
                <div className="lg:col-span-5 space-y-8">
                    {/* Create Admin Form */}
                    <div className="bg-gray-50/50 p-5 rounded-lg border border-gray-100">
                        <form onSubmit={handleCreateAdmin} className="space-y-4">
                            <h3 className="font-bold text-gray-800 flex items-center gap-2 text-base">
                                <UserPlus size={18} className="text-primary" />
                                {t('Create New Admin')}
                            </h3>
                            <p className="text-xs text-gray-500">{t('Create a new administrator account.')}</p>
                            
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">{t('New Admin Email')}</label>
                                    <input type="email" value={newAdminEmail} onChange={e => setNewAdminEmail(e.target.value)} className={inputFieldClass} required placeholder="admin@svt.com" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">{t('New Admin Password')}</label>
                                    <input type="password" value={newAdminPassword} onChange={e => setNewAdminPassword(e.target.value)} className={inputFieldClass} required minLength={8} placeholder="••••••••" />
                                </div>
                            </div>
                            
                            <button type="submit" className="btn btn-primary w-full shadow-sm" disabled={isCreatingAdmin}>
                                {isCreatingAdmin ? <Loader2 className="animate-spin h-5 w-5" /> : t('Create Admin')}
                            </button>
                        </form>
                    </div>

                    {/* Change Password Form */}
                    <div className="bg-gray-50/50 p-5 rounded-lg border border-gray-100">
                        <form onSubmit={handleChangePassword} className="space-y-4">
                            <h3 className="font-bold text-gray-800 flex items-center gap-2 text-base">
                                <KeyRound size={18} className="text-primary" />
                                {t('Change Your Password')}
                            </h3>
                            <p className="text-xs text-gray-500">{t('Update your current login password.')}</p>
                            
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">{t('Current Password')}</label>
                                    <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className={inputFieldClass} required placeholder="••••••••" />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">{t('New Password')}</label>
                                        <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className={inputFieldClass} required minLength={8} placeholder="••••••••" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">{t('Confirm Password')}</label>
                                        <input type="password" value={confirmNewPassword} onChange={e => setConfirmNewPassword(e.target.value)} className={inputFieldClass} required minLength={8} placeholder="••••••••" />
                                    </div>
                                </div>
                            </div>
                            
                            <button type="submit" className="btn btn-primary w-full shadow-sm" disabled={isChangingPassword}>
                                {isChangingPassword ? <Loader2 className="animate-spin h-5 w-5" /> : t('Change Password')}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Right side: Login History (60%) */}
                <div className="lg:col-span-7 flex flex-col h-full min-h-[400px]">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-gray-800 flex items-center gap-2 text-base">
                            <History size={18} className="text-primary" />
                            {t('Login History')}
                        </h3>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('Last 50 Logins')}</span>
                    </div>
                    <p className="text-xs text-gray-500 mb-4">{t('View recent admin login activity.')}</p>
                    
                    <div className="flex-grow border rounded-lg overflow-hidden flex flex-col bg-white shadow-inner">
                        {isLoadingHistory ? (
                             <div className="flex flex-col items-center justify-center flex-grow py-12 gap-3">
                                <Loader2 className="animate-spin text-primary h-8 w-8" />
                                <span className="text-xs text-gray-400 font-medium">{t('Loading history...')}</span>
                            </div>
                        ) : (
                            <div className="overflow-x-auto flex-grow scrollbar-thin scrollbar-thumb-gray-200">
                                <table className="min-w-full text-xs">
                                    <thead className="bg-gray-100 sticky top-0 z-10">
                                        <tr>
                                            <th className="px-4 py-3 text-left font-bold text-gray-600 uppercase tracking-wider border-b">
                                                <div className="flex items-center gap-1.5"><ShieldAlert size={12} />{t('Admin')}</div>
                                            </th>
                                            <th className="px-4 py-3 text-left font-bold text-gray-600 uppercase tracking-wider border-b">
                                                <div className="flex items-center gap-1.5"><Globe size={12} />{t('IP Address')}</div>
                                            </th>
                                            <th className="px-4 py-3 text-left font-bold text-gray-600 uppercase tracking-wider border-b">
                                                <div className="flex items-center gap-1.5"><Monitor size={12} />{t('Device')}</div>
                                            </th>
                                            <th className="px-4 py-3 text-left font-bold text-gray-600 uppercase tracking-wider border-b">
                                                <div className="flex items-center gap-1.5"><Calendar size={12} />{t('Date')}</div>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {history.map((item, index) => (
                                            <tr key={item.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'} hover:bg-blue-50/50 transition-colors`}>
                                                <td className="px-4 py-3 text-gray-700 font-medium truncate max-w-[150px]" title={item.user?.email}>
                                                    {sanitize(item.user?.email) || 'N/A'}
                                                </td>
                                                <td className="px-4 py-3 text-gray-500 font-mono text-[11px]">
                                                    {sanitize(item.ip)}
                                                </td>
                                                <td className="px-4 py-3 text-gray-500 truncate max-w-[150px]" title={item.userAgent}>
                                                    {sanitize(parseUserAgent(item.userAgent))}
                                                </td>
                                                <td className="px-4 py-3 text-gray-400 whitespace-nowrap tabular-nums">
                                                    {new Date(item.timestamp).toLocaleString(undefined, {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: '2-digit',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {history.length === 0 && !isLoadingHistory && (
                                    <div className="flex flex-col items-center justify-center py-20 text-gray-400 italic">
                                        <History size={40} className="mb-2 opacity-10" />
                                        <p>{t('No login history found.')}</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
        
        <div className="px-6 py-4 border-t bg-gray-50 flex justify-end">
            <button onClick={onClose} className="btn btn-secondary text-xs uppercase tracking-widest px-6 shadow-sm">
                {t('Close')}
            </button>
        </div>
      </div>
    </div>
  );
};

export default AdminSettingsModal;