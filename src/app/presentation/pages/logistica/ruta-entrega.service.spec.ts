import { TestBed } from '@angular/core/testing';
import { RutaEntregaService } from './ruta-entrega.service';
import { RutaEntrega } from './ruta-entrega.model';

describe('RutaEntregaService', () => {
  let service: RutaEntregaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RutaEntregaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getRutas', () => {
    it('should return observable of rutas', (done) => {
      service.getRutas().subscribe(rutas => {
        expect(rutas).toBeDefined();
        expect(Array.isArray(rutas)).toBe(true);
        expect(rutas.length).toBeGreaterThan(0);
        done();
      });
    });

    it('should return rutas with correct structure', (done) => {
      service.getRutas().subscribe(rutas => {
        const ruta = rutas[0];
        expect(ruta).toHaveProperty('id');
        expect(ruta).toHaveProperty('fecha');
        expect(ruta).toHaveProperty('estado');
        expect(ruta).toHaveProperty('vehiculos');
        expect(ruta).toHaveProperty('conductor');
        expect(ruta).toHaveProperty('pedidos');
        done();
      });
    });

    it('should contain predefined rutas', (done) => {
      service.getRutas().subscribe(rutas => {
        expect(rutas.some(r => r.id === 'R-001')).toBe(true);
        expect(rutas.some(r => r.id === 'R-002')).toBe(true);
        expect(rutas.some(r => r.id === 'R-003')).toBe(true);
        done();
      });
    });

    it('should have different estados', (done) => {
      service.getRutas().subscribe(rutas => {
        const estados = rutas.map(r => r.estado);
        expect(estados).toContain('en_curso');
        expect(estados).toContain('completada');
        expect(estados).toContain('pendiente');
        done();
      });
    });
  });

  describe('actualizarRuta', () => {
    it('should update an existing ruta', (done) => {
      const updatedRuta: RutaEntrega = {
        id: 'R-001',
        fecha: '2025-09-18T08:00:00Z',
        estado: 'completada',
        vehiculos: ['VAN-12'],
        conductor: 'Carlos Pérez',
        pedidos: [
          { id: 'P-100', destino: 'Clínica San José', detalle: 'Vacunas y jeringas', estado: 'entregado' }
        ]
      };

      service.actualizarRuta(updatedRuta);

      service.getRutas().subscribe(rutas => {
        const ruta = rutas.find(r => r.id === 'R-001');
        expect(ruta).toBeDefined();
        expect(ruta?.estado).toBe('completada');
        expect(ruta?.pedidos[0].estado).toBe('entregado');
        done();
      });
    });

    it('should not modify other rutas when updating one', (done) => {
      const originalRutas = [...service['rutasSubject'].value];
      
      const updatedRuta: RutaEntrega = {
        ...originalRutas[0],
        estado: 'completada'
      };

      service.actualizarRuta(updatedRuta);

      service.getRutas().subscribe(rutas => {
        expect(rutas.length).toBe(originalRutas.length);
        expect(rutas.filter((r, i) => i !== 0).every((r, i) => 
          JSON.stringify(r) === JSON.stringify(originalRutas[i + 1])
        )).toBe(true);
        done();
      });
    });

    it('should keep ruta unchanged if id does not match', (done) => {
      const nonExistentRuta: RutaEntrega = {
        id: 'R-999',
        fecha: '2025-09-20T08:00:00Z',
        estado: 'pendiente',
        vehiculos: ['VAN-99'],
        conductor: 'Unknown',
        pedidos: []
      };

      const originalCount = service['rutasSubject'].value.length;
      service.actualizarRuta(nonExistentRuta);

      service.getRutas().subscribe(rutas => {
        expect(rutas.length).toBe(originalCount);
        expect(rutas.some(r => r.id === 'R-999')).toBe(false);
        done();
      });
    });

    it('should emit updated rutas to subscribers', (done) => {
      let emissionCount = 0;
      const subscription = service.getRutas().subscribe(() => {
        emissionCount++;
      });

      setTimeout(() => {
        const updatedRuta: RutaEntrega = {
          id: 'R-002',
          fecha: '2025-09-17T09:00:00Z',
          estado: 'en_curso',
          vehiculos: ['CAM-05'],
          conductor: 'Ana Torres',
          pedidos: []
        };

        service.actualizarRuta(updatedRuta);

        setTimeout(() => {
          expect(emissionCount).toBe(2); // Initial + update
          subscription.unsubscribe();
          done();
        }, 10);
      }, 10);
    });
  });
});
