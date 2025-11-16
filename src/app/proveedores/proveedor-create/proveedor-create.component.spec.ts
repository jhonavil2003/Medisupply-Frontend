import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MockTranslateService, MockNotificationService } from '../../../testing/translate.mock';

import { ProveedorCreateComponent } from './proveedor-create.component';
import { CreateProveedorUseCase } from '../../core/application/use-cases/proveedor/create-proveedor.use-case';
import { NotificationService } from '../../presentation/shared/services/notification.service';

// Material modules
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

describe('ProveedorCreateComponent', () => {
  let component: ProveedorCreateComponent;
  let fixture: ComponentFixture<ProveedorCreateComponent>;
  let mockDialogRef: any;
  let mockCreateProveedorUseCase: any;

  beforeEach(async () => {
    const dialogRefSpy = {
      close: jest.fn()
    };

    const createProveedorUseCaseSpy = {
      execute: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [
        ProveedorCreateComponent,
        ReactiveFormsModule,
        NoopAnimationsModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatButtonModule,
        MatIconModule,
        MatProgressSpinnerModule,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: CreateProveedorUseCase, useValue: createProveedorUseCaseSpy },
        { provide: NotificationService, useClass: MockNotificationService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProveedorCreateComponent);
    component = fixture.componentInstance;
    mockDialogRef = TestBed.inject(MatDialogRef);
    mockCreateProveedorUseCase = TestBed.inject(CreateProveedorUseCase);
    fixture.detectChanges();
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with default form values', () => {
      expect(component.proveedorForm).toBeDefined();
      expect(component.proveedorForm.get('razonSocial')?.value).toBe('');
      expect(component.proveedorForm.get('ruc')?.value).toBe('');
      expect(component.loading()).toBe(false);
    });

    it('should have proper form validation setup', () => {
      const form = component.proveedorForm;
      
      expect(form.get('razonSocial')?.hasError('required')).toBe(true);
      expect(form.get('ruc')?.hasError('required')).toBe(true);
      expect(form.get('country')?.hasError('required')).toBe(true);
      expect(form.get('telefono')?.hasError('required')).toBe(true);
      expect(form.get('correoContacto')?.hasError('required')).toBe(true);
      expect(form.get('addressLine1')?.hasError('required')).toBe(true);
      expect(form.get('city')?.hasError('required')).toBe(true);
    });

    it('should initialize arrays with correct values', () => {
      expect(component.monedasDisponibles).toContain('COP');
      expect(component.monedasDisponibles.length).toBeGreaterThan(0);
    });
  });

  describe('Form Submission', () => {
    it('should submit valid form successfully', () => {
      const mockProveedor = {
        id: 1,
        razonSocial: 'Test Proveedor',
        ruc: '12345678901',
        country: 'Colombia',
        telefono: '1234567890',
        correoContacto: 'test@test.com',
        addressLine1: 'Test Address',
        city: 'Bogotá',
        estado: 'Activo'
      };

      mockCreateProveedorUseCase.execute.mockReturnValue(of(mockProveedor));

      component.proveedorForm.patchValue({
        razonSocial: 'Test Proveedor',
        ruc: '12345678901',
        country: 'Colombia',
        telefono: '1234567890',
        correoContacto: 'test@test.com',
        addressLine1: 'Test Address',
        city: 'Bogotá'
      });

      component.onSubmit();

      expect(component.loading()).toBe(false);
      expect(mockDialogRef.close).toHaveBeenCalledWith(true);
    });

    it('should always send estado as Activo when creating', () => {
      const mockProveedor = {
        id: 1,
        razonSocial: 'Test Proveedor',
        ruc: '12345678901',
        country: 'Colombia',
        telefono: '1234567890',
        correoContacto: 'test@test.com',
        addressLine1: 'Test Address',
        city: 'Bogotá',
        estado: 'Activo'
      };

      mockCreateProveedorUseCase.execute.mockReturnValue(of(mockProveedor));

      component.proveedorForm.patchValue({
        razonSocial: 'Test Proveedor',
        ruc: '12345678901',
        country: 'Colombia',
        telefono: '1234567890',
        correoContacto: 'test@test.com',
        addressLine1: 'Test Address',
        city: 'Bogotá'
      });

      component.onSubmit();

      // Verificar que se envió con estado: 'Activo'
      expect(mockCreateProveedorUseCase.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          estado: 'Activo'
        })
      );
    });

    it('should handle submission error', () => {
      mockCreateProveedorUseCase.execute.mockReturnValue(throwError(() => new Error('Creation failed')));

      component.proveedorForm.patchValue({
        razonSocial: 'Test Proveedor',
        ruc: '12345678901',
        country: 'Colombia',
        telefono: '1234567890',
        correoContacto: 'test@test.com',
        addressLine1: 'Test Address',
        city: 'Bogotá'
      });

      component.onSubmit();

      expect(component.loading()).toBe(false);
    });

    it('should not submit invalid form', () => {
      component.proveedorForm.get('razonSocial')?.setValue('');
      component.proveedorForm.get('ruc')?.setValue('');

      component.onSubmit();

      expect(mockCreateProveedorUseCase.execute).not.toHaveBeenCalled();
    });

    it('should mark form controls as touched when form is invalid', () => {
      component.proveedorForm.get('razonSocial')?.setValue('');
      const razonSocialControl = component.proveedorForm.get('razonSocial');
      expect(razonSocialControl?.touched).toBe(false);

      component.onSubmit();

      expect(razonSocialControl?.touched).toBe(true);
    });
  });

  describe('Navigation', () => {
    it('should close dialog on cancel', () => {
      component.onCancel();

      expect(mockDialogRef.close).toHaveBeenCalledWith(false);
    });
  });

  describe('Form Validation', () => {
    it('should validate razonSocial field', () => {
      const razonSocialControl = component.proveedorForm.get('razonSocial');

      razonSocialControl?.setValue('');
      razonSocialControl?.markAsTouched();
      expect(component.getFieldError('razonSocial')).toContain('VALIDATION.REQUIRED');

      razonSocialControl?.setValue('AB');
      expect(component.getFieldError('razonSocial')).toContain('VALIDATION.MIN_LENGTH');

      razonSocialControl?.setValue('Valid Company Name');
      expect(component.getFieldError('razonSocial')).toBe('');
    });

    it('should validate RUC field', () => {
      const rucControl = component.proveedorForm.get('ruc');

      rucControl?.setValue('');
      rucControl?.markAsTouched();
      expect(component.getFieldError('ruc')).toContain('VALIDATION.REQUIRED');

      rucControl?.setValue('123');
      expect(component.getFieldError('ruc')).toContain('VALIDATION.MIN_LENGTH');

      rucControl?.setValue('abc123');
      expect(component.getFieldError('ruc')).toContain('VALIDATION.MIN_LENGTH'); // minlength se valida primero

      rucControl?.setValue('12345678901');
      expect(component.getFieldError('ruc')).toBe('');
    });

    it('should validate telefono field', () => {
      const telefonoControl = component.proveedorForm.get('telefono');

      telefonoControl?.setValue('');
      telefonoControl?.markAsTouched();
      expect(component.getFieldError('telefono')).toContain('VALIDATION.REQUIRED');

      telefonoControl?.setValue('123');
      expect(component.getFieldError('telefono')).toContain('VALIDATION.MIN_LENGTH');

      telefonoControl?.setValue('1234567');
      expect(component.getFieldError('telefono')).toBe('');
    });

    it('should validate correoContacto field', () => {
      const correoControl = component.proveedorForm.get('correoContacto');

      correoControl?.setValue('');
      correoControl?.markAsTouched();
      expect(component.getFieldError('correoContacto')).toContain('VALIDATION.REQUIRED');

      correoControl?.setValue('invalid-email');
      expect(component.getFieldError('correoContacto')).toContain('VALIDATION.INVALID_EMAIL');

      correoControl?.setValue('valid@email.com');
      expect(component.getFieldError('correoContacto')).toBe('');
    });

    it('should validate website field', () => {
      const websiteControl = component.proveedorForm.get('website');

      websiteControl?.setValue('invalid');
      websiteControl?.markAsTouched();
      expect(component.getFieldError('website')).toContain('VALIDATION.INVALID_WEBSITE');

      websiteControl?.setValue('example.com');
      expect(component.getFieldError('website')).toBe('');

      websiteControl?.setValue('');
      expect(component.getFieldError('website')).toBe('');
    });

    it('should return empty string for untouched fields', () => {
      const razonSocialControl = component.proveedorForm.get('razonSocial');
      razonSocialControl?.setValue('');

      expect(component.getFieldError('razonSocial')).toBe('');
    });

    it('should return empty string for valid fields', () => {
      const razonSocialControl = component.proveedorForm.get('razonSocial');
      razonSocialControl?.setValue('Valid Company');
      razonSocialControl?.markAsTouched();

      expect(component.getFieldError('razonSocial')).toBe('');
    });
  });
});
