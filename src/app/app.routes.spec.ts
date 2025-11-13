import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { routes } from './app.routes';

// Mock components for testing
@Component({ template: 'Dashboard Admin Mock' })
class MockDashboardAdminComponent { }

@Component({ template: 'Proveedor List Mock' })
class MockProveedorListComponent { }

@Component({ template: 'Producto List Mock' })
class MockProductoListComponent { }

@Component({ template: 'Producto Detail Mock' })
class MockProductoDetailComponent { }

@Component({ template: 'Producto Create Mock' })
class MockProductoCreateComponent { }

@Component({ template: 'Producto Edit Mock' })
class MockProductoEditComponent { }

@Component({ template: 'Vendedor List Mock' })
class MockVendedorListComponent { }

@Component({ template: 'Producto Upload Mock' })
class MockProductoUploadComponent { }

@Component({ template: 'Proveedor Upload Mock' })
class MockProveedorUploadComponent { }

@Component({ template: 'Producto Localizacion Mock' })
class MockProductoLocalizacionComponent { }

@Component({ template: 'Ruta Entrega Lista Mock' })
class MockRutaEntregaListaComponent { }

@Component({ template: 'Meta List Mock' })
class MockMetaListComponent { }

@Component({ template: 'Informe Ventas Mock' })
class MockInformeVentasComponent { }

describe('App Routes', () => {
  let router: Router;
  let location: Location;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [],
      providers: [
        { provide: 'DashboardAdminComponent', useClass: MockDashboardAdminComponent },
        { provide: 'ProveedorListComponent', useClass: MockProveedorListComponent },
        { provide: 'ProductoListComponent', useClass: MockProductoListComponent },
        { provide: 'ProductoDetailComponent', useClass: MockProductoDetailComponent },
        { provide: 'ProductoCreateComponent', useClass: MockProductoCreateComponent },
        { provide: 'ProductoEditComponent', useClass: MockProductoEditComponent },
        { provide: 'VendedorListComponent', useClass: MockVendedorListComponent },
        { provide: 'ProductoUploadComponent', useClass: MockProductoUploadComponent },
        { provide: 'ProveedorUploadComponent', useClass: MockProveedorUploadComponent },
        { provide: 'ProductoLocalizacionComponent', useClass: MockProductoLocalizacionComponent },
        { provide: 'RutaEntregaListaComponent', useClass: MockRutaEntregaListaComponent },
        { provide: 'MetaListComponent', useClass: MockMetaListComponent },
        { provide: 'InformeVentasComponent', useClass: MockInformeVentasComponent }
      ]
    }).compileComponents();

    router = TestBed.inject(Router);
    location = TestBed.inject(Location);
  });

  describe('Routes Configuration', () => {
    it('should have routes defined', () => {
      expect(routes).toBeDefined();
      expect(Array.isArray(routes)).toBe(true);
      expect(routes.length).toBeGreaterThan(0);
    });

    it('should have correct number of routes', () => {
      expect(routes.length).toBe(26); // Actualizado: 4 vendedores + 5 metas + 1 historial productos + 2 proveedores upload (upload + historial)
    });
  });

  describe('Route Paths', () => {
    it('should have root path route', () => {
      const rootRoute = routes.find(route => route.path === '');
      expect(rootRoute).toBeDefined();
      expect(rootRoute?.loadComponent).toBeDefined();
    });

    it('should have dashboard-admin route', () => {
      const dashboardRoute = routes.find(route => route.path === 'dashboard-admin');
      expect(dashboardRoute).toBeDefined();
      expect(dashboardRoute?.loadComponent).toBeDefined();
    });

    it('should have proveedor-list route', () => {
      const proveedorRoute = routes.find(route => route.path === 'proveedor-list');
      expect(proveedorRoute).toBeDefined();
      expect(proveedorRoute?.loadComponent).toBeDefined();
    });

    it('should have producto-list route', () => {
      const productoRoute = routes.find(route => route.path === 'producto-list');
      expect(productoRoute).toBeDefined();
      expect(productoRoute?.loadComponent).toBeDefined();
    });

    it('should have producto-detail with parameter route', () => {
      const productoDetailRoute = routes.find(route => route.path === 'producto-detail/:id');
      expect(productoDetailRoute).toBeDefined();
      expect(productoDetailRoute?.loadComponent).toBeDefined();
    });

    it('should have producto-create route', () => {
      const productoCreateRoute = routes.find(route => route.path === 'producto-create');
      expect(productoCreateRoute).toBeDefined();
      expect(productoCreateRoute?.loadComponent).toBeDefined();
    });

    it('should have producto-edit with parameter route', () => {
      const productoEditRoute = routes.find(route => route.path === 'producto-edit/:id');
      expect(productoEditRoute).toBeDefined();
      expect(productoEditRoute?.loadComponent).toBeDefined();
    });

    it('should have vendedor-list route', () => {
      const vendedorRoute = routes.find(route => route.path === 'vendedor-list');
      expect(vendedorRoute).toBeDefined();
      // Esta es una ruta redirect, no tiene loadComponent
      expect(vendedorRoute?.redirectTo).toBe('vendedores');
    });

    it('should have producto-upload route', () => {
      const uploadRoute = routes.find(route => route.path === 'producto-upload');
      expect(uploadRoute).toBeDefined();
      expect(uploadRoute?.loadComponent).toBeDefined();
    });

    it('should have proveedor-upload route', () => {
      const proveedorUploadRoute = routes.find(route => route.path === 'proveedor-upload');
      expect(proveedorUploadRoute).toBeDefined();
      expect(proveedorUploadRoute?.loadComponent).toBeDefined();
    });

    it('should have proveedores/upload route', () => {
      const proveedorUploadRoute = routes.find(route => route.path === 'proveedores/upload');
      expect(proveedorUploadRoute).toBeDefined();
      expect(proveedorUploadRoute?.loadComponent).toBeDefined();
    });

    it('should have proveedores/upload/historial route', () => {
      const proveedorHistorialRoute = routes.find(route => route.path === 'proveedores/upload/historial');
      expect(proveedorHistorialRoute).toBeDefined();
      expect(proveedorHistorialRoute?.loadComponent).toBeDefined();
    });

    it('should have producto-localizacion route', () => {
      const localizacionRoute = routes.find(route => route.path === 'producto-localizacion');
      expect(localizacionRoute).toBeDefined();
      expect(localizacionRoute?.loadComponent).toBeDefined();
    });

    it('should have metas-list route', () => {
      const metasRoute = routes.find(route => route.path === 'metas-list');
      expect(metasRoute).toBeDefined();
      expect(metasRoute?.loadComponent).toBeDefined();
    });

    it('should have informe-ventas route', () => {
      const informeRoute = routes.find(route => route.path === 'informe-ventas');
      expect(informeRoute).toBeDefined();
      expect(informeRoute?.loadComponent).toBeDefined();
    });
  });

  describe('Lazy Loading Configuration', () => {
    it('should have loadComponent for all routes', () => {
      routes.forEach(route => {
        // Skip redirect routes
        if (route.redirectTo) {
          expect(route.loadComponent).toBeUndefined();
        } else {
          expect(route.loadComponent).toBeDefined();
          expect(typeof route.loadComponent).toBe('function');
        }
      });
    });

    it('should return promises from loadComponent functions', () => {
      routes.forEach(route => {
        if (route.loadComponent) {
          const result = route.loadComponent();
          expect(result).toHaveProperty('then');
        }
      });
    });
  });

  describe('Route Parameters', () => {
    it('should have parameterized routes for producto-detail', () => {
      const route = routes.find(r => r.path === 'producto-detail/:id');
      expect(route).toBeDefined();
      expect(route?.path).toContain(':id');
    });

    it('should have parameterized routes for producto-edit', () => {
      const route = routes.find(r => r.path === 'producto-edit/:id');
      expect(route).toBeDefined();
      expect(route?.path).toContain(':id');
    });

    it('should not have parameters for static routes', () => {
      const staticRoutes = [
        'producto-list',
        'producto-create',
        'proveedor-list',
        'vendedor-list',
        'producto-upload',
        'proveedor-upload',
        'producto-localizacion',
        'metas-list',
        'informe-ventas'
      ];

      staticRoutes.forEach(path => {
        const route = routes.find(r => r.path === path);
        expect(route).toBeDefined();
        expect(route?.path).not.toContain(':');
      });
    });
  });

  describe('Route Structure Validation', () => {
    it('should have valid route objects', () => {
      routes.forEach(route => {
        expect(route).toHaveProperty('path');
        // Skip redirect routes
        if (!route.redirectTo) {
          expect(route).toHaveProperty('loadComponent');
          expect(typeof route.loadComponent).toBe('function');
        }
        expect(typeof route.path).toBe('string');
      });
    });

    it('should not have duplicate paths', () => {
      const paths = routes.map(route => route.path);
      const uniquePaths = [...new Set(paths)];
      expect(paths.length).toBe(uniquePaths.length);
    });

    it('should have exactly one root route', () => {
      const rootRoutes = routes.filter(route => route.path === '');
      expect(rootRoutes.length).toBe(1);
    });
  });

  describe('Integration Tests', () => {
    it('should export routes array correctly', () => {
      expect(routes).toBeDefined();
      expect(Array.isArray(routes)).toBe(true);
    });

    it('should have consistent route structure', () => {
      routes.forEach((route, index) => {
        expect(route.path).toBeDefined();
        // Skip redirect routes
        if (!route.redirectTo) {
          expect(route.loadComponent).toBeDefined();
          expect(typeof route.loadComponent).toBe('function');
        }
        expect(typeof route.path).toBe('string');
      });
    });
  });

  describe('Coverage Tests', () => {
    it('should access all route properties', () => {
      routes.forEach(route => {
        // Access path property
        const path = route.path;
        expect(typeof path).toBe('string');

        // Access loadComponent property (skip redirect routes)
        const loadComponent = route.loadComponent;
        if (!route.redirectTo) {
          expect(typeof loadComponent).toBe('function');

          // Call loadComponent to ensure it returns a promise
          if (loadComponent) {
            const result = loadComponent();
            expect(result).toBeInstanceOf(Promise);
          }
        }
      });
    });

    it('should validate route array structure completely', () => {
      // Test array methods
      expect(routes.length).toBeGreaterThan(0);
      expect(routes.map(r => r.path)).toContain('');
      expect(routes.filter(r => r.path && r.path.includes(':')).length).toBe(6); // producto/:id, vendedor/:id/detail, vendedor/:id/edit, metas/:id, metas/:id/edit
      expect(routes.some(r => r.path === 'dashboard-admin')).toBe(true);
      // Excluir redirect routes de la validación de loadComponent
      expect(routes.filter(r => !r.redirectTo).every(r => r.loadComponent !== undefined)).toBe(true);
    });

    it('should handle edge cases in route configuration', () => {
      // Test empty path
      const emptyPathRoute = routes.find(r => r.path === '');
      expect(emptyPathRoute).toBeDefined();

      // Test parameterized paths
      const paramRoutes = routes.filter(r => r.path && r.path.includes(':'));
      expect(paramRoutes.length).toBe(6); // producto/:id, vendedor/:id/detail, vendedor/:id/edit, metas/:id, metas/:id/edit

      // Test loadComponent functions
      routes.forEach(route => {
        if (route.loadComponent) {
          expect(() => route.loadComponent!()).not.toThrow();
        }
      });
    });
  });
});