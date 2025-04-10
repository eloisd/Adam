import {ApplicationConfig, provideZoneChangeDetection} from '@angular/core';
import {provideRouter} from '@angular/router';

import {routes} from './app.routes';
import {provideHttpClient, withInterceptors} from '@angular/common/http';
import {provideAnimationsAsync} from '@angular/platform-browser/animations/async';
import {provideGateways} from './core/adaptaters/gateways.providers';
import {authInterceptor, refreshInterceptor} from './shared/interceptors/auth.interceptor';
import {provideMarkdownConfig} from './shared/components/markdown-display/markdown.config';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimationsAsync(),
    provideMarkdownConfig(),
    provideHttpClient(
      withInterceptors([authInterceptor, refreshInterceptor])
    ),
    provideGateways()
  ],
};
