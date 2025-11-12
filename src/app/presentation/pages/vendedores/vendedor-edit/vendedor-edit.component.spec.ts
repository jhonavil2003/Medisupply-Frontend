import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { VendedorEditComponent } from './vendedor-edit.component';
import {
  GetVendedorByIdUseCase,
  UpdateVendedorUseCase
} from '../../../../core/application/use-cases/vendedor/vendedor.use-cases';
import { NotificationService } from '../../../shared/services/notification.service';
import { VendedorEntity } from '../../../../core/domain/entities/vendedor.entity';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('VendedorEditComponent', () => {
  let component: VendedorEditComponent;
  let fixture: ComponentFixture<VendedorEditComponent>;
  let mockGetVendedorByIdUseCase: jest.Mocked<GetVendedorByIdUseCase>;
  let mockUpdateVendedorUseCase: jest.Mocked<UpdateVendedorUseCase>;
  let mockNotificationService: jest.Mocked<NotificationService>;
  let mockDialogRef: jest.Mocked<MatDialogRef<VendedorEditComponent>>;

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
    mockGetVendedorByIdUseCase = {
      execute: jest.fn()
    } as any;
    
    mockUpdateVendedorUseCase = {
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
      imports: [VendedorEditComponent, NoopAnimationsModule],
      providers: [
        { provide: GetVendedorByIdUseCase, useValue: mockGetVendedorByIdUseCase },
        { provide: UpdateVendedorUseCase, useValue: mockUpdateVendedorUseCase },
        { provide: NotificationService, useValue: mockNotificationService },
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: { vendedorId: 1 } }
      ]
    }).compileComponents();
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      mockGetVendedorByIdUseCase.execute.mockReturnValue(of(mockVendedor));
      fixture = TestBed.createComponent(VendedorEditComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      
      expect(component).toBeTruthy();
    });

    it('should initialize with vendedorId from dialog data', () => {
      mockGetVendedorByIdUseCase.execute.mockReturnValue(of(mockVendedor));
      fixture = TestBed.createComponent(VendedorEditComponent);
      component = fixture.componentInstance;
      
      expect(component.vendedorId).toBe(1);
    });

    it('should initialize loading signal as false after loading', () => {
      mockGetVendedorByIdUseCase.execute.mockReturnValue(of(mockVendedor));
      fixture = TestBed.createComponent(VendedorEditComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      
      expect(component.loading()).toBe(false);
    });
  });

  describe('ngOnInit', () => {
    it('should load vendedor on initialization', () => {
      mockGetVendedorByIdUseCase.execute.mockReturnValue(of(mockVendedor));
      
      fixture = TestBed.createComponent(VendedorEditComponent);
      component = fixture.componentInstance;
      component.ngOnInit();
      
      expect(mockGetVendedorByIdUseCase.execute).toHaveBeenCalledWith(1);
    });
  });

  describe('loadVendedor', () => {
    beforeEach(() => {
      fixture = TestBed.createComponent(VendedorEditComponent);
      component = fixture.componentInstance;
    });

    it('should load vendedor successfully and populate form', () => {
      mockGetVendedorByIdUseCase.execute.mockReturnValue(of(mockVendedor));
      
      component.loadVendedor(1);
      
      expect(component.vendedorForm.get('employeeId')?.value).toBe('EMP001');
      expect(component.vendedorForm.get('firstName')?.value).toBe('Juan');
      expect(component.vendedorForm.get('lastName')?.value).toBe('Pérez');
      expect(component.vendedorForm.get('email')?.value).toBe('juan.perez@test.com');
      expect(component.vendedorForm.get('phone')?.value).toBe('+51987654321');
      expect(component.vendedorForm.get('territory')?.value).toBe('Lima Norte');
      expect(component.loading()).toBe(false);
    });

    it('should handle error when loading vendedor', () => {
      const error = new Error('Error al cargar');
      mockGetVendedorByIdUseCase.execute.mockReturnValue(throwError(() => error));
      
      component.loadVendedor(1);
      
      expect(mockNotificationService.error).toHaveBeenCalledWith('Error al cargar vendedor');
      expect(component.loading()).toBe(false);
    });

    it('should convert hireDate string to Date object', () => {
      mockGetVendedorByIdUseCase.execute.mockReturnValue(of(mockVendedor));
      
      component.loadVendedor(1);
      
      const hireDate = component.vendedorForm.get('hireDate')?.value;
      expect(hireDate).toBeInstanceOf(Date);
    });
  });

  describe('Form Submission', () => {
    beforeEach(() => {
      mockGetVendedorByIdUseCase.execute.mockReturnValue(of(mockVendedor));
      fixture = TestBed.createComponent(VendedorEditComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should update vendedor successfully', () => {
      mockUpdateVendedorUseCase.execute.mockReturnValue(of(mockVendedor));
      
      component.onSubmit();
      
      expect(mockUpdateVendedorUseCase.execute).toHaveBeenCalled();
      expect(mockNotificationService.success).toHaveBeenCalledWith('Vendedor actualizado exitosamente');
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
      
      expect(mockUpdateVendedorUseCase.execute).not.toHaveBeenCalled();
      expect(mockNotificationService.warning).toHaveBeenCalledWith(
        'Por favor complete los campos requeridos correctamente'
      );
    });

    it('should handle invalid vendedorId', () => {
      component.vendedorId = 0;
      
      component.onSubmit();
      
      expect(mockUpdateVendedorUseCase.execute).not.toHaveBeenCalled();
      expect(mockNotificationService.error).toHaveBeenCalledWith('ID de vendedor no válido');
    });

    it('should handle error with message', () => {
      const error = { message: 'Error de validación específico' };
      mockUpdateVendedorUseCase.execute.mockReturnValue(throwError(() => error));
      
      component.onSubmit();
      
      expect(mockNotificationService.error).toHaveBeenCalledWith('Error de validación específico');
      expect(component.loading()).toBe(false);
    });

    it('should handle 400 error (duplicate email/ID)', () => {
      const error = { status: 400 };
      mockUpdateVendedorUseCase.execute.mockReturnValue(throwError(() => error));
      
      component.onSubmit();
      
      expect(mockNotificationService.error).toHaveBeenCalledWith('El ID de empleado o email ya existe');
      expect(component.loading()).toBe(false);
    });

    it('should handle HTTP error with status text', () => {
      const error = { status: 500, statusText: 'Internal Server Error' };
      mockUpdateVendedorUseCase.execute.mockReturnValue(throwError(() => error));
      
      component.onSubmit();
      
      expect(mockNotificationService.error).toHaveBeenCalledWith('Error del servidor: Internal Server Error');
      expect(component.loading()).toBe(false);
    });

    it('should handle generic error', () => {
      const error = {};
      mockUpdateVendedorUseCase.execute.mockReturnValue(throwError(() => error));
      
      component.onSubmit();
      
      expect(mockNotificationService.error).toHaveBeenCalledWith('Error al actualizar vendedor');
      expect(component.loading()).toBe(false);
    });

    it('should format hire date correctly', () => {
      // Usar fecha local explícitamente para evitar problemas de zona horaria
      const testDate = new Date(2024, 0, 15); // año, mes (0-11), día
      component.vendedorForm.patchValue({
        hireDate: testDate
      });

      mockUpdateVendedorUseCase.execute.mockReturnValue(of(mockVendedor));
      
      component.onSubmit();
      
      const callArg = mockUpdateVendedorUseCase.execute.mock.calls[0][0];
      expect(callArg.hireDate).toBe('2024-01-15');
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

  describe('Navigation', () => {
    beforeEach(() => {
      mockGetVendedorByIdUseCase.execute.mockReturnValue(of(mockVendedor));
      fixture = TestBed.createComponent(VendedorEditComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should close dialog when cancel is called', () => {
      component.cancel();
      expect(mockDialogRef.close).toHaveBeenCalledWith(false);
    });
  });

  describe('Form Validation', () => {
    beforeEach(() => {
      mockGetVendedorByIdUseCase.execute.mockReturnValue(of(mockVendedor));
      fixture = TestBed.createComponent(VendedorEditComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should validate employeeId required', () => {
      const control = component.vendedorForm.get('employeeId');
      control?.setValue('');
      control?.markAsTouched();
      
      expect(control?.hasError('required')).toBeTruthy();
      expect(component.getErrorMessage('employeeId')).toBe('Este campo es requerido');
    });

    it('should validate employeeId minlength', () => {
      const control = component.vendedorForm.get('employeeId');
      control?.setValue('E');
      control?.markAsTouched();
      
      expect(control?.hasError('minlength')).toBeTruthy();
      expect(component.getErrorMessage('employeeId')).toBe('Mínimo 2 caracteres');
    });

    it('should validate email format', () => {
      const control = component.vendedorForm.get('email');
      control?.setValue('invalid-email');
      control?.markAsTouched();
      
      expect(control?.hasError('email')).toBeTruthy();
      expect(component.getErrorMessage('email')).toBe('Correo electrónico inválido');
    });

    it('should validate phone pattern', () => {
      const control = component.vendedorForm.get('phone');
      control?.setValue('invalid-phone');
      control?.markAsTouched();
      
      expect(control?.hasError('pattern')).toBeTruthy();
      expect(component.getErrorMessage('phone')).toBe('Formato de teléfono inválido');
    });

    it('should accept valid phone format', () => {
      const control = component.vendedorForm.get('phone');
      control?.setValue('+51987654321');
      
      expect(control?.valid).toBeTruthy();
    });

    it('should validate maxlength', () => {
      const control = component.vendedorForm.get('employeeId');
      control?.setValue('a'.repeat(51));
      
      expect(control?.hasError('maxlength')).toBeTruthy();
      expect(component.getErrorMessage('employeeId')).toBe('Máximo 50 caracteres');
    });
  });
});
