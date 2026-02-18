import React, { useRef, useState } from 'react';
import { useLoans } from '../contexts/LoanContext';
import { useInvestors } from '../contexts/InvestorContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../contexts/ToastContext';
import { Download, Upload, AlertTriangle, FileJson } from 'lucide-react';
import apiService from '../utils/apiService';
import ConfirmationModal from './ConfirmationModal';

const DataManagement: React.FC = () => {
  const { t } = useLanguage();
  const { loans } = useLoans();
  const { investors } = useInvestors();
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [backupData, setBackupData] = useState<any>(null);

  const handleDownloadBackup = () => {
    // 1. Prepare Data
    const dataToBackup = {
      loans,
      investors,
      version: '2.0.0',
      timestamp: new Date().toISOString(),
      type: 'Local-Offline-Backup'
    };
    
    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `SVT-Local-Backup-${dateStr}.json`;

    // 2. Local Download Logic
    try {
      const jsonString = JSON.stringify(dataToBackup, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      showToast(t('Backup saved locally.'), 'success');
    } catch (e) {
      console.error("Backup failed", e);
      showToast('Local backup failed', 'error');
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result;
          if (typeof content !== 'string') throw new Error('File content is not readable');
          const data = JSON.parse(content);
          if (data.loans && Array.isArray(data.loans) && data.investors && Array.isArray(data.investors)) {
            setBackupData(data);
            setIsConfirmOpen(true);
          } else {
            showToast(t('Invalid backup file format.'), 'error');
          }
        } catch (error) {
          showToast(t('Failed to read backup file.'), 'error');
          console.error(error);
        }
      };
      reader.readAsText(file);
    }
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const handleConfirmImport = async () => {
      if (!backupData) return;
      try {
          await apiService.restoreBackup(backupData);
          showToast(t('Data restored successfully! The page will now reload.'), 'success');
          setTimeout(() => window.location.reload(), 1500);
      } catch (error: any) {
          showToast(`${t('Restore failed: ')} ${error.message}`, 'error');
      } finally {
          setIsConfirmOpen(false);
          setBackupData(null);
      }
  };

  return (
    <>
      <div className="border-t pt-6 space-y-4">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
            <FileJson size={18} />
            Data Management (Offline)
        </h3>

        <div className="grid grid-cols-1 gap-4">
          <div className="p-4 border rounded-lg bg-gray-50">
            <h4 className="font-semibold text-gray-700">{t('Download Backup')}</h4>
            <p className="text-xs text-gray-500 mb-3">{t('Save all your records to a local JSON file for security.')}</p>
            <button 
              onClick={handleDownloadBackup} 
              className="btn btn-secondary w-full sm:w-auto"
            >
              <Download size={16} className="mr-2" />
              {t('Export Local Data')}
            </button>
          </div>

          <div className="p-4 border border-red-100 rounded-lg bg-red-50/30">
            <h4 className="font-semibold text-red-600">{t('Import Backup')}</h4>
            <p className="text-xs text-gray-500 mb-3">{t('Restore data from a previously saved JSON file. This will overwrite current records.')}</p>
            <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept=".json" className="hidden" />
            <button onClick={() => fileInputRef.current?.click()} className="btn bg-red-100 text-red-700 border-red-200 hover:bg-red-200 w-full sm:w-auto">
              <Upload size={16} className="mr-2" />
              {t('Restore from File')}
            </button>
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmImport}
        title={t('Confirm Data Restore')}
        variant="danger"
      >
          <div className="flex items-start gap-3">
              <AlertTriangle className="h-10 w-10 text-red-500 flex-shrink-0" />
              <div>
                  <p className="font-bold">{t('This is a destructive action and cannot be undone.')}</p>
                  <p className="mt-2 text-sm text-gray-600">{t('Restoring from this backup file will permanently delete all existing loans and investors and replace them with the data from the file.')}</p>
              </div>
          </div>
      </ConfirmationModal>
    </>
  );
};

export default DataManagement;