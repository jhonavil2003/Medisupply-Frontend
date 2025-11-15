import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { MockTranslateService } from '../../../../../testing/translate.mock';

import { MetaListComponent } from './meta-list.component';
import {
  GetAllMetasUseCase,
  DeleteMetaVentaUseCase
} from '../../../../core/application/use-cases/meta/meta-venta.use-cases';
import { NotificationService } from '../../../shared/services/notification.service';
import { ConfirmDialogService } from '../../../shared/services/confirm-dialog.service';
import { MetaVentaEntity, Region, Trimestre, TipoMeta } from '../../../../core/domain/entities/meta-venta.entity';
import { MetaVentaRepository } from '../../../../core/domain/repositories/meta-venta.repository';
import { VendedorRepository } from '../../../../core/domain/repositories/vendedor.repository';
import { ProductoRepository } from '../../../../core/domain/repositories/producto.repository';

describe('MetaListComponent', () => {
  let component: MetaListComponent;
  let fixture: ComponentFixture<MetaListComponent>;
  let mockGetAllMetasUseCase: jest.Mocked<GetAllMetasUseCase>;
  let mockDeleteMetaUseCase: jest.Mocked<DeleteMetaVentaUseCase>;
  let mockNotificationService: jest.Mocked<NotificationService>;
  let mockConfirmDialog: jest.Mocked<ConfirmDialogService>;
  let mockRouter: jest.Mocked<Router>;
  let mockMetaVentaRepository: any;
  let mockVendedorRepository: any;
  let mockProductoRepository: any;
  let mockDialog: jest.Mocked<MatDialog>;

  const mockMetas: MetaVentaEntity[] = [
    {
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
        email: 'juan@test.com'
      },
      producto: {
        sku: 'SKU-001',
        name: 'Producto A',
        description: 'Desc A',
        unitPrice: 1000,
        isActive: true
      },
      fechaCreacion: '2025-01-15T10:00:00Z'
    },
    {
      id: 2,
      idVendedor: 'VE-02',
      idProducto: 'SKU-002',
      region: Region.SUR,
      trimestre: Trimestre.Q2,
      valorObjetivo: 500,
      tipo: TipoMeta.UNIDADES,
      vendedor: {
        employeeId: 'VE-02',
        nombreCompleto: 'María García',
        email: 'maria@test.com'
      },
      producto: {
        sku: 'SKU-002',
        name: 'Producto B',
        description: 'Desc B',
        unitPrice: 2000,
        isActive: true
      },
      fechaCreacion: '2025-02-10T10:00:00Z'
    },
    {
      id: 3,
      idVendedor: 'VE-01',
      idProducto: 'SKU-003',
      region: Region.ESTE,
      trimestre: Trimestre.Q3,
      valorObjetivo: 200000,
      tipo: TipoMeta.MONETARIO,
      vendedor: {
        employeeId: 'VE-01',
        nombreCompleto: 'Juan Pérez',
        email: 'juan@test.com'
      },
      producto: {
        sku: 'SKU-003',
        name: 'Producto C',
        description: 'Desc C',
        unitPrice: 3000,
        isActive: true
      },
      fechaCreacion: '2025-03-01T10:00:00Z'
    }
  ];

  beforeEach(async () => {
    mockGetAllMetasUseCase = {
      execute: jest.fn()
    } as any;

    mockDeleteMetaUseCase = {
      execute: jest.fn()
    } as any;

    mockNotificationService = {
      success: jest.fn(),
      error: jest.fn(),
      warning: jest.fn(),
      info: jest.fn()
    } as any;

    mockConfirmDialog = {
      confirm: jest.fn()
    } as any;

    mockRouter = {
      navigate: jest.fn()
    } as any;

    mockMetaVentaRepository = { 
      create: jest.fn(), 
      getAll: jest.fn(), 
      getById: jest.fn(), 
      update: jest.fn(), 
      delete: jest.fn() 
    };

    mockVendedorRepository = { 
      getByEmployeeId: jest.fn() 
    };

    mockProductoRepository = { 
      getBySku: jest.fn() 
    };

    mockDialog = {
      open: jest.fn().mockReturnValue({
        afterClosed: jest.fn().mockReturnValue(of(false))
      })
    } as any;

    await TestBed.configureTestingModule({
      imports: [MetaListComponent, NoopAnimationsModule],
      providers: [
        { provide: GetAllMetasUseCase, useValue: mockGetAllMetasUseCase },
        { provide: DeleteMetaVentaUseCase, useValue: mockDeleteMetaUseCase },
        { provide: NotificationService, useValue: mockNotificationService },
        { provide: ConfirmDialogService, useValue: mockConfirmDialog },
        { provide: Router, useValue: mockRouter },
        { provide: MetaVentaRepository, useValue: mockMetaVentaRepository },
        { provide: VendedorRepository, useValue: mockVendedorRepository },
        { provide: ProductoRepository, useValue: mockProductoRepository },
        { provide: MatDialog, useValue: mockDialog },
        { provide: TranslateService, useClass: MockTranslateService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MetaListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should load metas on init', () => {
      mockGetAllMetasUseCase.execute.mockReturnValue(of(mockMetas));

      fixture.detectChanges(); // triggers ngOnInit

      expect(mockGetAllMetasUseCase.execute).toHaveBeenCalled();
      expect(component.metas()).toEqual(mockMetas);
      expect(component.dataSource.data).toEqual(mockMetas);
      expect(component.loading()).toBe(false);
    });

    it('should setup filters on init', () => {
      mockGetAllMetasUseCase.execute.mockReturnValue(of(mockMetas));

      fixture.detectChanges();

      expect(component.regionControl).toBeDefined();
      expect(component.trimestreControl).toBeDefined();
      expect(component.tipoControl).toBeDefined();
    });

    it('should handle error loading metas', () => {
      const error = new Error('Network error');
      mockGetAllMetasUseCase.execute.mockReturnValue(throwError(() => error));

      fixture.detectChanges();

      expect(component.errorMessage()).toBe('Error al cargar metas de venta');
      expect(mockNotificationService.error).toHaveBeenCalledWith('Error al cargar la lista de metas');
      expect(component.loading()).toBe(false);
    });
  });

  describe('ngAfterViewInit', () => {
    it('should set paginator and sort', () => {
      mockGetAllMetasUseCase.execute.mockReturnValue(of(mockMetas));
      fixture.detectChanges();

      component.ngAfterViewInit();

      expect(component.dataSource.paginator).toBeDefined();
      expect(component.dataSource.sort).toBeDefined();
    });
  });

  describe('loadMetas', () => {
    it('should load all metas', () => {
      mockGetAllMetasUseCase.execute.mockReturnValue(of(mockMetas));

      component.loadMetas();

      expect(component.metas()).toEqual(mockMetas);
      expect(component.dataSource.data).toEqual(mockMetas);
      expect(component.loading()).toBe(false);
    });

    it('should set loading state', () => {
      mockGetAllMetasUseCase.execute.mockReturnValue(of(mockMetas));

      component.loadMetas();

      expect(component.loading()).toBe(false);
    });
  });

  describe('applyFilters', () => {
    beforeEach(() => {
      mockGetAllMetasUseCase.execute.mockReturnValue(of(mockMetas));
      fixture.detectChanges();
    });

    it('should filter by region', () => {
      const filtered = mockMetas.filter(m => m.region === Region.NORTE);
      mockGetAllMetasUseCase.execute.mockReturnValue(of(filtered));

      component.regionControl.setValue(Region.NORTE);
      component.applyFilters();

      expect(mockGetAllMetasUseCase.execute).toHaveBeenCalledWith({ region: Region.NORTE });
      expect(component.metas().length).toBe(1);
    });

    it('should filter by trimestre', () => {
      const filtered = mockMetas.filter(m => m.trimestre === Trimestre.Q2);
      mockGetAllMetasUseCase.execute.mockReturnValue(of(filtered));

      component.trimestreControl.setValue(Trimestre.Q2);
      component.applyFilters();

      expect(mockGetAllMetasUseCase.execute).toHaveBeenCalledWith({ trimestre: Trimestre.Q2 });
      expect(component.metas().length).toBe(1);
    });

    it('should filter by tipo', () => {
      const filtered = mockMetas.filter(m => m.tipo === TipoMeta.UNIDADES);
      mockGetAllMetasUseCase.execute.mockReturnValue(of(filtered));

      component.tipoControl.setValue('unidades');
      component.applyFilters();

      expect(mockGetAllMetasUseCase.execute).toHaveBeenCalledWith({ tipo: 'unidades' });
      expect(component.metas().length).toBe(1);
    });

    it('should apply multiple filters', () => {
      const filtered = mockMetas.filter(m => 
        m.region === Region.NORTE && m.trimestre === Trimestre.Q1 && m.tipo === TipoMeta.MONETARIO
      );
      mockGetAllMetasUseCase.execute.mockReturnValue(of(filtered));

      component.regionControl.setValue(Region.NORTE);
      component.trimestreControl.setValue(Trimestre.Q1);
      component.tipoControl.setValue('monetario');
      component.applyFilters();

      expect(mockGetAllMetasUseCase.execute).toHaveBeenCalledWith({
        region: Region.NORTE,
        trimestre: Trimestre.Q1,
        tipo: 'monetario'
      });
      expect(component.metas().length).toBe(1);
    });

    it('should handle empty filters', () => {
      mockGetAllMetasUseCase.execute.mockReturnValue(of(mockMetas));

      component.regionControl.setValue('');
      component.trimestreControl.setValue('');
      component.tipoControl.setValue('');
      component.applyFilters();

      expect(mockGetAllMetasUseCase.execute).toHaveBeenCalledWith({});
    });

    it('should handle filter errors', () => {
      const error = new Error('Filter error');
      mockGetAllMetasUseCase.execute.mockReturnValue(throwError(() => error));

      component.applyFilters();

      expect(component.errorMessage()).toBe('Error al filtrar metas');
      expect(mockNotificationService.error).toHaveBeenCalledWith('Error al aplicar filtros');
    });
  });

  describe('clearFilters', () => {
    beforeEach(() => {
      mockGetAllMetasUseCase.execute.mockReturnValue(of(mockMetas));
      fixture.detectChanges();
    });

    it('should clear all filters and reload', () => {
      component.regionControl.setValue(Region.NORTE);
      component.trimestreControl.setValue(Trimestre.Q1);
      component.tipoControl.setValue('monetario');

      component.clearFilters();

      expect(component.regionControl.value).toBe('');
      expect(component.trimestreControl.value).toBe('');
      expect(component.tipoControl.value).toBe('');
    });
  });

  describe('Navigation', () => {
    it('should open create dialog', () => {
      component.navigateToCreate();

      expect(mockDialog.open).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          width: '900px',
          maxHeight: '90vh',
          disableClose: false,
          autoFocus: true
        })
      );
    });

    it('should open detail dialog with meta ID', () => {
      component.navigateToDetail(1);

      expect(mockDialog.open).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          width: '1000px',
          maxHeight: '90vh',
          disableClose: false,
          autoFocus: true,
          data: { metaId: 1 }
        })
      );
    });

    it('should open edit dialog with meta ID', () => {
      component.navigateToEdit(1);

      expect(mockDialog.open).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          width: '900px',
          maxHeight: '90vh',
          disableClose: false,
          autoFocus: true,
          data: { metaId: 1 }
        })
      );
    });

    it('should navigate back to dashboard', () => {
      component.navigateBack();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard-admin']);
    });
  });

  describe('deleteMeta', () => {
    beforeEach(() => {
      mockGetAllMetasUseCase.execute.mockReturnValue(of(mockMetas));
      fixture.detectChanges();
    });

    it('should show error if meta has no ID', () => {
      const metaWithoutId = { ...mockMetas[0], id: undefined };

      component.deleteMeta(metaWithoutId as MetaVentaEntity);

      expect(mockNotificationService.error).toHaveBeenCalledWith('No se puede eliminar: meta sin ID');
      expect(mockConfirmDialog.confirm).not.toHaveBeenCalled();
    });

    it('should show confirmation dialog', () => {
      mockConfirmDialog.confirm.mockReturnValue(of(false));

      component.deleteMeta(mockMetas[0]);

      expect(mockConfirmDialog.confirm).toHaveBeenCalledWith(
        expect.objectContaining({
          title: '¿Está seguro?',
          confirmText: 'Eliminar',
          cancelText: 'Cancelar',
          type: 'danger'
        })
      );
    });

    it('should delete meta when confirmed', () => {
      mockConfirmDialog.confirm.mockReturnValue(of(true));
      mockDeleteMetaUseCase.execute.mockReturnValue(of(true));

      component.deleteMeta(mockMetas[0]);

      expect(mockDeleteMetaUseCase.execute).toHaveBeenCalledWith(1);
      expect(mockNotificationService.success).toHaveBeenCalledWith('Meta eliminada correctamente');
    });

    it('should not delete meta when cancelled', () => {
      mockConfirmDialog.confirm.mockReturnValue(of(false));

      component.deleteMeta(mockMetas[0]);

      expect(mockDeleteMetaUseCase.execute).not.toHaveBeenCalled();
    });

    it('should handle deletion failure', () => {
      mockConfirmDialog.confirm.mockReturnValue(of(true));
      mockDeleteMetaUseCase.execute.mockReturnValue(of(false));

      component.deleteMeta(mockMetas[0]);

      expect(mockNotificationService.error).toHaveBeenCalledWith('No se pudo eliminar la meta');
    });

    it('should handle deletion error', () => {
      const error = new Error('Delete error');
      mockConfirmDialog.confirm.mockReturnValue(of(true));
      mockDeleteMetaUseCase.execute.mockReturnValue(throwError(() => error));

      component.deleteMeta(mockMetas[0]);

      expect(mockNotificationService.error).toHaveBeenCalledWith('Error al eliminar meta');
      expect(component.loading()).toBe(false);
    });
  });

  describe('Helper methods', () => {
    it('should get vendedor display name', () => {
      const display = component.getVendedorDisplay(mockMetas[0]);

      expect(display).toBe('Juan Pérez');
    });

    it('should fallback to idVendedor if vendedor is missing', () => {
      const metaWithoutVendedor = { ...mockMetas[0], vendedor: undefined };

      const display = component.getVendedorDisplay(metaWithoutVendedor);

      expect(display).toBe('VE-01');
    });

    it('should get producto display name', () => {
      const display = component.getProductoDisplay(mockMetas[0]);

      expect(display).toBe('Producto A');
    });

    it('should fallback to idProducto if producto is missing', () => {
      const metaWithoutProducto = { ...mockMetas[0], producto: undefined };

      const display = component.getProductoDisplay(metaWithoutProducto);

      expect(display).toBe('SKU-001');
    });

    it('should get tipo display', () => {
      expect(component.getTipoDisplay(TipoMeta.UNIDADES)).toBe('Unidades');
      expect(component.getTipoDisplay(TipoMeta.MONETARIO)).toBe('Monetario');
    });

    it('should get valor display for monetary type', () => {
      const display = component.getValorDisplay(mockMetas[0]);

      expect(display).toContain('100.000');
      // El formato puede variar, solo verificamos que contenga el símbolo de moneda
      expect(display).toMatch(/\$|COP/);
    });

    it('should get valor display for units type', () => {
      const display = component.getValorDisplay(mockMetas[1]);

      expect(display).toBe('500');
    });
  });

  describe('Enum arrays', () => {
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
      expect(component.tipos).toEqual(['unidades', 'monetario']);
    });
  });

  describe('DataSource', () => {
    beforeEach(() => {
      mockGetAllMetasUseCase.execute.mockReturnValue(of(mockMetas));
      fixture.detectChanges();
    });

    it('should have correct columns', () => {
      expect(component.displayedColumns).toEqual([
        'idVendedor',
        'idProducto',
        'region',
        'trimestre',
        'tipo',
        'valorObjetivo',
        'acciones'
      ]);
    });

    it('should update dataSource when metas change', () => {
      const newMetas = [mockMetas[0]];
      mockGetAllMetasUseCase.execute.mockReturnValue(of(newMetas));

      component.loadMetas();

      expect(component.dataSource.data).toEqual(newMetas);
    });
  });
});
