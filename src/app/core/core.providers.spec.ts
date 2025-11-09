import { TestBed } from '@angular/core/testing';
import { CORE_PROVIDERS } from './core.providers';
import { ProveedorRepository } from './domain/repositories/proveedor.repository';
import { ProductoRepository } from './domain/repositories/producto.repository';
import { VendedorRepository } from './domain/repositories/vendedor.repository';
import { MetaVentaRepository } from './domain/repositories/meta-venta.repository';
import { RutaEntregaRepository } from './domain/repositories/ruta-entrega.repository';
import { ProductLocationRepository } from './domain/repositories/product-location.repository';
import { MockProveedorRepository } from './infrastructure/repositories/mock/mock-proveedor.repository';
import { HttpProductoRepository } from './infrastructure/repositories/http/http-producto.repository';
import { HttpVendedorRepository } from './infrastructure/repositories/http/http-vendedor.repository';
import { MockMetaVentaRepository } from './infrastructure/repositories/mock/mock-meta-venta.repository';
import { MockRutaEntregaRepository } from './infrastructure/repositories/mock/mock-ruta-entrega.repository';
import { HttpProductLocationRepository } from './infrastructure/repositories/http/http-product-location.repository';
import { provideHttpClient } from '@angular/common/http';

describe('CORE_PROVIDERS', () => {
  describe('Provider Configuration', () => {
    it('should be defined as an array', () => {
      expect(CORE_PROVIDERS).toBeDefined();
      expect(Array.isArray(CORE_PROVIDERS)).toBe(true);
    });

    it('should have correct number of providers', () => {
      expect(CORE_PROVIDERS.length).toBe(6);
    });

    it('should be exportable and importable', () => {
      const providers = CORE_PROVIDERS;
      expect(providers).toBeDefined();
      expect(providers.length).toBeGreaterThan(0);
    });
  });

  describe('Service Injection', () => {
    beforeEach(async () => {
      await TestBed.configureTestingModule({
        providers: [
          ...CORE_PROVIDERS,
          provideHttpClient()
        ]
      }).compileComponents();
    });

    it('should inject ProveedorRepository correctly', () => {
      const repository = TestBed.inject(ProveedorRepository);
      expect(repository).toBeDefined();
      expect(repository).toBeInstanceOf(MockProveedorRepository);
    });

    it('should inject ProductoRepository correctly', () => {
      const repository = TestBed.inject(ProductoRepository);
      expect(repository).toBeDefined();
      expect(repository).toBeInstanceOf(HttpProductoRepository);
    });

    it('should inject VendedorRepository correctly', () => {
      const repository = TestBed.inject(VendedorRepository);
      expect(repository).toBeDefined();
      expect(repository).toBeInstanceOf(HttpVendedorRepository); // Cambiado de Mock a Http
    });

    it('should inject MetaVentaRepository correctly', () => {
      const repository = TestBed.inject(MetaVentaRepository);
      expect(repository).toBeDefined();
      expect(repository).toBeInstanceOf(MockMetaVentaRepository);
    });

    it('should inject RutaEntregaRepository correctly', () => {
      const repository = TestBed.inject(RutaEntregaRepository);
      expect(repository).toBeDefined();
      expect(repository).toBeInstanceOf(MockRutaEntregaRepository);
    });

    it('should inject ProductLocationRepository correctly', () => {
      const repository = TestBed.inject(ProductLocationRepository);
      expect(repository).toBeDefined();
      expect(repository).toBeInstanceOf(HttpProductLocationRepository);
    });
  });

  describe('Integration Tests', () => {
    beforeEach(async () => {
      await TestBed.configureTestingModule({
        providers: [
          ...CORE_PROVIDERS,
          provideHttpClient()
        ]
      }).compileComponents();
    });

    it('should inject all repositories simultaneously', () => {
      const proveedorRepo = TestBed.inject(ProveedorRepository);
      const productoRepo = TestBed.inject(ProductoRepository);
      const vendedorRepo = TestBed.inject(VendedorRepository);
      const metaRepo = TestBed.inject(MetaVentaRepository);
      const rutaRepo = TestBed.inject(RutaEntregaRepository);
      const locationRepo = TestBed.inject(ProductLocationRepository);

      expect(proveedorRepo).toBeDefined();
      expect(productoRepo).toBeDefined();
      expect(vendedorRepo).toBeDefined();
      expect(metaRepo).toBeDefined();
      expect(rutaRepo).toBeDefined();
      expect(locationRepo).toBeDefined();
    });

    it('should maintain singleton instances', () => {
      const repo1 = TestBed.inject(ProductoRepository);
      const repo2 = TestBed.inject(ProductoRepository);
      
      expect(repo1).toBe(repo2);
    });

    it('should support multiple injections per repository', () => {
      const instances = Array.from({ length: 5 }, () => TestBed.inject(ProductoRepository));
      
      instances.forEach((instance, index) => {
        expect(instance).toBeDefined();
        if (index > 0) {
          expect(instance).toBe(instances[0]);
        }
      });
    });
  });

  describe('Provider Export', () => {
    it('should export CORE_PROVIDERS as a named export', () => {
      expect(CORE_PROVIDERS).toBeDefined();
    });

    it('should be importable in other modules', () => {
      const providers = [...CORE_PROVIDERS];
      expect(providers.length).toBe(6);
      expect(providers).toEqual(CORE_PROVIDERS);
    });

    it('should maintain immutability', () => {
      const originalLength = CORE_PROVIDERS.length;
      const copy = [...CORE_PROVIDERS];
      
      expect(CORE_PROVIDERS.length).toBe(originalLength);
      expect(CORE_PROVIDERS).toEqual(copy);
    });
  });

  describe('Performance Tests', () => {
    it('should configure providers efficiently', async () => {
      const start = performance.now();
      
      await TestBed.configureTestingModule({
        providers: [
          ...CORE_PROVIDERS,
          provideHttpClient()
        ]
      }).compileComponents();
      
      const end = performance.now();
      
      expect(end - start).toBeLessThan(1000);
    });

    it('should handle rapid injections', () => {
      TestBed.configureTestingModule({
        providers: [
          ...CORE_PROVIDERS,
          provideHttpClient()
        ]
      });

      const start = performance.now();
      
      for (let i = 0; i < 50; i++) {
        const repo = TestBed.inject(ProductoRepository);
        expect(repo).toBeDefined();
      }
      
      const end = performance.now();
      
      expect(end - start).toBeLessThan(100);
    });
  });

  describe('Coverage Tests', () => {
    it('should access all provider array methods', () => {
      expect(CORE_PROVIDERS.length).toBe(6);
      expect(CORE_PROVIDERS.slice(0, 3)).toHaveLength(3);
      expect(CORE_PROVIDERS.indexOf(CORE_PROVIDERS[0])).toBe(0);
      expect(CORE_PROVIDERS.includes(CORE_PROVIDERS[0])).toBe(true);
    });

    it('should handle provider array spread correctly', () => {
      const spreadProviders = [...CORE_PROVIDERS];
      expect(spreadProviders).toEqual(CORE_PROVIDERS);
      expect(spreadProviders.length).toBe(CORE_PROVIDERS.length);
    });

    it('should validate provider array structure', () => {
      expect(CORE_PROVIDERS).toBeInstanceOf(Array);
      expect(CORE_PROVIDERS.length).toBeGreaterThan(0);
      
      CORE_PROVIDERS.forEach(provider => {
        expect(provider).toBeDefined();
        expect(provider).not.toBeNull();
      });
    });

    it('should support functional array methods', () => {
      const filtered = CORE_PROVIDERS.filter(p => p !== null);
      expect(filtered.length).toBe(CORE_PROVIDERS.length);
      
      const mapped = CORE_PROVIDERS.map((p, index) => index);
      expect(mapped).toEqual([0, 1, 2, 3, 4, 5]);
      
      const some = CORE_PROVIDERS.some(p => p !== null);
      expect(some).toBe(true);
      
      const every = CORE_PROVIDERS.every(p => p !== null);
      expect(every).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty spread gracefully', () => {
      const emptyArray: any[] = [];
      const combined = [...emptyArray, ...CORE_PROVIDERS];
      
      expect(combined).toEqual(CORE_PROVIDERS);
      expect(combined.length).toBe(CORE_PROVIDERS.length);
    });

    it('should maintain array immutability', () => {
      const original = CORE_PROVIDERS;
      const copy = [...CORE_PROVIDERS];
      
      expect(original).toBe(CORE_PROVIDERS);
      expect(copy).not.toBe(CORE_PROVIDERS);
      expect(copy).toEqual(CORE_PROVIDERS);
    });

    it('should handle array destructuring', () => {
      const [first, second, ...rest] = CORE_PROVIDERS;
      
      expect(first).toBeDefined();
      expect(second).toBeDefined();
      expect(rest).toHaveLength(4);
      expect([first, second, ...rest]).toEqual(CORE_PROVIDERS);
    });
  });
});