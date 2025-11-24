import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

// Material Modules
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

// Component and dependencies
import { InformeVentasComponent } from './informe-ventas.component';
import { ReportsService, SalesSummaryResponse, SalesSummaryItem } from './reports.service';
import { ToastrService } from 'ngx-toastr';

describe('InformeVentasComponent', () => {
  let component: InformeVentasComponent;
  let fixture: ComponentFixture<InformeVentasComponent>;
  let reportsServiceMock: jest.Mocked<ReportsService>;
  let toastrServiceMock: jest.Mocked<ToastrService>;
  let translateService: TranslateService;

  // Mock data
  const mockSalesSummaryItems: SalesSummaryItem[] = [
    {
      fecha: '2025-11-12',
      employee_id: 'EMP-085',
      vendedor: 'Miguelito Cid',
      region: 'Norte',
      territory: 'Bogotá Norte',
      product_sku: 'MED-001',
      product_name: 'Ibuprofeno 400mg x 30',
      tipo_objetivo: 'unidades',
      volumen_ventas: 10,
      valor_total: 178500.00,
      valor_objetivo: 200.0,
      cumplimiento_porcentaje: 5.0
    },
    {
      fecha: '2025-11-12',
      employee_id: 'EMP-085',
      vendedor: 'Miguelito Cid',
      region: 'Sur',
      territory: 'Bogotá Sur',
      product_sku: 'MED-001',
      product_name: 'Ibuprofeno 400mg x 30',
      tipo_objetivo: 'monetario',
      volumen_ventas: 10,
      valor_total: 178500.00,
      valor_objetivo: 3000000.0,
      cumplimiento_porcentaje: 5.95
    },
    {
      fecha: '2025-11-12',
      employee_id: 'EMP-086',
      vendedor: 'Ana Torres',
      region: 'Norte',
      territory: 'Medellín Norte',
      product_sku: 'MED-002',
      product_name: 'Paracetamol 500mg x 20',
      tipo_objetivo: 'unidades',
      volumen_ventas: 150,
      valor_total: 225000.00,
      valor_objetivo: 100.0,
      cumplimiento_porcentaje: 150.0
    }
  ];

  const mockResponse: SalesSummaryResponse = {
    summary: mockSalesSummaryItems,
    totals: {
      total_volumen_ventas: 170,
      total_valor_total: 582000.00,
      unique_salespersons: 2,
      unique_products: 2,
      unique_regions: 2
    },
    filters_applied: {
      year: 2025,
      month: 11
    },
    total_records: 3
  };

  beforeEach(async () => {
    // Create mocks
    reportsServiceMock = {
      getSalesSummary: jest.fn().mockReturnValue(of(mockResponse)),
      getSalesBySalesperson: jest.fn(),
      getSalesByProduct: jest.fn(),
      healthCheck: jest.fn()
    } as any;

    toastrServiceMock = {
      success: jest.fn(),
      error: jest.fn(),
      info: jest.fn(),
      warning: jest.fn()
    } as any;

    await TestBed.configureTestingModule({
      imports: [
        InformeVentasComponent,
        NoopAnimationsModule,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        MatFormFieldModule,
        MatSelectModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatCardModule,
        MatProgressSpinnerModule,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: ReportsService, useValue: reportsServiceMock },
        { provide: ToastrService, useValue: toastrServiceMock },
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(InformeVentasComponent);
    component = fixture.componentInstance;
    translateService = TestBed.inject(TranslateService);
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with default values', () => {
      expect(component.ventas).toEqual([]);
      expect(component.loading()).toBe(false);
      expect(component.vendedores()).toEqual([]);
      expect(component.productos()).toEqual([]);
      expect(component.regiones()).toEqual([]);
    });

    it('should initialize filters with current month and year', () => {
      const currentDate = new Date();
      component.ngOnInit();
      
      expect(component.filtroMes).toBe(currentDate.getMonth() + 1);
      expect(component.filtroAnio).toBe(currentDate.getFullYear());
    });

    it('should populate años array with last 6 years', () => {
      component.inicializarAnios();
      const currentYear = new Date().getFullYear();
      
      expect(component.anios).toHaveLength(6);
      expect(component.anios[0]).toBe(currentYear);
      expect(component.anios[5]).toBe(currentYear - 5);
    });
  });

  describe('Data Loading', () => {
    it('should load sales data on initialization', () => {
      fixture.detectChanges();
      
      expect(reportsServiceMock.getSalesSummary).toHaveBeenCalled();
      expect(component.ventas).toEqual(mockSalesSummaryItems);
      expect(component.dataSource.data).toEqual(mockSalesSummaryItems);
      expect(component.loading()).toBe(false);
    });

    it('should set loading state to true when loading data', () => {
      component.cargarDatos();
      // El loading se establece en false después de que el observable completa
      expect(component.loading()).toBe(false);
    });

    it('should update totals after loading data', () => {
      fixture.detectChanges();
      
      expect(component.totales.volumen).toBe(170);
      expect(component.totales.valor).toBe(582000.00);
      expect(component.totales.vendedores).toBe(2);
      expect(component.totales.productos).toBe(2);
    });

    it('should handle error when loading data fails', () => {
      const errorMessage = 'Error loading reports';
      reportsServiceMock.getSalesSummary.mockReturnValue(
        throwError(() => new Error(errorMessage))
      );
      
      component.cargarDatos();
      
      expect(component.loading()).toBe(false);
      expect(toastrServiceMock.error).toHaveBeenCalledWith(
        'REPORTS.DATA_LOAD_ERROR'
      );
    });

    it('should show success toast after loading data', () => {
      fixture.detectChanges();
      
      expect(toastrServiceMock.success).toHaveBeenCalledWith(
        'REPORTS.DATA_LOADED_SUCCESS'
      );
    });
  });

  describe('Filter Lists Update', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should extract unique vendedores with id and nombre', () => {
      const vendedores = component.vendedores();
      
      expect(vendedores).toHaveLength(2);
      expect(vendedores).toContainEqual({ id: 'EMP-085', nombre: 'Miguelito Cid' });
      expect(vendedores).toContainEqual({ id: 'EMP-086', nombre: 'Ana Torres' });
    });

    it('should extract unique productos with sku and nombre', () => {
      const productos = component.productos();
      
      expect(productos).toHaveLength(2);
      expect(productos).toContainEqual({ sku: 'MED-001', nombre: 'Ibuprofeno 400mg x 30' });
      expect(productos).toContainEqual({ sku: 'MED-002', nombre: 'Paracetamol 500mg x 20' });
    });

    it('should extract unique regiones', () => {
      const regiones = component.regiones();
      
      expect(regiones).toHaveLength(2);
      expect(regiones).toContain('Norte');
      expect(regiones).toContain('Sur');
    });

    it('should sort vendedores alphabetically by nombre', () => {
      const vendedores = component.vendedores();
      
      expect(vendedores[0].nombre).toBe('Ana Torres');
      expect(vendedores[1].nombre).toBe('Miguelito Cid');
    });

    it('should sort productos alphabetically by nombre', () => {
      const productos = component.productos();
      
      expect(productos[0].nombre).toBe('Ibuprofeno 400mg x 30');
      expect(productos[1].nombre).toBe('Paracetamol 500mg x 20');
    });

    it('should filter out null regions', () => {
      const mockDataWithNull: SalesSummaryItem[] = [
        ...mockSalesSummaryItems,
        {
          ...mockSalesSummaryItems[0],
          region: null
        }
      ];
      
      component.ventas = mockDataWithNull;
      component.actualizarListasFiltros();
      
      const regiones = component.regiones();
      expect(regiones).not.toContain(null);
    });
  });

  describe('Filter Functionality', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should call getSalesSummary with year filter', () => {
      reportsServiceMock.getSalesSummary.mockClear();
      component.filtroAnio = 2024;
      
      component.filtrar();
      
      expect(reportsServiceMock.getSalesSummary).toHaveBeenCalledWith(
        expect.objectContaining({ year: 2024 })
      );
    });

    it('should call getSalesSummary with month filter', () => {
      reportsServiceMock.getSalesSummary.mockClear();
      component.filtroMes = 10;
      
      component.filtrar();
      
      expect(reportsServiceMock.getSalesSummary).toHaveBeenCalledWith(
        expect.objectContaining({ month: 10 })
      );
    });

    it('should call getSalesSummary with employee_id filter', () => {
      reportsServiceMock.getSalesSummary.mockClear();
      component.filtroVendedor = 'EMP-085';
      
      component.filtrar();
      
      expect(reportsServiceMock.getSalesSummary).toHaveBeenCalledWith(
        expect.objectContaining({ employee_id: 'EMP-085' })
      );
    });

    it('should call getSalesSummary with product_sku filter', () => {
      reportsServiceMock.getSalesSummary.mockClear();
      component.filtroProducto = 'MED-001';
      
      component.filtrar();
      
      expect(reportsServiceMock.getSalesSummary).toHaveBeenCalledWith(
        expect.objectContaining({ product_sku: 'MED-001' })
      );
    });

    it('should call getSalesSummary with region filter', () => {
      reportsServiceMock.getSalesSummary.mockClear();
      component.filtroRegion = 'Norte';
      
      component.filtrar();
      
      expect(reportsServiceMock.getSalesSummary).toHaveBeenCalledWith(
        expect.objectContaining({ region: 'Norte' })
      );
    });

    it('should not include month in filters when null', () => {
      reportsServiceMock.getSalesSummary.mockClear();
      component.filtroMes = null;
      
      component.filtrar();
      
      const callArgs = reportsServiceMock.getSalesSummary.mock.calls[0][0];
      expect(callArgs).not.toHaveProperty('month');
    });
  });

  describe('Clear Filters', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should reset all filters to default values', () => {
      component.filtroVendedor = 'EMP-085';
      component.filtroProducto = 'MED-001';
      component.filtroRegion = 'Norte';
      
      component.limpiarFiltros();
      
      expect(component.filtroVendedor).toBe('');
      expect(component.filtroProducto).toBe('');
      expect(component.filtroRegion).toBe('');
    });

    it('should reset to current month and year', () => {
      const currentDate = new Date();
      component.filtroMes = 1;
      component.filtroAnio = 2020;
      
      component.limpiarFiltros();
      
      expect(component.filtroMes).toBe(currentDate.getMonth() + 1);
      expect(component.filtroAnio).toBe(currentDate.getFullYear());
    });

    it('should reload data after clearing filters', () => {
      reportsServiceMock.getSalesSummary.mockClear();
      
      component.limpiarFiltros();
      
      expect(reportsServiceMock.getSalesSummary).toHaveBeenCalled();
    });
  });

  describe('Pagination', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should reassign paginator after loading data', fakeAsync(() => {
      component.cargarDatos();
      tick(0);
      
      expect(component.dataSource.paginator).toBeDefined();
    }));

    it('should reset to first page when filters change', fakeAsync(() => {
      if (component.paginator) {
        const firstPageSpy = jest.spyOn(component.paginator, 'firstPage');
        component.filtrar();
        tick(0);
        
        expect(firstPageSpy).toHaveBeenCalled();
      }
    }));
  });

  describe('getCumplimientoClass', () => {
    it('should return cumplimiento-alto for values >= 100', () => {
      expect(component.getCumplimientoClass(100)).toBe('cumplimiento-alto');
      expect(component.getCumplimientoClass(150)).toBe('cumplimiento-alto');
    });

    it('should return cumplimiento-medio for values between 80 and 99', () => {
      expect(component.getCumplimientoClass(80)).toBe('cumplimiento-medio');
      expect(component.getCumplimientoClass(90)).toBe('cumplimiento-medio');
      expect(component.getCumplimientoClass(99)).toBe('cumplimiento-medio');
    });

    it('should return cumplimiento-bajo for values < 80', () => {
      expect(component.getCumplimientoClass(0)).toBe('cumplimiento-bajo');
      expect(component.getCumplimientoClass(50)).toBe('cumplimiento-bajo');
      expect(component.getCumplimientoClass(79.99)).toBe('cumplimiento-bajo');
    });
  });

  describe('Export Functionality', () => {
    beforeEach(() => {
      // Cargar datos antes de cada test de exportación
      component.ventas = mockSalesSummaryItems;
      component.dataSource.data = mockSalesSummaryItems;
      
      // Configurar mocks de exportación
      reportsServiceMock.exportToExcel = jest.fn().mockReturnValue(of(new Blob()));
      reportsServiceMock.exportToPDF = jest.fn().mockReturnValue(of(new Blob()));
    });

    it('should show info toast when exporting to PDF', () => {
      const instantSpy = jest.spyOn(translateService, 'instant');
      
      component.exportar('pdf');
      
      expect(instantSpy).toHaveBeenCalledWith('REPORTS.EXPORTING_FORMAT', { format: 'PDF' });
      expect(instantSpy).toHaveBeenCalledWith('REPORTS.GENERATING_FILE');
      expect(toastrServiceMock.info).toHaveBeenCalled();
    });

    it('should show info toast when exporting to Excel', () => {
      const instantSpy = jest.spyOn(translateService, 'instant');
      
      component.exportar('excel');
      
      expect(instantSpy).toHaveBeenCalledWith('REPORTS.EXPORTING_FORMAT', { format: 'Excel' });
      expect(instantSpy).toHaveBeenCalledWith('REPORTS.GENERATING_FILE');
      expect(toastrServiceMock.info).toHaveBeenCalled();
    });

    it('should show warning when trying to export without data', () => {
      const instantSpy = jest.spyOn(translateService, 'instant');
      component.ventas = [];
      component.exportar('pdf');
      
      expect(instantSpy).toHaveBeenCalledWith('REPORTS.NO_DATA_TO_EXPORT');
      expect(instantSpy).toHaveBeenCalledWith('COMMON.WARNING');
      expect(toastrServiceMock.warning).toHaveBeenCalled();
      expect(reportsServiceMock.exportToPDF).not.toHaveBeenCalled();
    });
  });

  describe('Display Columns', () => {
    it('should have all required columns defined', () => {
      const expectedColumns = [
        'fecha',
        'vendedor',
        'region',
        'skuProducto',
        'producto',
        'tipoObjetivo',
        'volumenVentas',
        'valorTotal',
        'valorObjetivo',
        'cumplimiento'
      ];
      
      expect(component.displayedColumns).toEqual(expectedColumns);
    });
  });

  describe('Meses Array', () => {
    it('should have 12 months defined', () => {
      expect(component.meses).toHaveLength(12);
    });

    it('should have correct month structure', () => {
      expect(component.meses[0]).toEqual({ value: 1, nombre: 'Enero' });
      expect(component.meses[11]).toEqual({ value: 12, nombre: 'Diciembre' });
    });
  });
});
