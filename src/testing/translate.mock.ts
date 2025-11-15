import { of } from 'rxjs';
import { EventEmitter } from '@angular/core';

/**
 * Mock implementation of TranslateService for testing purposes
 */
export class MockTranslateService {
  public onLangChange = new EventEmitter();
  public onTranslationChange = new EventEmitter();
  public onDefaultLangChange = new EventEmitter();

  get(key: string | string[], interpolateParams?: object): any {
    if (Array.isArray(key)) {
      const obj: any = {};
      key.forEach((k) => {
        obj[k] = k;
      });
      return of(obj);
    }
    return of(key);
  }

  stream(key: string | string[], interpolateParams?: object): any {
    return this.get(key, interpolateParams);
  }

  instant(key: string | string[], interpolateParams?: object): string {
    if (Array.isArray(key)) {
      const obj: any = {};
      key.forEach((k) => {
        obj[k] = k;
      });
      return obj;
    }
    return key;
  }

  use(lang: string): any {
    return of(lang);
  }

  setDefaultLang(lang: string): void {}

  addLangs(langs: string[]): void {}

  getLangs(): string[] {
    return ['en', 'es'];
  }

  getBrowserLang(): string {
    return 'en';
  }

  getBrowserCultureLang(): string {
    return 'en-US';
  }

  getTranslation(lang: string): any {
    return of({});
  }

  setTranslation(lang: string, translations: object, shouldMerge?: boolean): void {}

  reloadLang(lang: string): any {
    return of({});
  }

  resetLang(lang: string): void {}

  currentLang = 'en';
  defaultLang = 'en';
}

/**
 * Mock implementation of NotificationService/ToastrService for testing
 */
export class MockNotificationService {
  success(message?: string, title?: string, override?: any): any {
    return {
      toastId: 1,
      toastRef: null
    };
  }

  error(message?: string, title?: string, override?: any): any {
    return {
      toastId: 2,
      toastRef: null
    };
  }

  warning(message?: string, title?: string, override?: any): any {
    return {
      toastId: 3,
      toastRef: null
    };
  }

  info(message?: string, title?: string, override?: any): any {
    return {
      toastId: 4,
      toastRef: null
    };
  }

  clear(toastId?: number): void {}

  remove(toastId: number): boolean {
    return true;
  }
}
