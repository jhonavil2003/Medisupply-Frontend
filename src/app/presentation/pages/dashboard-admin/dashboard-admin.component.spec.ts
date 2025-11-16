import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DashboardAdminComponent } from './dashboard-admin.component';

describe('DashboardAdminComponent', () => {
  let component: DashboardAdminComponent;
  let fixture: ComponentFixture<DashboardAdminComponent>;
  let translateService: TranslateService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        DashboardAdminComponent,
        RouterModule.forRoot([]),
        MatButtonModule,
        TranslateModule.forRoot()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardAdminComponent);
    component = fixture.componentInstance;
    translateService = TestBed.inject(TranslateService);
    fixture.detectChanges();
  });

  describe('Component Creation', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with default values', () => {
      expect(component.showLangMenu()).toBe(false);
      expect(component.sidebarVisible).toBe(true);
      expect(component.selectedLanguage()).toBe('es');
    });

    it('should have languages array properly initialized', () => {
      expect(component.languages).toEqual([
        { code: 'es', label: 'Español' },
        { code: 'en', label: 'English' }
      ]);
    });
  });

  describe('toggleSidebar', () => {
    it('should toggle sidebar visibility from true to false', () => {
      component.sidebarVisible = true;
      component.toggleSidebar();
      expect(component.sidebarVisible).toBe(false);
    });

    it('should toggle sidebar visibility from false to true', () => {
      component.sidebarVisible = false;
      component.toggleSidebar();
      expect(component.sidebarVisible).toBe(true);
    });

    it('should toggle sidebar multiple times correctly', () => {
      expect(component.sidebarVisible).toBe(true);
      component.toggleSidebar();
      expect(component.sidebarVisible).toBe(false);
      component.toggleSidebar();
      expect(component.sidebarVisible).toBe(true);
    });
  });

  describe('changeLanguage', () => {
    it('should change language to English', () => {
      const localStorageSpy = jest.spyOn(Storage.prototype, 'setItem');
      const translateSpy = jest.spyOn(translateService, 'use');
      
      component.changeLanguage('en');
      
      expect(component.selectedLanguage()).toBe('en');
      expect(translateSpy).toHaveBeenCalledWith('en');
      expect(localStorageSpy).toHaveBeenCalledWith('language', 'en');
      
      localStorageSpy.mockRestore();
      translateSpy.mockRestore();
    });

    it('should change language to Spanish', () => {
      const localStorageSpy = jest.spyOn(Storage.prototype, 'setItem');
      const translateSpy = jest.spyOn(translateService, 'use');
      
      component.changeLanguage('es');
      
      expect(component.selectedLanguage()).toBe('es');
      expect(translateSpy).toHaveBeenCalledWith('es');
      expect(localStorageSpy).toHaveBeenCalledWith('language', 'es');
      
      localStorageSpy.mockRestore();
      translateSpy.mockRestore();
    });

    it('should handle multiple language changes', () => {
      component.changeLanguage('en');
      expect(component.selectedLanguage()).toBe('en');
      
      component.changeLanguage('es');
      expect(component.selectedLanguage()).toBe('es');
    });
  });

  describe('onLanguageChange', () => {
    beforeEach(() => {
      jest.spyOn(component, 'changeLanguage');
    });

    it('should call changeLanguage and close language menu', () => {
      component.showLangMenu.set(true);
      component.onLanguageChange('en');
      
      expect(component.changeLanguage).toHaveBeenCalledWith('en');
      expect(component.showLangMenu()).toBe(false);
    });
  });

  describe('ngOnInit', () => {
    beforeEach(() => {
      jest.spyOn(component, 'changeLanguage');
    });

    afterEach(() => {
      localStorage.clear();
    });

    it('should load language from localStorage if available', () => {
      localStorage.setItem('language', 'en');
      component.ngOnInit();
      expect(component.changeLanguage).toHaveBeenCalledWith('en');
    });

    it('should default to Spanish if no language in localStorage', () => {
      localStorage.removeItem('language');
      component.ngOnInit();
      expect(component.changeLanguage).toHaveBeenCalledWith('es');
    });
  });

  describe('Integration Tests', () => {
    it('should maintain independent state for sidebar and language', () => {
      component.sidebarVisible = true;
      component.changeLanguage('en');
      component.toggleSidebar();
      
      expect(component.sidebarVisible).toBe(false);
      expect(component.selectedLanguage()).toBe('en');
    });

    it('should handle multiple operations correctly', () => {
      component.showLangMenu.set(true);
      component.toggleSidebar();
      component.changeLanguage('en');
      
      expect(component.showLangMenu()).toBe(true);
      expect(component.sidebarVisible).toBe(false);
      expect(component.selectedLanguage()).toBe('en');
    });
  });
});
