import { InjectionToken } from '@angular/core';
import { environment } from '../../environments/environment';

export interface AppConfig {
  apiUrl: string;
  // Add other configuration properties as needed
}

export const APP_CONFIG = new InjectionToken<AppConfig>('app.config');

export const APP_CONFIG_VALUES: AppConfig = {
  apiUrl: environment.apiUrl,
};
