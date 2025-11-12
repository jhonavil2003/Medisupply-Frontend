import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError, Subject } from 'rxjs';

import { ProveedorEditComponent } from './proveedor-edit.component';
import { GetProveedorByIdUseCase } from '../../core/application/use-cases/proveedor/get-proveedor-by-id.use-case';
import { UpdateProveedorUseCase } from '../../core/application/use-cases/proveedor/update-proveedor.use-case';
import { ProveedorEntity, EstadoProveedor } from '../../core/domain/entities/proveedor.entity';

// Material modules
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

describe('ProveedorEditComponent', () => {
  let component: ProveedorEditComponent;
  let fixture: ComponentFixture<ProveedorEditComponent>;
  let mockDialogRef: any;
  let mockGetProveedorByIdUseCase: any;
  let mockUpdateProveedorUseCase: any;

  const mockProveedor: ProveedorEntity = {
    id: '1',
    razonSocial: 'Test Company',
    ruc: '12345678901',
    country: 'Colombia',
    telefono: '1234567890',
    correoContacto: 'test@test.com',
    website: 'test.com',
    currency: 'USD',
    addressLine1: 'Test Address Line 1',
    city: 'Bogotá',
    state: 'Cundinamarca',
    paymentTerms: 'Net 30',
    creditLimit: 10000.00,
    estado: EstadoProveedor.ACTIVO,
    certificacionesVigentes: [],
    fechaRegistro: new Date('2025-01-01'),
    fechaActualizacion: new Date('2025-01-02')
  };

  beforeEach(async () => {
    const dialogRefSpy = {
      close: jest.fn()
    };

    const getProveedorByIdUseCaseSpy = {
      execute: jest.fn()
    };

    const updateProveedorUseCaseSpy = {
      execute: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [
        ProveedorEditComponent,
        ReactiveFormsModule,
        NoopAnimationsModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatButtonModule,
        MatIconModule,
        MatProgressSpinnerModule
      ],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MAT_DIALOG_DATA, useValue: { proveedorId: 1 } },
        { provide: GetProveedorByIdUseCase, useValue: getProveedorByIdUseCaseSpy },
        { provide: UpdateProveedorUseCase, useValue: updateProveedorUseCaseSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProveedorEditComponent);
    component = fixture.componentInstance;
    mockDialogRef = TestBed.inject(MatDialogRef);
    mockGetProveedorByIdUseCase = TestBed.inject(GetProveedorByIdUseCase);
    mockUpdateProveedorUseCase = TestBed.inject(UpdateProveedorUseCase);
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with proveedorId from dialog data', () => {
      expect(component.proveedorId).toBe(1);
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
      expect(component.monedasDisponibles).toContain('USD');
      expect(component.monedasDisponibles).toContain('COP');
      expect(component.monedasDisponibles).toContain('EUR');
    });
  });

  describe('ngOnInit', () => {
    it('should load proveedor on initialization', () => {
      mockGetProveedorByIdUseCase.execute.mockReturnValue(of(mockProveedor));

      component.ngOnInit();

      expect(mockGetProveedorByIdUseCase.execute).toHaveBeenCalledWith('1');
    });
  });

  describe('loadProveedor', () => {
    it('should load proveedor successfully', () => {
      mockGetProveedorByIdUseCase.execute.mockReturnValue(of(mockProveedor));

      component.loadProveedor();

      expect(component.originalProveedor).toEqual(mockProveedor);
      expect(component.proveedorForm.get('razonSocial')?.value).toBe(mockProveedor.razonSocial);
      expect(component.proveedorForm.get('ruc')?.value).toBe(mockProveedor.ruc);
    });

    it('should handle loading state correctly', () => {
      const proveedorSubject = new Subject<ProveedorEntity>();
      mockGetProveedorByIdUseCase.execute.mockReturnValue(proveedorSubject.asObservable());

      component.loadProveedor();

      proveedorSubject.next(mockProveedor);
      proveedorSubject.complete();
    });

    it('should handle error when loading proveedor', () => {
      const errorMessage = 'Proveedor not found';
      mockGetProveedorByIdUseCase.execute.mockReturnValue(throwError(() => new Error(errorMessage)));

      component.loadProveedor();

      expect(mockDialogRef.close).not.toHaveBeenCalled(); // No se cierra en error, solo se muestra en console
    });
  });

  describe('Form Submission', () => {
    beforeEach(() => {
      mockGetProveedorByIdUseCase.execute.mockReturnValue(of(mockProveedor));
      component.ngOnInit();
    });

    it('should submit valid form successfully', () => {
      mockUpdateProveedorUseCase.execute.mockReturnValue(of(mockProveedor));

      // Make a change to trigger update
      component.proveedorForm.get('razonSocial')?.setValue('Updated Company Name');

      component.onSubmit();

      expect(component.loading()).toBe(false);
      expect(mockDialogRef.close).toHaveBeenCalledWith(true);
    });

    it('should handle loading state during submission', () => {
      const updateSubject = new Subject<ProveedorEntity>();
      mockUpdateProveedorUseCase.execute.mockReturnValue(updateSubject.asObservable());

      // Make a change to trigger update
      component.proveedorForm.get('razonSocial')?.setValue('Updated Company Name');

      component.onSubmit();

      expect(component.loading()).toBe(true);

      updateSubject.next(mockProveedor);
      updateSubject.complete();

      expect(component.loading()).toBe(false);
    });

    it('should handle submission error', () => {
      const errorMessage = 'Update failed';
      mockUpdateProveedorUseCase.execute.mockReturnValue(throwError(() => new Error(errorMessage)));

      // Make a change to trigger update
      component.proveedorForm.get('razonSocial')?.setValue('Updated Company Name');

      component.onSubmit();

      expect(component.loading()).toBe(false);
    });

    it('should not submit invalid form', () => {
      component.proveedorForm.get('razonSocial')?.setValue('');
      component.proveedorForm.get('ruc')?.setValue('');

      component.onSubmit();

      expect(mockUpdateProveedorUseCase.execute).not.toHaveBeenCalled();
    });

    it('should mark form controls as touched when form is invalid', () => {
      component.proveedorForm.get('razonSocial')?.setValue('');
      const razonSocialControl = component.proveedorForm.get('razonSocial');
      expect(razonSocialControl?.touched).toBe(false);

      component.onSubmit();

      expect(razonSocialControl?.touched).toBe(true);
    });

    it('should close dialog without saving when no fields changed', () => {
      // Don't make any changes
      component.onSubmit();

      expect(mockUpdateProveedorUseCase.execute).not.toHaveBeenCalled();
      expect(mockDialogRef.close).toHaveBeenCalledWith(false);
    });
  });

  describe('Navigation', () => {
    it('should close dialog with false on cancel', () => {
      component.onCancel();

      expect(mockDialogRef.close).toHaveBeenCalledWith(false);
    });
  });

  describe('Form Validation', () => {
    it('should validate razonSocial field', () => {
      const razonSocialControl = component.proveedorForm.get('razonSocial');

      razonSocialControl?.setValue('');
      razonSocialControl?.markAsTouched();
      expect(component.getFieldError('razonSocial')).toBe('Este campo es requerido');

      razonSocialControl?.setValue('AB');
      expect(component.getFieldError('razonSocial')).toBe('Mínimo 3 caracteres');

      razonSocialControl?.setValue('Valid Company');
      expect(component.getFieldError('razonSocial')).toBe('');
    });

    it('should validate RUC field', () => {
      const rucControl = component.proveedorForm.get('ruc');

      rucControl?.setValue('');
      rucControl?.markAsTouched();
      expect(component.getFieldError('ruc')).toBe('Este campo es requerido');

      rucControl?.setValue('123');
      expect(component.getFieldError('ruc')).toBe('Mínimo 10 caracteres');

      rucControl?.setValue('12345678901');
      expect(component.getFieldError('ruc')).toBe('');
    });

    it('should validate telefono field', () => {
      const telefonoControl = component.proveedorForm.get('telefono');

      telefonoControl?.setValue('');
      telefonoControl?.markAsTouched();
      expect(component.getFieldError('telefono')).toBe('Este campo es requerido');

      telefonoControl?.setValue('123');
      expect(component.getFieldError('telefono')).toBe('Mínimo 7 caracteres');

      telefonoControl?.setValue('1234567');
      expect(component.getFieldError('telefono')).toBe('');
    });

    it('should validate correoContacto field', () => {
      const correoControl = component.proveedorForm.get('correoContacto');

      correoControl?.setValue('');
      correoControl?.markAsTouched();
      expect(component.getFieldError('correoContacto')).toBe('Este campo es requerido');

      correoControl?.setValue('invalid-email');
      expect(component.getFieldError('correoContacto')).toBe('Correo electrónico inválido');

      correoControl?.setValue('valid@email.com');
      expect(component.getFieldError('correoContacto')).toBe('');
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

  describe('Data Arrays', () => {
    it('should have all required currencies', () => {
      const expectedCurrencies = ['USD', 'COP', 'EUR'];

      expect(component.monedasDisponibles).toEqual(expectedCurrencies);
    });
  });
});
