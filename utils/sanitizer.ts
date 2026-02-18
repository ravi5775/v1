// utils/sanitizer.ts

const entityMap: { [key: string]: string } = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;'
};

/**
 * Sanitizes a string for safe HTML rendering by escaping special characters.
 * Prevents XSS attacks.
 */
export const sanitize = (text: string | null | undefined): string => {
  if (text === null || typeof text === 'undefined') {
    return '';
  }
  
  // Basic HTML entity replacement
  return String(text).replace(/[&<>"'`=\/]/g, (s) => entityMap[s]);
};

/**
 * Sanitizes a string to be used as a safe filename.
 * Removes characters that are problematic in most filesystems.
 */
export const sanitizeForFilename = (text: string | null | undefined): string => {
    if (text === null || typeof text === 'undefined') {
        return 'download';
    }
    // Replace spaces with underscores and remove characters that are invalid in file names
    return String(text)
        .trim()
        .replace(/\s+/g, '_')
        .replace(/[^a-zA-Z0-9_.-]/g, '');
};