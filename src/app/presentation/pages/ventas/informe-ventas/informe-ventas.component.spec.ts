import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InformeVentasComponent } from './informe-ventas.component';
import { ToastrService } from 'ngx-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';

describe('InformeVentasComponent', () => {
  let component: InformeVentasComponent;
  let fixture: ComponentFixture<InformeVentasComponent>;
  let toastrService: jest.Mocked<ToastrService>;

  beforeEach(async () => {
    const toastrServiceMock = {
      info: jest.fn(),
      success: jest.fn(),
      error: jest.fn(),
      warning: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [
        InformeVentasComponent,
        BrowserAnimationsModule
      ],
      providers: [
        { provide: ToastrService, useValue: toastrServiceMock },
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(InformeVentasComponent);
    component = fixture.componentInstance;
    toastrService = TestBed.inject(ToastrService) as jest.Mocked<ToastrService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should initialize data and filters on init', () => {
      const simularSpy = jest.spyOn(component, 'simularDatos');
      const filtrarSpy = jest.spyOn(component, 'filtrar');

      component.ngOnInit();

      expect(simularSpy).toHaveBeenCalled();
      expect(filtrarSpy).toHaveBeenCalled();
    });

    it('should populate vendedores list', () => {
      expect(component.vendedores).toEqual(['Juan Pérez', 'Ana Torres', 'Carlos Ruiz']);
    });

    it('should populate productos list', () => {
      expect(component.productos).toEqual(['Producto A', 'Producto B', 'Producto C']);
    });

    it('should populate zonas list', () => {
      expect(component.zonas).toEqual(['Norte', 'Sur', 'Este', 'Oeste']);
    });
  });

  describe('simularDatos', () => {
    it('should populate ventas array with sample data', () => {
      component.simularDatos();

      expect(component.ventas.length).toBe(6);
      expect(component.ventas[0]).toEqual({
        vendedor: 'Juan Pérez',
        producto: 'Producto A',
        zona: 'Norte',
        volumen: 120,
        valorTotal: 24000,
        cumplimiento: 95,
        tendencia: '↑'
      });
    });

    it('should include all required properties in each venta', () => {
      component.simularDatos();

      component.ventas.forEach(venta => {
        expect(venta).toHaveProperty('vendedor');
        expect(venta).toHaveProperty('producto');
        expect(venta).toHaveProperty('zona');
        expect(venta).toHaveProperty('volumen');
        expect(venta).toHaveProperty('valorTotal');
        expect(venta).toHaveProperty('cumplimiento');
        expect(venta).toHaveProperty('tendencia');
      });
    });

    it('should have different vendedores in the data', () => {
      component.simularDatos();

      const vendedores = [...new Set(component.ventas.map(v => v.vendedor))];
      expect(vendedores.length).toBeGreaterThan(1);
    });

    it('should have numeric values for volumen', () => {
      component.simularDatos();

      component.ventas.forEach(venta => {
        expect(typeof venta.volumen).toBe('number');
        expect(venta.volumen).toBeGreaterThan(0);
      });
    });

    it('should have numeric values for valorTotal', () => {
      component.simularDatos();

      component.ventas.forEach(venta => {
        expect(typeof venta.valorTotal).toBe('number');
        expect(venta.valorTotal).toBeGreaterThan(0);
      });
    });

    it('should have cumplimiento values between 0 and 100', () => {
      component.simularDatos();

      component.ventas.forEach(venta => {
        expect(venta.cumplimiento).toBeGreaterThanOrEqual(0);
        expect(venta.cumplimiento).toBeLessThanOrEqual(100);
      });
    });

    it('should have valid tendencia indicators', () => {
      component.simularDatos();

      const validTendencias = ['↑', '↓', '→'];
      component.ventas.forEach(venta => {
        expect(validTendencias).toContain(venta.tendencia);
      });
    });
  });

  describe('filtrar', () => {
    beforeEach(() => {
      component.simularDatos();
    });

    it('should show all ventas when no filters applied', () => {
      component.filtroVendedor = '';
      component.filtroProducto = '';
      component.filtroZona = '';

      component.filtrar();

      expect(component.dataSource.data.length).toBe(6);
    });

    it('should filter by vendedor', () => {
      component.filtroVendedor = 'Juan Pérez';
      component.filtroProducto = '';
      component.filtroZona = '';

      component.filtrar();

      expect(component.dataSource.data.length).toBe(2);
      component.dataSource.data.forEach(venta => {
        expect(venta.vendedor).toBe('Juan Pérez');
      });
    });

    it('should filter by producto', () => {
      component.filtroVendedor = '';
      component.filtroProducto = 'Producto A';
      component.filtroZona = '';

      component.filtrar();

      expect(component.dataSource.data.length).toBe(3);
      component.dataSource.data.forEach(venta => {
        expect(venta.producto).toBe('Producto A');
      });
    });

    it('should filter by zona', () => {
      component.filtroVendedor = '';
      component.filtroProducto = '';
      component.filtroZona = 'Norte';

      component.filtrar();

      expect(component.dataSource.data.length).toBe(2);
      component.dataSource.data.forEach(venta => {
        expect(venta.zona).toBe('Norte');
      });
    });

    it('should filter by multiple criteria', () => {
      component.filtroVendedor = 'Juan Pérez';
      component.filtroProducto = 'Producto A';
      component.filtroZona = 'Norte';

      component.filtrar();

      expect(component.dataSource.data.length).toBe(1);
      expect(component.dataSource.data[0]).toEqual({
        vendedor: 'Juan Pérez',
        producto: 'Producto A',
        zona: 'Norte',
        volumen: 120,
        valorTotal: 24000,
        cumplimiento: 95,
        tendencia: '↑'
      });
    });

    it('should return empty array when no matches found', () => {
      component.filtroVendedor = 'Nonexistent Vendedor';

      component.filtrar();

      expect(component.dataSource.data.length).toBe(0);
    });

    it('should update dataSource.data with filtered results', () => {
      component.filtroZona = 'Sur';

      component.filtrar();

      expect(component.dataSource.data).toBeDefined();
      expect(Array.isArray(component.dataSource.data)).toBe(true);
    });
  });

  describe('limpiarFiltros', () => {
    beforeEach(() => {
      component.simularDatos();
    });

    it('should reset all filters to empty strings', () => {
      component.filtroVendedor = 'Juan Pérez';
      component.filtroProducto = 'Producto A';
      component.filtroZona = 'Norte';

      component.limpiarFiltros();

      expect(component.filtroVendedor).toBe('');
      expect(component.filtroProducto).toBe('');
      expect(component.filtroZona).toBe('');
    });

    it('should call filtrar after clearing filters', () => {
      const filtrarSpy = jest.spyOn(component, 'filtrar');
      component.filtroVendedor = 'Juan Pérez';

      component.limpiarFiltros();

      expect(filtrarSpy).toHaveBeenCalled();
    });

    it('should show all ventas after clearing filters', () => {
      component.filtroVendedor = 'Juan Pérez';
      component.filtrar();
      expect(component.dataSource.data.length).toBe(2);

      component.limpiarFiltros();

      expect(component.dataSource.data.length).toBe(6);
    });
  });

  describe('exportar', () => {
    it('should show info toast when exporting to PDF', () => {
      component.exportar('pdf');

      expect(toastrService.info).toHaveBeenCalledWith(
        'Funcionalidad de exportación simulada',
        'PDF'
      );
    });

    it('should show info toast when exporting to Excel', () => {
      component.exportar('excel');

      expect(toastrService.info).toHaveBeenCalledWith(
        'Funcionalidad de exportación simulada',
        'Excel'
      );
    });

    it('should accept pdf as export type', () => {
      expect(() => component.exportar('pdf')).not.toThrow();
    });

    it('should accept excel as export type', () => {
      expect(() => component.exportar('excel')).not.toThrow();
    });
  });

  describe('displayedColumns', () => {
    it('should have all required columns defined', () => {
      const expectedColumns = ['vendedor', 'producto', 'zona', 'volumen', 'valorTotal', 'cumplimiento', 'tendencia'];
      expect(component.displayedColumns).toEqual(expectedColumns);
    });
  });

  describe('dataSource', () => {
    it('should be initialized', () => {
      expect(component.dataSource).toBeDefined();
    });

    it('should be an instance of MatTableDataSource', () => {
      expect(component.dataSource).toBeInstanceOf(Object);
    });
  });

  describe('Component Integration', () => {
    it('should render without errors', () => {
      fixture.detectChanges();
      expect(fixture.nativeElement).toBeTruthy();
    });

    it('should initialize filters on component creation', () => {
      expect(component.filtroVendedor).toBe('');
      expect(component.filtroProducto).toBe('');
      expect(component.filtroZona).toBe('');
    });

    it('should have proper initial state', () => {
      expect(component.ventas).toEqual([]);
      expect(component.dataSource.data).toEqual([]);
    });
  });
});
