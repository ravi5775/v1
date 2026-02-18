# Redundant Files to be Removed

The following files are part of legacy architectures (Google Sheets, Firebase, Supabase, PHP) and are **NOT** required for the current high-performance Node.js + MongoDB application. You should delete these files from your project root:

### 1. Legacy Integration Files (Delete these)
- `firebaseConfig.ts` (Unused Firebase config)
- `googleApiConfig.ts` (Old Google API keys)
- `contexts/FirebaseContext.tsx` (Unused context)
- `contexts/GoogleSheetContext.tsx` (Old Sheets context)
- `components/FirebaseConfigModal.tsx` (Unused UI)
- `services/sheetService.ts` (Old Sheets logic)
- `services/syncService.ts` (Legacy sync service)
- `utils/supabaseClient.ts` (Old Supabase client)
- `utils/googleDriveBackup.ts` (Removed to ensure 100% local privacy)
- `hooks/useSyncedStorage.ts` (Old sync hook)
- `hooks/useSyncStatus.ts` (Redundant)

### 2. Legacy Backend Folders & Assets
- `backend_php/` (Entire directory - replaced by Node.js backend)
- `database.txt` (Old text-based DB reference)
- `backend/database_schema.txt` (Internal reference)
- `backend/src/services/database.js` (Redundant)

### 3. Setup & Documentation Artifacts
- `nginx_setup_guide.md`
- `deployment_automation_guide.md`
- `backend_replication_prompt.md`
- `backendflow.md`
- `DATABASE_REPORT.md`
- `report.md`
- `crud.md`

### 4. Duplicate or Unused Utilities
- `services/apiService.ts` (Duplicate of `utils/apiService.ts`)
- `services/storageService.ts` (Replaced by MongoDB persistence)
- `utils/adminSetup.ts` (Handled by backend init)
- `utils/syncCodeGenerator.ts` (Legacy sync code)
- `utils/vite.config.ts` (Duplicate of root `vite.config.ts`)
- `pages/ClientIdSetup.tsx` (Legacy Sheets setup)
- `components/SyncSettings.tsx` (Legacy)
- `components/QuickPayForm.tsx` (Logic consolidated into RepaymentPage)
- `components/PlansTable.tsx` (Consolidated into LoansTable)

---
*By removing these, your project will be strictly focused on the high-speed Node.js + MongoDB local server architecture.*