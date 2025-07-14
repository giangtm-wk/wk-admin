import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { APP_CONFIG, APP_CONFIG_VALUES } from '@config/app.config';
import { authInterceptor } from '@core/interceptors/auth.interceptor';
import { provideEventPlugins } from "@taiga-ui/event-plugins";
import { provideAnimations } from "@angular/platform-browser/animations";
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimations(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideEventPlugins(),
    provideHttpClient(
      withInterceptors([authInterceptor])
    ),
    { provide: APP_CONFIG, useValue: APP_CONFIG_VALUES }
  ]
};
