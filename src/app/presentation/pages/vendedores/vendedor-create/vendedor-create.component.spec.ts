import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
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
  let mockRouter: jest.Mocked<Router>;

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
    
    mockRouter = {
      navigate: jest.fn()
    } as any;

    await TestBed.configureTestingModule({
      imports: [VendedorCreateComponent, NoopAnimationsModule],
      providers: [
        { provide: CreateVendedorUseCase, useValue: mockCreateVendedorUseCase },
        { provide: NotificationService, useValue: mockNotificationService },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(VendedorCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

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

  describe('form validation', () => {
    it('should be invalid when empty', () => {
      expect(component.vendedorForm.valid).toBeFalsy();
    });

    it('should be valid with required fields', () => {
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
      expect(mockNotificationService.success).toHaveBeenCalledWith('Vendedor creado exitosamente');
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/vendedores']);
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
      expect(mockNotificationService.warning).toHaveBeenCalledWith(
        'Por favor complete los campos requeridos correctamente'
      );
    });

    it('should handle 400 error (duplicate email/ID)', () => {
      const error = { status: 400 };
      mockCreateVendedorUseCase.execute.mockReturnValue(throwError(() => error));

      component.onSubmit();

      expect(mockNotificationService.error).toHaveBeenCalledWith('El ID de empleado o email ya existe');
      expect(component.loading()).toBe(false);
    });

    it('should handle generic error', () => {
      const error = { status: 500, statusText: 'Internal Server Error' };
      mockCreateVendedorUseCase.execute.mockReturnValue(throwError(() => error));

      component.onSubmit();

      expect(mockNotificationService.error).toHaveBeenCalledWith('Error del servidor: Internal Server Error');
      expect(component.loading()).toBe(false);
    });

    it('should format hire date correctly', () => {
      const testDate = new Date('2024-01-15');
      component.vendedorForm.patchValue({
        hireDate: testDate
      });

      mockCreateVendedorUseCase.execute.mockReturnValue(of(mockVendedor));

      component.onSubmit();

      const callArg = mockCreateVendedorUseCase.execute.mock.calls[0][0];
      expect(callArg.hireDate).toBe('2024-01-15');
    });
  });

  describe('cancel', () => {
    it('should navigate back to vendedores list', () => {
      component.cancel();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/vendedores']);
    });
  });

  describe('getErrorMessage', () => {
    it('should return required error message', () => {
      const control = component.vendedorForm.get('employeeId');
      control?.setErrors({ required: true });
      control?.markAsTouched();

      expect(component.getErrorMessage('employeeId')).toBe('Este campo es requerido');
    });

    it('should return minlength error message', () => {
      const control = component.vendedorForm.get('firstName');
      control?.setErrors({ minlength: { requiredLength: 2, actualLength: 1 } });

      expect(component.getErrorMessage('firstName')).toBe('Mínimo 2 caracteres');
    });

    it('should return email error message', () => {
      const control = component.vendedorForm.get('email');
      control?.setErrors({ email: true });

      expect(component.getErrorMessage('email')).toBe('Email inválido');
    });
  });
});
