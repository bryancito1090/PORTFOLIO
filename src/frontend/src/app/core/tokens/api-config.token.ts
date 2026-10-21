import { InjectionToken } from '@angular/core';

export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL', {
  providedIn: 'root',
  factory: () => {
    if (
      typeof window !== 'undefined' &&
      (window.location.hostname.includes('bryan-bano.com') ||
        window.location.hostname.includes('pages.dev'))
    ) {
      return 'https://api.bryan-bano.com/api/v1';
    }
    return 'http://localhost:5000/api/v1';
  }
});
