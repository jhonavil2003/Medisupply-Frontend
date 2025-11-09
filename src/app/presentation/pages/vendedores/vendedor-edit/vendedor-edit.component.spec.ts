import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, ActivatedRoute } from '@angular/router';
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
  let mockRouter: jest.Mocked<Router>;
  let mockActivatedRoute: any;

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
    
    mockRouter = {
      navigate: jest.fn()
    } as any;

    mockActivatedRoute = {
      snapshot: {
        paramMap: {
          get: jest.fn().mockReturnValue('1')
        }
      }
    };

    await TestBed.configureTestingModule({
      imports: [VendedorEditComponent, NoopAnimationsModule],
      providers: [
        { provide: GetVendedorByIdUseCase, useValue: mockGetVendedorByIdUseCase },
        { provide: UpdateVendedorUseCase, useValue: mockUpdateVendedorUseCase },
        { provide: NotificationService, useValue: mockNotificationService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents();
  });

  it('should create', () => {
    mockGetVendedorByIdUseCase.execute.mockReturnValue(of(mockVendedor));
    fixture = TestBed.createComponent(VendedorEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should load vendedor and populate form', () => {
      mockGetVendedorByIdUseCase.execute.mockReturnValue(of(mockVendedor));
      
      fixture = TestBed.createComponent(VendedorEditComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(mockGetVendedorByIdUseCase.execute).toHaveBeenCalledWith(1);
      expect(component.vendedorId).toBe(1);
      expect(component.vendedorForm.get('employeeId')?.value).toBe('EMP001');
      expect(component.vendedorForm.get('firstName')?.value).toBe('Juan');
      expect(component.vendedorForm.get('lastName')?.value).toBe('Pérez');
      expect(component.vendedorForm.get('email')?.value).toBe('juan.perez@test.com');
      expect(component.loading()).toBe(false);
    });

    it('should navigate to vendedores if no ID in route', () => {
      mockActivatedRoute.snapshot.paramMap.get.mockReturnValue(null);
      
      fixture = TestBed.createComponent(VendedorEditComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(mockNotificationService.error).toHaveBeenCalledWith('ID de vendedor no válido');
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/vendedores']);
    });

    it('should handle vendedor not found', () => {
      mockGetVendedorByIdUseCase.execute.mockReturnValue(of(null));
      
      fixture = TestBed.createComponent(VendedorEditComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(mockNotificationService.error).toHaveBeenCalledWith('Vendedor no encontrado');
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/vendedores']);
    });

    it('should handle error loading vendedor', () => {
      const error = new Error('Load error');
      mockGetVendedorByIdUseCase.execute.mockReturnValue(throwError(() => error));
      
      fixture = TestBed.createComponent(VendedorEditComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(mockNotificationService.error).toHaveBeenCalledWith('Error al cargar vendedor');
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/vendedores']);
    });
  });

  describe('onSubmit', () => {
    beforeEach(() => {
      mockGetVendedorByIdUseCase.execute.mockReturnValue(of(mockVendedor));
      fixture = TestBed.createComponent(VendedorEditComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should update vendedor successfully', () => {
      component.vendedorForm.patchValue({
        firstName: 'Juan Carlos'
      });

      const updatedVendedor = { ...mockVendedor, firstName: 'Juan Carlos' };
      mockUpdateVendedorUseCase.execute.mockReturnValue(of(updatedVendedor));

      component.onSubmit();

      expect(mockUpdateVendedorUseCase.execute).toHaveBeenCalled();
      expect(mockNotificationService.success).toHaveBeenCalledWith('Vendedor actualizado exitosamente');
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/vendedores']);
      expect(component.loading()).toBe(false);
    });

    it('should not submit invalid form', () => {
      component.vendedorForm.patchValue({
        email: 'invalid-email'
      });

      component.onSubmit();

      expect(mockUpdateVendedorUseCase.execute).not.toHaveBeenCalled();
      expect(mockNotificationService.warning).toHaveBeenCalledWith(
        'Por favor complete los campos requeridos correctamente'
      );
    });

    it('should handle 400 error (duplicate email/ID)', () => {
      const error = { status: 400 };
      mockUpdateVendedorUseCase.execute.mockReturnValue(throwError(() => error));

      component.onSubmit();

      expect(mockNotificationService.error).toHaveBeenCalledWith('El ID de empleado o email ya existe');
      expect(component.loading()).toBe(false);
    });

    it('should handle generic error', () => {
      const error = { status: 500, statusText: 'Internal Server Error' };
      mockUpdateVendedorUseCase.execute.mockReturnValue(throwError(() => error));

      component.onSubmit();

      expect(mockNotificationService.error).toHaveBeenCalledWith('Error del servidor: Internal Server Error');
      expect(component.loading()).toBe(false);
    });

    it('should include vendedor ID in update', () => {
      mockUpdateVendedorUseCase.execute.mockReturnValue(of(mockVendedor));

      component.onSubmit();

      const callArg = mockUpdateVendedorUseCase.execute.mock.calls[0][0];
      expect(callArg.id).toBe(1);
    });

    it('should format hire date correctly when updating', () => {
      const testDate = new Date('2024-02-20');
      component.vendedorForm.patchValue({
        hireDate: testDate
      });

      mockUpdateVendedorUseCase.execute.mockReturnValue(of(mockVendedor));

      component.onSubmit();

      const callArg = mockUpdateVendedorUseCase.execute.mock.calls[0][0];
      expect(callArg.hireDate).toBe('2024-02-20');
    });
  });

  describe('cancel', () => {
    beforeEach(() => {
      mockGetVendedorByIdUseCase.execute.mockReturnValue(of(mockVendedor));
      fixture = TestBed.createComponent(VendedorEditComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should navigate back to vendedores list', () => {
      component.cancel();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/vendedores']);
    });
  });

  describe('getErrorMessage', () => {
    beforeEach(() => {
      mockGetVendedorByIdUseCase.execute.mockReturnValue(of(mockVendedor));
      fixture = TestBed.createComponent(VendedorEditComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should return required error message', () => {
      const control = component.vendedorForm.get('employeeId');
      control?.setValue('');
      control?.markAsTouched();

      expect(component.getErrorMessage('employeeId')).toBe('Este campo es requerido');
    });

    it('should return minlength error message', () => {
      const control = component.vendedorForm.get('firstName');
      control?.setValue('J');

      expect(component.getErrorMessage('firstName')).toBe('Mínimo 2 caracteres');
    });

    it('should return email error message', () => {
      const control = component.vendedorForm.get('email');
      control?.setValue('invalid');

      expect(component.getErrorMessage('email')).toBe('Email inválido');
    });
  });
});
