import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { ProveedorService } from './proveedor.service';
import { ProveedorRepository } from '../../../core/domain/repositories/proveedor.repository';
import { EstadoProveedor } from '../../../core/domain/entities/proveedor.entity';

describe('ProveedorService', () => {
  let service: ProveedorService;
  let repoMock: Partial<ProveedorRepository>;

  beforeEach(() => {
    repoMock = {
      getAll: jest.fn().mockReturnValue(of([])),
      create: jest.fn().mockReturnValue(of({ id: '1', razonSocial: 'A', ruc: '12345678901', telefono: '300', correoContacto: 'a@a.com', estado: EstadoProveedor.ACTIVO, certificacionesVigentes: [] } as any)),
      update: jest.fn().mockImplementation((dto: any) => of({ ...dto, estado: EstadoProveedor.ACTIVO })),
      delete: jest.fn().mockReturnValue(of(true)),
      search: jest.fn(),
      getById: jest.fn()
    } as any;

    TestBed.configureTestingModule({
      providers: [
        ProveedorService,
        { provide: ProveedorRepository, useValue: repoMock }
      ]
    });

    service = TestBed.inject(ProveedorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('loads providers and updates subject', (done) => {
    (repoMock.getAll as jest.Mock).mockReturnValue(of([{ id: '1', razonSocial: 'X', ruc: '12345678901', telefono: '300', correoContacto: 'x@x.com', estado: EstadoProveedor.ACTIVO, certificacionesVigentes: [] }]));
    service.getProveedores().subscribe(list => {
      expect(list.length).toBe(1);
      done();
    });
  });

  it('addProveedor returns created and updates cache', (done) => {
    const p = { razonSocial: 'B', ruc: '11111111111', telefono: '300', correoContacto: 'b@b.com', country: 'Colombia', estado: EstadoProveedor.ACTIVO, certificacionesVigentes: [] };
    service.addProveedor(p as any).subscribe(res => {
      expect(res.razonSocial).toBe('A'); // created returns A from mock
      done();
    });
  });

  it('should delete proveedor', (done) => {
    service.deleteProveedor('1').subscribe(result => {
      expect(result).toBe(true);
      expect(repoMock.delete).toHaveBeenCalledWith('1');
      done();
    });
  });

  it('should handle errors in getProveedores', (done) => {
    (repoMock.getAll as jest.Mock).mockReturnValue(throwError(() => new Error('Network error')));

    service.getProveedores().subscribe({
      next: () => fail('Should have thrown error'),
      error: (err) => {
        expect(err.message).toBe('Network error');
        done();
      }
    });
  });

  it('should handle errors in addProveedor', (done) => {
    const p = { razonSocial: 'B', ruc: '11111111111', telefono: '300', correoContacto: 'b@b.com', country: 'Colombia', estado: EstadoProveedor.ACTIVO, certificacionesVigentes: [] };
    (repoMock.create as jest.Mock).mockReturnValue(throwError(() => new Error('Create error')));

    service.addProveedor(p as any).subscribe({
      next: () => fail('Should have thrown error'),
      error: (err) => {
        expect(err.message).toBe('Create error');
        done();
      }
    });
  });

  it('should map entity to presentation model correctly', (done) => {
    const entity = {
      id: '1',
      razonSocial: 'Test Provider',
      ruc: '12345678901',
      telefono: '3001234567',
      correoContacto: 'test@provider.com',
      country: 'Colombia',
      website: 'https://test.com',
      addressLine1: 'Calle 123',
      city: 'Bogotá',
      state: 'Cundinamarca',
      paymentTerms: '30 días',
      currency: 'COP',
      estado: EstadoProveedor.ACTIVO,
      certificacionesVigentes: ['ISO 9001']
    };
    (repoMock.getAll as jest.Mock).mockReturnValue(of([entity]));

    service.getProveedores().subscribe(list => {
      expect(list[0].razonSocial).toBe('Test Provider');
      expect(list[0].country).toBe('Colombia');
      expect(list[0].website).toBe('https://test.com');
      expect(list[0].addressLine1).toBe('Calle 123');
      expect(list[0].city).toBe('Bogotá');
      expect(list[0].certificacionesVigentes).toEqual(['ISO 9001']);
      done();
    });
  });
});
