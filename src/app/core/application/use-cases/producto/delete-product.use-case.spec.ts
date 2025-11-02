import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { DeleteProductUseCase } from './delete-product.use-case';
import { ProductoRepository } from '../../../domain/repositories/producto.repository';

describe('DeleteProductUseCase', () => {
  let useCase: DeleteProductUseCase;
  let mockProductoRepository: any;

  beforeEach(() => {
    const spy = {
      delete: jest.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        DeleteProductUseCase,
        { provide: ProductoRepository, useValue: spy }
      ]
    });

    useCase = TestBed.inject(DeleteProductUseCase);
    mockProductoRepository = TestBed.inject(ProductoRepository) as any;
  });

  it('should be created', () => {
    expect(useCase).toBeTruthy();
  });

  it('should call repository delete method with correct product ID', (done) => {
    // Arrange
    const productId = 123;
    mockProductoRepository.delete.mockReturnValue(of(undefined));

    // Act
    useCase.execute(productId).subscribe({
      next: (result) => {
        // Assert
        expect(result).toBeUndefined();
        expect(mockProductoRepository.delete).toHaveBeenCalledWith(productId);
        expect(mockProductoRepository.delete).toHaveBeenCalledTimes(1);
        done();
      }
    });
  });

  it('should handle different product IDs correctly', (done) => {
    // Arrange
    const productIds = [1, 999, 456789];
    let completedCalls = 0;

    productIds.forEach(productId => {
      mockProductoRepository.delete.mockReturnValue(of(undefined));

      // Act
      useCase.execute(productId).subscribe({
        next: (result) => {
          // Assert
          expect(result).toBeUndefined();
          expect(mockProductoRepository.delete).toHaveBeenCalledWith(productId);
          
          completedCalls++;
          if (completedCalls === productIds.length) {
            expect(mockProductoRepository.delete).toHaveBeenCalledTimes(productIds.length);
            done();
          }
        }
      });
    });
  });

  it('should handle repository errors', (done) => {
    // Arrange
    const productId = 123;
    const errorMessage = 'Failed to delete product';
    mockProductoRepository.delete.mockReturnValue(throwError(() => new Error(errorMessage)));

    // Act
    useCase.execute(productId).subscribe({
      error: (error) => {
        // Assert
        expect(error.message).toBe(errorMessage);
        expect(mockProductoRepository.delete).toHaveBeenCalledWith(productId);
        expect(mockProductoRepository.delete).toHaveBeenCalledTimes(1);
        done();
      }
    });
  });

  it('should handle product not found errors', (done) => {
    // Arrange
    const productId = 999;
    const notFoundError = new Error('Product not found');
    mockProductoRepository.delete.mockReturnValue(throwError(() => notFoundError));

    // Act
    useCase.execute(productId).subscribe({
      error: (error) => {
        // Assert
        expect(error).toBe(notFoundError);
        expect(mockProductoRepository.delete).toHaveBeenCalledWith(productId);
        done();
      }
    });
  });

  it('should handle permission denied errors', (done) => {
    // Arrange
    const productId = 456;
    const permissionError = new Error('Permission denied');
    mockProductoRepository.delete.mockReturnValue(throwError(() => permissionError));

    // Act
    useCase.execute(productId).subscribe({
      error: (error) => {
        // Assert
        expect(error.message).toBe('Permission denied');
        expect(mockProductoRepository.delete).toHaveBeenCalledWith(productId);
        done();
      }
    });
  });

  it('should handle network errors', (done) => {
    // Arrange
    const productId = 789;
    const networkError = new Error('Network connection failed');
    mockProductoRepository.delete.mockReturnValue(throwError(() => networkError));

    // Act
    useCase.execute(productId).subscribe({
      error: (error) => {
        // Assert
        expect(error.message).toBe('Network connection failed');
        expect(mockProductoRepository.delete).toHaveBeenCalledWith(productId);
        done();
      }
    });
  });

  it('should work with edge case product IDs', (done) => {
    // Arrange
    const edgeCaseIds = [0, 1, Number.MAX_SAFE_INTEGER];
    let completedCalls = 0;

    edgeCaseIds.forEach(productId => {
      mockProductoRepository.delete.mockReturnValue(of(undefined));

      // Act
      useCase.execute(productId).subscribe({
        next: (result) => {
          // Assert
          expect(result).toBeUndefined();
          expect(mockProductoRepository.delete).toHaveBeenCalledWith(productId);
          
          completedCalls++;
          if (completedCalls === edgeCaseIds.length) {
            done();
          }
        }
      });
    });
  });

  it('should maintain repository method contract', (done) => {
    // Arrange
    const productId = 42;
    mockProductoRepository.delete.mockReturnValue(of(void 0)); // Explicit void return

    // Act
    useCase.execute(productId).subscribe({
      next: (result) => {
        // Assert
        expect(result).toBeUndefined();
        expect(typeof result).toBe('undefined');
        expect(mockProductoRepository.delete).toHaveBeenCalledWith(productId);
        done();
      }
    });
  });

  it('should handle concurrent delete operations', (done) => {
    // Arrange
    const productIds = [100, 200, 300];
    const promises: Promise<void>[] = [];

    productIds.forEach(productId => {
      mockProductoRepository.delete.mockReturnValue(of(undefined));
      
      const promise = new Promise<void>((resolve) => {
        useCase.execute(productId).subscribe({
          next: (result) => {
            expect(result).toBeUndefined();
            expect(mockProductoRepository.delete).toHaveBeenCalledWith(productId);
            resolve();
          }
        });
      });
      
      promises.push(promise);
    });

    // Act & Assert
    Promise.all(promises).then(() => {
      expect(mockProductoRepository.delete).toHaveBeenCalledTimes(productIds.length);
      done();
    });
  });
});