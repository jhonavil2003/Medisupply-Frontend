import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app.component';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideToastr, ToastrService } from 'ngx-toastr';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let mockToastr: jest.Mocked<ToastrService>;

  beforeEach(async () => {
    mockToastr = {
      success: jest.fn(),
      error: jest.fn(),
      info: jest.fn(),
      warning: jest.fn()
    } as any;

    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideAnimations(),
        provideToastr(),
        { provide: ToastrService, useValue: mockToastr }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Component Creation', () => {
    it('should create the app', () => {
      expect(component).toBeTruthy();
    });

    it('should have title as mynewapp', () => {
      expect(component.title).toEqual('mynewapp');
    });
  });

  describe('Toast Notifications', () => {
    it('should call toastr.success when showSuccess is called', () => {
      component.showSuccess();

      expect(mockToastr.success).toHaveBeenCalledWith(
        'La operación fue exitosa ✅',
        'Éxito'
      );
    });

    it('should call toastr.error when showError is called', () => {
      component.showError();

      expect(mockToastr.error).toHaveBeenCalledWith(
        'Algo salió mal ❌',
        'Error'
      );
    });

    it('should call toastr.info when showInfo is called', () => {
      component.showInfo();

      expect(mockToastr.info).toHaveBeenCalledWith(
        'Esto es solo información ℹ️',
        'Info'
      );
    });

    it('should call toastr.warning when showWarning is called', () => {
      component.showWarning();

      expect(mockToastr.warning).toHaveBeenCalledWith(
        'Cuidado ⚠️',
        'Advertencia'
      );
    });
  });

  describe('Integration Tests', () => {
    it('should handle multiple notification calls in sequence', () => {
      component.showSuccess();
      component.showError();
      component.showInfo();
      component.showWarning();

      expect(mockToastr.success).toHaveBeenCalledTimes(1);
      expect(mockToastr.error).toHaveBeenCalledTimes(1);
      expect(mockToastr.info).toHaveBeenCalledTimes(1);
      expect(mockToastr.warning).toHaveBeenCalledTimes(1);
    });

    it('should maintain correct title throughout lifecycle', () => {
      expect(component.title).toBe('mynewapp');
      
      component.showSuccess();
      expect(component.title).toBe('mynewapp');
      
      component.showError();
      expect(component.title).toBe('mynewapp');
    });

    it('should call toastr methods with exact parameters', () => {
      component.showSuccess();
      expect(mockToastr.success).toHaveBeenCalledWith(
        'La operación fue exitosa ✅',
        'Éxito'
      );
      expect(mockToastr.success).toHaveBeenCalledTimes(1);

      component.showError();
      expect(mockToastr.error).toHaveBeenCalledWith(
        'Algo salió mal ❌',
        'Error'
      );
      expect(mockToastr.error).toHaveBeenCalledTimes(1);
    });
  });

  describe('Performance Tests', () => {
    it('should handle rapid notification calls', () => {
      for (let i = 0; i < 10; i++) {
        component.showSuccess();
      }
      
      expect(mockToastr.success).toHaveBeenCalledTimes(10);
    });

    it('should handle all notification types in rapid succession', () => {
      const start = performance.now();
      
      for (let i = 0; i < 25; i++) {
        component.showSuccess();
        component.showError();
        component.showInfo();
        component.showWarning();
      }
      
      const end = performance.now();
      
      expect(end - start).toBeLessThan(100); // Should complete in less than 100ms
      expect(mockToastr.success).toHaveBeenCalledTimes(25);
      expect(mockToastr.error).toHaveBeenCalledTimes(25);
      expect(mockToastr.info).toHaveBeenCalledTimes(25);
      expect(mockToastr.warning).toHaveBeenCalledTimes(25);
    });
  });
});
