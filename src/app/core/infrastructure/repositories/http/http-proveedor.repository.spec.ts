import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { HttpProveedorRepository } from './http-proveedor.repository';

describe('HttpProveedorRepository', () => {
  let repo: HttpProveedorRepository;
  let httpMock: Partial<Record<keyof HttpClient, jest.Mock>>;

  beforeEach(() => {
    httpMock = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn()
    } as any;

    TestBed.configureTestingModule({
      providers: [
        HttpProveedorRepository,
        { provide: HttpClient, useValue: httpMock }
      ]
    });

    repo = TestBed.inject(HttpProveedorRepository);
  });

  it('maps GET /suppliers response to ProveedorEntity[]', (done) => {
    const api = { suppliers: [ { id: 1, name: 'ACME', tax_id: '12345678901', email: 'a@a.com', phone: '300' } ] };
    httpMock.get!.mockReturnValue(of(api));

    repo.getAll().subscribe(result => {
      expect(result.length).toBe(1);
      expect(result[0].razonSocial).toBe('ACME');
      expect(result[0].ruc).toBe('12345678901');
      done();
    });
  });

  it('creates supplier via POST and maps result', (done) => {
    const apiResp = { id: 42, name: 'New', tax_id: '11111111111', email: 'n@e.com', phone: '123' };
    httpMock.post!.mockReturnValue(of(apiResp));

    repo.create({ razonSocial: 'New', ruc: '11111111111', telefono: '123', correoContacto: 'n@e.com', country: 'Colombia', estado: 'Activo' as any, certificacionesVigentes: [] }).subscribe(res => {
      expect(res.razonSocial).toBe('New');
      expect(res.id).toBe('42');
      done();
    });
  });
});
