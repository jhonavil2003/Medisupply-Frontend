import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { MetaEditComponent } from './meta-edit.component';
import {
  GetMetaByIdUseCase,
  UpdateMetaVentaUseCase
} from '../../../../core/application/use-cases/meta/meta-venta.use-cases';
import { NotificationService } from '../../../shared/services/notification.service';
import { VendedorRepository } from '../../../../core/domain/repositories/vendedor.repository';
import { ProductoRepository } from '../../../../core/domain/repositories/producto.repository';
import { MetaVentaEntity, Region, Trimestre, TipoMeta } from '../../../../core/domain/entities/meta-venta.entity';

describe('MetaEditComponent', () => {
  let component: MetaEditComponent;
  let fixture: ComponentFixture<MetaEditComponent>;
  let mockGetMetaByIdUseCase: jest.Mocked<GetMetaByIdUseCase>;
  let mockUpdateMetaUseCase: jest.Mocked<UpdateMetaVentaUseCase>;
  let mockNotificationService: jest.Mocked<NotificationService>;
  let mockRouter: jest.Mocked<Router>;
  let mockActivatedRoute: any;
  let mockVendedorRepository: jest.Mocked<VendedorRepository>;
  let mockProductoRepository: jest.Mocked<ProductoRepository>;

  const mockMeta: MetaVentaEntity = {
    id: 1,
    idVendedor: 'VE-01',
    idProducto: 'SKU-001',
    region: Region.NORTE,
    trimestre: Trimestre.Q1,
    valorObjetivo: 100000,
    tipo: TipoMeta.MONETARIO,
    vendedor: {
      employeeId: 'VE-01',
      nombreCompleto: 'Juan Pérez',
      email: 'juan.perez@test.com'
    },
    producto: {
      sku: 'SKU-001',
      name: 'Producto Test',
      description: 'Descripción test',
      unitPrice: 1000,
      isActive: true
    },
    fechaCreacion: '2025-01-15T10:00:00Z'
  };

  beforeEach(async () => {
    mockGetMetaByIdUseCase = {
      execute: jest.fn()
    } as any;

    mockUpdateMetaUseCase = {
      execute: jest.fn()
    } as any;

    mockNotificationService = {
      success: jest.fn(),
      error: jest.fn(),
      warning: jest.fn(),
      info: jest.fn()
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

    mockVendedorRepository = {
      getById: jest.fn().mockReturnValue(of({ id: 1, employeeId: 'VE-01' })),
      getByEmployeeId: jest.fn().mockReturnValue(of({ id: 1, employeeId: 'VE-01' }))
    } as any;

    mockProductoRepository = {
      getBySku: jest.fn().mockReturnValue(of({ id: 1, sku: 'SKU-001' }))
    } as any;

    await TestBed.configureTestingModule({
      imports: [MetaEditComponent, NoopAnimationsModule],
      providers: [
        { provide: GetMetaByIdUseCase, useValue: mockGetMetaByIdUseCase },
        { provide: UpdateMetaVentaUseCase, useValue: mockUpdateMetaUseCase },
        { provide: NotificationService, useValue: mockNotificationService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: VendedorRepository, useValue: mockVendedorRepository },
        { provide: ProductoRepository, useValue: mockProductoRepository }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MetaEditComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should initialize form and load meta', () => {
      mockGetMetaByIdUseCase.execute.mockReturnValue(of(mockMeta));

      fixture.detectChanges(); // triggers ngOnInit

      expect(component.metaForm).toBeDefined();
      expect(component.metaId).toBe(1);
      expect(mockGetMetaByIdUseCase.execute).toHaveBeenCalledWith(1);
    });

    it('should show error and navigate if ID is missing', () => {
      mockActivatedRoute.snapshot.paramMap.get.mockReturnValue(null);

      fixture.detectChanges(); // triggers ngOnInit

      expect(mockNotificationService.error).toHaveBeenCalledWith('ID de meta no válido');
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/metas']);
    });

    it('should populate form with meta data', () => {
      mockGetMetaByIdUseCase.execute.mockReturnValue(of(mockMeta));

      fixture.detectChanges();

      expect(component.metaForm.value.idVendedor).toBe('VE-01');
      expect(component.metaForm.value.idProducto).toBe('SKU-001');
      expect(component.metaForm.value.region).toBe(Region.NORTE);
      expect(component.metaForm.value.trimestre).toBe(Trimestre.Q1);
      expect(component.metaForm.value.valorObjetivo).toBe(100000);
      expect(component.metaForm.value.tipo).toBe(TipoMeta.MONETARIO);
    });
  });

  describe('loadMeta', () => {
    it('should load meta and populate form', () => {
      mockGetMetaByIdUseCase.execute.mockReturnValue(of(mockMeta));

      component.ngOnInit();
      component.loadMeta(1);

      expect(component.loading()).toBe(false);
      expect(component.metaForm.value.idVendedor).toBe('VE-01');
    });

    it('should handle meta not found', () => {
      mockGetMetaByIdUseCase.execute.mockReturnValue(of(null));

      component.ngOnInit();
      fixture.detectChanges();

      expect(mockNotificationService.error).toHaveBeenCalledWith('Meta no encontrada');
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/metas']);
    });

    it('should handle error loading meta', () => {
      const error = { status: 404, message: 'Not found' };
      mockGetMetaByIdUseCase.execute.mockReturnValue(throwError(() => error));

      component.ngOnInit();
      fixture.detectChanges();

      expect(mockNotificationService.error).toHaveBeenCalledWith('Error al cargar meta');
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/metas']);
    });
  });

  describe('Form Validation', () => {
    beforeEach(() => {
      mockGetMetaByIdUseCase.execute.mockReturnValue(of(mockMeta));
      fixture.detectChanges();
    });

    it('should have all required fields', () => {
      const form = component.metaForm;

      expect(form.get('idVendedor')?.hasError('required')).toBe(false);
      expect(form.get('idProducto')?.hasError('required')).toBe(false);
      expect(form.get('region')?.hasError('required')).toBe(false);
      expect(form.get('trimestre')?.hasError('required')).toBe(false);
      expect(form.get('valorObjetivo')?.hasError('required')).toBe(false);
      expect(form.get('tipo')?.hasError('required')).toBe(false);
    });

    it('should validate valorObjetivo minimum value', () => {
      const valorControl = component.metaForm.get('valorObjetivo');
      
      valorControl?.setValue(0);
      expect(valorControl?.hasError('min')).toBe(true);

      valorControl?.setValue(1);
      expect(valorControl?.hasError('min')).toBe(false);
    });

    it('should validate idVendedor minimum length', () => {
      const vendedorControl = component.metaForm.get('idVendedor');
      
      vendedorControl?.setValue('A');
      expect(vendedorControl?.hasError('minlength')).toBe(true);

      vendedorControl?.setValue('VE');
      expect(vendedorControl?.hasError('minlength')).toBe(false);
    });

    it('should validate idProducto minimum length', () => {
      const productoControl = component.metaForm.get('idProducto');
      
      productoControl?.setValue('S');
      expect(productoControl?.hasError('minlength')).toBe(true);

      productoControl?.setValue('SK');
      expect(productoControl?.hasError('minlength')).toBe(false);
    });
  });

  describe('onSubmit', () => {
    beforeEach(() => {
      mockGetMetaByIdUseCase.execute.mockReturnValue(of(mockMeta));
      fixture.detectChanges();
    });

    it('should not submit if form is invalid', () => {
      component.metaForm.patchValue({ idVendedor: '' });

      component.onSubmit();

      expect(mockUpdateMetaUseCase.execute).not.toHaveBeenCalled();
      expect(mockNotificationService.warning).toHaveBeenCalledWith(
        'Por favor complete los campos requeridos correctamente'
      );
    });

    it('should not submit if metaId is missing', () => {
      component.metaId = null;

      component.onSubmit();

      expect(mockUpdateMetaUseCase.execute).not.toHaveBeenCalled();
      expect(mockNotificationService.error).toHaveBeenCalledWith('ID de meta no válido');
    });

    it('should submit valid form successfully', fakeAsync(() => {
      const updatedMeta = { ...mockMeta };
      mockUpdateMetaUseCase.execute.mockReturnValue(of(updatedMeta));

      // Wait for async validators
      tick(500);

      component.metaForm.patchValue({
        idVendedor: 'VE-02',
        idProducto: 'SKU-002',
        region: Region.SUR,
        trimestre: Trimestre.Q2,
        valorObjetivo: 150000,
        tipo: TipoMeta.UNIDADES
      });

      tick(500); // Wait for async validators again

      component.onSubmit();

      expect(mockUpdateMetaUseCase.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 1,
          idVendedor: 'VE-02',
          idProducto: 'SKU-002',
          region: Region.SUR,
          trimestre: Trimestre.Q2,
          valorObjetivo: 150000,
          tipo: TipoMeta.UNIDADES
        })
      );
      expect(mockNotificationService.success).toHaveBeenCalledWith('Meta actualizada exitosamente');
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/metas']);
    }));

    it('should handle error with userMessage', () => {
      const error = { userMessage: 'Error personalizado del repositorio' };
      mockUpdateMetaUseCase.execute.mockReturnValue(throwError(() => error));

      component.onSubmit();

      expect(mockNotificationService.error).toHaveBeenCalledWith('Error personalizado del repositorio');
      expect(component.loading()).toBe(false);
    });

    it('should handle validation error (400)', () => {
      const error = { status: 400, error: { message: 'Datos inválidos' } };
      mockUpdateMetaUseCase.execute.mockReturnValue(throwError(() => error));

      component.onSubmit();

      expect(mockNotificationService.error).toHaveBeenCalledWith('Datos inválidos');
    });

    it('should handle not found error (404)', () => {
      const error = { status: 404, error: { error: 'Meta no encontrada' } };
      mockUpdateMetaUseCase.execute.mockReturnValue(throwError(() => error));

      component.onSubmit();

      expect(mockNotificationService.error).toHaveBeenCalledWith('Meta no encontrada');
    });

    it('should handle generic HTTP error', () => {
      const error = { status: 500, statusText: 'Internal Server Error' };
      mockUpdateMetaUseCase.execute.mockReturnValue(throwError(() => error));

      component.onSubmit();

      expect(mockNotificationService.error).toHaveBeenCalledWith('Error del servidor: Internal Server Error');
    });

    it('should handle generic error without status', () => {
      const error = { someProp: 'unknown' }; // Sin message ni status
      mockUpdateMetaUseCase.execute.mockReturnValue(throwError(() => error));

      component.onSubmit();

      expect(mockNotificationService.error).toHaveBeenCalledWith(
        'Error al actualizar meta. Verifique los datos ingresados'
      );
    });

    it('should trim string values before submitting', () => {
      mockUpdateMetaUseCase.execute.mockReturnValue(of(mockMeta));

      component.metaForm.patchValue({
        idVendedor: '  VE-01  ',
        idProducto: '  SKU-001  '
      });

      component.onSubmit();

      expect(mockUpdateMetaUseCase.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          idVendedor: 'VE-01',
          idProducto: 'SKU-001'
        })
      );
    });
  });

  describe('cancel', () => {
    it('should navigate back to metas list', () => {
      component.cancel();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/metas']);
    });
  });

  describe('getErrorMessage', () => {
    beforeEach(() => {
      mockGetMetaByIdUseCase.execute.mockReturnValue(of(mockMeta));
      fixture.detectChanges();
    });

    it('should return required error message', () => {
      const control = component.metaForm.get('idVendedor');
      control?.setValue('');
      control?.markAsTouched();

      const message = component.getErrorMessage('idVendedor');

      expect(message).toBe('Este campo es requerido');
    });

    it('should return minlength error message', () => {
      const control = component.metaForm.get('idVendedor');
      control?.setValue('A');

      const message = component.getErrorMessage('idVendedor');

      expect(message).toBe('Mínimo 2 caracteres');
    });

    it('should return min value error message', () => {
      const control = component.metaForm.get('valorObjetivo');
      control?.setValue(0);

      const message = component.getErrorMessage('valorObjetivo');

      expect(message).toBe('El valor debe ser mayor a 1');
    });

    it('should return vendedor not exists error', () => {
      const control = component.metaForm.get('idVendedor');
      control?.setErrors({ vendedorNotExists: true });

      const message = component.getErrorMessage('idVendedor');

      expect(message).toBe('El vendedor no existe en el sistema');
    });

    it('should return producto not exists error', () => {
      const control = component.metaForm.get('idProducto');
      control?.setErrors({ productoNotExists: true });

      const message = component.getErrorMessage('idProducto');

      expect(message).toBe('El producto no existe en el sistema');
    });

    it('should return empty string for no errors', () => {
      const message = component.getErrorMessage('region');

      expect(message).toBe('');
    });
  });

  describe('getTipoDisplay', () => {
    it('should return "Unidades" for UNIDADES type', () => {
      const display = component.getTipoDisplay(TipoMeta.UNIDADES);

      expect(display).toBe('Unidades');
    });

    it('should return "Monetario" for MONETARIO type', () => {
      const display = component.getTipoDisplay(TipoMeta.MONETARIO);

      expect(display).toBe('Monetario');
    });
  });

  describe('Enum arrays', () => {
    beforeEach(() => {
      mockGetMetaByIdUseCase.execute.mockReturnValue(of(mockMeta));
      fixture.detectChanges();
    });

    it('should have all regions', () => {
      expect(component.regiones).toEqual([
        Region.NORTE,
        Region.SUR,
        Region.ESTE,
        Region.OESTE
      ]);
    });

    it('should have all trimestres', () => {
      expect(component.trimestres).toEqual([
        Trimestre.Q1,
        Trimestre.Q2,
        Trimestre.Q3,
        Trimestre.Q4
      ]);
    });

    it('should have all tipos', () => {
      expect(component.tipos).toEqual([
        TipoMeta.UNIDADES,
        TipoMeta.MONETARIO
      ]);
    });
  });
});
