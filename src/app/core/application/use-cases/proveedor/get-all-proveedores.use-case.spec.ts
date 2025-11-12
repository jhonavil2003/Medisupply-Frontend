import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { GetAllProveedoresUseCase } from './get-all-proveedores.use-case';
import { ProveedorRepository } from '../../../domain/repositories/proveedor.repository';
import { ProveedorEntity, EstadoProveedor } from '../../../domain/entities/proveedor.entity';

describe('GetAllProveedoresUseCase', () => {
  let useCase: GetAllProveedoresUseCase;
  let mockRepository: jest.Mocked<ProveedorRepository>;

  const mockProveedores: ProveedorEntity[] = [
    {
      id: '1',
      razonSocial: 'Proveedor 1',
      ruc: '12345678901',
      telefono: '3001234567',
      correoContacto: 'prov1@test.com',
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
      razonSocial: 'Proveedor 2',
      ruc: '98765432109',
      telefono: '3009876543',
      correoContacto: 'prov2@test.com',
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
      getAll: jest.fn()
    } as any;

    TestBed.configureTestingModule({
      providers: [
        GetAllProveedoresUseCase,
        { provide: ProveedorRepository, useValue: mockRepository }
      ]
    });

    useCase = TestBed.inject(GetAllProveedoresUseCase);
  });

  it('should be created', () => {
    expect(useCase).toBeTruthy();
  });

  it('should get all proveedores successfully', (done) => {
    mockRepository.getAll.mockReturnValue(of(mockProveedores));

    useCase.execute().subscribe({
      next: (proveedores) => {
        expect(proveedores).toEqual(mockProveedores);
        expect(proveedores.length).toBe(2);
        expect(mockRepository.getAll).toHaveBeenCalled();
        done();
      }
    });
  });

  it('should return empty array when no proveedores exist', (done) => {
    mockRepository.getAll.mockReturnValue(of([]));

    useCase.execute().subscribe({
      next: (proveedores) => {
        expect(proveedores).toEqual([]);
        expect(proveedores.length).toBe(0);
        done();
      }
    });
  });

  it('should call repository getAll method', (done) => {
    mockRepository.getAll.mockReturnValue(of(mockProveedores));

    useCase.execute().subscribe({
      next: () => {
        expect(mockRepository.getAll).toHaveBeenCalledTimes(1);
        done();
      }
    });
  });

  it('should handle multiple proveedores', (done) => {
    const manyProveedores = Array(10).fill(null).map((_, index) => ({
      id: `${index + 1}`,
      razonSocial: `Proveedor ${index + 1}`,
      ruc: `1234567890${index}`,
      telefono: '3001234567',
      correoContacto: `prov${index}@test.com`,
      country: 'Colombia',
      website: '',
      addressLine1: '',
      city: '',
      state: '',
      paymentTerms: '',
      currency: '',
      estado: EstadoProveedor.ACTIVO,
      certificacionesVigentes: []
    }));

    mockRepository.getAll.mockReturnValue(of(manyProveedores));

    useCase.execute().subscribe({
      next: (proveedores) => {
        expect(proveedores.length).toBe(10);
        expect(proveedores[0].razonSocial).toBe('Proveedor 1');
        expect(proveedores[9].razonSocial).toBe('Proveedor 10');
        done();
      }
    });
  });
});
