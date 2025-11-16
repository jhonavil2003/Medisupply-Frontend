import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MockTranslateService } from '../../../../../testing/translate.mock';
import { VendedorCreateComponent } from './vendedor-create.component';
import { CreateVendedorUseCase } from '../../../../core/application/use-cases/vendedor/vendedor.use-cases';
import { NotificationService } from '../../../shared/services/notification.service';
import { VendedorEntity } from '../../../../core/domain/entities/vendedor.entity';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

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

    await TestBed.configureTestingModule({
      imports: [VendedorCreateComponent, NoopAnimationsModule, TranslateModule.forRoot()],
      providers: [
        { provide: CreateVendedorUseCase, useValue: mockCreateVendedorUseCase },
        { provide: NotificationService, useValue: mockNotificationService },
        { provide: MatDialogRef, useValue: mockDialogRef }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(VendedorCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize form with default values', () => {
      expect(component.vendedorForm).toBeDefined();
      expect(component.vendedorForm.get('employeeId')?.value).toBe('');
      expect(component.vendedorForm.get('firstName')?.value).toBe('');
      expect(component.vendedorForm.get('lastName')?.value).toBe('');
      expect(component.vendedorForm.get('email')?.value).toBe('');
      expect(component.vendedorForm.get('isActive')?.value).toBe(true);
    });

    it('should initialize loading signal as false', () => {
      expect(component.loading()).toBe(false);
    });

    it('should have form validators configured', () => {
      const employeeIdControl = component.vendedorForm.get('employeeId');
      const firstNameControl = component.vendedorForm.get('firstName');
      const emailControl = component.vendedorForm.get('email');

      expect(employeeIdControl?.hasError('required')).toBe(true);
      expect(firstNameControl?.hasError('required')).toBe(true);
      expect(emailControl?.hasError('required')).toBe(true);
    });
  });

  describe('Form Submission', () => {
    it('should create vendedor successfully', () => {
      mockCreateVendedorUseCase.execute.mockReturnValue(of(mockVendedor));

      component.vendedorForm.patchValue({
        employeeId: 'EMP001',
        firstName: 'Juan',
        lastName: 'Pérez',
        email: 'juan.perez@test.com'
      });

      expect(component.vendedorForm.valid).toBeTruthy();
    });

    it('should require employeeId', () => {
      const control = component.vendedorForm.get('employeeId');
      expect(control?.hasError('required')).toBeTruthy();
      
      control?.setValue('E');
      expect(control?.hasError('minlength')).toBeTruthy();
      
      control?.setValue('EMP001');
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
        employeeId: 'EMP001',
        firstName: 'Juan',
        lastName: 'Pérez',
        email: 'juan.perez@test.com',
        phone: '+51987654321',
        territory: 'Lima Norte'
      });
    });

    it('should create vendedor successfully', () => {
      mockCreateVendedorUseCase.execute.mockReturnValue(of(mockVendedor));

      component.onSubmit();

      expect(mockCreateVendedorUseCase.execute).toHaveBeenCalled();
      expect(mockNotificationService.success).toHaveBeenCalledWith('SALESPERSONS.CREATE_SUCCESS');
      expect(mockDialogRef.close).toHaveBeenCalledWith(true);
      expect(component.loading()).toBe(false);
    });

    it('should not submit invalid form', () => {
      component.vendedorForm.patchValue({
        employeeId: '',
        firstName: '',
        lastName: '',
        email: ''
      });

      component.onSubmit();

      expect(mockCreateVendedorUseCase.execute).not.toHaveBeenCalled();
      expect(mockNotificationService.warning).toHaveBeenCalled();
    });

    it('should handle 400 error (duplicate email/ID)', () => {
      const error = { status: 400 };
      mockCreateVendedorUseCase.execute.mockReturnValue(throwError(() => error));

      component.onSubmit();

      expect(mockNotificationService.error).toHaveBeenCalled();
      expect(component.loading()).toBe(false);
    });

    it('should handle generic error', () => {
      const error = { status: 500, statusText: 'Internal Server Error' };
      mockCreateVendedorUseCase.execute.mockReturnValue(throwError(() => error));

      component.onSubmit();

      expect(mockNotificationService.error).toHaveBeenCalled();
      expect(component.loading()).toBe(false);
    });

    it('should format hire date correctly', () => {
      // Usar fecha local explícitamente para evitar problemas de zona horaria
      const testDate = new Date(2024, 0, 15); // año, mes (0-11), día
      component.vendedorForm.patchValue({
        hireDate: testDate
      });

      mockCreateVendedorUseCase.execute.mockReturnValue(of(mockVendedor));

      component.onSubmit();

      const callArg = mockCreateVendedorUseCase.execute.mock.calls[0][0];
      expect(callArg.hireDate).toBe('2024-01-15');
    });

    it('should handle error with message', () => {
      const error = { message: 'Error de validación específico' };
      mockCreateVendedorUseCase.execute.mockReturnValue(throwError(() => error));

      component.onSubmit();

      expect(mockNotificationService.error).toHaveBeenCalled();
      expect(component.loading()).toBe(false);
    });

    it('should mark form as touched when invalid', () => {
      component.vendedorForm.patchValue({
        employeeId: '',
        firstName: '',
        lastName: '',
        email: ''
      });

      const markAllAsTouchedSpy = jest.spyOn(component.vendedorForm, 'markAllAsTouched');

      component.onSubmit();

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
      const control = component.vendedorForm.get('employeeId');
      control?.setErrors({ required: true });
      control?.markAsTouched();

      expect(component.getErrorMessage('employeeId')).toBe('VALIDATION.REQUIRED');
    });

    it('should return minlength error message', () => {
      const control = component.vendedorForm.get('firstName');
      control?.setErrors({ minlength: { requiredLength: 2, actualLength: 1 } });

      expect(component.getErrorMessage('firstName')).toBe('VALIDATION.MIN_LENGTH');
    });

    it('should return maxlength error message', () => {
      const control = component.vendedorForm.get('employeeId');
      control?.setErrors({ maxlength: { requiredLength: 50, actualLength: 51 } });

      expect(component.getErrorMessage('employeeId')).toBe('VALIDATION.MAX_LENGTH');
    });

    it('should return email error message', () => {
      const control = component.vendedorForm.get('email');
      control?.setErrors({ email: true });

      expect(component.getErrorMessage('email')).toBe('VALIDATION.INVALID_EMAIL');
    });

    it('should return phone pattern error message', () => {
      const control = component.vendedorForm.get('phone');
      control?.setErrors({ pattern: true });

      expect(component.getErrorMessage('phone')).toBe('VALIDATION.INVALID_PHONE');
    });

    it('should return generic pattern error message', () => {
      const control = component.vendedorForm.get('territory');
      control?.setErrors({ pattern: true });

      expect(component.getErrorMessage('territory')).toBe('VALIDATION.INVALID_FORMAT');
    });
  });
});
