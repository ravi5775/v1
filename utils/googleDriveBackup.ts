/**
 * Service to handle uploading data to Google Drive via Google Apps Script Web App
 * Method: POST request with Raw JSON body.
 */

const STORAGE_KEY = 'google_drive_script_url';

// ---------------------------------------------------------------------------
// CONFIGURATION: PASTE YOUR GOOGLE APPS SCRIPT WEB APP URL BELOW
// IMPORTANT: The URL must end in '/exec', NOT '/dev'.
// ---------------------------------------------------------------------------
const DEFAULT_URL = "https://script.google.com/macros/s/AKfycby5d7t9Tg3idA2Mn_wWxz7VHedtDa0Wac67Jrt1-PI/exec"; 

export const getStoredScriptUrl = (): string => {
  return localStorage.getItem(STORAGE_KEY) || DEFAULT_URL;
};

export const setStoredScriptUrl = (url: string): void => {
  if (url.trim() === '') {
    localStorage.removeItem(STORAGE_KEY);
  } else {
    localStorage.setItem(STORAGE_KEY, url.trim());
  }
};

interface UploadResult {
  status: 'success' | 'error';
  message: string;
  fileId?: string;
  url?: string;
}

// Helper to encode string to Base64 with UTF-8 support
const toBase64 = (str: string) => {
  return window.btoa(unescape(encodeURIComponent(str)));
};

export const uploadBackupToDrive = async (
  data: any, 
  filename: string
): Promise<UploadResult> => {
  try {
    const scriptUrl = getStoredScriptUrl();

    if (!scriptUrl || scriptUrl.includes('YOUR_SCRIPT_URL_HERE')) {
        return {
            status: 'error',
            message: "Invalid Google Apps Script URL. Please update DEFAULT_URL in utils/googleDriveBackup.ts or configure it in Settings."
        };
    }

    // 1. Convert the data object to a JSON string
    const jsonContent = JSON.stringify(data, null, 2);
    
    // 2. Encode to Base64 to safely handle wrapped payload in Apps Script.
    // This allows us to pass the filename and ensures robust character encoding (e.g. for ₹ symbols).
    const base64Data = toBase64(jsonContent);

    // 3. Construct the wrapped payload expected by the Apps Script
    // The script checks if 'filename' and 'data' exist to determine if it's a wrapped payload.
    const payload = {
      filename: filename,
      mimeType: "application/json",
      data: base64Data
    };

    // 4. Send the request
    // We use 'text/plain' to avoid CORS preflight (OPTIONS request) complications 
    // with Google Apps Script. The script parses the raw postData contents.
    const response = await fetch(scriptUrl, {
      method: "POST",
      body: JSON.stringify(payload),
      headers: {
        "Content-Type": "text/plain;charset=utf-8", 
      },
    });

    const result = await response.json();
    
    // 5. Handle response from the script
    if (result.success) {
        return {
            status: 'success',
            message: 'Uploaded successfully',
            fileId: result.fileId,
            url: result.url // Script might not return URL in all versions, but we pass it if present.
        };
    } else {
        return {
            status: 'error',
            message: result.error || "Unknown error from script"
        };
    }

  } catch (error: any) {
    console.error("Google Drive Upload Error:", error);
    return {
      status: 'error',
      message: error.message || "Network error occurred during upload"
    };
  }
};