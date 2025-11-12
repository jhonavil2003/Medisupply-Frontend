import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ProveedorService } from './proveedor.service';
import { ProveedorRepository } from '../../../core/domain/repositories/proveedor.repository';

describe('ProveedorService', () => {
  let service: ProveedorService;
  let repoMock: Partial<ProveedorRepository>;

  beforeEach(() => {
    repoMock = {
      getAll: jest.fn().mockReturnValue(of([])),
      create: jest.fn().mockReturnValue(of({ id: '1', razonSocial: 'A', ruc: '12345678901', telefono: '300', correoContacto: 'a@a.com', estado: 'Activo', certificacionesVigentes: [] } as any)),
      update: jest.fn().mockImplementation((dto: any) => of({ ...dto })),
      delete: jest.fn().mockReturnValue(of(true)),
      search: jest.fn()
    } as any;

    TestBed.configureTestingModule({
      providers: [
        ProveedorService,
        { provide: ProveedorRepository, useValue: repoMock }
      ]
    });

    service = TestBed.inject(ProveedorService);
  });

  it('loads providers and updates subject', (done) => {
    (repoMock.getAll as jest.Mock).mockReturnValue(of([{ id: '1', razonSocial: 'X', ruc: '12345678901', telefono: '300', correoContacto: 'x@x.com', estado: 'Activo', certificacionesVigentes: [] }]));
    service.getProveedores().subscribe(list => {
      expect(list.length).toBe(1);
      done();
    });
  });

  it('addProveedor returns created and updates cache', (done) => {
  const p = { razonSocial: 'B', ruc: '11111111111', telefono: '300', correoContacto: 'b@b.com', country: 'Colombia', estado: 'Activo', certificacionesVigentes: [] };
    service.addProveedor(p as any).subscribe(res => {
      expect(res.razonSocial).toBe('A'); // created returns A from mock
      done();
    });
  });
});
