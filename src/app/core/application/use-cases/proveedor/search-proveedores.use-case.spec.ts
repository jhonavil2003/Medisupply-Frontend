import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { SearchProveedoresUseCase } from './search-proveedores.use-case';
import { ProveedorRepository } from '../../../domain/repositories/proveedor.repository';
import { ProveedorEntity, EstadoProveedor } from '../../../domain/entities/proveedor.entity';

describe('SearchProveedoresUseCase', () => {
  let useCase: SearchProveedoresUseCase;
  let mockRepository: jest.Mocked<ProveedorRepository>;

  const mockProveedores: ProveedorEntity[] = [
    {
      id: '1',
      razonSocial: 'ACME Corporation',
      ruc: '12345678901',
      telefono: '3001234567',
      correoContacto: 'acme@test.com',
      country: 'Colombia',
      website: '',
      addressLine1: '',
      city: '',
      state: '',
      paymentTerms: '',
      currency: '',
      estado: EstadoProveedor.ACTIVO,
      certificacionesVigentes: []
    },
    {
      id: '2',
      razonSocial: 'Tech Solutions',
      ruc: '98765432109',
      telefono: '3009876543',
      correoContacto: 'tech@test.com',
      country: 'Colombia',
      website: '',
      addressLine1: '',
      city: '',
      state: '',
      paymentTerms: '',
      currency: '',
      estado: EstadoProveedor.ACTIVO,
      certificacionesVigentes: []
    }
  ];

  beforeEach(() => {
    mockRepository = {
      search: jest.fn(),
      getAll: jest.fn()
    } as any;

    TestBed.configureTestingModule({
      providers: [
        SearchProveedoresUseCase,
        { provide: ProveedorRepository, useValue: mockRepository }
      ]
    });

    useCase = TestBed.inject(SearchProveedoresUseCase);
  });

  it('should be created', () => {
    expect(useCase).toBeTruthy();
  });

  it('should search proveedores with valid criteria', (done) => {
    const criteria = 'ACME';
    mockRepository.search.mockReturnValue(of([mockProveedores[0]]));

    useCase.execute(criteria).subscribe({
      next: (proveedores) => {
        expect(proveedores.length).toBe(1);
        expect(proveedores[0].razonSocial).toBe('ACME Corporation');
        expect(mockRepository.search).toHaveBeenCalledWith(criteria);
        done();
      }
    });
  });

  it('should call getAll when criteria is empty string', (done) => {
    mockRepository.getAll.mockReturnValue(of(mockProveedores));

    useCase.execute('').subscribe({
      next: (proveedores) => {
        expect(proveedores.length).toBe(2);
        expect(mockRepository.getAll).toHaveBeenCalled();
        expect(mockRepository.search).not.toHaveBeenCalled();
        done();
      }
    });
  });

  it('should call getAll when criteria is null', (done) => {
    mockRepository.getAll.mockReturnValue(of(mockProveedores));

    useCase.execute(null as any).subscribe({
      next: (proveedores) => {
        expect(proveedores.length).toBe(2);
        expect(mockRepository.getAll).toHaveBeenCalled();
        expect(mockRepository.search).not.toHaveBeenCalled();
        done();
      }
    });
  });

  it('should call getAll when criteria is only whitespace', (done) => {
    mockRepository.getAll.mockReturnValue(of(mockProveedores));

    useCase.execute('   ').subscribe({
      next: (proveedores) => {
        expect(proveedores.length).toBe(2);
        expect(mockRepository.getAll).toHaveBeenCalled();
        expect(mockRepository.search).not.toHaveBeenCalled();
        done();
      }
    });
  });

  it('should trim criteria before searching', (done) => {
    const criteria = '  ACME  ';
    mockRepository.search.mockReturnValue(of([mockProveedores[0]]));

    useCase.execute(criteria).subscribe({
      next: () => {
        expect(mockRepository.search).toHaveBeenCalledWith('ACME');
        done();
      }
    });
  });

  it('should return empty array when no results found', (done) => {
    mockRepository.search.mockReturnValue(of([]));

    useCase.execute('NonExistent').subscribe({
      next: (proveedores) => {
        expect(proveedores).toEqual([]);
        expect(proveedores.length).toBe(0);
        done();
      }
    });
  });

  it('should handle multiple search results', (done) => {
    mockRepository.search.mockReturnValue(of(mockProveedores));

    useCase.execute('test').subscribe({
      next: (proveedores) => {
        expect(proveedores.length).toBe(2);
        expect(mockRepository.search).toHaveBeenCalledWith('test');
        done();
      }
    });
  });

  it('should search with RUC criteria', (done) => {
    mockRepository.search.mockReturnValue(of([mockProveedores[0]]));

    useCase.execute('12345678901').subscribe({
      next: (proveedores) => {
        expect(proveedores.length).toBe(1);
        expect(proveedores[0].ruc).toBe('12345678901');
        done();
      }
    });
  });
});
