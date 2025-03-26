import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import {MARKED_OPTIONS, MarkedOptions, provideMarkdown} from 'ngx-markdown';
import {provideHttpClient, withInterceptors} from '@angular/common/http';
import {provideAnimationsAsync} from '@angular/platform-browser/animations/async';
import {provideGateways} from './core/adaptaters/gateways.providers';
import {authInterceptor, refreshInterceptor} from './shared/interceptors/auth.interceptor';
import {marked, Tokens} from 'marked';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimationsAsync(),
    provideMarkdown({
      markedOptions: {
        provide: MARKED_OPTIONS,
        useFactory: () => {
          const renderer = new marked.Renderer();

          renderer.codespan = ({ text }: Tokens.Codespan): string => {
            return `<code class="language-none">${text}</code>`;
          };

          return { renderer };
        }
      }
    }),
    provideHttpClient(
      withInterceptors([authInterceptor, refreshInterceptor])
    ),
    provideGateways()
  ],
};
