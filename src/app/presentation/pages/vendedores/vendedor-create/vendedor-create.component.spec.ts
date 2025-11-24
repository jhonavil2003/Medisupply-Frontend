import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { VendedorCreateComponent } from './vendedor-create.component';
import { CreateVendedorUseCase } from '../../../../core/application/use-cases/vendedor/vendedor.use-cases';
import { NotificationService } from '../../../shared/services/notification.service';
import { VendedorEntity } from '../../../../core/domain/entities/vendedor.entity';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { AuthService } from '../../../shared/services/auth.service';

describe('VendedorCreateComponent', () => {
  let component: VendedorCreateComponent;
  let fixture: ComponentFixture<VendedorCreateComponent>;
  let mockCreateVendedorUseCase: jest.Mocked<CreateVendedorUseCase>;
  let mockNotificationService: jest.Mocked<NotificationService>;
  let mockDialogRef: jest.Mocked<MatDialogRef<VendedorCreateComponent>>;

  const mockVendedor: VendedorEntity = {
    id: 1,
    employeeId: 'EMP001',
    firstName: 'Juan',
    lastName: 'Pérez',
    email: 'juan.perez@test.com',
    phone: '+51987654321',
    territory: 'Lima Norte',
    isActive: true,
    hireDate: '2024-01-15'
  };

  let mockAuthService: any;

  beforeEach(async () => {
    mockCreateVendedorUseCase = {
      execute: jest.fn()
    } as any;
    
    mockNotificationService = {
      success: jest.fn(),
      error: jest.fn(),
      warning: jest.fn()
    } as any;
    
    mockDialogRef = {
      close: jest.fn()
    } as any;

    mockAuthService = {
      register: jest.fn().mockResolvedValue(undefined)
    };

    await TestBed.configureTestingModule({
      imports: [VendedorCreateComponent, NoopAnimationsModule, TranslateModule.forRoot()],
      providers: [
        { provide: CreateVendedorUseCase, useValue: mockCreateVendedorUseCase },
        { provide: NotificationService, useValue: mockNotificationService },
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: AuthService, useValue: mockAuthService },
        TranslateService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(VendedorCreateComponent);
    component = fixture.componentInstance;
    
    // Mock TranslateService instant method para las pruebas
    const translateService = TestBed.inject(TranslateService);
    jest.spyOn(translateService, 'instant').mockImplementation((key: string | string[], interpolateParams?: any) => {
      if (Array.isArray(key)) {
        return key[0];
      }
      return key;
    });
    
    fixture.detectChanges();
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize form with default values', () => {
      expect(component.vendedorForm).toBeDefined();
      expect(component.vendedorForm.get('userName')?.value).toBe('');
      expect(component.vendedorForm.get('firstName')?.value).toBe('');
      expect(component.vendedorForm.get('lastName')?.value).toBe('');
      expect(component.vendedorForm.get('email')?.value).toBe('');
      expect(component.vendedorForm.get('phone')?.value).toBe('');
      expect(component.vendedorForm.get('territory')?.value).toBe('');
    });

    it('should initialize loading signal as false', () => {
      expect(component.loading()).toBe(false);
    });

    it('should have form validators configured', () => {
      const userNameControl = component.vendedorForm.get('userName');
      const firstNameControl = component.vendedorForm.get('firstName');
      const emailControl = component.vendedorForm.get('email');

      userNameControl?.markAsTouched();
      firstNameControl?.markAsTouched();
      emailControl?.markAsTouched();

      expect(userNameControl?.hasError('required')).toBe(true);
      expect(firstNameControl?.hasError('required')).toBe(true);
      expect(emailControl?.hasError('required')).toBe(true);
    });
  });

  describe('Form Submission', () => {
    it('should create vendedor successfully', () => {
      component.vendedorForm.patchValue({
        userName: 'jperez',
        firstName: 'Juan',
        lastName: 'Pérez',
        email: 'juan.perez@test.com',
        phone: '+51987654321',
        territory: 'Lima Norte'
      });

      expect(component.vendedorForm.valid).toBeTruthy();
    });

    it('should require userName', () => {
      const control = component.vendedorForm.get('userName');
      control?.markAsTouched();
      expect(control?.hasError('required')).toBeTruthy();
      
      control?.setValue('J');
      expect(control?.hasError('minlength')).toBeTruthy();
      
      control?.setValue('jperez');
      expect(control?.valid).toBeTruthy();
    });

    it('should require firstName with min length', () => {
      const control = component.vendedorForm.get('firstName');
      expect(control?.hasError('required')).toBeTruthy();
      
      control?.setValue('J');
      expect(control?.hasError('minlength')).toBeTruthy();
      
      control?.setValue('Juan');
      expect(control?.valid).toBeTruthy();
    });

    it('should require valid email', () => {
      const control = component.vendedorForm.get('email');
      expect(control?.hasError('required')).toBeTruthy();
      
      control?.setValue('invalid-email');
      expect(control?.hasError('email')).toBeTruthy();
      
      control?.setValue('juan.perez@test.com');
      expect(control?.valid).toBeTruthy();
    });
  });

  describe('onSubmit', () => {
    beforeEach(() => {
      component.vendedorForm.patchValue({
        userName: 'jperez',
        firstName: 'Juan',
        lastName: 'Pérez',
        email: 'juan.perez@test.com',
        phone: '+51987654321',
        territory: 'Lima Norte'
      });
    });

    it('should create vendedor successfully', async () => {
      mockAuthService.register.mockResolvedValue(undefined);

      await component.onSubmit();

      expect(mockAuthService.register).toHaveBeenCalled();
      expect(mockNotificationService.success).toHaveBeenCalledWith('SALESPERSONS.CREATE_SUCCESS');
      expect(mockDialogRef.close).toHaveBeenCalledWith(true);
      expect(component.loading()).toBe(false);
    });

    it('should not submit invalid form', async () => {
      component.vendedorForm.patchValue({
        userName: '',
        firstName: '',
        lastName: '',
        email: ''
      });

      await component.onSubmit();

      expect(mockAuthService.register).not.toHaveBeenCalled();
      expect(mockNotificationService.warning).toHaveBeenCalled();
    });

    it('should handle 400 error (duplicate email/ID)', async () => {
      const error = { message: 'Usuario ya existe' };
      mockAuthService.register.mockRejectedValue(error);

      await component.onSubmit();

      expect(mockNotificationService.warning).toHaveBeenCalled();
      expect(component.loading()).toBe(false);
    });

    it('should handle generic error', async () => {
      const error = { message: 'Error interno del servidor' };
      mockAuthService.register.mockRejectedValue(error);

      await component.onSubmit();

      expect(mockNotificationService.warning).toHaveBeenCalled();
      expect(component.loading()).toBe(false);
    });

    it('should handle error without message', async () => {
      mockAuthService.register.mockRejectedValue({});

      await component.onSubmit();

      expect(mockNotificationService.warning).toHaveBeenCalledWith('Error en el registro');
      expect(component.loading()).toBe(false);
    });

    it('should handle error with message', async () => {
      const error = { message: 'Error de validación específico' };
      mockAuthService.register.mockRejectedValue(error);

      await component.onSubmit();

      expect(mockNotificationService.warning).toHaveBeenCalledWith('Error de validación específico');
      expect(component.loading()).toBe(false);
    });

    it('should mark form as touched when invalid', async () => {
      component.vendedorForm.patchValue({
        userName: '',
        firstName: '',
        lastName: '',
        email: ''
      });

      const markAllAsTouchedSpy = jest.spyOn(component.vendedorForm, 'markAllAsTouched');

      await component.onSubmit();

      expect(markAllAsTouchedSpy).toHaveBeenCalled();
    });
  });

  describe('cancel', () => {
    it('should close dialog when cancel is called', () => {
      component.cancel();
      expect(mockDialogRef.close).toHaveBeenCalledWith(false);
    });
  });

  describe('getErrorMessage', () => {
    it('should return required error message', () => {
      const control = component.vendedorForm.get('userName');
      control?.setValue('');
      control?.markAsTouched();

      expect(component.getErrorMessage('userName')).toBe('VALIDATION.REQUIRED');
    });

    it('should return minlength error message', () => {
      const control = component.vendedorForm.get('firstName');
      control?.setValue('J');
      control?.markAsTouched();

      expect(component.getErrorMessage('firstName')).toBe('VALIDATION.MIN_LENGTH');
    });

    it('should return maxlength error message', () => {
      const control = component.vendedorForm.get('userName');
      control?.setValue('a'.repeat(101));
      control?.markAsTouched();

      expect(component.getErrorMessage('userName')).toBe('VALIDATION.MAX_LENGTH');
    });

    it('should return email error message', () => {
      const control = component.vendedorForm.get('email');
      control?.setValue('invalid-email');
      control?.markAsTouched();

      expect(component.getErrorMessage('email')).toBe('VALIDATION.INVALID_EMAIL');
    });

    it('should return phone pattern error message', () => {
      const control = component.vendedorForm.get('phone');
      control?.setValue('invalid@phone');
      control?.markAsTouched();

      expect(component.getErrorMessage('phone')).toBe('VALIDATION.INVALID_PHONE');
    });

    it('should return generic pattern error message', () => {
      const control = component.vendedorForm.get('territory');
      control?.setErrors({ pattern: true });
      control?.markAsTouched();

      expect(component.getErrorMessage('territory')).toBe('VALIDATION.INVALID_FORMAT');
    });

    it('should return empty string when no errors', () => {
      const control = component.vendedorForm.get('userName');
      control?.setValue('validuser');
      control?.markAsTouched();

      expect(component.getErrorMessage('userName')).toBe('');
    });
  });
});
