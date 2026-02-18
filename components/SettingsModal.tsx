import React, { useRef, useState } from 'react';
import { X, Settings as SettingsIcon, Shield } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useLogo } from '../contexts/LogoContext';
import AdminSettingsModal from './AdminSettingsModal';
import DataManagement from './DataManagement';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { t } = useLanguage();
  const { logo, setLogo, resetLogo } = useLogo();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  if (!isOpen) return null;

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <>
      <div 
        className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 animate-fade-in-fast"
        onClick={onClose}
      >
        <div 
          className="bg-white rounded-lg shadow-xl w-full max-w-lg m-4 transform transition-all animate-fade-in-up"
          onClick={e => e.stopPropagation()}
        >
          <div className="p-4 border-b flex justify-between items-center">
            <h2 className="text-xl font-semibold text-primary flex items-center gap-2">
              <SettingsIcon size={22} />
              {t('Settings')}
            </h2>
            <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="p-2 rounded-full hover:bg-gray-100">
              <X size={20} />
            </button>
          </div>
          <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
            {/* Logo Upload */}
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-800">Custom Logo</h3>
              <p className="text-sm text-gray-500 mb-2">Change the application logo. This is saved on your device.</p>
              <div className="flex items-center gap-4">
                <img src={logo} alt="Current logo" className="h-16 w-16 rounded-md object-contain border p-1 bg-gray-50" />
                <div className='flex-grow'>
                  <input
                    type="file"
                    id="logo-upload"
                    ref={fileInputRef}
                    accept="image/png, image/jpeg, image/svg+xml"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                   <button onClick={() => fileInputRef.current?.click()} className="btn btn-secondary">
                      Change Logo
                   </button>
                   <button onClick={resetLogo} className="text-xs text-red-500 hover:underline mt-2 ml-2">Reset to default</button>
                </div>
              </div>
            </div>

            {/* Admin Management */}
            <div className="border-t pt-6 space-y-2">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2"><Shield size={18} />{t('Admin Management')}</h3>
                <p className="text-sm text-gray-500 mb-2">{t('Manage admin users and passwords.')}</p>
                 <button onClick={() => setIsAdminModalOpen(true)} className="btn btn-secondary">
                    {t('Manage Admins')}
                 </button>
            </div>
            
            {/* Data Management */}
            <DataManagement />
          </div>
        </div>
      </div>
      <AdminSettingsModal 
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
      />
    </>
  );
};

export default SettingsModal;