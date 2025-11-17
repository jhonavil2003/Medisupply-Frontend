import { TestBed } from '@angular/core/testing';
import { ProductoLocalizacionService } from './producto-localizacion.service';
import { ProductoLocalizacion } from './producto-localizacion.model';

describe('ProductoLocalizacionService', () => {
  let service: ProductoLocalizacionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProductoLocalizacionService);
  });

  afterEach(() => {
    // Clear any console logs from spies
    jest.clearAllMocks();
  });

  describe('Service Initialization', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should have productos data initialized', () => {
      expect(service['productos']).toBeDefined();
      expect(Array.isArray(service['productos'])).toBe(true);
      expect(service['productos'].length).toBeGreaterThan(0);
    });
  });

  describe('buscarProducto', () => {
    it('should return observable with filtered results', (done) => {
      const query = 'P001';
      
      service.buscarProducto(query).subscribe(results => {
        expect(results).toBeDefined();
        expect(Array.isArray(results)).toBe(true);
        expect(results.length).toBe(1);
        expect(results[0].codigoInterno).toBe('P001');
        done();
      });
    });

    it('should search by codigo interno (exact match)', (done) => {
      const query = 'P001';
      
      service.buscarProducto(query).subscribe(results => {
        expect(results.length).toBe(1);
        expect(results[0].codigoInterno).toBe('P001');
        expect(results[0].sku).toBe('SKU-001');
        expect(results[0].nombre).toBe('Vacuna A');
        done();
      });
    });

    it('should search by SKU (exact match)', (done) => {
      const query = 'SKU-002';
      
      service.buscarProducto(query).subscribe(results => {
        expect(results.length).toBe(1);
        expect(results[0].codigoInterno).toBe('P002');
        expect(results[0].sku).toBe('SKU-002');
        expect(results[0].nombre).toBe('Vacuna B');
        done();
      });
    });

    it('should search by nombre (partial match)', (done) => {
      const query = 'Vacuna';
      
      service.buscarProducto(query).subscribe(results => {
        expect(results.length).toBe(2);
        expect(results.every(p => p.nombre.includes('Vacuna'))).toBe(true);
        done();
      });
    });

    it('should search by codigo barras/QR (exact match)', (done) => {
      const query = '1234567890123';
      
      service.buscarProducto(query).subscribe(results => {
        expect(results.length).toBe(1);
        expect(results[0].codigoBarrasQR).toBe('1234567890123');
        expect(results[0].codigoInterno).toBe('P001');
        done();
      });
    });

    it('should be case insensitive for codigo interno', (done) => {
      const query = 'p001';
      
      service.buscarProducto(query).subscribe(results => {
        expect(results.length).toBe(1);
        expect(results[0].codigoInterno).toBe('P001');
        done();
      });
    });

    it('should be case insensitive for SKU', (done) => {
      const query = 'sku-001';
      
      service.buscarProducto(query).subscribe(results => {
        expect(results.length).toBe(1);
        expect(results[0].sku).toBe('SKU-001');
        done();
      });
    });

    it('should be case insensitive for nombre', (done) => {
      const query = 'VACUNA A';
      
      service.buscarProducto(query).subscribe(results => {
        expect(results.length).toBe(1);
        expect(results[0].nombre).toBe('Vacuna A');
        done();
      });
    });

    it('should return empty array when no matches found', (done) => {
      const query = 'NONEXISTENT';
      
      service.buscarProducto(query).subscribe(results => {
        expect(results).toBeDefined();
        expect(Array.isArray(results)).toBe(true);
        expect(results.length).toBe(0);
        done();
      });
    });

    it('should trim whitespace from query', (done) => {
      const query = '  P001  ';
      
      service.buscarProducto(query).subscribe(results => {
        expect(results.length).toBe(1);
        expect(results[0].codigoInterno).toBe('P001');
        done();
      });
    });

    it('should handle empty query', (done) => {
      const query = '';
      
      service.buscarProducto(query).subscribe(results => {
        expect(results).toBeDefined();
        expect(Array.isArray(results)).toBe(true);
        // Empty string is included in every string, so returns all products
        expect(results.length).toBe(2);
        done();
      });
    });

    it('should handle whitespace only query', (done) => {
      const query = '   ';
      
      service.buscarProducto(query).subscribe(results => {
        expect(results).toBeDefined();
        expect(Array.isArray(results)).toBe(true);
        // Whitespace trimmed to empty, returns all products (empty string matches all)
        expect(results.length).toBe(2);
        done();
      });
    });

    it('should return productos with all required properties', (done) => {
      const query = 'P001';
      
      service.buscarProducto(query).subscribe(results => {
        expect(results.length).toBe(1);
        const producto = results[0];
        
        // Verify all required properties exist
        expect(producto.codigoInterno).toBeDefined();
        expect(producto.sku).toBeDefined();
        expect(producto.nombre).toBeDefined();
        expect(producto.codigoBarrasQR).toBeDefined();
        expect(producto.ubicacion).toBeDefined();
        expect(producto.cantidad).toBeDefined();
        expect(producto.lote).toBeDefined();
        expect(producto.fechaVencimiento).toBeDefined();
        expect(producto.temperatura).toBeDefined();
        
        // Verify ubicacion properties
        expect(producto.ubicacion.pasillo).toBeDefined();
        expect(producto.ubicacion.estanteria).toBeDefined();
        expect(producto.ubicacion.nivel).toBeDefined();
        expect(producto.ubicacion.posicion).toBeDefined();
        expect(producto.ubicacion.zona).toBeDefined();
        
        done();
      });
    });

    it('should return productos with correct data types', (done) => {
      const query = 'P001';
      
      service.buscarProducto(query).subscribe(results => {
        expect(results.length).toBe(1);
        const producto = results[0];
        
        expect(typeof producto.codigoInterno).toBe('string');
        expect(typeof producto.sku).toBe('string');
        expect(typeof producto.nombre).toBe('string');
        expect(typeof producto.codigoBarrasQR).toBe('string');
        expect(typeof producto.ubicacion).toBe('object');
        expect(typeof producto.cantidad).toBe('number');
        expect(typeof producto.lote).toBe('string');
        expect(typeof producto.fechaVencimiento).toBe('string');
        expect(typeof producto.temperatura).toBe('string');
        
        done();
      });
    });

    it('should handle partial nombre match correctly', (done) => {
      const query = 'A';
      
      service.buscarProducto(query).subscribe(results => {
        // Query 'A' matches both "Vacuna A" and "Vacuna B" because it's partial match
        expect(results.length).toBe(2); 
        expect(results.some(p => p.nombre === 'Vacuna A')).toBe(true);
        expect(results.some(p => p.nombre === 'Vacuna B')).toBe(true);
        done();
      });
    });

    it('should find multiple products with partial match', (done) => {
      const query = 'Vacuna';
      
      service.buscarProducto(query).subscribe(results => {
        expect(results.length).toBe(2);
        expect(results.find(p => p.nombre === 'Vacuna A')).toBeDefined();
        expect(results.find(p => p.nombre === 'Vacuna B')).toBeDefined();
        done();
      });
    });
  });

  describe('registrarAuditoria', () => {
    it('should log audit information to console', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      const auditParams = {
        usuario: 'testuser',
        query: 'P001',
        fecha: '2024-01-01T00:00:00Z'
      };
      
      service.registrarAuditoria(auditParams);
      
      expect(consoleSpy).toHaveBeenCalledWith('Auditoría búsqueda:', auditParams);
      
      consoleSpy.mockRestore();
    });

    it('should handle all audit parameters', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      const auditParams = {
        usuario: 'admin@test.com',
        query: 'SKU-001',
        fecha: '2024-12-31T23:59:59Z'
      };
      
      service.registrarAuditoria(auditParams);
      
      expect(consoleSpy).toHaveBeenCalledTimes(1);
      expect(consoleSpy).toHaveBeenCalledWith('Auditoría búsqueda:', auditParams);
      
      consoleSpy.mockRestore();
    });

    it('should handle empty parameters', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      const auditParams = {
        usuario: '',
        query: '',
        fecha: ''
      };
      
      service.registrarAuditoria(auditParams);
      
      expect(consoleSpy).toHaveBeenCalledWith('Auditoría búsqueda:', auditParams);
      
      consoleSpy.mockRestore();
    });

    it('should not throw error when called', () => {
      const auditParams = {
        usuario: 'testuser',
        query: 'P001',
        fecha: '2024-01-01T00:00:00Z'
      };
      
      expect(() => {
        service.registrarAuditoria(auditParams);
      }).not.toThrow();
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete search and audit workflow', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      const query = 'P001';
      const auditParams = {
        usuario: 'testuser',
        query: query,
        fecha: new Date().toISOString()
      };
      
      // Perform search
      service.buscarProducto(query).subscribe(results => {
        expect(results.length).toBe(1);
        expect(results[0].codigoInterno).toBe('P001');
      });
      
      // Register audit
      service.registrarAuditoria(auditParams);
      
      expect(consoleSpy).toHaveBeenCalledWith('Auditoría búsqueda:', auditParams);
      
      consoleSpy.mockRestore();
    });

    it('should handle multiple consecutive searches', (done) => {
      let searchCount = 0;
      const queries = ['P001', 'SKU-002', 'Vacuna'];
      const expectedCounts = [1, 1, 2];
      
      queries.forEach((query, index) => {
        service.buscarProducto(query).subscribe(results => {
          expect(results.length).toBe(expectedCounts[index]);
          searchCount++;
          
          if (searchCount === queries.length) {
            done();
          }
        });
      });
    });

    it('should maintain data consistency across multiple searches', (done) => {
      const firstQuery = 'P001';
      const secondQuery = 'P001';
      
      service.buscarProducto(firstQuery).subscribe(firstResults => {
        service.buscarProducto(secondQuery).subscribe(secondResults => {
          expect(firstResults).toEqual(secondResults);
          expect(firstResults[0]).toEqual(secondResults[0]);
          done();
        });
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle null query gracefully', () => {
      const query = null as any;
      
      // The service will throw an error because it tries to call trim() on null
      expect(() => {
        service.buscarProducto(query);
      }).toThrow();
    });

    it('should handle undefined query gracefully', () => {
      const query = undefined as any;
      
      // The service will throw an error because it tries to call trim() on undefined
      expect(() => {
        service.buscarProducto(query);
      }).toThrow();
    });
  });
});