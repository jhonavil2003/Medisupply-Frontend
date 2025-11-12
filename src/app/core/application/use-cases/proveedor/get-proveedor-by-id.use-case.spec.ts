import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { GetProveedorByIdUseCase } from './get-proveedor-by-id.use-case';
import { ProveedorRepository } from '../../../domain/repositories/proveedor.repository';
import { ProveedorEntity, EstadoProveedor } from '../../../domain/entities/proveedor.entity';

describe('GetProveedorByIdUseCase', () => {
  let useCase: GetProveedorByIdUseCase;
  let mockRepository: jest.Mocked<ProveedorRepository>;

  const mockProveedor: ProveedorEntity = {
    id: '1',
    razonSocial: 'Test Proveedor SA',
    ruc: '12345678901',
    telefono: '3001234567',
    correoContacto: 'test@proveedor.com',
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

  beforeEach(() => {
    mockRepository = {
      getById: jest.fn()
    } as any;

    TestBed.configureTestingModule({
      providers: [
        GetProveedorByIdUseCase,
        { provide: ProveedorRepository, useValue: mockRepository }
      ]
    });

    useCase = TestBed.inject(GetProveedorByIdUseCase);
  });

  it('should be created', () => {
    expect(useCase).toBeTruthy();
  });

  it('should get proveedor by id successfully', (done) => {
    mockRepository.getById.mockReturnValue(of(mockProveedor));

    useCase.execute('1').subscribe({
      next: (result) => {
        expect(result).toEqual(mockProveedor);
        expect(result!.id).toBe('1');
        expect(result!.razonSocial).toBe('Test Proveedor SA');
        expect(mockRepository.getById).toHaveBeenCalledWith('1');
        done();
      }
    });
  });

  it('should return null when proveedor not found', (done) => {
    mockRepository.getById.mockReturnValue(of(null));

    useCase.execute('999').subscribe({
      next: (result) => {
        expect(result).toBeNull();
        expect(mockRepository.getById).toHaveBeenCalledWith('999');
        done();
      }
    });
  });

  it('should call repository with correct id', (done) => {
    const testId = '123';
    mockRepository.getById.mockReturnValue(of(mockProveedor));

    useCase.execute(testId).subscribe({
      next: () => {
        expect(mockRepository.getById).toHaveBeenCalledTimes(1);
        expect(mockRepository.getById).toHaveBeenCalledWith(testId);
        done();
      }
    });
  });

  it('should handle repository errors', (done) => {
    const error = new Error('Database error');
    mockRepository.getById.mockReturnValue(throwError(() => error));

    useCase.execute('1').subscribe({
      next: () => fail('Should have thrown error'),
      error: (err) => {
        expect(err.message).toBe('Database error');
        done();
      }
    });
  });

  it('should get proveedor with all fields', (done) => {
    mockRepository.getById.mockReturnValue(of(mockProveedor));

    useCase.execute('1').subscribe({
      next: (result) => {
        expect(result!.razonSocial).toBe('Test Proveedor SA');
        expect(result!.ruc).toBe('12345678901');
        expect(result!.telefono).toBe('3001234567');
        expect(result!.correoContacto).toBe('test@proveedor.com');
        expect(result!.country).toBe('Colombia');
        expect(result!.website).toBe('https://test.com');
        expect(result!.addressLine1).toBe('Calle 123');
        expect(result!.city).toBe('Bogotá');
        expect(result!.state).toBe('Cundinamarca');
        expect(result!.paymentTerms).toBe('30 días');
        expect(result!.currency).toBe('COP');
        expect(result!.estado).toBe(EstadoProveedor.ACTIVO);
        expect(result!.certificacionesVigentes).toEqual(['ISO 9001']);
        done();
      }
    });
  });

  it('should handle numeric id as string', (done) => {
    mockRepository.getById.mockReturnValue(of(mockProveedor));

    useCase.execute('42').subscribe({
      next: () => {
        expect(mockRepository.getById).toHaveBeenCalledWith('42');
        done();
      }
    });
  });
});
