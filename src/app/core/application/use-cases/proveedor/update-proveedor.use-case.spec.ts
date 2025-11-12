import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { UpdateProveedorUseCase } from './update-proveedor.use-case';
import { ProveedorRepository } from '../../../domain/repositories/proveedor.repository';
import { UpdateProveedorDto, EstadoProveedor, ProveedorEntity } from '../../../domain/entities/proveedor.entity';

describe('UpdateProveedorUseCase', () => {
  let useCase: UpdateProveedorUseCase;
  let mockRepository: jest.Mocked<ProveedorRepository>;

  const validDto: UpdateProveedorDto = {
    id: '1',
    razonSocial: 'Updated Proveedor SA',
    correoContacto: 'updated@proveedor.com'
  };

  const mockProveedor: ProveedorEntity = {
    id: '1',
    razonSocial: 'Updated Proveedor SA',
    ruc: '12345678901',
    telefono: '3001234567',
    correoContacto: 'updated@proveedor.com',
    country: 'Colombia',
    estado: EstadoProveedor.ACTIVO,
    certificacionesVigentes: []
  };

  beforeEach(() => {
    mockRepository = {
      update: jest.fn()
    } as any;

    TestBed.configureTestingModule({
      providers: [
        UpdateProveedorUseCase,
        { provide: ProveedorRepository, useValue: mockRepository }
      ]
    });

    useCase = TestBed.inject(UpdateProveedorUseCase);
  });

  it('should be created', () => {
    expect(useCase).toBeTruthy();
  });

  it('should update proveedor with valid data', (done) => {
    mockRepository.update.mockReturnValue(of(mockProveedor));

    useCase.execute(validDto).subscribe({
      next: (result) => {
        expect(result).toEqual(mockProveedor);
        expect(mockRepository.update).toHaveBeenCalledWith(validDto);
        done();
      }
    });
  });

  it('should throw error when id is missing', () => {
    const invalidDto = { razonSocial: 'Test' } as UpdateProveedorDto;
    expect(() => useCase.execute(invalidDto)).toThrow('El ID del proveedor es requerido');
  });

  it('should throw error when id is empty string', () => {
    const invalidDto = { id: '', razonSocial: 'Test' } as UpdateProveedorDto;
    expect(() => useCase.execute(invalidDto)).toThrow('El ID del proveedor es requerido');
  });

  it('should throw error when id is null', () => {
    const invalidDto = { id: null as any, razonSocial: 'Test' };
    expect(() => useCase.execute(invalidDto)).toThrow('El ID del proveedor es requerido');
  });

  it('should throw error when id is undefined', () => {
    const invalidDto = { id: undefined as any, razonSocial: 'Test' };
    expect(() => useCase.execute(invalidDto)).toThrow('El ID del proveedor es requerido');
  });

  it('should update only specified fields', (done) => {
    const partialDto: UpdateProveedorDto = {
      id: '1',
      telefono: '3009876543'
    };

    const updatedProveedor = { ...mockProveedor, telefono: '3009876543' };
    mockRepository.update.mockReturnValue(of(updatedProveedor));

    useCase.execute(partialDto).subscribe({
      next: (result) => {
        expect(result.telefono).toBe('3009876543');
        expect(mockRepository.update).toHaveBeenCalledWith(partialDto);
        done();
      }
    });
  });

  it('should update multiple fields', (done) => {
    const multiDto: UpdateProveedorDto = {
      id: '1',
      razonSocial: 'New Name',
      correoContacto: 'new@email.com',
      telefono: '3001111111',
      country: 'Ecuador'
    };

    const updatedProveedor = { ...mockProveedor, ...multiDto };
    mockRepository.update.mockReturnValue(of(updatedProveedor));

    useCase.execute(multiDto).subscribe({
      next: (result) => {
        expect(result.razonSocial).toBe('New Name');
        expect(result.correoContacto).toBe('new@email.com');
        expect(result.telefono).toBe('3001111111');
        expect(result.country).toBe('Ecuador');
        done();
      }
    });
  });

  it('should update address fields', (done) => {
    const addressDto: UpdateProveedorDto = {
      id: '1',
      addressLine1: 'Nueva Calle 456',
      city: 'Medellín',
      state: 'Antioquia'
    };

    const updatedProveedor = { ...mockProveedor, ...addressDto };
    mockRepository.update.mockReturnValue(of(updatedProveedor));

    useCase.execute(addressDto).subscribe({
      next: (result) => {
        expect(result.addressLine1).toBe('Nueva Calle 456');
        expect(result.city).toBe('Medellín');
        expect(result.state).toBe('Antioquia');
        done();
      }
    });
  });

  it('should update payment terms and currency', (done) => {
    const paymentDto: UpdateProveedorDto = {
      id: '1',
      paymentTerms: '60 días',
      currency: 'USD',
      creditLimit: 100000
    };

    const updatedProveedor = { ...mockProveedor, ...paymentDto };
    mockRepository.update.mockReturnValue(of(updatedProveedor));

    useCase.execute(paymentDto).subscribe({
      next: (result) => {
        expect(result.paymentTerms).toBe('60 días');
        expect(result.currency).toBe('USD');
        expect(result.creditLimit).toBe(100000);
        done();
      }
    });
  });

  it('should update estado', (done) => {
    const estadoDto: UpdateProveedorDto = {
      id: '1',
      estado: EstadoProveedor.INACTIVO
    };

    const updatedProveedor = { ...mockProveedor, estado: EstadoProveedor.INACTIVO };
    mockRepository.update.mockReturnValue(of(updatedProveedor));

    useCase.execute(estadoDto).subscribe({
      next: (result) => {
        expect(result.estado).toBe(EstadoProveedor.INACTIVO);
        done();
      }
    });
  });

  it('should call repository update with correct id', (done) => {
    const dto: UpdateProveedorDto = { id: '123', razonSocial: 'Test' };
    mockRepository.update.mockReturnValue(of(mockProveedor));

    useCase.execute(dto).subscribe({
      next: () => {
        expect(mockRepository.update).toHaveBeenCalledTimes(1);
        expect(mockRepository.update).toHaveBeenCalledWith(dto);
        done();
      }
    });
  });
});
