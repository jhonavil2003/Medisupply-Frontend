import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { DeleteProveedorUseCase } from './delete-proveedor.use-case';
import { ProveedorRepository } from '../../../domain/repositories/proveedor.repository';

describe('DeleteProveedorUseCase', () => {
  let useCase: DeleteProveedorUseCase;
  let mockRepository: jest.Mocked<ProveedorRepository>;

  beforeEach(() => {
    mockRepository = {
      delete: jest.fn()
    } as any;

    TestBed.configureTestingModule({
      providers: [
        DeleteProveedorUseCase,
        { provide: ProveedorRepository, useValue: mockRepository }
      ]
    });

    useCase = TestBed.inject(DeleteProveedorUseCase);
  });

  it('should be created', () => {
    expect(useCase).toBeTruthy();
  });

  it('should delete proveedor successfully', (done) => {
    const proveedorId = '123';
    mockRepository.delete.mockReturnValue(of(true));

    useCase.execute(proveedorId).subscribe({
      next: (result) => {
        expect(result).toBe(true);
        expect(mockRepository.delete).toHaveBeenCalledWith(proveedorId);
        done();
      }
    });
  });

  it('should throw error when id is empty', () => {
    expect(() => useCase.execute('')).toThrow('El ID del proveedor es requerido');
  });

  it('should throw error when id is null', () => {
    expect(() => useCase.execute(null as any)).toThrow('El ID del proveedor es requerido');
  });

  it('should throw error when id is undefined', () => {
    expect(() => useCase.execute(undefined as any)).toThrow('El ID del proveedor es requerido');
  });

  it('should call repository delete with correct id', (done) => {
    const testId = '456';
    mockRepository.delete.mockReturnValue(of(true));

    useCase.execute(testId).subscribe({
      next: () => {
        expect(mockRepository.delete).toHaveBeenCalledTimes(1);
        expect(mockRepository.delete).toHaveBeenCalledWith(testId);
        done();
      }
    });
  });
});
