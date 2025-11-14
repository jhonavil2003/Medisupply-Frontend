import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection, importProvidersFrom, APP_INITIALIZER } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch, HttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideToastr } from 'ngx-toastr';
import { provideNativeDateAdapter } from '@angular/material/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { CORE_PROVIDERS } from './core/core.providers';

// Initialize translate service
export function initializeTranslate(translate: TranslateService, http: HttpClient) {
  return () => {
    const savedLang = localStorage.getItem('language') || 'es';
    translate.setDefaultLang('es');
    
    // Load translations manually
    return Promise.all([
      http.get('/assets/i18n/es.json').toPromise().then((res: any) => translate.setTranslation('es', res)),
      http.get('/assets/i18n/en.json').toPromise().then((res: any) => translate.setTranslation('en', res))
    ]).then(() => translate.use(savedLang).toPromise());
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    ...CORE_PROVIDERS,
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideHttpClient(withFetch()),
    provideAnimations(),
    provideNativeDateAdapter(),
    provideToastr({
      timeOut: 3000,
      positionClass: 'toast-top-right',
      preventDuplicates: true,
      progressBar: true
    }),
    importProvidersFrom(
      TranslateModule.forRoot({
        defaultLanguage: 'es'
      })
    ),
    {
      provide: APP_INITIALIZER,
      useFactory: initializeTranslate,
      deps: [TranslateService, HttpClient],
      multi: true
    }
  ]
};
