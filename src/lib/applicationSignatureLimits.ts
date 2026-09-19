// Browser-safe limits for application signing. Keep this file free of Node imports:
// client components import it, and src/lib/applicationSignature.ts pulls in node:crypto.
export const PREPARED_PDF_MAX_BYTES = 4 * 1024 * 1024;
