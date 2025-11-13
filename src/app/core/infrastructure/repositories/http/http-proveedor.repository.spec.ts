import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { HttpProveedorRepository } from './http-proveedor.repository';
import { EstadoProveedor } from '../../../domain/entities/proveedor.entity';

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

  it('should be created', () => {
    expect(repo).toBeTruthy();
  });

  describe('getAll', () => {
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

    it('should handle empty suppliers array', (done) => {
      httpMock.get!.mockReturnValue(of({ suppliers: [] }));

      repo.getAll().subscribe(result => {
        expect(result).toEqual([]);
        expect(result.length).toBe(0);
        done();
      });
    });

    it('should handle supplier with address', (done) => {
      const api = {
        suppliers: [{
          id: 1,
          name: 'ACME',
          tax_id: '12345678901',
          email: 'a@a.com',
          phone: '300',
          address: {
            country: 'Colombia',
            line1: 'Calle 123',
            city: 'Bogotá',
            state: 'Cundinamarca'
          }
        }]
      };
      httpMock.get!.mockReturnValue(of(api));

      repo.getAll().subscribe(result => {
        expect(result[0].addressLine1).toBe('Calle 123');
        expect(result[0].city).toBe('Bogotá');
        expect(result[0].country).toBe('Colombia');
        done();
      });
    });
  });

  describe('getById', () => {
    it('should get proveedor by id', (done) => {
      const apiResp = { id: 1, name: 'ACME', tax_id: '12345678901', email: 'a@a.com', phone: '300' };
      httpMock.get!.mockReturnValue(of(apiResp));

      repo.getById('1').subscribe(result => {
        expect(result).toBeTruthy();
        expect(result!.razonSocial).toBe('ACME');
        expect(result!.id).toBe('1');
        done();
      });
    });

    it('should handle 404 error', (done) => {
      httpMock.get!.mockReturnValue(throwError(() => ({ status: 404 })));

      repo.getById('999').subscribe({
        next: () => fail('Should have thrown error'),
        error: (err) => {
          expect(err.message).toContain('Proveedor no encontrado');
          done();
        }
      });
    });
  });

  describe('search', () => {
    it('should search proveedores by criteria', (done) => {
      const api = { suppliers: [ { id: 1, name: 'ACME Corp', tax_id: '12345678901', email: 'acme@test.com', phone: '300' } ] };
      httpMock.get!.mockReturnValue(of(api));

      repo.search('ACME').subscribe(result => {
        expect(result.length).toBe(1);
        expect(result[0].razonSocial).toBe('ACME Corp');
        done();
      });
    });

    it('should return empty array when no results', (done) => {
      httpMock.get!.mockReturnValue(of({ suppliers: [] }));

      repo.search('NonExistent').subscribe(result => {
        expect(result).toEqual([]);
        done();
      });
    });
  });

  describe('create', () => {
    it('creates supplier via POST and maps result', (done) => {
      const apiResp = { id: 42, name: 'New', tax_id: '11111111111', email: 'n@e.com', phone: '123' };
      httpMock.post!.mockReturnValue(of(apiResp));

      repo.create({
        razonSocial: 'New',
        ruc: '11111111111',
        telefono: '123',
        correoContacto: 'n@e.com',
        country: 'Colombia',
        estado: EstadoProveedor.ACTIVO,
        certificacionesVigentes: []
      }).subscribe(res => {
        expect(res.razonSocial).toBe('New');
        expect(res.id).toBe('42');
        done();
      });
    });

    it('should create supplier with full address', (done) => {
      const apiResp = {
        id: 42,
        name: 'New',
        tax_id: '11111111111',
        email: 'n@e.com',
        phone: '123',
        address: { country: 'Colombia', line1: 'Calle 123', city: 'Bogotá', state: 'Cundinamarca' }
      };
      httpMock.post!.mockReturnValue(of(apiResp));

      repo.create({
        razonSocial: 'New',
        ruc: '11111111111',
        telefono: '123',
        correoContacto: 'n@e.com',
        country: 'Colombia',
        addressLine1: 'Calle 123',
        city: 'Bogotá',
        state: 'Cundinamarca',
        estado: EstadoProveedor.ACTIVO,
        certificacionesVigentes: []
      }).subscribe(res => {
        expect(res.addressLine1).toBe('Calle 123');
        expect(res.city).toBe('Bogotá');
        done();
      });
    });
  });

  describe('update', () => {
    it('should update proveedor', (done) => {
      const apiResp = { id: 1, name: 'Updated', tax_id: '12345678901', email: 'updated@test.com', phone: '300' };
      httpMock.put!.mockReturnValue(of(apiResp));

      repo.update({
        id: '1',
        razonSocial: 'Updated',
        correoContacto: 'updated@test.com'
      }).subscribe(res => {
        expect(res.razonSocial).toBe('Updated');
        expect(res.correoContacto).toBe('updated@test.com');
        done();
      });
    });
  });

  describe('delete', () => {
    it('should delete proveedor', (done) => {
      httpMock.delete!.mockReturnValue(of(null));

      repo.delete('1').subscribe(result => {
        expect(result).toBe(true);
        expect(httpMock.delete).toHaveBeenCalled();
        done();
      });
    });
  });

  describe('filterByEstado', () => {
    it('should filter proveedores by ACTIVO status', (done) => {
      const api = { suppliers: [{ id: 1, name: 'Active', tax_id: '12345678901', email: 'active@test.com', phone: '300', is_active: true }] };
      httpMock.get!.mockReturnValue(of(api));

      repo.filterByEstado('Activo').subscribe(result => {
        expect(result.length).toBe(1);
        expect(result[0].razonSocial).toBe('Active');
        done();
      });
    });

    it('should filter proveedores by INACTIVO status', (done) => {
      const api = { suppliers: [{ id: 1, name: 'Inactive', tax_id: '12345678901', email: 'inactive@test.com', phone: '300', is_active: false }] };
      httpMock.get!.mockReturnValue(of(api));

      repo.filterByEstado('Inactivo').subscribe(result => {
        expect(result.length).toBe(1);
        expect(result[0].razonSocial).toBe('Inactive');
        done();
      });
    });
  });

  describe('mapFromApi edge cases', () => {
    it('should handle supplier with certified status', (done) => {
      const api = { suppliers: [{ id: 1, name: 'Certified', tax_id: '12345678901', email: 'cert@test.com', phone: '300', is_certified: true }] };
      httpMock.get!.mockReturnValue(of(api));

      repo.getAll().subscribe(result => {
        expect(result[0].certificacionesVigentes).toEqual(['CERTIFICADO']);
        done();
      });
    });

    it('should handle supplier with credit limit', (done) => {
      const api = { suppliers: [{ id: 1, name: 'WithCredit', tax_id: '12345678901', email: 'credit@test.com', phone: '300', credit_limit: 50000 }] };
      httpMock.get!.mockReturnValue(of(api));

      repo.getAll().subscribe(result => {
        expect(result[0].creditLimit).toBe(50000);
        done();
      });
    });

    it('should handle supplier with created_at and updated_at dates', (done) => {
      const api = {
        suppliers: [{
          id: 1,
          name: 'WithDates',
          tax_id: '12345678901',
          email: 'dates@test.com',
          phone: '300',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-15T00:00:00Z'
        }]
      };
      httpMock.get!.mockReturnValue(of(api));

      repo.getAll().subscribe(result => {
        expect(result[0].fechaRegistro).toBeInstanceOf(Date);
        expect(result[0].fechaActualizacion).toBeInstanceOf(Date);
        done();
      });
    });

    it('should use legal_name if name is missing', (done) => {
      const api = { suppliers: [{ id: 1, legal_name: 'LegalName', tax_id: '12345678901', email: 'legal@test.com', phone: '300' }] };
      httpMock.get!.mockReturnValue(of(api));

      repo.getAll().subscribe(result => {
        expect(result[0].razonSocial).toBe('LegalName');
        done();
      });
    });

    it('should use "Sin nombre" if both name and legal_name are missing', (done) => {
      const api = { suppliers: [{ id: 1, tax_id: '12345678901', email: 'noname@test.com', phone: '300' }] };
      httpMock.get!.mockReturnValue(of(api));

      repo.getAll().subscribe(result => {
        expect(result[0].razonSocial).toBe('Sin nombre');
        done();
      });
    });

    it('should handle null/undefined optional fields', (done) => {
      const api = {
        suppliers: [{
          id: 1,
          name: 'Minimal',
          tax_id: null,
          email: null,
          phone: null,
          website: null,
          payment_terms: null,
          credit_limit: null,
          currency: null
        }]
      };
      httpMock.get!.mockReturnValue(of(api));

      repo.getAll().subscribe(result => {
        expect(result[0].ruc).toBe('');
        expect(result[0].correoContacto).toBe('');
        expect(result[0].telefono).toBe('');
        expect(result[0].website).toBe('');
        expect(result[0].paymentTerms).toBe('');
        expect(result[0].currency).toBe('');
        expect(result[0].creditLimit).toBeUndefined();
        done();
      });
    });
  });
});
