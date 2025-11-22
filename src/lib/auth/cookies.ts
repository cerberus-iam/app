import type { IncomingHttpHeaders } from 'http';

const COOKIE_HEADER = 'cookie';

export const getCookieHeader = (
  headers?: IncomingHttpHeaders
): string | undefined => {
  if (!headers) {
    return undefined;
  }

  const cookieHeader = headers[COOKIE_HEADER];
  if (Array.isArray(cookieHeader)) {
    return cookieHeader.join('; ');
  }

  return cookieHeader;
};

export const getCsrfTokenFromCookies = (
  headers?: IncomingHttpHeaders
): string | null => {
  const cookieHeader = getCookieHeader(headers);
  if (!cookieHeader) {
    return null;
  }

  // Parse cookies and find cerb_csrf
  const cookies = cookieHeader.split(';').map((c) => c.trim());
  for (const cookie of cookies) {
    const [name, value] = cookie.split('=');
    if (name === 'cerb_csrf' && value) {
      return value;
    }
  }

  return null;
};
