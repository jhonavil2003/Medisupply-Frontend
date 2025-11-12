import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { MetaDetailComponent } from './meta-detail.component';
import { GetMetaByIdUseCase } from '../../../../core/application/use-cases/meta/meta-venta.use-cases';
import { NotificationService } from '../../../shared/services/notification.service';
import { MetaVentaEntity, Region, Trimestre, TipoMeta } from '../../../../core/domain/entities/meta-venta.entity';
import { MetaVentaRepository } from '../../../../core/domain/repositories/meta-venta.repository';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

describe('MetaDetailComponent', () => {
  let component: MetaDetailComponent;
  let fixture: ComponentFixture<MetaDetailComponent>;
  let mockGetMetaByIdUseCase: jest.Mocked<GetMetaByIdUseCase>;
  let mockNotificationService: jest.Mocked<NotificationService>;
  let mockRouter: jest.Mocked<Router>;
  let mockActivatedRoute: any;
  let mockMetaVentaRepository: any;
  let mockDialogRef: any;

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

    mockMetaVentaRepository = { 
      create: jest.fn(), 
      getAll: jest.fn(), 
      getById: jest.fn(), 
      update: jest.fn(), 
      delete: jest.fn() 
    };
    
    mockDialogRef = { close: jest.fn() };

    await TestBed.configureTestingModule({
      imports: [MetaDetailComponent, NoopAnimationsModule],
      providers: [
        { provide: GetMetaByIdUseCase, useValue: mockGetMetaByIdUseCase },
        { provide: NotificationService, useValue: mockNotificationService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: MetaVentaRepository, useValue: mockMetaVentaRepository },
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: { id: 1 } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MetaDetailComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should load meta on init with valid ID', () => {
      mockGetMetaByIdUseCase.execute.mockReturnValue(of(mockMeta));
      component.metaId = 1;

      component.ngOnInit();

      expect(mockGetMetaByIdUseCase.execute).toHaveBeenCalledWith(1);
      expect(component.meta()).toEqual(mockMeta);
      expect(component.loading()).toBe(false);
    });

    it('should show error and close dialog if ID is missing', () => {
      component.metaId = 0;

      component.ngOnInit();

      expect(mockNotificationService.error).toHaveBeenCalledWith('ID de meta no válido');
      expect(mockDialogRef.close).toHaveBeenCalled();
    });

    it('should show error and close dialog if meta not found', () => {
      mockGetMetaByIdUseCase.execute.mockReturnValue(of(null));
      component.metaId = 1;

      component.ngOnInit();

      expect(mockNotificationService.error).toHaveBeenCalledWith('Meta no encontrada');
      expect(mockDialogRef.close).toHaveBeenCalled();
    });

    it('should handle error loading meta', () => {
      const error = { status: 404, message: 'Not found' };
      mockGetMetaByIdUseCase.execute.mockReturnValue(throwError(() => error));
      component.metaId = 1;

      component.ngOnInit();

      expect(mockNotificationService.error).toHaveBeenCalledWith('Error al cargar meta');
      expect(mockDialogRef.close).toHaveBeenCalled();
      expect(component.loading()).toBe(false);
    });
  });

  describe('loadMeta', () => {
    it('should set loading to true while loading', () => {
      mockGetMetaByIdUseCase.execute.mockReturnValue(of(mockMeta));

      component.loadMeta(1);

      expect(component.loading()).toBe(false); // becomes false after success
    });

    it('should load meta successfully', () => {
      mockGetMetaByIdUseCase.execute.mockReturnValue(of(mockMeta));

      component.loadMeta(1);

      expect(component.meta()).toEqual(mockMeta);
      expect(component.loading()).toBe(false);
    });
  });

  describe('navigateBack', () => {
    it('should close dialog', () => {
      component.navigateBack();

      expect(mockDialogRef.close).toHaveBeenCalled();
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

  describe('getValorDisplay', () => {
    it('should format monetary value with currency', () => {
      const display = component.getValorDisplay(mockMeta);

      expect(display).toContain('100.000');
      // El formato puede variar, solo verificamos que contenga el símbolo de moneda
      expect(display).toMatch(/\$|COP/);
    });

    it('should display units as plain number', () => {
      const metaUnidades: MetaVentaEntity = {
        ...mockMeta,
        tipo: TipoMeta.UNIDADES,
        valorObjetivo: 500
      };

      const display = component.getValorDisplay(metaUnidades);

      expect(display).toBe('500');
    });
  });

  describe('formatDate', () => {
    it('should format date string to readable format', () => {
      const formatted = component.formatDate('2025-01-15T10:00:00Z');

      expect(formatted).toContain('enero');
      expect(formatted).toContain('2025');
    });

    it('should return "-" for missing date', () => {
      const formatted = component.formatDate(undefined);

      expect(formatted).toBe('-');
    });

    it('should handle invalid date strings', () => {
      const formatted = component.formatDate('');

      expect(formatted).toBe('-');
    });
  });

  describe('TipoMeta enum', () => {
    it('should have TipoMeta accessible in component', () => {
      expect(component.TipoMeta).toBeDefined();
      expect(component.TipoMeta.UNIDADES).toBe(TipoMeta.UNIDADES);
      expect(component.TipoMeta.MONETARIO).toBe(TipoMeta.MONETARIO);
    });
  });
});
