import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { CreateProveedorUseCase } from './create-proveedor.use-case';
import { ProveedorRepository } from '../../../domain/repositories/proveedor.repository';
import { CreateProveedorDto, EstadoProveedor, ProveedorEntity } from '../../../domain/entities/proveedor.entity';

describe('CreateProveedorUseCase', () => {
  let useCase: CreateProveedorUseCase;
  let mockRepository: jest.Mocked<ProveedorRepository>;

  const validDto: CreateProveedorDto = {
    razonSocial: 'Test Proveedor SA',
    ruc: '12345678901',
    telefono: '3001234567',
    correoContacto: 'test@proveedor.com',
    country: 'Colombia',
    estado: EstadoProveedor.ACTIVO,
    certificacionesVigentes: []
  };

  const mockProveedor: ProveedorEntity = {
    id: '1',
    ...validDto
  };

  beforeEach(() => {
    mockRepository = {
      create: jest.fn()
    } as any;

    TestBed.configureTestingModule({
      providers: [
        CreateProveedorUseCase,
        { provide: ProveedorRepository, useValue: mockRepository }
      ]
    });

    useCase = TestBed.inject(CreateProveedorUseCase);
  });

  it('should be created', () => {
    expect(useCase).toBeTruthy();
  });

  it('should create proveedor with valid data', (done) => {
    mockRepository.create.mockReturnValue(of(mockProveedor));

    useCase.execute(validDto).subscribe({
      next: (result) => {
        expect(result).toEqual(mockProveedor);
        expect(mockRepository.create).toHaveBeenCalledWith(validDto);
        done();
      }
    });
  });

  describe('razonSocial validation', () => {
    it('should throw error when razonSocial is empty', () => {
      const invalidDto = { ...validDto, razonSocial: '' };
      expect(() => useCase.execute(invalidDto)).toThrow('La razón social debe tener al menos 3 caracteres');
    });

    it('should throw error when razonSocial is less than 3 characters', () => {
      const invalidDto = { ...validDto, razonSocial: 'AB' };
      expect(() => useCase.execute(invalidDto)).toThrow('La razón social debe tener al menos 3 caracteres');
    });

    it('should throw error when razonSocial is only whitespace', () => {
      const invalidDto = { ...validDto, razonSocial: '   ' };
      expect(() => useCase.execute(invalidDto)).toThrow('La razón social debe tener al menos 3 caracteres');
    });

    it('should accept razonSocial with exactly 3 characters', (done) => {
      const dto = { ...validDto, razonSocial: 'ABC' };
      mockRepository.create.mockReturnValue(of(mockProveedor));

      useCase.execute(dto).subscribe({
        next: () => {
          expect(mockRepository.create).toHaveBeenCalled();
          done();
        }
      });
    });
  });

  describe('RUC validation', () => {
    it('should throw error when RUC is empty', () => {
      const invalidDto = { ...validDto, ruc: '' };
      expect(() => useCase.execute(invalidDto)).toThrow('El RUC no es válido');
    });

    it('should throw error when RUC has less than 10 digits', () => {
      const invalidDto = { ...validDto, ruc: '123456789' };
      expect(() => useCase.execute(invalidDto)).toThrow('El RUC no es válido');
    });

    it('should throw error when RUC has more than 20 digits', () => {
      const invalidDto = { ...validDto, ruc: '123456789012345678901' };
      expect(() => useCase.execute(invalidDto)).toThrow('El RUC no es válido');
    });

    it('should throw error when RUC contains non-digits', () => {
      const invalidDto = { ...validDto, ruc: '1234567890A' };
      expect(() => useCase.execute(invalidDto)).toThrow('El RUC no es válido');
    });

    it('should accept RUC with 10 digits', (done) => {
      const dto = { ...validDto, ruc: '1234567890' };
      mockRepository.create.mockReturnValue(of(mockProveedor));

      useCase.execute(dto).subscribe({
        next: () => {
          expect(mockRepository.create).toHaveBeenCalled();
          done();
        }
      });
    });

    it('should accept RUC with 20 digits', (done) => {
      const dto = { ...validDto, ruc: '12345678901234567890' };
      mockRepository.create.mockReturnValue(of(mockProveedor));

      useCase.execute(dto).subscribe({
        next: () => {
          expect(mockRepository.create).toHaveBeenCalled();
          done();
        }
      });
    });
  });

  describe('email validation', () => {
    it('should throw error when email is empty', () => {
      const invalidDto = { ...validDto, correoContacto: '' };
      expect(() => useCase.execute(invalidDto)).toThrow('El correo electrónico no es válido');
    });

    it('should throw error when email is missing @', () => {
      const invalidDto = { ...validDto, correoContacto: 'testproveedor.com' };
      expect(() => useCase.execute(invalidDto)).toThrow('El correo electrónico no es válido');
    });

    it('should throw error when email is missing domain', () => {
      const invalidDto = { ...validDto, correoContacto: 'test@' };
      expect(() => useCase.execute(invalidDto)).toThrow('El correo electrónico no es válido');
    });

    it('should throw error when email has no dot in domain', () => {
      const invalidDto = { ...validDto, correoContacto: 'test@proveedor' };
      expect(() => useCase.execute(invalidDto)).toThrow('El correo electrónico no es válido');
    });

    it('should accept valid email', (done) => {
      const dto = { ...validDto, correoContacto: 'valid@email.com' };
      mockRepository.create.mockReturnValue(of(mockProveedor));

      useCase.execute(dto).subscribe({
        next: () => {
          expect(mockRepository.create).toHaveBeenCalled();
          done();
        }
      });
    });
  });

  describe('country validation', () => {
    it('should throw error when country is empty', () => {
      const invalidDto = { ...validDto, country: '' };
      expect(() => useCase.execute(invalidDto)).toThrow('El país es requerido');
    });

    it('should throw error when country is only whitespace', () => {
      const invalidDto = { ...validDto, country: '   ' };
      expect(() => useCase.execute(invalidDto)).toThrow('El país es requerido');
    });

    it('should accept valid country', (done) => {
      const dto = { ...validDto, country: 'Ecuador' };
      mockRepository.create.mockReturnValue(of(mockProveedor));

      useCase.execute(dto).subscribe({
        next: () => {
          expect(mockRepository.create).toHaveBeenCalled();
          done();
        }
      });
    });
  });

  it('should create proveedor with optional fields', (done) => {
    const dtoWithOptionals: CreateProveedorDto = {
      ...validDto,
      website: 'https://test.com',
      addressLine1: 'Calle 123',
      city: 'Bogotá',
      state: 'Cundinamarca',
      paymentTerms: '30 días',
      creditLimit: 50000,
      currency: 'COP'
    };

    mockRepository.create.mockReturnValue(of({ ...mockProveedor, ...dtoWithOptionals }));

    useCase.execute(dtoWithOptionals).subscribe({
      next: (result) => {
        expect(result.website).toBe('https://test.com');
        expect(result.city).toBe('Bogotá');
        done();
      }
    });
  });
});
