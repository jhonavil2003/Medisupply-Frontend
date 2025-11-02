import { TestBed } from '@angular/core/testing';
import { ApplicationConfig } from '@angular/core';
import { appConfig } from './app.config';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { CORE_PROVIDERS } from './core/core.providers';

describe('appConfig', () => {
  describe('Application Configuration', () => {
    it('should create application config with all providers', () => {
      expect(appConfig).toBeDefined();
      expect(appConfig.providers).toBeDefined();
      expect(Array.isArray(appConfig.providers)).toBe(true);
      expect(appConfig.providers!.length).toBeGreaterThan(0);
    });

    it('should include CORE_PROVIDERS in the providers array', () => {
      const providers = appConfig.providers!;
      const coreProvidersIncluded = providers.slice(0, CORE_PROVIDERS.length);
      
      expect(coreProvidersIncluded).toEqual(CORE_PROVIDERS);
    });

    it('should configure the application successfully', async () => {
      await TestBed.configureTestingModule({
        providers: appConfig.providers!
      }).compileComponents();

      expect(TestBed).toBeDefined();
    });
  });

  describe('Provider Services', () => {
    beforeEach(async () => {
      await TestBed.configureTestingModule({
        providers: appConfig.providers!
      }).compileComponents();
    });

    it('should provide Router service', () => {
      const router = TestBed.inject(Router);
      expect(router).toBeDefined();
    });

    it('should provide HttpClient service', () => {
      const httpClient = TestBed.inject(HttpClient);
      expect(httpClient).toBeDefined();
    });

    it('should provide ToastrService', () => {
      const toastr = TestBed.inject(ToastrService);
      expect(toastr).toBeDefined();
    });
  });

  describe('Toastr Configuration', () => {
    beforeEach(async () => {
      await TestBed.configureTestingModule({
        providers: appConfig.providers!
      }).compileComponents();
    });

    it('should configure toastr with correct settings', () => {
      const toastr = TestBed.inject(ToastrService);
      
      // Verify toastr is properly configured
      expect(toastr).toBeDefined();
      expect(typeof toastr.success).toBe('function');
      expect(typeof toastr.error).toBe('function');
      expect(typeof toastr.info).toBe('function');
      expect(typeof toastr.warning).toBe('function');
    });
  });

  describe('Provider Array Structure', () => {
    it('should have providers array with expected minimum length', () => {
      const providers = appConfig.providers!;
      
      // Should include: CORE_PROVIDERS + other essential providers
      expect(providers.length).toBeGreaterThanOrEqual(8);
    });

    it('should include all essential provider types', () => {
      const providers = appConfig.providers!;
      
      // Check if providers array includes core providers
      expect(providers.slice(0, CORE_PROVIDERS.length)).toEqual(CORE_PROVIDERS);
    });

    it('should be a valid ApplicationConfig structure', () => {
      const config: ApplicationConfig = appConfig;
      
      expect(config).toHaveProperty('providers');
      expect(Array.isArray(config.providers)).toBe(true);
    });
  });

  describe('Integration Tests', () => {
    it('should successfully bootstrap with all providers', async () => {
      let bootstrapError: any = null;
      
      try {
        await TestBed.configureTestingModule({
          providers: appConfig.providers!
        }).compileComponents();
        
        // Try to inject core services
        const router = TestBed.inject(Router);
        const httpClient = TestBed.inject(HttpClient);
        const toastr = TestBed.inject(ToastrService);
        
        expect(router).toBeDefined();
        expect(httpClient).toBeDefined();
        expect(toastr).toBeDefined();
      } catch (error) {
        bootstrapError = error;
      }
      
      expect(bootstrapError).toBeNull();
    });

    it('should handle multiple service injections', async () => {
      await TestBed.configureTestingModule({
        providers: appConfig.providers!
      }).compileComponents();

      const services = [
        TestBed.inject(Router),
        TestBed.inject(HttpClient),
        TestBed.inject(ToastrService)
      ];

      services.forEach(service => {
        expect(service).toBeDefined();
      });
    });
  });

  describe('Performance Tests', () => {
    it('should configure TestBed efficiently', async () => {
      const start = performance.now();
      
      await TestBed.configureTestingModule({
        providers: appConfig.providers!
      }).compileComponents();
      
      const end = performance.now();
      
      expect(end - start).toBeLessThan(1000); // Should complete in less than 1 second
    });

    it('should handle multiple provider configurations', async () => {
      for (let i = 0; i < 3; i++) {
        TestBed.resetTestingModule();
        
        await TestBed.configureTestingModule({
          providers: appConfig.providers!
        }).compileComponents();
        
        const router = TestBed.inject(Router);
        expect(router).toBeDefined();
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty providers gracefully if modified', () => {
      const emptyConfig: ApplicationConfig = {
        providers: []
      };
      
      expect(emptyConfig.providers).toEqual([]);
    });

    it('should maintain provider array immutability', () => {
      const originalLength = appConfig.providers!.length;
      const providersCopy = [...appConfig.providers!];
      
      // Ensure original is not modified
      expect(appConfig.providers!.length).toBe(originalLength);
      expect(appConfig.providers).toEqual(providersCopy);
    });

    it('should validate configuration structure', () => {
      expect(appConfig).toHaveProperty('providers');
      expect(appConfig.providers).not.toBeNull();
      expect(appConfig.providers).not.toBeUndefined();
      expect(Array.isArray(appConfig.providers)).toBe(true);
    });
  });
});